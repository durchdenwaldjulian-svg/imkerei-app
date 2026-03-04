// ============================================
// BIENENPLAN – PLAN / FEATURE-GATING
// Einbinden nach config.js in allen App-Seiten:
// <script src="plan.js"></script>
// ============================================
//
// Nutzung:
//   await planManager.load()        → Plan vom Server laden
//   planManager.plan                → 'starter' | 'pro' | 'meister' | 'verein'
//   planManager.can('zucht')        → true/false
//   planManager.limit('voelker')    → 3 | Infinity
//   planManager.checkLimit('voelker', aktuelleAnzahl) → true = OK, false = Limit erreicht
//   planManager.showUpgradeHint('zucht')  → Zeigt Upgrade-Banner
//   planManager.requirePlan('pro', function() { ... }) → Führt aus wenn Plan ok, sonst Upgrade-Hint
// ============================================

var planManager = (function() {

    // ============================================
    // PLAN LIMITS & FEATURES (aus STRIPE_CONFIG.md)
    // ============================================
    var PLAN_LIMITS = {
        starter: {
            voelker: 3,
            standorte: 1,
            wetter_tage: 3,
            kosten_eintraege: 10,
            features: ['aufgaben', 'packliste', 'behandlung_manuell', 'trachtkarte_teaser', 'forum_lesen']
        },
        pro: {
            voelker: Infinity,
            standorte: 5,
            wetter_tage: 14,
            kosten_eintraege: Infinity,
            features: [
                'aufgaben', 'packliste', 'behandlung_manuell', 'behandlung_auto',
                'trachtkarte_voll', 'trachtkarte_teilen',
                'zucht', 'ernte', 'kosten_unbegrenzt',
                'bewertung', 'forum_schreiben', 'bestandsbuch_einfach',
                'datenexport', 'backup'
            ]
        },
        meister: {
            voelker: Infinity,
            standorte: Infinity,
            wetter_tage: 14,
            kosten_eintraege: Infinity,
            features: [
                'aufgaben', 'packliste', 'behandlung_manuell', 'behandlung_auto',
                'trachtkarte_voll', 'trachtkarte_teilen',
                'zucht', 'ernte', 'kosten_unbegrenzt',
                'bewertung', 'forum_schreiben', 'bestandsbuch_einfach',
                'bestandsbuch_veterinaer', 'multi_user', 'prio_support',
                'datenexport', 'backup'
            ]
        },
        verein: {
            voelker: Infinity,
            standorte: Infinity,
            wetter_tage: 14,
            kosten_eintraege: Infinity,
            features: [
                'aufgaben', 'packliste', 'behandlung_manuell', 'behandlung_auto',
                'trachtkarte_voll', 'trachtkarte_teilen', 'trachtkarte_verein',
                'zucht', 'ernte', 'kosten_unbegrenzt',
                'bewertung', 'forum_schreiben', 'bestandsbuch_einfach',
                'bestandsbuch_veterinaer', 'multi_user', 'prio_support',
                'mitglieder_codes', 'rollen_management',
                'datenexport', 'backup'
            ]
        }
    };

    // Menschenlesbare Feature-Namen (für Upgrade-Hinweise)
    var FEATURE_NAMES = {
        zucht: 'Königinnenzucht-Planer',
        ernte: 'Ernte-Dokumentation',
        bewertung: 'Völker-Bewertung',
        behandlung_auto: 'Auto-Termine Behandlung',
        trachtkarte_voll: 'Trachtkarte (voll)',
        trachtkarte_teilen: 'Trachten teilen',
        forum_schreiben: 'Forum (schreiben)',
        kosten_unbegrenzt: 'Unbegrenztes Kosten-Tracking',
        bestandsbuch_einfach: 'Bestandsbuch',
        bestandsbuch_veterinaer: 'Veterinäramt-Bestandsbuch',
        multi_user: 'Multi-User / Team-Zugang',
        prio_support: 'Prioritäts-Support',
        datenexport: 'Datenexport',
        backup: 'Backup'
    };

    // Feature → welcher Plan mindestens nötig
    var FEATURE_MIN_PLAN = {
        zucht: 'pro',
        ernte: 'pro',
        bewertung: 'pro',
        behandlung_auto: 'pro',
        trachtkarte_voll: 'pro',
        trachtkarte_teilen: 'pro',
        forum_schreiben: 'pro',
        kosten_unbegrenzt: 'pro',
        bestandsbuch_einfach: 'pro',
        datenexport: 'pro',
        backup: 'pro',
        bestandsbuch_veterinaer: 'meister',
        multi_user: 'meister',
        prio_support: 'meister',
        trachtkarte_verein: 'verein',
        mitglieder_codes: 'verein',
        rollen_management: 'verein'
    };

    // ============================================
    // STATE
    // ============================================
    var _plan = 'starter';
    var _planData = null;  // Komplettes Profil-Objekt
    var _loaded = false;

    // ============================================
    // LOAD – Plan vom Server laden
    // ============================================
    async function load() {
        if (!currentUser) {
            _plan = 'starter';
            _loaded = true;
            return _plan;
        }

        try {
            var result = await sb.from('profiles')
                .select('plan, plan_valid_until, trial_ends_at, plan_interval, stripe_customer_id')
                .eq('id', currentUser.id)
                .single();

            if (result.error || !result.data) {
                console.warn('[Plan] Profil nicht geladen:', result.error);
                _plan = 'starter';
                _loaded = true;
                return _plan;
            }

            _planData = result.data;
            var serverPlan = result.data.plan || 'starter';

            // Prüfe ob Plan noch gültig ist
            if (serverPlan !== 'starter') {
                var now = new Date();

                // Trial läuft noch?
                if (result.data.trial_ends_at) {
                    var trialEnd = new Date(result.data.trial_ends_at);
                    if (trialEnd > now) {
                        _plan = serverPlan;
                        _loaded = true;
                        console.log('[Plan] Trial aktiv:', _plan, '(bis ' + trialEnd.toLocaleDateString('de-DE') + ')');
                        return _plan;
                    }
                }

                // Abo gültig?
                if (result.data.plan_valid_until) {
                    var validUntil = new Date(result.data.plan_valid_until);
                    if (validUntil > now) {
                        _plan = serverPlan;
                        _loaded = true;
                        console.log('[Plan] Abo aktiv:', _plan, '(bis ' + validUntil.toLocaleDateString('de-DE') + ')');
                        return _plan;
                    } else {
                        // Abo abgelaufen
                        console.log('[Plan] Abo abgelaufen! Zurück auf Starter.');
                        _plan = 'starter';
                        _loaded = true;
                        return _plan;
                    }
                }

                // Kein Enddatum gesetzt → Plan vertrauen (z.B. manuell gesetzt)
                _plan = serverPlan;
            } else {
                _plan = 'starter';
            }

        } catch(e) {
            console.error('[Plan] Fehler:', e);
            _plan = 'starter';
        }

        _loaded = true;
        console.log('[Plan] Geladen:', _plan);
        
        // Nav aktualisieren wenn verfügbar
        if (typeof navUpdatePlan === 'function') navUpdatePlan();
        
        return _plan;
    }

    // ============================================
    // CAN – Feature erlaubt?
    // ============================================
    function can(feature) {
        var limits = PLAN_LIMITS[_plan] || PLAN_LIMITS.starter;
        return limits.features.indexOf(feature) !== -1;
    }

    // ============================================
    // LIMIT – Numerisches Limit abfragen
    // ============================================
    function limit(key) {
        var limits = PLAN_LIMITS[_plan] || PLAN_LIMITS.starter;
        return limits[key] !== undefined ? limits[key] : 0;
    }

    // ============================================
    // CHECK LIMIT – Prüft ob Limit erreicht
    // true = noch Platz, false = Limit erreicht
    // ============================================
    function checkLimit(key, currentCount) {
        var max = limit(key);
        if (max === Infinity) return true;
        return currentCount < max;
    }

    // ============================================
    // REQUIRE PLAN – Führe Aktion aus wenn Plan ok
    // ============================================
    function requirePlan(minPlan, callback) {
        var planOrder = ['starter', 'pro', 'meister', 'verein'];
        var currentIdx = planOrder.indexOf(_plan);
        var requiredIdx = planOrder.indexOf(minPlan);

        if (currentIdx >= requiredIdx) {
            callback();
        } else {
            showUpgradeHint(null, minPlan);
        }
    }

    // ============================================
    // SHOW UPGRADE HINT – Upgrade-Banner anzeigen
    // ============================================
    function showUpgradeHint(feature, minPlan) {
        minPlan = minPlan || FEATURE_MIN_PLAN[feature] || 'pro';
        var featureName = FEATURE_NAMES[feature] || feature || '';
        var planName = minPlan === 'pro' ? 'Imker Pro' : minPlan === 'meister' ? 'Imkermeister' : minPlan;

        var msg = featureName
            ? '🔒 „' + featureName + '" ist ab dem ' + planName + '-Plan verfügbar.'
            : '🔒 Diese Funktion ist ab dem ' + planName + '-Plan verfügbar.';

        // Ladebildschirm ausblenden (falls vorhanden)
        var ls = document.getElementById('loadingScreen') || document.getElementById('loadingOverlay');
        if (ls) ls.style.display = 'none';

        // Prüfe ob es schon ein Upgrade-Modal gibt
        var existing = document.getElementById('planUpgradeOverlay');
        if (existing) existing.remove();

        var overlay = document.createElement('div');
        overlay.id = 'planUpgradeOverlay';
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(28,20,16,.6);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px)';
        overlay.innerHTML = '<div style="background:#FFFBF0;border-radius:16px;padding:32px;max-width:420px;width:100%;text-align:center;box-shadow:0 16px 48px rgba(28,20,16,.15);border:1px solid rgba(245,166,35,.12)">'
            + '<div style="font-size:2.5rem;margin-bottom:12px">🍯</div>'
            + '<h3 style="font-family:\'Fraunces\',\'DM Serif Display\',serif;font-size:1.3rem;font-weight:900;color:#1C1410;margin-bottom:8px">Upgrade auf ' + planName + '</h3>'
            + '<p style="font-size:.9rem;color:#8B7355;line-height:1.6;margin-bottom:24px">' + msg + '<br>14 Tage kostenlos testen!</p>'
            + '<a href="upgrade.html" style="display:inline-block;background:#F5A623;color:#1C1410;padding:12px 28px;border-radius:100px;font-weight:700;font-size:.95rem;text-decoration:none;transition:all .2s;box-shadow:0 4px 16px rgba(245,166,35,.3)">Jetzt upgraden →</a>'
            + '<br><button onclick="window.location.href=\'app.html\'" style="margin-top:14px;background:none;border:none;color:#8B7355;font-size:.85rem;cursor:pointer;font-family:inherit;padding:8px">← Zurück zur App</button>'
            + '</div>';

        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) window.location.href = 'app.html';
        });

        document.body.appendChild(overlay);
    }

    // ============================================
    // SHOW LIMIT REACHED – Limit-Warnung
    // ============================================
    function showLimitReached(limitType) {
        var messages = {
            voelker: {
                title: 'Völker-Limit erreicht',
                text: 'Mit dem Starter-Plan kannst du maximal 3 Völker verwalten. Upgrade auf Pro für unbegrenzte Völker!'
            },
            standorte: {
                title: 'Standort-Limit erreicht',
                text: _plan === 'pro'
                    ? 'Mit Imker Pro kannst du maximal 5 Standorte verwalten. Upgrade auf Imkermeister für unbegrenzte Standorte!'
                    : 'Mit dem Starter-Plan kannst du maximal 1 Standort verwalten. Upgrade auf Pro für bis zu 5 Standorte!'
            },
            kosten_eintraege: {
                title: 'Kosten-Limit erreicht',
                text: 'Mit dem Starter-Plan kannst du maximal 10 Kosten-Einträge speichern. Upgrade auf Pro für unbegrenztes Tracking!'
            }
        };

        var info = messages[limitType] || { title: 'Limit erreicht', text: 'Upgrade für mehr Möglichkeiten!' };
        var minPlan = limitType === 'standorte' && _plan === 'pro' ? 'meister' : 'pro';

        var existing = document.getElementById('planUpgradeOverlay');
        if (existing) existing.remove();

        var overlay = document.createElement('div');
        overlay.id = 'planUpgradeOverlay';
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(28,20,16,.6);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px)';
        overlay.innerHTML = '<div style="background:#FFFBF0;border-radius:16px;padding:32px;max-width:420px;width:100%;text-align:center;box-shadow:0 16px 48px rgba(28,20,16,.15);border:1px solid rgba(245,166,35,.12)">'
            + '<div style="font-size:2.5rem;margin-bottom:12px">🔒</div>'
            + '<h3 style="font-family:\'Fraunces\',\'DM Serif Display\',serif;font-size:1.3rem;font-weight:900;color:#1C1410;margin-bottom:8px">' + info.title + '</h3>'
            + '<p style="font-size:.9rem;color:#8B7355;line-height:1.6;margin-bottom:24px">' + info.text + '</p>'
            + '<a href="upgrade.html" style="display:inline-block;background:#F5A623;color:#1C1410;padding:12px 28px;border-radius:100px;font-weight:700;font-size:.95rem;text-decoration:none;box-shadow:0 4px 16px rgba(245,166,35,.3)">Jetzt upgraden →</a>'
            + '<br><button onclick="this.closest(\'#planUpgradeOverlay\').remove()" style="margin-top:14px;background:none;border:none;color:#8B7355;font-size:.85rem;cursor:pointer;font-family:inherit;padding:8px">Nicht jetzt</button>'
            + '</div>';

        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) overlay.remove();
        });

        document.body.appendChild(overlay);
    }

    // ============================================
    // PLAN INFO (für UI-Anzeige)
    // ============================================
    function getPlanInfo() {
        var names = {
            starter: { name: 'Starter', emoji: '🐝', color: '#8B7355' },
            pro:     { name: 'Imker Pro', emoji: '🍯', color: '#F5A623' },
            meister: { name: 'Imkermeister', emoji: '👑', color: '#D4891C' },
            verein:  { name: 'Verein', emoji: '🏘️', color: '#3D7C47' }
        };
        var info = names[_plan] || names.starter;
        info.plan = _plan;
        info.data = _planData;
        info.isTrial = _planData && _planData.trial_ends_at && new Date(_planData.trial_ends_at) > new Date();
        info.validUntil = _planData && _planData.plan_valid_until ? new Date(_planData.plan_valid_until) : null;
        return info;
    }

    // ============================================
    // PUBLIC API
    // ============================================
    return {
        load: load,
        get plan() { return _plan; },
        get loaded() { return _loaded; },
        get data() { return _planData; },
        can: can,
        limit: limit,
        checkLimit: checkLimit,
        requirePlan: requirePlan,
        showUpgradeHint: showUpgradeHint,
        showLimitReached: showLimitReached,
        getPlanInfo: getPlanInfo,
        PLAN_LIMITS: PLAN_LIMITS
    };

})();

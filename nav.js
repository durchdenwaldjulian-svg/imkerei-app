// ============================================
// IMKEREI TAGESPLANER – ZENTRALE NAVIGATION
// nav.js – wird in allen Seiten mit Sidebar eingebunden
// Änderungen hier wirken sich auf ALLE Seiten aus
// ============================================

(function(){
    // === Fallback: themeManager definieren falls theme.js nicht geladen wurde ===
    if (typeof window.themeManager === 'undefined') {
        window.themeManager = {
            current: function(){ return localStorage.getItem('bp_theme') || 'standard'; },
            isPro: function(){ return this.current() === 'pro'; },
            toggle: function(){
                var next = this.isPro() ? 'standard' : 'pro';
                localStorage.setItem('bp_theme', next);
                if (next === 'pro') { document.documentElement.classList.add('theme-pro'); }
                else { document.documentElement.classList.remove('theme-pro'); }
                location.reload();
            },
            icon: function(emoji){ return emoji; },
            getIconByName: function(){ return ''; },
            ICONS: {}
        };
    }

    var currentFile = window.location.pathname.split('/').pop() || 'app.html';
    if (currentFile === '') currentFile = 'app.html';

    // === Theme-Helper: Icon je nach Modus ===
    var isPro = themeManager.isPro();
    function ti(emoji) {
        if (!isPro || typeof themeManager === 'undefined') return emoji;
        return themeManager.icon(emoji);
    }

    var sections = [
        { title: 'Übersicht', items: [
            { href: 'app.html#heute', icon: '📅', label: 'Heute' },
            { href: 'voelker.html', icon: '📍', label: 'Völker & Standorte' },
            { href: 'app.html#aufgaben', icon: '📝', label: 'Aufgaben' }
        ]},
        { title: 'Völker', items: [
            { href: 'zuchtplan.html', icon: '👑', label: 'Königinnenzucht' },
            { href: 'zuchtberater.html', icon: '🧬', label: 'Zuchtberater' },
            { href: 'inzuchtrechner.html', icon: '🔬', label: 'Inzuchtrechner' },
            { href: 'behandlung.html', icon: '💉', label: 'Behandlungen' },
            { href: 'assistent.html', icon: '🤖', label: 'Assistent' },
            { href: 'bestandsbuch.html', icon: '📋', label: 'Bestandsbuch' }
        ]},
        { title: 'Ernte & Planung', items: [
            { href: 'ernte.html', icon: '🍯', label: 'Honigernte' },
            { href: 'tracht.html', icon: '🌸', label: 'Tracht' },
            { href: 'trachtmonitor.html', icon: '🗺️', label: 'Tracht-Radar' },
            { href: 'packliste.html', icon: '📦', label: 'Packliste' }
        ]},
        { title: 'Community', items: [
            { href: 'forum.html', icon: '💬', label: 'Forum' },
            { href: 'verein_trachten.html', icon: '🏘️', label: 'Mein Verein' },
            { href: 'hornisse.html', icon: '🐝', label: 'Hornissen-Melder' }
        ]},
        { title: 'Verwaltung', items: [
            { href: 'app.html#kosten', icon: '💰', label: 'Kosten' }
        ]}
    ];

    function isActive(href) {
        if (href.indexOf('#') > -1) {
            var file = href.split('#')[0] || 'app.html';
            var hash = href.split('#')[1];
            if (currentFile === 'app.html' && file === 'app.html') {
                var pageHash = window.location.hash.replace('#','');
                if (!pageHash && hash === 'heute') return true;
                return pageHash === hash;
            }
            return false;
        }
        return currentFile === href;
    }

    // === Theme Toggle HTML ===
    function buildThemeToggle() {
        var label = isPro ? 'Standard-Ansicht' : 'Profi-Ansicht';
        return '<button class="theme-toggle" onclick="themeManager.toggle()" title="Design wechseln">' +
            '<span class="toggle-track"><span class="toggle-knob"></span></span>' +
            '<span>' + label + '</span>' +
            '</button>';
    }

    // === DESKTOP SIDEBAR ===
    function buildDesktopNav() {
        var h = '';
        h += '<div class="nav-brand">';
        if (isPro) {
            h += '<div style="font-size:1.1rem;font-weight:700;color:#fff;letter-spacing:-.02em;padding:.25rem 0">BienenPlan</div>';
            h += '<div style="font-size:.65rem;color:#8888a8;font-weight:500;letter-spacing:.05em">CLOUD v6.0 PRO</div>';
        } else {
            h += '<img src="Logo.svg" alt="BienenPlan" style="width:100%;max-width:100%;height:auto;margin-bottom:.25rem">';
            h += '<div style="font-size:.7rem;color:#7A6652">Cloud v6.0</div>';
        }
        h += '</div>';

        sections.forEach(function(s) {
            h += '<div class="nav-section">' + s.title + '</div>';
            s.items.forEach(function(item) {
                var cls = isActive(item.href) ? ' active' : '';
                h += '<a href="' + item.href + '" class="nav-item' + cls + '">' + ti(item.icon) + ' ' + item.label + '</a>';
            });
        });

        h += '<div style="flex:1"></div>';

        // Theme Toggle
        h += buildThemeToggle();

        // Plan-Badge + Upgrade/Abo-Button
        if (isPro) {
            h += '<div class="nav-plan-box" id="navPlanBox" style="margin:.5rem .75rem;padding:.6rem .75rem;background:rgba(196,160,82,.08);border-radius:6px;text-align:center;display:none">';
            h += '<div id="navPlanBadge" style="font-size:.8rem;font-weight:700;color:#c4a052;margin-bottom:.4rem">Starter</div>';
            h += '<a href="upgrade.html" id="navUpgradeBtn" class="nav-item" style="background:#c4a052;color:#1a1a2e;border-radius:6px;text-align:center;font-weight:700;font-size:.8rem;padding:.5rem .75rem;margin:0">' + ti('⭐') + ' Upgraden</a>';
            h += '<button id="navPortalBtn" onclick="openCustomerPortal()" class="nav-item" style="display:none;font-size:.75rem;padding:.4rem .75rem;color:#8888a8;margin-top:.3rem">Abo verwalten →</button>';
        } else {
            h += '<div class="nav-plan-box" id="navPlanBox" style="margin:0 .75rem .5rem;padding:.6rem .75rem;background:rgba(245,166,35,.08);border-radius:.5rem;text-align:center;display:none">';
            h += '<div id="navPlanBadge" style="font-size:.8rem;font-weight:700;color:#8B7355;margin-bottom:.4rem">🐝 Starter</div>';
            h += '<a href="upgrade.html" id="navUpgradeBtn" class="nav-item" style="background:#F5A623;color:#1C1410;border-radius:100px;text-align:center;font-weight:700;font-size:.8rem;padding:.5rem .75rem;margin:0">⭐ Upgraden</a>';
            h += '<button id="navPortalBtn" onclick="openCustomerPortal()" class="nav-item" style="display:none;font-size:.75rem;padding:.4rem .75rem;color:#8B7355;margin-top:.3rem">Abo verwalten →</button>';
        }
        h += '</div>';

        if (isPro) {
            h += '<div style="margin-top:auto;padding:.75rem 1rem;border-top:1px solid #2d2d4a;font-size:.65rem;color:#6b6b8a;display:flex;flex-wrap:wrap;gap:.5rem .75rem">';
            h += '<a href="impressum.html" style="color:#6b6b8a;text-decoration:none">Impressum</a>';
            h += '<a href="datenschutz.html" style="color:#6b6b8a;text-decoration:none">Datenschutz</a>';
            h += '<a href="agb.html" style="color:#6b6b8a;text-decoration:none">AGB</a>';
            h += '</div>';
        } else {
            h += '<div style="margin-top:auto;padding:1rem;border-top:2px solid rgba(245,166,35,0.12);font-size:.7rem;color:#A69580;display:flex;flex-wrap:wrap;gap:.5rem .75rem">';
            h += '<a href="impressum.html" style="color:#A69580;text-decoration:none">Impressum</a>';
            h += '<a href="datenschutz.html" style="color:#A69580;text-decoration:none">Datenschutz</a>';
            h += '<a href="agb.html" style="color:#A69580;text-decoration:none">AGB</a>';
            h += '</div>';
        }

        h += '<a href="app.html#einstellungen" class="nav-item' + (isActive('app.html#einstellungen') ? ' active' : '') + '">' + ti('⚙️') + ' Einstellungen</a>';
        h += '<button class="nav-item" style="color:#ef4444" onclick="if(typeof doLogout===\'function\')doLogout();else window.location.href=\'app.html\';">' + ti('🚪') + ' Abmelden</button>';
        return h;
    }

    // === MOBILE BOTTOM BAR ===
    function buildMobileBar() {
        var h = '';
        var isIndex = (currentFile === 'app.html');

        if (isIndex) {
            h += '<button class="mobile-nav-btn active" data-mpage="heute"><span class="mn-icon">' + ti('📅') + '</span>Heute</button>';
            h += '<a href="voelker.html" class="mobile-nav-btn"><span class="mn-icon">' + ti('📍') + '</span>Völker</a>';
            h += '<button class="mobile-nav-btn menu-btn" onclick="mobileMenuOpen()"><span class="mn-icon">☰</span>Menü</button>';
            h += '<button class="mobile-nav-btn" data-mpage="aufgaben"><span class="mn-icon">' + ti('📝') + '</span>Aufgaben</button>';
            h += '<button class="mobile-nav-btn" data-mpage="einstellungen"><span class="mn-icon">' + ti('⚙️') + '</span>Mehr</button>';
        } else {
            h += '<a href="app.html#heute" class="mobile-nav-btn"><span class="mn-icon">' + ti('📅') + '</span>Heute</a>';
            h += '<a href="voelker.html" class="mobile-nav-btn'+(currentFile==='voelker.html'?' active':'')+'"><span class="mn-icon">' + ti('📍') + '</span>Völker</a>';
            h += '<button class="mobile-nav-btn menu-btn" onclick="mobileMenuOpen()"><span class="mn-icon">☰</span>Menü</button>';
            h += '<a href="app.html#aufgaben" class="mobile-nav-btn"><span class="mn-icon">' + ti('📝') + '</span>Aufgaben</a>';
            h += '<a href="app.html#einstellungen" class="mobile-nav-btn"><span class="mn-icon">' + ti('⚙️') + '</span>Mehr</a>';
        }
        return h;
    }

    // === MOBILE FULLSCREEN MENU ===
    function buildMobileMenu() {
        var isIndex = (currentFile === 'app.html');
        var groups = [
            { title: 'Übersicht', items: [
                { page: 'heute', icon: '📅', label: 'Heute' },
                { href: 'voelker.html', icon: '📍', label: 'Völker' },
                { page: 'aufgaben', icon: '📝', label: 'Aufgaben' }
            ]},
            { title: 'Völker', items: [
                { href: 'zuchtplan.html', icon: '👑', label: 'Zucht' },
                { href: 'zuchtberater.html', icon: '🧬', label: 'Zuchtberater' },
                { href: 'inzuchtrechner.html', icon: '🔬', label: 'Inzucht' },
                { href: 'behandlung.html', icon: '💉', label: 'Behandlung' }
            ]},
            { title: 'Tools', items: [
                { href: 'assistent.html', icon: '🤖', label: 'Assistent' },
                { href: 'bestandsbuch.html', icon: '📋', label: 'Bestandsbuch' },
                { href: 'ernte.html', icon: '🍯', label: 'Ernte' }
            ]},
            { title: 'Ernte & Planung', items: [
                { href: 'tracht.html', icon: '🌸', label: 'Tracht' },
                { href: 'trachtmonitor.html', icon: '🗺️', label: 'Tracht-Radar' },
                { href: 'packliste.html', icon: '📦', label: 'Packliste' },
                { page: 'kosten', icon: '💰', label: 'Kosten' }
            ]},
            { title: 'Community', items: [
                { href: 'forum.html', icon: '💬', label: 'Forum' },
                { href: 'verein_trachten.html', icon: '🏘️', label: 'Mein Verein' },
                { href: 'hornisse.html', icon: '🐝', label: 'Hornissen-Melder' }
            ]},
            { title: 'Verwaltung', items: [
                { page: 'einstellungen', icon: '⚙️', label: 'Einstellungen' },
                { href: 'upgrade.html', icon: '⭐', label: 'Upgrade', id: 'mobileUpgradeBtn' },
                { special: 'portal', icon: '💳', label: 'Abo verwalten', id: 'mobilePortalBtn' },
                { special: 'logout', icon: '🚪', label: 'Abmelden' }
            ]}
        ];

        var h = '<div class="mobile-menu-box">';
        if (isPro) {
            h += '<div class="mobile-menu-header"><h2 style="font-family:Outfit,sans-serif;font-weight:700">BienenPlan</h2>';
        } else {
            h += '<div class="mobile-menu-header"><h2><img src="Logo.svg" alt="BienenPlan" style="height:120px;vertical-align:middle;margin-right:.5rem"> Navigation</h2>';
        }
        h += '<button class="mobile-menu-close" onclick="mobileMenuClose()">✕</button></div>';

        groups.forEach(function(g) {
            h += '<div class="mobile-menu-section">' + g.title + '</div>';
            h += '<div class="mobile-menu-grid">';
            g.items.forEach(function(item) {
                var st = item.small ? ' style="font-size:.7rem"' : '';
                var iconHtml = '<span class="mm-icon">' + ti(item.icon) + '</span>';
                if (item.special === 'logout') {
                    h += '<button class="mobile-menu-item mm-danger" onclick="mobileMenuClose();if(typeof doLogout===\'function\')doLogout();else window.location.href=\'app.html\';">' + iconHtml + item.label + '</button>';
                } else if (item.special === 'portal') {
                    h += '<button class="mobile-menu-item" id="' + (item.id||'') + '" onclick="mobileMenuClose();openCustomerPortal();" style="display:none">' + iconHtml + item.label + '</button>';
                } else if (item.id) {
                    h += '<a href="' + item.href + '" class="mobile-menu-item" id="' + item.id + '"' + st + '>' + iconHtml + item.label + '</a>';
                } else if (item.page) {
                    if (isIndex) {
                        h += '<button class="mobile-menu-item" data-mmpage="' + item.page + '"' + st + '>' + iconHtml + item.label + '</button>';
                    } else {
                        h += '<a href="app.html#' + item.page + '" class="mobile-menu-item"' + st + '>' + iconHtml + item.label + '</a>';
                    }
                } else {
                    h += '<a href="' + item.href + '" class="mobile-menu-item"' + st + '>' + iconHtml + item.label + '</a>';
                }
            });
            h += '</div>';
        });

        // Theme Toggle im Mobile Menu
        h += '<div style="padding:.75rem 0;text-align:center">';
        h += buildThemeToggle();
        h += '</div>';

        h += '<div style="padding:.75rem 1rem;border-top:1px solid ' + (isPro ? '#e0e0e0' : '#E8DFD4') + ';font-size:.7rem;color:' + (isPro ? '#9ca3af' : '#A69580') + ';display:flex;gap:.75rem;justify-content:center">';
        h += '<a href="impressum.html" style="color:' + (isPro ? '#9ca3af' : '#A69580') + ';text-decoration:none">Impressum</a>';
        h += '<a href="datenschutz.html" style="color:' + (isPro ? '#9ca3af' : '#A69580') + ';text-decoration:none">Datenschutz</a>';
        h += '<a href="agb.html" style="color:' + (isPro ? '#9ca3af' : '#A69580') + ';text-decoration:none">AGB</a>';
        h += '</div>';
        h += '</div>';
        return h;
    }

    // === INJECT ===
    var navEl = document.getElementById('mainNav');
    if (navEl) navEl.innerHTML = buildDesktopNav();

    var mobileBarEl = document.getElementById('mobileNavBar');
    if (mobileBarEl) mobileBarEl.innerHTML = buildMobileBar();

    var mobileMenuEl = document.getElementById('mobileMenuOverlay');
    if (mobileMenuEl) mobileMenuEl.innerHTML = buildMobileMenu();

    // === INDEX.HTML: Interne Hash-Links abfangen ===
    if (currentFile === 'app.html' && navEl) {
        navEl.querySelectorAll('a.nav-item[href^="app.html#"]').forEach(function(link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                var page = link.getAttribute('href').replace('app.html#', '');
                navEl.querySelectorAll('.nav-item').forEach(function(b) { b.classList.remove('active'); });
                link.classList.add('active');
                if (typeof app !== 'undefined') {
                    app.page = page;
                    window.location.hash = page;
                    app.render();
                    window.scrollTo(0, 0);
                }
            });
        });
    }

    // === HELPER: Active-State von außen setzen ===
    window.navSetActive = function(page) {
        var nav = document.getElementById('mainNav');
        if (!nav) return;
        nav.querySelectorAll('.nav-item').forEach(function(b) { b.classList.remove('active'); });
        var link = nav.querySelector('a.nav-item[href="app.html#' + page + '"]');
        if (link) link.classList.add('active');
    };

    // === MOBILE MENU: Open/Close (global verfügbar) ===
    window.navMobileMenuOpen = function() {
        document.querySelectorAll('.leaflet-container').forEach(function(el){
            el.style.visibility = 'hidden';
        });
        var overlay = document.getElementById('mobileMenuOverlay');
        if (overlay) overlay.classList.add('active');
        if (typeof app !== 'undefined') {
            document.querySelectorAll('.mobile-menu-item[data-mmpage]').forEach(function(btn) {
                btn.classList.toggle('mm-active', btn.dataset.mmpage === app.page);
            });
        }
    };
    window.navMobileMenuClose = function() {
        var overlay = document.getElementById('mobileMenuOverlay');
        if (overlay) overlay.classList.remove('active');
        document.querySelectorAll('.leaflet-container').forEach(function(el){
            el.style.visibility = 'visible';
        });
    };

    if (typeof window.mobileMenuOpen === 'undefined') window.mobileMenuOpen = window.navMobileMenuOpen;
    if (typeof window.mobileMenuClose === 'undefined') window.mobileMenuClose = window.navMobileMenuClose;

    // === MOBILE: Button Clicks binden (nur app.html) ===
    if (currentFile === 'app.html') {
        setTimeout(function() {
            document.querySelectorAll('.mobile-menu-item[data-mmpage]').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var page = btn.dataset.mmpage;
                    if (typeof app !== 'undefined') { app.page = page; app.render(); }
                    navSetActive(page);
                    navMobileMenuClose();
                    document.querySelectorAll('.mobile-nav-btn[data-mpage]').forEach(function(b) { b.classList.toggle('active', b.dataset.mpage === page); });
                });
            });
            document.querySelectorAll('.mobile-nav-btn[data-mpage]').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var page = btn.dataset.mpage;
                    if (typeof app !== 'undefined') { app.page = page; app.render(); }
                    navSetActive(page);
                    document.querySelectorAll('.mobile-nav-btn[data-mpage]').forEach(function(b) { b.classList.toggle('active', b.dataset.mpage === page); });
                });
            });
        }, 100);
    }

    // === NAV PLAN UPDATE ===
    window.navUpdatePlan = function() {
        if (typeof planManager === 'undefined' || !planManager.loaded) return;
        var info = planManager.getPlanInfo();

        var box = document.getElementById('navPlanBox');
        var badge = document.getElementById('navPlanBadge');
        var upgradeBtn = document.getElementById('navUpgradeBtn');
        var portalBtn = document.getElementById('navPortalBtn');

        if (box) box.style.display = 'block';
        if (badge) {
            badge.textContent = info.emoji + ' ' + info.name;
            badge.style.color = info.color;
            if (info.isTrial) badge.textContent += ' (Trial)';
        }

        if (info.plan !== 'starter') {
            if (upgradeBtn) upgradeBtn.style.display = 'none';
            if (portalBtn) portalBtn.style.display = 'block';
            var mUpgrade = document.getElementById('mobileUpgradeBtn');
            var mPortal = document.getElementById('mobilePortalBtn');
            if (mUpgrade) mUpgrade.style.display = 'none';
            if (mPortal) mPortal.style.display = 'flex';
        } else {
            if (upgradeBtn) upgradeBtn.style.display = 'block';
            if (portalBtn) portalBtn.style.display = 'none';
            var mUpgrade = document.getElementById('mobileUpgradeBtn');
            var mPortal = document.getElementById('mobilePortalBtn');
            if (mUpgrade) mUpgrade.style.display = 'flex';
            if (mPortal) mPortal.style.display = 'none';
        }
    };

    // === CUSTOMER PORTAL ===
    window.openCustomerPortal = async function() {
        try {
            var session = await sb.auth.getSession();
            if (!session.data.session) {
                alert('Bitte zuerst einloggen.');
                return;
            }

            var response = await fetch(
                'https://reyswuedptkyfdkmdpft.supabase.co/functions/v1/create-portal-session',
                {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + session.data.session.access_token,
                        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJleXN3dWVkcHRreWZka21kcGZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NjM0MDQsImV4cCI6MjA4NzQzOTQwNH0.mrqs7lPs3S7B62sKpTbuzuxAcodil04RQ7HUjuQHuKI',
                        'Content-Type': 'application/json'
                    },
                    body: '{}'
                }
            );

            var data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert(data.error || 'Fehler beim Öffnen des Kundenportals.');
            }
        } catch(e) {
            alert('Verbindungsfehler. Bitte versuche es erneut.');
            console.error('Portal Error:', e);
        }
    };

})();

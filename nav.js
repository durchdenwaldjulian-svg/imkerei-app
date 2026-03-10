// ============================================
// IMKEREI TAGESPLANER – ZENTRALE NAVIGATION
// nav.js – wird in allen Seiten mit Sidebar eingebunden
// Änderungen hier wirken sich auf ALLE Seiten aus
// ============================================

(function(){
    var currentFile = window.location.pathname.split('/').pop() || 'app.html';
    if (currentFile === '') currentFile = 'app.html';

    var sections = [
        { title: 'Übersicht', items: [
            { href: 'app.html#heute', icon: '📅', label: 'Heute' },
            { href: 'standorte.html', icon: '📍', label: 'Standorte' },
            { href: 'app.html#aufgaben', icon: '📝', label: 'Aufgaben' }
        ]},
        { title: 'Völker', items: [
            { href: 'zuchtplan.html', icon: '👑', label: 'Königinnenzucht' },
            { href: 'zuchtberater.html', icon: '🧬', label: 'Zuchtberater' },
            { href: 'inzuchtrechner.html', icon: '🔬', label: 'Inzuchtrechner' },
            { href: 'behandlung.html', icon: '💉', label: 'Behandlungen' },
            { href: 'bewertung.html', icon: '🗂️', label: 'Stockkarte' },
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

    var legalItems = [
        { href: 'impressum.html', label: 'Impressum' },
        { href: 'datenschutz.html', label: 'Datenschutz' },
        { href: 'agb.html', label: 'AGB' }
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

    // === DESKTOP SIDEBAR ===
    function buildDesktopNav() {
        var h = '';
        h += '<div class="nav-brand">';
        h += '<img src="BienenPlanLogo.png" alt="BienenPlan" style="width:140px;height:auto;margin-bottom:.25rem">';
        h += '<div style="font-size:.7rem;color:#7A6652">Cloud v6.0</div>';
        h += '</div>';

        sections.forEach(function(s) {
            h += '<div class="nav-section">' + s.title + '</div>';
            s.items.forEach(function(item) {
                var cls = isActive(item.href) ? ' active' : '';
                h += '<a href="' + item.href + '" class="nav-item' + cls + '">' + item.icon + ' ' + item.label + '</a>';
            });
        });

        h += '<div style="flex:1"></div>';

        // Plan-Badge + Upgrade/Abo-Button
        h += '<div class="nav-plan-box" id="navPlanBox" style="margin:0 .75rem .5rem;padding:.6rem .75rem;background:rgba(245,166,35,.08);border-radius:.5rem;text-align:center;display:none">';
        h += '<div id="navPlanBadge" style="font-size:.8rem;font-weight:700;color:#8B7355;margin-bottom:.4rem">🐝 Starter</div>';
        h += '<a href="upgrade.html" id="navUpgradeBtn" class="nav-item" style="background:#F5A623;color:#1C1410;border-radius:100px;text-align:center;font-weight:700;font-size:.8rem;padding:.5rem .75rem;margin:0">⭐ Upgraden</a>';
        h += '<button id="navPortalBtn" onclick="openCustomerPortal()" class="nav-item" style="display:none;font-size:.75rem;padding:.4rem .75rem;color:#8B7355;margin-top:.3rem">Abo verwalten →</button>';
        h += '</div>';

        h += '<div class="nav-section">Rechtliches</div>';
        legalItems.forEach(function(item) {
            h += '<a href="' + item.href + '" class="nav-item" style="font-size:.75rem;padding:.4rem 1rem;color:#A69580">' + item.label + '</a>';
        });

        h += '<a href="app.html#einstellungen" class="nav-item' + (isActive('app.html#einstellungen') ? ' active' : '') + '">⚙️ Einstellungen</a>';
        h += '<button class="nav-item" style="color:#ef4444" onclick="if(typeof doLogout===\'function\')doLogout();else window.location.href=\'app.html\';">🚪 Abmelden</button>';
        return h;
    }

    // === MOBILE BOTTOM BAR ===
    function buildMobileBar() {
        var h = '';
        var isIndex = (currentFile === 'app.html');
        
        if (isIndex) {
            // Auf app.html: Buttons die app.page steuern
            h += '<button class="mobile-nav-btn active" data-mpage="heute"><span class="mn-icon">📅</span>Heute</button>';
            h += '<a href="standorte.html" class="mobile-nav-btn"><span class="mn-icon">📍</span>Standorte</a>';
            h += '<button class="mobile-nav-btn menu-btn" onclick="mobileMenuOpen()"><span class="mn-icon">☰</span>Menü</button>';
            h += '<button class="mobile-nav-btn" data-mpage="aufgaben"><span class="mn-icon">📝</span>Aufgaben</button>';
            h += '<button class="mobile-nav-btn" data-mpage="einstellungen"><span class="mn-icon">⚙️</span>Mehr</button>';
        } else {
            // Auf eigenständigen Seiten: alles als Links
            h += '<a href="app.html#heute" class="mobile-nav-btn"><span class="mn-icon">📅</span>Heute</a>';
            h += '<a href="standorte.html" class="mobile-nav-btn'+(currentFile==='standorte.html'?' active':'')+'"><span class="mn-icon">📍</span>Standorte</a>';
            h += '<button class="mobile-nav-btn menu-btn" onclick="mobileMenuOpen()"><span class="mn-icon">☰</span>Menü</button>';
            h += '<a href="app.html#aufgaben" class="mobile-nav-btn"><span class="mn-icon">📝</span>Aufgaben</a>';
            h += '<a href="app.html#einstellungen" class="mobile-nav-btn"><span class="mn-icon">⚙️</span>Mehr</a>';
        }
        return h;
    }

    // === MOBILE FULLSCREEN MENU ===
    function buildMobileMenu() {
        var isIndex = (currentFile === 'app.html');
        var groups = [
            { title: 'Übersicht', items: [
                { page: 'heute', icon: '📅', label: 'Heute' },
                { href: 'standorte.html', icon: '📍', label: 'Standorte' },
                { page: 'aufgaben', icon: '📝', label: 'Aufgaben' }
            ]},
            { title: 'Völker', items: [
                { href: 'zuchtplan.html', icon: '👑', label: 'Zucht' },
                { href: 'zuchtberater.html', icon: '🧬', label: 'Zuchtberater' },
                { href: 'inzuchtrechner.html', icon: '🔬', label: 'Inzucht' },
                { href: 'behandlung.html', icon: '💉', label: 'Behandlung' },
                { href: 'bewertung.html', icon: '🗂️', label: 'Stockkarte' }
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
            ]},
            { title: 'Rechtliches', items: [
                { href: 'impressum.html', icon: '📄', label: 'Impressum', small: true },
                { href: 'datenschutz.html', icon: '🔒', label: 'Datenschutz', small: true },
                { href: 'agb.html', icon: '📋', label: 'AGB', small: true }
            ]}
        ];

        var h = '<div class="mobile-menu-box">';
        h += '<div class="mobile-menu-header"><h2><img src="BienenPlanLogo.png" alt="BienenPlan" style="height:28px;vertical-align:middle;margin-right:.35rem"> Navigation</h2>';
        h += '<button class="mobile-menu-close" onclick="mobileMenuClose()">✕</button></div>';

        groups.forEach(function(g) {
            h += '<div class="mobile-menu-section">' + g.title + '</div>';
            h += '<div class="mobile-menu-grid">';
            g.items.forEach(function(item) {
                var st = item.small ? ' style="font-size:.7rem"' : '';
                if (item.special === 'logout') {
                    h += '<button class="mobile-menu-item mm-danger" onclick="mobileMenuClose();if(typeof doLogout===\'function\')doLogout();else window.location.href=\'app.html\';"><span class="mm-icon">' + item.icon + '</span>' + item.label + '</button>';
                } else if (item.special === 'portal') {
                    h += '<button class="mobile-menu-item" id="' + (item.id||'') + '" onclick="mobileMenuClose();openCustomerPortal();" style="display:none"><span class="mm-icon">' + item.icon + '</span>' + item.label + '</button>';
                } else if (item.id) {
                    h += '<a href="' + item.href + '" class="mobile-menu-item" id="' + item.id + '"' + st + '><span class="mm-icon">' + item.icon + '</span>' + item.label + '</a>';
                } else if (item.page) {
                    // Auf app.html: Button der app.page setzt
                    // Auf anderen Seiten: Link zu app.html#page
                    if (isIndex) {
                        h += '<button class="mobile-menu-item" data-mmpage="' + item.page + '"' + st + '><span class="mm-icon">' + item.icon + '</span>' + item.label + '</button>';
                    } else {
                        h += '<a href="app.html#' + item.page + '" class="mobile-menu-item"' + st + '><span class="mm-icon">' + item.icon + '</span>' + item.label + '</a>';
                    }
                } else {
                    h += '<a href="' + item.href + '" class="mobile-menu-item"' + st + '><span class="mm-icon">' + item.icon + '</span>' + item.label + '</a>';
                }
            });
            h += '</div>';
        });
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
        // Alles unter dem Overlay unsichtbar machen (Leaflet z-index Problem)
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
        // Leaflet-Karten wieder sichtbar
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
    // Wird aufgerufen nachdem planManager.load() fertig ist
    window.navUpdatePlan = function() {
        if (typeof planManager === 'undefined' || !planManager.loaded) return;
        var info = planManager.getPlanInfo();
        
        // Desktop Nav
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
            // Bezahlter Plan: Upgrade-Button verstecken, Portal zeigen
            if (upgradeBtn) upgradeBtn.style.display = 'none';
            if (portalBtn) portalBtn.style.display = 'block';
            // Mobile
            var mUpgrade = document.getElementById('mobileUpgradeBtn');
            var mPortal = document.getElementById('mobilePortalBtn');
            if (mUpgrade) mUpgrade.style.display = 'none';
            if (mPortal) mPortal.style.display = 'flex';
        } else {
            // Starter: Upgrade zeigen, Portal verstecken
            if (upgradeBtn) upgradeBtn.style.display = 'block';
            if (portalBtn) portalBtn.style.display = 'none';
            // Mobile
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

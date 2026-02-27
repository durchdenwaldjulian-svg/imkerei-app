// ============================================
// IMKEREI TAGESPLANER – ZENTRALE NAVIGATION
// nav.js – wird in allen Seiten mit Sidebar eingebunden
// Änderungen hier wirken sich auf ALLE Seiten aus
// ============================================

(function(){
    var currentFile = window.location.pathname.split('/').pop() || 'index.html';
    if (currentFile === '') currentFile = 'index.html';

    var sections = [
        { title: 'Übersicht', items: [
            { href: 'index.html#heute', icon: '📅', label: 'Heute' },
            { href: 'standorte.html', icon: '📍', label: 'Standorte' },
            { href: 'index.html#aufgaben', icon: '📝', label: 'Aufgaben' }
        ]},
        { title: 'Völker', items: [
            { href: 'zuchtplan.html', icon: '👑', label: 'Königinnenzucht' },
            { href: 'behandlung.html', icon: '💉', label: 'Behandlungen' },
            { href: 'bewertung.html', icon: '⭐', label: 'Völker-Bewertung' },
            { href: 'assistent.html', icon: '🤖', label: 'Assistent' },
            { href: 'bestandsbuch.html', icon: '📋', label: 'Bestandsbuch' }
        ]},
        { title: 'Ernte & Planung', items: [
            { href: 'ernte.html', icon: '🍯', label: 'Honigernte' },
            { href: 'tracht.html', icon: '🌸', label: 'Tracht' },
            { href: 'packliste.html', icon: '📦', label: 'Packliste' }
        ]},
        { title: 'Community', items: [
            { href: 'forum.html', icon: '💬', label: 'Forum' }
        ]},
        { title: 'Verwaltung', items: [
            { href: 'index.html#kosten', icon: '💰', label: 'Kosten' }
        ]}
    ];

    var legalItems = [
        { href: 'impressum.html', label: 'Impressum' },
        { href: 'datenschutz.html', label: 'Datenschutz' },
        { href: 'agb.html', label: 'AGB' }
    ];

    function isActive(href) {
        if (href.indexOf('#') > -1) {
            var file = href.split('#')[0] || 'index.html';
            var hash = href.split('#')[1];
            if (currentFile === 'index.html' && file === 'index.html') {
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
        h += '<div style="font-size:1.5rem;font-weight:bold;color:#F5A623">🐝</div>';
        h += '<div style="font-size:.85rem;font-weight:600;color:#1C1410;margin-top:.25rem">Imkerei</div>';
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
        h += '<div class="nav-section">Rechtliches</div>';
        legalItems.forEach(function(item) {
            h += '<a href="' + item.href + '" class="nav-item" style="font-size:.75rem;padding:.4rem 1rem;color:#A69580">' + item.label + '</a>';
        });

        h += '<a href="index.html#einstellungen" class="nav-item' + (isActive('index.html#einstellungen') ? ' active' : '') + '">⚙️ Einstellungen</a>';
        h += '<button class="nav-item" style="color:#ef4444" onclick="if(typeof doLogout===\'function\')doLogout();else window.location.href=\'index.html\';">🚪 Abmelden</button>';
        return h;
    }

    // === MOBILE BOTTOM BAR (nur index.html) ===
    function buildMobileBar() {
        var h = '';
        h += '<button class="mobile-nav-btn" onclick="mobileMenuOpen()"><span class="mn-icon">☰</span>Menü</button>';
        h += '<button class="mobile-nav-btn active" data-mpage="heute"><span class="mn-icon">📅</span>Heute</button>';
        h += '<button class="mobile-nav-btn" data-mpage="standorte"><span class="mn-icon">📍</span>Standorte</button>';
        h += '<button class="mobile-nav-btn" data-mpage="aufgaben"><span class="mn-icon">📝</span>Aufgaben</button>';
        h += '<button class="mobile-nav-btn" data-mpage="tracht"><span class="mn-icon">🌸</span>Tracht</button>';
        h += '<button class="mobile-nav-btn" data-mpage="einstellungen"><span class="mn-icon">⚙️</span>Mehr</button>';
        return h;
    }

    // === MOBILE FULLSCREEN MENU ===
    function buildMobileMenu() {
        var groups = [
            { title: 'Übersicht', items: [
                { page: 'heute', icon: '📅', label: 'Heute' },
                { href: 'standorte.html', icon: '📍', label: 'Standorte' },
                { page: 'aufgaben', icon: '📝', label: 'Aufgaben' }
            ]},
            { title: 'Völker', items: [
                { href: 'zuchtplan.html', icon: '👑', label: 'Zucht' },
                { href: 'behandlung.html', icon: '💉', label: 'Behandlung' },
                { href: 'bewertung.html', icon: '⭐', label: 'Bewertung' }
            ]},
            { title: 'Tools', items: [
                { href: 'assistent.html', icon: '🤖', label: 'Assistent' },
                { href: 'bestandsbuch.html', icon: '📋', label: 'Bestandsbuch' },
                { href: 'ernte.html', icon: '🍯', label: 'Ernte' }
            ]},
            { title: 'Ernte & Planung', items: [
                { href: 'tracht.html', icon: '🌸', label: 'Tracht' },
                { href: 'packliste.html', icon: '📦', label: 'Packliste' },
                { page: 'kosten', icon: '💰', label: 'Kosten' }
            ]},
            { title: 'Community', items: [
                { href: 'forum.html', icon: '💬', label: 'Forum' }
            ]},
            { title: 'Verwaltung', items: [
                { page: 'einstellungen', icon: '⚙️', label: 'Einstellungen' },
                { special: 'logout', icon: '🚪', label: 'Abmelden' }
            ]},
            { title: 'Rechtliches', items: [
                { href: 'impressum.html', icon: '📄', label: 'Impressum', small: true },
                { href: 'datenschutz.html', icon: '🔒', label: 'Datenschutz', small: true },
                { href: 'agb.html', icon: '📋', label: 'AGB', small: true }
            ]}
        ];

        var h = '<div class="mobile-menu-box">';
        h += '<div class="mobile-menu-header"><h2>🐝 Navigation</h2>';
        h += '<button class="mobile-menu-close" onclick="mobileMenuClose()">✕</button></div>';

        groups.forEach(function(g) {
            h += '<div class="mobile-menu-section">' + g.title + '</div>';
            h += '<div class="mobile-menu-grid">';
            g.items.forEach(function(item) {
                var st = item.small ? ' style="font-size:.7rem"' : '';
                if (item.special === 'logout') {
                    h += '<button class="mobile-menu-item mm-danger" onclick="mobileMenuClose();if(typeof doLogout===\'function\')doLogout();else window.location.href=\'index.html\';"><span class="mm-icon">' + item.icon + '</span>' + item.label + '</button>';
                } else if (item.page) {
                    h += '<button class="mobile-menu-item" data-mmpage="' + item.page + '"' + st + '><span class="mm-icon">' + item.icon + '</span>' + item.label + '</button>';
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
    if (currentFile === 'index.html' && navEl) {
        navEl.querySelectorAll('a.nav-item[href^="index.html#"]').forEach(function(link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                var page = link.getAttribute('href').replace('index.html#', '');
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
        var link = nav.querySelector('a.nav-item[href="index.html#' + page + '"]');
        if (link) link.classList.add('active');
    };

    // === MOBILE MENU: Open/Close (global verfügbar) ===
    window.navMobileMenuOpen = function() {
        var overlay = document.getElementById('mobileMenuOverlay');
        if (overlay) overlay.classList.add('active');
        // Aktive Seite markieren
        if (typeof app !== 'undefined') {
            document.querySelectorAll('.mobile-menu-item[data-mmpage]').forEach(function(btn) {
                btn.classList.toggle('mm-active', btn.dataset.mmpage === app.page);
            });
        }
    };
    window.navMobileMenuClose = function() {
        var overlay = document.getElementById('mobileMenuOverlay');
        if (overlay) overlay.classList.remove('active');
    };

    // Globale Aliase für Kompatibilität
    if (typeof window.mobileMenuOpen === 'undefined') {
        window.mobileMenuOpen = window.navMobileMenuOpen;
    }
    if (typeof window.mobileMenuClose === 'undefined') {
        window.mobileMenuClose = window.navMobileMenuClose;
    }

    // === MOBILE MENU: Button Clicks binden ===
    if (currentFile === 'index.html') {
        // Warte kurz bis DOM fertig
        setTimeout(function() {
            // Mobile Menu Items (Fullscreen)
            document.querySelectorAll('.mobile-menu-item[data-mmpage]').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var page = btn.dataset.mmpage;
                    if (typeof app !== 'undefined') {
                        app.page = page;
                        app.render();
                    }
                    navSetActive(page);
                    navMobileMenuClose();
                    // Mobile bottom bar sync
                    document.querySelectorAll('.mobile-nav-btn[data-mpage]').forEach(function(b) {
                        b.classList.toggle('active', b.dataset.mpage === page);
                    });
                });
            });

            // Mobile Bottom Bar Buttons
            document.querySelectorAll('.mobile-nav-btn[data-mpage]').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var page = btn.dataset.mpage;
                    if (typeof app !== 'undefined') {
                        app.page = page;
                        app.render();
                    }
                    navSetActive(page);
                    document.querySelectorAll('.mobile-nav-btn[data-mpage]').forEach(function(b) {
                        b.classList.toggle('active', b.dataset.mpage === page);
                    });
                });
            });
        }, 100);
    }

})();

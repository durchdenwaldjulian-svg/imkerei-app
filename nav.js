// ============================================
// IMKEREI TAGESPLANER – ZENTRALE NAVIGATION
// nav.js – wird in allen Seiten mit Sidebar eingebunden
// Änderungen hier wirken sich auf ALLE Seiten aus
// Icons: Lucide (https://lucide.dev) – MIT License
// ============================================

(function(){
    var currentFile = window.location.pathname.split('/').pop() || 'index.html';
    if (currentFile === '') currentFile = 'index.html';

    function li(name) { return '<i data-lucide="'+name+'" style="width:18px;height:18px;stroke-width:2"></i>'; }
    function liM(name) { return '<i data-lucide="'+name+'" style="width:20px;height:20px;stroke-width:2"></i>'; }

    var sections = [
        { title: 'Übersicht', items: [
            { href: 'index.html#heute', lucide: 'calendar-days', label: 'Heute' },
            { href: 'standorte.html', lucide: 'map-pin', label: 'Standorte' },
            { href: 'index.html#aufgaben', lucide: 'list-checks', label: 'Aufgaben' }
        ]},
        { title: 'Völker', items: [
            { href: 'zuchtplan.html', lucide: 'crown', label: 'Königinnenzucht' },
            { href: 'behandlung.html', lucide: 'syringe', label: 'Behandlungen' },
            { href: 'bewertung.html', lucide: 'star', label: 'Völker-Bewertung' },
            { href: 'assistent.html', lucide: 'bot-message-square', label: 'Assistent' },
            { href: 'bestandsbuch.html', lucide: 'clipboard-list', label: 'Bestandsbuch' }
        ]},
        { title: 'Ernte & Planung', items: [
            { href: 'ernte.html', lucide: 'droplets', label: 'Honigernte' },
            { href: 'tracht.html', lucide: 'flower', label: 'Tracht' },
            { href: 'packliste.html', lucide: 'package-check', label: 'Packliste' }
        ]},
        { title: 'Community', items: [
            { href: 'forum.html', lucide: 'message-circle', label: 'Forum' }
        ]},
        { title: 'Verwaltung', items: [
            { href: 'index.html#kosten', lucide: 'wallet', label: 'Kosten' }
        ]}
    ];

    var legalItems = [
        { href: 'impressum.html', lucide: 'file-text', label: 'Impressum' },
        { href: 'datenschutz.html', lucide: 'shield', label: 'Datenschutz' },
        { href: 'agb.html', lucide: 'scroll-text', label: 'AGB' }
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
        var h = '<div class="nav-brand">';
        h += '<div style="color:#F5A623"><i data-lucide="hexagon" style="width:28px;height:28px;stroke-width:2.5"></i></div>';
        h += '<div style="font-size:.85rem;font-weight:600;color:#1C1410;margin-top:.25rem">Imkerei</div>';
        h += '<div style="font-size:.7rem;color:#7A6652">Cloud v6.0</div></div>';

        sections.forEach(function(s) {
            h += '<div class="nav-section">'+s.title+'</div>';
            s.items.forEach(function(item) {
                var cls = isActive(item.href) ? ' active' : '';
                h += '<a href="'+item.href+'" class="nav-item'+cls+'" style="display:flex;align-items:center;gap:.5rem">'+li(item.lucide)+' '+item.label+'</a>';
            });
        });

        h += '<div style="flex:1"></div>';
        h += '<div class="nav-section">Rechtliches</div>';
        legalItems.forEach(function(item) {
            h += '<a href="'+item.href+'" class="nav-item" style="font-size:.75rem;padding:.4rem 1rem;color:#A69580;display:flex;align-items:center;gap:.4rem">'+li(item.lucide)+' '+item.label+'</a>';
        });

        h += '<a href="index.html#einstellungen" class="nav-item'+(isActive('index.html#einstellungen')?' active':'')+'" style="display:flex;align-items:center;gap:.5rem">'+li('settings')+' Einstellungen</a>';
        h += '<button class="nav-item" style="color:#ef4444;display:flex;align-items:center;gap:.5rem" onclick="if(typeof doLogout===\'function\')doLogout();else window.location.href=\'index.html\';">'+li('log-out')+' Abmelden</button>';
        return h;
    }

    // === MOBILE BOTTOM BAR ===
    function buildMobileBar() {
        var h = '';
        h += '<button class="mobile-nav-btn" onclick="mobileMenuOpen()"><span class="mn-icon">'+liM('menu')+'</span>Menü</button>';
        h += '<button class="mobile-nav-btn active" data-mpage="heute"><span class="mn-icon">'+liM('calendar-days')+'</span>Heute</button>';
        h += '<button class="mobile-nav-btn" data-mpage="standorte"><span class="mn-icon">'+liM('map-pin')+'</span>Standorte</button>';
        h += '<button class="mobile-nav-btn" data-mpage="aufgaben"><span class="mn-icon">'+liM('list-checks')+'</span>Aufgaben</button>';
        h += '<button class="mobile-nav-btn" data-mpage="tracht"><span class="mn-icon">'+liM('flower')+'</span>Tracht</button>';
        h += '<button class="mobile-nav-btn" data-mpage="einstellungen"><span class="mn-icon">'+liM('settings')+'</span>Mehr</button>';
        return h;
    }

    // === MOBILE FULLSCREEN MENU ===
    function buildMobileMenu() {
        var groups = [
            { title: 'Übersicht', items: [
                { page: 'heute', lucide: 'calendar-days', label: 'Heute' },
                { href: 'standorte.html', lucide: 'map-pin', label: 'Standorte' },
                { page: 'aufgaben', lucide: 'list-checks', label: 'Aufgaben' }
            ]},
            { title: 'Völker', items: [
                { href: 'zuchtplan.html', lucide: 'crown', label: 'Zucht' },
                { href: 'behandlung.html', lucide: 'syringe', label: 'Behandlung' },
                { href: 'bewertung.html', lucide: 'star', label: 'Bewertung' }
            ]},
            { title: 'Tools', items: [
                { href: 'assistent.html', lucide: 'bot-message-square', label: 'Assistent' },
                { href: 'bestandsbuch.html', lucide: 'clipboard-list', label: 'Bestandsbuch' },
                { href: 'ernte.html', lucide: 'droplets', label: 'Ernte' }
            ]},
            { title: 'Ernte & Planung', items: [
                { href: 'tracht.html', lucide: 'flower', label: 'Tracht' },
                { href: 'packliste.html', lucide: 'package-check', label: 'Packliste' },
                { page: 'kosten', lucide: 'wallet', label: 'Kosten' }
            ]},
            { title: 'Community', items: [
                { href: 'forum.html', lucide: 'message-circle', label: 'Forum' }
            ]},
            { title: 'Verwaltung', items: [
                { page: 'einstellungen', lucide: 'settings', label: 'Einstellungen' },
                { special: 'logout', lucide: 'log-out', label: 'Abmelden' }
            ]},
            { title: 'Rechtliches', items: [
                { href: 'impressum.html', lucide: 'file-text', label: 'Impressum', small: true },
                { href: 'datenschutz.html', lucide: 'shield', label: 'Datenschutz', small: true },
                { href: 'agb.html', lucide: 'scroll-text', label: 'AGB', small: true }
            ]}
        ];

        var h = '<div class="mobile-menu-box">';
        h += '<div class="mobile-menu-header"><h2><i data-lucide="hexagon" style="width:22px;height:22px;stroke-width:2;color:#F5A623"></i> Navigation</h2>';
        h += '<button class="mobile-menu-close" onclick="mobileMenuClose()">✕</button></div>';

        groups.forEach(function(g) {
            h += '<div class="mobile-menu-section">'+g.title+'</div>';
            h += '<div class="mobile-menu-grid">';
            g.items.forEach(function(item) {
                var st = item.small ? ' style="font-size:.7rem"' : '';
                var ico = '<span class="mm-icon">'+liM(item.lucide)+'</span>';
                if (item.special === 'logout') {
                    h += '<button class="mobile-menu-item mm-danger" onclick="mobileMenuClose();if(typeof doLogout===\'function\')doLogout();else window.location.href=\'index.html\';">'+ico+item.label+'</button>';
                } else if (item.page) {
                    h += '<button class="mobile-menu-item" data-mmpage="'+item.page+'"'+st+'>'+ico+item.label+'</button>';
                } else {
                    h += '<a href="'+item.href+'" class="mobile-menu-item"'+st+'>'+ico+item.label+'</a>';
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

    // === LUCIDE ICONS RENDERN ===
    function renderLucide() {
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
        } else {
            setTimeout(renderLucide, 100);
        }
    }
    renderLucide();

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

    window.navSetActive = function(page) {
        var nav = document.getElementById('mainNav');
        if (!nav) return;
        nav.querySelectorAll('.nav-item').forEach(function(b) { b.classList.remove('active'); });
        var link = nav.querySelector('a.nav-item[href="index.html#'+page+'"]');
        if (link) link.classList.add('active');
    };

    window.navMobileMenuOpen = function() {
        var overlay = document.getElementById('mobileMenuOverlay');
        if (overlay) overlay.classList.add('active');
        renderLucide();
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

    if (typeof window.mobileMenuOpen === 'undefined') window.mobileMenuOpen = window.navMobileMenuOpen;
    if (typeof window.mobileMenuClose === 'undefined') window.mobileMenuClose = window.navMobileMenuClose;

    // === MOBILE: Button Clicks binden (nur index.html) ===
    if (currentFile === 'index.html') {
        setTimeout(function() {
            document.querySelectorAll('.mobile-menu-item[data-mmpage]').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var page = btn.dataset.mmpage;
                    if (typeof app !== 'undefined') { app.page = page; app.render(); }
                    navSetActive(page);
                    navMobileMenuClose();
                    document.querySelectorAll('.mobile-nav-btn[data-mpage]').forEach(function(b) { b.classList.toggle('active', b.dataset.mpage === page); });
                    renderLucide();
                });
            });
            document.querySelectorAll('.mobile-nav-btn[data-mpage]').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var page = btn.dataset.mpage;
                    if (typeof app !== 'undefined') { app.page = page; app.render(); }
                    navSetActive(page);
                    document.querySelectorAll('.mobile-nav-btn[data-mpage]').forEach(function(b) { b.classList.toggle('active', b.dataset.mpage === page); });
                    renderLucide();
                });
            });
        }, 100);
    }

})();

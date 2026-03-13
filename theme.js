// ============================================
// BIENENPLAN – THEME MANAGER
// theme.js – wird in allen Seiten im <head> geladen
// Schaltet zwischen Standard (Emoji/warm) und Profi (SVG/clean)
// ============================================

(function(){
    // Sofort Theme-Klasse setzen (vor Render, verhindert Flackern)
    var saved = localStorage.getItem('bp_theme') || 'standard';
    if(saved === 'pro') document.documentElement.classList.add('theme-pro');

    // === SVG Icon Helper ===
    function _s(d){
        return '<svg class="pro-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+d+'</svg>';
    }

    // === Profi-Icons (Lucide-basiert) ===
    var ICONS = {
        calendar:    _s('<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>'),
        'map-pin':   _s('<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/>'),
        clipboard:   _s('<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>'),
        tasks:       _s('<path d="M12 11h4M12 16h4M8 11h.01M8 16h.01"/><rect width="18" height="18" x="3" y="3" rx="2"/>'),
        crown:       _s('<path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7Z"/><path d="M5 16h14"/>'),
        dna:         _s('<path d="M2 15c6.667-6 13.333 0 20-6"/><path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993"/><path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993"/><path d="m17 6-2.5-2.5"/><path d="m14 8-1-1"/><path d="m7 18 2.5 2.5"/><path d="m3.5 14.5.5.5"/><path d="m10 16 1 1"/><path d="M2 9c6.667 6 13.333 0 20 6"/>'),
        microscope:  _s('<path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/>'),
        syringe:     _s('<path d="m18 2 4 4"/><path d="m17 7 3-3"/><path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"/><path d="m9 11 4 4"/><path d="m5 19-3 3"/><path d="m14 4 6 6"/>'),
        bot:         _s('<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>'),
        'file-text': _s('<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 13h4"/><path d="M10 17h4"/><path d="M10 9h1"/>'),
        droplet:     _s('<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>'),
        flower:      _s('<circle cx="12" cy="12" r="3"/><path d="M12 2a4 4 0 0 1 0 8 4 4 0 0 1 0-8Z"/><path d="M20 12a4 4 0 0 1-8 0 4 4 0 0 1 8 0Z"/><path d="M12 20a4 4 0 0 1 0-8 4 4 0 0 1 0 8Z"/><path d="M4 12a4 4 0 0 1 8 0 4 4 0 0 1-8 0Z"/>'),
        radar:       _s('<path d="M19.07 4.93A10 10 0 0 0 6.99 3.34"/><path d="M4 6h.01"/><path d="M2.29 9.62A10 10 0 1 0 21.31 8.35"/><path d="M16.24 7.76A6 6 0 1 0 8.23 16.67"/><path d="M12 18h.01"/><circle cx="12" cy="12" r="2"/>'),
        package:     _s('<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>'),
        'message':   _s('<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>'),
        building:    _s('<rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>'),
        shield:      _s('<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4M12 16h.01"/>'),
        wallet:      _s('<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>'),
        settings:    _s('<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>'),
        star:        _s('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'),
        'credit-card': _s('<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/>'),
        'log-out':   _s('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>'),
        sun:         _s('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>'),
        palette:     _s('<circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2Z"/>'),
        briefcase:   _s('<rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>'),
    };

    // === Theme-Emoji-zu-Icon Mapping ===
    var EMOJI_MAP = {
        '\uD83D\uDCC5': 'calendar',     // 📅
        '\uD83D\uDCCD': 'map-pin',      // 📍
        '\uD83D\uDCDD': 'tasks',        // 📝
        '\uD83D\uDC51': 'crown',        // 👑
        '\uD83E\uDDEC': 'dna',          // 🧬
        '\uD83D\uDD2C': 'microscope',   // 🔬
        '\uD83D\uDC89': 'syringe',      // 💉
        '\uD83E\uDD16': 'bot',          // 🤖
        '\uD83D\uDCCB': 'file-text',    // 📋
        '\uD83C\uDF6F': 'droplet',      // 🍯
        '\uD83C\uDF38': 'flower',       // 🌸
        '\uD83D\uDDFA\uFE0F': 'radar',  // 🗺️
        '\uD83D\uDCE6': 'package',      // 📦
        '\uD83D\uDCAC': 'message',      // 💬
        '\uD83C\uDFD8\uFE0F': 'building', // 🏘️
        '\uD83D\uDC1D': 'shield',       // 🐝
        '\uD83D\uDCB0': 'wallet',       // 💰
        '\u2699\uFE0F': 'settings',     // ⚙️
        '\u2B50': 'star',               // ⭐
        '\uD83D\uDCB3': 'credit-card',  // 💳
        '\uD83D\uDEAA': 'log-out',      // 🚪
    };

    // === Global Theme Manager ===
    window.themeManager = {
        current: function(){ return localStorage.getItem('bp_theme') || 'standard'; },
        isPro: function(){ return this.current() === 'pro'; },
        toggle: function(){
            var next = this.isPro() ? 'standard' : 'pro';
            localStorage.setItem('bp_theme', next);
            location.reload();
        },
        // Gibt Icon HTML zurueck: im Pro-Modus SVG, sonst Emoji
        icon: function(emoji){
            if(!this.isPro()) return emoji;
            var key = EMOJI_MAP[emoji];
            if(key && ICONS[key]) return ICONS[key];
            return emoji; // Fallback: Emoji beibehalten
        },
        getIconByName: function(name){
            return ICONS[name] || '';
        },
        ICONS: ICONS
    };
})();

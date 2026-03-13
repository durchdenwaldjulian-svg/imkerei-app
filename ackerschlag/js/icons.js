/* ============================================
   ICONS – SVG Icon System v2
   Duotone-Style: Bold strokes + accent fills
   ============================================ */

const Icons = {
  // Navigation & UI
  dashboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="9" rx="2" fill="currentColor" opacity="0.12"/><rect x="3" y="3" width="8" height="9" rx="2"/><rect x="13" y="3" width="8" height="5" rx="2" fill="currentColor" opacity="0.12"/><rect x="13" y="3" width="8" height="5" rx="2"/><rect x="13" y="10" width="8" height="11" rx="2"/><rect x="3" y="14" width="8" height="7" rx="2"/></svg>`,

  schlaege: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6l6-3 6 3 6-3v14l-6 3-6-3-6 3V6z"/><path d="M9 3v14" opacity="0.4"/><path d="M15 6v14" opacity="0.4"/><path d="M3 6l6 3 6-3 6 3" fill="currentColor" opacity="0.08"/></svg>`,

  karte: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="currentColor" opacity="0.1"/><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5" fill="currentColor" opacity="0.25"/><circle cx="12" cy="9" r="2.5"/></svg>`,

  kulturen: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 20h10"/><path d="M12 20V10"/><path d="M12 10C8.5 10 4 6 4 2c5 0 8 4.5 8 8z" fill="currentColor" opacity="0.1"/><path d="M12 10C8.5 10 4 6 4 2c5 0 8 4.5 8 8z"/><path d="M12 10c3.5 0 8-4 8-8-5 0-8 4.5-8 8z" fill="currentColor" opacity="0.1"/><path d="M12 10c3.5 0 8-4 8-8-5 0-8 4.5-8 8z"/></svg>`,

  massnahmen: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="18" rx="2" fill="currentColor" opacity="0.08"/><rect x="4" y="4" width="16" height="18" rx="2"/><rect x="8" y="2" width="8" height="4" rx="1.5" fill="currentColor" opacity="0.15"/><rect x="8" y="2" width="8" height="4" rx="1.5"/><path d="M9 14l2 2 4-4" stroke-width="2"/></svg>`,

  auswertung: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><rect x="7" y="12" width="3" height="8" rx="1" fill="currentColor" opacity="0.15"/><rect x="7" y="12" width="3" height="8" rx="1"/><rect x="13" y="8" width="3" height="12" rx="1" fill="currentColor" opacity="0.1"/><rect x="13" y="8" width="3" height="12" rx="1"/><rect x="19" y="5" width="3" height="15" rx="1" fill="currentColor" opacity="0.08"/><rect x="19" y="5" width="3" height="15" rx="1"/></svg>`,

  menu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 7h16M4 12h10M4 17h14"/></svg>`,

  close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>`,

  // Stat Icons
  statFlaeche: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 8l10-5 10 5v10l-10 5-10-5V8z" fill="currentColor" opacity="0.1"/><path d="M2 8l10-5 10 5v10l-10 5-10-5V8z"/><path d="M2 8l10 5 10-5" opacity="0.4"/><path d="M12 13v10" opacity="0.4"/></svg>`,

  statKultur: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-9"/><path d="M12 13C9 13 4.5 8.5 4.5 4c4.5 0 7.5 4 7.5 9z" fill="currentColor" opacity="0.12"/><path d="M12 13C9 13 4.5 8.5 4.5 4c4.5 0 7.5 4 7.5 9z"/><path d="M12 13c3 0 7.5-4.5 7.5-9-4.5 0-7.5 4-7.5 9z" fill="currentColor" opacity="0.12"/><path d="M12 13c3 0 7.5-4.5 7.5-9-4.5 0-7.5 4-7.5 9z"/></svg>`,

  statMassnahme: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" fill="currentColor" opacity="0.08"/><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18"/><path d="M16 2v4M8 2v4"/><circle cx="8" cy="15" r="1" fill="currentColor"/><circle cx="12" cy="15" r="1" fill="currentColor"/><circle cx="16" cy="15" r="1" fill="currentColor"/><circle cx="8" cy="19" r="1" fill="currentColor" opacity="0.4"/><circle cx="12" cy="19" r="1" fill="currentColor" opacity="0.4"/></svg>`,

  // Action Icons
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`,

  edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" fill="currentColor" opacity="0.08"/><path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/><path d="M15 5l4 4" opacity="0.4"/></svg>`,

  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" fill="currentColor" opacity="0.06"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/><path d="M10 11v6" opacity="0.6"/><path d="M14 11v6" opacity="0.6"/></svg>`,

  back: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>`,

  locate: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.1"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>`,

  download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>`,

  upload: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/></svg>`,

  // Type Icons (Massnahmen)
  duengung: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2h8v9l2 2v3H6v-3l2-2V2z" fill="currentColor" opacity="0.08"/><path d="M8 2h8v9l2 2v3H6v-3l2-2V2z"/><path d="M6 16h12v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4z" fill="currentColor" opacity="0.12"/><path d="M6 16h12v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4z"/><path d="M10 7h4" opacity="0.4"/><path d="M10 10h4" opacity="0.4"/></svg>`,

  pflanzenschutz: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" opacity="0.1"/><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4" stroke-width="2"/></svg>`,

  bodenbearbeitung: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="15" r="6" fill="currentColor" opacity="0.08"/><circle cx="12" cy="15" r="6"/><circle cx="12" cy="15" r="2" fill="currentColor" opacity="0.2"/><circle cx="12" cy="15" r="2"/><path d="M12 9V3"/><path d="M8 5l4-2 4 2"/></svg>`,

  aussaat: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"/><path d="M12 10C8.5 10 4 6 4 2c5 0 8 4.5 8 8z" fill="currentColor" opacity="0.12"/><path d="M12 10C8.5 10 4 6 4 2c5 0 8 4.5 8 8z"/><path d="M12 10c3.5 0 8-4 8-8-5 0-8 4.5-8 8z" fill="currentColor" opacity="0.12"/><path d="M12 10c3.5 0 8-4 8-8-5 0-8 4.5-8 8z"/><path d="M6 20h12"/></svg>`,

  ernte: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v8"/><path d="M8 6.5c0-2 1.8-3.5 4-3.5s4 1.5 4 3.5" opacity="0.4"/><path d="M6 10c0-2 2.7-4.5 6-4.5s6 2.5 6 4.5"/><path d="M5 21l2-9h10l2 9z" fill="currentColor" opacity="0.08"/><path d="M5 21l2-9h10l2 9z"/><path d="M9 16h6" opacity="0.4"/></svg>`,

  sonstiges: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="19" cy="12" r="1.5" fill="currentColor"/><circle cx="5" cy="12" r="1.5" fill="currentColor"/></svg>`,

  // Empty State Illustrations – refined with duotone fills
  emptyField: `<svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="30" y="22" width="60" height="48" rx="6" fill="#E2E8F0" opacity="0.4"/>
    <path d="M10 75 Q30 55 60 68 Q90 82 110 62" stroke="#A7F3D0" stroke-width="2.5" fill="none"/>
    <path d="M10 83 Q30 65 60 78 Q90 92 110 72" stroke="#6EE7A0" stroke-width="2" fill="none"/>
    <rect x="43" y="28" width="34" height="38" rx="4" stroke="#15803D" stroke-width="1.5" fill="#ECFDF3"/>
    <path d="M53 38v12M60 34v16M67 36v14" stroke="#16A34A" stroke-width="2" stroke-linecap="round"/>
    <circle cx="60" cy="24" r="5" fill="#DCFCE7" stroke="#16A34A" stroke-width="1.5"/>
    <path d="M58 24l2 2 3-3" stroke="#16A34A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  emptyKultur: `<svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="60" cy="88" rx="30" ry="5" fill="#E2E8F0" opacity="0.4"/>
    <path d="M60 88V48" stroke="#16A34A" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M60 48C55 48 38 38 38 24c8 0 16 6 22 24z" fill="#DCFCE7" stroke="#6EE7A0" stroke-width="1.5"/>
    <path d="M60 48C65 48 82 38 82 24c-8 0-16 6-22 24z" fill="#DCFCE7" stroke="#6EE7A0" stroke-width="1.5"/>
    <path d="M60 62C57 62 46 56 46 46c5 0 10 5 14 16z" fill="#ECFDF3" stroke="#A7F3D0" stroke-width="1.2"/>
    <path d="M60 62C63 62 74 56 74 46c-5 0-10 5-14 16z" fill="#ECFDF3" stroke="#A7F3D0" stroke-width="1.2"/>
    <circle cx="60" cy="44" r="3" fill="#16A34A" opacity="0.2"/>
  </svg>`,

  emptyChart: `<svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="14" y="66" width="16" height="24" rx="3" fill="#DCFCE7" stroke="#A7F3D0" stroke-width="1"/>
    <rect x="36" y="46" width="16" height="44" rx="3" fill="#A7F3D0" stroke="#6EE7A0" stroke-width="1"/>
    <rect x="58" y="30" width="16" height="60" rx="3" fill="#6EE7A0" stroke="#34D370" stroke-width="1"/>
    <rect x="80" y="50" width="16" height="40" rx="3" fill="#A7F3D0" stroke="#6EE7A0" stroke-width="1"/>
    <path d="M10 92h104" stroke="#E2E8F0" stroke-width="1.5"/>
    <path d="M22 60L44 40L66 25L88 44" stroke="#15803D" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="66" cy="25" r="4" fill="#15803D" opacity="0.2" stroke="#15803D" stroke-width="1.5"/>
    <circle cx="66" cy="25" r="1.5" fill="#15803D"/>
  </svg>`,

  emptyMassnahme: `<svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="28" y="16" width="64" height="74" rx="6" fill="#ECFDF3" stroke="#A7F3D0" stroke-width="1.5"/>
    <rect x="42" y="10" width="36" height="14" rx="4" fill="white" stroke="#6EE7A0" stroke-width="1.5"/>
    <circle cx="50" cy="17" r="2" fill="#16A34A" opacity="0.3"/>
    <circle cx="60" cy="17" r="2" fill="#16A34A" opacity="0.3"/>
    <circle cx="70" cy="17" r="2" fill="#16A34A" opacity="0.3"/>
    <rect x="40" y="38" width="28" height="3" rx="1.5" fill="#A7F3D0"/>
    <rect x="40" y="48" width="22" height="3" rx="1.5" fill="#DCFCE7"/>
    <rect x="40" y="58" width="32" height="3" rx="1.5" fill="#DCFCE7"/>
    <rect x="40" y="68" width="18" height="3" rx="1.5" fill="#ECFDF3"/>
    <circle cx="36" cy="39.5" r="2.5" fill="#16A34A" opacity="0.5"/>
    <path d="M35 39.5l1 1 2-2" stroke="white" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="36" cy="49.5" r="2.5" fill="#6EE7A0" opacity="0.5"/>
    <circle cx="36" cy="59.5" r="2.5" fill="#A7F3D0" opacity="0.5"/>
    <circle cx="36" cy="69.5" r="2.5" fill="#DCFCE7"/>
  </svg>`,

  // Feature Icons
  duengeplaner: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v6" opacity="0.4"/><path d="M8 5h8"/><path d="M6 8h12v4l-2 2v6a2 2 0 01-2 2h-4a2 2 0 01-2-2v-6l-2-2V8z" fill="currentColor" opacity="0.08"/><path d="M6 8h12v4l-2 2v6a2 2 0 01-2 2h-4a2 2 0 01-2-2v-6l-2-2V8z"/><path d="M9 15h6" opacity="0.4"/><path d="M9 18h6" opacity="0.4"/></svg>`,

  pflanzenschutzNav: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" opacity="0.1"/><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v5"/><circle cx="12" cy="16" r="1" fill="currentColor"/></svg>`,

  humusbilanz: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 22h20"/><path d="M4 22v-4c0-1 1-2 2-2h1c1 0 2 1 2 2v4" fill="currentColor" opacity="0.08"/><path d="M4 22v-4c0-1 1-2 2-2h1c1 0 2 1 2 2v4"/><path d="M10 22V12c0-1 1-2 2-2h1c1 0 2 1 2 2v10" fill="currentColor" opacity="0.12"/><path d="M10 22V12c0-1 1-2 2-2h1c1 0 2 1 2 2v10"/><path d="M16 22V8c0-1 1-2 2-2h1c1 0 2 1 2 2v14" fill="currentColor" opacity="0.06"/><path d="M16 22V8c0-1 1-2 2-2h1c1 0 2 1 2 2v14"/><circle cx="6.5" cy="12" r="2" fill="currentColor" opacity="0.15" stroke="none"/><circle cx="12.5" cy="6" r="2" fill="currentColor" opacity="0.15" stroke="none"/></svg>`,

  deckungsbeitrag: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" fill="currentColor" opacity="0.06"/><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 10h20" opacity="0.3"/><path d="M12 14v2" opacity="0.4"/><circle cx="12" cy="14" r="3" fill="currentColor" opacity="0.1"/><circle cx="12" cy="14" r="3"/><path d="M11 13.5v1.5h1.5" stroke-width="1.5"/></svg>`,

  stoffstrom: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 16l4-4 4 2 5-7" stroke-width="2"/><circle cx="7" cy="16" r="1.5" fill="currentColor" opacity="0.2"/><circle cx="11" cy="12" r="1.5" fill="currentColor" opacity="0.2"/><circle cx="15" cy="14" r="1.5" fill="currentColor" opacity="0.2"/><circle cx="20" cy="7" r="1.5" fill="currentColor" opacity="0.2"/></svg>`,

  importIcon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" fill="currentColor" opacity="0.06"/><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><path d="M9 15l3 3 3-3" opacity="0.6"/><path d="M12 12v6" opacity="0.6"/></svg>`,

  pdf: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" fill="currentColor" opacity="0.06"/><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><path d="M8 15h2a1 1 0 001-1v-1a1 1 0 00-1-1H8v4" stroke-width="1.3"/><path d="M13 12h1.5a1.5 1.5 0 010 3H13v-3v4" stroke-width="1.3"/></svg>`,

  // Helper: render icon with size
  render(name, size = 20, cls = '') {
    const svg = this[name];
    if (!svg) return '';
    return `<span class="icon ${cls}" style="width:${size}px;height:${size}px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0">${svg}</span>`;
  },

  // Render for stat icons (with background)
  renderStat(name, colorClass) {
    return `<div class="stat-icon ${colorClass}">${this.render(name, 24)}</div>`;
  }
};

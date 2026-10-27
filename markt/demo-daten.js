// demo-daten.js – sample data for ?demo=1 (stored in localStorage "markt_demo", never sent anywhere)
// Version 0.1.1 (2026-10-26, markt-dev)
//
// Changelog
// 0.1.1  No data change (version bump with the app; Jens holding blocks 1 and 4 now shows the "several blocks" hint).
// 0.1.0  "Artur scenario": Artur can only 3.–6.12. and 10.–13.12. (= blocks 2 and 3); Jens blocks 1 and 4,
//        Canan block 3 and parts of block 4, Dirk only two days (so clicking visibly changes the preview).
//        Change 26.10.: first names instead of cover names; Artur's 8 days are also fixed (markt_fest), as in the SQL.
//
// Demo links: ?demo=1&h=demo-dirk | demo-jens | demo-canan | demo-artur, admin ?demo=1&a=demo,
// expired deadline: add &frist=abgelaufen. Reset: button in the demo bar (removes localStorage "markt_demo").

export const DEMO_ADMIN = 'demo';

export function demoStartdaten() {
  const helfer = [
    { id: 'demo-a', name: 'Artur', farbe: '#9f1239', sortierung: 1, code: 'demo-artur' },
    { id: 'demo-c', name: 'Canan', farbe: '#c2410c', sortierung: 2, code: 'demo-canan' },
    { id: 'demo-d', name: 'Dirk', farbe: '#2e7d4f', sortierung: 3, code: 'demo-dirk' },
    { id: 'demo-j', name: 'Jens', farbe: '#b7850f', sortierung: 4, code: 'demo-jens' },
  ];
  const v = [];
  const add = (id, status, tage) => tage.forEach((d) => v.push({ helfer_id: id, datum: d, status }));
  add('demo-a', 'kann', ['2026-12-03', '2026-12-04', '2026-12-05', '2026-12-06',
    '2026-12-10', '2026-12-11', '2026-12-12', '2026-12-13']);
  add('demo-j', 'kann', ['2026-11-26', '2026-11-27', '2026-11-28', '2026-11-29', '2026-12-02', '2026-12-09',
    '2026-12-17', '2026-12-18', '2026-12-19', '2026-12-20', '2026-12-21']);
  add('demo-j', 'kann_nicht', ['2026-12-05', '2026-12-06']);
  add('demo-c', 'kann', ['2026-11-28', '2026-11-29', '2026-12-10', '2026-12-11', '2026-12-12', '2026-12-13',
    '2026-12-19', '2026-12-20', '2026-12-16']);
  add('demo-c', 'kann_nicht', ['2026-11-26', '2026-12-17']);
  add('demo-d', 'kann', ['2026-11-27', '2026-12-18']);
  // Artur is already fixed for blocks 2 and 3 (Julian, 26.10.)
  const fest = v.filter((x) => x.helfer_id === 'demo-a').map((x) => ({ datum: x.datum, helfer_id: 'demo-a' }));
  return {
    helfer,
    verfuegbarkeit: v,
    fest,
    einstellungen: {
      start: '2026-11-26',
      ende: '2026-12-21',
      frist: '2026-11-15T22:59:59Z', // 15.11.2026 23:59:59 Berlin (CET)
      optionale_tage_besetzen: false,
      folgetag_vermeiden: true,
    },
  };
}

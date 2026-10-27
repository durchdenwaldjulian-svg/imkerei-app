// planer.js – pure planning functions for the Markt-Planer (no DOM, no network)
// Version 0.1.1 (2026-10-26, markt-dev)
//
// Changelog
// 0.1.1  QA M1: open blocks are assigned as a whole (exhaustive search over all combinations, at most 4^4) instead of
//        block by block (greedy). Ranking: (1) most complete blocks, (2) most different helpers with a block,
//        (3) smallest spread (max − min units), (4) deterministic tie-break (blocks scarcest first, then chronologically;
//        per block candidate with fewer fully available blocks, sortierung, name, id). New: plan.hinweise (QA H3: one
//        person has several blocks), block.durchFest (QA N1: block split by a fixed day).
// 0.1.0  First version: calendar helpers (tagPlus via Date.UTC only), istPflicht (Thu–Sun or one of the
//        last 3 market days), deterministic fair assignment planen(), plan comparison for the admin hint.
//        Change 26.10. (Julian): planning unit is the BLOCK (consecutive mandatory days, Thu–Sun; the last
//        block includes Mon 21.12.), one helper per block; per-day fallback ("geteilt") only if nobody can
//        the whole block; optional Mon–Wed days stay single days.
//
// Dates are ISO strings "YYYY-MM-DD" everywhere. Weekday numbering follows Date#getUTCDay (0 = Sunday).

/** Adds n days to an ISO date. Uses Date.UTC only, so no local time zone / DST can shift the result. */
export function tagPlus(iso, n) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

/** Weekday of an ISO date, 0 = Sunday … 6 = Saturday. */
export function wochentag(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** All days from start to ende (inclusive) as ISO strings. */
export function tageImZeitraum(start, ende) {
  const tage = [];
  for (let t = start; t <= ende && tage.length < 400; t = tagPlus(t, 1)) tage.push(t);
  return tage;
}

/** Mandatory day: Thursday to Sunday, or one of the last three market days. */
export function istPflicht(datum, ende) {
  const wd = wochentag(datum);
  if (wd === 4 || wd === 5 || wd === 6 || wd === 0) return true;
  return datum >= tagPlus(ende, -2) && datum <= ende;
}

/** Blocks = maximal runs of consecutive mandatory days (26.–29.11., 3.–6.12., 10.–13.12., 17.–21.12.). */
export function bloeckeBilden(tage, pflicht) {
  const pf = pflicht instanceof Set ? pflicht : new Set(pflicht || []);
  const bloecke = [];
  let aktuell = null;
  for (const t of tage) {
    if (!pf.has(t)) { aktuell = null; continue; }
    if (aktuell && aktuell[aktuell.length - 1] === tagPlus(t, -1)) aktuell.push(t);
    else { aktuell = [t]; bloecke.push(aktuell); }
  }
  return bloecke;
}

function vergleiche(a, b) {
  for (let i = 0; i < a.length; i++) {
    if (a[i] < b[i]) return -1;
    if (a[i] > b[i]) return 1;
  }
  return 0;
}

const EINHEIT_BLOCK = 1;
const EINHEIT_TAG = 0.25;

/**
 * Deterministic, fair assignment: one helper per block, optional single days if enabled.
 *
 * @param {object}   p
 * @param {string[]} p.tage               all market days (ISO)
 * @param {Set<string>|string[]} p.pflicht mandatory days
 * @param {{helfer_id:string, datum:string, status:'kann'|'kann_nicht'}[]} p.verfuegbar
 * @param {{datum:string, helfer_id:string}[]} p.fest   manual assignments per day (admin / frozen plan)
 * @param {{id:string, name:string, sortierung:number}[]} p.helfer
 * @param {boolean}  p.optionaleBesetzen  also fill optional (Mon–Wed) days
 * @param {boolean}  p.folgetagVermeiden  optional single days only: avoid the same helper on a neighbouring day
 * @returns {{
 *   zuteilung: Map<string,{helferId:string|null, quelle:'fest'|'auto'|'unbesetzt', warnung:string|null, block:number|null, geteilt:boolean}>,
 *   anzahl: Map<string,number>,      // assigned days per helper
 *   einheiten: Map<string,number>,   // fairness units per helper (block = 1, single day = 0.25)
 *   bloecke: {nr:number, tage:string[], helferId:string|null, art:'auto'|'fest'|'geteilt', kandidaten:string[]}[]
 * }}
 *
 * Algorithm (docs/PLAN.md, "Änderung 26.10."):
 *  1. Manual day assignments first (without "kann" -> warning "fest ohne Verfügbarkeit").
 *  2. Blocks containing fixed days: if all fixed days belong to one helper and he "kann" on every remaining day of the
 *     block, the whole block goes to him; otherwise the block is "geteilt".
 *  3. Other blocks: candidate = helper who "kann" on ALL days of the block. No candidate -> "geteilt". The blocks with
 *     candidates are assigned TOGETHER: every combination is tried (≤ 4^4) and the best wins by
 *     (1) most complete blocks, (2) most different helpers with at least one block (fixed blocks count),
 *     (3) smallest difference between most and fewest units per helper, (4) first combination in the order
 *     "blocks scarcest first, then chronologically; per block candidates by [fully available blocks, sortierung,
 *     name, id]".
 *  4. "geteilt" blocks per day: scarcest days first, then chronologically; key [units, available days in total,
 *     sortierung, name] (no neighbour rule – consecutive days are fine in a block). No candidate -> "unbesetzt".
 *  5. Optional single days (only if optionaleBesetzen): same order; key [neighbour (if folgetagVermeiden), units,
 *     available days, sortierung, name].
 */
export function planen({ tage, pflicht, verfuegbar = [], fest = [], helfer = [], optionaleBesetzen = false, folgetagVermeiden = true }) {
  const pflichtSet = pflicht instanceof Set ? pflicht : new Set(pflicht || []);
  const tagSet = new Set(tage);
  const helferNachId = new Map(helfer.map((h) => [h.id, h]));
  const basis = (id) => [Number(helferNachId.get(id).sortierung) || 0, String(helferNachId.get(id).name), String(id)];

  const kann = new Map(); // datum -> Set(helferId)
  const kannTage = new Map(helfer.map((h) => [h.id, 0]));
  for (const v of verfuegbar) {
    if (v.status !== 'kann' || !tagSet.has(v.datum) || !helferNachId.has(v.helfer_id)) continue;
    if (!kann.has(v.datum)) kann.set(v.datum, new Set());
    const s = kann.get(v.datum);
    if (!s.has(v.helfer_id)) { s.add(v.helfer_id); kannTage.set(v.helfer_id, kannTage.get(v.helfer_id) + 1); }
  }
  const kannAm = (t, id) => kann.get(t)?.has(id) ?? false;

  const bloecke = bloeckeBilden(tage, pflichtSet).map((bt, i) => ({
    nr: i + 1, tage: bt, helferId: null, art: 'auto', durchFest: false,
    kandidaten: helfer.map((h) => h.id).filter((id) => bt.every((t) => kannAm(t, id))).sort(),
  }));
  const blockVon = new Map();
  for (const b of bloecke) for (const t of b.tage) blockVon.set(t, b.nr);
  const volleBloecke = new Map(helfer.map((h) => [h.id, bloecke.filter((b) => b.kandidaten.includes(h.id)).length]));

  const zuteilung = new Map();
  const einheiten = new Map(helfer.map((h) => [h.id, 0]));
  const plus = (id, n) => einheiten.set(id, einheiten.get(id) + n);
  const setze = (t, helferId, quelle, warnung = null) =>
    zuteilung.set(t, { helferId, quelle, warnung, block: blockVon.get(t) ?? null, geteilt: false });

  // 1. manual day assignments
  for (const f of fest) {
    if (!tagSet.has(f.datum) || !helferNachId.has(f.helfer_id) || zuteilung.has(f.datum)) continue;
    setze(f.datum, f.helfer_id, 'fest', kannAm(f.datum, f.helfer_id) ? null : 'fest ohne Verfügbarkeit');
  }

  // 2. blocks with fixed days
  const geteilt = [];
  const offen = [];
  for (const b of bloecke) {
    const festTage = b.tage.filter((t) => zuteilung.has(t));
    if (!festTage.length) { offen.push(b); continue; }
    const ids = new Set(festTage.map((t) => zuteilung.get(t).helferId));
    const rest = b.tage.filter((t) => !zuteilung.has(t));
    const h = ids.size === 1 ? [...ids][0] : null;
    if (h && rest.every((t) => kannAm(t, h))) {
      b.helferId = h;
      b.art = rest.length ? 'auto' : 'fest';
      for (const t of rest) setze(t, h, 'auto');
      plus(h, EINHEIT_BLOCK);
    } else {
      b.art = 'geteilt';
      b.durchFest = true;
      for (const t of festTage) plus(zuteilung.get(t).helferId, EINHEIT_TAG);
      geteilt.push(b);
    }
  }
  // fixed optional days count as single days
  for (const [t, z] of zuteilung) if (!blockVon.has(t)) plus(z.helferId, EINHEIT_TAG);

  // 3. remaining blocks as a whole: exhaustive search (QA M1)
  for (const b of offen) if (!b.kandidaten.length) { b.art = 'geteilt'; geteilt.push(b); }
  const waehlbar = offen.filter((b) => b.kandidaten.length)
    .sort((a, b) => a.kandidaten.length - b.kandidaten.length || a.nr - b.nr); // tie-break order
  if (waehlbar.length) {
    const ids = helfer.map((h) => h.id);
    const optionen = waehlbar.map((b) => [...b.kandidaten]
      .sort((x, y) => vergleiche([volleBloecke.get(x), ...basis(x)], [volleBloecke.get(y), ...basis(y)])));
    const schonBlock = new Set(bloecke.filter((b) => b.helferId).map((b) => b.helferId));
    const basisEinheiten = ids.map((id) => einheiten.get(id));
    const idx = new Map(ids.map((id, i) => [id, i]));
    let bestWahl = null;
    let bestWert = null;
    const wahl = new Array(waehlbar.length);
    const bewerte = () => {
      const e = basisEinheiten.slice();
      const mit = new Set(schonBlock);
      for (const id of wahl) { e[idx.get(id)] += EINHEIT_BLOCK; mit.add(id); }
      // all chosen blocks are complete, so criterion (1) is equal for every combination here
      return [-mit.size, Math.max(...e) - Math.min(...e)];
    };
    const suche = (i) => {
      if (i === waehlbar.length) {
        const wert = bewerte();
        if (!bestWert || vergleiche(wert, bestWert) < 0) { bestWert = wert; bestWahl = wahl.slice(); }
        return;
      }
      for (const id of optionen[i]) { wahl[i] = id; suche(i + 1); }
    };
    suche(0);
    waehlbar.forEach((b, i) => {
      b.helferId = bestWahl[i];
      b.art = 'auto';
      for (const t of b.tage) setze(t, b.helferId, 'auto');
      plus(b.helferId, EINHEIT_BLOCK);
    });
  }

  // 4. split blocks per day; 5. optional single days
  const tagesweise = (liste, nachbarRegel) => {
    const sortiert = liste
      .map((t) => ({ t, n: kann.get(t)?.size ?? 0 }))
      .sort((a, b) => a.n - b.n || (a.t < b.t ? -1 : a.t > b.t ? 1 : 0));
    for (const { t } of sortiert) {
      let best = null;
      let bestKey = null;
      for (const id of kann.get(t) ?? []) {
        const nachbar = nachbarRegel
          && (zuteilung.get(tagPlus(t, -1))?.helferId === id || zuteilung.get(tagPlus(t, 1))?.helferId === id) ? 1 : 0;
        const key = [nachbar, einheiten.get(id), kannTage.get(id), ...basis(id)];
        if (!bestKey || vergleiche(key, bestKey) < 0) { best = id; bestKey = key; }
      }
      if (best === null) setze(t, null, 'unbesetzt', pflichtSet.has(t) ? 'Pflichttag unbesetzt' : null);
      else { setze(t, best, 'auto'); plus(best, EINHEIT_TAG); }
    }
  };
  geteilt.sort((a, b) => a.nr - b.nr);
  tagesweise(geteilt.flatMap((b) => b.tage.filter((t) => !zuteilung.has(t))), false);
  for (const b of geteilt) for (const t of b.tage) zuteilung.get(t).geteilt = true;
  if (optionaleBesetzen) tagesweise(tage.filter((t) => !pflichtSet.has(t) && !zuteilung.has(t)), folgetagVermeiden);

  const anzahl = new Map(helfer.map((h) => [h.id, 0]));
  for (const z of zuteilung.values()) if (z.helferId) anzahl.set(z.helferId, anzahl.get(z.helferId) + 1);

  // QA H3: hint when one person has several blocks that were not all fixed by the admin
  const hinweise = [];
  for (const h of [...helfer].sort((x, y) => vergleiche(basis(x.id), basis(y.id)))) {
    const seine = bloecke.filter((b) => b.helferId === h.id);
    if (seine.length >= 2 && seine.some((b) => b.art !== 'fest')) {
      hinweise.push({ art: 'mehrere_bloecke', helferId: h.id, anzahl: seine.length });
    }
  }

  return { zuteilung, anzahl, einheiten, bloecke, hinweise };
}

/** Days whose assigned helper differs between two plans (sorted ISO list). */
export function unterschiede(planA, planB) {
  const tage = new Set([...planA.zuteilung.keys(), ...planB.zuteilung.keys()]);
  const diff = [];
  for (const t of tage) {
    const a = planA.zuteilung.get(t)?.helferId ?? null;
    const b = planB.zuteilung.get(t)?.helferId ?? null;
    if (a !== b) diff.push(t);
  }
  return diff.sort();
}

/**
 * How many OTHER days would change if the admin fixed `helferId` (or null = remove the fixing) on the given day(s).
 * `datum` is one ISO day or a list (a whole block). `eingabe` is the same object passed to planen().
 */
export function folgeAenderungen(eingabe, datum, helferId) {
  const liste = Array.isArray(datum) ? datum : [datum];
  const vorher = planen(eingabe);
  const festNeu = eingabe.fest.filter((f) => !liste.includes(f.datum));
  if (helferId) for (const t of liste) festNeu.push({ datum: t, helfer_id: helferId });
  const nachher = planen({ ...eingabe, fest: festNeu });
  return unterschiede(vorher, nachher).filter((t) => !liste.includes(t)).length;
}

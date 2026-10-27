// app.js – Markt-Planer page logic: URL parameters, loading, planning, rendering, clicks, admin area
// Version 0.1.1 (2026-10-26, markt-dev)
//
// Changelog
// 0.1.1  QA N1: fixing a single day inside a block warns "Block n wird dadurch geteilt" and offers "stattdessen ganzen
//        Block an … vergeben"; block header of a block split by a fixed day shows a warning. QA H2: optional days
//        with the option on say "niemand kann", no duplicated aria text. QA H3: hint when one person has several
//        blocks. QA H4: candidate names ordered by sortierung. QA H6: version parameter on all module imports.
//        QA H8: desktop continuation header above Mon 21.12. ("Block 4 · Fortsetzung").
// 0.1.0  First version. Helper link ?h=<code> (status cycle: none -> kann -> kann nicht -> none, busy lock,
//        optimistic update with rollback, reload afterwards), admin link ?a=<code> (dropdown per tile with
//        "n further days would change" hint, deadline date, switches, freeze plan, helper links with copy button),
//        view-only without code, deadline countdown in Berlin time (server flag frist_abgelaufen decides),
//        error banners, demo mode ?demo=1 (&h=demo-dirk, &a=demo, &frist=abgelaufen).
//        Change 26.10. (Julian): blocks (Thu–Sun, last block until Mon 21.12.) shown as a group with a block header
//        (assigned helper large, "geteilt"/"unbesetzt"), admin "Block fest an …"; first names instead of cover names.
//
// Rules: codes never go into the DOM (except the admin link list) and never into the console. All texts from the
// database are inserted with textContent. No network calls other than through api.js.

import { erstelleApi } from './api.js?v=0.1.1';
import { tageImZeitraum, istPflicht, wochentag, tagPlus, planen, folgeAenderungen } from './planer.js?v=0.1.1';

const VERSION = '0.1.1';
const params = new URLSearchParams(location.search);
const DEMO = params.get('demo') === '1';
const HCODE = (params.get('h') || '').trim() || null;
const ACODE = (params.get('a') || '').trim() || null;
const api = erstelleApi({ demo: DEMO, fristAbgelaufen: DEMO && params.get('frist') === 'abgelaufen' });

const WT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const WT_LANG = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const MON = ['Jan', 'Feb', 'März', 'Apr', 'Mai', 'Juni', 'Juli', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

const z = {
  daten: null,        // {helfer, verfuegbarkeit, fest, einstellungen}
  ich: null,          // {id, name}
  ichFehler: null,
  admin: false,
  adminHelfer: [],    // [{id, name, code, sortierung}] – only for the link list
  adminFehler: null,
  ladeFehler: null,
  aktionsFehler: null,
  hinweis: null,
  busy: false,
  speichertTag: null,
};

// ---------------------------------------------------------------------------------------------------------
// small DOM helper
// ---------------------------------------------------------------------------------------------------------
function el(tag, attrs = {}, ...kinder) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k === 'text') e.textContent = v;
    else if (k === 'style') e.setAttribute('style', v);
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (v === true) e.setAttribute(k, '');
    else e.setAttribute(k, String(v));
  }
  for (const k of kinder.flat()) if (k !== null && k !== undefined && k !== false) e.append(k instanceof Node ? k : String(k));
  return e;
}

const SVGNS = 'http://www.w3.org/2000/svg';
function icon(name) {
  const pfade = {
    schloss: 'M7 10V7a5 5 0 0 1 10 0v3h1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h1Zm2 0h6V7a3 3 0 0 0-6 0v3Z',
    warnung: 'M12 2 1 21h22L12 2Zm0 6 1 7h-2l1-7Zm0 9.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z',
    mond: 'M20 15.5A8.5 8.5 0 0 1 8.5 4a8.5 8.5 0 1 0 11.5 11.5Z',
    info: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15h-2v-6h2v6Zm0-8h-2V7h2v2Z',
    uhr: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 10.6 3.5 2-1 1.7L11 13V6h2v6.6Z',
  };
  const s = document.createElementNS(SVGNS, 'svg');
  s.setAttribute('viewBox', '0 0 24 24');
  s.setAttribute('aria-hidden', 'true');
  s.setAttribute('class', 'symbol');
  const p = document.createElementNS(SVGNS, 'path');
  p.setAttribute('d', pfade[name]);
  p.setAttribute('fill', 'currentColor');
  s.append(p);
  return s;
}

// ---------------------------------------------------------------------------------------------------------
// formatting
// ---------------------------------------------------------------------------------------------------------
function teile(iso) { const [y, m, d] = iso.split('-').map(Number); return { y, m, d }; }
function kurzDatum(iso) { const { m, d } = teile(iso); return `${WT[wochentag(iso)]} ${d}.${m}.`; }
function langDatum(iso) { const { m, d } = teile(iso); return `${WT_LANG[wochentag(iso)]}, ${d}.${m}.`; }

const berlinFmt = new Intl.DateTimeFormat('de-DE', {
  timeZone: 'Europe/Berlin', weekday: 'short', day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
});
const berlinTag = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' });

function countdownText(fristIso) {
  const ms = Date.parse(fristIso) - Date.now();
  if (!(ms > 0)) return 'Frist läuft ab …';
  const tage = Math.floor(ms / 86400000);
  const std = Math.floor(ms / 3600000) % 24;
  const min = Math.floor(ms / 60000) % 60;
  if (tage > 0) return `noch ${tage} ${tage === 1 ? 'Tag' : 'Tage'} ${std} Std.`;
  return `noch ${std} Std. ${min} Min.`;
}

const initiale = (name) => (Array.from(String(name || '?').trim())[0] || '?').toUpperCase();

// ---------------------------------------------------------------------------------------------------------
// derived data
// ---------------------------------------------------------------------------------------------------------
function berechne() {
  const d = z.daten;
  const e = d.einstellungen;
  const tage = tageImZeitraum(e.start, e.ende);
  const pflicht = new Set(tage.filter((t) => istPflicht(t, e.ende)));
  const eingabe = {
    tage, pflicht, verfuegbar: d.verfuegbarkeit, fest: d.fest, helfer: d.helfer,
    optionaleBesetzen: !!e.optionale_tage_besetzen, folgetagVermeiden: !!e.folgetag_vermeiden,
  };
  const plan = planen(eingabe);
  const helferNachId = new Map(d.helfer.map((h) => [h.id, h]));
  const kannAm = new Map(); // datum -> [helfer]
  for (const v of d.verfuegbarkeit) {
    if (v.status !== 'kann' || !helferNachId.has(v.helfer_id)) continue;
    if (!kannAm.has(v.datum)) kannAm.set(v.datum, []);
    kannAm.get(v.datum).push(helferNachId.get(v.helfer_id));
  }
  for (const liste of kannAm.values()) liste.sort((a, b) => a.sortierung - b.sortierung || (a.name < b.name ? -1 : 1));
  const meinStatus = new Map();
  if (z.ich) for (const v of d.verfuegbarkeit) if (v.helfer_id === z.ich.id) meinStatus.set(v.datum, v.status);
  const blockNachNr = new Map(plan.bloecke.map((bl) => [bl.nr, bl]));
  return { e, tage, pflicht, eingabe, plan, helferNachId, kannAm, meinStatus, blockNachNr };
}

function spanne(tage) {
  const a = teile(tage[0]);
  const z2 = teile(tage[tage.length - 1]);
  return a.m === z2.m ? `${a.d}.–${z2.d}.${z2.m}.` : `${a.d}.${a.m}.–${z2.d}.${z2.m}.`;
}

function blockTitel(bl) {
  return `Block ${bl.nr} · ${WT[wochentag(bl.tage[0])]}–${WT[wochentag(bl.tage[bl.tage.length - 1])]} · ${spanne(bl.tage)}`;
}

const fristVorbei = () => !!z.daten?.einstellungen?.frist_abgelaufen;
const darfKlicken = () => !!z.ich && !fristVorbei() && !z.admin;

// ---------------------------------------------------------------------------------------------------------
// rendering
// ---------------------------------------------------------------------------------------------------------
function render() {
  document.getElementById('version').textContent = 'v' + VERSION;
  document.body.classList.toggle('busy', z.busy);
  renderDemo();
  renderBanner();
  if (!z.daten) {
    renderKopf(null);
    document.getElementById('ich').hidden = true;
    document.getElementById('legende').hidden = true;
    document.getElementById('zusammenfassung').hidden = true;
    document.getElementById('admin').hidden = true;
    const k = document.getElementById('kalender');
    k.replaceChildren(el('div', { class: 'lade', text: z.ladeFehler ? 'Plan konnte nicht geladen werden.' : 'Plan wird geladen …' }));
    return;
  }
  const b = berechne();
  renderKopf(b);
  renderIch(b);
  renderLegende();
  renderKalender(b);
  renderZusammenfassung(b);
  renderAdmin(b);
}

function renderDemo() {
  const leiste = document.getElementById('demo-leiste');
  if (!DEMO) { leiste.hidden = true; return; }
  leiste.hidden = false;
  leiste.replaceChildren(
    el('strong', { text: 'Demo-Modus' }),
    ' – Beispieldaten, gespeichert nur in diesem Browser.',
    el('button', {
      class: 'knopf zweitrangig klein', type: 'button', text: 'Zurücksetzen',
      onclick: async () => { try { localStorage.removeItem('markt_demo'); } catch { /* ignore */ } location.reload(); },
    }),
  );
}

function renderKopf(b) {
  const status = document.getElementById('kopf-status');
  const zr = document.getElementById('zeitraum');
  if (!b) { status.replaceChildren(); return; }
  zr.textContent = `${kurzDatum(b.e.start)} – ${kurzDatum(b.e.ende)}${teile(b.e.ende).y} · ${b.tage.length} Tage, ${b.pflicht.size} davon fest besetzt`;
  const fristText = berlinFmt.format(new Date(b.e.frist)) + ' Uhr';
  if (fristVorbei()) {
    status.replaceChildren(
      el('span', { class: 'pille steht' }, icon('schloss'), 'Plan steht'),
      el('span', { class: 'pille' }, el('small', { text: 'Frist war ' + fristText })),
    );
  } else {
    status.replaceChildren(
      el('span', { class: 'pille vorschau' }, el('span', { class: 'punkt-live' }), 'Vorschau', el('small', { text: '– ändert sich bis zur Frist' })),
      el('span', { class: 'pille', title: 'Berliner Zeit' }, icon('uhr'), el('span', { id: 'countdown', text: countdownText(b.e.frist) }),
        el('small', { text: '· Frist ' + fristText })),
    );
  }
}

function renderBanner() {
  const bereich = document.getElementById('banner');
  const liste = [];
  const banner = (art, titel, text, extra) => el('div', { class: 'banner ' + art, role: art === 'fehler' ? 'alert' : 'status' },
    icon(art === 'schlaf' ? 'mond' : art === 'fehler' ? 'warnung' : 'info'),
    el('div', { class: 'b-text' }, el('strong', { text: titel }), el('span', { text }), extra || null));

  const f = z.ladeFehler;
  if (f) {
    const art = f.art === 'schlaeft' ? 'schlaf' : 'fehler';
    const titel = { schlaeft: 'Datenbank schläft', config: 'Noch nicht eingerichtet', schluessel: 'Schlüssel falsch', setup: 'Datenbank nicht vorbereitet' }[f.art] || 'Fehler beim Laden';
    liste.push(banner(art, titel, f.message, el('div', { style: 'margin-top:8px' },
      el('button', { class: 'knopf klein', type: 'button', text: 'Nochmal versuchen', onclick: () => start() }))));
  }
  if (z.ichFehler) {
    liste.push(z.ichFehler.art === 'link'
      ? banner('info', 'Link ungültig', z.ichFehler.message)
      : banner(z.ichFehler.art === 'schlaeft' ? 'schlaf' : 'fehler', 'Anmeldung nicht möglich', z.ichFehler.message));
  }
  if (z.adminFehler) liste.push(banner('fehler', 'Admin-Link ungültig', z.adminFehler.message));
  if (z.daten && fristVorbei() && (z.ich || HCODE)) {
    liste.push(banner('info', 'Frist vorbei – der Plan steht', 'Eintragen ist nicht mehr möglich. Änderungen bitte direkt mit Julian absprechen.'));
  }
  if (z.aktionsFehler) {
    const a = z.aktionsFehler;
    liste.push(banner(a.art === 'schlaeft' ? 'schlaf' : 'fehler', a.art === 'frist' ? 'Frist vorbei' : 'Nicht gespeichert', a.message,
      el('div', { style: 'margin-top:8px' }, el('button', {
        class: 'knopf zweitrangig klein', type: 'button', text: 'Ausblenden',
        onclick: () => { z.aktionsFehler = null; render(); },
      }))));
  }
  if (z.hinweis) liste.push(banner('info', z.hinweis.titel, z.hinweis.text));
  bereich.replaceChildren(...liste);
}

function renderIch(b) {
  const box = document.getElementById('ich');
  box.hidden = false;
  if (z.admin) {
    box.className = 'karte ich';
    box.replaceChildren(
      el('div', { class: 'wer' }, el('div', { class: 'avatar', style: '--f: var(--tanne-2)', text: 'J' }),
        el('div', {}, el('div', { class: 'du', text: 'Admin-Ansicht' }), el('div', { class: 'name', text: 'Julian' }))),
      el('p', { class: 'tipp', text: 'Ganze Blöcke über „Block fest an …“ im Blockkopf, einzelne Tage über das Auswahlfeld in jeder Kachel. Einstellungen, „Plan einfrieren“ und die Helfer-Links stehen unten.' }),
    );
    return;
  }
  if (!z.ich) {
    box.className = 'karte ich ansicht';
    box.replaceChildren(
      el('div', { class: 'wer' }, el('div', { class: 'avatar', text: '?' }),
        el('div', {}, el('div', { class: 'du', text: 'Nur Ansicht' }), el('div', { class: 'name', text: 'Gast' }))),
      el('p', { class: 'tipp', text: 'Eintragen kannst du nur über deinen persönlichen Link – den bekommst du von Julian per Nachricht.' }),
    );
    return;
  }
  const h = b.helferNachId.get(z.ich.id);
  let kann = 0;
  for (const [t, s] of b.meinStatus) if (s === 'kann' && b.tage.includes(t)) kann++;
  const eingeteilt = b.plan.anzahl.get(z.ich.id) || 0;
  const meineBloecke = b.plan.bloecke.filter((bl) => bl.helferId === z.ich.id);
  const komplett = b.plan.bloecke.filter((bl) => bl.kandidaten.includes(z.ich.id)).length;
  const planText = meineBloecke.length
    ? `${fristVorbei() ? '' : 'Vorschau: '}${meineBloecke.length > 1 ? (fristVorbei() ? 'Deine Blöcke' : 'deine Blöcke') : (fristVorbei() ? 'Dein Block' : 'dein Block')} ${meineBloecke.map((bl) => `${bl.nr} (${spanne(bl.tage)})`).join(' und ')}.`
    : eingeteilt ? `${fristVorbei() ? 'Du bist' : 'Vorschau: du bist'} an ${eingeteilt} einzelnen ${eingeteilt === 1 ? 'Tag' : 'Tagen'} eingeteilt.`
      : 'Noch kein Block für dich – trag alle Tage eines Blocks als „kann“ ein, dann kommst du zum Zug.';
  box.className = 'karte ich';
  box.replaceChildren(
    el('div', { class: 'wer' }, el('div', { class: 'avatar', style: `--f:${h?.farbe || 'var(--honig)'}`, text: initiale(z.ich.name) }),
      el('div', {}, el('div', { class: 'du', text: 'Du bist' }), el('div', { class: 'name', text: z.ich.name }))),
    el('div', { class: 'tipp' },
      el('div', { class: 'plan-satz', text: planText }),
      el('div', { text: fristVorbei()
        ? 'Die Frist ist vorbei. So sieht der Plan aus.'
        : 'Tippen auf einen Tag: kann → kann nicht → keine Angabe. Ein Block (Do–So) geht immer an eine Person am Stück.' })),
    el('div', { class: 'zahlen' },
      el('div', { class: 'zahl' }, el('b', { text: String(kann) }), el('span', { text: 'Tage „kann“' })),
      el('div', { class: 'zahl' }, el('b', { text: String(komplett) }), el('span', { text: 'Blöcke komplett' })),
      el('div', { class: 'zahl' }, el('b', { text: String(eingeteilt) }), el('span', { text: fristVorbei() ? 'Tage eingeteilt' : 'Tage (Vorschau)' }))),
  );
}

function renderLegende() {
  const l = document.getElementById('legende');
  l.hidden = false;
  const eintrag = (...k) => el('span', { class: 'eintrag' }, ...k);
  const demoF = 'var(--honig)';
  l.replaceChildren(
    eintrag(el('span', { class: 'badge pflicht', text: 'Block' }), 'Do–So (+ Mo 21.12.), eine Person am Stück'),
    eintrag(el('span', { class: 'badge optional', text: 'optional' }), 'Mo–Mi einzeln'),
    eintrag(el('span', { class: 'leg-geteilt' }), 'geteilt (keiner kann den ganzen Block)'),
    eintrag(el('span', { class: 'zug vorschau', style: `--f:${demoF};font-size:.75rem;padding:1px 8px` }, 'Name'), 'Vorschau'),
    eintrag(el('span', { class: 'zug', style: `--f:${demoF};font-size:.75rem;padding:1px 8px` }, iconKlein('schloss'), 'Name'), 'fest'),
    eintrag(el('span', { class: 'punkt', style: `--f:${demoF}`, text: 'A' }), 'kann'),
    eintrag(el('span', { class: 'leg-rot' }), 'unbesetzt'),
    ...(z.ich && !z.admin ? [
      eintrag(el('span', { class: 'leg-rahmen kann' }), 'du kannst'),
      eintrag(el('span', { class: 'leg-rahmen kannnicht' }), 'du kannst nicht'),
    ] : []),
  );
}

function iconKlein(name) { const s = icon(name); s.setAttribute('class', ''); return s; }

function renderKalender(b) {
  const k = document.getElementById('kalender');
  k.setAttribute('aria-busy', String(z.busy));
  const fokusTag = document.activeElement?.dataset?.datum || null;
  // Two orders for the same nodes: desktop (7-column calendar, block header row above the block's week row) and
  // mobile (2 columns, week title, block header directly before the block's first tile). CSS picks via `order`.
  const desk = [];
  const mob = [];
  const platz = () => el('div', { class: 'platzhalter', 'aria-hidden': 'true' });
  for (const n of [1, 2, 3, 4, 5, 6, 0]) desk.push(el('div', { class: 'wt-kopf', 'aria-hidden': 'true', text: WT[n] }));
  const spalte = (iso) => (wochentag(iso) + 6) % 7; // Monday = 0
  const tagSet = new Set(b.tage);
  const kopfVonBlock = new Map(b.plan.bloecke.map((bl) => [bl.tage[0], bl]));
  let montag = tagPlus(b.tage[0], -spalte(b.tage[0]));
  let woche = 0;
  while (montag <= b.tage[b.tage.length - 1]) {
    woche++;
    const wochenTage = [0, 1, 2, 3, 4, 5, 6].map((i) => tagPlus(montag, i));
    const drin = wochenTage.filter((t) => tagSet.has(t));
    mob.push(el('h3', { class: 'woche-titel', text: `Woche ${woche} · ${drin.length > 1 ? spanne(drin) : kurzDatum(drin[0])}` }));
    // desktop: block header row
    // blocks with days in this week: starting here (full header) or continuing from last week (QA H8: small header)
    const kopfNodes = new Map();
    const hier = b.plan.bloecke.filter((bl) => bl.tage.some((t) => wochenTage.includes(t)));
    let col = 0;
    for (const bl of hier) {
      const ersterHier = bl.tage.find((t) => wochenTage.includes(t));
      const s = spalte(ersterHier);
      if (s > col) desk.push(el('div', { class: 'block-luecke', 'aria-hidden': 'true', style: `--gc:${col + 1} / span ${s - col}` }));
      const breite = Math.min(bl.tage.filter((t) => wochenTage.includes(t)).length, 7 - s);
      const fortsetzung = ersterHier !== bl.tage[0];
      const node = blockKopf(b, bl, `${s + 1} / span ${breite}`, fortsetzung);
      if (!fortsetzung) kopfNodes.set(bl.tage[0], node);
      desk.push(node);
      col = s + breite;
    }
    if (col > 0 && col < 7) desk.push(el('div', { class: 'block-luecke', 'aria-hidden': 'true', style: `--gc:${col + 1} / span ${7 - col}` }));
    for (const t of wochenTage) {
      if (!tagSet.has(t)) { desk.push(platz()); continue; }
      const kachelNode = kachel(b, t);
      desk.push(kachelNode);
      if (kopfNodes.has(t)) mob.push(kopfNodes.get(t));
      mob.push(kachelNode);
    }
    montag = tagPlus(montag, 7);
  }
  const alle = new Set([...desk, ...mob]);
  for (const n of alle) {
    n.style.setProperty('--od', String(desk.indexOf(n) >= 0 ? desk.indexOf(n) : 9999));
    n.style.setProperty('--om', String(mob.indexOf(n) >= 0 ? mob.indexOf(n) : 9999));
  }
  k.replaceChildren(...alle);
  if (fokusTag) k.querySelector(`[data-datum="${fokusTag}"]`)?.focus();
}

function blockKopf(b, bl, gc, fortsetzung = false) {
  const h = bl.helferId ? b.helferNachId.get(bl.helferId) : null;
  const leer = bl.tage.every((t) => !b.plan.zuteilung.get(t)?.helferId);
  const klassen = ['block-kopf', bl.art === 'geteilt' ? (leer ? 'unbesetzt' : 'geteilt') : 'ganz'];
  if (fortsetzung) {
    // desktop only: a compact header that ties the continuation day(s) (Mon 21.12.) to their block
    klassen.push('fortsetzung');
    return el('div', {
      class: klassen.join(' '), 'aria-hidden': 'true',
      style: `--gc:${gc};--bf:${h ? h.farbe : 'var(--rand)'}`,
    }, el('span', { class: 'bk-titel', text: `Block ${bl.nr} · Fortsetzung` }),
    h ? el('span', { class: 'zug klein' + (bl.art === 'fest' || fristVorbei() ? '' : ' vorschau'), style: `--f:${h.farbe}` },
      el('span', { class: 'ini', text: initiale(h.name) }), el('span', { class: 'nm', text: h.name })) : null);
  }
  let haupt;
  let text;
  if (h) {
    const fest = bl.art === 'fest';
    haupt = el('span', { class: 'zug gross' + (fest || fristVorbei() ? '' : ' vorschau'), style: `--f:${h.farbe}` },
      el('span', { class: 'ini', text: initiale(h.name) }), el('span', { class: 'nm', text: h.name }), fest ? iconKlein('schloss') : null);
    text = `${h.name}${fest ? ' (fest)' : fristVorbei() ? '' : ' (Vorschau)'}`;
  } else if (leer) {
    haupt = el('span', { class: 'zug-rot' }, iconKlein('warnung'), 'unbesetzt');
    text = 'unbesetzt';
  } else {
    haupt = el('span', { class: 'geteilt-text', text: 'geteilt – tageweise' });
    text = 'geteilt, tageweise eingeteilt';
  }
  const kandidaten = bl.kandidaten.map((id) => b.helferNachId.get(id)).filter(Boolean)
    .sort((x, y) => x.sortierung - y.sortierung || (x.name < y.name ? -1 : 1)).map((x) => x.name); // QA H4
  const unter = kandidaten.length ? `ganzer Block möglich: ${kandidaten.join(', ')}` : 'niemand kann alle Tage';
  const kinder = [
    el('div', { class: 'bk-text' }, el('span', { class: 'bk-titel', text: blockTitel(bl) }), el('span', { class: 'bk-unter', text: unter }),
      bl.durchFest ? el('span', { class: 'bk-warnung' }, iconKlein('warnung'), 'durch eine Einzeltag-Festlegung geteilt') : null),
    el('div', { class: 'bk-zug' }, haupt),
  ];
  if (bl.durchFest) text += ', durch eine Einzeltag-Festlegung geteilt';
  if (z.admin) kinder.push(blockAuswahl(b, bl));
  return el('div', {
    class: klassen.join(' '), role: 'group', 'aria-label': `${blockTitel(bl)}: ${text}. ${unter}.`,
    style: `--gc:${gc};--bf:${h ? h.farbe : 'var(--rand)'}`,
  }, ...kinder);
}

function blockAuswahl(b, bl) {
  const festAlle = bl.tage.every((t) => b.plan.zuteilung.get(t)?.quelle === 'fest');
  const s = el('select', { 'aria-label': `Block ${bl.nr} fest vergeben`, disabled: z.busy },
    el('option', { value: '', text: 'Block fest an …' }),
    ...b.eingabe.helfer.slice().sort((x, y) => x.sortierung - y.sortierung).map((h) =>
      el('option', { value: h.id, text: h.name })),
    bl.tage.some((t) => b.plan.zuteilung.get(t)?.quelle === 'fest') ? el('option', { value: '-', text: 'Festlegungen im Block aufheben' }) : null);
  if (festAlle && bl.helferId) s.value = bl.helferId;
  s.addEventListener('change', () => adminBlock(bl, s.value === '-' ? null : s.value || undefined));
  return el('div', { class: 'bk-admin' }, s);
}

function kachel(b, t) {
  const pflicht = b.pflicht.has(t);
  const zug = b.plan.zuteilung.get(t) || null;
  const mein = b.meinStatus.get(t) || null;
  const kann = b.kannAm.get(t) || [];
  const { d, m } = teile(t);
  const klickbar = darfKlicken();

  const klassen = ['kachel', pflicht ? 'pflicht' : 'optional'];
  const bl = zug?.block ? b.blockNachNr.get(zug.block) : null;
  const blockHelfer = bl?.helferId ? b.helferNachId.get(bl.helferId) : null;
  if (bl) klassen.push('im-block', bl.art === 'geteilt' ? 'block-geteilt' : 'block-ganz');
  if (bl && t === bl.tage[0]) klassen.push('block-anfang');
  if (bl && t === bl.tage[bl.tage.length - 1]) klassen.push('block-ende');
  if (zug?.helferId) klassen.push('hat-zug');
  if (zug?.quelle === 'unbesetzt') klassen.push('unbesetzt');
  if (z.ich && !z.admin && mein === 'kann') klassen.push('ich-kann');
  if (z.ich && !z.admin && mein === 'kann_nicht') klassen.push('ich-kannnicht');
  if (z.speichertTag === t) klassen.push('speichert');

  // assigned helper
  let zugEl;
  let zugText;
  if (zug?.helferId) {
    const h = b.helferNachId.get(zug.helferId);
    const fest = zug.quelle === 'fest';
    zugEl = el('span', { class: 'zug' + (fest || fristVorbei() ? '' : ' vorschau') + (blockHelfer ? ' klein' : ''), style: `--f:${h.farbe}` },
      el('span', { class: 'ini', text: initiale(h.name) }), el('span', { class: 'nm', text: h.name }), fest ? iconKlein('schloss') : null);
    zugText = `eingeteilt: ${h.name}${fest ? ' (fest)' : ' (Vorschau)'}`;
  } else if (zug?.quelle === 'unbesetzt' && pflicht) {
    zugEl = el('span', { class: 'zug-rot' }, iconKlein('warnung'), 'unbesetzt');
    zugText = 'noch unbesetzt';
  } else if (zug?.quelle === 'unbesetzt') {
    // QA H2: optional day while "optionale Tage besetzen" is on, but nobody can
    zugEl = el('span', { class: 'zug-leer', text: 'niemand kann' });
    zugText = 'niemand kann';
  } else {
    zugEl = el('span', { class: 'zug-leer', text: pflicht ? 'offen' : 'nur bei Bedarf' });
    zugText = pflicht ? 'offen' : 'wird nicht verplant';
  }

  const punkte = kann.length
    ? kann.map((h) => el('span', { class: 'punkt', style: `--f:${h.farbe}`, title: h.name + ' kann', text: initiale(h.name) }))
    : [el('span', { class: 'keiner', text: 'noch niemand' })];

  const inhalt = [
    el('div', { class: 'k-kopf' },
      el('div', { class: 'k-datum' }, el('span', { class: 'wt', text: WT[wochentag(t)] }), el('span', { class: 'tag', text: String(d) }),
        el('span', { class: 'monat', text: MON[m - 1] })),
      el('span', { class: 'badge ' + (pflicht ? 'pflicht' : 'optional'), text: bl ? `Block ${bl.nr}` : pflicht ? 'Pflicht' : 'optional' })),
    el('div', { class: 'k-zug' }, zugEl),
    zug?.warnung && zug.quelle === 'fest' ? el('div', { class: 'warnung', text: zug.warnung }) : null,
    el('div', { class: 'k-punkte', 'aria-hidden': 'true' }, ...punkte),
  ];
  if (z.ich && !z.admin && mein) inhalt.push(el('span', { class: 'ich-marke', text: mein === 'kann' ? 'du kannst' : 'du nicht' }));

  const meinText = mein === 'kann' ? 'du kannst' : mein === 'kann_nicht' ? 'du kannst nicht' : 'keine Angabe von dir';
  const kannText = kann.length ? 'können: ' + kann.map((h) => h.name).join(', ') : 'noch niemand kann';
  const label = `${langDatum(t)}, ${bl ? `Block ${bl.nr}${bl.art === 'geteilt' ? ' (geteilt)' : ''}` : pflicht ? 'Pflichttag' : 'optionaler Tag'}, ${zugText}, ${kannText}`
    + (z.ich && !z.admin ? `, ${meinText}` : '');
  const style = `--bf:${blockHelfer ? blockHelfer.farbe : 'var(--rand)'}`;

  if (z.admin) {
    inhalt.push(adminAuswahl(b, t, zug));
    return el('div', { class: klassen.join(' '), role: 'group', 'aria-label': label, style }, ...inhalt);
  }
  if (klickbar) {
    return el('button', {
      class: klassen.join(' '), type: 'button', 'data-datum': t, 'aria-label': label + '. Tippen zum Ändern.',
      'aria-disabled': z.busy ? 'true' : null, onclick: () => klick(t), style,
    }, ...inhalt);
  }
  return el('div', { class: klassen.join(' '), role: 'group', 'aria-label': label, style }, ...inhalt);
}

function adminAuswahl(b, t, zug) {
  const festId = zug?.quelle === 'fest' ? zug.helferId : '';
  const s = el('select', { 'aria-label': `Festlegung für ${langDatum(t)}`, 'data-datum': t, disabled: z.busy },
    el('option', { value: '', text: zug?.quelle === 'fest' ? 'Festlegung aufheben' : 'automatisch' }),
    ...b.eingabe.helfer.slice().sort((x, y) => x.sortierung - y.sortierung).map((h) =>
      el('option', { value: h.id, selected: h.id === festId, text: 'fest: ' + h.name })));
  s.addEventListener('change', () => adminWahl(t, s.value || null));
  return el('div', { class: 'k-admin' }, s);
}

function renderZusammenfassung(b) {
  const box = document.getElementById('zusammenfassung');
  box.hidden = false;
  const max = Math.max(1, ...b.eingabe.helfer.map((h) => b.plan.einheiten.get(h.id) || 0));
  const karten = b.eingabe.helfer.slice().sort((x, y) => x.sortierung - y.sortierung).map((h) => {
    let kann = 0;
    for (const v of z.daten.verfuegbarkeit) if (v.helfer_id === h.id && v.status === 'kann' && b.tage.includes(v.datum)) kann++;
    let fest = 0;
    let n = 0;
    for (const zg of b.plan.zuteilung.values()) if (zg.helferId === h.id) { n++; if (zg.quelle === 'fest') fest++; }
    const bloecke = b.plan.bloecke.filter((bl) => bl.helferId === h.id);
    const blockText = bloecke.length ? bloecke.map((bl) => `Block ${bl.nr} (${spanne(bl.tage)})`).join(', ') : 'kein Block';
    const einzeln = n - bloecke.reduce((s, bl) => s + bl.tage.length, 0);
    return el('div', { class: 'zf-helfer' + (z.ich?.id === h.id ? ' bin-ich' : ''), style: `--f:${h.farbe}` },
      el('div', { class: 'avatar', text: initiale(h.name) }),
      el('div', { class: 'nm', text: h.name + (z.ich?.id === h.id ? ' (du)' : '') }),
      el('div', { class: 'det' }, el('b', { text: blockText }),
        el('br'), `${einzeln > 0 ? `+ ${einzeln} einzelne${einzeln === 1 ? 'r Tag' : ' Tage'} · ` : ''}${n} Tage gesamt${fest ? `, ${fest} fest` : ''} · kann an ${kann}`),
      el('div', { class: 'balken', 'aria-hidden': 'true' }, el('i', { style: `width:${Math.round(((b.plan.einheiten.get(h.id) || 0) / max) * 100)}%` })));
  });
  const offen = [...b.plan.zuteilung].filter(([t, zg]) => zg.quelle === 'unbesetzt' && b.pflicht.has(t)).map(([t]) => t).sort();
  const geteilt = b.plan.bloecke.filter((bl) => bl.art === 'geteilt');
  // QA H3: one person has several blocks (not all fixed by the admin)
  const mehrfach = b.plan.hinweise.filter((x) => x.art === 'mehrere_bloecke').map((x) =>
    el('p', { class: 'zf-hinweis' }, iconKlein('warnung'),
      `${b.helferNachId.get(x.helferId)?.name} hat ${x.anzahl} Blöcke – kein anderer kann ${x.anzahl === 2 ? 'den zweiten' : 'diese'} ganz.`
      + (z.admin ? ' Bitte prüfen oder einen Block fest vergeben.' : '')));
  box.replaceChildren(
    el('h2', { text: fristVorbei() ? 'Einteilung' : 'Einteilung (Vorschau)' }),
    ...mehrfach,
    el('div', { class: 'zf-liste' }, ...karten),
    el('p', { class: 'zf-fuss' },
      offen.length
        ? el('span', { class: 'rot', text: `${offen.length} Pflicht${offen.length === 1 ? 'tag' : 'tage'} noch unbesetzt: ${offen.map(kurzDatum).join(', ')}. ` })
        : 'Alle Pflichttage sind besetzt. ',
      geteilt.length ? `Geteilt (niemand kann den ganzen Block): ${geteilt.map((bl) => 'Block ' + bl.nr).join(', ')}.` : ''),
  );
}

function renderAdmin(b) {
  const box = document.getElementById('admin');
  if (!z.admin) { box.hidden = true; box.replaceChildren(); return; }
  box.hidden = false;
  const autoTage = [...b.plan.zuteilung].filter(([, zg]) => zg.quelle === 'auto' && zg.helferId);

  const fristInput = el('input', { type: 'date', id: 'frist-tag', value: berlinTag.format(new Date(b.e.frist)), 'aria-label': 'Frist (Tag)' });
  const einstellungen = el('div', { class: 'karte' },
    el('h3', { text: 'Einstellungen' }),
    el('div', { class: 'feld' }, el('label', { for: 'frist-tag', text: 'Frist bis' }), fristInput, el('span', { class: 'klein-text', text: '23:59 Uhr' }),
      el('button', { class: 'knopf klein', type: 'button', disabled: z.busy, text: 'Speichern',
        onclick: () => adminSpeichern({ fristTag: fristInput.value || null }, 'Frist gespeichert') })),
    el('label', { class: 'schalter' }, el('input', { type: 'checkbox', checked: !!b.e.optionale_tage_besetzen, disabled: z.busy,
      onchange: (ev) => adminSpeichern({ optionale: ev.target.checked }, 'Einstellung gespeichert') }), 'Optionale Tage (Mo–Mi) auch besetzen'),
    el('label', { class: 'schalter' }, el('input', { type: 'checkbox', checked: !!b.e.folgetag_vermeiden, disabled: z.busy,
      onchange: (ev) => adminSpeichern({ folgetag: ev.target.checked }, 'Einstellung gespeichert') }), 'Optionale Tage: nicht zwei hintereinander an dieselbe Person'),
    el('p', { class: 'klein-text', text: 'Blöcke (Do–So) gehen immer am Stück an eine Person; dieser Schalter betrifft nur Mo–Mi.' }),
  );

  const einfrieren = el('div', { class: 'karte' },
    el('h3', { text: 'Plan einfrieren' }),
    el('p', { class: 'klein-text', text: `Übernimmt alle ${autoTage.length} automatisch vergebenen Tage als feste Einteilung (Schloss). `
      + 'Danach ändert ein Eintrag oder eine Festlegung nur noch genau den einen Tag.' }),
    el('div', { style: 'margin-top:10px' }, el('button', { class: 'knopf honig', type: 'button', disabled: z.busy || autoTage.length === 0,
      text: autoTage.length ? `Plan einfrieren (${autoTage.length} Tage)` : 'Alles ist bereits fest',
      onclick: () => adminEinfrieren(autoTage) })),
  );

  const basis = location.origin + location.pathname;
  const links = el('div', { class: 'karte' },
    el('h3', { text: 'Helfer-Links' }),
    el('p', { class: 'klein-text', style: 'margin:0 0 10px', text: 'Jeden Link nur an die eine Person per Direktnachricht schicken – wer den Link hat, kann für diesen Namen eintragen.' }),
    el('div', { class: 'links' }, ...z.adminHelfer.map((h) => {
      const hf = b.helferNachId.get(h.id);
      const link = basis + '?' + (DEMO ? 'demo=1&' : '') + 'h=' + encodeURIComponent(h.code);
      const feld = el('input', { type: 'text', readonly: true, value: link, 'aria-label': 'Link für ' + h.name, onfocus: (ev) => ev.target.select() });
      const knopf = el('button', { class: 'knopf klein zweitrangig', type: 'button', text: 'Kopieren' });
      knopf.addEventListener('click', async () => {
        const ok = await kopieren(link, feld);
        knopf.textContent = ok ? 'Kopiert' : 'Bitte markieren';
        setTimeout(() => { knopf.textContent = 'Kopieren'; }, 1800);
      });
      return el('div', { class: 'link-zeile', style: `--f:${hf?.farbe || 'var(--honig)'}` },
        el('span', { class: 'avatar', text: initiale(h.name) }), el('span', { class: 'nm', text: h.name }), feld, knopf);
    })),
  );

  box.replaceChildren(
    el('div', { class: 'admin-kopf' }, el('h2', { text: 'Verwaltung', style: 'margin:0' }), el('span', { class: 'schild', text: 'nur Julian' })),
    el('div', { class: 'admin-raster' }, einstellungen, einfrieren),
    links,
  );
}

async function kopieren(text, feld) {
  try { await navigator.clipboard.writeText(text); return true; } catch { /* fall back */ }
  try { feld.focus(); feld.select(); return document.execCommand('copy'); } catch { return false; }
}

// ---------------------------------------------------------------------------------------------------------
// confirm dialog (in-page, no blocking browser dialog)
// ---------------------------------------------------------------------------------------------------------
// Resolves true ("ja"), 'extra' (optional third button) or false.
function frage(titel, text, jaText = 'Ja', extraText = null) {
  const dlg = document.getElementById('dialog');
  document.getElementById('dialog-titel').textContent = titel;
  document.getElementById('dialog-text').textContent = text;
  document.getElementById('dialog-ja').textContent = jaText;
  const extra = document.getElementById('dialog-extra');
  extra.hidden = !extraText;
  extra.textContent = extraText || '';
  return new Promise((resolve) => {
    dlg.addEventListener('close', () => resolve(dlg.returnValue === 'ja' ? true : dlg.returnValue === 'extra' ? 'extra' : false), { once: true });
    dlg.returnValue = '';
    dlg.showModal();
  });
}

// ---------------------------------------------------------------------------------------------------------
// actions
// ---------------------------------------------------------------------------------------------------------
async function neuLaden() {
  try {
    z.daten = await api.laden();
    z.ladeFehler = null;
  } catch (f) {
    if (!z.aktionsFehler) z.aktionsFehler = f;
  }
}

async function klick(datum) {
  if (z.busy || !darfKlicken()) return;
  z.busy = true;
  z.speichertTag = datum;
  z.aktionsFehler = null;
  z.hinweis = null;
  const d = z.daten;
  const vorher = d.verfuegbarkeit.slice();
  const alt = d.verfuegbarkeit.find((v) => v.helfer_id === z.ich.id && v.datum === datum)?.status ?? null;
  const neu = alt === null ? 'kann' : alt === 'kann' ? 'kann_nicht' : null;
  // optimistic update
  d.verfuegbarkeit = d.verfuegbarkeit.filter((v) => !(v.helfer_id === z.ich.id && v.datum === datum));
  if (neu) d.verfuegbarkeit.push({ helfer_id: z.ich.id, datum, status: neu });
  render();
  try {
    await api.setzen(HCODE, datum, neu);
  } catch (f) {
    d.verfuegbarkeit = vorher; // rollback
    z.aktionsFehler = f;
  }
  await neuLaden();
  z.busy = false;
  z.speichertTag = null;
  render();
}

async function adminAktion(fn, erfolg) {
  if (z.busy) return;
  z.busy = true;
  z.aktionsFehler = null;
  z.hinweis = null;
  render();
  try {
    await fn();
    if (erfolg) z.hinweis = { titel: 'Gespeichert', text: erfolg };
  } catch (f) {
    z.aktionsFehler = f;
  }
  await neuLaden();
  z.busy = false;
  render();
}

async function adminWahl(datum, helferId) {
  const b = berechne();
  const zug = b.plan.zuteilung.get(datum);
  const n = folgeAenderungen(b.eingabe, datum, helferId);
  const name = helferId ? b.helferNachId.get(helferId)?.name : null;
  const folgen = n === 0 ? 'Keine anderen Tage ändern sich.'
    : `${n} weitere${n === 1 ? 'r Tag würde' : ' Tage würden'} sich dadurch ändern.`;
  const titel = helferId ? `${name} am ${kurzDatum(datum)} fest eintragen?` : `Festlegung am ${kurzDatum(datum)} aufheben?`;
  let warn = helferId && !(b.kannAm.get(datum) || []).some((h) => h.id === helferId) ? `\n${name} hat für diesen Tag nicht „kann“ eingetragen.` : '';
  if (!helferId && zug?.quelle !== 'fest') { render(); return; }
  // QA N1: a single fixed day inside a block splits the block unless that person takes the whole block
  const bl = zug?.block ? b.blockNachNr.get(zug.block) : null;
  let extraText = null;
  if (bl && helferId) {
    const festNeu = b.eingabe.fest.filter((f) => f.datum !== datum).concat([{ datum, helfer_id: helferId }]);
    const nachher = planen({ ...b.eingabe, fest: festNeu }).bloecke.find((x) => x.nr === bl.nr);
    if (nachher.art === 'geteilt') {
      const fehlt = bl.tage.filter((t) => t !== datum && !(b.kannAm.get(t) || []).some((h) => h.id === helferId));
      warn += `\nAchtung: Damit wird Block ${bl.nr} (${spanne(bl.tage)}) geteilt`
        + (fehlt.length ? ` – ${name} kann nicht an ${fehlt.map(kurzDatum).join(', ')}` : '.');
      extraText = `Stattdessen ganzen Block ${bl.nr} an ${name}`;
    }
  }
  const ok = await frage(titel, folgen + warn, helferId ? 'Nur diesen Tag' : 'Aufheben', extraText);
  if (ok === 'extra') { await adminBlock(bl, helferId); return; }
  if (!ok) { render(); return; }
  await adminAktion(() => api.adminFest(ACODE, datum, helferId), helferId ? `${name} ist am ${kurzDatum(datum)} fest eingetragen.` : `Festlegung am ${kurzDatum(datum)} aufgehoben.`);
}

async function adminBlock(bl, helferId) {
  if (helferId === undefined) { render(); return; }
  const b = berechne();
  const n = folgeAenderungen(b.eingabe, bl.tage, helferId);
  const name = helferId ? b.helferNachId.get(helferId)?.name : null;
  const folgen = n === 0 ? 'Keine Tage außerhalb des Blocks ändern sich.'
    : `${n} weitere${n === 1 ? 'r Tag' : ' Tage'} außerhalb des Blocks ${n === 1 ? 'würde' : 'würden'} sich dadurch ändern.`;
  const fehlt = helferId ? bl.tage.filter((t) => !(b.kannAm.get(t) || []).some((h) => h.id === helferId)) : [];
  const warn = fehlt.length ? `\n${name} hat an ${fehlt.map(kurzDatum).join(', ')} nicht „kann“ eingetragen.` : '';
  const titel = helferId ? `Block ${bl.nr} (${spanne(bl.tage)}) fest an ${name}?` : `Festlegungen in Block ${bl.nr} aufheben?`;
  const ok = await frage(titel, folgen + warn, helferId ? 'Fest vergeben' : 'Aufheben');
  if (!ok) { render(); return; }
  const liste = bl.tage.map((datum) => ({ datum, helfer_id: helferId }));
  await adminAktion(() => api.adminFestBatch(ACODE, liste),
    helferId ? `Block ${bl.nr} ist fest an ${name} vergeben.` : `Festlegungen in Block ${bl.nr} aufgehoben.`);
}

async function adminEinfrieren(autoTage) {
  if (!autoTage.length) return;
  const ok = await frage('Plan einfrieren?',
    `${autoTage.length} automatisch vergebene Tage werden fest übernommen. Spätere Einträge der Helfer ändern diese Tage dann nicht mehr.`,
    'Einfrieren');
  if (!ok) return;
  const liste = autoTage.map(([datum, zg]) => ({ datum, helfer_id: zg.helferId }));
  await adminAktion(() => api.adminFestBatch(ACODE, liste), `${liste.length} Tage sind jetzt fest eingetragen.`);
}

function adminSpeichern(werte, erfolg) {
  return adminAktion(() => api.adminEinstellungen(ACODE, werte), erfolg);
}

// ---------------------------------------------------------------------------------------------------------
// start + countdown
// ---------------------------------------------------------------------------------------------------------
async function start() {
  z.ladeFehler = null;
  z.ichFehler = null;
  z.adminFehler = null;
  render();
  const [daten, ich, admin] = await Promise.allSettled([
    api.laden(),
    HCODE && !ACODE ? api.ich(HCODE) : Promise.resolve(null),
    ACODE ? api.adminHelfer(ACODE) : Promise.resolve(null),
  ]);
  if (daten.status === 'fulfilled') z.daten = daten.value; else { z.daten = null; z.ladeFehler = daten.reason; }
  if (ich.status === 'fulfilled') z.ich = ich.value; else if (z.daten) z.ichFehler = ich.reason;
  if (admin.status === 'fulfilled' && admin.value) { z.admin = true; z.adminHelfer = admin.value; }
  else if (admin.status === 'rejected' && z.daten) z.adminFehler = admin.reason;
  render();
}

let fristNeuGeladen = false;
setInterval(() => {
  const e = z.daten?.einstellungen;
  if (!e || e.frist_abgelaufen) return;
  const c = document.getElementById('countdown');
  if (c) c.textContent = countdownText(e.frist);
  if (Date.now() >= Date.parse(e.frist) && !fristNeuGeladen && !z.busy) {
    fristNeuGeladen = true; // the server flag decides; reload once to get it
    neuLaden().then(render);
  }
}, 30000);

start();

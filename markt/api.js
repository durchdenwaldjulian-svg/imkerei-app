// api.js – data access for the Markt-Planer: Supabase REST adapter (fetch) and demo adapter (?demo=1)
// Version 0.1.1 (2026-10-26, markt-dev)
//
// Changelog
// 0.1.1  QA H1: demo deadline compares the hour via formatToParts (summer dates were 1 h late); QA H5: timeout also
//        covers reading the response body; QA H6: version parameter on the config.js / demo-daten.js imports.
// 0.1.0  erstelleApi({demo, fristAbgelaufen}) with laden(), ich(), setzen(), adminFest(), adminFestBatch(),
//        adminEinstellungen(), adminHelfer(). Error translation (config missing, 401 key, PGRST202 function
//        missing, P0001 business messages, 5xx/TypeError/timeout = "database asleep"), AbortController 8 s,
//        cache 'no-store'. Demo adapter: localStorage "markt_demo", 300 ms latency.
//
//        Change 26.10.: first names (column "name") instead of cover names; adminFestBatch accepts helfer_id null
//        (= remove the fixing of that day, used for "Block-Festlegung aufheben").
//
// Security: codes are only passed in request bodies, never logged.

import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js?v=0.1.1';
import { demoStartdaten, DEMO_ADMIN } from './demo-daten.js?v=0.1.1';

/** Error with a category the UI can map to a banner. art: config|schluessel|setup|schlaeft|link|admin|frist|fach */
export class MarktFehler extends Error {
  constructor(art, text) {
    super(text);
    this.art = art;
  }
}

const TEXTE = {
  config: 'Die Seite ist noch nicht eingerichtet: In config.js fehlen Supabase-Adresse und Schlüssel.',
  schluessel: 'Der Schlüssel in config.js wird von Supabase nicht angenommen (anon/publishable key prüfen).',
  setup: 'Die Datenbank ist noch nicht vorbereitet: markt_setup.sql im Supabase-SQL-Editor ausführen.',
  schlaeft: 'Die Datenbank schläft – Julian muss sie im Supabase-Dashboard wecken.',
  link: 'Dieser persönliche Link ist ungültig – du kannst den Plan nur ansehen.',
  admin: 'Der Admin-Link ist ungültig.',
  frist: 'Die Frist ist vorbei – der Plan steht. Änderungen bitte direkt mit Julian absprechen.',
};

function fachFehler(meldung) {
  const m = String(meldung || '');
  if (m.startsWith('Admin-Link ungültig')) return new MarktFehler('admin', TEXTE.admin);
  if (m.startsWith('Link ungültig')) return new MarktFehler('link', TEXTE.link);
  if (m.startsWith('Frist abgelaufen')) return new MarktFehler('frist', TEXTE.frist);
  return new MarktFehler('fach', m || 'Unbekannter Fehler');
}

// ---------------------------------------------------------------------------------------------------------
// Supabase adapter
// ---------------------------------------------------------------------------------------------------------
function configFehlt() {
  return !SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL.includes('DEIN-PROJEKT')
    || SUPABASE_ANON_KEY === 'HIER-ANON-KEY' || !/^https:\/\//.test(SUPABASE_URL);
}

async function anfrage(pfad, { methode = 'GET', body } = {}) {
  if (configFehlt()) throw new MarktFehler('config', TEXTE.config);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  let res;
  let text = '';
  try {
    res = await fetch(SUPABASE_URL.replace(/\/+$/, '') + pfad, {
      method: methode,
      cache: 'no-store',
      signal: ctrl.signal,
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: 'Bearer ' + SUPABASE_ANON_KEY,
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    text = await res.text(); // QA H5: the 8 s timeout also covers reading the body
  } catch {
    // TypeError (network / CORS on a paused project) or AbortError (timeout)
    throw new MarktFehler('schlaeft', TEXTE.schlaeft);
  } finally {
    clearTimeout(timer);
  }

  let daten = null;
  try { daten = text ? JSON.parse(text) : null; } catch { daten = null; }

  if (res.ok) return daten;

  const code = daten && typeof daten === 'object' ? daten.code : undefined;
  const meldung = daten && typeof daten === 'object' ? daten.message : undefined;
  if (code === 'P0001') throw fachFehler(meldung);
  if (code === 'PGRST202' || code === 'PGRST205' || code === 'PGRST200' || code === '42P01' || code === '42883'
    || code === '42501') {
    throw new MarktFehler('setup', TEXTE.setup);
  }
  if (res.status === 401 || res.status === 403) throw new MarktFehler('schluessel', TEXTE.schluessel);
  if (res.status >= 500 || res.status === 0) throw new MarktFehler('schlaeft', TEXTE.schlaeft);
  throw new MarktFehler('fach', 'Fehler ' + res.status + (meldung ? ': ' + meldung : ''));
}

const rpc = (name, args) => anfrage('/rest/v1/rpc/' + name, { methode: 'POST', body: args });

function supabaseApi() {
  return {
    demo: false,
    async laden() {
      const [helfer, verfuegbarkeit, fest, einst] = await Promise.all([
        anfrage('/rest/v1/markt_helfer_oeffentlich?select=id,name,farbe,sortierung&order=sortierung.asc,name.asc'),
        anfrage('/rest/v1/markt_verfuegbarkeit?select=helfer_id,datum,status'),
        anfrage('/rest/v1/markt_fest?select=datum,helfer_id'),
        anfrage('/rest/v1/markt_einstellungen_oeffentlich?select=*'),
      ]);
      if (!Array.isArray(einst) || einst.length !== 1) throw new MarktFehler('setup', TEXTE.setup);
      return { helfer, verfuegbarkeit, fest, einstellungen: einst[0] };
    },
    async ich(code) {
      const r = await rpc('markt_ich', { p_code: code });
      if (!Array.isArray(r) || r.length !== 1) throw new MarktFehler('link', TEXTE.link);
      return { id: r[0].id, name: r[0].name };
    },
    setzen: (code, datum, status) => rpc('markt_setzen', { p_code: code, p_datum: datum, p_status: status }),
    adminFest: (admincode, datum, helferId) =>
      rpc('markt_admin_fest', { p_admincode: admincode, p_datum: datum, p_helfer_id: helferId }),
    adminFestBatch: (admincode, liste) =>
      rpc('markt_admin_fest_batch', { p_admincode: admincode, p_zuteilung: liste }),
    adminEinstellungen: (admincode, { fristTag = null, optionale = null, folgetag = null }) =>
      rpc('markt_admin_einstellungen', { p_admincode: admincode, p_frist_tag: fristTag, p_optionale: optionale, p_folgetag: folgetag }),
    async adminHelfer(admincode) {
      const r = await rpc('markt_admin_helfer', { p_admincode: admincode });
      return (r || []).map(({ id, name, code, sortierung }) => ({ id, name, code, sortierung }));
    },
  };
}

// ---------------------------------------------------------------------------------------------------------
// Demo adapter (?demo=1) – same interface, data in localStorage, 300 ms latency
// ---------------------------------------------------------------------------------------------------------
const DEMO_SCHLUESSEL = 'markt_demo';
let demoSpeicher = null; // fallback if localStorage is unavailable

function demoLesen() {
  try {
    const roh = localStorage.getItem(DEMO_SCHLUESSEL);
    const stand = roh ? JSON.parse(roh) : null;
    if (stand?.helfer?.[0]?.name) return stand; // ignore demo data saved by an older layout
  } catch { /* private mode etc. */ }
  if (!demoSpeicher) demoSpeicher = demoStartdaten();
  return demoSpeicher;
}

function demoSchreiben(stand) {
  demoSpeicher = stand;
  try { localStorage.setItem(DEMO_SCHLUESSEL, JSON.stringify(stand)); } catch { /* ignore */ }
}

const warte = () => new Promise((r) => setTimeout(r, 300));
const kopie = (x) => JSON.parse(JSON.stringify(x));

function demoApi({ fristAbgelaufen = false } = {}) {
  const abgelaufen = (e) => fristAbgelaufen || Date.now() >= Date.parse(e.frist);
  const pruefeAdmin = (c) => { if (c !== DEMO_ADMIN) throw new MarktFehler('admin', TEXTE.admin); };
  const imZeitraum = (e, d) => d >= e.start && d <= e.ende;
  return {
    demo: true,
    async laden() {
      await warte();
      const s = demoLesen();
      return {
        helfer: s.helfer.map(({ id, name, farbe, sortierung }) => ({ id, name, farbe, sortierung }))
          .sort((a, b) => a.sortierung - b.sortierung),
        verfuegbarkeit: kopie(s.verfuegbarkeit),
        fest: kopie(s.fest),
        einstellungen: { ...s.einstellungen, frist_abgelaufen: abgelaufen(s.einstellungen) },
      };
    },
    async ich(code) {
      await warte();
      const h = demoLesen().helfer.find((x) => x.code === code);
      if (!h) throw new MarktFehler('link', TEXTE.link);
      return { id: h.id, name: h.name };
    },
    async setzen(code, datum, status) {
      await warte();
      const s = demoLesen();
      const h = s.helfer.find((x) => x.code === code);
      if (!h) throw new MarktFehler('link', TEXTE.link);
      if (abgelaufen(s.einstellungen)) throw new MarktFehler('frist', TEXTE.frist);
      if (!imZeitraum(s.einstellungen, datum)) throw new MarktFehler('fach', 'Datum liegt außerhalb des Markts');
      s.verfuegbarkeit = s.verfuegbarkeit.filter((v) => !(v.helfer_id === h.id && v.datum === datum));
      if (status === 'kann' || status === 'kann_nicht') s.verfuegbarkeit.push({ helfer_id: h.id, datum, status });
      else if (status !== null) throw new MarktFehler('fach', 'Unbekannter Status');
      demoSchreiben(s);
    },
    async adminFest(admincode, datum, helferId) {
      await warte();
      pruefeAdmin(admincode);
      const s = demoLesen();
      if (!imZeitraum(s.einstellungen, datum)) throw new MarktFehler('fach', 'Datum liegt außerhalb des Markts');
      s.fest = s.fest.filter((f) => f.datum !== datum);
      if (helferId) s.fest.push({ datum, helfer_id: helferId });
      demoSchreiben(s);
    },
    async adminFestBatch(admincode, liste) {
      await warte();
      pruefeAdmin(admincode);
      const s = demoLesen();
      const neu = new Map(s.fest.map((f) => [f.datum, f.helfer_id]));
      for (const x of liste) {
        if (!imZeitraum(s.einstellungen, x.datum)) throw new MarktFehler('fach', 'Zuteilung enthält ungültige Tage oder Helfer');
        if (x.helfer_id) neu.set(x.datum, x.helfer_id); else neu.delete(x.datum);
      }
      s.fest = [...neu].map(([datum, helfer_id]) => ({ datum, helfer_id }));
      demoSchreiben(s);
      return liste.length;
    },
    async adminEinstellungen(admincode, { fristTag = null, optionale = null, folgetag = null }) {
      await warte();
      pruefeAdmin(admincode);
      const s = demoLesen();
      if (fristTag) s.einstellungen.frist = berlinTagesende(fristTag);
      if (optionale !== null) s.einstellungen.optionale_tage_besetzen = optionale;
      if (folgetag !== null) s.einstellungen.folgetag_vermeiden = folgetag;
      demoSchreiben(s);
    },
    async adminHelfer(admincode) {
      await warte();
      pruefeAdmin(admincode);
      return demoLesen().helfer.map(({ id, name, code, sortierung }) => ({ id, name, code, sortierung }));
    },
  };
}

/** 23:59:59 Europe/Berlin of an ISO day as UTC ISO string (demo only; the database does this server-side). */
function berlinTagesende(tag) {
  const [y, m, d] = tag.split('-').map(Number);
  // try both possible offsets (+1 / +2 h) and keep the one that formats back to 23:59 in Berlin
  for (const off of [1, 2]) {
    const t = new Date(Date.UTC(y, m - 1, d, 23 - off, 59, 59));
    // QA H1: compare the hour part only ("23 Uhr" from format() never equals "23")
    const h = new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', hour: '2-digit', hourCycle: 'h23' })
      .formatToParts(t).find((p) => p.type === 'hour')?.value;
    if (h === '23') return t.toISOString();
  }
  return new Date(Date.UTC(y, m - 1, d, 22, 59, 59)).toISOString();
}

export function erstelleApi({ demo = false, fristAbgelaufen = false } = {}) {
  return demo ? demoApi({ fristAbgelaufen }) : supabaseApi();
}

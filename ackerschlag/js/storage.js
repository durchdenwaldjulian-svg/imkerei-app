/* ============================================
   STORAGE – Supabase (PostgreSQL) Backend
   Alle Methoden async, mit Cache für Performance
   ============================================ */

const Storage = {
  // Lokaler Cache (wird bei jeder Abfrage aktualisiert)
  _cache: { schlaege: null, kulturen: null, massnahmen: null, duengeplanung: null, pflanzenschutz: null, marktpreise: null, stoffstrom: null, bodenproben: null, lager: null },

  _uid() { return currentUser ? currentUser.id : null; },

  // =========== SCHLÄGE ===========
  async getSchlaege() {
    const { data, error } = await sb.from('ask_schlaege')
      .select('*').order('name');
    if (error) { console.error('getSchlaege:', error); return this._cache.schlaege || []; }
    this._cache.schlaege = data || [];
    return this._cache.schlaege;
  },

  async getSchlag(id) {
    const { data, error } = await sb.from('ask_schlaege')
      .select('*').eq('id', id).single();
    if (error) return null;
    return data;
  },

  async saveSchlag(schlag) {
    const row = {
      name: schlag.name, groesse: schlag.groesse, flurstueck: schlag.flurstueck,
      bodenart: schlag.bodenart, bodenpunkte: schlag.bodenpunkte || null,
      lat: schlag.lat, lng: schlag.lng, notiz: schlag.notiz,
      polygon: schlag.polygon || null
    };

    if (schlag.id) {
      // Update
      const { error } = await sb.from('ask_schlaege').update(row).eq('id', schlag.id);
      if (error) console.error('saveSchlag update:', error);
    } else {
      // Insert
      row.user_id = this._uid();
      const { data, error } = await sb.from('ask_schlaege').insert(row).select().single();
      if (error) console.error('saveSchlag insert:', error);
      if (data) schlag.id = data.id;
    }
    this._cache.schlaege = null;
    return schlag;
  },

  async deleteSchlag(id) {
    // Cascade löscht Kulturen + Maßnahmen automatisch (FK constraint)
    const { error } = await sb.from('ask_schlaege').delete().eq('id', id);
    if (error) console.error('deleteSchlag:', error);
    this._cache.schlaege = null;
    this._cache.kulturen = null;
    this._cache.massnahmen = null;
  },

  // =========== KULTUREN ===========
  async getKulturen() {
    const { data, error } = await sb.from('ask_kulturen')
      .select('*').order('jahr', { ascending: false });
    if (error) { console.error('getKulturen:', error); return this._cache.kulturen || []; }
    // Mapping: schlag_id → schlagId für Kompatibilität mit bestehendem Code
    this._cache.kulturen = (data || []).map(k => ({ ...k, schlagId: k.schlag_id }));
    return this._cache.kulturen;
  },

  async getKulturenBySchlag(schlagId) {
    const kulturen = await this.getKulturen();
    return kulturen.filter(k => k.schlagId === schlagId);
  },

  async saveKultur(kultur) {
    const row = {
      schlag_id: kultur.schlagId, jahr: parseInt(kultur.jahr),
      kultur: kultur.kultur, sorte: kultur.sorte || '',
      aussaat: kultur.aussaat || null, ernte: kultur.ernte || null,
      ertrag: kultur.ertrag || null, notiz: kultur.notiz || ''
    };

    if (kultur.id) {
      const { error } = await sb.from('ask_kulturen').update(row).eq('id', kultur.id);
      if (error) console.error('saveKultur update:', error);
    } else {
      row.user_id = this._uid();
      const { data, error } = await sb.from('ask_kulturen').insert(row).select().single();
      if (error) console.error('saveKultur insert:', error);
      if (data) kultur.id = data.id;
    }
    this._cache.kulturen = null;
    return kultur;
  },

  async deleteKultur(id) {
    const { error } = await sb.from('ask_kulturen').delete().eq('id', id);
    if (error) console.error('deleteKultur:', error);
    this._cache.kulturen = null;
  },

  // =========== MASSNAHMEN ===========
  async getMassnahmen() {
    const { data, error } = await sb.from('ask_massnahmen')
      .select('*').order('datum', { ascending: false });
    if (error) { console.error('getMassnahmen:', error); return this._cache.massnahmen || []; }
    this._cache.massnahmen = (data || []).map(m => ({ ...m, schlagId: m.schlag_id }));
    return this._cache.massnahmen;
  },

  async getMassnahmenBySchlag(schlagId) {
    const massnahmen = await this.getMassnahmen();
    return massnahmen.filter(m => m.schlagId === schlagId);
  },

  // =========== AGGREGATIONS ===========
  async getTotalFlaeche() {
    const schlaege = await this.getSchlaege();
    return schlaege.reduce((sum, s) => sum + (parseFloat(s.groesse) || 0), 0);
  },

  async getAktiveKulturen() {
    const year = new Date().getFullYear();
    const kulturen = await this.getKulturen();
    return kulturen.filter(k => parseInt(k.jahr) === year);
  },

  async getMassnahmenThisMonth() {
    const now = new Date();
    const y = now.getFullYear(), m = now.getMonth();
    const massnahmen = await this.getMassnahmen();
    return massnahmen.filter(ma => {
      const d = new Date(ma.datum);
      return d.getFullYear() === y && d.getMonth() === m;
    });
  },

  // =========== DÜNGEPLANUNG ===========
  async getDuengeplanung(jahr) {
    const { data, error } = await sb.from('ask_duengeplanung')
      .select('*').eq('jahr', jahr).order('created_at');
    if (error) { console.error('getDuengeplanung:', error); return []; }
    return (data || []).map(d => ({ ...d, schlagId: d.schlag_id }));
  },

  async saveDuengeplanung(dp) {
    const row = {
      schlag_id: dp.schlagId, jahr: dp.jahr,
      n_bedarf: dp.n_bedarf || 0, p_bedarf: dp.p_bedarf || 0, k_bedarf: dp.k_bedarf || 0,
      n_zufuhr: dp.n_zufuhr || 0, p_zufuhr: dp.p_zufuhr || 0, k_zufuhr: dp.k_zufuhr || 0
    };
    if (dp.id) {
      const { error } = await sb.from('ask_duengeplanung').update(row).eq('id', dp.id);
      if (error) console.error('saveDuengeplanung:', error);
    } else {
      row.user_id = this._uid();
      const { data, error } = await sb.from('ask_duengeplanung').insert(row).select().single();
      if (error) console.error('saveDuengeplanung:', error);
      if (data) dp.id = data.id;
    }
    this._cache.duengeplanung = null;
    return dp;
  },

  async deleteDuengeplanung(id) {
    await sb.from('ask_duengeplanung').delete().eq('id', id);
    this._cache.duengeplanung = null;
  },

  // =========== PFLANZENSCHUTZ DB ===========
  async getPflanzenschutzDB() {
    if (this._cache.pflanzenschutz) return this._cache.pflanzenschutz;
    const { data, error } = await sb.from('ask_pflanzenschutz_db')
      .select('*').order('produkt');
    if (error) { console.error('getPflanzenschutzDB:', error); return []; }
    this._cache.pflanzenschutz = data || [];
    return this._cache.pflanzenschutz;
  },

  async savePflanzenschutzDB(psm) {
    const row = {
      produkt: psm.produkt, wirkstoff: psm.wirkstoff || '',
      typ: psm.typ || '', kulturen_zugelassen: psm.kulturen_zugelassen || [],
      max_aufwand: psm.max_aufwand || null, einheit: psm.einheit || 'l/ha',
      wartezeit_tage: psm.wartezeit_tage || null
    };
    if (psm.id) {
      const { error } = await sb.from('ask_pflanzenschutz_db').update(row).eq('id', psm.id);
      if (error) console.error('savePSM:', error);
    } else {
      row.user_id = this._uid();
      const { data, error } = await sb.from('ask_pflanzenschutz_db').insert(row).select().single();
      if (error) console.error('savePSM:', error);
      if (data) psm.id = data.id;
    }
    this._cache.pflanzenschutz = null;
    return psm;
  },

  async deletePflanzenschutzDB(id) {
    await sb.from('ask_pflanzenschutz_db').delete().eq('id', id);
    this._cache.pflanzenschutz = null;
  },

  // =========== MARKTPREISE ===========
  async getMarktpreise(jahr) {
    const { data, error } = await sb.from('ask_marktpreise')
      .select('*').eq('jahr', jahr).order('kultur');
    if (error) { console.error('getMarktpreise:', error); return []; }
    return data || [];
  },

  async saveMarktpreis(mp) {
    const row = { kultur: mp.kultur, jahr: mp.jahr, preis_pro_dt: mp.preis_pro_dt };
    if (mp.id) {
      const { error } = await sb.from('ask_marktpreise').update(row).eq('id', mp.id);
      if (error) console.error('saveMarktpreis:', error);
    } else {
      row.user_id = this._uid();
      const { data, error } = await sb.from('ask_marktpreise').insert(row).select().single();
      if (error) console.error('saveMarktpreis:', error);
      if (data) mp.id = data.id;
    }
    this._cache.marktpreise = null;
    return mp;
  },

  async deleteMarktpreis(id) {
    await sb.from('ask_marktpreise').delete().eq('id', id);
    this._cache.marktpreise = null;
  },

  // =========== STOFFSTROMBILANZ ===========
  async getStoffstrombilanz(jahr) {
    const { data, error } = await sb.from('ask_stoffstrombilanz')
      .select('*').eq('jahr', jahr).single();
    if (error && error.code !== 'PGRST116') console.error('getStoffstrom:', error);
    return data || null;
  },

  async saveStoffstrombilanz(ssb) {
    const row = {
      jahr: ssb.jahr,
      n_zufuhr: ssb.n_zufuhr || 0, p_zufuhr: ssb.p_zufuhr || 0,
      n_abfuhr: ssb.n_abfuhr || 0, p_abfuhr: ssb.p_abfuhr || 0,
      n_saldo: ssb.n_saldo || 0, p_saldo: ssb.p_saldo || 0
    };
    if (ssb.id) {
      const { error } = await sb.from('ask_stoffstrombilanz').update(row).eq('id', ssb.id);
      if (error) console.error('saveStoffstrom:', error);
    } else {
      row.user_id = this._uid();
      const { data, error } = await sb.from('ask_stoffstrombilanz').insert(row).select().single();
      if (error) console.error('saveStoffstrom:', error);
      if (data) ssb.id = data.id;
    }
    this._cache.stoffstrom = null;
    return ssb;
  },

  // =========== BODENPROBEN ===========
  async getBodenproben() {
    const { data, error } = await sb.from('ask_bodenproben')
      .select('*').order('datum', { ascending: false });
    if (error) { console.error('getBodenproben:', error); return this._cache.bodenproben || []; }
    this._cache.bodenproben = (data || []).map(b => ({ ...b, schlagId: b.schlag_id }));
    return this._cache.bodenproben;
  },

  async saveBodenprobe(bp) {
    const row = {
      schlag_id: bp.schlagId, datum: bp.datum,
      ph_wert: bp.ph_wert || null, p_gehalt: bp.p_gehalt || null,
      k_gehalt: bp.k_gehalt || null, mg_gehalt: bp.mg_gehalt || null,
      humus_prozent: bp.humus_prozent || null, bemerkung: bp.bemerkung || ''
    };
    if (bp.id) {
      const { error } = await sb.from('ask_bodenproben').update(row).eq('id', bp.id);
      if (error) console.error('saveBodenprobe:', error);
    } else {
      row.user_id = this._uid();
      const { data, error } = await sb.from('ask_bodenproben').insert(row).select().single();
      if (error) console.error('saveBodenprobe:', error);
      if (data) bp.id = data.id;
    }
    this._cache.bodenproben = null;
    return bp;
  },

  async deleteBodenprobe(id) {
    await sb.from('ask_bodenproben').delete().eq('id', id);
    this._cache.bodenproben = null;
  },

  // =========== LAGER ===========
  async getLager() {
    const { data, error } = await sb.from('ask_lager')
      .select('*').order('produkt');
    if (error) { console.error('getLager:', error); return this._cache.lager || []; }
    this._cache.lager = data || [];
    return this._cache.lager;
  },

  async saveLagerArtikel(item) {
    const row = {
      kategorie: item.kategorie, produkt: item.produkt,
      menge: item.menge || 0, einheit: item.einheit || 'kg',
      mindestbestand: item.mindestbestand || null,
      preis_pro_einheit: item.preis_pro_einheit || null,
      bemerkung: item.bemerkung || '',
      letzte_aenderung: new Date().toISOString()
    };
    if (item.id) {
      const { error } = await sb.from('ask_lager').update(row).eq('id', item.id);
      if (error) console.error('saveLagerArtikel:', error);
    } else {
      row.user_id = this._uid();
      const { data, error } = await sb.from('ask_lager').insert(row).select().single();
      if (error) console.error('saveLagerArtikel:', error);
      if (data) item.id = data.id;
    }
    this._cache.lager = null;
    return item;
  },

  async deleteLagerArtikel(id) {
    await sb.from('ask_lager').delete().eq('id', id);
    this._cache.lager = null;
  },

  // =========== EXPORT / IMPORT ===========
  async exportAll() {
    const [schlaege, kulturen, massnahmen] = await Promise.all([
      this.getSchlaege(), this.getKulturen(), this.getMassnahmen()
    ]);
    return JSON.stringify({
      schlaege, kulturen, massnahmen,
      exportDate: new Date().toISOString()
    }, null, 2);
  },

  async importAll(jsonStr) {
    const data = JSON.parse(jsonStr);
    const uid = this._uid();

    if (data.schlaege && data.schlaege.length) {
      // ID-Mapping: alte IDs → neue UUIDs
      const idMap = {};
      for (const s of data.schlaege) {
        const oldId = s.id;
        const { data: inserted, error } = await sb.from('ask_schlaege').insert({
          user_id: uid, name: s.name, groesse: s.groesse, flurstueck: s.flurstueck || '',
          bodenart: s.bodenart || '', bodenpunkte: s.bodenpunkte || null,
          lat: s.lat || null, lng: s.lng || null, notiz: s.notiz || ''
        }).select().single();
        if (!error && inserted) idMap[oldId] = inserted.id;
      }

      if (data.kulturen) {
        for (const k of data.kulturen) {
          const newSchlagId = idMap[k.schlagId || k.schlag_id];
          if (!newSchlagId) continue;
          await sb.from('ask_kulturen').insert({
            user_id: uid, schlag_id: newSchlagId, jahr: parseInt(k.jahr),
            kultur: k.kultur, sorte: k.sorte || '',
            aussaat: k.aussaat || null, ernte: k.ernte || null,
            ertrag: k.ertrag || null, notiz: k.notiz || ''
          });
        }
      }

      if (data.massnahmen) {
        for (const m of data.massnahmen) {
          const newSchlagId = idMap[m.schlagId || m.schlag_id];
          if (!newSchlagId) continue;
          await sb.from('ask_massnahmen').insert({
            user_id: uid, schlag_id: newSchlagId, typ: m.typ, datum: m.datum,
            mittel: m.mittel || '', menge: m.menge || null,
            einheit: m.einheit || '', beschreibung: m.beschreibung || '',
            kosten: m.kosten || null
          });
        }
      }
    }

    // Cache invalidieren
    this._cache = { schlaege: null, kulturen: null, massnahmen: null, duengeplanung: null, pflanzenschutz: null, marktpreise: null, stoffstrom: null, bodenproben: null, lager: null };
  },

  async saveMassnahme(m) {
    const row = {
      schlag_id: m.schlagId, typ: m.typ, datum: m.datum,
      mittel: m.mittel || '', menge: m.menge || null,
      einheit: m.einheit || '', beschreibung: m.beschreibung || '',
      kosten: m.kosten || null,
      n_gehalt: m.n_gehalt || null,
      p_gehalt: m.p_gehalt || null,
      k_gehalt: m.k_gehalt || null,
      duenger_typ: m.duenger_typ || null
    };

    if (m.id) {
      const { error } = await sb.from('ask_massnahmen').update(row).eq('id', m.id);
      if (error) console.error('saveMassnahme update:', error);
    } else {
      row.user_id = this._uid();
      const { data, error } = await sb.from('ask_massnahmen').insert(row).select().single();
      if (error) console.error('saveMassnahme insert:', error);
      if (data) m.id = data.id;
    }
    this._cache.massnahmen = null;
    return m;
  },

  async deleteMassnahme(id) {
    const { error } = await sb.from('ask_massnahmen').delete().eq('id', id);
    if (error) console.error('deleteMassnahme:', error);
    this._cache.massnahmen = null;
  }
};

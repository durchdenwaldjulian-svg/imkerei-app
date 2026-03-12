/* ============================================
   STORAGE – Supabase (PostgreSQL) Backend
   Alle Methoden async, mit Cache für Performance
   ============================================ */

const Storage = {
  // Lokaler Cache (wird bei jeder Abfrage aktualisiert)
  _cache: { schlaege: null, kulturen: null, massnahmen: null },

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
    this._cache = { schlaege: null, kulturen: null, massnahmen: null };
  },

  async saveMassnahme(m) {
    const row = {
      schlag_id: m.schlagId, typ: m.typ, datum: m.datum,
      mittel: m.mittel || '', menge: m.menge || null,
      einheit: m.einheit || '', beschreibung: m.beschreibung || '',
      kosten: m.kosten || null
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

/* ============================================
   MASSNAHMEN – Düngung, Pflanzenschutz etc.
   ============================================ */

const Massnahmen = {
  editId: null,
  filterTyp: '',
  filterSchlag: '',

  typen: [
    { value: 'duengung', label: 'Düngung', icon: '🧪' },
    { value: 'pflanzenschutz', label: 'Pflanzenschutz', icon: '🛡️' },
    { value: 'bodenbearbeitung', label: 'Bodenbearbeitung', icon: '🚜' },
    { value: 'aussaat', label: 'Aussaat', icon: '🌱' },
    { value: 'ernte', label: 'Ernte', icon: '🌾' },
    { value: 'sonstiges', label: 'Sonstiges', icon: '📋' }
  ],

  async render() {
    await this.renderFilters();
    await this.renderList();
  },

  async renderFilters() {
    const schlaege = await Storage.getSchlaege();
    const schlagFilter = document.getElementById('massFilterSchlag');
    schlagFilter.innerHTML = '<option value="">Alle Schläge</option>' +
      schlaege.map(s => `<option value="${s.id}" ${s.id === this.filterSchlag ? 'selected' : ''}>${s.name}</option>`).join('');
  },

  async setFilter(typ, schlag) {
    if (typ !== undefined) this.filterTyp = typ;
    if (schlag !== undefined) this.filterSchlag = schlag;
    await this.renderList();
  },

  async renderList() {
    const container = document.getElementById('massnahmenList');
    let list = await Storage.getMassnahmen();
    list = list.sort((a, b) => new Date(b.datum) - new Date(a.datum));

    if (this.filterTyp) list = list.filter(m => m.typ === this.filterTyp);
    if (this.filterSchlag) list = list.filter(m => m.schlagId === this.filterSchlag);

    if (!list.length) {
      container.innerHTML = `<div class="empty-state">
        <div class="empty-icon">${Icons.emptyMassnahme}</div>
        <h3>Keine Maßnahmen</h3>
        <p>${this.filterTyp || this.filterSchlag ? 'Keine Maßnahmen für diesen Filter gefunden.' : 'Dokumentiere deine erste Maßnahme.'}</p>
        <button class="btn btn-primary" onclick="Massnahmen.openModal()">${Icons.render('plus', 16)} Neue Maßnahme</button>
      </div>`;
      return;
    }

    const schlaege = await Storage.getSchlaege();
    const typLabels = {};
    this.typen.forEach(t => typLabels[t.value] = t.label);
    const typColors = {
      'duengung': 'badge-green', 'pflanzenschutz': 'badge-yellow',
      'bodenbearbeitung': 'badge-blue', 'aussaat': 'badge-green',
      'ernte': 'badge-yellow', 'sonstiges': 'badge-gray'
    };

    // Nach Monat gruppieren
    const grouped = {};
    list.forEach(m => {
      const d = new Date(m.datum);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
      if (!grouped[key]) grouped[key] = { label, items: [] };
      grouped[key].items.push(m);
    });

    container.innerHTML = Object.values(grouped).map(group => `
      <div class="section-divider">${group.label}</div>
      ${group.items.map(m => {
        const schlag = schlaege.find(s => s.id === m.schlagId);
        return `<div class="card" style="padding:0.85rem 1rem;margin-bottom:0.5rem">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem">
            <div style="flex:1">
              <div style="display:flex;align-items:center;gap:0.4rem;flex-wrap:wrap">
                <span class="badge ${typColors[m.typ] || 'badge-gray'}">${typLabels[m.typ] || m.typ}</span>
                <strong>${schlag ? esc(schlag.name) : 'Unbekannt'}</strong>
              </div>
              ${m.mittel ? `<div style="margin-top:0.3rem;font-size:0.875rem">${esc(m.mittel)}${m.menge ? ` – ${esc(String(m.menge))} ${esc(m.einheit) || ''}` : ''}</div>` : ''}
              ${m.beschreibung ? `<div style="margin-top:0.2rem;font-size:0.8rem;color:var(--text-soft)">${esc(m.beschreibung)}</div>` : ''}
            </div>
            <div style="text-align:right;flex-shrink:0">
              <div style="font-size:0.8rem;color:var(--text-soft)">${formatDate(m.datum)}</div>
              <div style="margin-top:0.3rem;display:flex;gap:0.25rem">
                <button class="btn-icon" style="width:28px;height:28px" onclick="Massnahmen.openModal('${m.id}')" title="Bearbeiten">${Icons.render('edit', 14)}</button>
                <button class="btn-icon" style="width:28px;height:28px" onclick="Massnahmen.delete('${m.id}')" title="Löschen">${Icons.render('trash', 14)}</button>
              </div>
            </div>
          </div>
        </div>`;
      }).join('')}
    `).join('');
  },

  async openModal(id) {
    this.editId = id || null;
    const form = document.getElementById('massnahmeForm');
    form.reset();

    const schlagSelect = document.getElementById('massSchlag');
    const schlaege = await Storage.getSchlaege();
    schlagSelect.innerHTML = '<option value="">Schlag wählen...</option>' +
      schlaege.map(s => `<option value="${s.id}">${s.name} (${formatNumber(s.groesse)} ha)</option>`).join('');

    // Dynamische Felder zurücksetzen
    this.toggleDuengungFelder('');
    document.getElementById('massPsmWarnung').style.display = 'none';

    if (id) {
      const allMassnahmen = await Storage.getMassnahmen();
      const m = allMassnahmen.find(x => x.id === id);
      if (m) {
        document.getElementById('massModalTitle').textContent = 'Maßnahme bearbeiten';
        schlagSelect.value = m.schlagId;
        document.getElementById('massTyp').value = m.typ;
        document.getElementById('massDatum').value = m.datum;
        document.getElementById('massMittel').value = m.mittel || '';
        document.getElementById('massMenge').value = m.menge || '';
        document.getElementById('massEinheit').value = m.einheit || '';
        document.getElementById('massBeschreibung').value = m.beschreibung || '';
        document.getElementById('massKosten').value = m.kosten || '';
        // Düngung-Felder
        if (m.typ === 'duengung') {
          this.toggleDuengungFelder('duengung');
          document.getElementById('massNGehalt').value = m.n_gehalt || '';
          document.getElementById('massPGehalt').value = m.p_gehalt || '';
          document.getElementById('massKGehalt').value = m.k_gehalt || '';
          document.getElementById('massDuengerTyp').value = m.duenger_typ || '';
        }
        if (m.typ === 'pflanzenschutz') {
          this.toggleDuengungFelder('pflanzenschutz');
        }
      }
    } else {
      document.getElementById('massModalTitle').textContent = 'Neue Maßnahme';
      document.getElementById('massDatum').value = new Date().toISOString().split('T')[0];
    }

    openModal('massnahmeModal');
  },

  onTypChange(typ) {
    this.toggleDuengungFelder(typ);
  },

  toggleDuengungFelder(typ) {
    const duengFelder = document.getElementById('massDuengungFelder');
    const psmFelder = document.getElementById('massPsmFelder');
    if (duengFelder) duengFelder.style.display = typ === 'duengung' ? 'block' : 'none';
    if (psmFelder) psmFelder.style.display = typ === 'pflanzenschutz' ? 'block' : 'none';
  },

  onDuengerSelect(name) {
    if (!name || !Duengeplaner) return;
    const stamm = Duengeplaner.duengerStamm[name];
    if (stamm) {
      const menge = parseFloat(document.getElementById('massMenge').value) || 0;
      if (stamm.N) document.getElementById('massNGehalt').value = (menge * stamm.N / 100).toFixed(1);
      if (stamm.P) document.getElementById('massPGehalt').value = (menge * stamm.P / 100).toFixed(1);
      if (stamm.K) document.getElementById('massKGehalt').value = (menge * stamm.K / 100).toFixed(1);
      document.getElementById('massDuengerTyp').value = stamm.typ || '';
    }
  },

  async checkPSMWarnung() {
    const mittel = document.getElementById('massMittel').value.trim();
    const schlagId = document.getElementById('massSchlag').value;
    const warnDiv = document.getElementById('massPsmWarnung');
    if (!mittel || !schlagId || !warnDiv) return;

    // Kultur für diesen Schlag ermitteln
    const kulturen = await Storage.getKulturen();
    const jahr = new Date().getFullYear();
    const kultur = kulturen.find(k => k.schlagId === schlagId && parseInt(k.jahr) === jahr);
    const kulturName = kultur ? kultur.kultur : null;

    if (typeof Pflanzenschutz !== 'undefined') {
      const result = Pflanzenschutz.checkZulassung(mittel, kulturName);
      if (result && result.warnings.length > 0) {
        warnDiv.innerHTML = '⚠️ ' + result.warnings.join('<br>');
        warnDiv.style.display = 'block';
        return;
      }
      // Aufwandmenge prüfen
      if (result && result.psm && result.psm.max_aufwand) {
        const menge = parseFloat(document.getElementById('massMenge').value) || 0;
        if (menge > result.psm.max_aufwand) {
          warnDiv.innerHTML = `⚠️ Aufwandmenge ${menge} ${result.psm.einheit || ''} überschreitet Maximum von ${result.psm.max_aufwand} ${result.psm.einheit || ''}!`;
          warnDiv.style.display = 'block';
          return;
        }
      }
    }
    warnDiv.style.display = 'none';
  },

  async save() {
    const schlagId = document.getElementById('massSchlag').value;
    const typ = document.getElementById('massTyp').value;
    const datum = document.getElementById('massDatum').value;

    if (!schlagId) { showToast('Bitte Schlag wählen', 'warning'); return; }
    if (!typ) { showToast('Bitte Typ wählen', 'warning'); return; }
    if (!datum) { showToast('Bitte Datum eingeben', 'warning'); return; }

    const data = {
      id: this.editId || undefined,
      schlagId,
      typ,
      datum,
      mittel: document.getElementById('massMittel').value.trim(),
      menge: document.getElementById('massMenge').value,
      einheit: document.getElementById('massEinheit').value,
      beschreibung: document.getElementById('massBeschreibung').value.trim(),
      kosten: parseFloat(document.getElementById('massKosten').value) || null,
      n_gehalt: typ === 'duengung' ? (parseFloat(document.getElementById('massNGehalt').value) || null) : null,
      p_gehalt: typ === 'duengung' ? (parseFloat(document.getElementById('massPGehalt').value) || null) : null,
      k_gehalt: typ === 'duengung' ? (parseFloat(document.getElementById('massKGehalt').value) || null) : null,
      duenger_typ: typ === 'duengung' ? (document.getElementById('massDuengerTyp').value || null) : null
    };

    await Storage.saveMassnahme(data);
    closeModal('massnahmeModal');
    showToast(this.editId ? 'Maßnahme aktualisiert' : 'Maßnahme dokumentiert', 'success');
    await this.render();
  },

  async delete(id) {
    if (!confirm('Maßnahme wirklich löschen?')) return;
    await Storage.deleteMassnahme(id);
    showToast('Maßnahme gelöscht', 'success');
    await this.render();
  }
};

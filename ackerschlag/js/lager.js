/* ============================================
   LAGER – Bestandsverwaltung
   Dünger, Pflanzenschutzmittel, Saatgut
   ============================================ */

const Lager = {
  editId: null,
  filterKat: '',

  kategorien: [
    { value: 'duenger', label: 'Dünger', badge: 'badge-green', icon: 'duengung' },
    { value: 'psm', label: 'Pflanzenschutzmittel', badge: 'badge-yellow', icon: 'pflanzenschutz' },
    { value: 'saatgut', label: 'Saatgut', badge: 'badge-blue', icon: 'aussaat' }
  ],

  einheiten: ['kg', 'l', 't', 'Sack', 'Einheit'],

  getKatInfo(value) {
    return this.kategorien.find(k => k.value === value) || { label: value, badge: 'badge-gray', icon: 'sonstiges' };
  },

  async render() {
    const container = document.getElementById('page-lager');
    if (!container) return;

    const artikel = await Storage.getLager();
    const filtered = this.filterKat ? artikel.filter(a => a.kategorie === this.filterKat) : artikel;

    // Statistiken
    const totalArtikel = artikel.length;
    const lowStock = artikel.filter(a => a.mindestbestand && parseFloat(a.menge) < parseFloat(a.mindestbestand));
    const totalWert = artikel.reduce((sum, a) => sum + (parseFloat(a.menge) || 0) * (parseFloat(a.preis_pro_einheit) || 0), 0);

    let html = `
      <div class="page-header">
        <div>
          <h1>Lagerverwaltung</h1>
          <p>Dünger, Pflanzenschutzmittel und Saatgut verwalten</p>
        </div>
        <button class="btn btn-primary" onclick="Lager.openModal()">
          ${Icons.render('plus', 16)} Neuer Artikel
        </button>
      </div>

      <div class="stats-grid" style="margin-bottom:1.5rem">
        <div class="stat-card">
          <div class="stat-icon blue">${Icons.render('statFlaeche', 22)}</div>
          <div>
            <div class="stat-value">${totalArtikel}</div>
            <div class="stat-label">Artikel gesamt</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon ${lowStock.length > 0 ? 'red' : 'green'}">${lowStock.length > 0 ? '⚠️' : '✅'}</div>
          <div>
            <div class="stat-value" ${lowStock.length > 0 ? 'style="color:var(--danger)"' : ''}>${lowStock.length}</div>
            <div class="stat-label">Bestand niedrig</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green">${Icons.render('deckungsbeitrag', 22)}</div>
          <div>
            <div class="stat-value">${formatNumber(totalWert, 0)} €</div>
            <div class="stat-label">Lagerwert</div>
          </div>
        </div>
      </div>
    `;

    // Warn-Box bei niedrigem Bestand
    if (lowStock.length > 0) {
      html += `<div class="warn-box" style="margin-bottom:1rem">
        <strong>⚠️ Mindestbestand unterschritten:</strong>
        ${lowStock.map(a => `${esc(a.produkt)} (${formatNumber(a.menge)} / ${formatNumber(a.mindestbestand)} ${esc(a.einheit)})`).join(', ')}
      </div>`;
    }

    // Tab-Filter
    html += `
      <div class="tab-bar" style="margin-bottom:1rem">
        <button class="tab-btn ${this.filterKat === '' ? 'active' : ''}" onclick="Lager.setFilter('')">Alle</button>
        ${this.kategorien.map(k => `
          <button class="tab-btn ${this.filterKat === k.value ? 'active' : ''}" onclick="Lager.setFilter('${k.value}')">${k.label}</button>
        `).join('')}
      </div>
    `;

    if (!filtered.length) {
      html += `<div class="empty-state">
        <div class="empty-icon">${Icons.emptyMassnahme}</div>
        <h3>Keine Artikel${this.filterKat ? ' in dieser Kategorie' : ''}</h3>
        <p>${this.filterKat ? 'Für diese Kategorie sind noch keine Artikel angelegt.' : 'Lege deinen ersten Lagerartikel an, um den Bestand zu verwalten.'}</p>
        <button class="btn btn-primary" onclick="Lager.openModal()">${Icons.render('plus', 16)} Neuer Artikel</button>
      </div>`;
    } else {
      // Sortierung: niedrige Bestände zuerst, dann alphabetisch
      const sorted = [...filtered].sort((a, b) => {
        const aLow = a.mindestbestand && parseFloat(a.menge) < parseFloat(a.mindestbestand) ? 0 : 1;
        const bLow = b.mindestbestand && parseFloat(b.menge) < parseFloat(b.mindestbestand) ? 0 : 1;
        if (aLow !== bLow) return aLow - bLow;
        return (a.produkt || '').localeCompare(b.produkt || '');
      });

      html += `
        <div class="table-wrap"><table>
          <thead><tr>
            <th>Kategorie</th>
            <th>Produkt</th>
            <th>Bestand</th>
            <th>Mindest.</th>
            <th>Preis/Einheit</th>
            <th>Wert</th>
            <th>Letzte Änderung</th>
            <th style="text-align:right">Aktionen</th>
          </tr></thead>
          <tbody>
          ${sorted.map(a => {
            const kat = this.getKatInfo(a.kategorie);
            const menge = parseFloat(a.menge) || 0;
            const mindest = parseFloat(a.mindestbestand) || 0;
            const preis = parseFloat(a.preis_pro_einheit) || 0;
            const wert = menge * preis;
            const isLow = mindest > 0 && menge < mindest;

            return `<tr ${isLow ? 'style="background:rgba(220,53,69,0.06)"' : ''}>
              <td><span class="badge ${kat.badge}">${kat.label}</span></td>
              <td>
                <strong>${esc(a.produkt)}</strong>
                ${a.bemerkung ? `<br><small style="color:var(--text-soft)">${esc(a.bemerkung)}</small>` : ''}
              </td>
              <td>
                <div style="display:flex;align-items:center;gap:0.3rem">
                  <button class="btn btn-sm btn-icon" onclick="Lager.adjustMenge('${a.id}', -1)" title="Bestand verringern" style="padding:0.15rem 0.4rem;min-width:auto;font-size:0.85rem">−</button>
                  <span style="min-width:50px;text-align:center;font-weight:${isLow ? '700' : '500'};color:${isLow ? 'var(--danger)' : 'inherit'}">
                    ${formatNumber(menge)} ${esc(a.einheit)}
                  </span>
                  <button class="btn btn-sm btn-icon" onclick="Lager.adjustMenge('${a.id}', 1)" title="Bestand erhöhen" style="padding:0.15rem 0.4rem;min-width:auto;font-size:0.85rem">+</button>
                </div>
                ${isLow ? `<span class="badge badge-red" style="font-size:0.65rem;margin-top:0.15rem">Niedrig!</span>` : ''}
              </td>
              <td>${mindest > 0 ? formatNumber(mindest) + ' ' + esc(a.einheit) : '–'}</td>
              <td>${preis > 0 ? formatNumber(preis) + ' €' : '–'}</td>
              <td>${wert > 0 ? formatNumber(wert, 0) + ' €' : '–'}</td>
              <td>${a.letzte_aenderung ? formatDate(a.letzte_aenderung) : '–'}</td>
              <td style="text-align:right;white-space:nowrap">
                <button class="btn btn-sm btn-secondary btn-icon" onclick="Lager.bestandAendern('${a.id}')" title="Bestand ändern">
                  📦
                </button>
                <button class="btn btn-sm btn-secondary btn-icon" onclick="Lager.editArtikel('${a.id}')" title="Bearbeiten">
                  ${Icons.render('edit', 14)}
                </button>
                <button class="btn btn-sm btn-secondary btn-icon" onclick="Lager.deleteArtikel('${a.id}')" title="Löschen" style="color:var(--danger)">
                  ${Icons.render('trash', 14)}
                </button>
              </td>
            </tr>`;
          }).join('')}
          </tbody>
        </table></div>
      `;
    }

    container.innerHTML = html;
  },

  setFilter(kat) {
    this.filterKat = kat;
    this.render();
  },

  openModal(id) {
    this.editId = id || null;
    openModal('lagerModal');
    this.populateForm();
  },

  async populateForm() {
    const form = document.getElementById('lagerForm');
    if (!form) return;

    if (this.editId) {
      const artikel = await Storage.getLager();
      const item = artikel.find(a => a.id === this.editId);
      if (item) {
        form.lagerKategorie.value = item.kategorie || 'duenger';
        form.lagerProdukt.value = item.produkt || '';
        form.lagerMenge.value = item.menge || '';
        form.lagerEinheit.value = item.einheit || 'kg';
        form.lagerMindest.value = item.mindestbestand || '';
        form.lagerPreis.value = item.preis_pro_einheit || '';
        form.lagerBemerkung.value = item.bemerkung || '';
      }
      const title = document.getElementById('lagerModalTitle');
      if (title) title.textContent = 'Artikel bearbeiten';
    } else {
      form.reset();
      form.lagerKategorie.value = 'duenger';
      form.lagerEinheit.value = 'kg';
      const title = document.getElementById('lagerModalTitle');
      if (title) title.textContent = 'Neuer Lagerartikel';
    }
  },

  async saveArtikel() {
    const form = document.getElementById('lagerForm');
    if (!form) return;

    const produkt = form.lagerProdukt.value.trim();
    if (!produkt) {
      showToast('Bitte Produktname eingeben.', 'error');
      return;
    }

    const menge = parseFloat(form.lagerMenge.value) || 0;
    if (menge < 0) {
      showToast('Menge darf nicht negativ sein.', 'error');
      return;
    }

    const item = {
      kategorie: form.lagerKategorie.value,
      produkt: produkt,
      menge: menge,
      einheit: form.lagerEinheit.value,
      mindestbestand: parseFloat(form.lagerMindest.value) || 0,
      preis_pro_einheit: parseFloat(form.lagerPreis.value) || 0,
      bemerkung: form.lagerBemerkung.value.trim(),
      letzte_aenderung: new Date().toISOString()
    };

    if (this.editId) {
      item.id = this.editId;
    }

    await Storage.saveLagerArtikel(item);
    closeModal('lagerModal');
    this.editId = null;
    showToast(item.id ? 'Artikel aktualisiert.' : 'Artikel hinzugefügt.', 'success');
    this.render();
  },

  async editArtikel(id) {
    this.openModal(id);
  },

  async deleteArtikel(id) {
    if (!confirm('Artikel wirklich löschen?')) return;
    await Storage.deleteLagerArtikel(id);
    showToast('Artikel gelöscht.', 'success');
    this.render();
  },

  async bestandAendern(id) {
    const artikel = await Storage.getLager();
    const item = artikel.find(a => a.id === id);
    if (!item) return;

    const input = prompt(`Neuen Bestand für "${item.produkt}" eingeben (aktuell: ${formatNumber(item.menge)} ${item.einheit}):`);
    if (input === null) return;

    const neueMenge = parseFloat(input);
    if (isNaN(neueMenge) || neueMenge < 0) {
      showToast('Ungültige Menge.', 'error');
      return;
    }

    item.menge = neueMenge;
    item.letzte_aenderung = new Date().toISOString();
    await Storage.saveLagerArtikel(item);
    showToast(`Bestand von "${item.produkt}" auf ${formatNumber(neueMenge)} ${item.einheit} geändert.`, 'success');
    this.render();
  },

  async adjustMenge(id, delta) {
    const artikel = await Storage.getLager();
    const item = artikel.find(a => a.id === id);
    if (!item) return;

    const aktMenge = parseFloat(item.menge) || 0;
    // Schrittweite je nach Einheit
    let step = 1;
    if (item.einheit === 'kg' || item.einheit === 'l') step = 1;
    if (item.einheit === 't') step = 0.1;

    const neueMenge = Math.max(0, aktMenge + delta * step);
    item.menge = neueMenge;
    item.letzte_aenderung = new Date().toISOString();
    await Storage.saveLagerArtikel(item);
    this.render();
  }
};

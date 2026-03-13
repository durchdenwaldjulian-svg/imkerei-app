/* ============================================
   DECKUNGSBEITRAG – Erlöse vs Kosten
   ============================================ */

const Deckungsbeitrag = {
  selectedJahr: new Date().getFullYear(),

  // Standard-Marktpreise (€/dt) als Fallback
  defaultPreise: {
    'Winterweizen': 22, 'Sommerweizen': 24,
    'Wintergerste': 19, 'Sommergerste': 22,
    'Winterroggen': 18, 'Triticale': 18, 'Hafer': 20,
    'Winterraps': 45, 'Sonnenblumen': 40,
    'Mais': 20, 'Silomais': 4,
    'Zuckerrüben': 3, 'Kartoffeln': 12,
    'Ackerbohnen': 28, 'Erbsen': 26, 'Sojabohnen': 38,
    'Luzerne': 5, 'Kleegras': 4
  },

  async render() {
    const container = document.getElementById('page-deckungsbeitrag');
    if (!container) return;

    const schlaege = await Storage.getSchlaege();
    const kulturen = await Storage.getKulturen();
    const massnahmen = await Storage.getMassnahmen();
    const marktpreise = await Storage.getMarktpreise(this.selectedJahr);

    const jahrKulturen = kulturen.filter(k => parseInt(k.jahr) === this.selectedJahr);
    const jahrMassnahmen = massnahmen.filter(m => new Date(m.datum).getFullYear() === this.selectedJahr);

    // Preise: User-Preise überschreiben Defaults
    const preisMap = { ...this.defaultPreise };
    marktpreise.forEach(mp => { preisMap[mp.kultur] = mp.preis_pro_dt; });

    const ergebnisse = schlaege.map(s => {
      const kultur = jahrKulturen.find(k => k.schlagId === s.id);
      if (!kultur || !kultur.ertrag) return null;

      const ha = parseFloat(s.groesse) || 0;
      const ertragDtHa = parseFloat(kultur.ertrag) || 0;
      const preis = preisMap[kultur.kultur] || 0;
      const erloese = ertragDtHa * ha * preis;

      const kosten = jahrMassnahmen
        .filter(m => m.schlagId === s.id && m.kosten)
        .reduce((sum, m) => sum + (parseFloat(m.kosten) || 0), 0);

      const db = erloese - kosten;
      const dbHa = ha > 0 ? db / ha : 0;

      return { schlag: s, kultur: kultur.kultur, ha, ertragDtHa, preis, erloese, kosten, db, dbHa };
    }).filter(Boolean).sort((a, b) => b.dbHa - a.dbHa);

    const totalErloese = ergebnisse.reduce((s, e) => s + e.erloese, 0);
    const totalKosten = ergebnisse.reduce((s, e) => s + e.kosten, 0);
    const totalDB = totalErloese - totalKosten;

    const years = [];
    for (let y = this.selectedJahr - 2; y <= this.selectedJahr + 1; y++) years.push(y);

    let html = `
      <div class="page-header">
        <div>
          <h1>Deckungsbeitrag</h1>
          <p>Erlöse vs. Kosten – Welche Schläge lohnen sich?</p>
        </div>
        <button class="btn btn-secondary" onclick="Deckungsbeitrag.openPreisModal()">Marktpreise bearbeiten</button>
      </div>

      <div class="tab-bar" style="max-width:320px">
        ${years.map(y => `<button class="tab-btn ${y === this.selectedJahr ? 'active' : ''}" onclick="Deckungsbeitrag.setJahr(${y})">${y}</button>`).join('')}
      </div>

      <div class="stats-grid" style="margin-bottom:1.5rem">
        <div class="stat-card">
          <div class="stat-icon green">${Icons.render('auswertung', 22)}</div>
          <div>
            <div class="stat-value">${formatNumber(totalErloese, 0)} €</div>
            <div class="stat-label">Erlöse gesamt</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon red">${Icons.render('statMassnahme', 22)}</div>
          <div>
            <div class="stat-value">${formatNumber(totalKosten, 0)} €</div>
            <div class="stat-label">Kosten gesamt</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon ${totalDB >= 0 ? 'green' : 'red'}">
            ${totalDB >= 0 ? '📈' : '📉'}
          </div>
          <div>
            <div class="stat-value" style="color:${totalDB >= 0 ? 'var(--success)' : 'var(--danger)'}">${totalDB >= 0 ? '+' : ''}${formatNumber(totalDB, 0)} €</div>
            <div class="stat-label">Deckungsbeitrag</div>
          </div>
        </div>
      </div>
    `;

    if (!ergebnisse.length) {
      html += `<div class="empty-state">
        <div class="empty-icon">${Icons.emptyChart}</div>
        <h3>Keine Daten für ${this.selectedJahr}</h3>
        <p>Trage Kulturen mit Ertragsdaten und Maßnahmen mit Kosten ein.</p>
      </div>`;
    } else {
      // Ranking nach DB/ha
      html += `<div class="section-divider">Ranking nach DB/ha</div>`;
      const maxDbHa = Math.max(...ergebnisse.map(e => Math.abs(e.dbHa)), 1);

      html += `<div class="bar-chart" style="margin-bottom:1.5rem">
        ${ergebnisse.map(e => {
          const pct = Math.min(100, Math.abs(e.dbHa) / maxDbHa * 100);
          const colorCls = e.dbHa >= 0 ? 'green' : 'red';
          return `<div class="bar-row">
            <span class="bar-label">${esc(e.schlag.name)}<br><small style="color:var(--text-soft)">${e.kultur}</small></span>
            <div class="bar-track">
              <div class="bar-fill ${colorCls}" style="width:${Math.max(8, pct)}%">${e.dbHa >= 0 ? '+' : ''}${formatNumber(e.dbHa, 0)} €/ha</div>
            </div>
          </div>`;
        }).join('')}
      </div>`;

      html += `<div class="section-divider">Detailübersicht</div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>Schlag</th><th>Kultur</th><th>Fläche</th><th>Ertrag</th><th>Preis</th>
          <th>Erlöse</th><th>Kosten</th><th>DB</th><th>DB/ha</th>
        </tr></thead>
        <tbody>
        ${ergebnisse.map(e => `
          <tr>
            <td><strong>${esc(e.schlag.name)}</strong></td>
            <td>${e.kultur}</td>
            <td>${formatNumber(e.ha)} ha</td>
            <td>${formatNumber(e.ertragDtHa)} dt/ha</td>
            <td>${formatNumber(e.preis)} €/dt</td>
            <td>${formatNumber(e.erloese, 0)} €</td>
            <td>${formatNumber(e.kosten, 0)} €</td>
            <td style="font-weight:700;color:${e.db >= 0 ? 'var(--success)' : 'var(--danger)'}">${e.db >= 0 ? '+' : ''}${formatNumber(e.db, 0)} €</td>
            <td>${e.dbHa >= 0 ? '+' : ''}${formatNumber(e.dbHa, 0)} €</td>
          </tr>`).join('')}
        <tr style="font-weight:700;border-top:2px solid var(--border-default)">
          <td colspan="5">Gesamt</td>
          <td>${formatNumber(totalErloese, 0)} €</td>
          <td>${formatNumber(totalKosten, 0)} €</td>
          <td style="color:${totalDB >= 0 ? 'var(--success)' : 'var(--danger)'}">${totalDB >= 0 ? '+' : ''}${formatNumber(totalDB, 0)} €</td>
          <td></td>
        </tr>
        </tbody>
      </table></div>`;
    }

    container.innerHTML = html;
  },

  openPreisModal() {
    openModal('preisModal');
    this.renderPreisForm();
  },

  async renderPreisForm() {
    const marktpreise = await Storage.getMarktpreise(this.selectedJahr);
    const formContainer = document.getElementById('preisFormContent');
    if (!formContainer) return;

    const allKulturen = Object.keys(this.defaultPreise);
    formContainer.innerHTML = allKulturen.map(k => {
      const userPreis = marktpreise.find(mp => mp.kultur === k);
      const val = userPreis ? userPreis.preis_pro_dt : '';
      return `<div class="form-row" style="margin-bottom:0.4rem;align-items:center">
        <label class="form-label" style="margin:0;font-size:0.82rem">${k}</label>
        <div style="display:flex;align-items:center;gap:0.3rem">
          <input class="form-input" style="width:80px;padding:0.35rem 0.5rem;font-size:0.82rem" type="number" step="0.1" min="0"
            data-kultur="${k}" data-preis-id="${userPreis ? userPreis.id : ''}" value="${val}" placeholder="${this.defaultPreise[k]}">
          <span style="font-size:0.78rem;color:var(--text-soft)">€/dt</span>
        </div>
      </div>`;
    }).join('');
  },

  async savePreise() {
    const inputs = document.querySelectorAll('#preisFormContent input[data-kultur]');
    for (const input of inputs) {
      const kultur = input.dataset.kultur;
      const val = parseFloat(input.value);
      const existingId = input.dataset.preisId || null;

      if (val && val > 0) {
        await Storage.saveMarktpreis({
          id: existingId || undefined,
          kultur, jahr: this.selectedJahr, preis_pro_dt: val
        });
      } else if (existingId && existingId !== '') {
        await Storage.deleteMarktpreis(existingId);
      }
    }
    closeModal('preisModal');
    showToast('Marktpreise gespeichert', 'success');
    await this.render();
  },

  async setJahr(y) {
    this.selectedJahr = y;
    await this.render();
  }
};

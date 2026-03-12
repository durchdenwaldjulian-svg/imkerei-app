/* ============================================
   AUSWERTUNG – Erträge, Kosten, Jahresübersicht
   ============================================ */

const Auswertung = {
  selectedJahr: new Date().getFullYear(),
  activeTab: 'ertraege',

  async render() {
    this.renderJahrFilter();
    await this.renderTab();
  },

  renderJahrFilter() {
    const container = document.getElementById('auswertungJahrFilter');
    const years = [];
    for (let y = this.selectedJahr - 3; y <= this.selectedJahr + 1; y++) years.push(y);
    container.innerHTML = years.map(y =>
      `<button class="tab-btn ${y === this.selectedJahr ? 'active' : ''}" onclick="Auswertung.setJahr(${y})">${y}</button>`
    ).join('');
  },

  async setJahr(y) {
    this.selectedJahr = y;
    await this.render();
  },

  async setTab(tab) {
    this.activeTab = tab;
    document.querySelectorAll('#auswertungTabs .tab-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === tab);
    });
    await this.renderTab();
  },

  async renderTab() {
    const container = document.getElementById('auswertungContent');
    switch (this.activeTab) {
      case 'ertraege': await this.renderErtraege(container); break;
      case 'kosten': await this.renderKosten(container); break;
      case 'uebersicht': await this.renderUebersicht(container); break;
    }
  },

  async renderErtraege(container) {
    const schlaege = await Storage.getSchlaege();
    const allKulturen = await Storage.getKulturen();
    const kulturen = allKulturen.filter(k => parseInt(k.jahr) === this.selectedJahr);

    if (!kulturen.length || !kulturen.some(k => k.ertrag)) {
      container.innerHTML = `<div class="empty-state">
        <div class="empty-icon">${Icons.emptyChart}</div>
        <h3>Keine Ertragsdaten für ${this.selectedJahr}</h3>
        <p>Trage Erträge bei den Kulturen ein, um Auswertungen zu sehen.</p>
      </div>`;
      return;
    }

    const rows = kulturen.filter(k => k.ertrag).map(k => {
      const schlag = schlaege.find(s => s.id === k.schlagId);
      const totalErtrag = (k.ertrag * (schlag ? schlag.groesse : 0));
      return { schlag, kultur: k, totalErtrag };
    }).sort((a, b) => b.kultur.ertrag - a.kultur.ertrag);

    const maxErtrag = Math.max(...rows.map(r => r.kultur.ertrag));
    const totalGesamt = rows.reduce((s, r) => s + r.totalErtrag, 0);

    container.innerHTML = `
      <div class="stat-card" style="margin-bottom:1rem;background:var(--green-50);border-color:var(--green-200)">
        <div class="stat-icon green">${Icons.render('ernte', 22)}</div>
        <div>
          <div class="stat-value">${formatNumber(totalGesamt, 0)} dt</div>
          <div class="stat-label">Gesamtertrag ${this.selectedJahr}</div>
        </div>
      </div>

      <div class="bar-chart">${rows.map(r => `
        <div class="bar-row">
          <span class="bar-label">${r.schlag ? r.schlag.name : '?'}<br><small style="color:var(--text-soft)">${r.kultur.kultur}</small></span>
          <div class="bar-track">
            <div class="bar-fill green" style="width:${Math.max(10, (r.kultur.ertrag / maxErtrag) * 100)}%">${formatNumber(r.kultur.ertrag)} dt/ha</div>
          </div>
        </div>`).join('')}
      </div>

      <div class="table-wrap" style="margin-top:1.25rem">
        <table>
          <thead><tr><th>Schlag</th><th>Kultur</th><th>Fläche (ha)</th><th>dt/ha</th><th>Gesamt (dt)</th></tr></thead>
          <tbody>${rows.map(r => `
            <tr>
              <td>${r.schlag ? r.schlag.name : '-'}</td>
              <td>${r.kultur.kultur}${r.kultur.sorte ? ` (${r.kultur.sorte})` : ''}</td>
              <td>${r.schlag ? formatNumber(r.schlag.groesse) : '-'}</td>
              <td><strong>${formatNumber(r.kultur.ertrag)}</strong></td>
              <td>${formatNumber(r.totalErtrag, 0)}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  async renderKosten(container) {
    const allMassnahmen = await Storage.getMassnahmen();
    const massnahmen = allMassnahmen.filter(m => {
      const d = new Date(m.datum);
      return d.getFullYear() === this.selectedJahr && m.kosten;
    });

    if (!massnahmen.length) {
      container.innerHTML = `<div class="empty-state">
        <div class="empty-icon">${Icons.emptyChart}</div>
        <h3>Keine Kostendaten für ${this.selectedJahr}</h3>
        <p>Trage Kosten bei den Maßnahmen ein, um Auswertungen zu sehen.</p>
      </div>`;
      return;
    }

    const typKosten = {};
    const typLabels = {
      'duengung': 'Düngung', 'pflanzenschutz': 'Pflanzenschutz',
      'bodenbearbeitung': 'Bodenbearbeitung', 'aussaat': 'Aussaat',
      'ernte': 'Ernte', 'sonstiges': 'Sonstiges'
    };
    massnahmen.forEach(m => { typKosten[m.typ] = (typKosten[m.typ] || 0) + m.kosten; });

    const totalKosten = Object.values(typKosten).reduce((s, k) => s + k, 0);
    const sorted = Object.entries(typKosten).sort((a, b) => b[1] - a[1]);
    const maxK = sorted[0] ? sorted[0][1] : 1;
    const colors = ['green', 'amber', 'blue', 'red', 'green', 'amber'];

    const schlaege = await Storage.getSchlaege();
    const schlagKosten = {};
    massnahmen.forEach(m => {
      const schlag = schlaege.find(s => s.id === m.schlagId);
      const name = schlag ? schlag.name : 'Unbekannt';
      schlagKosten[name] = (schlagKosten[name] || 0) + m.kosten;
    });
    const schlagSorted = Object.entries(schlagKosten).sort((a, b) => b[1] - a[1]);

    container.innerHTML = `
      <div class="stats-grid" style="margin-bottom:1.25rem">
        <div class="stat-card">
          <div class="stat-icon amber">${Icons.render('statMassnahme', 22)}</div>
          <div>
            <div class="stat-value">${formatNumber(totalKosten, 0)} &euro;</div>
            <div class="stat-label">Gesamtkosten ${this.selectedJahr}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon blue">${Icons.render('auswertung', 22)}</div>
          <div>
            <div class="stat-value">${massnahmen.length}</div>
            <div class="stat-label">Maßnahmen mit Kosten</div>
          </div>
        </div>
      </div>

      <div class="section-divider">Kosten nach Typ</div>
      <div class="bar-chart">${sorted.map(([typ, kosten], i) => `
        <div class="bar-row">
          <span class="bar-label">${typLabels[typ] || typ}</span>
          <div class="bar-track">
            <div class="bar-fill ${colors[i % colors.length]}" style="width:${Math.max(10, (kosten / maxK) * 100)}%">${formatNumber(kosten, 0)} &euro;</div>
          </div>
        </div>`).join('')}
      </div>

      <div class="section-divider">Kosten nach Schlag</div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Schlag</th><th>Kosten</th><th>Anteil</th></tr></thead>
          <tbody>${schlagSorted.map(([name, kosten]) => `
            <tr>
              <td>${name}</td>
              <td><strong>${formatNumber(kosten, 0)} &euro;</strong></td>
              <td>${formatNumber((kosten / totalKosten) * 100, 1)}%</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  async renderUebersicht(container) {
    const schlaege = await Storage.getSchlaege();
    const allKulturen = await Storage.getKulturen();
    const kulturen = allKulturen.filter(k => parseInt(k.jahr) === this.selectedJahr);
    const allMassnahmen = await Storage.getMassnahmen();
    const massnahmen = allMassnahmen.filter(m => new Date(m.datum).getFullYear() === this.selectedJahr);
    const totalHa = await Storage.getTotalFlaeche();

    const kulturFlaeche = {};
    kulturen.forEach(k => {
      const s = schlaege.find(x => x.id === k.schlagId);
      kulturFlaeche[k.kultur] = (kulturFlaeche[k.kultur] || 0) + (s ? parseFloat(s.groesse) || 0 : 0);
    });
    const unbepflanzt = totalHa - Object.values(kulturFlaeche).reduce((s, v) => s + v, 0);

    container.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon green">${Icons.render('schlaege', 22)}</div>
          <div>
            <div class="stat-value">${schlaege.length}</div>
            <div class="stat-label">Schläge gesamt</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon blue">${Icons.render('statFlaeche', 22)}</div>
          <div>
            <div class="stat-value">${formatNumber(totalHa)} ha</div>
            <div class="stat-label">Gesamtfläche</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon amber">${Icons.render('kulturen', 22)}</div>
          <div>
            <div class="stat-value">${kulturen.length}</div>
            <div class="stat-label">Kulturen ${this.selectedJahr}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon red">${Icons.render('massnahmen', 22)}</div>
          <div>
            <div class="stat-value">${massnahmen.length}</div>
            <div class="stat-label">Maßnahmen ${this.selectedJahr}</div>
          </div>
        </div>
      </div>

      <div class="section-divider">Kulturverteilung ${this.selectedJahr}</div>
      ${Object.keys(kulturFlaeche).length ? `
        <div class="table-wrap">
          <table>
            <thead><tr><th>Kultur</th><th>Fläche (ha)</th><th>Anteil</th></tr></thead>
            <tbody>
              ${Object.entries(kulturFlaeche).sort((a, b) => b[1] - a[1]).map(([name, ha]) => `
                <tr>
                  <td><strong>${name}</strong></td>
                  <td>${formatNumber(ha)}</td>
                  <td>
                    <div class="progress-bar" style="width:100px;display:inline-block;vertical-align:middle;margin-right:0.4rem">
                      <div class="progress-fill" style="width:${(ha / totalHa) * 100}%"></div>
                    </div>
                    ${formatNumber((ha / totalHa) * 100, 1)}%
                  </td>
                </tr>`).join('')}
              ${unbepflanzt > 0 ? `<tr><td style="color:var(--text-soft)">Ohne Kultur</td><td>${formatNumber(unbepflanzt)}</td><td>${formatNumber((unbepflanzt / totalHa) * 100, 1)}%</td></tr>` : ''}
            </tbody>
          </table>
        </div>
      ` : '<p style="color:var(--text-soft)">Keine Kulturen zugewiesen</p>'}

      <div class="section-divider">Schlagübersicht</div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Schlag</th><th>Fläche</th><th>Kultur</th><th>Bodenart</th><th>Maßnahmen</th></tr></thead>
          <tbody>${schlaege.map(s => {
            const k = kulturen.find(x => x.schlagId === s.id);
            const mc = massnahmen.filter(x => x.schlagId === s.id).length;
            const bodenLabels = { 'sand': 'Sand', 'lehm': 'Lehm', 'ton': 'Ton', 'schluff': 'Schluff', 'moor': 'Moor', 'loess': 'Löss' };
            return `<tr>
              <td><strong>${s.name}</strong></td>
              <td>${formatNumber(s.groesse)} ha</td>
              <td>${k ? k.kultur : '-'}</td>
              <td>${bodenLabels[s.bodenart] || '-'}</td>
              <td>${mc}</td>
            </tr>`;
          }).join('')}</tbody>
        </table>
      </div>
    `;
  },

  async exportData() {
    const data = await Storage.exportAll();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ackerschlagkartei_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Daten exportiert', 'success');
  },

  async importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          await Storage.importAll(ev.target.result);
          showToast('Daten importiert', 'success');
          await App.renderPage(App.currentPage);
        } catch {
          showToast('Fehler beim Import', 'error');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }
};

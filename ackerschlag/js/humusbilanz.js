/* ============================================
   HUMUSBILANZ – VDLUFA-Methode
   ============================================ */

const Humusbilanz = {
  selectedJahr: new Date().getFullYear(),

  // Humus-C Koeffizienten pro Kultur (kg Humus-C/ha/Jahr) – VDLUFA
  kulturKoeff: {
    'Winterweizen': -280, 'Sommerweizen': -280,
    'Wintergerste': -280, 'Sommergerste': -280,
    'Winterroggen': -280, 'Triticale': -280, 'Hafer': -280,
    'Winterraps': -380, 'Sonnenblumen': -380,
    'Mais': -560, 'Silomais': -560,
    'Zuckerrüben': -760, 'Kartoffeln': -760,
    'Ackerbohnen': 160, 'Erbsen': 160, 'Sojabohnen': 160,
    'Luzerne': 600, 'Kleegras': 600,
    'Grünland': 300
  },

  // Organische Düngung: Humus-C Zufuhr (kg/t oder kg/m³)
  orgDuengerHumus: {
    'Stallmist (Rind)': 45, 'Stallmist (Schwein)': 40,
    'Rindergülle': 8, 'Schweinegülle': 6,
    'Kompost': 60, 'Gärrest': 10,
    'Hühnermist': 35
  },

  // Stroh-Verbleib: 100 kg Humus-C/ha
  strohHumus: 100,

  async render() {
    const container = document.getElementById('page-humusbilanz');
    if (!container) return;

    const schlaege = await Storage.getSchlaege();
    const kulturen = await Storage.getKulturen();
    const massnahmen = await Storage.getMassnahmen();
    const jahrKulturen = kulturen.filter(k => parseInt(k.jahr) === this.selectedJahr);
    const jahrMassnahmen = massnahmen.filter(m => new Date(m.datum).getFullYear() === this.selectedJahr);

    const bilanzen = schlaege.map(s => {
      const kultur = jahrKulturen.find(k => k.schlagId === s.id);
      const kulturName = kultur ? kultur.kultur : null;
      const kulturHumus = kulturName && this.kulturKoeff[kulturName] !== undefined ? this.kulturKoeff[kulturName] : 0;

      // Organische Düngung Humus-Zufuhr
      const duengungen = jahrMassnahmen.filter(m => m.schlagId === s.id && m.typ === 'duengung' && m.duenger_typ === 'organisch');
      let orgHumus = 0;
      duengungen.forEach(d => {
        const mittel = d.mittel || '';
        const menge = parseFloat(d.menge) || 0;
        // Suche nach passendem Schlüssel
        for (const [key, val] of Object.entries(this.orgDuengerHumus)) {
          if (mittel.toLowerCase().includes(key.toLowerCase().split(' ')[0].toLowerCase())) {
            orgHumus += menge * val; // menge in t/m³ × kg Humus-C/t = kg Humus-C
            break;
          }
        }
      });

      const saldo = kulturHumus + orgHumus;
      return { schlag: s, kultur: kulturName, kulturHumus, orgHumus, saldo };
    });

    const avgSaldo = bilanzen.length > 0 ? bilanzen.reduce((s, b) => s + b.saldo, 0) / bilanzen.length : 0;

    const years = [];
    for (let y = this.selectedJahr - 2; y <= this.selectedJahr + 1; y++) years.push(y);

    let html = `
      <div class="page-header">
        <div>
          <h1>Humusbilanz</h1>
          <p>VDLUFA-Methode – Humussaldo pro Schlag</p>
        </div>
      </div>

      <div class="tab-bar" style="max-width:320px">
        ${years.map(y => `<button class="tab-btn ${y === this.selectedJahr ? 'active' : ''}" onclick="Humusbilanz.setJahr(${y})">${y}</button>`).join('')}
      </div>

      <div class="stats-grid" style="margin-bottom:1.5rem">
        <div class="stat-card">
          <div class="stat-icon ${avgSaldo >= 0 ? 'green' : avgSaldo >= -75 ? 'amber' : 'red'}">
            ${avgSaldo >= 0 ? '✓' : '⚠️'}
          </div>
          <div>
            <div class="stat-value">${avgSaldo >= 0 ? '+' : ''}${formatNumber(avgSaldo, 0)}</div>
            <div class="stat-label">∅ Humus-C (kg/ha)</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green">${Icons.render('auswertung', 22)}</div>
          <div>
            <div class="stat-value">${bilanzen.filter(b => b.saldo >= 0).length} / ${bilanzen.length}</div>
            <div class="stat-label">Schläge positiv</div>
          </div>
        </div>
      </div>

      <div class="section-divider">Humusbilanz pro Schlag</div>

      ${!bilanzen.length ? `<div class="empty-state">
        <div class="empty-icon">${Icons.emptyChart}</div>
        <h3>Keine Schläge vorhanden</h3>
        <p>Lege Schläge und Kulturen an.</p>
      </div>` : `

      <!-- Balkendiagramm -->
      <div class="bar-chart" style="margin-bottom:1.5rem">
        ${bilanzen.filter(b => b.kultur).sort((a, b) => b.saldo - a.saldo).map(b => {
          const maxAbs = Math.max(...bilanzen.filter(x => x.kultur).map(x => Math.abs(x.saldo)), 1);
          const pct = Math.min(100, Math.abs(b.saldo) / maxAbs * 100);
          const colorCls = b.saldo >= 0 ? 'green' : b.saldo >= -75 ? 'amber' : 'red';
          return `<div class="bar-row">
            <span class="bar-label">${esc(b.schlag.name)}</span>
            <div class="bar-track">
              <div class="bar-fill ${colorCls}" style="width:${Math.max(8, pct)}%">${b.saldo >= 0 ? '+' : ''}${formatNumber(b.saldo, 0)} kg</div>
            </div>
          </div>`;
        }).join('')}
      </div>

      <div class="table-wrap"><table>
        <thead><tr>
          <th>Schlag</th><th>Kultur</th><th>Kultur-Humus</th><th>Org. Düngung</th><th>Saldo</th><th>Bewertung</th>
        </tr></thead>
        <tbody>
        ${bilanzen.map(b => {
          const cls = b.saldo >= 0 ? 'ampel-gruen' : b.saldo >= -75 ? 'ampel-gelb' : 'ampel-rot';
          const label = b.saldo >= 0 ? 'Positiv' : b.saldo >= -75 ? 'Toleranz' : 'Kritisch';
          return `<tr>
            <td><strong>${esc(b.schlag.name)}</strong></td>
            <td>${b.kultur || '–'}</td>
            <td style="text-align:center">${b.kulturHumus !== 0 ? formatNumber(b.kulturHumus, 0) : '–'}</td>
            <td style="text-align:center">${b.orgHumus > 0 ? '+' + formatNumber(b.orgHumus, 0) : '–'}</td>
            <td style="text-align:center"><span class="ampel-badge ${cls}">${b.saldo >= 0 ? '+' : ''}${formatNumber(b.saldo, 0)}</span></td>
            <td><span class="badge ${b.saldo >= 0 ? 'badge-green' : b.saldo >= -75 ? 'badge-yellow' : 'badge-red'}">${label}</span></td>
          </tr>`;
        }).join('')}
        </tbody>
      </table></div>`}

      <div class="section-divider">VDLUFA Koeffizienten (Referenz)</div>
      <div class="info-box">
        Bewertung: <strong style="color:var(--success)">≥ 0</strong> = Positiv (Humusaufbau) |
        <strong style="color:var(--warning)">-75 bis 0</strong> = Toleranzbereich |
        <strong style="color:var(--danger)">&lt; -75</strong> = Kritisch (Humusabbau)
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>Kultur</th><th>Humus-C (kg/ha)</th></tr></thead>
        <tbody>
        ${Object.entries(this.kulturKoeff).sort((a, b) => b[1] - a[1]).map(([k, v]) => `
          <tr><td>${k}</td><td style="color:${v >= 0 ? 'var(--success)' : 'var(--danger)'}">${v >= 0 ? '+' : ''}${v}</td></tr>
        `).join('')}
        </tbody>
      </table></div>
    `;

    container.innerHTML = html;
  },

  async setJahr(y) {
    this.selectedJahr = y;
    await this.render();
  }
};

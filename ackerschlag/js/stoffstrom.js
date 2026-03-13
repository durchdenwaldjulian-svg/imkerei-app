/* ============================================
   STOFFSTROMBILANZ – Hof-Tor-Bilanz N/P
   ============================================ */

const Stoffstrom = {
  selectedJahr: new Date().getFullYear(),

  // N/P-Entzugskoeffizienten (kg/dt Ernteprodukt)
  entzug: {
    'Winterweizen': { N: 2.18, P: 0.78 },
    'Sommerweizen': { N: 2.18, P: 0.78 },
    'Wintergerste': { N: 1.80, P: 0.72 },
    'Sommergerste': { N: 1.65, P: 0.72 },
    'Winterroggen': { N: 1.65, P: 0.72 },
    'Triticale': { N: 1.80, P: 0.72 },
    'Hafer': { N: 1.80, P: 0.72 },
    'Winterraps': { N: 3.35, P: 1.60 },
    'Sonnenblumen': { N: 2.80, P: 1.40 },
    'Mais': { N: 1.40, P: 0.60 },
    'Silomais': { N: 0.38, P: 0.16 },
    'Zuckerrüben': { N: 0.18, P: 0.10 },
    'Kartoffeln': { N: 0.35, P: 0.14 },
    'Ackerbohnen': { N: 4.10, P: 1.10 },
    'Erbsen': { N: 3.60, P: 1.00 },
    'Sojabohnen': { N: 5.20, P: 1.20 },
    'Luzerne': { N: 0.50, P: 0.12 },
    'Kleegras': { N: 0.45, P: 0.10 }
  },

  async render() {
    const container = document.getElementById('page-stoffstrom');
    if (!container) return;

    const schlaege = await Storage.getSchlaege();
    const kulturen = await Storage.getKulturen();
    const massnahmen = await Storage.getMassnahmen();

    const gesamtFlaeche = schlaege.reduce((s, x) => s + (parseFloat(x.groesse) || 0), 0);

    // Berechne für ausgewähltes Jahr + 2 Vorjahre (3-Jahres-Mittel)
    const jahresDaten = [];
    for (let y = this.selectedJahr - 2; y <= this.selectedJahr; y++) {
      const jKulturen = kulturen.filter(k => parseInt(k.jahr) === y);
      const jMassnahmen = massnahmen.filter(m => new Date(m.datum).getFullYear() === y);

      // Zufuhr = Düngung
      let nZufuhr = 0, pZufuhr = 0;
      jMassnahmen.filter(m => m.typ === 'duengung').forEach(d => {
        nZufuhr += parseFloat(d.n_gehalt) || 0;
        pZufuhr += parseFloat(d.p_gehalt) || 0;
      });

      // Pro Schlag mit Fläche multiplizieren
      let nZufuhrGesamt = 0, pZufuhrGesamt = 0;
      schlaege.forEach(s => {
        const ha = parseFloat(s.groesse) || 0;
        const sDuengungen = jMassnahmen.filter(m => m.schlagId === s.id && m.typ === 'duengung');
        sDuengungen.forEach(d => {
          nZufuhrGesamt += (parseFloat(d.n_gehalt) || 0) * ha;
          pZufuhrGesamt += (parseFloat(d.p_gehalt) || 0) * ha;
        });
      });

      // Abfuhr = Ernte × Entzugskoeffizient
      let nAbfuhr = 0, pAbfuhr = 0;
      jKulturen.forEach(k => {
        if (!k.ertrag) return;
        const schlag = schlaege.find(s => s.id === k.schlagId);
        const ha = schlag ? parseFloat(schlag.groesse) || 0 : 0;
        const entz = this.entzug[k.kultur];
        if (entz) {
          nAbfuhr += k.ertrag * ha * entz.N;
          pAbfuhr += k.ertrag * ha * entz.P;
        }
      });

      jahresDaten.push({
        jahr: y,
        nZufuhr: nZufuhrGesamt, pZufuhr: pZufuhrGesamt,
        nAbfuhr, pAbfuhr,
        nSaldo: nZufuhrGesamt - nAbfuhr,
        pSaldo: pZufuhrGesamt - pAbfuhr
      });
    }

    const aktuell = jahresDaten.find(j => j.jahr === this.selectedJahr) || { nZufuhr: 0, pZufuhr: 0, nAbfuhr: 0, pAbfuhr: 0, nSaldo: 0, pSaldo: 0 };
    const avgNSaldo = jahresDaten.reduce((s, j) => s + j.nSaldo, 0) / jahresDaten.length;
    const avgNSaldoHa = gesamtFlaeche > 0 ? avgNSaldo / gesamtFlaeche : 0;

    const years = [];
    for (let y = this.selectedJahr - 2; y <= this.selectedJahr + 1; y++) years.push(y);

    let html = `
      <div class="page-header">
        <div>
          <h1>Stoffstrombilanz</h1>
          <p>Hof-Tor-Bilanz – N/P Zufuhr vs. Abfuhr</p>
        </div>
      </div>

      <div class="tab-bar" style="max-width:320px">
        ${years.map(y => `<button class="tab-btn ${y === this.selectedJahr ? 'active' : ''}" onclick="Stoffstrom.setJahr(${y})">${y}</button>`).join('')}
      </div>

      <div class="stats-grid" style="margin-bottom:1.5rem">
        <div class="stat-card">
          <div class="stat-icon ${avgNSaldoHa <= 50 ? 'green' : 'red'}">
            ${avgNSaldoHa <= 50 ? '✓' : '⚠️'}
          </div>
          <div>
            <div class="stat-value">${formatNumber(avgNSaldoHa, 0)} kg</div>
            <div class="stat-label">∅ N-Saldo/ha (3J, max. 50)</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon blue">${Icons.render('auswertung', 22)}</div>
          <div>
            <div class="stat-value">${formatNumber(gesamtFlaeche)} ha</div>
            <div class="stat-label">Betriebsfläche</div>
          </div>
        </div>
      </div>

      ${avgNSaldoHa > 50 ? '<div class="warn-box" style="border-color:#FECACA;background:#FEE2E2;color:#991B1B">⚠️ <strong>Achtung:</strong> N-Saldo im 3-Jahres-Mittel über 50 kg/ha! Düngung reduzieren.</div>' : ''}

      <div class="section-divider">Jahresübersicht</div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>Jahr</th><th>N Zufuhr (kg)</th><th>N Abfuhr (kg)</th><th>N Saldo</th>
          <th>P Zufuhr (kg)</th><th>P Abfuhr (kg)</th><th>P Saldo</th>
        </tr></thead>
        <tbody>
        ${jahresDaten.map(j => `
          <tr ${j.jahr === this.selectedJahr ? 'style="font-weight:600"' : ''}>
            <td>${j.jahr}</td>
            <td>${formatNumber(j.nZufuhr, 0)}</td>
            <td>${formatNumber(j.nAbfuhr, 0)}</td>
            <td style="color:${j.nSaldo <= 0 ? 'var(--success)' : 'var(--warning)'}">
              ${j.nSaldo >= 0 ? '+' : ''}${formatNumber(j.nSaldo, 0)}
            </td>
            <td>${formatNumber(j.pZufuhr, 0)}</td>
            <td>${formatNumber(j.pAbfuhr, 0)}</td>
            <td style="color:${j.pSaldo <= 0 ? 'var(--success)' : 'var(--warning)'}">
              ${j.pSaldo >= 0 ? '+' : ''}${formatNumber(j.pSaldo, 0)}
            </td>
          </tr>`).join('')}
        <tr style="font-weight:700;border-top:2px solid var(--border-default)">
          <td>∅ 3 Jahre</td>
          <td>${formatNumber(jahresDaten.reduce((s, j) => s + j.nZufuhr, 0) / 3, 0)}</td>
          <td>${formatNumber(jahresDaten.reduce((s, j) => s + j.nAbfuhr, 0) / 3, 0)}</td>
          <td style="color:${avgNSaldo <= 0 ? 'var(--success)' : 'var(--warning)'}">
            ${avgNSaldo >= 0 ? '+' : ''}${formatNumber(avgNSaldo, 0)}
          </td>
          <td colspan="3"></td>
        </tr>
        </tbody>
      </table></div>

      <div class="section-divider">Entzugskoeffizienten (Referenz)</div>
      <div class="info-box">
        Obergrenze: <strong>50 kg N/ha</strong> im 3-Jahres-Mittel gemäß Stoffstrombilanzverordnung.
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>Kultur</th><th>N (kg/dt)</th><th>P (kg/dt)</th></tr></thead>
        <tbody>
        ${Object.entries(this.entzug).map(([k, v]) => `
          <tr><td>${k}</td><td>${v.N}</td><td>${v.P}</td></tr>
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

/* ============================================
   DÜNGEPLANER – N/P/K-Bilanz, DüV, Empfehlungen
   ============================================ */

const Duengeplaner = {
  selectedJahr: new Date().getFullYear(),

  // Nährstoffbedarf pro Kultur (kg/ha) – Richtwerte
  kulturBedarf: {
    'Winterweizen': { N: 200, P: 50, K: 60 },
    'Sommerweizen': { N: 160, P: 45, K: 55 },
    'Wintergerste': { N: 180, P: 45, K: 60 },
    'Sommergerste': { N: 140, P: 40, K: 50 },
    'Winterroggen': { N: 150, P: 40, K: 60 },
    'Triticale': { N: 170, P: 45, K: 55 },
    'Winterraps': { N: 200, P: 60, K: 60 },
    'Mais': { N: 200, P: 55, K: 180 },
    'Silomais': { N: 180, P: 55, K: 200 },
    'Zuckerrüben': { N: 150, P: 55, K: 250 },
    'Kartoffeln': { N: 140, P: 45, K: 250 },
    'Sonnenblumen': { N: 120, P: 50, K: 120 },
    'Ackerbohnen': { N: 40, P: 45, K: 50 },
    'Erbsen': { N: 0, P: 40, K: 45 },
    'Luzerne': { N: 0, P: 55, K: 250 },
    'Kleegras': { N: 0, P: 40, K: 180 },
    'Grünland': { N: 180, P: 45, K: 200 },
    'Hafer': { N: 120, P: 40, K: 50 },
    'Sojabohnen': { N: 0, P: 40, K: 50 }
  },

  // Dünger-Stammdaten: N/P/K-Gehalt in %
  duengerStamm: {
    'KAS': { N: 27, P: 0, K: 0, typ: 'mineralisch' },
    'Harnstoff': { N: 46, P: 0, K: 0, typ: 'mineralisch' },
    'DAP': { N: 18, P: 46, K: 0, typ: 'mineralisch' },
    'Kali 60': { N: 0, P: 0, K: 60, typ: 'mineralisch' },
    'NPK 15-15-15': { N: 15, P: 15, K: 15, typ: 'mineralisch' },
    'NPK 20-10-10': { N: 20, P: 10, K: 10, typ: 'mineralisch' },
    'AHL': { N: 28, P: 0, K: 0, typ: 'mineralisch' },
    'SSA': { N: 21, P: 0, K: 0, typ: 'mineralisch' },
    'Thomasphosphat': { N: 0, P: 15, K: 0, typ: 'mineralisch' },
    'Superphosphat': { N: 0, P: 18, K: 0, typ: 'mineralisch' },
    'Patentkali': { N: 0, P: 0, K: 30, typ: 'mineralisch' },
    'Kalkammonsalpeter': { N: 27, P: 0, K: 0, typ: 'mineralisch' },
    'Rindergülle': { N: 4.5, P: 1.8, K: 5.5, typ: 'organisch' },
    'Schweinegülle': { N: 5.5, P: 3.0, K: 3.5, typ: 'organisch' },
    'Stallmist (Rind)': { N: 5.0, P: 2.5, K: 7.0, typ: 'organisch' },
    'Stallmist (Schwein)': { N: 6.5, P: 4.0, K: 5.0, typ: 'organisch' },
    'Hühnermist': { N: 15, P: 10, K: 8, typ: 'organisch' },
    'Gärrest': { N: 4.5, P: 2.0, K: 4.5, typ: 'organisch' },
    'Kompost': { N: 1.0, P: 0.5, K: 0.8, typ: 'organisch' },
    'Branntkalk': { N: 0, P: 0, K: 0, typ: 'kalk' },
    'Kohlensaurer Kalk': { N: 0, P: 0, K: 0, typ: 'kalk' }
  },

  async render() {
    const container = document.getElementById('page-duengeplaner');
    if (!container) return;

    const schlaege = await Storage.getSchlaege();
    const kulturen = await Storage.getKulturen();
    const massnahmen = await Storage.getMassnahmen();
    const jahrKulturen = kulturen.filter(k => parseInt(k.jahr) === this.selectedJahr);
    const jahrMassnahmen = massnahmen.filter(m => {
      return new Date(m.datum).getFullYear() === this.selectedJahr && m.typ === 'duengung';
    });

    // Bilanz pro Schlag berechnen
    const bilanzen = schlaege.map(s => {
      const kultur = jahrKulturen.find(k => k.schlagId === s.id);
      const kulturName = kultur ? kultur.kultur : null;
      const bedarf = kulturName && this.kulturBedarf[kulturName] ? this.kulturBedarf[kulturName] : { N: 0, P: 0, K: 0 };

      // Zufuhr aus Maßnahmen
      const duengungen = jahrMassnahmen.filter(m => m.schlagId === s.id);
      let nZufuhr = 0, pZufuhr = 0, kZufuhr = 0, nOrganisch = 0;
      duengungen.forEach(d => {
        const n = parseFloat(d.n_gehalt) || 0;
        const p = parseFloat(d.p_gehalt) || 0;
        const k = parseFloat(d.k_gehalt) || 0;
        nZufuhr += n;
        pZufuhr += p;
        kZufuhr += k;
        if (d.duenger_typ === 'organisch') nOrganisch += n;
      });

      const nSaldo = nZufuhr - bedarf.N;
      const pSaldo = pZufuhr - bedarf.P;
      const kSaldo = kZufuhr - bedarf.K;

      return {
        schlag: s, kultur: kulturName, bedarf,
        zufuhr: { N: nZufuhr, P: pZufuhr, K: kZufuhr },
        saldo: { N: nSaldo, P: pSaldo, K: kSaldo },
        nOrganisch,
        duevWarnung: nOrganisch > 170
      };
    });

    const gesamtFlaeche = schlaege.reduce((s, x) => s + (parseFloat(x.groesse) || 0), 0);
    const gesamtNOrg = bilanzen.reduce((s, b) => s + (b.nOrganisch * (parseFloat(b.schlag.groesse) || 0)), 0);
    const avgNOrg = gesamtFlaeche > 0 ? gesamtNOrg / gesamtFlaeche : 0;

    // Jahr-Filter
    const years = [];
    for (let y = this.selectedJahr - 2; y <= this.selectedJahr + 1; y++) years.push(y);

    container.querySelector('.page-header + .tab-bar') || null;

    let html = `
      <div class="page-header">
        <div>
          <h1>Düngeplaner</h1>
          <p>N/P/K-Bilanz, DüV-Prüfung und Empfehlungen</p>
        </div>
      </div>

      <div class="tab-bar" style="max-width:320px">
        ${years.map(y => `<button class="tab-btn ${y === this.selectedJahr ? 'active' : ''}" onclick="Duengeplaner.setJahr(${y})">${y}</button>`).join('')}
      </div>

      <!-- DüV Übersicht -->
      <div class="stats-grid" style="margin-bottom:1.5rem">
        <div class="stat-card">
          <div class="stat-icon ${avgNOrg > 170 ? 'red' : 'green'}" style="font-size:1.2rem">${avgNOrg > 170 ? '⚠️' : '✓'}</div>
          <div>
            <div class="stat-value">${formatNumber(avgNOrg, 0)} kg</div>
            <div class="stat-label">∅ N organisch / ha (max. 170)</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon blue">${Icons.render('auswertung', 22)}</div>
          <div>
            <div class="stat-value">${bilanzen.filter(b => b.kultur).length}</div>
            <div class="stat-label">Schläge mit Kultur</div>
          </div>
        </div>
      </div>

      ${avgNOrg > 170 ? '<div class="warn-box" style="border-color:#FECACA;background:#FEE2E2;color:#991B1B">⚠️ <strong>DüV-Warnung:</strong> Die durchschnittliche organische N-Düngung liegt über 170 kg N/ha! Maßnahmen reduzieren oder Fläche erweitern.</div>' : ''}

      <div class="section-divider">Nährstoffbilanz pro Schlag</div>
    `;

    if (!bilanzen.length) {
      html += `<div class="empty-state">
        <div class="empty-icon">${Icons.emptyChart}</div>
        <h3>Keine Schläge vorhanden</h3>
        <p>Lege zuerst Schläge an, um den Düngeplaner zu nutzen.</p>
      </div>`;
    } else {
      html += `<div class="table-wrap"><table>
        <thead><tr>
          <th>Schlag</th><th>Kultur</th><th>Fläche</th>
          <th style="text-align:center">N-Bilanz</th>
          <th style="text-align:center">P-Bilanz</th>
          <th style="text-align:center">K-Bilanz</th>
          <th>Status</th>
        </tr></thead>
        <tbody>
        ${bilanzen.map(b => {
          const ampelN = this.getAmpel(b.saldo.N, b.bedarf.N);
          const ampelP = this.getAmpel(b.saldo.P, b.bedarf.P);
          const ampelK = this.getAmpel(b.saldo.K, b.bedarf.K);
          return `<tr>
            <td><strong>${esc(b.schlag.name)}</strong></td>
            <td>${b.kultur || '<span style="color:var(--text-soft)">–</span>'}</td>
            <td>${formatNumber(b.schlag.groesse)} ha</td>
            <td style="text-align:center">
              <span class="ampel-badge ${ampelN.cls}">${b.saldo.N > 0 ? '+' : ''}${formatNumber(b.saldo.N, 0)}</span>
              <div style="font-size:0.68rem;color:var(--text-soft)">${formatNumber(b.zufuhr.N, 0)} / ${formatNumber(b.bedarf.N, 0)}</div>
            </td>
            <td style="text-align:center">
              <span class="ampel-badge ${ampelP.cls}">${b.saldo.P > 0 ? '+' : ''}${formatNumber(b.saldo.P, 0)}</span>
              <div style="font-size:0.68rem;color:var(--text-soft)">${formatNumber(b.zufuhr.P, 0)} / ${formatNumber(b.bedarf.P, 0)}</div>
            </td>
            <td style="text-align:center">
              <span class="ampel-badge ${ampelK.cls}">${b.saldo.K > 0 ? '+' : ''}${formatNumber(b.saldo.K, 0)}</span>
              <div style="font-size:0.68rem;color:var(--text-soft)">${formatNumber(b.zufuhr.K, 0)} / ${formatNumber(b.bedarf.K, 0)}</div>
            </td>
            <td>${b.duevWarnung ? '<span class="badge badge-red">DüV!</span>' : b.kultur ? '<span class="badge badge-green">OK</span>' : '<span class="badge badge-gray">–</span>'}</td>
          </tr>`;
        }).join('')}
        </tbody>
      </table></div>`;

      // Empfehlungen bei Defizit
      const defizite = bilanzen.filter(b => b.kultur && (b.saldo.N < -20 || b.saldo.P < -10 || b.saldo.K < -20));
      if (defizite.length) {
        html += `<div class="section-divider">Düngeempfehlungen</div>`;
        defizite.forEach(b => {
          let empf = [];
          if (b.saldo.N < -20) empf.push(`${formatNumber(Math.abs(b.saldo.N) / 0.27, 0)} kg/ha KAS (27% N) oder ${formatNumber(Math.abs(b.saldo.N) / 0.46, 0)} kg/ha Harnstoff`);
          if (b.saldo.P < -10) empf.push(`${formatNumber(Math.abs(b.saldo.P) / 0.46, 0)} kg/ha DAP (46% P₂O₅)`);
          if (b.saldo.K < -20) empf.push(`${formatNumber(Math.abs(b.saldo.K) / 0.60, 0)} kg/ha Kali 60`);
          html += `<div class="card" style="padding:0.85rem 1rem">
            <strong>${esc(b.schlag.name)}</strong> – ${b.kultur}
            <ul style="margin:0.3rem 0 0 1.2rem;font-size:0.85rem;color:var(--text-secondary)">
              ${empf.map(e => `<li>${e}</li>`).join('')}
            </ul>
          </div>`;
        });
      }
    }

    // Dünger-Referenz
    html += `
      <div class="section-divider">Dünger-Stammdaten (Referenz)</div>
      <div class="table-wrap"><table>
        <thead><tr><th>Dünger</th><th>N %</th><th>P₂O₅ %</th><th>K₂O %</th><th>Typ</th></tr></thead>
        <tbody>
        ${Object.entries(this.duengerStamm).map(([name, d]) => `
          <tr>
            <td>${name}</td>
            <td>${d.N || '–'}</td>
            <td>${d.P || '–'}</td>
            <td>${d.K || '–'}</td>
            <td><span class="badge ${d.typ === 'organisch' ? 'badge-green' : d.typ === 'kalk' ? 'badge-blue' : 'badge-gray'}">${d.typ}</span></td>
          </tr>`).join('')}
        </tbody>
      </table></div>
    `;

    container.innerHTML = html;
  },

  getAmpel(saldo, bedarf) {
    if (bedarf === 0) return { cls: 'ampel-grau', label: '–' };
    const pct = (saldo / bedarf) * 100;
    if (saldo >= -10) return { cls: 'ampel-gruen', label: 'OK' };
    if (saldo >= -bedarf * 0.3) return { cls: 'ampel-gelb', label: 'Leicht unterversorgt' };
    return { cls: 'ampel-rot', label: 'Unterversorgt' };
  },

  async setJahr(y) {
    this.selectedJahr = y;
    await this.render();
  }
};

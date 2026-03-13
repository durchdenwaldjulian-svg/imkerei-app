/* ============================================
   BODENPROBEN – Nährstoffanalyse & Gehaltsklassen
   ============================================ */

const Bodenproben = {
  editId: null,

  // Gehaltsklassen-Definitionen (VDLUFA)
  klassen: {
    ph: [
      { klasse: 'A', label: 'sehr niedrig', max: 5.5 },
      { klasse: 'B', label: 'niedrig',      max: 6.0 },
      { klasse: 'C', label: 'optimal',       max: 6.5 },
      { klasse: 'D', label: 'hoch',          max: 7.0 },
      { klasse: 'E', label: 'sehr hoch',     max: Infinity }
    ],
    p: [
      { klasse: 'A', label: 'sehr niedrig', max: 3 },
      { klasse: 'B', label: 'niedrig',      max: 6 },
      { klasse: 'C', label: 'optimal',       max: 12 },
      { klasse: 'D', label: 'hoch',          max: 20 },
      { klasse: 'E', label: 'sehr hoch',     max: Infinity }
    ],
    k: [
      { klasse: 'A', label: 'sehr niedrig', max: 4 },
      { klasse: 'B', label: 'niedrig',      max: 8 },
      { klasse: 'C', label: 'optimal',       max: 15 },
      { klasse: 'D', label: 'hoch',          max: 25 },
      { klasse: 'E', label: 'sehr hoch',     max: Infinity }
    ],
    mg: [
      { klasse: 'A', label: 'sehr niedrig', max: 3 },
      { klasse: 'B', label: 'niedrig',      max: 5 },
      { klasse: 'C', label: 'optimal',       max: 10 },
      { klasse: 'D', label: 'hoch',          max: 15 },
      { klasse: 'E', label: 'sehr hoch',     max: Infinity }
    ]
  },

  getKlasse(typ, wert) {
    if (wert === null || wert === undefined || isNaN(wert)) return null;
    const stufen = this.klassen[typ];
    if (!stufen) return null;
    for (const s of stufen) {
      if (wert < s.max) return s;
    }
    return stufen[stufen.length - 1];
  },

  klasseBadge(typ, wert) {
    const k = this.getKlasse(typ, wert);
    if (!k) return '–';
    const colorCls = (k.klasse === 'C') ? 'ampel-gruen' : (k.klasse === 'B' || k.klasse === 'D') ? 'ampel-gelb' : 'ampel-rot';
    return `<span class="ampel-badge ${colorCls}" title="${k.label}">${k.klasse}</span>`;
  },

  klasseColor(typ, wert) {
    const k = this.getKlasse(typ, wert);
    if (!k) return '';
    return (k.klasse === 'C') ? 'badge-green' : (k.klasse === 'B' || k.klasse === 'D') ? 'badge-yellow' : 'badge-red';
  },

  async render() {
    const container = document.getElementById('page-bodenproben');
    if (!container) return;

    const schlaege = await Storage.getSchlaege();
    const proben = await Storage.getBodenproben();

    // Statistik über alle Proben (jeweils letzte pro Schlag)
    const latestPerSchlag = this.getLatestPerSchlag(proben, schlaege);
    const stats = this.calcStats(latestPerSchlag);
    const empfehlungen = this.getEmpfehlungen(latestPerSchlag);

    let html = `
      <div class="page-header">
        <div>
          <h1>Bodenproben</h1>
          <p>Nährstoffanalysen & Gehaltsklassen (VDLUFA)</p>
        </div>
        <button class="btn btn-primary" onclick="Bodenproben.openModal()">
          ${Icons.render('plus', 16)} Neue Bodenprobe
        </button>
      </div>

      <!-- Statistik-Übersicht -->
      <div class="stats-grid" style="margin-bottom:1.5rem">
        <div class="stat-card">
          <div class="stat-icon">${Icons.render('auswertung', 22)}</div>
          <div>
            <div class="stat-value">${proben.length}</div>
            <div class="stat-label">Bodenproben gesamt</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon ${stats.avgPh !== null ? (stats.avgPh >= 6.0 && stats.avgPh <= 6.5 ? 'green' : stats.avgPh >= 5.5 && stats.avgPh <= 7.0 ? 'amber' : 'red') : ''}">\u2B21</div>
          <div>
            <div class="stat-value">${stats.avgPh !== null ? formatNumber(stats.avgPh, 1) : '–'}</div>
            <div class="stat-label">∅ pH-Wert</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">P</div>
          <div>
            <div class="stat-value">${stats.avgP !== null ? formatNumber(stats.avgP, 1) : '–'}</div>
            <div class="stat-label">∅ P (mg/100g)</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">K</div>
          <div>
            <div class="stat-value">${stats.avgK !== null ? formatNumber(stats.avgK, 1) : '–'}</div>
            <div class="stat-label">∅ K (mg/100g)</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">Mg</div>
          <div>
            <div class="stat-value">${stats.avgMg !== null ? formatNumber(stats.avgMg, 1) : '–'}</div>
            <div class="stat-label">∅ Mg (mg/100g)</div>
          </div>
        </div>
      </div>

      <!-- Empfehlungen -->
      ${empfehlungen.length > 0 ? `
        <div class="section-divider">Handlungsempfehlungen</div>
        <div class="info-box" style="margin-bottom:1.5rem">
          <ul style="margin:0;padding-left:1.2rem">
            ${empfehlungen.map(e => `<li style="margin-bottom:0.3rem">${e}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      <!-- Gehaltsklassen-Legende -->
      <div class="section-divider">Gehaltsklassen-Übersicht</div>
      <div class="info-box" style="margin-bottom:1.5rem">
        <span class="ampel-badge ampel-rot">A</span> sehr niedrig &nbsp;
        <span class="ampel-badge ampel-gelb">B</span> niedrig &nbsp;
        <span class="ampel-badge ampel-gruen">C</span> optimal &nbsp;
        <span class="ampel-badge ampel-gelb">D</span> hoch &nbsp;
        <span class="ampel-badge ampel-rot">E</span> sehr hoch
      </div>

      <!-- Übersichtstabelle: Letzte Probe pro Schlag -->
      <div class="section-divider">Aktuelle Bodenversorgung pro Schlag</div>

      ${!latestPerSchlag.length ? `
        <div class="empty-state">
          <div class="empty-icon">${Icons.render('auswertung', 48)}</div>
          <h3>Keine Bodenproben vorhanden</h3>
          <p>Erfasse deine erste Bodenprobe, um die Nährstoffversorgung zu dokumentieren.</p>
          <button class="btn btn-primary" onclick="Bodenproben.openModal()">
            ${Icons.render('plus', 16)} Neue Bodenprobe
          </button>
        </div>
      ` : `
        <div class="table-wrap"><table>
          <thead><tr>
            <th>Schlag</th>
            <th>Datum</th>
            <th style="text-align:center">pH</th>
            <th style="text-align:center">P</th>
            <th style="text-align:center">K</th>
            <th style="text-align:center">Mg</th>
            <th style="text-align:center">Humus %</th>
            <th></th>
          </tr></thead>
          <tbody>
          ${latestPerSchlag.map(item => {
            const bp = item.probe;
            return `<tr>
              <td><strong>${esc(item.schlagName)}</strong></td>
              <td>${formatDate(bp.datum)}</td>
              <td style="text-align:center">${bp.ph_wert !== null ? formatNumber(bp.ph_wert, 1) : '–'} ${this.klasseBadge('ph', bp.ph_wert)}</td>
              <td style="text-align:center">${bp.p_gehalt !== null ? formatNumber(bp.p_gehalt, 1) : '–'} ${this.klasseBadge('p', bp.p_gehalt)}</td>
              <td style="text-align:center">${bp.k_gehalt !== null ? formatNumber(bp.k_gehalt, 1) : '–'} ${this.klasseBadge('k', bp.k_gehalt)}</td>
              <td style="text-align:center">${bp.mg_gehalt !== null ? formatNumber(bp.mg_gehalt, 1) : '–'} ${this.klasseBadge('mg', bp.mg_gehalt)}</td>
              <td style="text-align:center">${bp.humus_prozent !== null ? formatNumber(bp.humus_prozent, 1) + ' %' : '–'}</td>
              <td style="text-align:right;white-space:nowrap">
                <button class="btn-icon" style="width:28px;height:28px" onclick="Bodenproben.openModal('${bp.id}')" title="Bearbeiten">${Icons.render('edit', 14)}</button>
                <button class="btn-icon" style="width:28px;height:28px" onclick="Bodenproben.deleteProbe('${bp.id}')" title="Löschen">${Icons.render('trash', 14)}</button>
              </td>
            </tr>`;
          }).join('')}
          </tbody>
        </table></div>
      `}

      <!-- Alle Proben chronologisch -->
      ${proben.length > latestPerSchlag.length ? this.renderAlleProben(proben, schlaege) : ''}
    `;

    container.innerHTML = html;
  },

  renderAlleProben(proben, schlaege) {
    const sorted = [...proben].sort((a, b) => new Date(b.datum) - new Date(a.datum));
    const schlagMap = {};
    schlaege.forEach(s => schlagMap[s.id] = s.name);

    return `
      <div class="section-divider" style="margin-top:2rem">Alle Bodenproben (chronologisch)</div>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>Schlag</th>
          <th>Datum</th>
          <th style="text-align:center">pH</th>
          <th style="text-align:center">P</th>
          <th style="text-align:center">K</th>
          <th style="text-align:center">Mg</th>
          <th style="text-align:center">Humus</th>
          <th>Bemerkung</th>
          <th></th>
        </tr></thead>
        <tbody>
        ${sorted.map(bp => `<tr>
          <td><strong>${esc(schlagMap[bp.schlag_id] || 'Unbekannt')}</strong></td>
          <td>${formatDate(bp.datum)}</td>
          <td style="text-align:center">${bp.ph_wert !== null ? formatNumber(bp.ph_wert, 1) : '–'} ${this.klasseBadge('ph', bp.ph_wert)}</td>
          <td style="text-align:center">${bp.p_gehalt !== null ? formatNumber(bp.p_gehalt, 1) : '–'} ${this.klasseBadge('p', bp.p_gehalt)}</td>
          <td style="text-align:center">${bp.k_gehalt !== null ? formatNumber(bp.k_gehalt, 1) : '–'} ${this.klasseBadge('k', bp.k_gehalt)}</td>
          <td style="text-align:center">${bp.mg_gehalt !== null ? formatNumber(bp.mg_gehalt, 1) : '–'} ${this.klasseBadge('mg', bp.mg_gehalt)}</td>
          <td style="text-align:center">${bp.humus_prozent !== null ? formatNumber(bp.humus_prozent, 1) + ' %' : '–'}</td>
          <td style="max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${bp.bemerkung ? esc(bp.bemerkung) : ''}">${bp.bemerkung ? esc(bp.bemerkung) : '–'}</td>
          <td style="text-align:right;white-space:nowrap">
            <button class="btn-icon" style="width:28px;height:28px" onclick="Bodenproben.openModal('${bp.id}')" title="Bearbeiten">${Icons.render('edit', 14)}</button>
            <button class="btn-icon" style="width:28px;height:28px" onclick="Bodenproben.deleteProbe('${bp.id}')" title="Löschen">${Icons.render('trash', 14)}</button>
          </td>
        </tr>`).join('')}
        </tbody>
      </table></div>
    `;
  },

  getLatestPerSchlag(proben, schlaege) {
    const map = {};
    proben.forEach(bp => {
      if (!map[bp.schlag_id] || new Date(bp.datum) > new Date(map[bp.schlag_id].datum)) {
        map[bp.schlag_id] = bp;
      }
    });

    return schlaege
      .filter(s => map[s.id])
      .map(s => ({ schlagName: s.name, probe: map[s.id] }))
      .sort((a, b) => a.schlagName.localeCompare(b.schlagName));
  },

  calcStats(latestPerSchlag) {
    const vals = (key) => latestPerSchlag.map(i => i.probe[key]).filter(v => v !== null && v !== undefined && !isNaN(v));
    const avg = (arr) => arr.length > 0 ? arr.reduce((s, v) => s + v, 0) / arr.length : null;

    return {
      avgPh: avg(vals('ph_wert')),
      avgP:  avg(vals('p_gehalt')),
      avgK:  avg(vals('k_gehalt')),
      avgMg: avg(vals('mg_gehalt'))
    };
  },

  getEmpfehlungen(latestPerSchlag) {
    const empf = [];
    latestPerSchlag.forEach(item => {
      const bp = item.probe;
      const name = item.schlagName;

      if (bp.ph_wert !== null && bp.ph_wert < 6.0) {
        empf.push(`<strong>${esc(name)}:</strong> Kalkung empfohlen (pH ${formatNumber(bp.ph_wert, 1)})`);
      }
      if (bp.p_gehalt !== null && bp.p_gehalt < 6) {
        empf.push(`<strong>${esc(name)}:</strong> P-Düngung erhöhen (P = ${formatNumber(bp.p_gehalt, 1)} mg/100g, Klasse ${this.getKlasse('p', bp.p_gehalt)?.klasse || '?'})`);
      }
      if (bp.k_gehalt !== null && bp.k_gehalt < 8) {
        empf.push(`<strong>${esc(name)}:</strong> K-Düngung erhöhen (K = ${formatNumber(bp.k_gehalt, 1)} mg/100g, Klasse ${this.getKlasse('k', bp.k_gehalt)?.klasse || '?'})`);
      }
      if (bp.mg_gehalt !== null && bp.mg_gehalt < 5) {
        empf.push(`<strong>${esc(name)}:</strong> Mg-Düngung erhöhen (Mg = ${formatNumber(bp.mg_gehalt, 1)} mg/100g, Klasse ${this.getKlasse('mg', bp.mg_gehalt)?.klasse || '?'})`);
      }
      if (bp.humus_prozent !== null && bp.humus_prozent < 1.5) {
        empf.push(`<strong>${esc(name)}:</strong> Humusgehalt kritisch niedrig (${formatNumber(bp.humus_prozent, 1)} %) – organische Düngung oder Zwischenfruchtanbau empfohlen`);
      }
    });
    return empf;
  },

  async openModal(id) {
    this.editId = id || null;

    const schlaege = await Storage.getSchlaege();
    const schlagSelect = document.getElementById('bpSchlag');
    if (schlagSelect) {
      schlagSelect.innerHTML = '<option value="">Schlag wählen...</option>' +
        schlaege.map(s => `<option value="${s.id}">${esc(s.name)} (${formatNumber(s.groesse)} ha)</option>`).join('');
    }

    // Felder zurücksetzen
    const form = document.getElementById('bodenprobeForm');
    if (form) form.reset();

    if (id) {
      const proben = await Storage.getBodenproben();
      const bp = proben.find(p => p.id === id);
      if (bp) {
        document.getElementById('bpModalTitle').textContent = 'Bodenprobe bearbeiten';
        if (schlagSelect) schlagSelect.value = bp.schlag_id;
        document.getElementById('bpDatum').value = bp.datum || '';
        document.getElementById('bpPh').value = bp.ph_wert !== null ? bp.ph_wert : '';
        document.getElementById('bpP').value = bp.p_gehalt !== null ? bp.p_gehalt : '';
        document.getElementById('bpK').value = bp.k_gehalt !== null ? bp.k_gehalt : '';
        document.getElementById('bpMg').value = bp.mg_gehalt !== null ? bp.mg_gehalt : '';
        document.getElementById('bpHumus').value = bp.humus_prozent !== null ? bp.humus_prozent : '';
        document.getElementById('bpBemerkung').value = bp.bemerkung || '';
      }
    } else {
      document.getElementById('bpModalTitle').textContent = 'Neue Bodenprobe';
      document.getElementById('bpDatum').value = new Date().toISOString().split('T')[0];
    }

    openModal('bodenprobeModal');
  },

  async save() {
    const schlagId = document.getElementById('bpSchlag').value;
    const datum = document.getElementById('bpDatum').value;

    if (!schlagId) { showToast('Bitte Schlag wählen', 'warning'); return; }
    if (!datum) { showToast('Bitte Datum eingeben', 'warning'); return; }

    const phVal = document.getElementById('bpPh').value;
    const pVal = document.getElementById('bpP').value;
    const kVal = document.getElementById('bpK').value;
    const mgVal = document.getElementById('bpMg').value;
    const humusVal = document.getElementById('bpHumus').value;

    if (!phVal && !pVal && !kVal && !mgVal && !humusVal) {
      showToast('Bitte mindestens einen Analysewert eingeben', 'warning');
      return;
    }

    const data = {
      id: this.editId || undefined,
      schlagId: schlagId,
      datum,
      ph_wert: phVal !== '' ? parseFloat(phVal) : null,
      p_gehalt: pVal !== '' ? parseFloat(pVal) : null,
      k_gehalt: kVal !== '' ? parseFloat(kVal) : null,
      mg_gehalt: mgVal !== '' ? parseFloat(mgVal) : null,
      humus_prozent: humusVal !== '' ? parseFloat(humusVal) : null,
      bemerkung: document.getElementById('bpBemerkung').value.trim()
    };

    await Storage.saveBodenprobe(data);
    closeModal('bodenprobeModal');
    showToast(this.editId ? 'Bodenprobe aktualisiert' : 'Bodenprobe gespeichert', 'success');
    await this.render();
  },

  async deleteProbe(id) {
    if (!confirm('Bodenprobe wirklich löschen?')) return;
    await Storage.deleteBodenprobe(id);
    showToast('Bodenprobe gelöscht', 'success');
    await this.render();
  }
};

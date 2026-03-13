/* ============================================
   FRUCHTFOLGE – Fruchtfolge-Planer & Regeln
   Visueller Anbauplan mit Warnungen
   ============================================ */

const Fruchtfolge = {

  // Alle verfuegbaren Kulturen
  kulturListe: [
    'Winterweizen', 'Sommerweizen', 'Wintergerste', 'Sommergerste',
    'Winterroggen', 'Triticale', 'Hafer', 'Winterraps', 'Sonnenblumen',
    'Mais', 'Silomais', 'Zuckerrüben', 'Kartoffeln', 'Ackerbohnen',
    'Erbsen', 'Sojabohnen', 'Luzerne', 'Kleegras', 'Grünland'
  ],

  // Kulturgruppen fuer Farbcodierung
  kulturGruppen: {
    'Winterweizen':  'getreide',
    'Sommerweizen':  'getreide',
    'Wintergerste':  'getreide',
    'Sommergerste':  'getreide',
    'Winterroggen':  'getreide',
    'Triticale':     'getreide',
    'Hafer':         'getreide',
    'Winterraps':    'oelsaaten',
    'Sonnenblumen':  'oelsaaten',
    'Mais':          'getreide',
    'Silomais':      'getreide',
    'Zuckerrüben':   'hackfruechte',
    'Kartoffeln':    'hackfruechte',
    'Ackerbohnen':   'leguminosen',
    'Erbsen':        'leguminosen',
    'Sojabohnen':    'leguminosen',
    'Luzerne':       'futterpflanzen',
    'Kleegras':      'futterpflanzen',
    'Grünland':      'futterpflanzen'
  },

  // Farben pro Gruppe
  gruppenFarben: {
    getreide:      { bg: '#e8f5e9', border: '#81c784', label: 'Getreide' },
    hackfruechte:  { bg: '#fff9c4', border: '#fdd835', label: 'Hackfrüchte' },
    oelsaaten:     { bg: '#e3f2fd', border: '#64b5f6', label: 'Ölsaaten' },
    leguminosen:   { bg: '#f3e5f5', border: '#ba68c8', label: 'Leguminosen' },
    futterpflanzen:{ bg: '#e0f2f1', border: '#4db6ac', label: 'Futterpflanzen' }
  },

  // Getreidearten fuer Monokultur-Check
  getreideArten: new Set([
    'Winterweizen', 'Sommerweizen', 'Wintergerste', 'Sommergerste',
    'Winterroggen', 'Triticale', 'Hafer'
  ]),

  leguminosen: new Set(['Ackerbohnen', 'Erbsen', 'Sojabohnen']),

  async render() {
    const container = document.getElementById('page-fruchtfolge');
    if (!container) return;

    const schlaege = await Storage.getSchlaege();
    const kulturen = await Storage.getKulturen();
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2];

    // Kultur-Map: schlagId -> jahr -> kulturObj
    const kulturMap = {};
    kulturen.forEach(k => {
      const sid = k.schlagId;
      const j = parseInt(k.jahr);
      if (!kulturMap[sid]) kulturMap[sid] = {};
      kulturMap[sid][j] = k;
    });

    // Warnungen berechnen
    const warnungen = this._berechneWarnungen(schlaege, kulturMap, years);
    const totalWarnings = Object.values(warnungen).reduce((sum, arr) => sum + arr.length, 0);

    // Diversitaets-Index
    const { uniqueCrops, totalSlots } = this._berechneDiversitaet(schlaege, kulturMap, years);
    const diversityIndex = totalSlots > 0 ? (uniqueCrops / totalSlots * 100).toFixed(0) : 0;

    // Empfehlungen
    const empfehlungen = this._berechneEmpfehlungen(schlaege, kulturMap, years, currentYear);

    const html = `
      <div class="page-header">
        <h2>${Icons.render('kulturen', 26)} Fruchtfolge-Planer</h2>
        <p>Planen Sie Ihre Fruchtfolge und erkennen Sie potenzielle Probleme.</p>
      </div>

      <!-- Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background:var(--primary-light,#e3f2fd);color:var(--primary,#1565c0)">
            ${Icons.render('schlaege', 22)}
          </div>
          <div class="stat-value">${formatNumber(schlaege.length, 0)}</div>
          <div class="stat-label">Schläge</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:#e8f5e9;color:#2e7d32">
            ${Icons.render('kulturen', 22)}
          </div>
          <div class="stat-value">${diversityIndex}%</div>
          <div class="stat-label">Diversitätsindex</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:${totalWarnings > 0 ? '#fff3e0' : '#e8f5e9'};color:${totalWarnings > 0 ? '#e65100' : '#2e7d32'}">
            ${Icons.render('massnahmen', 22)}
          </div>
          <div class="stat-value">${totalWarnings}</div>
          <div class="stat-label">Warnungen</div>
        </div>
      </div>

      <!-- Legende -->
      <div class="card" style="margin-bottom:1rem">
        <div style="display:flex;flex-wrap:wrap;gap:0.75rem;align-items:center">
          <strong style="margin-right:0.5rem">Legende:</strong>
          ${Object.values(this.gruppenFarben).map(g =>
            `<span style="display:inline-flex;align-items:center;gap:0.3rem">
              <span style="width:14px;height:14px;border-radius:3px;background:${g.bg};border:2px solid ${g.border};display:inline-block"></span>
              <span style="font-size:0.85rem">${esc(g.label)}</span>
            </span>`
          ).join('')}
        </div>
      </div>

      ${totalWarnings > 0 ? `
        <div class="warn-box" style="margin-bottom:1rem">
          <strong>Achtung:</strong> Es wurden ${totalWarnings} Fruchtfolge-Warnung${totalWarnings !== 1 ? 'en' : ''} erkannt. Prüfen Sie die markierten Zellen in der Tabelle.
        </div>
      ` : `
        <div class="info-box" style="margin-bottom:1rem">
          Keine Fruchtfolge-Verstöße erkannt. Ihre Planung sieht gut aus!
        </div>
      `}

      <!-- Fruchtfolge-Tabelle -->
      <div class="card">
        <h3 style="margin-bottom:1rem">Anbauplanung</h3>
        <div class="table-wrap">
          <table style="width:100%;border-collapse:collapse;min-width:700px">
            <thead>
              <tr>
                <th style="text-align:left;padding:0.6rem;border-bottom:2px solid var(--border,#ddd);min-width:140px;position:sticky;left:0;background:var(--card-bg,#fff);z-index:1">Schlag</th>
                ${years.map(y => `
                  <th style="text-align:center;padding:0.6rem;border-bottom:2px solid var(--border,#ddd);min-width:150px;${y === currentYear ? 'background:rgba(21,101,192,0.06);font-weight:700' : ''}">
                    ${y}${y === currentYear ? ' (aktuell)' : ''}${y > currentYear ? ' ✎' : ''}
                  </th>
                `).join('')}
              </tr>
            </thead>
            <tbody>
              ${schlaege.length === 0 ? `
                <tr><td colspan="${years.length + 1}" style="text-align:center;padding:2rem;color:#888">
                  Keine Schläge vorhanden. Legen Sie zuerst Felder an.
                </td></tr>
              ` : schlaege.map(s => this._renderRow(s, years, kulturMap, warnungen, currentYear)).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Empfehlungen -->
      ${empfehlungen.length > 0 ? `
        <div class="section-divider"></div>
        <div class="card">
          <h3 style="margin-bottom:1rem">${Icons.render('auswertung', 20)} Empfehlungen</h3>
          <div style="display:flex;flex-direction:column;gap:0.75rem">
            ${empfehlungen.map(e => `
              <div class="info-box" style="margin:0">
                <strong>${esc(e.schlag)}:</strong> ${esc(e.text)}
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    `;

    container.innerHTML = html;
  },

  // =========== Zeile rendern ===========
  _renderRow(schlag, years, kulturMap, warnungen, currentYear) {
    const sid = schlag.id;
    const cells = years.map(year => {
      const kultur = kulturMap[sid] ? kulturMap[sid][year] : null;
      const kulturName = kultur ? kultur.kultur : null;
      const isPast = year <= currentYear;
      const isFuture = year > currentYear;
      const cellKey = `${sid}_${year}`;
      const cellWarnungen = warnungen[cellKey] || [];

      // Farbe bestimmen
      const gruppe = kulturName ? this.kulturGruppen[kulturName] : null;
      const farbe = gruppe ? this.gruppenFarben[gruppe] : null;
      const bgStyle = farbe ? `background:${farbe.bg};border-left:3px solid ${farbe.border}` : 'background:var(--bg,#f9f9f9)';

      // Warnungs-Icons
      const warnHtml = cellWarnungen.map(w => {
        const isRed = w.severity === 'error';
        return `<span class="badge ${isRed ? 'badge-red' : 'badge-yellow'}" style="font-size:0.7rem;margin-top:0.25rem;display:inline-block" title="${esc(w.text)}">
          ${isRed ? '⛔' : '⚠️'} ${esc(w.short)}
        </span>`;
      }).join(' ');

      if (isFuture) {
        // Zukunft: Dropdown
        const selectId = `ff_sel_${sid}_${year}`;
        return `<td style="padding:0.4rem;${bgStyle};vertical-align:top">
          <select id="${selectId}" class="form-select" style="width:100%;font-size:0.85rem;padding:0.3rem"
                  onchange="Fruchtfolge._onPlan('${sid}', ${year}, this.value, '${kultur ? kultur.id : ''}')">
            <option value="">Planen...</option>
            ${this.kulturListe.map(k =>
              `<option value="${esc(k)}" ${kulturName === k ? 'selected' : ''}>${esc(k)}</option>`
            ).join('')}
          </select>
          ${warnHtml ? `<div style="margin-top:0.2rem">${warnHtml}</div>` : ''}
        </td>`;
      } else {
        // Vergangenheit / aktuell: nur Anzeige
        return `<td style="padding:0.5rem;${bgStyle};vertical-align:top">
          ${kulturName
            ? `<span style="font-weight:500;font-size:0.9rem">${esc(kulturName)}</span>
               ${kultur.sorte ? `<br><span style="font-size:0.75rem;color:#666">${esc(kultur.sorte)}</span>` : ''}`
            : `<span style="color:#aaa;font-size:0.85rem">–</span>`}
          ${warnHtml ? `<div style="margin-top:0.2rem">${warnHtml}</div>` : ''}
        </td>`;
      }
    }).join('');

    return `<tr>
      <td style="padding:0.5rem;border-bottom:1px solid var(--border,#eee);font-weight:600;position:sticky;left:0;background:var(--card-bg,#fff);z-index:1">
        ${esc(schlag.name)}
        <div style="font-size:0.75rem;color:#888;font-weight:400">${formatNumber(schlag.groesse)} ha</div>
      </td>
      ${cells}
    </tr>`;
  },

  // =========== Planung speichern ===========
  async _onPlan(schlagId, jahr, kultur, existingId) {
    if (!kultur) return;

    const data = {
      schlagId,
      jahr: parseInt(jahr),
      kultur,
      sorte: '',
      notiz: 'Geplant'
    };

    // Wenn bereits ein Eintrag existiert, ID setzen (Update statt Insert)
    if (existingId) {
      data.id = existingId;
    }

    try {
      await Storage.saveKultur(data);
      showToast(`${kultur} für ${jahr} geplant`, 'success');
      await this.render();
    } catch (err) {
      console.error('Fruchtfolge._onPlan:', err);
      showToast('Fehler beim Speichern', 'error');
    }
  },

  // =========== Warnungen berechnen ===========
  _berechneWarnungen(schlaege, kulturMap, years) {
    const warnungen = {}; // key: schlagId_jahr -> [{text, short, severity}]

    const addWarnung = (sid, jahr, text, short, severity) => {
      const key = `${sid}_${jahr}`;
      if (!warnungen[key]) warnungen[key] = [];
      warnungen[key].push({ text, short, severity });
    };

    schlaege.forEach(s => {
      const sid = s.id;
      const kultHistory = kulturMap[sid] || {};

      years.forEach(year => {
        const kultur = kultHistory[year] ? kultHistory[year].kultur : null;
        if (!kultur) return;

        // Winterraps max 1x in 3 Jahren
        if (kultur === 'Winterraps') {
          const prev1 = kultHistory[year - 1] ? kultHistory[year - 1].kultur : null;
          const prev2 = kultHistory[year - 2] ? kultHistory[year - 2].kultur : null;

          if (prev1 === 'Winterraps') {
            addWarnung(sid, year, 'Winterraps direkt nach Winterraps – Selbstunverträglichkeit!', 'Fruchtfolge-Verstoß!', 'error');
          } else if (prev2 === 'Winterraps') {
            addWarnung(sid, year, 'Winterraps max. 1x in 3 Jahren (Selbstunverträglichkeit)', 'Raps zu häufig', 'warning');
          }
        }

        // Zuckerrüben max 1x in 3 Jahren
        if (kultur === 'Zuckerrüben') {
          const prev1 = kultHistory[year - 1] ? kultHistory[year - 1].kultur : null;
          const prev2 = kultHistory[year - 2] ? kultHistory[year - 2].kultur : null;
          if (prev1 === 'Zuckerrüben' || prev2 === 'Zuckerrüben') {
            addWarnung(sid, year, 'Zuckerrüben max. 1x in 3 Jahren (Nematodengefahr)', 'Rüben zu häufig', 'warning');
          }
        }

        // Kartoffeln max 1x in 3 Jahren
        if (kultur === 'Kartoffeln') {
          const prev1 = kultHistory[year - 1] ? kultHistory[year - 1].kultur : null;
          const prev2 = kultHistory[year - 2] ? kultHistory[year - 2].kultur : null;
          if (prev1 === 'Kartoffeln' || prev2 === 'Kartoffeln') {
            addWarnung(sid, year, 'Kartoffeln max. 1x in 3 Jahren', 'Kartoffeln zu häufig', 'warning');
          }
        }

        // Getreide nach Getreide: 3+ Jahre in Folge
        if (this.getreideArten.has(kultur)) {
          const prev1 = kultHistory[year - 1] ? kultHistory[year - 1].kultur : null;
          const prev2 = kultHistory[year - 2] ? kultHistory[year - 2].kultur : null;
          if (this.getreideArten.has(prev1) && this.getreideArten.has(prev2)) {
            addWarnung(sid, year, '3+ Jahre Getreide in Folge – Getreidemonokultur', 'Getreidemonokultur', 'warning');
          }
        }

        // Mais nach Mais: 2+ Jahre
        if (kultur === 'Mais' || kultur === 'Silomais') {
          const prev1 = kultHistory[year - 1] ? kultHistory[year - 1].kultur : null;
          if (prev1 === 'Mais' || prev1 === 'Silomais') {
            addWarnung(sid, year, 'Mais 2+ Jahre in Folge – Maismonokultur', 'Maismonokultur', 'warning');
          }
        }

        // Leguminosen max 1x in 4 Jahren
        if (this.leguminosen.has(kultur)) {
          let count = 0;
          for (let y = year - 3; y < year; y++) {
            const prev = kultHistory[y] ? kultHistory[y].kultur : null;
            if (this.leguminosen.has(prev)) count++;
          }
          if (count > 0) {
            addWarnung(sid, year, 'Leguminosen max. 1x in 4 Jahren (Anbaupause einhalten)', 'Leguminosen zu häufig', 'warning');
          }
        }
      });
    });

    return warnungen;
  },

  // =========== Diversitaetsindex ===========
  _berechneDiversitaet(schlaege, kulturMap, years) {
    const cropSet = new Set();
    let totalSlots = 0;

    schlaege.forEach(s => {
      years.forEach(y => {
        totalSlots++;
        const k = kulturMap[s.id] ? kulturMap[s.id][y] : null;
        if (k) cropSet.add(k.kultur);
      });
    });

    return { uniqueCrops: cropSet.size, totalSlots };
  },

  // =========== Empfehlungen ===========
  _berechneEmpfehlungen(schlaege, kulturMap, years, currentYear) {
    const empfehlungen = [];

    schlaege.forEach(s => {
      const sid = s.id;
      const history = kulturMap[sid] || {};
      const recentCrops = [];

      // Letzte 3 Jahre sammeln
      for (let y = currentYear - 2; y <= currentYear; y++) {
        if (history[y]) recentCrops.push(history[y].kultur);
      }

      if (recentCrops.length === 0) {
        empfehlungen.push({
          schlag: s.name,
          text: 'Keine Kulturdaten vorhanden. Erfassen Sie die bisherige Nutzung für bessere Empfehlungen.'
        });
        return;
      }

      // Nur Getreide?
      const alleGetreide = recentCrops.every(k => this.getreideArten.has(k));
      if (alleGetreide && recentCrops.length >= 2) {
        empfehlungen.push({
          schlag: s.name,
          text: 'Empfehlung: Blattfrucht einplanen (z.B. Winterraps, Zuckerrüben oder Leguminosen), um die Getreidefruchtfolge zu unterbrechen.'
        });
        return;
      }

      // Keine Leguminose in den letzten 3 Jahren?
      const hatLeguminose = recentCrops.some(k => this.leguminosen.has(k));
      const hatFutter = recentCrops.some(k => k === 'Luzerne' || k === 'Kleegras');
      if (!hatLeguminose && !hatFutter && recentCrops.length >= 3) {
        empfehlungen.push({
          schlag: s.name,
          text: 'Empfehlung: Leguminosen oder Futterpflanzen integrieren, um die Bodenfruchtbarkeit zu verbessern und Stickstoff zu fixieren.'
        });
        return;
      }

      // Kein Blattfrucht-Wechsel?
      const letzte = recentCrops[recentCrops.length - 1];
      const nextYear = currentYear + 1;
      const geplant = history[nextYear] ? history[nextYear].kultur : null;
      if (!geplant && letzte) {
        const gruppe = this.kulturGruppen[letzte];
        if (gruppe === 'getreide') {
          empfehlungen.push({
            schlag: s.name,
            text: `Nach ${letzte}: Blattfrucht empfohlen (Raps, Rüben, Kartoffeln oder Leguminosen).`
          });
        } else if (gruppe === 'hackfruechte') {
          empfehlungen.push({
            schlag: s.name,
            text: `Nach ${letzte}: Wintergetreide empfohlen (z.B. Winterweizen oder Wintergerste).`
          });
        } else if (gruppe === 'oelsaaten') {
          empfehlungen.push({
            schlag: s.name,
            text: `Nach ${letzte}: Winterweizen ist ein idealer Nachfolger.`
          });
        } else if (gruppe === 'leguminosen') {
          empfehlungen.push({
            schlag: s.name,
            text: `Nach ${letzte}: Winterweizen oder Wintergerste nutzen den fixierten Stickstoff optimal.`
          });
        }
      }
    });

    return empfehlungen;
  }
};

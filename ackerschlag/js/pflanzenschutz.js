/* ============================================
   PFLANZENSCHUTZ – PSM-Datenbank & Zulassungsprüfung
   ============================================ */

const Pflanzenschutz = {
  filterTyp: '',
  searchQuery: '',

  // Vorgefüllte deutsche PSM (Auswahl der wichtigsten)
  defaultPSM: [
    { produkt: 'Roundup PowerFlex', wirkstoff: 'Glyphosat', typ: 'herbizid', kulturen_zugelassen: ['Winterweizen','Sommerweizen','Wintergerste','Sommergerste','Winterraps','Mais','Grünland'], max_aufwand: 3.75, einheit: 'l/ha', wartezeit_tage: 0 },
    { produkt: 'Artett', wirkstoff: 'Isoproturon + Bifenox', typ: 'herbizid', kulturen_zugelassen: ['Winterweizen','Wintergerste','Winterroggen','Triticale'], max_aufwand: 3.0, einheit: 'l/ha', wartezeit_tage: null },
    { produkt: 'Aviator Xpro', wirkstoff: 'Bixafen + Prothioconazol', typ: 'fungizid', kulturen_zugelassen: ['Winterweizen','Sommerweizen','Wintergerste','Sommergerste','Winterroggen','Triticale'], max_aufwand: 1.25, einheit: 'l/ha', wartezeit_tage: 35 },
    { produkt: 'Osiris', wirkstoff: 'Epoxiconazol + Metconazol', typ: 'fungizid', kulturen_zugelassen: ['Winterweizen','Sommerweizen','Wintergerste','Winterroggen','Triticale'], max_aufwand: 2.5, einheit: 'l/ha', wartezeit_tage: 35 },
    { produkt: 'Atlantis Flex', wirkstoff: 'Mesosulfuron + Propoxycarbazone', typ: 'herbizid', kulturen_zugelassen: ['Winterweizen','Winterroggen','Triticale'], max_aufwand: 0.33, einheit: 'kg/ha', wartezeit_tage: null },
    { produkt: 'Axial 50', wirkstoff: 'Pinoxaden', typ: 'herbizid', kulturen_zugelassen: ['Winterweizen','Sommerweizen','Wintergerste','Sommergerste','Winterroggen','Triticale'], max_aufwand: 0.9, einheit: 'l/ha', wartezeit_tage: null },
    { produkt: 'Basagran', wirkstoff: 'Bentazon', typ: 'herbizid', kulturen_zugelassen: ['Erbsen','Ackerbohnen','Sojabohnen'], max_aufwand: 3.0, einheit: 'l/ha', wartezeit_tage: 42 },
    { produkt: 'Biscaya', wirkstoff: 'Thiacloprid', typ: 'insektizid', kulturen_zugelassen: ['Winterraps','Winterweizen','Wintergerste'], max_aufwand: 0.3, einheit: 'l/ha', wartezeit_tage: 42 },
    { produkt: 'Boxer', wirkstoff: 'Prosulfocarb', typ: 'herbizid', kulturen_zugelassen: ['Winterweizen','Wintergerste','Kartoffeln'], max_aufwand: 5.0, einheit: 'l/ha', wartezeit_tage: null },
    { produkt: 'Butisan Gold', wirkstoff: 'Metazachlor + Dimethenamid-P + Quinmerac', typ: 'herbizid', kulturen_zugelassen: ['Winterraps'], max_aufwand: 2.5, einheit: 'l/ha', wartezeit_tage: null },
    { produkt: 'Carax', wirkstoff: 'Mepiquat + Metconazol', typ: 'fungizid', kulturen_zugelassen: ['Winterraps'], max_aufwand: 1.4, einheit: 'l/ha', wartezeit_tage: 56 },
    { produkt: 'Colzor Trio', wirkstoff: 'Clomazone + Dimethachlor + Napropamid', typ: 'herbizid', kulturen_zugelassen: ['Winterraps'], max_aufwand: 4.0, einheit: 'l/ha', wartezeit_tage: null },
    { produkt: 'CCC 720', wirkstoff: 'Chlormequat', typ: 'sonstige', kulturen_zugelassen: ['Winterweizen','Sommerweizen','Winterroggen','Triticale','Hafer'], max_aufwand: 2.1, einheit: 'l/ha', wartezeit_tage: null },
    { produkt: 'Karate Zeon', wirkstoff: 'lambda-Cyhalothrin', typ: 'insektizid', kulturen_zugelassen: ['Winterweizen','Wintergerste','Winterraps','Mais','Kartoffeln','Zuckerrüben','Erbsen','Ackerbohnen'], max_aufwand: 0.075, einheit: 'l/ha', wartezeit_tage: 14 },
    { produkt: 'Decis forte', wirkstoff: 'Deltamethrin', typ: 'insektizid', kulturen_zugelassen: ['Winterweizen','Wintergerste','Winterraps','Kartoffeln','Mais'], max_aufwand: 0.075, einheit: 'l/ha', wartezeit_tage: 7 },
    { produkt: 'Input Classic', wirkstoff: 'Prothioconazol + Spiroxamine', typ: 'fungizid', kulturen_zugelassen: ['Winterweizen','Sommerweizen','Wintergerste','Sommergerste','Winterroggen','Triticale'], max_aufwand: 1.25, einheit: 'l/ha', wartezeit_tage: 35 },
    { produkt: 'Prosaro', wirkstoff: 'Prothioconazol + Tebuconazol', typ: 'fungizid', kulturen_zugelassen: ['Winterweizen','Sommerweizen','Wintergerste','Winterroggen','Triticale','Mais'], max_aufwand: 1.0, einheit: 'l/ha', wartezeit_tage: 35 },
    { produkt: 'Stomp Aqua', wirkstoff: 'Pendimethalin', typ: 'herbizid', kulturen_zugelassen: ['Winterweizen','Wintergerste','Mais','Kartoffeln','Erbsen','Ackerbohnen','Sonnenblumen'], max_aufwand: 4.4, einheit: 'l/ha', wartezeit_tage: null },
    { produkt: 'Tilt 250 EC', wirkstoff: 'Propiconazol', typ: 'fungizid', kulturen_zugelassen: ['Winterweizen','Wintergerste','Sommergerste','Winterroggen','Triticale','Hafer'], max_aufwand: 0.5, einheit: 'l/ha', wartezeit_tage: 35 },
    { produkt: 'Harmony SX', wirkstoff: 'Thifensulfuron-methyl', typ: 'herbizid', kulturen_zugelassen: ['Winterweizen','Sommerweizen','Wintergerste','Sommergerste','Mais','Grünland'], max_aufwand: 0.045, einheit: 'kg/ha', wartezeit_tage: null },
    { produkt: 'Laudis', wirkstoff: 'Tembotrione', typ: 'herbizid', kulturen_zugelassen: ['Mais','Silomais'], max_aufwand: 2.25, einheit: 'l/ha', wartezeit_tage: null },
    { produkt: 'MaisTer Power', wirkstoff: 'Foramsulfuron + Thiencarbazone + Cyprosulfamide', typ: 'herbizid', kulturen_zugelassen: ['Mais','Silomais'], max_aufwand: 1.5, einheit: 'l/ha', wartezeit_tage: null },
    { produkt: 'Mospilan SG', wirkstoff: 'Acetamiprid', typ: 'insektizid', kulturen_zugelassen: ['Winterraps','Kartoffeln','Zuckerrüben'], max_aufwand: 0.25, einheit: 'kg/ha', wartezeit_tage: 14 },
    { produkt: 'Elatus Era', wirkstoff: 'Benzovindiflupyr + Prothioconazol', typ: 'fungizid', kulturen_zugelassen: ['Winterweizen','Sommerweizen','Wintergerste','Sommergerste','Winterroggen','Triticale'], max_aufwand: 1.0, einheit: 'l/ha', wartezeit_tage: 35 },
    { produkt: 'Reglone', wirkstoff: 'Diquat', typ: 'herbizid', kulturen_zugelassen: ['Kartoffeln','Winterraps'], max_aufwand: 2.5, einheit: 'l/ha', wartezeit_tage: 7 },
    { produkt: 'Amistar Opti', wirkstoff: 'Azoxystrobin + Chlorthalonil', typ: 'fungizid', kulturen_zugelassen: ['Winterweizen','Wintergerste','Winterraps'], max_aufwand: 2.0, einheit: 'l/ha', wartezeit_tage: 42 },
    { produkt: 'Adengo', wirkstoff: 'Isoxaflutole + Thiencarbazone', typ: 'herbizid', kulturen_zugelassen: ['Mais','Silomais'], max_aufwand: 0.44, einheit: 'l/ha', wartezeit_tage: null },
    { produkt: 'Kerb Flo', wirkstoff: 'Propyzamid', typ: 'herbizid', kulturen_zugelassen: ['Winterraps'], max_aufwand: 3.125, einheit: 'l/ha', wartezeit_tage: 90 },
    { produkt: 'Proline', wirkstoff: 'Prothioconazol', typ: 'fungizid', kulturen_zugelassen: ['Winterweizen','Wintergerste','Winterroggen','Triticale','Winterraps'], max_aufwand: 0.8, einheit: 'l/ha', wartezeit_tage: 35 },
    { produkt: 'Matador', wirkstoff: 'lambda-Cyhalothrin', typ: 'insektizid', kulturen_zugelassen: ['Winterraps','Winterweizen','Wintergerste','Mais'], max_aufwand: 0.1, einheit: 'l/ha', wartezeit_tage: 14 }
  ],

  async render() {
    const container = document.getElementById('page-pflanzenschutz');
    if (!container) return;

    let psmList = await Storage.getPflanzenschutzDB();
    // Falls DB leer, Defaults anzeigen (werden nicht in DB gespeichert, nur als Referenz)
    const showDefaults = psmList.length === 0;
    const displayList = showDefaults ? this.defaultPSM : psmList;

    let filtered = displayList;
    if (this.filterTyp) filtered = filtered.filter(p => p.typ === this.filterTyp);
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.produkt.toLowerCase().includes(q) ||
        (p.wirkstoff && p.wirkstoff.toLowerCase().includes(q))
      );
    }

    const typCounts = {};
    displayList.forEach(p => { typCounts[p.typ] = (typCounts[p.typ] || 0) + 1; });

    const typLabels = { 'herbizid': 'Herbizide', 'fungizid': 'Fungizide', 'insektizid': 'Insektizide', 'sonstige': 'Sonstige' };
    const typBadge = { 'herbizid': 'badge-green', 'fungizid': 'badge-blue', 'insektizid': 'badge-red', 'sonstige': 'badge-gray' };

    let html = `
      <div class="page-header">
        <div>
          <h1>Pflanzenschutz</h1>
          <p>PSM-Datenbank, Zulassungen und Aufwandmengen</p>
        </div>
        <button class="btn btn-primary" onclick="Pflanzenschutz.openAddModal()"><span class="btn-svg-icon" data-icon="plus">${Icons.plus}</span> PSM hinzufügen</button>
      </div>

      <div class="stats-grid" style="margin-bottom:1rem">
        ${Object.entries(typCounts).map(([typ, count]) => `
          <div class="stat-card" style="cursor:pointer" onclick="Pflanzenschutz.setFilter('${typ}')">
            <div class="stat-icon ${typ === 'herbizid' ? 'green' : typ === 'fungizid' ? 'blue' : typ === 'insektizid' ? 'red' : 'amber'}">
              ${Icons.render('pflanzenschutz', 22)}
            </div>
            <div>
              <div class="stat-value">${count}</div>
              <div class="stat-label">${typLabels[typ] || typ}</div>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="filter-bar">
        <input class="form-input" style="max-width:280px" placeholder="Suche nach Produkt oder Wirkstoff..." value="${esc(this.searchQuery)}" oninput="Pflanzenschutz.setSearch(this.value)">
        <select class="form-select" style="width:auto;min-width:160px" onchange="Pflanzenschutz.setFilter(this.value)">
          <option value="">Alle Typen</option>
          <option value="herbizid" ${this.filterTyp === 'herbizid' ? 'selected' : ''}>Herbizide</option>
          <option value="fungizid" ${this.filterTyp === 'fungizid' ? 'selected' : ''}>Fungizide</option>
          <option value="insektizid" ${this.filterTyp === 'insektizid' ? 'selected' : ''}>Insektizide</option>
          <option value="sonstige" ${this.filterTyp === 'sonstige' ? 'selected' : ''}>Sonstige</option>
        </select>
      </div>

      ${showDefaults ? '<div class="info-box">ℹ️ Vorgefüllte Standard-PSM-Datenbank. Füge eigene Produkte hinzu, um die Liste anzupassen.</div>' : ''}

      <div class="table-wrap"><table>
        <thead><tr>
          <th>Produkt</th><th>Wirkstoff</th><th>Typ</th><th>Max. Aufwand</th><th>Wartezeit</th><th>Kulturen</th>
          ${!showDefaults ? '<th></th>' : ''}
        </tr></thead>
        <tbody>
        ${filtered.map(p => `
          <tr>
            <td><strong>${esc(p.produkt)}</strong></td>
            <td style="font-size:0.82rem">${esc(p.wirkstoff || '–')}</td>
            <td><span class="badge ${typBadge[p.typ] || 'badge-gray'}">${typLabels[p.typ] || p.typ}</span></td>
            <td>${p.max_aufwand ? `${p.max_aufwand} ${esc(p.einheit || '')}` : '–'}</td>
            <td>${p.wartezeit_tage ? `${p.wartezeit_tage} Tage` : '–'}</td>
            <td style="max-width:200px;font-size:0.78rem;color:var(--text-secondary)">${Array.isArray(p.kulturen_zugelassen) ? p.kulturen_zugelassen.join(', ') : '–'}</td>
            ${!showDefaults && p.id ? `<td style="white-space:nowrap">
              <button class="btn-icon" style="width:28px;height:28px" onclick="Pflanzenschutz.deletePSM('${p.id}')" title="Löschen">${Icons.render('trash', 14)}</button>
            </td>` : ''}
          </tr>
        `).join('')}
        </tbody>
      </table></div>
    `;

    container.innerHTML = html;
  },

  setFilter(typ) {
    this.filterTyp = this.filterTyp === typ ? '' : typ;
    this.render();
  },

  setSearch(q) {
    this.searchQuery = q;
    this.render();
  },

  openAddModal() {
    openModal('psmModal');
    document.getElementById('psmForm').reset();
  },

  async savePSM() {
    const produkt = document.getElementById('psmProdukt').value.trim();
    if (!produkt) { showToast('Bitte Produktname eingeben', 'warning'); return; }

    const kulturenStr = document.getElementById('psmKulturen').value.trim();
    const kulturen = kulturenStr ? kulturenStr.split(',').map(k => k.trim()).filter(Boolean) : [];

    await Storage.savePflanzenschutzDB({
      produkt,
      wirkstoff: document.getElementById('psmWirkstoff').value.trim(),
      typ: document.getElementById('psmTyp').value,
      kulturen_zugelassen: kulturen,
      max_aufwand: parseFloat(document.getElementById('psmMaxAufwand').value) || null,
      einheit: document.getElementById('psmEinheit').value || 'l/ha',
      wartezeit_tage: parseInt(document.getElementById('psmWartezeit').value) || null
    });

    closeModal('psmModal');
    showToast('PSM gespeichert', 'success');
    await this.render();
  },

  async deletePSM(id) {
    if (!confirm('Pflanzenschutzmittel wirklich löschen?')) return;
    await Storage.deletePflanzenschutzDB(id);
    showToast('PSM gelöscht', 'success');
    await this.render();
  },

  // Wird vom Maßnahmen-Modal aufgerufen um Warnungen zu prüfen
  checkZulassung(produktName, kulturName) {
    const allPSM = [...this.defaultPSM];
    const psm = allPSM.find(p => p.produkt.toLowerCase() === produktName.toLowerCase());
    if (!psm) return null;

    const warnings = [];
    if (kulturName && Array.isArray(psm.kulturen_zugelassen) && !psm.kulturen_zugelassen.includes(kulturName)) {
      warnings.push(`${psm.produkt} ist nicht für ${kulturName} zugelassen!`);
    }
    return { psm, warnings };
  }
};

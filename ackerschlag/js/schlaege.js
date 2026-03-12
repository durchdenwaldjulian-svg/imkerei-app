/* ============================================
   SCHLÄGE – Felder verwalten (CRUD)
   ============================================ */

const Schlaege = {
  editId: null,
  pendingDetail: null,

  async render() {
    this.closeDetail();

    if (this.pendingDetail) {
      const id = this.pendingDetail;
      this.pendingDetail = null;
      setTimeout(() => this.showDetail(id), 50);
      return;
    }

    const list = await Storage.getSchlaege();
    const container = document.getElementById('schlaegeList');

    if (!list.length) {
      container.innerHTML = `<div class="empty-state">
        <div class="empty-icon">${Icons.emptyField}</div>
        <h3>Noch keine Schläge angelegt</h3>
        <p>Lege deinen ersten Schlag an, um loszulegen.</p>
        <button class="btn btn-primary" onclick="Schlaege.openModal()"><span class="btn-svg-icon" data-icon="plus">${Icons.plus}</span> Neuer Schlag</button>
      </div>`;
      return;
    }

    const cards = [];
    for (const s of list) {
      cards.push(await this.renderCard(s));
    }
    container.innerHTML = `<div class="card-grid">${cards.join('')}</div>`;
  },

  async renderCard(s) {
    const kulturen = await Storage.getKulturenBySchlag(s.id);
    const aktuelleKultur = kulturen.find(k => parseInt(k.jahr) === new Date().getFullYear());
    const massnahmen = await Storage.getMassnahmenBySchlag(s.id);
    const massCount = massnahmen.length;

    const bodenLabels = {
      'sand': 'Sandboden', 'lehm': 'Lehmboden', 'ton': 'Tonboden',
      'schluff': 'Schluffboden', 'moor': 'Moorboden', 'loess': 'Lössboden'
    };

    return `<div class="card" style="cursor:pointer" onclick="Schlaege.showDetail('${s.id}')">
      <div class="card-header">
        <div>
          <div class="card-title">${esc(s.name)}</div>
          <div class="card-subtitle">${esc(s.flurstueck) || 'Kein Flurstück'}</div>
        </div>
        <span class="badge badge-green">${formatNumber(s.groesse)} ha</span>
      </div>
      <div class="detail-grid" style="margin-top:0.5rem">
        <div class="detail-item">
          <label>Bodenart</label>
          <span>${bodenLabels[s.bodenart] || s.bodenart || '-'}</span>
        </div>
        <div class="detail-item">
          <label>Aktuelle Kultur</label>
          <span>${aktuelleKultur ? aktuelleKultur.kultur : '-'}</span>
        </div>
        <div class="detail-item">
          <label>Maßnahmen</label>
          <span>${massCount}</span>
        </div>
      </div>
    </div>`;
  },

  async openModal(id) {
    this.editId = id || null;
    const form = document.getElementById('schlagForm');
    form.reset();

    if (id) {
      const s = await Storage.getSchlag(id);
      if (s) {
        document.getElementById('schlagModalTitle').textContent = 'Schlag bearbeiten';
        document.getElementById('schlagName').value = s.name || '';
        document.getElementById('schlagGroesse').value = s.groesse || '';
        document.getElementById('schlagFlurstueck').value = s.flurstueck || '';
        document.getElementById('schlagBodenart').value = s.bodenart || '';
        document.getElementById('schlagBodenpunkte').value = s.bodenpunkte || '';
        document.getElementById('schlagLat').value = s.lat || '';
        document.getElementById('schlagLng').value = s.lng || '';
        document.getElementById('schlagNotiz').value = s.notiz || '';
      }
    } else {
      document.getElementById('schlagModalTitle').textContent = 'Neuer Schlag';
    }

    openModal('schlagModal');
  },

  async save() {
    const name = document.getElementById('schlagName').value.trim();
    const groesse = document.getElementById('schlagGroesse').value;

    if (!name) { showToast('Bitte Name eingeben', 'warning'); return; }
    if (!groesse || parseFloat(groesse) <= 0) { showToast('Bitte gültige Fläche eingeben', 'warning'); return; }

    const schlag = {
      id: this.editId || undefined,
      name,
      groesse: parseFloat(groesse),
      flurstueck: document.getElementById('schlagFlurstueck').value.trim(),
      bodenart: document.getElementById('schlagBodenart').value,
      bodenpunkte: document.getElementById('schlagBodenpunkte').value,
      lat: parseFloat(document.getElementById('schlagLat').value) || null,
      lng: parseFloat(document.getElementById('schlagLng').value) || null,
      notiz: document.getElementById('schlagNotiz').value.trim()
    };

    // Polygon from map drawing
    if (Karte._pendingPolygon) {
      schlag.polygon = Karte._pendingPolygon;
      Karte._pendingPolygon = null;
    } else if (this.editId) {
      // Preserve existing polygon on edit
      const existing = await Storage.getSchlag(this.editId);
      if (existing && existing.polygon) schlag.polygon = existing.polygon;
    }

    await Storage.saveSchlag(schlag);
    closeModal('schlagModal');
    showToast(this.editId ? 'Schlag aktualisiert' : 'Schlag angelegt', 'success');
    await this.render();
    if (Karte.initialized) { Karte.updateMarkers(); Karte.renderSidebar(); }
  },

  async delete(id) {
    if (!confirm('Schlag wirklich löschen? Alle zugehörigen Kulturen und Maßnahmen werden ebenfalls gelöscht.')) return;
    await Storage.deleteSchlag(id);
    showToast('Schlag gelöscht', 'success');
    this.closeDetail();
    await this.render();
    if (Karte.initialized) { Karte.updateMarkers(); Karte.renderSidebar(); }
  },

  async showDetail(id) {
    const s = await Storage.getSchlag(id);
    if (!s) return;

    const kulturen = (await Storage.getKulturenBySchlag(id)).sort((a, b) => parseInt(b.jahr) - parseInt(a.jahr));
    const massnahmen = (await Storage.getMassnahmenBySchlag(id)).sort((a, b) => new Date(b.datum) - new Date(a.datum));

    const bodenLabels = {
      'sand': 'Sandboden', 'lehm': 'Lehmboden', 'ton': 'Tonboden',
      'schluff': 'Schluffboden', 'moor': 'Moorboden', 'loess': 'Lössboden'
    };
    const typLabels = {
      'duengung': 'Düngung', 'pflanzenschutz': 'Pflanzenschutz', 'bodenbearbeitung': 'Bodenbearbeitung',
      'aussaat': 'Aussaat', 'ernte': 'Ernte', 'sonstiges': 'Sonstiges'
    };

    document.getElementById('schlagDetailContent').innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1.25rem;flex-wrap:wrap;gap:0.5rem">
        <div>
          <h1 style="margin:0">${esc(s.name)}</h1>
          <p style="color:var(--text-soft);margin:0.15rem 0 0">${esc(s.flurstueck)}</p>
        </div>
        <div style="display:flex;gap:0.5rem">
          <button class="btn btn-secondary btn-sm" onclick="Schlaege.openModal('${s.id}')">Bearbeiten</button>
          <button class="btn btn-danger btn-sm" onclick="Schlaege.delete('${s.id}')">Löschen</button>
        </div>
      </div>

      <div class="detail-grid" style="margin-bottom:1.5rem">
        <div class="detail-item"><label>Fläche</label><span>${formatNumber(s.groesse)} ha</span></div>
        <div class="detail-item"><label>Bodenart</label><span>${bodenLabels[s.bodenart] || '-'}</span></div>
        <div class="detail-item"><label>Bodenpunkte</label><span>${s.bodenpunkte || '-'}</span></div>
        <div class="detail-item"><label>Koordinaten</label><span>${s.lat && s.lng ? `${s.lat}, ${s.lng}` : '-'}</span></div>
      </div>

      ${s.notiz ? `<div class="info-box" style="margin-bottom:1.5rem">${esc(s.notiz)}</div>` : ''}

      <div class="section-divider">Fruchtfolge</div>
      ${kulturen.length ? `<div class="timeline">${kulturen.map(k => `
        <div class="timeline-item">
          <div class="timeline-year">${esc(String(k.jahr))}</div>
          <div class="timeline-kultur">${esc(k.kultur)}</div>
          ${k.sorte ? `<div style="font-size:0.8rem;color:var(--text-soft)">Sorte: ${esc(k.sorte)}</div>` : ''}
          ${k.ertrag ? `<div style="font-size:0.8rem;color:var(--green)">Ertrag: ${formatNumber(k.ertrag)} dt/ha</div>` : ''}
        </div>`).join('')}</div>` : '<p style="color:var(--text-soft);font-size:0.875rem">Noch keine Kulturen eingetragen</p>'}

      <div class="section-divider">Maßnahmen</div>
      ${massnahmen.length ? massnahmen.map(m => `
        <div class="card" style="padding:0.75rem 1rem;margin-bottom:0.5rem">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div>
              <span class="badge badge-blue">${typLabels[m.typ] || esc(m.typ)}</span>
              <strong style="margin-left:0.4rem">${esc(m.mittel) || esc(m.beschreibung) || ''}</strong>
              ${m.menge ? `<span style="font-size:0.8rem;color:var(--text-soft);margin-left:0.4rem">${esc(String(m.menge))} ${esc(m.einheit) || ''}</span>` : ''}
            </div>
            <span style="font-size:0.8rem;color:var(--text-soft)">${formatDate(m.datum)}</span>
          </div>
        </div>`).join('') : '<p style="color:var(--text-soft);font-size:0.875rem">Noch keine Maßnahmen dokumentiert</p>'}
    `;

    document.getElementById('schlaegeList').style.display = 'none';
    document.getElementById('schlaegeHeader').style.display = 'none';
    document.getElementById('schlagDetail').style.display = 'block';
  },

  closeDetail() {
    const detail = document.getElementById('schlagDetail');
    const list = document.getElementById('schlaegeList');
    const header = document.getElementById('schlaegeHeader');
    if (detail) detail.style.display = 'none';
    if (list) list.style.display = 'block';
    if (header) header.style.display = 'flex';
  }
};

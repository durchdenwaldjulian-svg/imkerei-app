/* ============================================
   KULTUREN – Fruchtfolge & Kulturarten
   ============================================ */

const Kulturen = {
  editId: null,
  selectedJahr: new Date().getFullYear(),

  kulturArten: [
    'Winterweizen', 'Sommerweizen', 'Wintergerste', 'Sommergerste',
    'Winterroggen', 'Triticale', 'Hafer', 'Mais', 'Silomais',
    'Winterraps', 'Sonnenblume', 'Zuckerrübe', 'Kartoffel',
    'Erbse', 'Ackerbohne', 'Sojabohne', 'Luzerne', 'Klee',
    'Grünland', 'Stilllegung', 'Zwischenfrucht', 'Sonstiges'
  ],

  async render() {
    this.renderJahrFilter();
    await this.renderList();
  },

  renderJahrFilter() {
    const container = document.getElementById('kulturJahrFilter');
    const years = [];
    for (let y = this.selectedJahr - 2; y <= this.selectedJahr + 2; y++) years.push(y);
    container.innerHTML = years.map(y =>
      `<button class="tab-btn ${y === this.selectedJahr ? 'active' : ''}" onclick="Kulturen.setJahr(${y})">${y}</button>`
    ).join('');
  },

  async setJahr(y) {
    this.selectedJahr = y;
    await this.render();
  },

  async renderList() {
    const container = document.getElementById('kulturenList');
    const schlaege = await Storage.getSchlaege();
    const allKulturen = await Storage.getKulturen();
    const kulturen = allKulturen.filter(k => parseInt(k.jahr) === this.selectedJahr);

    if (!schlaege.length) {
      container.innerHTML = `<div class="empty-state">
        <div class="empty-icon">${Icons.emptyKultur}</div>
        <h3>Zuerst Schläge anlegen</h3>
        <p>Lege zuerst deine Felder an, bevor du Kulturen zuweisen kannst.</p>
        <button class="btn btn-primary" onclick="App.navigateTo('schlaege')">Zu den Schlägen</button>
      </div>`;
      return;
    }

    container.innerHTML = `<div class="card-grid">${schlaege.map(s => {
      const kultur = kulturen.find(k => k.schlagId === s.id);
      return `<div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">${esc(s.name)}</div>
            <div class="card-subtitle">${formatNumber(s.groesse)} ha</div>
          </div>
          ${kultur
            ? `<span class="badge badge-green">${kultur.kultur}</span>`
            : `<span class="badge badge-gray">Keine Kultur</span>`}
        </div>
        ${kultur ? `
          <div class="detail-grid" style="margin-top:0.5rem">
            ${kultur.sorte ? `<div class="detail-item"><label>Sorte</label><span>${kultur.sorte}</span></div>` : ''}
            ${kultur.aussaat ? `<div class="detail-item"><label>Aussaat</label><span>${formatDate(kultur.aussaat)}</span></div>` : ''}
            ${kultur.ernte ? `<div class="detail-item"><label>Ernte</label><span>${formatDate(kultur.ernte)}</span></div>` : ''}
            ${kultur.ertrag ? `<div class="detail-item"><label>Ertrag</label><span>${formatNumber(kultur.ertrag)} dt/ha</span></div>` : ''}
          </div>
          <div style="margin-top:0.75rem;display:flex;gap:0.4rem">
            <button class="btn btn-secondary btn-sm" onclick="Kulturen.openModal('${s.id}','${kultur.id}')">Bearbeiten</button>
            <button class="btn btn-outline btn-sm" onclick="Kulturen.delete('${kultur.id}')" style="color:var(--danger)">Entfernen</button>
          </div>
        ` : `
          <button class="btn btn-primary btn-sm" style="margin-top:0.75rem" onclick="Kulturen.openModal('${s.id}')">Kultur zuweisen</button>
        `}
      </div>`;
    }).join('')}</div>`;
  },

  async openModal(schlagId, kulturId) {
    this.editId = kulturId || null;
    const form = document.getElementById('kulturForm');
    form.reset();
    document.getElementById('kulturSchlagId').value = schlagId;
    document.getElementById('kulturJahr').value = this.selectedJahr;

    const select = document.getElementById('kulturArt');
    select.innerHTML = '<option value="">Kultur wählen...</option>' +
      this.kulturArten.map(k => `<option value="${k}">${k}</option>`).join('');

    if (kulturId) {
      const allKulturen = await Storage.getKulturen();
      const k = allKulturen.find(x => x.id === kulturId);
      if (k) {
        document.getElementById('kulturModalTitle').textContent = 'Kultur bearbeiten';
        select.value = k.kultur;
        document.getElementById('kulturSorte').value = k.sorte || '';
        document.getElementById('kulturAussaat').value = k.aussaat || '';
        document.getElementById('kulturErnte').value = k.ernte || '';
        document.getElementById('kulturErtrag').value = k.ertrag || '';
        document.getElementById('kulturNotiz').value = k.notiz || '';
      }
    } else {
      document.getElementById('kulturModalTitle').textContent = 'Kultur zuweisen';
    }

    openModal('kulturModal');
  },

  async save() {
    const kultur = document.getElementById('kulturArt').value;
    if (!kultur) { showToast('Bitte Kultur wählen', 'warning'); return; }

    const data = {
      id: this.editId || undefined,
      schlagId: document.getElementById('kulturSchlagId').value,
      jahr: document.getElementById('kulturJahr').value,
      kultur,
      sorte: document.getElementById('kulturSorte').value.trim(),
      aussaat: document.getElementById('kulturAussaat').value,
      ernte: document.getElementById('kulturErnte').value,
      ertrag: parseFloat(document.getElementById('kulturErtrag').value) || null,
      notiz: document.getElementById('kulturNotiz').value.trim()
    };

    await Storage.saveKultur(data);
    closeModal('kulturModal');
    showToast(this.editId ? 'Kultur aktualisiert' : 'Kultur zugewiesen', 'success');
    await this.render();
  },

  async delete(id) {
    if (!confirm('Kultur wirklich entfernen?')) return;
    await Storage.deleteKultur(id);
    showToast('Kultur entfernt', 'success');
    await this.render();
  }
};

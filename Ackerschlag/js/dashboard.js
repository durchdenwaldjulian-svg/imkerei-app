/* ============================================
   DASHBOARD – Übersicht & Statistiken
   ============================================ */

const Dashboard = {
  async render() {
    const [schlaege, kulturen, massnahmen, totalHa] = await Promise.all([
      Storage.getSchlaege(),
      Storage.getAktiveKulturen(),
      Storage.getMassnahmenThisMonth(),
      Storage.getTotalFlaeche()
    ]);

    // Stats
    document.getElementById('statSchlaege').textContent = schlaege.length;
    document.getElementById('statFlaeche').textContent = formatNumber(totalHa) + ' ha';
    document.getElementById('statKulturen').textContent = kulturen.length;
    document.getElementById('statMassnahmen').textContent = massnahmen.length;

    // Parallel rendern
    await Promise.all([
      this.renderLetzteMassnahmen(),
      this.renderAnstehend(),
      this.renderKulturverteilung()
    ]);
  },

  async renderLetzteMassnahmen() {
    const container = document.getElementById('dashLetzteMassnahmen');
    const allMassnahmen = await Storage.getMassnahmen();
    const massnahmen = allMassnahmen
      .sort((a, b) => new Date(b.datum) - new Date(a.datum))
      .slice(0, 5);

    if (!massnahmen.length) {
      container.innerHTML = '<div class="empty-state"><p>Noch keine Maßnahmen dokumentiert</p></div>';
      return;
    }

    const schlaege = await Storage.getSchlaege();
    const typColors = {
      'duengung': 'badge-green', 'pflanzenschutz': 'badge-yellow',
      'bodenbearbeitung': 'badge-blue', 'aussaat': 'badge-green',
      'ernte': 'badge-yellow', 'sonstiges': 'badge-gray'
    };
    const typLabels = {
      'duengung': 'Düngung', 'pflanzenschutz': 'Pflanzenschutz',
      'bodenbearbeitung': 'Bodenbearbeitung', 'aussaat': 'Aussaat',
      'ernte': 'Ernte', 'sonstiges': 'Sonstiges'
    };

    container.innerHTML = massnahmen.map(m => {
      const schlag = schlaege.find(s => s.id === m.schlagId);
      return `<div class="card" style="margin-bottom:0.5rem;padding:0.85rem 1rem">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <strong>${schlag ? esc(schlag.name) : 'Unbekannt'}</strong>
            <span class="badge ${typColors[m.typ] || 'badge-gray'}" style="margin-left:0.5rem">${typLabels[m.typ] || esc(m.typ)}</span>
            ${m.mittel ? `<span style="color:var(--text-soft);font-size:0.8rem;margin-left:0.4rem">${esc(m.mittel)}</span>` : ''}
          </div>
          <span style="font-size:0.8rem;color:var(--text-soft)">${formatDate(m.datum)}</span>
        </div>
      </div>`;
    }).join('');
  },

  async renderAnstehend() {
    const container = document.getElementById('dashAnstehend');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const typLabels = {
      'duengung': 'Düngung', 'pflanzenschutz': 'Pflanzenschutz',
      'bodenbearbeitung': 'Bodenbearbeitung', 'aussaat': 'Aussaat',
      'ernte': 'Ernte', 'sonstiges': 'Sonstiges'
    };

    const allMassnahmen = await Storage.getMassnahmen();
    const schlaege = await Storage.getSchlaege();
    const massnahmen = allMassnahmen
      .filter(m => new Date(m.datum) >= today)
      .sort((a, b) => new Date(a.datum) - new Date(b.datum))
      .slice(0, 5);

    if (!massnahmen.length) {
      container.innerHTML = '<div class="empty-state"><p>Keine anstehenden Aufgaben</p></div>';
      return;
    }

    container.innerHTML = massnahmen.map(m => {
      const schlag = schlaege.find(s => s.id === m.schlagId);
      const daysUntil = Math.ceil((new Date(m.datum) - today) / (1000 * 60 * 60 * 24));
      const urgency = daysUntil <= 2 ? 'badge-red' : daysUntil <= 7 ? 'badge-yellow' : 'badge-green';
      return `<div class="card" style="margin-bottom:0.5rem;padding:0.85rem 1rem">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <strong>${schlag ? esc(schlag.name) : ''}</strong> – ${esc(m.beschreibung) || typLabels[m.typ] || esc(m.typ)}
          </div>
          <span class="badge ${urgency}">${daysUntil === 0 ? 'Heute' : `in ${daysUntil} Tagen`}</span>
        </div>
      </div>`;
    }).join('');
  },

  async renderKulturverteilung() {
    const container = document.getElementById('dashKulturChart');
    const kulturen = await Storage.getAktiveKulturen();
    const schlaege = await Storage.getSchlaege();

    if (!kulturen.length) {
      container.innerHTML = '<div class="empty-state"><p>Keine Kulturen für dieses Jahr</p></div>';
      return;
    }

    const kulturMap = {};
    kulturen.forEach(k => {
      const schlag = schlaege.find(s => s.id === k.schlagId);
      const ha = schlag ? parseFloat(schlag.groesse) || 0 : 0;
      kulturMap[k.kultur] = (kulturMap[k.kultur] || 0) + ha;
    });

    const sorted = Object.entries(kulturMap).sort((a, b) => b[1] - a[1]);
    const maxHa = sorted[0] ? sorted[0][1] : 1;
    const colors = ['green', 'amber', 'blue', 'red', 'green', 'amber', 'blue'];

    container.innerHTML = `<div class="bar-chart">${sorted.map(([name, ha], i) =>
      `<div class="bar-row">
        <span class="bar-label">${name}</span>
        <div class="bar-track">
          <div class="bar-fill ${colors[i % colors.length]}" style="width:${Math.max(10, (ha / maxHa) * 100)}%">${formatNumber(ha)} ha</div>
        </div>
      </div>`
    ).join('')}</div>`;
  }
};

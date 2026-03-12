/* ============================================
   KARTE – Leaflet Kartenansicht v2
   Mit Feld-Auswahl, Layerwechsel, satte Farben
   ============================================ */

const Karte = {
  map: null,
  markers: [],
  markerMap: {},
  initialized: false,
  selectedId: null,
  currentLayer: null,
  _aktKulturen: [],

  layers: {
    voyager: {
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      attr: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd'
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attr: '&copy; Esri, Maxar, Earthstar Geographics',
      subdomains: null
    },
    osm: {
      url: 'https://tile.openstreetmap.de/{z}/{x}/{y}.png',
      attr: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      subdomains: null
    },
    topo: {
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attr: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
      subdomains: 'abc'
    }
  },

  kulturColors: {
    'Winterweizen': '#D97706', 'Sommerweizen': '#F59E0B', 'Wintergerste': '#B45309', 'Sommergerste': '#FBBF24',
    'Winterroggen': '#92400E', 'Triticale': '#CA8A04', 'Hafer': '#EAB308',
    'Mais': '#16A34A', 'Silomais': '#15803D',
    'Winterraps': '#FACC15', 'Sonnenblume': '#F97316',
    'Zuckerrübe': '#DC2626', 'Kartoffel': '#B91C1C',
    'Erbse': '#059669', 'Ackerbohne': '#0D9488', 'Sojabohne': '#14B8A6',
    'Luzerne': '#7C3AED', 'Klee': '#8B5CF6',
    'Grünland': '#22C55E', 'Stilllegung': '#94A3B8', 'Zwischenfrucht': '#6EE7A0',
    '_default': '#16A34A'
  },

  async render() {
    if (!this.initialized) {
      this.initMap();
      this.initialized = true;
    }
    await this.updateMarkers();
    await this.renderSidebar();
  },

  initMap() {
    this.map = L.map('karteMap', { zoomControl: false }).setView([51.1657, 10.4515], 7);
    L.control.zoom({ position: 'topright' }).addTo(this.map);
    this.setLayer('voyager');

    this.map.on('click', (e) => {
      if (this.selectedId) { this.deselectAll(); return; }
      const lat = e.latlng.lat.toFixed(6);
      const lng = e.latlng.lng.toFixed(6);
      this.openNewSchlagAt(lat, lng);
    });

    setTimeout(() => this.map.invalidateSize(), 200);
  },

  setLayer(name) {
    if (this.currentLayer) this.map.removeLayer(this.currentLayer);
    const cfg = this.layers[name];
    const opts = { attribution: cfg.attr, maxZoom: 19 };
    if (cfg.subdomains) opts.subdomains = cfg.subdomains;
    this.currentLayer = L.tileLayer(cfg.url, opts).addTo(this.map);
  },

  switchLayer(name) { this.setLayer(name); },

  bodenLabels: {
    'sand': 'Sandboden', 'lehm': 'Lehmboden', 'ton': 'Tonboden',
    'schluff': 'Schluffboden', 'moor': 'Moorboden', 'loess': 'Lössboden'
  },

  getMarkerColor(schlagId) {
    const k = this._aktKulturen.find(x => x.schlagId === schlagId);
    if (k && this.kulturColors[k.kultur]) return this.kulturColors[k.kultur];
    return this.kulturColors._default;
  },

  async updateMarkers() {
    this.markers.forEach(m => this.map.removeLayer(m));
    this.markers = [];
    this.markerMap = {};

    const [allSchlaege, aktKulturen] = await Promise.all([
      Storage.getSchlaege(), Storage.getAktiveKulturen()
    ]);
    this._aktKulturen = aktKulturen;
    const schlaege = allSchlaege.filter(s => s.lat && s.lng);

    if (!schlaege.length) {
      document.getElementById('karteInfo').innerHTML = '<div class="info-box">Noch keine Schläge mit Koordinaten. <strong>Klicke auf die Karte</strong> um direkt einen neuen Schlag an dieser Stelle anzulegen.</div>';
      return;
    }

    document.getElementById('karteInfo').innerHTML = '';
    const bounds = [];

    schlaege.forEach(s => {
      const aktKultur = aktKulturen.find(k => k.schlagId === s.id);
      const latLng = [s.lat, s.lng];
      bounds.push(latLng);
      const color = this.getMarkerColor(s.id);
      const radius = Math.max(10, Math.min(28, Math.sqrt(s.groesse) * 7));

      const marker = L.circleMarker(latLng, {
        radius, fillColor: color, fillOpacity: 0.5,
        color, weight: 2.5, className: 'field-marker'
      }).addTo(this.map);

      marker.bindPopup(`
        <div class="map-popup">
          <div class="map-popup-name">${esc(s.name)}</div>
          <div class="map-popup-meta">${formatNumber(s.groesse)} ha</div>
          ${aktKultur ? `<div class="map-popup-kultur"><span class="map-popup-dot" style="background:${color}"></span>${esc(aktKultur.kultur)}${aktKultur.sorte ? ` <span style="opacity:0.6">(${esc(aktKultur.sorte)})</span>` : ''}</div>` : ''}
          ${s.bodenart ? `<div class="map-popup-boden">${this.bodenLabels[s.bodenart] || esc(s.bodenart)}</div>` : ''}
          <div class="map-popup-actions">
            <a href="javascript:void(0)" onclick="Karte.goToSchlagDetail('${s.id}')" class="map-popup-link">Details ansehen &rarr;</a>
          </div>
        </div>
      `, { className: 'terra-popup' });

      marker.on('click', () => this.selectSchlag(s.id));
      marker.on('mouseover', () => {
        if (this.selectedId !== s.id) marker.setStyle({ weight: 3.5, fillOpacity: 0.7 });
        const item = document.querySelector(`.karte-field-item[data-id="${s.id}"]`);
        if (item) item.classList.add('hover');
      });
      marker.on('mouseout', () => {
        if (this.selectedId !== s.id) marker.setStyle({ weight: 2.5, fillOpacity: 0.5 });
        const item = document.querySelector(`.karte-field-item[data-id="${s.id}"]`);
        if (item) item.classList.remove('hover');
      });

      this.markers.push(marker);
      this.markerMap[s.id] = marker;
    });

    if (bounds.length > 1) {
      this.map.fitBounds(bounds, { padding: [40, 40] });
    } else if (bounds.length === 1) {
      this.map.setView(bounds[0], 14);
    }

    setTimeout(() => this.map.invalidateSize(), 100);
  },

  async renderSidebar() {
    const [schlaege, aktKulturen] = await Promise.all([
      Storage.getSchlaege(), Storage.getAktiveKulturen()
    ]);
    this._aktKulturen = aktKulturen;
    const container = document.getElementById('karteSidebarList');
    document.getElementById('karteSidebarCount').textContent = schlaege.length;

    if (!schlaege.length) {
      container.innerHTML = '<div style="padding:1rem;color:var(--text-tertiary);font-size:0.8rem;text-align:center">Keine Schläge angelegt</div>';
      return;
    }

    const allMassnahmen = await Storage.getMassnahmen();

    container.innerHTML = schlaege.map(s => {
      const hasCoords = s.lat && s.lng;
      const aktKultur = aktKulturen.find(k => k.schlagId === s.id);
      const color = this.getMarkerColor(s.id);
      const massCount = allMassnahmen.filter(m => m.schlagId === s.id).length;

      return `<div class="karte-field-item ${this.selectedId === s.id ? 'selected' : ''} ${!hasCoords ? 'no-coords' : ''}" data-id="${s.id}" onclick="Karte.onSidebarClick('${s.id}')">
        <div class="karte-field-dot" style="background:${color}"></div>
        <div class="karte-field-info">
          <div class="karte-field-name">${esc(s.name)}</div>
          <div class="karte-field-detail">
            ${formatNumber(s.groesse)} ha${aktKultur ? ` · ${esc(aktKultur.kultur)}` : ''}${massCount ? ` · ${massCount} Maßn.` : ''}
          </div>
        </div>
        ${!hasCoords ? '<span class="karte-field-nocoord" title="Keine Koordinaten">?</span>' : ''}
      </div>`;
    }).join('');
  },

  async onSidebarClick(id) {
    const s = await Storage.getSchlag(id);
    if (!s) return;
    if (s.lat && s.lng) {
      this.selectSchlag(id);
      this.map.setView([s.lat, s.lng], 15, { animate: true, duration: 0.5 });
      const marker = this.markerMap[id];
      if (marker) marker.openPopup();
    } else {
      this.goToSchlagDetail(id);
    }
  },

  selectSchlag(id) {
    this.deselectAll();
    this.selectedId = id;
    const marker = this.markerMap[id];
    if (marker) {
      marker.setStyle({ weight: 4, fillOpacity: 0.75 });
      marker.setRadius(marker.getRadius() + 3);
    }
    document.querySelectorAll('.karte-field-item').forEach(el => {
      el.classList.toggle('selected', el.dataset.id === id);
    });
    const item = document.querySelector(`.karte-field-item[data-id="${id}"]`);
    if (item) item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },

  async deselectAll() {
    if (this.selectedId && this.markerMap[this.selectedId]) {
      const m = this.markerMap[this.selectedId];
      const s = await Storage.getSchlag(this.selectedId);
      if (s) {
        m.setStyle({ weight: 2.5, fillOpacity: 0.5 });
        m.setRadius(Math.max(10, Math.min(28, Math.sqrt(s.groesse) * 7)));
      }
    }
    this.selectedId = null;
    document.querySelectorAll('.karte-field-item.selected').forEach(el => el.classList.remove('selected'));
  },

  openNewSchlagAt(lat, lng) {
    Schlaege.editId = null;
    const form = document.getElementById('schlagForm');
    form.reset();
    document.getElementById('schlagModalTitle').textContent = 'Neuer Schlag';
    document.getElementById('schlagLat').value = lat;
    document.getElementById('schlagLng').value = lng;

    if (this._tempMarker) this.map.removeLayer(this._tempMarker);
    this._tempMarker = L.circleMarker([parseFloat(lat), parseFloat(lng)], {
      radius: 12, fillColor: '#16A34A', fillOpacity: 0.3,
      color: '#16A34A', weight: 2, dashArray: '5,5'
    }).addTo(this.map);

    openModal('schlagModal');

    const modal = document.getElementById('schlagModal');
    const observer = new MutationObserver(async () => {
      if (!modal.classList.contains('open')) {
        if (this._tempMarker) { this.map.removeLayer(this._tempMarker); this._tempMarker = null; }
        await this.updateMarkers();
        await this.renderSidebar();
        observer.disconnect();
      }
    });
    observer.observe(modal, { attributes: true, attributeFilter: ['class'] });
  },

  goToSchlagDetail(schlagId) {
    Schlaege.pendingDetail = schlagId;
    App.navigateTo('schlaege');
  },

  locateMe() {
    if (!navigator.geolocation) { showToast('Standort nicht verfügbar', 'warning'); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => { this.map.setView([pos.coords.latitude, pos.coords.longitude], 14); showToast('Standort gefunden', 'success'); },
      () => showToast('Standort konnte nicht ermittelt werden', 'warning')
    );
  }
};

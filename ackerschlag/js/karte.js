/* ============================================
   KARTE – Leaflet Kartenansicht v3
   Mit Polygon-Zeichnung, Feld-Flächen,
   Sidebar, Layerwechsel
   ============================================ */

const Karte = {
  map: null,
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

  bodenLabels: {
    'sand': 'Sandboden', 'lehm': 'Lehmboden', 'ton': 'Tonboden',
    'schluff': 'Schluffboden', 'moor': 'Moorboden', 'loess': 'Lössboden'
  },

  // State
  initialized: false,
  selectedId: null,
  currentLayer: null,
  _aktKulturen: [],
  fieldLayers: {},   // schlagId → L.polygon or L.circleMarker
  markerMap: {},      // alias for backward compat
  markers: [],

  // Drawing state
  drawing: false,
  drawPoints: [],
  drawPolyline: null,
  drawPolygon: null,
  drawMarkers: [],
  drawAreaLabel: null,

  // Edit polygon state
  editingId: null,
  editPolygon: null,
  editMarkers: [],

  async render() {
    if (!this.initialized) {
      this.initMap();
      this.initialized = true;
    }
    await this.updateFields();
    await this.renderSidebar();
  },

  initMap() {
    this.map = L.map('karteMap', { zoomControl: false, doubleClickZoom: false }).setView([51.1657, 10.4515], 7);
    L.control.zoom({ position: 'topright' }).addTo(this.map);
    this.setLayer('voyager');

    this.map.on('click', (e) => {
      if (this.drawing) {
        this.addDrawPoint(e.latlng);
        return;
      }
      if (this.editingId) return;
      if (this.selectedId) { this.deselectAll(); return; }
    });

    this.map.on('dblclick', (e) => {
      if (this.drawing) {
        e.originalEvent.preventDefault();
        this.finishDrawing();
      }
    });

    this.map.on('mousemove', (e) => {
      if (this.drawing && this.drawPoints.length > 0) {
        this.updateDrawPreview(e.latlng);
      }
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

  getMarkerColor(schlagId) {
    const k = this._aktKulturen.find(x => x.schlagId === schlagId);
    if (k && this.kulturColors[k.kultur]) return this.kulturColors[k.kultur];
    return this.kulturColors._default;
  },

  // ========== FIELD DISPLAY ==========

  async updateFields() {
    // Remove old layers
    Object.values(this.fieldLayers).forEach(l => this.map.removeLayer(l));
    this.fieldLayers = {};
    this.markerMap = {};
    this.markers = [];

    const [allSchlaege, aktKulturen] = await Promise.all([
      Storage.getSchlaege(), Storage.getAktiveKulturen()
    ]);
    this._aktKulturen = aktKulturen;

    const schlaege = allSchlaege.filter(s => s.lat && s.lng || (s.polygon && s.polygon.length >= 3));

    if (!schlaege.length) {
      document.getElementById('karteInfo').innerHTML = '<div class="info-box">Noch keine Schläge mit Koordinaten. Klicke <strong>\"Feld zeichnen\"</strong> um ein Feld auf der Karte einzuzeichnen.</div>';
      return;
    }

    document.getElementById('karteInfo').innerHTML = '';
    const bounds = [];

    schlaege.forEach(s => {
      const aktKultur = aktKulturen.find(k => k.schlagId === s.id);
      const color = this.getMarkerColor(s.id);
      let layer;

      if (s.polygon && s.polygon.length >= 3) {
        // Polygon field
        layer = L.polygon(s.polygon, {
          fillColor: color, fillOpacity: 0.35,
          color: color, weight: 2.5,
          className: 'field-polygon'
        }).addTo(this.map);

        const polyBounds = layer.getBounds();
        bounds.push(polyBounds.getSouthWest());
        bounds.push(polyBounds.getNorthEast());
      } else if (s.lat && s.lng) {
        // Circle marker fallback
        const latLng = [s.lat, s.lng];
        bounds.push(latLng);
        const radius = Math.max(10, Math.min(28, Math.sqrt(s.groesse) * 7));
        layer = L.circleMarker(latLng, {
          radius, fillColor: color, fillOpacity: 0.5,
          color, weight: 2.5, className: 'field-marker'
        }).addTo(this.map);
      }

      if (!layer) return;

      // Popup
      const areaText = s.polygon && s.polygon.length >= 3
        ? formatNumber(this.calcPolygonArea(s.polygon)) + ' ha (berechnet)'
        : formatNumber(s.groesse) + ' ha';

      layer.bindPopup(`
        <div class="map-popup">
          <div class="map-popup-name">${esc(s.name)}</div>
          <div class="map-popup-meta">${areaText}</div>
          ${aktKultur ? `<div class="map-popup-kultur"><span class="map-popup-dot" style="background:${color}"></span>${esc(aktKultur.kultur)}${aktKultur.sorte ? ` <span style="opacity:0.6">(${esc(aktKultur.sorte)})</span>` : ''}</div>` : ''}
          ${s.bodenart ? `<div class="map-popup-boden">${this.bodenLabels[s.bodenart] || esc(s.bodenart)}</div>` : ''}
          <div class="map-popup-actions">
            <a href="javascript:void(0)" onclick="Karte.editFieldPolygon('${s.id}')" class="map-popup-link">Feld bearbeiten</a>
            <span style="margin:0 0.4rem;color:var(--stone-300)">|</span>
            <a href="javascript:void(0)" onclick="Karte.goToSchlagDetail('${s.id}')" class="map-popup-link">Details &rarr;</a>
          </div>
        </div>
      `, { className: 'terra-popup' });

      // Events
      layer.on('click', () => this.selectSchlag(s.id));
      layer.on('mouseover', () => {
        if (this.selectedId !== s.id) {
          if (layer.setStyle) layer.setStyle({ weight: 3.5, fillOpacity: s.polygon ? 0.5 : 0.7 });
        }
        const item = document.querySelector(`.karte-field-item[data-id="${s.id}"]`);
        if (item) item.classList.add('hover');
      });
      layer.on('mouseout', () => {
        if (this.selectedId !== s.id) {
          if (layer.setStyle) layer.setStyle({ weight: 2.5, fillOpacity: s.polygon ? 0.35 : 0.5 });
        }
        const item = document.querySelector(`.karte-field-item[data-id="${s.id}"]`);
        if (item) item.classList.remove('hover');
      });

      this.fieldLayers[s.id] = layer;
      this.markerMap[s.id] = layer;
      this.markers.push(layer);
    });

    if (bounds.length > 1) {
      this.map.fitBounds(bounds, { padding: [40, 40] });
    } else if (bounds.length === 1) {
      this.map.setView(bounds[0], 14);
    }

    setTimeout(() => this.map.invalidateSize(), 100);
  },

  // ========== SIDEBAR ==========

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
      const hasCoords = (s.lat && s.lng) || (s.polygon && s.polygon.length >= 3);
      const aktKultur = aktKulturen.find(k => k.schlagId === s.id);
      const color = this.getMarkerColor(s.id);
      const massCount = allMassnahmen.filter(m => m.schlagId === s.id).length;
      const hasPolygon = s.polygon && s.polygon.length >= 3;

      return `<div class="karte-field-item ${this.selectedId === s.id ? 'selected' : ''} ${!hasCoords ? 'no-coords' : ''}" data-id="${s.id}" onclick="Karte.onSidebarClick('${s.id}')">
        <div class="karte-field-dot" style="background:${color}"></div>
        <div class="karte-field-info">
          <div class="karte-field-name">${esc(s.name)}</div>
          <div class="karte-field-detail">
            ${formatNumber(s.groesse)} ha${aktKultur ? ` · ${esc(aktKultur.kultur)}` : ''}${massCount ? ` · ${massCount} Maßn.` : ''}${hasPolygon ? ' · Polygon' : ''}
          </div>
        </div>
        ${!hasCoords ? '<span class="karte-field-nocoord" title="Keine Koordinaten">?</span>' : ''}
      </div>`;
    }).join('');
  },

  async onSidebarClick(id) {
    const s = await Storage.getSchlag(id);
    if (!s) return;

    const layer = this.fieldLayers[id];
    if (layer) {
      this.selectSchlag(id);
      if (s.polygon && s.polygon.length >= 3) {
        this.map.fitBounds(layer.getBounds(), { padding: [60, 60], animate: true, duration: 0.5 });
      } else if (s.lat && s.lng) {
        this.map.setView([s.lat, s.lng], 15, { animate: true, duration: 0.5 });
      }
      layer.openPopup();
    } else {
      this.goToSchlagDetail(id);
    }
  },

  selectSchlag(id) {
    this.deselectAll();
    this.selectedId = id;
    const layer = this.fieldLayers[id];
    if (layer) {
      if (layer.setStyle) layer.setStyle({ weight: 4, fillOpacity: 0.6 });
      if (layer.setRadius) layer.setRadius(layer.getRadius() + 3);
    }
    document.querySelectorAll('.karte-field-item').forEach(el => {
      el.classList.toggle('selected', el.dataset.id === id);
    });
    const item = document.querySelector(`.karte-field-item[data-id="${id}"]`);
    if (item) item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },

  async deselectAll() {
    if (this.selectedId && this.fieldLayers[this.selectedId]) {
      const layer = this.fieldLayers[this.selectedId];
      const s = await Storage.getSchlag(this.selectedId);
      if (s && layer.setStyle) {
        const isPolygon = s.polygon && s.polygon.length >= 3;
        layer.setStyle({ weight: 2.5, fillOpacity: isPolygon ? 0.35 : 0.5 });
        if (!isPolygon && layer.setRadius) {
          layer.setRadius(Math.max(10, Math.min(28, Math.sqrt(s.groesse) * 7)));
        }
      }
    }
    this.selectedId = null;
    document.querySelectorAll('.karte-field-item.selected').forEach(el => el.classList.remove('selected'));
  },

  // ========== POLYGON DRAWING ==========

  startDrawing() {
    if (this.drawing) return;
    this.drawing = true;
    this.drawPoints = [];
    this.map.getContainer().style.cursor = 'crosshair';

    // Show draw toolbar
    document.getElementById('drawToolbar').style.display = 'flex';
    document.getElementById('drawStartBtn').style.display = 'none';

    showToast('Klicke auf die Karte um Eckpunkte zu setzen. Doppelklick zum Abschließen.', 'info');
  },

  addDrawPoint(latlng) {
    this.drawPoints.push([latlng.lat, latlng.lng]);

    // Add vertex marker
    const marker = L.circleMarker(latlng, {
      radius: 6, fillColor: '#16A34A', fillOpacity: 1,
      color: '#fff', weight: 2, className: 'draw-vertex'
    }).addTo(this.map);

    // Click on first vertex to close
    if (this.drawPoints.length === 1) {
      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        if (this.drawPoints.length >= 3) this.finishDrawing();
      });
      marker.setStyle({ radius: 8, fillColor: '#059669' });
    }

    this.drawMarkers.push(marker);

    // Update polyline preview
    if (this.drawPolyline) this.map.removeLayer(this.drawPolyline);
    if (this.drawPoints.length >= 2) {
      this.drawPolyline = L.polyline(this.drawPoints, {
        color: '#16A34A', weight: 2.5, dashArray: '8,6', opacity: 0.8
      }).addTo(this.map);
    }

    // Update polygon preview
    if (this.drawPolygon) this.map.removeLayer(this.drawPolygon);
    if (this.drawPoints.length >= 3) {
      this.drawPolygon = L.polygon(this.drawPoints, {
        fillColor: '#16A34A', fillOpacity: 0.15,
        color: '#16A34A', weight: 1.5, dashArray: '4,4'
      }).addTo(this.map);
    }

    // Update area display
    this.updateDrawArea();
  },

  updateDrawPreview(latlng) {
    const tempPoints = [...this.drawPoints, [latlng.lat, latlng.lng]];

    if (this.drawPolyline) this.map.removeLayer(this.drawPolyline);
    this.drawPolyline = L.polyline(tempPoints, {
      color: '#16A34A', weight: 2.5, dashArray: '8,6', opacity: 0.8
    }).addTo(this.map);

    if (tempPoints.length >= 3) {
      if (this.drawPolygon) this.map.removeLayer(this.drawPolygon);
      this.drawPolygon = L.polygon(tempPoints, {
        fillColor: '#16A34A', fillOpacity: 0.15,
        color: '#16A34A', weight: 1.5, dashArray: '4,4'
      }).addTo(this.map);
    }
  },

  updateDrawArea() {
    const areaEl = document.getElementById('drawArea');
    if (this.drawPoints.length >= 3) {
      const ha = this.calcPolygonArea(this.drawPoints);
      areaEl.textContent = formatNumber(ha) + ' ha';
      areaEl.style.display = 'inline';
    } else {
      areaEl.style.display = 'none';
    }
  },

  undoDrawPoint() {
    if (!this.drawPoints.length) return;
    this.drawPoints.pop();

    const lastMarker = this.drawMarkers.pop();
    if (lastMarker) this.map.removeLayer(lastMarker);

    // Rebuild preview
    if (this.drawPolyline) { this.map.removeLayer(this.drawPolyline); this.drawPolyline = null; }
    if (this.drawPolygon) { this.map.removeLayer(this.drawPolygon); this.drawPolygon = null; }

    if (this.drawPoints.length >= 2) {
      this.drawPolyline = L.polyline(this.drawPoints, {
        color: '#16A34A', weight: 2.5, dashArray: '8,6', opacity: 0.8
      }).addTo(this.map);
    }
    if (this.drawPoints.length >= 3) {
      this.drawPolygon = L.polygon(this.drawPoints, {
        fillColor: '#16A34A', fillOpacity: 0.15,
        color: '#16A34A', weight: 1.5, dashArray: '4,4'
      }).addTo(this.map);
    }

    this.updateDrawArea();
  },

  cancelDrawing() {
    this.cleanupDraw();
    this.drawing = false;
    this.editingId = null;
    this._editSaveMode = false;
    this.map.getContainer().style.cursor = '';
    document.getElementById('drawToolbar').style.display = 'none';
    document.getElementById('drawStartBtn').style.display = '';
  },

  async finishDrawing() {
    if (this.drawPoints.length < 3) {
      showToast('Mindestens 3 Punkte nötig', 'warning');
      return;
    }

    this.drawing = false;
    this.map.getContainer().style.cursor = '';

    const polygon = [...this.drawPoints];
    const area = this.calcPolygonArea(polygon);
    const center = this.calcPolygonCenter(polygon);

    // Clean up draw visuals
    this.cleanupDraw();
    document.getElementById('drawToolbar').style.display = 'none';
    document.getElementById('drawStartBtn').style.display = '';

    // If editing an existing field's polygon
    if (this._editSaveMode && this.editingId) {
      const s = await Storage.getSchlag(this.editingId);
      if (s) {
        s.polygon = polygon;
        s.groesse = parseFloat(area.toFixed(2));
        s.lat = parseFloat(center[0].toFixed(6));
        s.lng = parseFloat(center[1].toFixed(6));
        await Storage.saveSchlag(s);
        showToast('Feldgrenze gespeichert', 'success');
      }
      this.editingId = null;
      this._editSaveMode = false;
      await this.updateFields();
      await this.renderSidebar();
      return;
    }

    // Open new Schlag modal with polygon data
    Schlaege.editId = null;
    const form = document.getElementById('schlagForm');
    form.reset();
    document.getElementById('schlagModalTitle').textContent = 'Neuer Schlag';
    document.getElementById('schlagLat').value = center[0].toFixed(6);
    document.getElementById('schlagLng').value = center[1].toFixed(6);
    document.getElementById('schlagGroesse').value = area.toFixed(2);

    // Store polygon temporarily
    this._pendingPolygon = polygon;

    // Show preview polygon
    this._tempPolygon = L.polygon(polygon, {
      fillColor: '#16A34A', fillOpacity: 0.25,
      color: '#16A34A', weight: 2.5, dashArray: '6,4'
    }).addTo(this.map);

    openModal('schlagModal');

    // Watch for modal close
    const modal = document.getElementById('schlagModal');
    const observer = new MutationObserver(async () => {
      if (!modal.classList.contains('open')) {
        if (this._tempPolygon) { this.map.removeLayer(this._tempPolygon); this._tempPolygon = null; }
        this._pendingPolygon = null;
        await this.updateFields();
        await this.renderSidebar();
        observer.disconnect();
      }
    });
    observer.observe(modal, { attributes: true, attributeFilter: ['class'] });
  },

  cleanupDraw() {
    if (this.drawPolyline) { this.map.removeLayer(this.drawPolyline); this.drawPolyline = null; }
    if (this.drawPolygon) { this.map.removeLayer(this.drawPolygon); this.drawPolygon = null; }
    this.drawMarkers.forEach(m => this.map.removeLayer(m));
    this.drawMarkers = [];
    this.drawPoints = [];
    document.getElementById('drawArea').style.display = 'none';
  },

  // ========== EDIT POLYGON ==========

  async editFieldPolygon(schlagId) {
    const s = await Storage.getSchlag(schlagId);
    if (!s) return;

    // Close popup
    this.map.closePopup();

    if (!s.polygon || s.polygon.length < 3) {
      // No polygon yet — start fresh drawing for this field
      showToast('Zeichne die Feldgrenze. Doppelklick zum Abschließen.', 'info');
      this.editingId = schlagId;
      this.drawing = true;
      this.drawPoints = [];
      this.map.getContainer().style.cursor = 'crosshair';
      document.getElementById('drawToolbar').style.display = 'flex';
      document.getElementById('drawStartBtn').style.display = 'none';

      // Override finish to save to existing field
      this._editSaveMode = true;
      return;
    }

    // Edit existing polygon — show draggable vertices
    this.editingId = schlagId;
    this.editMarkers = [];

    // Hide the field layer temporarily
    const existingLayer = this.fieldLayers[schlagId];
    if (existingLayer) this.map.removeLayer(existingLayer);

    // Create editable polygon
    const editPoints = [...s.polygon];
    this.editPolygon = L.polygon(editPoints, {
      fillColor: '#16A34A', fillOpacity: 0.3,
      color: '#16A34A', weight: 2.5
    }).addTo(this.map);

    // Add draggable vertex markers
    editPoints.forEach((pt, idx) => {
      const marker = L.marker(pt, {
        draggable: true,
        icon: L.divIcon({
          className: 'edit-vertex-icon',
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        })
      }).addTo(this.map);

      marker.on('drag', () => {
        const pos = marker.getLatLng();
        editPoints[idx] = [pos.lat, pos.lng];
        this.editPolygon.setLatLngs(editPoints);
      });

      this.editMarkers.push(marker);
    });

    // Show edit toolbar
    document.getElementById('editToolbar').style.display = 'flex';
    document.getElementById('drawStartBtn').style.display = 'none';

    // Update area display
    const areaEl = document.getElementById('editArea');
    const updateArea = () => {
      areaEl.textContent = formatNumber(this.calcPolygonArea(editPoints)) + ' ha';
    };
    updateArea();
    this.editMarkers.forEach(m => m.on('drag', updateArea));

    this._editPoints = editPoints;
  },

  async saveEditPolygon() {
    if (!this.editingId || !this._editPoints) return;

    const s = await Storage.getSchlag(this.editingId);
    if (!s) return;

    s.polygon = this._editPoints;
    s.groesse = parseFloat(this.calcPolygonArea(this._editPoints).toFixed(2));
    const center = this.calcPolygonCenter(this._editPoints);
    s.lat = parseFloat(center[0].toFixed(6));
    s.lng = parseFloat(center[1].toFixed(6));

    await Storage.saveSchlag(s);
    this.cancelEdit();
    await this.updateFields();
    await this.renderSidebar();
    showToast('Feldgrenze gespeichert', 'success');
  },

  async deleteFieldPolygon() {
    if (!this.editingId) return;
    if (!confirm('Feldgrenze wirklich löschen? Der Schlag bleibt erhalten.')) return;

    const s = await Storage.getSchlag(this.editingId);
    if (!s) return;

    s.polygon = null;
    await Storage.saveSchlag(s);
    this.cancelEdit();
    await this.updateFields();
    await this.renderSidebar();
    showToast('Feldgrenze entfernt', 'success');
  },

  cancelEdit() {
    if (this.editPolygon) { this.map.removeLayer(this.editPolygon); this.editPolygon = null; }
    this.editMarkers.forEach(m => this.map.removeLayer(m));
    this.editMarkers = [];
    this.editingId = null;
    this._editPoints = null;
    document.getElementById('editToolbar').style.display = 'none';
    document.getElementById('drawStartBtn').style.display = '';
  },

  // ========== AREA CALCULATION ==========

  calcPolygonArea(points) {
    // Gauss's area formula on projected coordinates (good enough for small areas)
    // Returns area in hectares
    if (points.length < 3) return 0;

    // Use Leaflet's built-in geodesic area calculation
    const latlngs = points.map(p => L.latLng(p[0], p[1]));
    const sqMeters = L.GeometryUtil
      ? L.GeometryUtil.geodesicArea(latlngs)
      : this._geodesicArea(latlngs);

    return sqMeters / 10000; // m² → ha
  },

  _geodesicArea(latlngs) {
    // Shoelace on spherical coords
    const d2r = Math.PI / 180;
    const len = latlngs.length;
    if (len < 3) return 0;

    let area = 0;
    for (let i = 0; i < len; i++) {
      const j = (i + 1) % len;
      const k = (i + 2) % len;
      area += latlngs[j].lng * d2r * (Math.sin(latlngs[k].lat * d2r) - Math.sin(latlngs[i].lat * d2r));
    }

    const R = 6371000; // Earth radius in meters
    area = Math.abs(area * R * R / 2);
    return area;
  },

  calcPolygonCenter(points) {
    const lat = points.reduce((s, p) => s + p[0], 0) / points.length;
    const lng = points.reduce((s, p) => s + p[1], 0) / points.length;
    return [lat, lng];
  },

  // ========== NAVIGATION ==========

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

/* ============================================
   FLÄCHENIMPORT – GeoJSON & Shapefile Import
   ============================================ */

const Flaechenimport = {
  importedFeatures: [],
  previewLayers: [],

  openModal() {
    this.importedFeatures = [];
    this.clearPreview();
    openModal('importModal');
    document.getElementById('importDropzone').classList.remove('dragover');
    document.getElementById('importPreview').innerHTML = '';
    document.getElementById('importConfirmBtn').style.display = 'none';
  },

  initDropzone() {
    const dz = document.getElementById('importDropzone');
    if (!dz) return;

    ['dragenter', 'dragover'].forEach(evt => {
      dz.addEventListener(evt, (e) => { e.preventDefault(); dz.classList.add('dragover'); });
    });
    ['dragleave', 'drop'].forEach(evt => {
      dz.addEventListener(evt, (e) => { e.preventDefault(); dz.classList.remove('dragover'); });
    });

    dz.addEventListener('drop', (e) => this.handleDrop(e));
    dz.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.geojson,.json,.zip';
      input.onchange = (e) => this.handleFile(e.target.files[0]);
      input.click();
    });
  },

  handleDrop(e) {
    const file = e.dataTransfer.files[0];
    if (file) this.handleFile(file);
  },

  async handleFile(file) {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();

    try {
      if (ext === 'geojson' || ext === 'json') {
        const text = await file.text();
        const geojson = JSON.parse(text);
        this.processGeoJSON(geojson);
      } else if (ext === 'zip') {
        // Shapefile (ZIP) — benötigt shp.min.js
        if (typeof shp === 'undefined') {
          showToast('Shapefile-Parser nicht geladen', 'error');
          return;
        }
        const buffer = await file.arrayBuffer();
        const geojson = await shp(buffer);
        this.processGeoJSON(geojson);
      } else {
        showToast('Nur .geojson oder .zip (Shapefile) unterstützt', 'warning');
      }
    } catch (err) {
      console.error('Import error:', err);
      showToast('Fehler beim Lesen der Datei: ' + err.message, 'error');
    }
  },

  processGeoJSON(geojson) {
    let features = [];

    if (geojson.type === 'FeatureCollection') {
      features = geojson.features || [];
    } else if (geojson.type === 'Feature') {
      features = [geojson];
    } else if (Array.isArray(geojson)) {
      // shpjs kann Arrays von FeatureCollections zurückgeben
      geojson.forEach(fc => {
        if (fc.features) features.push(...fc.features);
      });
    }

    // Nur Polygone / MultiPolygone
    features = features.filter(f =>
      f.geometry && (f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon')
    );

    if (!features.length) {
      showToast('Keine Polygon-Features gefunden', 'warning');
      return;
    }

    // Felder parsen
    this.importedFeatures = features.map((f, i) => {
      const props = f.properties || {};
      // Feldnamen-Erkennung aus Properties
      const name = props.Name || props.name || props.NAME || props.Schlag || props.schlag ||
                   props.SCHLAG || props.Feldname || props.feldname || props.BEZEICHNUNG ||
                   props.bezeichnung || props.Label || props.label || `Import ${i + 1}`;
      const groesse = props.Flaeche || props.flaeche || props.FLAECHE || props.Area || props.area ||
                      props.ha || props.HA || null;

      // Koordinaten: GeoJSON = [lng, lat], Leaflet = [lat, lng]
      let polygon;
      if (f.geometry.type === 'Polygon') {
        polygon = f.geometry.coordinates[0].map(c => [c[1], c[0]]);
      } else {
        // MultiPolygon: erstes Polygon nehmen
        polygon = f.geometry.coordinates[0][0].map(c => [c[1], c[0]]);
      }

      // Fläche berechnen (vereinfacht via Shoelace)
      const calcHa = this.calcPolygonArea(polygon);

      return {
        name: String(name).substring(0, 100),
        groesse: groesse ? parseFloat(groesse) : calcHa,
        polygon,
        selected: true,
        properties: props
      };
    });

    this.renderPreview();
    showToast(`${this.importedFeatures.length} Felder erkannt`, 'success');
  },

  calcPolygonArea(coords) {
    // Approximation via Haversine/Shoelace für geographische Koordinaten
    if (coords.length < 3) return 0;
    const toRad = (d) => d * Math.PI / 180;
    let area = 0;
    const n = coords.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += toRad(coords[j][1] - coords[i][1]) * (2 + Math.sin(toRad(coords[i][0])) + Math.sin(toRad(coords[j][0])));
    }
    area = Math.abs(area * 6378137 * 6378137 / 2);
    return Math.round(area / 10000 * 100) / 100; // m² → ha
  },

  renderPreview() {
    const container = document.getElementById('importPreview');
    if (!this.importedFeatures.length) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = `
      <div class="section-divider" style="margin-top:0.5rem">Erkannte Felder (${this.importedFeatures.length})</div>
      <div class="table-wrap"><table>
        <thead><tr><th>✓</th><th>Name</th><th>Fläche (ha)</th></tr></thead>
        <tbody>
        ${this.importedFeatures.map((f, i) => `
          <tr>
            <td><input type="checkbox" ${f.selected ? 'checked' : ''} onchange="Flaechenimport.toggleFeature(${i}, this.checked)"></td>
            <td><input class="form-input" style="padding:0.3rem 0.5rem;font-size:0.82rem" value="${esc(f.name)}" onchange="Flaechenimport.renameFeature(${i}, this.value)"></td>
            <td>${formatNumber(f.groesse)}</td>
          </tr>`).join('')}
        </tbody>
      </table></div>
    `;

    document.getElementById('importConfirmBtn').style.display = 'block';
  },

  toggleFeature(idx, checked) {
    this.importedFeatures[idx].selected = checked;
  },

  renameFeature(idx, name) {
    this.importedFeatures[idx].name = name;
  },

  async confirmImport() {
    const selected = this.importedFeatures.filter(f => f.selected);
    if (!selected.length) {
      showToast('Keine Felder ausgewählt', 'warning');
      return;
    }

    let count = 0;
    for (const f of selected) {
      // Mittelpunkt berechnen
      const lats = f.polygon.map(c => c[0]);
      const lngs = f.polygon.map(c => c[1]);
      const lat = lats.reduce((s, v) => s + v, 0) / lats.length;
      const lng = lngs.reduce((s, v) => s + v, 0) / lngs.length;

      // Polygon als JSON für Supabase speichern (Format: [[lat,lng], ...])
      const polygonJson = JSON.stringify(f.polygon);

      await Storage.saveSchlag({
        name: f.name,
        groesse: f.groesse,
        lat, lng,
        polygon: polygonJson,
        flurstueck: '', bodenart: '', bodenpunkte: null, notiz: 'Importiert'
      });
      count++;
    }

    closeModal('importModal');
    this.importedFeatures = [];
    showToast(`${count} Schläge importiert`, 'success');

    // Seite neu laden
    if (App.currentPage === 'karte') {
      await Karte.render();
    } else if (App.currentPage === 'schlaege') {
      await Schlaege.render();
    }
  },

  clearPreview() {
    this.previewLayers.forEach(l => {
      if (Karte.map) Karte.map.removeLayer(l);
    });
    this.previewLayers = [];
  }
};

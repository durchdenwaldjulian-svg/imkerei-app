/* ============================================
   WETTER – Wettervorhersage & Agrar-Tipps
   Open-Meteo API (kostenlos, kein API-Key)
   ============================================ */

const Wetter = {
  selectedSchlagId: null,
  weatherData: null,
  loading: false,

  // WMO Wettercodes → Deutsche Beschreibung + Emoji
  wmoCodeMap: {
    0:  { text: 'Klar',          icon: '\u2600\uFE0F' },
    1:  { text: 'Leicht bew\u00f6lkt', icon: '\u26C5' },
    2:  { text: 'Bew\u00f6lkt',        icon: '\u26C5' },
    3:  { text: 'Bedeckt',       icon: '\u2601\uFE0F' },
    45: { text: 'Nebel',         icon: '\uD83C\uDF2B\uFE0F' },
    48: { text: 'Nebel (Reif)',  icon: '\uD83C\uDF2B\uFE0F' },
    51: { text: 'Leichter Nieselregen', icon: '\uD83C\uDF26\uFE0F' },
    53: { text: 'Nieselregen',          icon: '\uD83C\uDF26\uFE0F' },
    55: { text: 'Starker Nieselregen',  icon: '\uD83C\uDF26\uFE0F' },
    61: { text: 'Leichter Regen', icon: '\uD83C\uDF27\uFE0F' },
    63: { text: 'Regen',          icon: '\uD83C\uDF27\uFE0F' },
    65: { text: 'Starkregen',     icon: '\uD83C\uDF27\uFE0F' },
    66: { text: 'Gefrierender Regen',   icon: '\uD83C\uDF27\uFE0F' },
    67: { text: 'Starker gefr. Regen',  icon: '\uD83C\uDF27\uFE0F' },
    71: { text: 'Leichter Schnee', icon: '\u2744\uFE0F' },
    73: { text: 'Schnee',          icon: '\u2744\uFE0F' },
    75: { text: 'Starker Schnee',  icon: '\u2744\uFE0F' },
    77: { text: 'Schneegriesel',   icon: '\u2744\uFE0F' },
    80: { text: 'Leichte Schauer', icon: '\uD83C\uDF26\uFE0F' },
    81: { text: 'Schauer',         icon: '\uD83C\uDF26\uFE0F' },
    82: { text: 'Starke Schauer',  icon: '\uD83C\uDF26\uFE0F' },
    85: { text: 'Schneeschauer',   icon: '\u2744\uFE0F' },
    86: { text: 'Starke Schneeschauer', icon: '\u2744\uFE0F' },
    95: { text: 'Gewitter',        icon: '\u26C8\uFE0F' },
    96: { text: 'Gewitter mit Hagel',   icon: '\u26C8\uFE0F' },
    99: { text: 'Starkes Gewitter',     icon: '\u26C8\uFE0F' }
  },

  getWeatherInfo(code) {
    return this.wmoCodeMap[code] || { text: 'Unbekannt', icon: '\u2753' };
  },

  async render() {
    const container = document.getElementById('page-wetter');
    if (!container) return;

    // Ladescreen anzeigen
    container.innerHTML = `
      <div class="page-header">
        <h2>${Icons.render('dashboard', 22)} Wetter & Agrar-Prognose</h2>
      </div>
      <div style="text-align:center;padding:3rem 1rem">
        <div class="spinner"></div>
        <p style="color:var(--text-soft);margin-top:1rem">Wetterdaten werden geladen\u2026</p>
      </div>`;

    const schlaege = await Storage.getSchlaege();
    const mitKoords = schlaege.filter(s => s.lat && s.lng);

    if (!mitKoords.length) {
      container.innerHTML = `
        <div class="page-header">
          <h2>${Icons.render('dashboard', 22)} Wetter & Agrar-Prognose</h2>
        </div>
        <div class="info-box" style="margin:2rem 0">
          ${Icons.render('info', 18)}
          <span>Kein Schlag mit Koordinaten vorhanden. Bitte legen Sie zun\u00e4chst Schl\u00e4ge mit Standort (Breitengrad/L\u00e4ngengrad) an.</span>
        </div>`;
      return;
    }

    // Standard: erster Schlag oder vorher gew\u00e4hlter
    if (!this.selectedSchlagId || !mitKoords.find(s => s.id === this.selectedSchlagId)) {
      this.selectedSchlagId = mitKoords[0].id;
    }

    const schlag = mitKoords.find(s => s.id === this.selectedSchlagId);

    // Wetter laden
    try {
      this.loading = true;
      await this.fetchWeather(schlag.lat, schlag.lng);
      this.loading = false;
    } catch (err) {
      this.loading = false;
      console.error('Wetter-Fehler:', err);
      showToast('Wetterdaten konnten nicht geladen werden.', 'error');
      container.innerHTML = `
        <div class="page-header">
          <h2>${Icons.render('dashboard', 22)} Wetter & Agrar-Prognose</h2>
        </div>
        ${this.renderSchlagSelect(mitKoords)}
        <div class="info-box" style="margin:2rem 0">
          ${Icons.render('info', 18)}
          <span>Fehler beim Laden der Wetterdaten. Bitte pr\u00fcfen Sie Ihre Internetverbindung und versuchen Sie es erneut.</span>
        </div>`;
      this.bindEvents(mitKoords);
      return;
    }

    // Alles rendern
    const current = this.weatherData.current_weather;
    const daily = this.weatherData.daily;
    const currentInfo = this.getWeatherInfo(current.weathercode);
    const todayPrecip = daily.precipitation_sum[0] || 0;

    const html = `
      <div class="page-header">
        <h2>${Icons.render('dashboard', 22)} Wetter & Agrar-Prognose</h2>
      </div>

      ${this.renderSchlagSelect(mitKoords)}

      <!-- Aktuelles Wetter -->
      <div class="stats-grid" style="margin-bottom:1.5rem">
        <div class="stat-card">
          <div class="stat-icon" style="font-size:1.6rem">\uD83C\uDF21\uFE0F</div>
          <div class="stat-value">${formatNumber(current.temperature)} \u00B0C</div>
          <div class="stat-label">Aktuelle Temperatur</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="font-size:1.6rem">\uD83C\uDF27\uFE0F</div>
          <div class="stat-value">${formatNumber(todayPrecip)} mm</div>
          <div class="stat-label">Niederschlag heute</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="font-size:1.6rem">\uD83D\uDCA8</div>
          <div class="stat-value">${formatNumber(current.windspeed)} km/h</div>
          <div class="stat-label">Windgeschwindigkeit</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="font-size:1.6rem">${currentInfo.icon}</div>
          <div class="stat-value">${esc(currentInfo.text)}</div>
          <div class="stat-label">Wetterlage</div>
        </div>
      </div>

      <!-- Agrar-Tipps -->
      ${this.renderAgrartipps(current, daily)}

      <div class="section-divider"></div>

      <!-- 10-Tage Vorhersage -->
      <h3 style="margin-bottom:1rem">${Icons.render('auswertung', 18)} 10-Tage Vorhersage f\u00fcr ${esc(schlag.name)}</h3>
      ${this.renderForecastCards(daily)}

      <div class="section-divider"></div>

      <!-- Detail-Tabelle -->
      <h3 style="margin-bottom:1rem">${Icons.render('massnahmen', 18)} Detail\u00fcbersicht</h3>
      ${this.renderForecastTable(daily)}
    `;

    container.innerHTML = html;
    this.bindEvents(mitKoords);
  },

  renderSchlagSelect(mitKoords) {
    return `
      <div style="margin-bottom:1.5rem">
        <label style="font-weight:600;margin-bottom:0.4rem;display:block">Schlag ausw\u00e4hlen:</label>
        <select id="wetterSchlagSelect" class="form-select" style="max-width:400px">
          ${mitKoords.map(s => `<option value="${s.id}" ${s.id === this.selectedSchlagId ? 'selected' : ''}>${esc(s.name)} (${formatNumber(s.lat, 4)}, ${formatNumber(s.lng, 4)})</option>`).join('')}
        </select>
      </div>`;
  },

  bindEvents(mitKoords) {
    const select = document.getElementById('wetterSchlagSelect');
    if (select) {
      select.addEventListener('change', (e) => {
        this.selectedSchlagId = e.target.value;
        // ID kann string oder number sein
        if (!isNaN(this.selectedSchlagId)) {
          this.selectedSchlagId = parseInt(this.selectedSchlagId);
        }
        this.render();
      });
    }
  },

  async fetchWeather(lat, lng) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,weathercode&current_weather=true&timezone=Europe/Berlin&forecast_days=10`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    this.weatherData = await resp.json();
  },

  renderForecastCards(daily) {
    const days = daily.time;
    let html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:0.75rem;margin-bottom:1rem">';

    for (let i = 0; i < days.length; i++) {
      const info = this.getWeatherInfo(daily.weathercode[i]);
      const tMax = daily.temperature_2m_max[i];
      const tMin = daily.temperature_2m_min[i];
      const precip = daily.precipitation_sum[i] || 0;
      const wind = daily.windspeed_10m_max[i] || 0;
      const dateStr = this.formatWeekday(days[i]);
      const isToday = i === 0;

      html += `
        <div class="card" style="text-align:center;padding:0.85rem 0.5rem;${isToday ? 'border:2px solid var(--primary);' : ''}">
          <div style="font-weight:600;font-size:0.8rem;color:${isToday ? 'var(--primary)' : 'var(--text-soft)'};margin-bottom:0.3rem">
            ${isToday ? 'Heute' : esc(dateStr)}
          </div>
          <div style="font-size:0.75rem;color:var(--text-soft);margin-bottom:0.5rem">${formatDate(days[i])}</div>
          <div style="font-size:2rem;line-height:1">${info.icon}</div>
          <div style="font-size:0.75rem;color:var(--text-soft);margin:0.3rem 0">${esc(info.text)}</div>
          <div style="font-weight:700;font-size:1rem;margin:0.3rem 0">
            <span style="color:var(--primary)">${formatNumber(tMax)}\u00B0</span>
            <span style="color:var(--text-soft);font-weight:400;font-size:0.85rem"> / ${formatNumber(tMin)}\u00B0</span>
          </div>
          <div style="font-size:0.75rem;color:var(--text-soft);margin-top:0.2rem">
            \uD83C\uDF27\uFE0F ${formatNumber(precip)} mm &nbsp;\uD83D\uDCA8 ${formatNumber(wind)} km/h
          </div>
        </div>`;
    }

    html += '</div>';
    return html;
  },

  renderForecastTable(daily) {
    const days = daily.time;
    let rows = '';

    for (let i = 0; i < days.length; i++) {
      const info = this.getWeatherInfo(daily.weathercode[i]);
      const tMax = daily.temperature_2m_max[i];
      const tMin = daily.temperature_2m_min[i];
      const precip = daily.precipitation_sum[i] || 0;
      const wind = daily.windspeed_10m_max[i] || 0;

      rows += `
        <tr>
          <td style="white-space:nowrap">${i === 0 ? '<strong>Heute</strong>' : esc(this.formatWeekday(days[i]))}</td>
          <td style="white-space:nowrap">${formatDate(days[i])}</td>
          <td>${info.icon} ${esc(info.text)}</td>
          <td style="text-align:right"><strong>${formatNumber(tMax)}\u00B0C</strong></td>
          <td style="text-align:right">${formatNumber(tMin)}\u00B0C</td>
          <td style="text-align:right">${formatNumber(precip)} mm</td>
          <td style="text-align:right">${formatNumber(wind)} km/h</td>
          <td>${this.getWindWarning(wind)}</td>
        </tr>`;
    }

    return `
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Tag</th>
              <th>Datum</th>
              <th>Wetter</th>
              <th style="text-align:right">Max \u00B0C</th>
              <th style="text-align:right">Min \u00B0C</th>
              <th style="text-align:right">Niederschlag</th>
              <th style="text-align:right">Wind</th>
              <th>Hinweis</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  },

  getWindWarning(windKmh) {
    if (windKmh > 60) return '\u26A0\uFE0F Sturm';
    if (windKmh > 40) return '\u26A0\uFE0F Starkwind';
    if (windKmh > 18) return '\uD83D\uDCA8 Windig';
    return '';
  },

  renderAgrartipps(current, daily) {
    const tipps = [];
    const windMs = (current.windspeed || 0) / 3.6; // km/h → m/s
    const tMin = daily.temperature_2m_min[0];
    const tMax = daily.temperature_2m_max[0];
    const precip = daily.precipitation_sum[0] || 0;
    const weathercode = current.weathercode;

    // Wind-Check f\u00fcr Pflanzenschutz
    if (windMs > 5) {
      tipps.push({
        type: 'warning',
        icon: '\uD83D\uDCA8',
        text: `Kein Spritzen bei Wind \u00fcber 5 m/s empfohlen (aktuell: ${formatNumber(windMs, 1)} m/s). Abdriftgefahr!`
      });
    }

    // Frost-Warnung
    if (tMin <= 0) {
      tipps.push({
        type: 'warning',
        icon: '\u2744\uFE0F',
        text: `Frostgefahr (Min. ${formatNumber(tMin)}\u00B0C) \u2013 kein D\u00fcngen, kein Spritzen. Frostempfindliche Kulturen sch\u00fctzen!`
      });
    } else if (tMin <= 3) {
      tipps.push({
        type: 'info',
        icon: '\uD83C\uDF21\uFE0F',
        text: `Bodenfrost m\u00f6glich (Min. ${formatNumber(tMin)}\u00B0C) \u2013 Vorsicht bei empfindlichen Kulturen.`
      });
    }

    // Niederschlag
    if (precip > 10) {
      tipps.push({
        type: 'warning',
        icon: '\uD83C\uDF27\uFE0F',
        text: `Starker Niederschlag erwartet (${formatNumber(precip)} mm). Bodenbearbeitung und Erntearbeiten vermeiden.`
      });
    } else if (precip > 5) {
      tipps.push({
        type: 'info',
        icon: '\uD83C\uDF27\uFE0F',
        text: `Niederschlag erwartet (${formatNumber(precip)} mm). Pflanzenschutzma\u00dfnahmen ggf. verschieben.`
      });
    }

    // Hitze
    if (tMax > 30) {
      tipps.push({
        type: 'warning',
        icon: '\uD83C\uDF21\uFE0F',
        text: `Hitzetag (Max. ${formatNumber(tMax)}\u00B0C) \u2013 Bew\u00e4sserung pr\u00fcfen. Spritzungen in die fr\u00fchen Morgenstunden verlegen.`
      });
    }

    // Nebel
    if (weathercode === 45 || weathercode === 48) {
      tipps.push({
        type: 'info',
        icon: '\uD83C\uDF2B\uFE0F',
        text: 'Nebel \u2013 Pflanzenschutzmittel k\u00f6nnen schlechter trocknen. Behandlung ggf. verschieben.'
      });
    }

    // Gewitter
    if (weathercode >= 95) {
      tipps.push({
        type: 'warning',
        icon: '\u26C8\uFE0F',
        text: 'Gewitter erwartet \u2013 Feldarbeit einstellen! Hagelgefahr beachten.'
      });
    }

    // Gute Bedingungen
    if (tipps.length === 0 && precip < 2 && windMs < 3 && tMin > 5 && tMax < 30) {
      tipps.push({
        type: 'success',
        icon: '\u2705',
        text: 'Gute Bedingungen f\u00fcr Feldarbeit \u2013 ideal f\u00fcr D\u00fcngung, Pflanzenschutz oder Bodenbearbeitung.'
      });
    }

    // Mehrt\u00e4gige Regenprognose
    const regenTage = daily.precipitation_sum.filter(p => p > 2).length;
    if (regenTage >= 5) {
      tipps.push({
        type: 'info',
        icon: '\uD83D\uDCC5',
        text: `${regenTage} von 10 Tagen mit Niederschlag \u00fcber 2 mm \u2013 ggf. Befahrbarkeit der Fl\u00e4chen eingeschr\u00e4nkt.`
      });
    }

    if (!tipps.length) return '';

    const tippHtml = tipps.map(t => {
      const borderColor = t.type === 'warning' ? 'var(--warning, #f59e0b)' :
                           t.type === 'success' ? 'var(--success, #22c55e)' :
                           'var(--info, #3b82f6)';
      return `
        <div class="info-box" style="border-left:4px solid ${borderColor};margin-bottom:0.5rem">
          <span style="font-size:1.3rem;margin-right:0.5rem">${t.icon}</span>
          <span>${esc(t.text)}</span>
        </div>`;
    }).join('');

    return `
      <h3 style="margin-bottom:0.75rem">${Icons.render('kulturen', 18)} Agrar-Hinweise</h3>
      ${tippHtml}`;
  },

  formatWeekday(dateStr) {
    const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    const d = new Date(dateStr + 'T00:00:00');
    return days[d.getDay()];
  }
};

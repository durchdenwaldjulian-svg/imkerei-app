// ============================================
// VOELKER-STANDORTE.JS
// Standorte Tab: CRUD, Maps, GTS, Schwarmprognose
// ============================================

// ============================================
// GTS MODULE
// ============================================
var GTS_SCHWELLEN = {
    'Schneeglöckchen':50,'Haselnuss':80,'Erle':90,'Huflattich':100,'Krokus':100,
    'Weide':130,'Kornelkirsche':130,'Schlehe':150,'Pflaume':190,
    'Kirsche':200,'Löwenzahn':200,'Obstblüte':200,'Birne':210,'Apfel':220,
    'Raps':250,'Flieder':280,'Rosskastanie':280,'Weißdorn':300,
    'Himbeere':320,'Akazie (Robinie)':350,'Klee (Weiß)':350,
    'Brombeere':400,'Klee (Rot)':400,'Fichte (Honigtau)':400,'Kornblume':400,
    'Eiche (Honigtau)':420,'Phacelia':450,'Edelkastanie':450,
    'Linde (Sommer)':500,'Lavendel':500,'Goldrute':500,
    'Springkraut (Indisches)':550,'Linde (Winter)':550,'Sonnenblume':550,
    'Heide':700,'Herbstastern':700,'Efeu':900
};

var gtsCache = {};

function berechneGTS(temperaturen) {
    // temperaturen = Array von {date:'YYYY-MM-DD', temp: number}
    var summe = 0;
    temperaturen.forEach(function(t) {
        if (t.temp <= 0) return;
        var monat = parseInt(t.date.split('-')[1]);
        var faktor = monat === 1 ? 0.5 : (monat === 2 ? 0.75 : 1.0);
        summe += t.temp * faktor;
    });
    return Math.round(summe * 10) / 10;
}

async function ladeGTS(lat, lng) {
    var key = lat.toFixed(2) + '_' + lng.toFixed(2);
    var heute = new Date().toISOString().split('T')[0];
    var cacheKey = 'gts_' + key + '_' + heute;

    // localStorage Cache prüfen (1x pro Tag)
    try {
        var cached = localStorage.getItem(cacheKey);
        if (cached) return JSON.parse(cached);
    } catch(e) {}

    var jahr = new Date().getFullYear();
    var startDate = jahr + '-01-01';
    // Gestern als Enddatum (heutige Daten evtl. noch nicht komplett)
    var gestern = new Date(Date.now() - 86400000);
    var endDate = gestern.toISOString().split('T')[0];

    try {
        var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lng +
            '&daily=temperature_2m_mean&start_date=' + startDate + '&end_date=' + endDate + '&timezone=Europe/Berlin';
        var resp = await fetch(url);
        if (!resp.ok) throw new Error('API Fehler');
        var data = await resp.json();
        if (!data.daily || !data.daily.time) throw new Error('Keine Daten');

        var temperaturen = data.daily.time.map(function(d, i) {
            return { date: d, temp: data.daily.temperature_2m_mean[i] };
        });

        var gts = berechneGTS(temperaturen);
        var result = { gts: gts, datum: heute, lat: lat, lng: lng };

        try { localStorage.setItem(cacheKey, JSON.stringify(result)); } catch(e) {}
        gtsCache[key] = result;
        return result;
    } catch(e) {
        console.warn('GTS Laden fehlgeschlagen:', e);
        return null;
    }
}

function getGtsColor(gts) {
    if (gts < 100) return '#EF4444';
    if (gts < 200) return '#F59E0B';
    return '#10B981';
}

function getGtsStatus(gts) {
    if (gts < 100) return { text: 'Winter / Vorfrühling', emoji: '❄️' };
    if (gts < 200) return { text: 'Frühling beginnt', emoji: '🌱' };
    if (gts < 350) return { text: 'Vegetation aktiv', emoji: '🌿' };
    if (gts < 500) return { text: 'Vollfrühling/Sommer', emoji: '☀️' };
    return { text: 'Hochsommer', emoji: '🌻' };
}

function getNextTracht(gts) {
    var sorted = Object.entries(GTS_SCHWELLEN).sort(function(a,b){ return a[1]-b[1]; });
    for (var i = 0; i < sorted.length; i++) {
        if (sorted[i][1] > gts) {
            return { name: sorted[i][0], gts: sorted[i][1], diff: Math.round(sorted[i][1] - gts) };
        }
    }
    return null;
}

function renderGtsZeile(gts) {
    var color = getGtsColor(gts);
    var status = getGtsStatus(gts);
    var next = getNextTracht(gts);
    var pct = Math.min(100, (gts / 600) * 100);

    var html = '<div class="standort-gts-row">' +
        '<div>' +
        '<div class="standort-gts-value" style="color:' + color + '">🌡️ ' + Math.round(gts) + '°C</div>' +
        '<div class="standort-gts-status">' + status.emoji + ' ' + status.text + '</div>' +
        '</div>' +
        '<div style="flex:1">' +
        '<div class="standort-gts-bar-bg"><div class="standort-gts-bar-fill" style="width:' + pct + '%;background:' + color + '"></div></div>';

    if (next) {
        html += '<div class="standort-gts-next">Nächste Tracht: ' + next.name + ' (ab ~' + next.gts + '°C – noch ' + next.diff + '°C)</div>';
    } else {
        html += '<div class="standort-gts-next" style="color:#059669">✅ Alle Haupttrachten erreichbar</div>';
    }
    html += '</div></div>';
    return html;
}

async function ladeAlleGTS() {
    var promises = standorte.filter(function(s){ return s.lat && s.lng; }).map(function(s) {
        return ladeGTS(s.lat, s.lng).then(function(result) {
            if (result) {
                var el = document.getElementById('gts_' + s.id);
                if (el) el.innerHTML = renderGtsZeile(result.gts);
            }
        });
    });
    await Promise.all(promises);
}

// ============================================
// MODAL HELPERS (Leaflet z-index safe)
// ============================================
function openModal(id) {
    // Leaflet-Container erzeugen hohe z-index Werte - diese beim Modal unterdrücken
    document.querySelectorAll('.leaflet-container').forEach(function(el){ el.style.zIndex = '0'; });
    document.getElementById(id).classList.add('active');
}
function closeModal(id) {
    document.getElementById(id).classList.remove('active');
    // Leaflet z-index wiederherstellen
    document.querySelectorAll('.leaflet-container').forEach(function(el){ el.style.zIndex = ''; });
    if (id === 'standortModal') { editStandortId = null; }
    if (id === 'volkModal') { editVolkId = null; }
}

// ============================================
// MAP PICKER
// ============================================
function initMapPicker() {
    var container = document.getElementById('standortMapPicker');
    if (!container) return;
    if (container._mapInstance) { container._mapInstance.remove(); container._mapInstance = null; }
    container.innerHTML = '';
    var startLat = parseFloat(document.getElementById('standortLat').value) || 49.0;
    var startLng = parseFloat(document.getElementById('standortLng').value) || 10.0;
    var startZoom = document.getElementById('standortLat').value ? 14 : 6;
    var map = L.map(container, {zoomControl:true}).setView([startLat, startLng], startZoom);
    container._mapInstance = map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>', maxZoom:19}).addTo(map);
    var marker = null;
    if (document.getElementById('standortLat').value) {
        marker = L.marker([startLat, startLng]).addTo(map);
        document.getElementById('standortKoordStatus').innerHTML = '<span style="color:#10b981">✅ Position: '+startLat.toFixed(4)+', '+startLng.toFixed(4)+'</span>';
    }
    map.on('click', function(e){
        document.getElementById('standortLat').value = e.latlng.lat;
        document.getElementById('standortLng').value = e.latlng.lng;
        document.getElementById('standortKoordStatus').innerHTML = '<span style="color:#10b981">✅ Position: '+e.latlng.lat.toFixed(4)+', '+e.latlng.lng.toFixed(4)+'</span>';
        if (marker) map.removeLayer(marker);
        marker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
    });
    setTimeout(function(){ map.invalidateSize(); }, 100);
    setTimeout(function(){ map.invalidateSize(); }, 500);
}

// ============================================
// MINI-MAPS
// ============================================
function initMiniMaps() {
    setTimeout(function(){
        standorte.forEach(function(s){
            if (s.lat && s.lng) {
                var el = document.getElementById('minimap_'+s.id);
                if (!el || el._mapDone) return;
                el._mapDone = true;
                try {
                    var map = L.map(el, {
                        zoomControl:false, dragging:false, scrollWheelZoom:false,
                        doubleClickZoom:false, touchZoom:false
                    }).setView([s.lat, s.lng], 14);
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>', maxZoom:17}).addTo(map);
                    L.marker([s.lat, s.lng]).addTo(map);
                    setTimeout(function(){ map.invalidateSize(); }, 300);
                } catch(e) { console.warn('Minimap Error:', e); }
            }
        });
    }, 150);
}

// ============================================
// STANDORT CRUD
// ============================================
function changeVoelkerCount(delta) {
    voelkerCount = Math.max(0, voelkerCount + delta);
    document.getElementById('standortVoelkerCount').textContent = voelkerCount;
}
function changeAblegerCount(delta) {
    ablegerCount = Math.max(0, ablegerCount + delta);
    document.getElementById('standortAblegerCount').textContent = ablegerCount;
}

function openStandortModal(id) {
    if (id) {
        var s = standorte.find(function(x){return x.id === id;});
        if (s) {
            editStandortId = id;
            document.getElementById('standortModalTitle').textContent = '📍 Standort bearbeiten';
            document.getElementById('standortName').value = s.name;
            var vAnzahl = voelker.filter(function(v){return v.standortId === id;}).length;
            voelkerCount = vAnzahl;
            document.getElementById('standortVoelkerCount').textContent = vAnzahl;
            var aAnzahl = voelker.filter(function(v){return v.standortId === id && v.typ === 'ableger';}).length;
            ablegerCount = aAnzahl;
            document.getElementById('standortAblegerCount').textContent = aAnzahl;
            document.getElementById('standortNotizen').value = s.notizen || '';
            document.getElementById('standortLat').value = s.lat || '';
            document.getElementById('standortLng').value = s.lng || '';
        }
    } else {
        editStandortId = null;
        voelkerCount = 2;
        ablegerCount = 0;
        document.getElementById('standortModalTitle').textContent = '📍 Neuer Standort';
        document.getElementById('standortName').value = '';
        document.getElementById('standortVoelkerCount').textContent = '2';
        document.getElementById('standortAblegerCount').textContent = '0';
        document.getElementById('standortNotizen').value = '';
        document.getElementById('standortLat').value = '';
        document.getElementById('standortLng').value = '';
        document.getElementById('standortKoordStatus').innerHTML = '';
    }
    openModal('standortModal');
    setTimeout(function(){ initMapPicker(); }, 300);
}

function saveStandort() {
    var name = document.getElementById('standortName').value.trim();
    var notizen = document.getElementById('standortNotizen').value.trim();
    var lat = parseFloat(document.getElementById('standortLat').value) || null;
    var lng = parseFloat(document.getElementById('standortLng').value) || null;

    if (!name) { alert('Bitte Namen eingeben!'); return; }

    // Plan-Limits prüfen bei neuem Standort
    if (!editStandortId) {
        if (!planManager.checkLimit('standorte', standorte.length)) {
            planManager.showLimitReached('standorte');
            return;
        }
        if (!planManager.checkLimit('voelker', voelker.length + voelkerCount + ablegerCount)) {
            planManager.showLimitReached('voelker');
            return;
        }
    }

    if (editStandortId) {
        var s = standorte.find(function(x){return x.id === editStandortId;});
        if (s) {
            s.name = name; s.notizen = notizen; s.lat = lat; s.lng = lng;

            var aktuelleVoelker = voelker.filter(function(v){return v.standortId === editStandortId;});
            var diff = voelkerCount - aktuelleVoelker.length;

            if (diff > 0) {
                for (var i = 0; i < diff; i++) {
                    var nv = { id: 'v' + uid(), standortId: editStandortId, name: 'Volk ' + (aktuelleVoelker.length + i + 1), beutensystem: 'Dadant', status: 'ok', typ: 'volk', notizen: '', honigertrag: 0, created: Date.now() };
                    voelker.push(nv);
                    db.upsert('voelker', {id:nv.id, user_id:currentUser.id, standort_id:nv.standortId, name:nv.name, beutensystem:nv.beutensystem, status:nv.status, typ:nv.typ, notizen:'', honigertrag:0, created_at:nv.created});
                }
            } else if (diff < 0) {
                var zuLoeschen = aktuelleVoelker.slice(diff);
                zuLoeschen.forEach(function(v){
                    voelker = voelker.filter(function(x){return x.id !== v.id;});
                    db.del('voelker', v.id);
                });
            }

            db.update('standorte', {name:s.name, notizen:s.notizen, lat:s.lat, lng:s.lng}, s.id);
        }
    } else {
        var standortId = 's' + uid();
        standorte.push({ id: standortId, name: name, notizen: notizen, mapsLink: '', lat: lat, lng: lng, created: Date.now() });
        db.upsert('standorte', {id:standortId, user_id:currentUser.id, name:name, notizen:notizen, maps_link:'', lat:lat, lng:lng, created_at:Date.now()});

        for (var i = 1; i <= voelkerCount; i++) {
            var nv = { id: 'v' + uid(), standortId: standortId, name: 'Volk ' + i, beutensystem: 'Dadant', status: 'ok', typ: 'volk', notizen: '', honigertrag: 0, created: Date.now() };
            voelker.push(nv);
            db.upsert('voelker', {id:nv.id, user_id:currentUser.id, standort_id:nv.standortId, name:nv.name, beutensystem:nv.beutensystem, status:nv.status, typ:nv.typ, notizen:'', honigertrag:0, created_at:nv.created});
        }
        for (var j = 1; j <= ablegerCount; j++) {
            var na = { id: 'v' + uid(), standortId: standortId, name: 'Ableger ' + j, beutensystem: 'Dadant', status: 'ok', typ: 'ableger', notizen: '', honigertrag: 0, created: Date.now() };
            voelker.push(na);
            db.upsert('voelker', {id:na.id, user_id:currentUser.id, standort_id:na.standortId, name:na.name, beutensystem:na.beutensystem, status:na.status, typ:na.typ, notizen:'', honigertrag:0, created_at:na.created});
        }
    }

    closeModal('standortModal');
    render();
    toast(editStandortId ? '✓ Standort aktualisiert!' : '✓ Standort erstellt!', 'success');
}

function delStandort(id) {
    if (!confirm('Standort und alle Völker wirklich löschen?')) return;
    standorte = standorte.filter(function(s){return s.id !== id;});
    voelker = voelker.filter(function(v){return v.standortId !== id;});
    db.del('standorte', id);
    db.delWhere('voelker', 'standort_id', id);
    if (selectedStandortId === id) selectedStandortId = null;
    render();
    toast('🗑️ Standort gelöscht', 'info');
}

// ============================================
// VOLK CRUD
// ============================================
function openVolkModal(id) {
    var v = voelker.find(function(x){return x.id === id;});
    if (!v) return;
    editVolkId = id;
    selectedVolkStatus = v.status || 'ok';
    selectedVolkTyp = v.typ || 'volk';
    var typEmoji = selectedVolkTyp === 'ableger' ? '🌱' : '🐝';
    document.getElementById('volkModalTitle').textContent = typEmoji + ' ' + v.name;
    document.getElementById('volkName').value = v.name;
    document.getElementById('volkBeute').value = v.beutensystem || 'Dadant';
    document.getElementById('volkNotizen').value = v.notizen || '';

    // Typ-Buttons setzen
    document.querySelectorAll('#volkTypGrid .option-btn').forEach(function(btn){ btn.classList.remove('selected'); });
    var typBtns = document.querySelectorAll('#volkTypGrid .option-btn');
    if (selectedVolkTyp === 'ableger') { typBtns[1].classList.add('selected'); } else { typBtns[0].classList.add('selected'); }
    document.getElementById('volkHochstufenWrap').style.display = selectedVolkTyp === 'ableger' ? 'block' : 'none';

    document.getElementById('volkHonigInfo').textContent = 'Lade...';
    sb.from('ernten').select('menge').eq('user_id', currentUser.id).eq('volk_id', id).then(function(res){
        var total = (res.data||[]).reduce(function(s,r){return s+parseFloat(r.menge||0);},0);
        document.getElementById('volkHonigInfo').innerHTML = '<strong style="color:#F5A623;font-size:1.1rem">'+total.toFixed(1)+' kg</strong> <span style="font-size:.8rem">('+((res.data||[]).length)+' Ernten)</span>';
    });

    document.querySelectorAll('#volkStatusGrid .option-btn').forEach(function(btn){ btn.classList.remove('selected'); });
    openModal('volkModal');
    setTimeout(function(){
        var statusMap = {'ok':0,'schwach':1,'weisellos':2,'problem':3};
        var btns = document.querySelectorAll('#volkStatusGrid .option-btn');
        var idx = statusMap[v.status] || 0;
        if (btns[idx]) btns[idx].classList.add('selected');
    }, 50);
}

function setVolkStatus(status, btn) {
    selectedVolkStatus = status;
    document.querySelectorAll('#volkStatusGrid .option-btn').forEach(function(b){ b.classList.remove('selected'); });
    if (btn) btn.classList.add('selected');
}

function setVolkTyp(typ, btn) {
    selectedVolkTyp = typ;
    document.querySelectorAll('#volkTypGrid .option-btn').forEach(function(b){ b.classList.remove('selected'); });
    if (btn) btn.classList.add('selected');
    document.getElementById('volkHochstufenWrap').style.display = typ === 'ableger' ? 'block' : 'none';
}

function hochstufenZuVolk() {
    selectedVolkTyp = 'volk';
    document.querySelectorAll('#volkTypGrid .option-btn').forEach(function(b){ b.classList.remove('selected'); });
    var typBtns = document.querySelectorAll('#volkTypGrid .option-btn');
    typBtns[0].classList.add('selected');
    document.getElementById('volkHochstufenWrap').style.display = 'none';
    toast('⬆️ Typ auf Volk gesetzt – bitte speichern!', 'info');
}

function saveVolk() {
    if (!editVolkId) return;
    var v = voelker.find(function(x){return x.id === editVolkId;});
    if (!v) return;
    v.name = document.getElementById('volkName').value.trim();
    v.beutensystem = document.getElementById('volkBeute').value;
    v.status = selectedVolkStatus;
    v.typ = selectedVolkTyp;
    v.notizen = document.getElementById('volkNotizen').value.trim();
    db.update('voelker', {name:v.name, beutensystem:v.beutensystem, status:v.status, typ:v.typ, notizen:v.notizen}, v.id);
    closeModal('volkModal');
    render();
    toast('✓ Volk aktualisiert!', 'success');
}

function deleteVolk() {
    if (!editVolkId) return;
    if (!confirm('Volk wirklich löschen?')) return;
    voelker = voelker.filter(function(v){return v.id !== editVolkId;});
    db.del('voelker', editVolkId);
    closeModal('volkModal');
    render();
    toast('🗑️ Volk gelöscht', 'info');
}

function quickAddVolk(standortId, typ) {
    typ = typ || 'volk';
    var sVoelker = voelker.filter(function(v){return v.standortId === standortId;});
    var label = typ === 'ableger' ? 'Ableger' : 'Volk';
    var sameTyp = sVoelker.filter(function(v){return (v.typ||'volk') === typ;});
    var nv = { id: 'v' + uid(), standortId: standortId, name: label + ' ' + (sameTyp.length + 1), beutensystem: 'Dadant', status: 'ok', typ: typ, notizen: '', honigertrag: 0, created: Date.now() };
    voelker.push(nv);
    db.upsert('voelker', {id:nv.id, user_id:currentUser.id, standort_id:nv.standortId, name:nv.name, beutensystem:nv.beutensystem, status:nv.status, typ:nv.typ, notizen:'', honigertrag:0, created_at:nv.created});
    render();
    toast('✓ ' + label + ' hinzugefügt', 'success');
}

function quickRemoveVolk(standortId) {
    var sVoelker = voelker.filter(function(v){return v.standortId === standortId;});
    if (!sVoelker.length) return;
    var last = sVoelker[sVoelker.length - 1];
    if (!confirm('Volk "'+last.name+'" löschen?')) return;
    voelker = voelker.filter(function(v){return v.id !== last.id;});
    db.del('voelker', last.id);
    render();
    toast('🗑️ Volk entfernt', 'info');
}

// ============================================
// SCHWARMTRIEB-PROGNOSE
// ============================================
function renderSchwarmPrognose(standort, sVoelker) {
    var monat = new Date().getMonth() + 1;
    var tag = new Date().getDate();
    // Basis-Risiko nach Monat (Mitteleuropa)
    var monatsRisiko = {1:0,2:0,3:5,4:25,5:70,6:60,7:30,8:10,9:5,10:0,11:0,12:0};
    var basis = monatsRisiko[monat] || 0;
    if (monat === 4 && tag > 15) basis += 15;
    if (monat === 5 && tag < 15) basis += 10;
    if (monat === 5 && tag >= 15) basis -= 5;
    // Starke Völker = höheres Risiko
    var starke = sVoelker.filter(function(v){return v.status==='ok'&&(v.typ||'volk')==='volk';}).length;
    var total = sVoelker.filter(function(v){return (v.typ||'volk')==='volk';}).length || 1;
    var risiko = Math.round(basis * (0.6 + (starke/total) * 0.6));
    risiko = Math.max(0, Math.min(100, risiko));
    // Texte
    var info, intervall;
    if (monat < 4) { info = 'Schwarmzeit beginnt voraussichtlich im April. Jetzt Vorbeuge planen.'; }
    else if (monat >= 4 && monat <= 6) { info = 'Mitten in der Schwarmzeit! Regelmäßige Kontrolle empfohlen.'; }
    else if (monat === 7) { info = 'Schwarmzeit klingt ab. Einzelne Nachschwärme möglich.'; }
    else { info = 'Schwarmzeit ist vorbei. Nächste Saison ab April.'; }
    if (risiko >= 60) intervall = 'Alle 7 Tage kontrollieren!';
    else if (risiko >= 30) intervall = 'Alle 9 Tage kontrollieren';
    else if (risiko >= 10) intervall = 'Alle 14 Tage kontrollieren';
    else intervall = 'Keine Schwarmkontrolle nötig';
    // Farben
    var farbe, bg, border, emoji, stufe;
    if (risiko >= 60) { farbe='#DC2626';bg='#FEF2F2';border='#FECACA';emoji='🔴';stufe='Hoch'; }
    else if (risiko >= 30) { farbe='#D97706';bg='#FFFBEB';border='#FDE68A';emoji='🟡';stufe='Mittel'; }
    else if (risiko >= 10) { farbe='#2563EB';bg='#EFF6FF';border='#BFDBFE';emoji='🔵';stufe='Niedrig'; }
    else { farbe='#10b981';bg='#F0FDF4';border='#BBF7D0';emoji='🟢';stufe='Minimal'; }

    var h = '<div style="background:'+bg+';border:2px solid '+border+';border-radius:.75rem;padding:1rem 1.25rem;margin:1rem 0">';
    h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.75rem">';
    h += '<div style="font-weight:700;font-size:.95rem">🌪️ Schwarmtrieb-Prognose</div>';
    h += '<div style="display:flex;align-items:center;gap:.375rem">'+emoji+'<span style="font-weight:700;color:'+farbe+'">'+stufe+' ('+risiko+'%)</span></div></div>';
    h += '<div style="background:rgba(0,0,0,.08);height:8px;border-radius:4px;margin-bottom:.75rem;overflow:hidden">';
    h += '<div style="height:100%;width:'+Math.max(5,risiko)+'%;background:'+farbe+';border-radius:4px;transition:width .5s"></div></div>';
    h += '<div style="font-size:.82rem;color:#7A6652;margin-bottom:.5rem">'+info+'</div>';
    h += '<div style="display:flex;gap:.75rem;flex-wrap:wrap">';
    h += '<div style="background:#fff;padding:.4rem .75rem;border-radius:.5rem;font-size:.78rem;font-weight:600">⏱️ '+intervall+'</div>';
    h += '<div style="background:#fff;padding:.4rem .75rem;border-radius:.5rem;font-size:.78rem">💪 '+starke+'/'+total+' Völker stark</div>';
    h += '</div></div>';
    return h;
}

// ============================================
// RENDER FUNCTIONS
// ============================================
function renderStandorteTab() {
    if (selectedStandortId) {
        return renderStandortDetails();
    } else {
        return renderStandortList();
    }
}

function renderStandortList() {
    var html = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">'+
    '<h1 style="margin:0">📍 Standorte</h1>'+
    '<button onclick="openStandortModal()" style="padding:.4rem .8rem;background:#F5A623;color:#fff;border:none;border-radius:.5rem;font-weight:600;cursor:pointer;font-size:.8rem">+ Neuer Standort</button>'+
    '</div>';

    if (standorte.length) {
        standorte.forEach(function(s){
            var sVoelker = voelker.filter(function(v){return v.standortId === s.id;});
            html += '<div style="background:#fff;border:2px solid #E8DFD4;border-radius:.75rem;padding:1.25rem;margin-bottom:1rem;cursor:pointer;transition:all .2s" onclick="showDetails(\''+s.id+'\')">'+
            '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:.75rem">'+
            '<div style="flex:1"><h3 style="margin:0;font-family:DM Serif Display,serif">'+s.name+'</h3>'+
            (s.notizen ? '<div style="font-size:.85rem;color:#7A6652;margin-top:.25rem">'+s.notizen+'</div>' : '')+'</div>'+
            '<div style="display:flex;gap:.5rem">'+
            '<button onclick="event.stopPropagation();openStandortModal(\''+s.id+'\')" style="padding:.25rem .5rem;background:#FFF8EE;border:1.5px solid #E8DFD4;border-radius:.35rem;cursor:pointer;font-size:.75rem">✏️</button>'+
            '<button onclick="event.stopPropagation();delStandort(\''+s.id+'\')" style="padding:.25rem .5rem;background:#FEE2E2;border:1.5px solid #FECACA;border-radius:.35rem;cursor:pointer;font-size:.75rem">🗑️</button>'+
            '</div></div>'+
            (s.lat && s.lng ? '<div id="minimap_'+s.id+'" style="height:150px;border-radius:.75rem;border:2px solid #E8DFD4;margin-bottom:.5rem;overflow:hidden" onclick="event.stopPropagation()"></div>' : '')+
            // GTS Zeile (wird async nachgeladen)
            (s.lat && s.lng ? '<div id="gts_'+s.id+'"><div class="standort-gts-row" style="opacity:.5"><div class="standort-gts-value" style="color:#A69580">🌡️ ...</div><div style="flex:1"><div class="standort-gts-bar-bg"><div class="standort-gts-bar-fill" style="width:0%"></div></div><div class="standort-gts-next">GTS wird geladen...</div></div></div></div>'
            : '<div style="margin-top:.5rem;padding:.5rem .75rem;background:#FFF8EE;border-radius:.35rem;font-size:.75rem;color:#A69580">🌡️ GTS: Position setzen für Berechnung</div>')+
            renderSchwarmPrognose(s, sVoelker)+
            '<div style="background:#FFF8EE;padding:.75rem;border-radius:.5rem;margin-top:.5rem">'+
            '<div style="font-weight:600;margin-bottom:.25rem">' + (function(){
                var nVoelker = sVoelker.filter(function(v){return (v.typ||'volk')==='volk';}).length;
                var nAbleger = sVoelker.filter(function(v){return v.typ==='ableger';}).length;
                var parts = [];
                if (nVoelker) parts.push('🐝 ' + nVoelker + ' Völker');
                if (nAbleger) parts.push('🌱 ' + nAbleger + ' Ableger');
                return parts.length ? parts.join(', ') : '🐝 0 Völker';
            })() + '</div>'+
            '<div style="font-size:.8rem;color:#7A6652">Klicken für Details</div>'+
            '</div></div>';
        });
    } else {
        html += '<div style="background:#fff;border:2px solid #E8DFD4;border-radius:.75rem;text-align:center;padding:3rem;color:#7A6652">'+
        '<div style="font-size:3rem;margin-bottom:1rem">📍</div>'+
        '<h3>Noch keine Standorte</h3>'+
        '<p style="margin:.5rem 0 1.5rem">Erstelle deinen ersten Standort und füge Völker hinzu!</p>'+
        '<button onclick="openStandortModal()" style="padding:.6rem 1.5rem;background:#F5A623;color:#fff;border:none;border-radius:.5rem;font-weight:600;cursor:pointer">Ersten Standort erstellen</button></div>';
    }

    return html;
}

function renderStandortDetails() {
    var s = standorte.find(function(x){return x.id === selectedStandortId;});
    if (!s) { selectedStandortId = null; renderStandortList(); return; }
    var sVoelker = voelker.filter(function(v){return v.standortId === s.id;});

    var statusColors = {'ok':'#10b981','schwach':'#f59e0b','weisellos':'#8b5cf6','problem':'#ef4444'};
    var statusLabels = {'ok':'✅ Gut','schwach':'⚠️ Schwach','weisellos':'👑 Weisellos','problem':'❌ Problem'};

    var html = '<div style="display:flex;align-items:center;gap:1rem;margin-bottom:1rem">'+
    '<button onclick="selectedStandortId=null;render()" style="padding:.4rem .8rem;background:#FFF8EE;border:1.5px solid #E8DFD4;border-radius:.5rem;cursor:pointer;font-size:.85rem;font-weight:600">← Zurück</button>'+
    '<h1 style="margin:0">'+s.name+'</h1></div>'+

    '<div style="background:#fff;border:2px solid #E8DFD4;border-radius:.75rem;padding:1.25rem;margin-bottom:1rem">'+
    '<div style="display:flex;justify-content:space-between;align-items:start">'+
    '<div>'+(s.notizen ? '<p style="color:#7A6652;margin-bottom:.5rem">'+s.notizen+'</p>' : '')+'</div>'+
    '<button onclick="openStandortModal(\''+s.id+'\')" style="padding:.25rem .5rem;background:#FFF8EE;border:1.5px solid #E8DFD4;border-radius:.35rem;cursor:pointer;font-size:.75rem">✏️ Bearbeiten</button>'+
    '</div></div>'+

    renderSchwarmPrognose(s, sVoelker)+

    '<div style="display:flex;justify-content:space-between;align-items:center;margin:1.5rem 0 1rem">'+
    '<h2 style="margin:0">' + (function(){
        var nV = sVoelker.filter(function(v){return (v.typ||'volk')==='volk';}).length;
        var nA = sVoelker.filter(function(v){return v.typ==='ableger';}).length;
        var parts = [];
        if (nV) parts.push('🐝 ' + nV + ' Völker');
        if (nA) parts.push('🌱 ' + nA + ' Ableger');
        return parts.length ? parts.join(', ') : '🐝 Völker (0)';
    })() + '</h2>'+
    '<div style="display:flex;gap:.5rem">'+
    '<button onclick="quickRemoveVolk(\''+s.id+'\')" style="padding:.3rem .6rem;background:#FEE2E2;border:1.5px solid #FECACA;border-radius:.35rem;cursor:pointer;font-size:.75rem;font-weight:600">− Volk</button>'+
    '<button onclick="quickAddVolk(\''+s.id+'\',\'volk\')" style="padding:.3rem .6rem;background:#E8F5EC;border:1.5px solid #A7F3D0;border-radius:.35rem;cursor:pointer;font-size:.75rem;font-weight:600">🐝 + Volk</button>'+
    '<button onclick="quickAddVolk(\''+s.id+'\',\'ableger\')" style="padding:.3rem .6rem;background:#E8F5EC;border:1.5px solid #A7F3D0;border-radius:.35rem;cursor:pointer;font-size:.75rem;font-weight:600">🌱 + Ableger</button>'+
    '</div></div>'+

    '<div class="volk-grid">';

    sVoelker.forEach(function(v){
        var sc = statusColors[v.status] || statusColors.ok;
        var sl = statusLabels[v.status] || statusLabels.ok;
        var istAbleger = v.typ === 'ableger';
        var typBadge = istAbleger ? '<span style="font-size:.7rem;background:#E8F5EC;color:#059669;padding:.1rem .4rem;border-radius:999px;margin-left:.35rem">🌱 Ableger</span>' : '';
        html += '<div class="volk-card'+(istAbleger ? ' ableger' : '')+'" onclick="goToVolk(\''+v.id+'\')">'+
        '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:.5rem">'+
        '<h3 style="margin:0;font-size:.95rem">'+(istAbleger ? '🌱 ' : '🐝 ')+v.name+typBadge+'</h3>'+
        '<div style="display:flex;align-items:center;gap:.4rem">'+
        '<button onclick="event.stopPropagation();openVolkModal(\''+v.id+'\')" style="padding:.15rem .4rem;background:#FFF8EE;border:1.5px solid #E8DFD4;border-radius:.35rem;cursor:pointer;font-size:.7rem" title="Volk bearbeiten">✏️</button>'+
        '<div style="width:12px;height:12px;border-radius:50%;background:'+sc+'"></div>'+
        '</div></div>'+
        '<div style="font-size:.75rem;color:#7A6652;margin-bottom:.25rem">'+v.beutensystem+'</div>'+
        '<div style="font-size:.75rem;margin-bottom:.5rem">'+sl+'</div>'+
        '<div style="background:#FFF8EE;padding:.5rem;border-radius:.5rem;font-size:.75rem">🍯 '+(v.honigertrag||0).toFixed(1)+' kg</div></div>';
    });

    html += '</div>';
    if (!sVoelker.length) html += '<div style="background:#fff;border:2px solid #E8DFD4;border-radius:.75rem;text-align:center;padding:1.5rem;color:#7A6652">Noch keine Völker an diesem Standort</div>';

    return html;
}

function showDetails(id) {
    selectedStandortId = id;
    render();
}

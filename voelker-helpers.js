// ============================================
// VOELKER-HELPERS.JS – Gemeinsame Hilfsfunktionen
// ============================================

function uid() { return Date.now().toString(36) + Math.random().toString(36).substr(2, 5); }

function fmtDate(d) {
    return new Date(d).toLocaleDateString('de-DE',{day:'2-digit',month:'short',year:'numeric'});
}

function fmtDateShort(d) {
    return new Date(d).toLocaleDateString('de-DE',{day:'2-digit',month:'short'});
}

function fd(ts) {
    if (!ts) return '-';
    return new Date(ts).toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric'});
}

function toast(msg, typ) {
    var el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.className = 'toast' + (typ ? ' ' + typ : '') + ' show';
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(function(){ el.classList.remove('show'); }, 2500);
}

function openModal(id) {
    document.querySelectorAll('.leaflet-container').forEach(function(el){ el.style.zIndex = '0'; });
    document.getElementById(id).classList.add('active');
    document.body.classList.add('modal-open');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
    document.body.classList.remove('modal-open');
    document.querySelectorAll('.leaflet-container').forEach(function(el){ el.style.zIndex = ''; });
    if (id === 'standortModal') editStandortId = null;
    if (id === 'volkModal') editVolkId = null;
}

function sortVoelkerNumerisch(liste) {
    return liste.slice().sort(function(a, b) {
        var na = parseInt((a.name.match(/\d+/) || ['999999'])[0]);
        var nb = parseInt((b.name.match(/\d+/) || ['999999'])[0]);
        if (na !== nb) return na - nb;
        return a.name.localeCompare(b.name);
    });
}

function durchschnittKriterien(krit) {
    if (!krit) return 0;
    var sum = 0, count = 0;
    KRITERIEN.forEach(function(k) {
        if (krit[k.key] !== undefined) { sum += krit[k.key]; count++; }
    });
    return count > 0 ? sum / count : 0;
}

function durchschnittAlt(b) {
    var sum = 0;
    KRITERIEN_ALT.forEach(function(k){ sum += (b[k.key] || 3); });
    return sum / KRITERIEN_ALT.length;
}

function getDurchsichtenFuerVolk(volkId) {
    return durchsichten.filter(function(d){return d.volkId===volkId;}).sort(function(a,b){return new Date(b.datum)-new Date(a.datum);});
}

function renderMiniStars(schnitt) {
    var full = Math.round(schnitt);
    var html = '';
    for (var i = 1; i <= 5; i++) {
        html += '<span style="color:' + (i<=full?'#F5A623':'#E8DFD4') + ';font-size:.8rem">★</span>';
    }
    return html;
}

function getBadgeFromSchnitt(schnitt) {
    if (schnitt === null) return '<span class="badge badge-gray">–</span>';
    if (schnitt >= 4) return '<span class="badge badge-green">Sehr gut</span>';
    if (schnitt >= 3) return '<span class="badge badge-yellow">Gut</span>';
    return '<span class="badge badge-red">Schwach</span>';
}

function getColorDot(farbe) {
    var colors = {weiss:'#fff',gelb:'#facc15',rot:'#ef4444',gruen:'#22c55e',blau:'#3b82f6'};
    if (!farbe || !colors[farbe]) return '';
    var border = farbe==='weiss' ? '#ccc' : colors[farbe];
    return '<span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:' + colors[farbe] + ';border:2px solid ' + border + ';vertical-align:middle"></span>';
}

function formatHerkunft(h) {
    var map = {eigene_aktiv:'Eigene (aktiv)',eigene_aufgeloest:'Eigene (aufgelöst)',fremde:'Fremde Königin'};
    return map[h] || h || '–';
}

function getFarbeFromJahr(jahr) {
    if (!jahr) return '';
    var endziffer = jahr % 10;
    var map = {1:'weiss',6:'weiss',2:'gelb',7:'gelb',3:'rot',8:'rot',4:'gruen',9:'gruen',5:'blau',0:'blau'};
    return map[endziffer] || '';
}

function getFarbeLabel(jahr) {
    var farben = {weiss:'⬜ Weiß',gelb:'🟡 Gelb',rot:'🔴 Rot',gruen:'🟢 Grün',blau:'🔵 Blau'};
    return farben[getFarbeFromJahr(jahr)] || '';
}

function autoSetFarbe() {
    var j = formData.koenigin.jahrgang;
    if (!j) return;
    formData.koenigin.farbe = getFarbeFromJahr(j);
}

function renderZuchtwertkarte(kInfo) {
    var zw = kInfo.zuchtwerte;
    if (!zw) return '';
    var html = '<div class="zw-card">';
    html += '<h4>📊 BeeBreed Zuchtwerte</h4>';
    if (kInfo.zuchtbuchNr) html += '<div class="zw-nr">' + kInfo.zuchtbuchNr + '</div>';
    var felder = [
        {key:'gesamt', label:'Gesamt', icon:'⭐'},
        {key:'honig', label:'Honig', icon:'🍯'},
        {key:'sanftmut', label:'Sanftmut', icon:'🤲'},
        {key:'wabensitz', label:'Wabensitz', icon:'🪵'},
        {key:'schwarm', label:'Schwarm', icon:'🐝'},
        {key:'varroa', label:'Varroa', icon:'🔬'}
    ];
    felder.forEach(function(f) {
        var val = zw[f.key];
        if (!val && val !== 0) return;
        var pct = Math.max(0, Math.min(100, ((val - 70) / 60) * 100));
        var color = val >= 110 ? '#10b981' : (val >= 100 ? '#F5A623' : (val >= 90 ? '#f59e0b' : '#ef4444'));
        var isGesamt = f.key === 'gesamt';
        html += '<div class="zw-row" style="' + (isGesamt?'font-weight:700;margin-top:.25rem;padding-top:.35rem;border-top:1px solid #E8DFD4':'') + '">';
        html += '<span class="zw-label">' + f.icon + ' ' + f.label + '</span>';
        html += '<span class="zw-value" style="color:' + color + '">' + val + '</span>';
        html += '<div class="zw-bar-bg"><div class="zw-bar-ref"></div><div class="zw-bar-fill" style="width:' + pct + '%;background:' + color + '"></div></div>';
        html += '</div>';
    });
    html += '</div>';
    return html;
}

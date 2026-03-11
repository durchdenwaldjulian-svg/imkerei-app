// ============================================
// VÖLKER & STANDORTE – CORE MODULE
// Shared state, init, render, helpers
// ============================================

// === CONSTANTS ===
var KRITERIEN_ALT = [
    {key:'sanftmut', label:'🤲 Sanftmut', desc:'Stechverhalten, Aggressivität'},
    {key:'wabensitz', label:'🪵 Wabensitz', desc:'Bleiben die Bienen auf der Wabe?'},
    {key:'schwarmtrieb', label:'🐝 Schwarmtrieb', desc:'5 = kein Schwarmtrieb'},
    {key:'volksstaerke', label:'💪 Volksstärke', desc:'Bienenmasse, Brutnest'},
    {key:'winterfestigkeit', label:'❄️ Winterfestigkeit', desc:'Überwinterungserfolg, Futterverbrauch'},
    {key:'hygiene', label:'🧹 Hygieneverhalten', desc:'Kalkbrut, Varroatoleranz'},
    {key:'wabenbau', label:'🏗️ Wabenbau', desc:'Sauberer, gleichmäßiger Bau'},
    {key:'honigfleiss', label:'🍯 Honigfleiß', desc:'Sammeleifer, Ertrag'}
];

var KRITERIEN_NEU = [
    {key:'raumreserve', label:'📦 Raumreserve', desc:'Platz im Volk, Erweiterungsbedarf'},
    {key:'weiselrichtigkeit', label:'👑 Weiselrichtigkeit', desc:'Königin vorhanden, Stifte sichtbar'},
    {key:'futterversorgung', label:'🍬 Futterversorgung', desc:'Futtervorrat, Nachschub nötig?'},
    {key:'gesundheit', label:'🏥 Gesundheit', desc:'Allgemeinzustand, Krankheitsanzeichen'},
    {key:'varroa_beurteilung', label:'🔬 Varroa-Beurteilung', desc:'Geschätzte Varroabelastung'}
];

var KRITERIEN = KRITERIEN_ALT.concat(KRITERIEN_NEU);

var TAETIGKEITEN = [
    {key:'honigernte', label:'Honigernte', icon:'🍯', subs:[]},
    {key:'varroa_bio', label:'Varroa Biotechnik', icon:'🐝', subs:['Drohnenbrut schneiden','Bannwabe','Brutentnahme','Fangwabe']},
    {key:'raummanagement', label:'Raum-Management', icon:'📦', subs:['Honigraum erweitert','Zarge aufgesetzt','Zarge entnommen','Absperrgitter','Flugling erstellt']},
    {key:'varroa_medikamente', label:'Varroa Medikamente', icon:'💊', subs:['Oxalsäure','Ameisensäure','Thymol','Bayvarol','Apistan'], menge:true, mengeUnit:'ml'},
    {key:'futtergabe', label:'Futtergabe', icon:'🍬', subs:['Zuckersirup','Futterteig','Honig'], menge:true, mengeUnit:'kg'},
    {key:'umweiselung', label:'Umweiselung', icon:'👑', subs:[]},
    {key:'varroa_diagnose', label:'Varroa-Diagnose', icon:'🔍', subs:[]},
    {key:'sonstiges', label:'Sonstiges', icon:'📝', subs:[]}
];

// === STATE ===
var standorte = [];
var voelker = [];
var bewertungen = [];
var durchsichten = [];
var koeniginnen = {};
var activeTab = 'standorte';
var openVolkDetail = null;
var modalStep = 0;
var editDurchsicht = null;
var formData = {};
var selectedVerlaufVolk = '';
var collapsedStandorte = [];
var suchBegriff = '';
var selectedStandortFilter = '';
var selectedStammbaumVolk = '';

// Standorte-specific state
var selectedStandortId = null;
var editStandortId = null;
var editVolkId = null;
var selectedVolkStatus = 'ok';
var selectedVolkTyp = 'volk';
var voelkerCount = 2;
var ablegerCount = 0;

// === INIT ===
async function init() {
    var { data: { session } } = await sb.auth.getSession();
    if (!session) { window.location.href = 'app.html'; return; }
    currentUser = session.user;
    await planManager.load();
    if (!planManager.can('bewertung')) {
        planManager.showUpgradeHint('bewertung');
        return;
    }

    var results = await Promise.all([
        sb.from('standorte').select('*').eq('user_id', currentUser.id),
        sb.from('voelker').select('*').eq('user_id', currentUser.id),
        sb.from('bewertungen').select('*').eq('user_id', currentUser.id).order('datum', {ascending: false}),
        sb.from('profiles').select('bewertung_collapsed').eq('id', currentUser.id).single(),
        sb.from('durchsichten').select('*').eq('user_id', currentUser.id).order('datum', {ascending: false})
    ]);

    standorte = (results[0].data || []).map(function(r){
        return {id:r.id, name:r.name, notizen:r.notizen, mapsLink:r.maps_link, lat:r.lat, lng:r.lng, created:r.created_at};
    }).sort(function(a,b){ return a.name.localeCompare(b.name); });

    voelker = (results[1].data || []).map(function(r){
        return {id:r.id, standortId:r.standort_id, name:r.name, beutensystem:r.beutensystem, status:r.status, typ:r.typ||'volk', notizen:r.notizen, honigertrag:parseFloat(r.honigertrag)||0, created:r.created_at};
    }).sort(function(a,b){ return a.name.localeCompare(b.name); });

    bewertungen = (results[2].data || []).map(function(r){
        return {
            id:r.id, volkId:r.volk_id, volkName:r.volk_name, standortName:r.standort_name, datum:r.datum,
            sanftmut:r.sanftmut||3, wabensitz:r.wabensitz||3, schwarmtrieb:r.schwarmtrieb||3,
            volksstaerke:r.volksstaerke||3, winterfestigkeit:r.winterfestigkeit||3, hygiene:r.hygiene||3,
            wabenbau:r.wabenbau||3, honigfleiss:r.honigfleiss||3, notizen:r.notizen||'', created:r.created_at
        };
    });

    if (results[3].data && results[3].data.bewertung_collapsed) {
        collapsedStandorte = results[3].data.bewertung_collapsed;
    }

    durchsichten = (results[4].data || []).map(function(r){
        return {
            id: r.id, volkId: r.volk_id, datum: r.datum,
            taetigkeiten: r.taetigkeiten || [], kriterien: r.kriterien || {},
            varroa: r.varroa || null, notizen: r.notizen || '', created: r.created_at
        };
    });

    var kResult = await sb.from('voelker').select('id, koenigin_info').eq('user_id', currentUser.id);
    if (kResult.data) {
        kResult.data.forEach(function(r){
            if (r.koenigin_info) koeniginnen[r.id] = r.koenigin_info;
        });
    }

    document.getElementById('loadingOverlay').style.display = 'none';
    document.getElementById('app').style.display = 'block';

    // URL-Parameter
    var urlParams = new URLSearchParams(window.location.search);
    var volkParam = urlParams.get('volk');
    if (volkParam) {
        var gefunden = voelker.find(function(v){ return v.id === volkParam; });
        if (gefunden) {
            selectedStandortFilter = gefunden.standortId;
            activeTab = 'durchsicht';
            openVolkDetail = volkParam;
            setTimeout(function() {
                var el = document.querySelector('.volk-detail');
                if (el) el.scrollIntoView({behavior:'smooth', block:'start'});
            }, 300);
        }
    }
    var standortParam = urlParams.get('standort');
    if (standortParam) {
        selectedStandortId = standortParam;
        activeTab = 'standorte';
    }

    render();
}

// === RENDER DISPATCHER ===
function render() {
    var html = '<div class="container">';

    // Suchleiste
    html += '<div class="such-bar">';
    html += '<span class="such-icon">🔍</span>';
    html += '<input type="text" id="suchFeld" placeholder="Volk suchen..." value="' + suchBegriff.replace(/"/g,'&quot;') + '" oninput="suchBegriff=this.value;render();setTimeout(function(){var f=document.getElementById(\'suchFeld\');if(f){f.focus();f.setSelectionRange(f.value.length,f.value.length)}},10)">';
    if (suchBegriff) html += '<button class="such-clear" onclick="suchBegriff=\'\';render()">✕</button>';
    html += '</div>';

    if (suchBegriff.trim().length >= 2) {
        html += renderSuchergebnisse();
        html += '</div>';
        document.getElementById('app').innerHTML = html;
        setTimeout(function(){
            voelker.forEach(function(v){
                var qrEl = document.getElementById('qrcode-' + v.id);
                if (qrEl && !qrEl.firstChild) {
                    new QRCode(qrEl, { text: 'https://www.bienenplan.de/voelker.html?volk=' + v.id, width: 128, height: 128, colorDark: '#1C1410', colorLight: '#ffffff' });
                }
            });
        }, 100);
        return;
    }

    // Tabs
    html += '<div class="tab-bar" style="flex-wrap:wrap">';
    html += '<button class="tab-btn '+(activeTab==='standorte'?'active':'')+'" onclick="switchTab(\'standorte\')">📍 Standorte</button>';
    html += '<button class="tab-btn '+(activeTab==='voelker'?'active':'')+'" onclick="switchTab(\'voelker\')">🐝 Völker</button>';
    html += '<button class="tab-btn '+(activeTab==='durchsicht'?'active':'')+'" onclick="switchTab(\'durchsicht\')">📋 Durchsicht</button>';
    html += '<button class="tab-btn '+(activeTab==='ranking'?'active':'')+'" onclick="switchTab(\'ranking\')">🏆 Ranking</button>';
    html += '<button class="tab-btn '+(activeTab==='historie'?'active':'')+'" onclick="switchTab(\'historie\')">📜 Historie</button>';
    html += '<button class="tab-btn '+(activeTab==='stammbaum'?'active':'')+'" onclick="switchTab(\'stammbaum\')">🌳 Stammbaum</button>';
    html += '</div>';

    if (activeTab === 'standorte') html += renderStandorteTab();
    else if (activeTab === 'voelker') html += renderVoelkerTab();
    else if (activeTab === 'durchsicht') html += renderDurchsicht();
    else if (activeTab === 'ranking') html += renderRanking();
    else if (activeTab === 'historie') html += renderHistorie();
    else if (activeTab === 'stammbaum') html += renderStammbaum();

    html += '</div>';
    document.getElementById('app').innerHTML = html;

    if (activeTab === 'standorte' && !selectedStandortId) {
        initMiniMaps();
        ladeAlleGTS();
    }
}

function switchTab(tab) {
    activeTab = tab;
    render();
}

// === SHARED HELPERS ===
function uid() { return Date.now().toString(36) + Math.random().toString(36).substr(2, 5); }

function fmtDate(d) {
    return new Date(d).toLocaleDateString('de-DE',{day:'2-digit',month:'short',year:'numeric'});
}

function fmtDateShort(d) {
    return new Date(d).toLocaleDateString('de-DE',{day:'2-digit',month:'short'});
}

function fd(ts) { if (!ts) return '-'; return new Date(ts).toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric'}); }

function toast(msg, typ) {
    var el = document.getElementById('toast');
    el.textContent = msg;
    el.className = 'toast' + (typ ? ' ' + typ : '') + ' show';
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(function(){ el.classList.remove('show'); }, 2500);
}

function getDurchsichtenFuerVolk(volkId) {
    return durchsichten.filter(function(d){return d.volkId===volkId;}).sort(function(a,b){return new Date(b.datum)-new Date(a.datum);});
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

// === NAVIGATION ===
function goToVolk(volkId) {
    var v = voelker.find(function(x){return x.id === volkId;});
    if (!v) return;
    selectedStandortFilter = v.standortId;
    activeTab = 'durchsicht';
    openVolkDetail = volkId;
    render();
    setTimeout(function() {
        var el = document.querySelector('.volk-detail');
        if (el) el.scrollIntoView({behavior:'smooth', block:'start'});
    }, 150);
}

// === START ===
init();

// Leaflet cleanup
window.addEventListener('pagehide', function() {
    document.querySelectorAll('.leaflet-container').forEach(function(el){
        el.style.visibility = 'hidden';
    });
});
window.addEventListener('pageshow', function(e) {
    if (e.persisted) {
        document.querySelectorAll('.leaflet-container').forEach(function(el){
            el.style.visibility = 'visible';
        });
    }
});

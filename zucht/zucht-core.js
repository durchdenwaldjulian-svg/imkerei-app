// ============================================
// 🧬 ZUCHTTOOL – CORE MODULE
// zucht/zucht-core.js
// Datenbank, COI, Stammbaum, Grundfunktionen
// ============================================

var ZT = window.ZT || {};

// ============================================
// DATEN
// ============================================
ZT.db = null;           // pedigree_db.json
ZT.pedigrees = [];      // Gespeicherte Stammbäume
ZT.currentTree = {};    // Aktueller Stammbaum im Editor
ZT.mateQueen = null;    // Gewählte Königin für Anpaarung
ZT.mateDrone = null;     // Gewähltes Drohnenvolk
ZT.GENERATIONS = 4;
ZT.isPreview = false;

// Generationsschlüssel
ZT.GEN_KEYS = [
    ['q'],
    ['q.m','q.v'],
    ['q.m.m','q.m.v','q.v.m','q.v.v'],
    ['q.m.m.m','q.m.m.v','q.m.v.m','q.m.v.v','q.v.m.m','q.v.m.v','q.v.v.m','q.v.v.v'],
    ['q.m.m.m.m','q.m.m.m.v','q.m.m.v.m','q.m.m.v.v','q.m.v.m.m','q.m.v.m.v','q.m.v.v.m','q.m.v.v.v','q.v.m.m.m','q.v.m.m.v','q.v.m.v.m','q.v.m.v.v','q.v.v.m.m','q.v.v.m.v','q.v.v.v.m','q.v.v.v.v']
];
ZT.GEN_LABELS = ['Königin','Eltern (F1)','Großeltern (F2)','Urgroßeltern (F3)','Ur-Urgroßeltern (F4)'];

// Demo-Pedigrees
ZT.DEMOS = [
    {
        id:'d1',name:'B10(MKN)',race:'B',year:2020,
        tree:{'q':'B10(MKN).20','q.m':'B62(MKN).18','q.v':'M102(MKN).18','q.m.m':'B26(TR).16','q.m.v':'B59(MKN).16','q.v.m':'B06(MKN).16','q.v.v':'B100(PJ).16','q.m.m.m':'B77(TR).13','q.m.m.v':'B47(MKK).13','q.m.v.m':'B54(TR).14','q.m.v.v':'B59(MKN).14','q.v.m.m':'B43(TR).15','q.v.m.v':'B100(PJ).15','q.v.v.m':'B158(PJ).17','q.v.v.v':'B120(PJ).17'},
        evaluations:{vitality:5,brood:5,temper:5,swarm:5,varroa:4,honey_early:4,honey_summer:4,overwinter:5},
        coi:3.12,created_at:'2026-02-15'
    },
    {
        id:'d2',name:'A07(MKN)',race:'A',year:2020,
        tree:{'q':'A07(MKN).20','q.m':'A36(MKN).18','q.v':'M102(MKN).18','q.m.m':'A337(MKN).17','q.m.v':'B100(PJ).17','q.v.m':'B06(MKN).16','q.v.v':'B100(PJ).16','q.m.m.m':'A318(MKN).16','q.m.m.v':'A533(MKN).16'},
        evaluations:{vitality:4,brood:5,temper:6,swarm:5,varroa:3,honey_early:5,honey_summer:5,overwinter:4},
        coi:5.47,created_at:'2026-02-20'
    },
    {
        id:'d3',name:'B466(FF)',race:'B',year:2018,
        tree:{'q':'B466(FF).18','q.m':'B53(FF).16','q.v':'A558(FF).15','q.m.m':'B272(FF).14','q.m.v':'B338(FF).13','q.v.m':'A489(FF).13','q.v.v':'B152(FF)'},
        evaluations:{vitality:5,brood:5,temper:5,swarm:5,varroa:4,honey_early:4,honey_summer:4,overwinter:5,propolis:5},
        coi:1.56,created_at:'2026-03-01'
    }
];

// Bewertungskategorien (nach karlkehrle.org / DIB Standard)
ZT.CRITERIA = [
    {key:'vitality',label:'Vitalität Bienen',icon:'💪',max:6},
    {key:'brood',label:'Vitalität Brut',icon:'🥚',max:6},
    {key:'temper',label:'Sanftmut',icon:'😊',max:6},
    {key:'swarm',label:'Schwarmträgheit',icon:'🏠',max:6},
    {key:'fertility',label:'Fruchtbarkeit',icon:'🌱',max:6},
    {key:'honey_early',label:'Frühertrag',icon:'🌼',max:6},
    {key:'honey_summer',label:'Sommerertrag',icon:'🍯',max:6},
    {key:'overwinter',label:'Überwinterung',icon:'❄️',max:6},
    {key:'comb',label:'Wabenbau',icon:'🔶',max:6},
    {key:'propolis',label:'Propolis (wenig)',icon:'🟤',max:6},
    {key:'varroa',label:'Varroa-Resistenz',icon:'🛡️',max:6}
];

// Rassen/Linien
ZT.RACES = {
    'B':{name:'Buckfast',color:'#F5A623',bg:'#FEF3C7'},
    'M':{name:'Monticola',color:'#10b981',bg:'#D1FAE5'},
    'A':{name:'Anatolica',color:'#6366F1',bg:'#E0E7FF'},
    'C':{name:'Carnica',color:'#EC4899',bg:'#FCE7F3'},
    'GR':{name:'Gr.Reinet',color:'#059669',bg:'#ECFDF5'},
    'L':{name:'Ligustica',color:'#F97316',bg:'#FFF7ED'},
    'X':{name:'Gemischt',color:'#6B7280',bg:'#F3F4F6'}
};

// Belegstellen
ZT.STATIONS = [
    {code:'bal',name:'Baltrum',type:'Insel',country:'DE',races:['B'],lat:53.7244,lng:7.3744},
    {code:'mrk',name:'Marken',type:'Halbinsel',country:'NL',races:['B','M'],lat:52.4597,lng:5.1558},
    {code:'hbff',name:'Hausberg FF',type:'Berg',country:'DE',races:['B'],lat:47.9,lng:8.1},
    {code:'ins',name:'Instrumentelle Besamung',type:'Labor',country:'*',races:['B','A','M','C']},
    {code:'ieg',name:'Iegenbek',type:'Insel',country:'DE',races:['B'],lat:53.85,lng:8.3},
    {code:'hbts',name:'Hausberg TS',type:'Berg',country:'DE',races:['B'],lat:47.8,lng:12.5},
    {code:'bzd',name:'Borkum Zd',type:'Insel',country:'NL',races:['B'],lat:53.58,lng:6.67},
    {code:'ilv',name:'Ilvesheim',type:'Insel',country:'DE',races:['B','A'],lat:49.47,lng:8.56},
    {code:'alr',name:'Allertal',type:'Tal',country:'DE',races:['B'],lat:52.6,lng:9.7}
];

// ============================================
// HELFER
// ============================================
ZT.esc = function(s){
    if(!s) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
};

ZT.showToast = function(msg, type){
    var el = document.getElementById('toast');
    if(!el) return;
    el.textContent = msg;
    el.className = 'toast show' + (type ? ' toast-'+type : '');
    setTimeout(function(){ el.className = 'toast'; }, 3000);
};

ZT.switchTab = function(tabId, btn){
    document.querySelectorAll('.zt-panel').forEach(function(p){ p.classList.remove('active'); });
    document.querySelectorAll('.zt-tab').forEach(function(t){ t.classList.remove('active'); });
    var panel = document.getElementById('panel-'+tabId);
    if(panel) panel.classList.add('active');
    if(btn) btn.classList.add('active');
};

// ============================================
// DATENBANK LADEN
// ============================================
ZT.loadDB = async function(){
    // Versuche pedigree_db.json aus dem gleichen Verzeichnis
    try{
        var resp = await fetch('pedigree_db.json');
        if(resp.ok){
            ZT.db = await resp.json();
            ZT.showToast('🔍 '+ZT.db.total_queens+' Königinnen geladen');
            return true;
        }
    }catch(e){}
    return false;
};

ZT.importDB = function(file){
    var reader = new FileReader();
    reader.onload = function(e){
        try{
            ZT.db = JSON.parse(e.target.result);
            ZT.showToast('✅ '+ZT.db.total_queens+' Königinnen importiert','success');
            ZT.renderDBInfo();
        }catch(err){
            ZT.showToast('❌ Ungültige JSON-Datei','error');
        }
    };
    reader.readAsText(file);
};

ZT.searchDB = function(query){
    if(!ZT.db || !ZT.db.queens) return [];
    var q = query.toLowerCase().trim();
    if(!q) return [];
    return ZT.db.queens.filter(function(queen){
        return queen.name.toLowerCase().indexOf(q) > -1 ||
               (queen.breeder_code && queen.breeder_code.toLowerCase().indexOf(q) > -1) ||
               (queen.breeder_name && queen.breeder_name.toLowerCase().indexOf(q) > -1);
    }).slice(0, 50);
};

ZT.renderDBInfo = function(){
    var el = document.getElementById('dbInfo');
    if(!el) return;
    if(ZT.db){
        var kk = ZT.db.queens ? ZT.db.queens.filter(function(q){return q.source==='karlkehrle'}).length : 0;
        el.innerHTML = '<span style="color:#10b981">✅ '+ZT.db.total_queens+' Königinnen geladen</span>' +
            (kk > 0 ? ' <span style="color:#8B5CF6">('+kk+' von karlkehrle.org)</span>' : '') +
            ' <span style="color:#7A6652;font-size:.75rem">· '+ZT.db.source+'</span>';
    } else {
        el.innerHTML = '<span style="color:#f59e0b">⚠️ Keine Datenbank geladen. Lade pedigree_db.json hoch oder starte den Crawler.</span>';
    }
};

// ============================================
// COI BERECHNUNG – Wright's Pfadkoeffizient
// ============================================
ZT.calculateCOI = function(tree){
    if(!tree) tree = ZT.currentTree;
    var norm = {};
    for(var k in tree){
        if(tree[k]) norm[k] = tree[k].trim().toLowerCase();
    }

    var maternal = {}, paternal = {};
    for(var k in norm){
        if(k === 'q') continue;
        var depth = k.split('.').length - 2;
        if(k.startsWith('q.m')){
            if(!maternal[norm[k]]) maternal[norm[k]] = [];
            maternal[norm[k]].push({key:k, depth:depth});
        }
        if(k.startsWith('q.v')){
            if(!paternal[norm[k]]) paternal[norm[k]] = [];
            paternal[norm[k]].push({key:k, depth:depth});
        }
    }

    var ancestors = [];
    var coi = 0;
    for(var name in maternal){
        if(paternal[name] && name){
            maternal[name].forEach(function(mp){
                paternal[name].forEach(function(pp){
                    var n1 = mp.depth + 1;
                    var n2 = pp.depth + 1;
                    var c = Math.pow(0.5, n1 + n2 + 1);
                    coi += c;
                    ancestors.push({name:name, mDepth:mp.depth, pDepth:pp.depth, mKey:mp.key, pKey:pp.key, contrib:c});
                });
            });
        }
    }

    return {
        coi: coi,
        percent: (coi * 100).toFixed(2),
        ancestors: ancestors,
        rating: coi*100 < 6 ? 'good' : (coi*100 < 12 ? 'ok' : 'bad')
    };
};

// Berechne COI für Nachkommen einer Anpaarung
ZT.calculateMatingCOI = function(queenTree, droneTree){
    var combined = {};
    // Königin → mütterliche Seite
    if(queenTree['q']) combined['q.m'] = queenTree['q'];
    for(var k in queenTree){
        if(k === 'q') continue;
        combined['q.m' + k.substring(1)] = queenTree[k];
    }
    // Drohn → väterliche Seite
    if(droneTree['q']) combined['q.v'] = droneTree['q'];
    for(var k in droneTree){
        if(k === 'q') continue;
        combined['q.v' + k.substring(1)] = droneTree[k];
    }
    return ZT.calculateCOI(combined);
};

// ============================================
// STAMMBAUM – Rendering
// ============================================
ZT.renderTree = function(){
    var container = document.getElementById('treeView');
    if(!container) return;
    var hasData = false;
    var qName = document.getElementById('queenName') ? document.getElementById('queenName').value.trim() : '';
    for(var k in ZT.currentTree){ if(ZT.currentTree[k]){ hasData = true; break; } }
    if(!hasData && !qName){
        container.innerHTML = '<div style="text-align:center;color:#A69580;padding:2rem">Gib oben die Abstammung ein, um den Stammbaum zu sehen.</div>';
        return;
    }

    var html = '<div class="tree-row">' + ZT.makeNode(qName||'?', document.getElementById('queenYear') ? document.getElementById('queenYear').value : '', 'queen') + '</div>';
    for(var g = 1; g <= 3; g++){
        var keys = ZT.GEN_KEYS[g];
        html += '<div class="tree-row" style="margin-top:.25rem">';
        for(var i = 0; i < keys.length; i++){
            var val = ZT.currentTree[keys[i]] || '';
            html += ZT.makeNode(val||'—', '', keys[i].endsWith('.v') ? 'drone' : 'queen');
        }
        html += '</div>';
    }
    container.innerHTML = html;
};

ZT.makeNode = function(name, year, type){
    var cls = type === 'queen' ? 'queen' : type === 'drone' ? 'drone' : '';
    if(!name || name === '—') cls = 'empty';
    var badge = type === 'queen' ? '<span class="node-type type-queen">♀ Königin</span>' : '<span class="node-type type-drone">♂ Drohn</span>';
    if(cls === 'empty') badge = '<span class="node-type type-unknown">?</span>';

    var dn = name, dy = year || '';
    if(name && name.includes('.') && !name.includes(' ')){
        var parts = name.split('.');
        var yp = parts[parts.length-1];
        if(yp.length === 2 && !isNaN(yp)){ dy = '20'+yp; dn = parts.slice(0,-1).join('.'); }
    }

    // Rassen-Erkennung
    var race = dn.charAt(0);
    var raceInfo = ZT.RACES[race];

    return '<div class="tree-node '+cls+'">' +
        '<div class="node-name">'+ZT.esc(dn)+'</div>' +
        (dy ? '<div class="node-year">Jg. '+dy+'</div>' : '') +
        badge + '</div>';
};

// ============================================
// PEDIGREE FORM
// ============================================
ZT.renderPedForm = function(){
    var el = document.getElementById('pedForm');
    if(!el) return;
    var html = '';
    for(var g = 1; g <= ZT.GENERATIONS; g++){
        var keys = ZT.GEN_KEYS[g];
        html += '<div class="ped-gen"><div class="ped-gen-title"><span class="gen-badge">F'+g+'</span> '+ZT.GEN_LABELS[g]+'</div><div class="ped-pair">';
        for(var i = 0; i < keys.length; i++){
            var key = keys[i];
            var isV = key.endsWith('.v');
            var val = ZT.currentTree[key] || '';
            html += '<div><label style="font-size:.72rem;color:#7A6652;display:block;margin-bottom:.2rem">'+(isV?'🐝 Drohnenvolk':'👑 Mutter')+' <code style="font-size:.65rem;color:#A69580">'+key.replace('q.','')+'</code></label>';
            html += '<input type="text" class="input" style="font-family:monospace;font-size:.82rem" placeholder="z.B. B10(MKN).20" value="'+ZT.esc(val)+'" onchange="ZT.updateTree(\''+key+'\',this.value)"></div>';
        }
        html += '</div></div>';
    }
    el.innerHTML = html;
    ZT.renderTree();
};

ZT.updateTree = function(key, val){
    ZT.currentTree[key] = val.trim();
    ZT.renderTree();
};

ZT.clearTree = function(){
    ZT.currentTree = {};
    if(document.getElementById('queenName')) document.getElementById('queenName').value = '';
    if(document.getElementById('queenYear')) document.getElementById('queenYear').value = new Date().getFullYear();
    ZT.renderPedForm();
};

// ============================================
// SPEICHERN / LADEN (localStorage)
// ============================================
ZT.savePedigree = function(){
    var name = document.getElementById('queenName').value.trim();
    if(!name){ ZT.showToast('⚠️ Bitte Name eingeben','error'); return; }

    var race = document.getElementById('queenRace') ? document.getElementById('queenRace').value : 'B';
    var year = document.getElementById('queenYear') ? parseInt(document.getElementById('queenYear').value) : null;
    var tree = Object.assign({}, ZT.currentTree);
    tree['q'] = name + (year ? '.'+String(year).slice(-2) : '');

    var coiResult = ZT.calculateCOI(tree);

    var ped = {
        id: 'p_' + Date.now(),
        name: name, race: race, year: year,
        tree: tree, coi: parseFloat(coiResult.percent),
        created_at: new Date().toISOString()
    };

    ZT.pedigrees.push(ped);
    ZT.saveToDisk();
    ZT.showToast('💾 '+name+' gespeichert','success');
    ZT.renderSaved();
};

ZT.saveToDisk = function(){
    try{ localStorage.setItem('zt_pedigrees', JSON.stringify(ZT.pedigrees)); }catch(e){}
};

ZT.loadFromDisk = function(){
    try{
        var data = localStorage.getItem('zt_pedigrees');
        if(data) ZT.pedigrees = JSON.parse(data);
    }catch(e){}
};

ZT.deletePedigree = function(id){
    ZT.pedigrees = ZT.pedigrees.filter(function(p){ return p.id !== id; });
    ZT.saveToDisk();
    ZT.renderSaved();
    ZT.showToast('🗑️ Gelöscht');
};

ZT.loadPedigreeToEditor = function(id){
    var ped = ZT.pedigrees.find(function(p){ return p.id === id; }) ||
              ZT.DEMOS.find(function(p){ return p.id === id; });
    if(!ped) return;
    ZT.currentTree = Object.assign({}, ped.tree);
    if(document.getElementById('queenName')) document.getElementById('queenName').value = ped.name;
    if(document.getElementById('queenRace')) document.getElementById('queenRace').value = ped.race || 'B';
    if(document.getElementById('queenYear')) document.getElementById('queenYear').value = ped.year || '';
    ZT.renderPedForm();
    ZT.switchTab('stammbaum', document.querySelector('.zt-tab'));
    ZT.showToast('📋 '+ped.name+' geladen');
};

// ============================================
// GESPEICHERTE ANZEIGEN
// ============================================
ZT.renderSaved = function(){
    var el = document.getElementById('savedList');
    if(!el) return;
    var all = ZT.DEMOS.concat(ZT.pedigrees);
    if(all.length === 0){
        el.innerHTML = '<div style="text-align:center;padding:2rem;color:#7A6652">Noch keine Stammbäume gespeichert.</div>';
        return;
    }
    var html = '';
    all.forEach(function(p){
        var isDemo = p.id.startsWith('d');
        var raceInfo = ZT.RACES[p.race] || ZT.RACES['X'];
        html += '<div class="ped-saved-card" onclick="ZT.loadPedigreeToEditor(\''+p.id+'\')">';
        html += '<div class="ped-saved-icon" style="background:'+raceInfo.bg+';color:'+raceInfo.color+';font-weight:700">'+(p.race||'?')+'</div>';
        html += '<div style="flex:1"><div style="font-weight:700;font-size:.9rem">'+ZT.esc(p.name)+(isDemo?' <span style="font-size:.65rem;background:#f5f0eb;padding:.1rem .4rem;border-radius:99px;color:#7A6652">Demo</span>':'')+'</div>';
        html += '<div style="font-size:.75rem;color:#7A6652">'+raceInfo.name+' · Jg. '+(p.year||'?')+(p.coi!=null?' · COI: '+p.coi+'%':'')+'</div></div>';
        if(!isDemo) html += '<button onclick="event.stopPropagation();ZT.deletePedigree(\''+p.id+'\')" style="background:none;border:none;cursor:pointer;font-size:1rem;color:#ccc" title="Löschen">🗑️</button>';
        html += '</div>';
    });
    el.innerHTML = html;
};

// ============================================
// RASSEN-ERKENNUNG aus Name
// ============================================
ZT.detectRace = function(name){
    if(!name) return 'X';
    var first = name.charAt(0).toUpperCase();
    if(ZT.RACES[first]) return first;
    if(name.startsWith('GR') || name.startsWith('Gr')) return 'GR';
    return 'X';
};

// ============================================
// IMPORT AUS DB
// ============================================
ZT.importFromDB = function(queen){
    ZT.currentTree = Object.assign({}, queen.tree);
    if(document.getElementById('queenName')) document.getElementById('queenName').value = queen.name;
    if(document.getElementById('queenRace')) document.getElementById('queenRace').value = queen.race || ZT.detectRace(queen.name);
    if(document.getElementById('queenYear')) document.getElementById('queenYear').value = queen.year || '';
    ZT.renderPedForm();
    ZT.switchTab('stammbaum', document.querySelector('.zt-tab'));
    ZT.showToast('📋 '+queen.name+' importiert');
};

// ============================================
// INIT
// ============================================
ZT.init = async function(){
    // Preview-Modus (kein Login nötig)
    ZT.isPreview = true;
    ZT.loadFromDisk();

    // Versuche DB zu laden
    await ZT.loadDB();
    ZT.renderDBInfo();

    // UI aufbauen
    ZT.renderPedForm();
    ZT.renderSaved();

    if(document.getElementById('queenYear')){
        document.getElementById('queenYear').value = new Date().getFullYear();
    }

    // Loading ausblenden
    var ls = document.getElementById('loadingScreen');
    if(ls) ls.style.display = 'none';

    console.log('🧬 Zuchttool initialisiert');
};

// Auto-Init
if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', ZT.init);
} else {
    ZT.init();
}

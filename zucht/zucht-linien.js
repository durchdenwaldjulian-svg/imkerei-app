// zucht/zucht-linien.js – Linienanalyse, Heterosis, F2-Warnung
// Wird in Modul 5 implementiert
ZT.runLinien = function(){
    var tree = Object.assign({}, ZT.currentTree);
    var el = document.getElementById('linienResult');
    // Einfache Rassen-Zählung
    var counts = {};
    var total = 0;
    for(var k in tree){
        if(!tree[k]) continue;
        var race = ZT.detectRace(tree[k]);
        if(!counts[race]) counts[race] = 0;
        counts[race]++;
        total++;
    }
    if(total === 0){ el.innerHTML = '<div class="info-box" style="margin-top:1rem">ℹ️ Trage einen Stammbaum ein, um die Linien zu analysieren.</div>'; return; }

    var html = '<div class="card" style="margin-top:1rem"><h4 style="font-size:.9rem;margin-bottom:.75rem">🧬 Rassen-Anteile im Stammbaum</h4>';
    for(var r in counts){
        var pct = (counts[r] / total * 100).toFixed(1);
        var ri = ZT.RACES[r] || ZT.RACES['X'];
        html += '<div class="prog-row"><div class="prog-label"><span class="linie-pill linie-'+r+'">'+ri.name+'</span></div>';
        html += '<div class="prog-bar-bg"><div class="prog-bar-fill" style="width:'+pct+'%;background:'+ri.color+'"></div><div class="prog-bar-text">'+pct+'%</div></div>';
        html += '<div class="prog-pct" style="color:'+ri.color+'">'+counts[r]+'/'+total+'</div></div>';
    }
    html += '</div>';
    html += '<div class="card" style="margin-top:1rem;text-align:center;color:#7A6652;padding:1.5rem"><p>Heterosis-Prognose & F2-Aufspaltungs-Warnung werden in der nächsten Version hinzugefügt.</p></div>';
    el.innerHTML = html;
};

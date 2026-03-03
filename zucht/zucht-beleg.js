// zucht/zucht-beleg.js - Belegstellen-Empfehlung
ZT.runBeleg = function(){
    var el = document.getElementById('belegResult');
    var tree = Object.assign({}, ZT.currentTree);
    var qName = document.getElementById('queenName') ? document.getElementById('queenName').value.trim() : '';
    var race = document.getElementById('queenRace') ? document.getElementById('queenRace').value : 'B';
    
    var html = '<div class="card" style="margin-top:1rem"><h4 style="font-size:.9rem;margin-bottom:.75rem">Empfohlene Belegstellen fuer '+ZT.esc(qName||'aktuelle Koenigin')+' ('+race+')</h4>';
    ZT.STATIONS.forEach(function(s){
        var match = s.races.indexOf(race) > -1;
        var cls = match ? 'high' : 'low';
        var pct = match ? Math.floor(70 + Math.random()*25) : Math.floor(20 + Math.random()*30);
        html += '<div class="beleg-card"><div class="beleg-match '+cls+'">'+pct+'%</div><div style="flex:1"><div style="font-weight:700">'+s.name+'</div><div style="font-size:.75rem;color:#7A6652">'+s.type+' · '+s.country+' · Code: '+s.code+'</div><div style="font-size:.72rem;color:#A69580">Rassen: '+s.races.join(', ')+'</div></div></div>';
    });
    html += '</div>';
    el.innerHTML = html;
};

// zucht/zucht-ziel.js - Zuchtziel-Optimierer
ZT.renderZielForm = function(){
    var el = document.getElementById('zielForm');
    if(!el) return;
    var html = '<div style="margin-bottom:.5rem;font-size:.85rem;font-weight:600">Mindestanforderungen:</div>';
    ZT.CRITERIA.forEach(function(c){
        html += '<div style="display:flex;align-items:center;gap:.5rem;padding:.3rem 0"><span style="width:24px;text-align:center">'+c.icon+'</span><span style="width:130px;font-size:.82rem">'+c.label+'</span><input type="range" min="1" max="6" value="3" id="ziel_'+c.key+'" style="flex:1" oninput="document.getElementById(\'zielVal_'+c.key+'\').textContent=this.value"><span style="width:24px;text-align:center;font-weight:700;color:#F5A623" id="zielVal_'+c.key+'">3</span></div>';
    });
    el.innerHTML = html;
};
ZT.runZuchtziel = function(){
    var el = document.getElementById('zielResult');
    if(!ZT.db){ el.innerHTML = '<div class="info-box" style="margin-top:1rem">Lade zuerst eine Datenbank.</div>'; return; }
    el.innerHTML = '<div class="card" style="margin-top:1rem;text-align:center;color:#7A6652;padding:1.5rem"><p>Zuchtziel-Optimierung kommt in der naechsten Version. Datenbank mit '+ZT.db.total_queens+' Koeniginnen steht bereit.</p></div>';
};
setTimeout(function(){ if(typeof ZT !== 'undefined') ZT.renderZielForm(); }, 200);

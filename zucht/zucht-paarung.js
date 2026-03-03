// zucht/zucht-paarung.js – Anpaarungsplaner mit Prognosen
// Wird in Modul 4 implementiert
ZT.runMating = function(){
    if(!ZT.mateQueen || !ZT.mateDrone){ ZT.showToast('⚠️ Bitte Königin UND Drohnenvolk wählen','error'); return; }
    var r = ZT.calculateMatingCOI(ZT.mateQueen.tree, ZT.mateDrone.tree);
    var el = document.getElementById('matingResult');
    var html = '<div class="coi-result" style="margin-top:1rem">';
    html += '<div class="coi-label">Erwarteter COI der Nachkommen</div>';
    html += '<div class="coi-value coi-'+r.rating+'">'+r.percent+'%</div>';
    html += '<div class="coi-bar"><div class="coi-bar-fill" style="width:'+Math.min(parseFloat(r.percent)/25*100,100)+'%;background:'+(r.rating==='good'?'#10b981':(r.rating==='ok'?'#f59e0b':'#ef4444'))+'"></div></div>';
    html += '</div>';
    html += '<div class="card" style="margin-top:1rem;text-align:center;color:#7A6652;padding:1.5rem"><p>Eigenschafts-Prognosen & Kompatibilitäts-Score werden in der nächsten Version hinzugefügt.</p></div>';
    el.innerHTML = html;
    ZT.showToast('💕 COI Nachkommen: '+r.percent+'%', r.rating==='good'?'success':'');
};

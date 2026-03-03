// zucht/zucht-linien.js - Linienanalyse, Heterosis, F2
ZT.runLinien=function(){var tree=Object.assign({},ZT.currentTree);var el=document.getElementById('linienResult');
var counts={},total=0;
for(var k in tree){if(!tree[k])continue;var race=ZT.detectRace(tree[k]);if(!counts[race])counts[race]=0;counts[race]++;total++}
if(total===0){el.innerHTML='<div class="info-box" style="margin-top:1rem">Trage einen Stammbaum ein.</div>';return}
var h='<div class="card" style="margin-top:1rem"><h4 style="font-size:.9rem;margin-bottom:.75rem">Rassen-Anteile</h4>';
var raceList=Object.keys(counts).sort(function(a,b){return counts[b]-counts[a]});
raceList.forEach(function(r){var pct=(counts[r]/total*100).toFixed(1);var ri=ZT.RACES[r]||ZT.RACES['X'];
h+='<div class="prog-row"><div class="prog-label"><span class="linie-pill linie-'+r+'">'+ri.name+'</span></div>';
h+='<div class="prog-bar-bg"><div class="prog-bar-fill" style="width:'+pct+'%;background:'+ri.color+'"></div><div class="prog-bar-text">'+pct+'%</div></div>';
h+='<div class="prog-pct" style="color:'+ri.color+'">'+counts[r]+'/'+total+'</div></div>'});
h+='</div>';
var numR=raceList.length;
if(numR>=3){h+='<div class="het-good"><div class="het-title">Hohe Diversitaet</div><div class="het-text">'+numR+' Linien im Stammbaum. Gute Basis fuer Kombinationszucht.</div></div>'}
else if(numR===1){h+='<div class="f2-warn"><div class="f2-warn-title">Geringe Diversitaet</div><div class="f2-warn-text">Nur eine Linie. Einkreuzung koennte Vitalitaet steigern.</div></div>'}
var mR=tree['q.m']?ZT.detectRace(tree['q.m']):null;
var vR=tree['q.v']?ZT.detectRace(tree['q.v']):null;
if(mR&&vR&&mR!==vR){h+='<div class="f2-warn"><div class="f2-warn-title">F1-Kreuzung erkannt!</div><div class="f2-warn-text">Mutter ('+mR+') x Vater ('+vR+') = F1. Weiterzucht OHNE Rueckkreuzung hat hohes Aufspaltungsrisiko in F2. Empfehlung: Rueckkreuzung auf eine Elternlinie.</div></div>'}
el.innerHTML=h};

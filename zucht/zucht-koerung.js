// zucht/zucht-koerung.js - Koerung & Ranking
ZT.runKoerung=function(){var el=document.getElementById('koerungContent');
var all=ZT.DEMOS.concat(ZT.pedigrees).filter(function(p){return p.evaluations&&Object.keys(p.evaluations).length>0});
if(all.length===0){el.innerHTML='<div style="text-align:center;padding:2rem;color:#7A6652">Keine Koeniginnen mit Bewertungen.</div>';return}
var ranked=all.map(function(p){var sum=0,cnt=0;ZT.CRITERIA.forEach(function(c){if(p.evaluations[c.key]){sum+=parseFloat(p.evaluations[c.key]);cnt++}});return{ped:p,avg:cnt>0?sum/cnt:0,zw:cnt>0?Math.round(100+(sum/cnt-3.5)*7):100}}).sort(function(a,b){return b.zw-a.zw});
var h='<h4 style="font-size:.95rem;margin-bottom:.75rem">Ranking ('+ranked.length+' Koeniginnen)</h4>';
ranked.forEach(function(r,i){var medal=i===0?'\U0001f947':i===1?'\U0001f948':i===2?'\U0001f949':'  '+(i+1)+'.';
var gc=r.zw>=110?'#10b981':r.zw>=100?'#f59e0b':'#ef4444';
h+='<div style="display:flex;align-items:center;gap:.75rem;padding:.5rem 0;border-bottom:1px solid #f5f0eb">';
h+='<div style="font-size:1.2rem;width:2rem;text-align:center">'+medal+'</div>';
h+='<div style="flex:1"><div style="font-weight:700;font-size:.85rem">'+ZT.esc(r.ped.name)+'</div>';
h+='<div style="font-size:.72rem;color:#7A6652">'+(ZT.RACES[r.ped.race]||{name:'?'}).name+' | '+r.avg.toFixed(1)+'/6</div></div>';
h+='<div style="font-size:1.3rem;font-weight:700;color:'+gc+'">ZW '+r.zw+'</div></div>'});
if(ranked.length>0&&ranked[0].zw>=107){var best=ranked[0];
h+='<div style="margin-top:1rem;background:#ECFDF5;border:2px solid #10b981;border-radius:.75rem;padding:1rem">';
h+='<div style="font-weight:700;color:#065F46;margin-bottom:.25rem">Koer-Empfehlung</div>';
h+='<div style="font-size:.82rem;color:#064E3B">'+ZT.esc(best.ped.name)+' mit ZW '+best.zw+' kommt fuer Koerung in Frage.</div></div>'}
el.innerHTML=h};
// Auto-trigger wenn Tab geoeffnet
var _origSwitch=ZT.switchTab;
ZT.switchTab=function(id,btn){_origSwitch(id,btn);if(id==='koerung')ZT.runKoerung()};

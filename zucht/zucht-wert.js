// zucht/zucht-wert.js - Zuchtwertschaetzung BeeBreed
ZT.renderZuchtwert=function(){var el=document.getElementById('zuchtWertResult');if(!el)return;
var qName=document.getElementById('queenName')?document.getElementById('queenName').value.trim():'';
var ped=ZT.pedigrees.find(function(p){return p.name===qName})||ZT.DEMOS.find(function(p){return p.name===qName});
if(!ped||!ped.evaluations||Object.keys(ped.evaluations).length===0){el.innerHTML='<div class="card" style="margin-top:1rem"><h4 style="font-size:.9rem;margin-bottom:.5rem">Zuchtwert</h4><div style="color:#7A6652;font-size:.82rem">Keine Bewertungsdaten. Daten von karlkehrle.org laden oder manuell bewerten.</div></div>';return}
var evals=ped.evaluations;
var h='<div class="card" style="margin-top:1rem"><h4 style="font-size:.9rem;margin-bottom:.75rem">Zuchtwert (100=Durchschnitt)</h4>';
var totalZW=0,count=0;
ZT.CRITERIA.forEach(function(c){var val=evals[c.key]?parseFloat(evals[c.key]):null;if(val===null)return;
var zw=Math.round(100+(val-3.5)*7);totalZW+=zw;count++;
var barW=Math.min(Math.max((zw-70)/60*100,5),100);
var bc=zw>=110?'#10b981':zw>=100?'#f59e0b':'#ef4444';
h+='<div class="prog-row"><div class="prog-label">'+c.icon+' '+c.label+'</div>';
h+='<div class="prog-bar-bg"><div class="prog-bar-fill" style="width:'+barW+'%;background:'+bc+'"></div>';
h+='<div class="prog-bar-text">ZW '+zw+'</div></div>';
h+='<div class="prog-pct" style="color:'+bc+'">Note '+val+'</div></div>'});
if(count>0){var gesamt=Math.round(totalZW/count);if(gesamt>100)gesamt=Math.round(100+(gesamt-100)*1.15);
var gc=gesamt>=110?'#10b981':gesamt>=100?'#f59e0b':'#ef4444';
h+='<div style="margin-top:1rem;padding-top:.75rem;border-top:2px solid #E8DFD4;text-align:center">';
h+='<div style="font-size:.82rem;color:#7A6652">Gesamtzuchtwert</div>';
h+='<div style="font-size:2rem;font-weight:700;color:'+gc+';font-family:DM Serif Display,serif">'+gesamt+'</div>';
h+='<div style="font-size:.72rem;color:#7A6652">'+(gesamt>=120?'Top 2% aller Koeniginnen':gesamt>=110?'Besser als 84%':gesamt>=100?'Ueberdurchschnittlich':'Unter Durchschnitt')+'</div></div>'}
h+='</div>';el.innerHTML=h};

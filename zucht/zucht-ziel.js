// zucht/zucht-ziel.js - Zuchtziel-Optimierer + Perfekte Zucht
ZT.renderZielForm=function(){var el=document.getElementById('zielForm');if(!el)return;
var h='<div style="margin-bottom:.75rem;font-size:.85rem;font-weight:600">Gewichtung (0=egal, 5=sehr wichtig):</div>';
ZT.CRITERIA.forEach(function(c){h+='<div style="display:flex;align-items:center;gap:.5rem;padding:.25rem 0"><span style="width:24px;text-align:center">'+c.icon+'</span><span style="width:120px;font-size:.8rem">'+c.label+'</span><input type="range" min="0" max="5" value="3" id="ziel_'+c.key+'" style="flex:1" oninput="document.getElementById(\'zielVal_'+c.key+'\').textContent=this.value"><span style="width:20px;text-align:center;font-weight:700;color:#F5A623" id="zielVal_'+c.key+'">3</span></div>'});
h+='<div style="margin-top:.75rem;padding-top:.75rem;border-top:2px solid #E8DFD4"><div style="font-size:.82rem;font-weight:600;margin-bottom:.3rem">Max. COI:</div><input type="range" min="1" max="25" value="10" id="ziel_maxcoi" style="width:100%" oninput="document.getElementById(\'zielMaxCoiVal\').textContent=this.value+\'%\'"><div style="display:flex;justify-content:space-between;font-size:.7rem;color:#7A6652"><span>1% streng</span><span id="zielMaxCoiVal">10%</span><span>25% locker</span></div></div>';
el.innerHTML=h};

ZT.runZuchtziel=function(){var el=document.getElementById('zielResult');
var allPeds=ZT.DEMOS.concat(ZT.pedigrees);
if(allPeds.length<2){el.innerHTML='<div class="info-box" style="margin-top:1rem">Mind. 2 Stammbaeme noetig.</div>';return}
var maxCoi=parseInt(document.getElementById('ziel_maxcoi').value);
var weights={};ZT.CRITERIA.forEach(function(c){weights[c.key]=parseInt(document.getElementById('ziel_'+c.key).value)||0});
var results=[];
for(var i=0;i<allPeds.length;i++){for(var j=0;j<allPeds.length;j++){if(i===j)continue;
var q=allPeds[i],d=allPeds[j];
var coi=ZT.calculateMatingCOI(q.tree,d.tree);
if(parseFloat(coi.percent)>maxCoi)continue;
var preds=ZT.predictTraits?ZT.predictTraits(q.evaluations,d.evaluations):{};
var score=0,maxS=0;
for(var k in weights){if(weights[k]>0&&preds[k]){score+=preds[k].probGood*weights[k];maxS+=100*weights[k]}}
var coiBonus=Math.max(0,30-parseFloat(coi.percent))/30*20;
score+=coiBonus*3;maxS+=60;
var pct=maxS>0?Math.round(score/maxS*100):0;
results.push({queen:q,drone:d,coi:coi,score:pct})}}
results.sort(function(a,b){return b.score-a.score});
var top=results.slice(0,10);
var h='<div class="card" style="margin-top:1rem"><h4 style="font-size:.95rem;margin-bottom:.75rem">Top '+top.length+' Anpaarungen (von '+results.length+' geprueft)</h4>';
if(top.length===0){h+='<div style="color:#7A6652;text-align:center;padding:1rem">Keine passend. Max COI erhoehen oder mehr Daten laden.</div>'}
top.forEach(function(r,idx){
var medal=idx===0?'\U0001f947':idx===1?'\U0001f948':idx===2?'\U0001f949':'  '+(idx+1)+'.';
var sc=r.score>=75?'#10b981':r.score>=50?'#f59e0b':'#ef4444';
h+='<div style="display:flex;align-items:center;gap:.75rem;padding:.6rem 0;border-bottom:1px solid #f5f0eb;cursor:pointer" onclick="ZT.mateQueen=null;ZT.mateDrone=null;ZT.chooseMateById(\''+r.queen.id+'\',\'queen\');ZT.chooseMateById(\''+r.drone.id+'\',\'drone\');ZT.switchTab(\'anpaarung\',document.querySelectorAll(\'.zt-tab\')[2])">';
h+='<div style="font-size:1.2rem;width:2rem;text-align:center">'+medal+'</div>';
h+='<div style="flex:1"><div style="font-weight:700;font-size:.85rem">'+ZT.esc(r.queen.name)+' x '+ZT.esc(r.drone.name)+'</div>';
h+='<div style="font-size:.72rem;color:#7A6652">COI: '+r.coi.percent+'%</div></div>';
h+='<div style="font-size:1.3rem;font-weight:700;color:'+sc+'">'+r.score+'%</div></div>'});
h+='<div style="margin-top:.75rem;font-size:.72rem;color:#A69580">Klicke auf eine Anpaarung um Details zu sehen.</div></div>';
el.innerHTML=h};

ZT.chooseMateById=function(id,mode){
var ped=ZT.pedigrees.find(function(p){return p.id===id})||ZT.DEMOS.find(function(p){return p.id===id});
if(!ped)return;
if(mode==='queen'){ZT.mateQueen=ped;document.getElementById('mateQueenName').textContent=ped.name;document.getElementById('mateQueen').classList.add('selected')}
else{ZT.mateDrone=ped;document.getElementById('mateDroneName').textContent=ped.name;document.getElementById('mateDrone').classList.add('selected')}};

setTimeout(function(){if(typeof ZT!=='undefined')ZT.renderZielForm()},200);

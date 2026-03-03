// zucht/zucht-beleg.js - Belegstellen
ZT.runBeleg=function(){var el=document.getElementById('belegResult');
var race=document.getElementById('queenRace')?document.getElementById('queenRace').value:'B';
var qName=document.getElementById('queenName')?document.getElementById('queenName').value.trim():'';
var h='<div class="card" style="margin-top:1rem"><h4 style="font-size:.9rem;margin-bottom:.75rem">Empfehlungen fuer '+(qName||'Koenigin')+' ('+race+')</h4>';
var sorted=ZT.STATIONS.slice().sort(function(a,b){var aM=a.races.indexOf(race)>-1?1:0,bM=b.races.indexOf(race)>-1?1:0;return bM-aM});
sorted.forEach(function(s){var match=s.races.indexOf(race)>-1;var pct=match?85:25;var cls=match?'high':'low';
h+='<div class="beleg-card"><div class="beleg-match '+cls+'">'+pct+'%</div>';
h+='<div style="flex:1"><div style="font-weight:700">'+s.name+'</div>';
h+='<div style="font-size:.75rem;color:#7A6652">'+s.type+' | '+s.country+' | Code: '+s.code+'</div>';
h+='<div style="font-size:.72rem;color:#A69580">Rassen: '+s.races.join(', ')+'</div></div></div>'});
h+='</div>';el.innerHTML=h};

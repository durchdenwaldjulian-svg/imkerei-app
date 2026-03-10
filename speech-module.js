// ============================================
// SPEECH-MODULE.JS – Spracheingabe für Bewertungen
// ============================================

var speechActive = false;
var recognition = null;
var currentSprachVolk = null;
var sprachBewertungen = {};
var sprachLogEntries = [];
var useFallback = false;

var SPRACH_KEYWORDS = {
    sanftmut: ['sanftmut','sanft mut','sanftmütig','sanft mütig','sanft','sanftheit','stechverhalten','stech verhalten','friedlich','friedfertig'],
    wabensitz: ['wabensitz','waben sitz','wabenbesitz','sitzt auf der wabe','sitzen auf der wabe','sitz'],
    schwarmtrieb: ['schwarmtrieb','schwarm trieb','schwarm','schwarmlust','schwarm lust','schwarmlustig','schwarmstimmung'],
    volksstaerke: ['volksstärke','volks stärke','volk stärke','volksstaerke','stärke','bienenmasse','bienen masse','volksstark'],
    winterfestigkeit: ['winterfestigkeit','winter festigkeit','winterfest','winter fest','überwinterung','winterhart'],
    hygiene: ['hygiene','hygieneverhalten','hygiene verhalten','putztrieb','putz trieb','sauberkeit','kalkbrut'],
    wabenbau: ['wabenbau','waben bau','wabenbauen','bau verhalten','bauverhalten','naturwabenbau'],
    honigfleiss: ['honigfleiß','honig fleiß','honigfleiss','honig fleiss','honig','sammeleifer','sammel eifer','fleißig','ertrag','honigertrag','sammelleistung'],
    raumreserve: ['raumreserve','raum reserve','raum','platz','eng','erweitern','erweiterungsbedarf'],
    weiselrichtigkeit: ['weiselrichtigkeit','weisel','weiselrichtig','königin vorhanden','stifte','eilage','eilage vorhanden'],
    futterversorgung: ['futterversorgung','futter versorgung','futter','futtervorrat','futter vorrat','futterstand'],
    gesundheit: ['gesundheit','gesund','krank','krankheit','krankheitsanzeichen','allgemeinzustand'],
    varroa_beurteilung: ['varroa beurteilung','varroa','varroabelastung','varroa belastung','milben','milbenbefall']
};

var WORT_BEWERTUNG = [
    ['sehr schlecht',1],['ganz schlecht',1],['miserabel',1],['katastrophal',1],['furchtbar',1],['null',1],
    ['schlecht',2],['schwach',2],['mangelhaft',2],['mäßig',2],['nicht gut',2],['wenig',2],['kaum',2],['gering',2],['niedrig',2],
    ['mittel',3],['okay',3],['ok',3],['durchschnittlich',3],['geht so',3],['mittelmäßig',3],['normal',3],['so lala',3],['befriedigend',3],['in ordnung',3],
    ['gut',4],['ordentlich',4],['solide',4],['passt',4],['schön',4],['prima',4],['fein',4],['stark',4],['hoch',4],['viel',4],['reichlich',4],
    ['sehr gut',5],['super',5],['top',5],['hervorragend',5],['perfekt',5],['ausgezeichnet',5],['exzellent',5],['spitze',5],['toll',5],['klasse',5],['mega',5],['fantastisch',5],['wunderbar',5],['erstklassig',5],['eins a',5],['1a',5],['optimal',5],['sehr stark',5],['sehr hoch',5],['sehr viel',5],['maximal',5],['voll',5]
];
WORT_BEWERTUNG.sort(function(a,b){return b[0].length-a[0].length});

var SPECIAL_PHRASES = [
    ['kein schwarmtrieb','schwarmtrieb',5],['kein schwarm trieb','schwarmtrieb',5],['keinen schwarmtrieb','schwarmtrieb',5],
    ['nicht schwarmlustig','schwarmtrieb',5],['keine schwarmlust','schwarmtrieb',5],['keine schwarmstimmung','schwarmtrieb',5],
    ['schwarmfrei','schwarmtrieb',5],['will nicht schwärmen','schwarmtrieb',5],
    ['kaum schwarmtrieb','schwarmtrieb',4],['wenig schwarmtrieb','schwarmtrieb',4],
    ['leichter schwarmtrieb','schwarmtrieb',3],
    ['etwas schwarmlustig','schwarmtrieb',2],['schwarmlustig','schwarmtrieb',2],['will schwärmen','schwarmtrieb',2],['schwarmstimmung','schwarmtrieb',2],
    ['sehr schwarmlustig','schwarmtrieb',1],['starker schwarmtrieb','schwarmtrieb',1],['schwärmt','schwarmtrieb',1],
    ['sticht nicht','sanftmut',5],['sticht gar nicht','sanftmut',5],['ganz friedlich','sanftmut',5],['sehr sanft','sanftmut',5],['total sanft','sanftmut',5],['super sanft','sanftmut',5],['zahm','sanftmut',5],['lammfromm','sanftmut',5],
    ['etwas stechlustig','sanftmut',2],['etwas aggressiv','sanftmut',2],['sticht manchmal','sanftmut',2],['nervös','sanftmut',2],['unruhig','sanftmut',2],
    ['stechlustig','sanftmut',1],['aggressiv','sanftmut',1],['sehr aggressiv','sanftmut',1],['sticht','sanftmut',1],
    ['sitzt fest','wabensitz',5],['sitzt gut','wabensitz',5],['sitzen gut','wabensitz',5],['guter wabensitz','wabensitz',5],
    ['läuft von der wabe','wabensitz',1],['laufen von der wabe','wabensitz',1],['läuft','wabensitz',2],
    ['sehr starkes volk','volksstaerke',5],['starkes volk','volksstaerke',4],['schwaches volk','volksstaerke',2],['sehr schwaches volk','volksstaerke',1],
    ['trägt viel ein','honigfleiss',5],['guter ertrag','honigfleiss',5],['trägt wenig ein','honigfleiss',2],['schlechter ertrag','honigfleiss',1],
    ['weiselrichtig','weiselrichtigkeit',5],['stifte vorhanden','weiselrichtigkeit',5],['eilage vorhanden','weiselrichtigkeit',5],['königin gesehen','weiselrichtigkeit',5],
    ['weisellos','weiselrichtigkeit',1],['keine stifte','weiselrichtigkeit',1],['drohnenbrütig','weiselrichtigkeit',1],
    ['genug futter','futterversorgung',5],['futter reicht','futterversorgung',4],['futter knapp','futterversorgung',2],['kein futter','futterversorgung',1],
    ['gesund','gesundheit',5],['kerngesund','gesundheit',5],['krank','gesundheit',1],['auffällig','gesundheit',2],
    ['kaum milben','varroa_beurteilung',5],['wenig milben','varroa_beurteilung',4],['milbenbefall','varroa_beurteilung',2],['hoher milbenbefall','varroa_beurteilung',1],['viele milben','varroa_beurteilung',1],
    ['eng','raumreserve',1],['zu eng','raumreserve',1],['platz reicht','raumreserve',4],['genug platz','raumreserve',5],['braucht erweiterung','raumreserve',2]
];
SPECIAL_PHRASES.sort(function(a,b){return b[0].length-a[0].length});

var ZAHLWOERTER = {eins:1,eine:1,ein:1,zwei:2,zwo:2,drei:3,vier:4,fünf:5,fuenf:5,sechs:6,sieben:7,acht:8,neun:9,zehn:10};

function normalizeText(t){return t.toLowerCase().replace(/[.,;:!?]+/g,' ').replace(/\s+/g,' ').trim();}
function isSafari(){var u=navigator.userAgent;return /Safari/.test(u)&&!/Chrome/.test(u)&&!/Chromium/.test(u)&&!/CriOS/.test(u)&&!/Edg/.test(u);}
function toggleSpeech(){speechActive?stopSpeech():startSpeech();}

function startSpeech(){
    var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    useFallback=!SR||isSafari();
    speechActive=true;currentSprachVolk=null;sprachBewertungen={};sprachLogEntries=[];
    document.getElementById('speechFab').classList.add('active');
    document.getElementById('speechPanel').classList.add('active');
    if(useFallback){
        document.getElementById('spInputArea').innerHTML='<div style="background:#FFF8EE;border:2px solid rgba(245,166,35,0.2);border-radius:.75rem;padding:.75rem;margin-bottom:.75rem"><div style="font-weight:600;font-size:.9rem;margin-bottom:.5rem">📱 So geht\'s:</div><div style="font-size:.8rem;color:#7A6652;line-height:1.5">1. Tippe ins Textfeld unten<br>2. Drücke die <strong>🎤 Taste</strong> auf deiner Tastatur<br>3. Sprich deine Bewertung<br>4. Drücke <strong>"✨ Auswerten"</strong></div></div><textarea id="spDictateBox" class="sp-dictate-area" placeholder="Beispiel: Volk 1, Sanftmut 4, Wabensitz gut, kein Schwarmtrieb" rows="4"></textarea><button class="sp-dictate-btn" onclick="parseDictation()">✨ Auswerten</button>';
        addSprachLog('📱 Diktier-Modus');
        setTimeout(function(){var b=document.getElementById('spDictateBox');if(b)b.focus();},400);
    } else {
        document.getElementById('spInputArea').innerHTML='<div id="spTranscript" class="sp-transcript"><span style="color:#94a3b8">🎤 Warte auf Sprache...</span></div>';
        recognition=new SR();recognition.lang='de-DE';recognition.continuous=true;recognition.interimResults=true;recognition.maxAlternatives=1;
        recognition.onresult=function(ev){var interim='';for(var i=ev.resultIndex;i<ev.results.length;i++){var t=ev.results[i][0].transcript;if(ev.results[i].isFinal)processSpeechResult(t);else interim=t;}var el=document.getElementById('spTranscript');if(el&&interim)el.innerHTML='<span class="interim">🎤 '+interim+'</span>';};
        recognition.onerror=function(ev){if(ev.error==='no-speech'||ev.error==='aborted')return;addSprachLog('⚠️ Fehler: '+ev.error);};
        recognition.onend=function(){if(speechActive){try{recognition.start();}catch(e){}}};
        try{recognition.start();}catch(e){alert('Mikrofon konnte nicht gestartet werden.');speechActive=false;return;}
        addSprachLog('🎤 Sprachmodus gestartet');
    }
    updateSpeechPanel();
}

function stopSpeech(){
    speechActive=false;if(recognition){try{recognition.stop();}catch(e){}recognition=null;}
    document.getElementById('speechFab').classList.remove('active');document.getElementById('speechPanel').classList.remove('active');
    if(currentSprachVolk)autoSaveSprachBewertung();render();
}

function parseDictation(){
    var box=document.getElementById('spDictateBox');if(!box||!box.value.trim()){addSprachLog('⚠️ Kein Text');updateSpeechPanel();return;}
    box.value.trim().split(/[.,;\n]+/).forEach(function(s){s=s.trim();if(s)processSpeechResult(s);});
    box.value='';box.placeholder='Weiterdiktieren...';box.focus();updateSpeechPanel();
}

function processSpeechResult(text){
    var raw=text.trim();if(!raw)return;var lower=normalizeText(raw);
    var spTr=document.getElementById('spTranscript');if(spTr)spTr.innerHTML='💬 <em>"'+raw+'"</em>';
    if(/^(stopp|stop|fertig|beenden|ende)$/.test(lower)){stopSpeech();return;}
    if(/\bspeichern\b/.test(lower)){saveCurrentSprachBewertung();return;}
    if(/\bableger\b/.test(lower)){handleSprachAbleger(lower);return;}
    var notizM=lower.match(/\bnotiz\s+(.+)/);
    if(notizM&&currentSprachVolk&&sprachBewertungen[currentSprachVolk.id]){var n=sprachBewertungen[currentSprachVolk.id].notizen;sprachBewertungen[currentSprachVolk.id].notizen=n?n+'. '+notizM[1]:notizM[1];addSprachLog('📝 Notiz: '+notizM[1]);updateSpeechPanel();return;}
    var vm=detectSprachVolk(lower);
    if(vm&&(!currentSprachVolk||currentSprachVolk.id!==vm.id)){
        if(currentSprachVolk&&sprachBewertungen[currentSprachVolk.id])autoSaveSprachBewertung();
        currentSprachVolk=vm;if(!sprachBewertungen[vm.id])initSprachBew(vm.id);
        var st=standorte.find(function(s){return s.id===vm.standortId;});addSprachLog('🐝 '+vm.name+(st?' (📍 '+st.name+')':''));
    }
    if(currentSprachVolk){var n=extractSprachRatings(lower);if(n===0&&!vm&&!notizM){var d=sprachBewertungen[currentSprachVolk.id];if(d){d.notizen=d.notizen?d.notizen+'. '+raw:raw;addSprachLog('📝 Als Notiz: "'+raw+'"');}}}
    else if(!vm)addSprachLog('⚠️ Sage zuerst ein Volk, z.B. "Volk 1"');
    updateSpeechPanel();
}

function detectSprachVolk(text){
    var m=text.match(/(?:volk|folk)\s+(\S+)/i);if(m){var f=findSprachVolk(m[1].trim());if(f)return f;}
    var sorted=voelker.slice().sort(function(a,b){return b.name.length-a.name.length;});
    for(var i=0;i<sorted.length;i++){if(text.includes(sorted[i].name.toLowerCase()))return sorted[i];}return null;
}

function findSprachVolk(spoken){
    var n=spoken.toLowerCase().trim();
    Object.keys(ZAHLWOERTER).forEach(function(w){n=n.replace(new RegExp('\\b'+w+'\\b','g'),String(ZAHLWOERTER[w]));});
    var f=voelker.find(function(v){return v.name.toLowerCase()===n;});if(f)return f;
    f=voelker.find(function(v){return v.name.toLowerCase()==='volk '+n;});if(f)return f;
    f=voelker.find(function(v){return v.name.toLowerCase().includes(n)||n.includes(v.name.toLowerCase());});if(f)return f;
    if(/^\d+$/.test(n)){f=voelker.find(function(v){return v.name.match(new RegExp('\\b'+n+'\\b'));});if(f)return f;}return null;
}

function initSprachBew(volkId){var w={};KRITERIEN.forEach(function(k){w[k.key]=3;});sprachBewertungen[volkId]={werte:w,notizen:'',changed:[]};}

function extractSprachRatings(text){
    if(!currentSprachVolk)return 0;var data=sprachBewertungen[currentSprachVolk.id];if(!data)return 0;var gefunden=0;
    SPECIAL_PHRASES.forEach(function(sp){if(text.includes(sp[0])){data.werte[sp[1]]=sp[2];if(data.changed.indexOf(sp[1])===-1)data.changed.push(sp[1]);addSprachLog('✅ '+getLabelForKey(sp[1])+' → '+sp[2]+'/5');text=text.replace(sp[0],' ');gefunden++;}});
    KRITERIEN.forEach(function(k){var kws=SPRACH_KEYWORDS[k.key];if(!kws)return;for(var i=0;i<kws.length;i++){var idx=text.indexOf(kws[i]);if(idx===-1)continue;var after=text.substring(idx+kws[i].length).trim().replace(/^(ist|hat|war|wird|auf)\s+/,'');var r=parseSprachRating(after);if(r){data.werte[k.key]=r;if(data.changed.indexOf(k.key)===-1)data.changed.push(k.key);addSprachLog('✅ '+k.label+' → '+r+'/5');gefunden++;}break;}});
    return gefunden;
}

function parseSprachRating(text){
    text=text.trim().toLowerCase();if(!text)return null;
    var nm=text.match(/^(\d)/);if(nm){var n=parseInt(nm[1]);if(n>=1&&n<=5)return n;}
    var zk=Object.keys(ZAHLWOERTER).sort(function(a,b){return b.length-a.length;});
    for(var z=0;z<zk.length;z++){if(text.startsWith(zk[z])){var v=ZAHLWOERTER[zk[z]];if(v>=1&&v<=5)return v;}}
    var prefixes=['','so ','ganz ','total ','echt ','richtig ','recht ','ziemlich '];
    for(var i=0;i<WORT_BEWERTUNG.length;i++){for(var p=0;p<prefixes.length;p++){if(text.startsWith(prefixes[p]+WORT_BEWERTUNG[i][0]))return WORT_BEWERTUNG[i][1];}}
    return null;
}

function getLabelForKey(key){var k=KRITERIEN.find(function(x){return x.key===key;});return k?k.label:key;}

async function handleSprachAbleger(text){
    var from=currentSprachVolk;var vm=text.match(/ableger\s+(?:von|vom|aus)\s+(.+?)(?:[,.]|$)/i);
    if(vm){var f=findSprachVolk(vm[1].trim());if(f)from=f;}
    if(!from){addSprachLog('⚠️ Kein Volk für Ableger erkannt');updateSpeechPanel();return;}
    var ablName='Ableger v. '+from.name;var existing=voelker.filter(function(v){return v.name.startsWith('Ableger v. '+from.name);});
    if(existing.length>0)ablName+=' ('+(existing.length+1)+')';
    var id=crypto.randomUUID();
    var res=await sb.from('voelker').insert({id:id,name:ablName,standort_id:from.standortId,user_id:currentUser.id,status:'aktiv',typ:'ableger'});
    if(res.error)addSprachLog('❌ '+res.error.message);
    else{voelker.push({id:id,standortId:from.standortId,name:ablName,status:'aktiv',typ:'ableger',beutensystem:'Dadant',notizen:'',honigertrag:0});addSprachLog('🐝 '+ablName+' erstellt!');toast(ablName+' erstellt!');}
    updateSpeechPanel();
}

async function saveCurrentSprachBewertung(){
    if(!currentSprachVolk){addSprachLog('⚠️ Kein Volk ausgewählt');return;}
    await autoSaveSprachBewertung();currentSprachVolk=null;updateSpeechPanel();
}

async function autoSaveSprachBewertung(){
    if(!currentSprachVolk)return;var data=sprachBewertungen[currentSprachVolk.id];if(!data)return;
    if(data.changed.length===0&&!data.notizen){addSprachLog('ℹ️ Nichts zu speichern für '+currentSprachVolk.name);return;}
    var v=currentSprachVolk;var s=standorte.find(function(x){return x.id===v.standortId;});var today=new Date().toISOString().slice(0,10);
    var dbData={id:crypto.randomUUID(),user_id:currentUser.id,volk_id:v.id,volk_name:v.name,standort_name:s?s.name:'',datum:today,taetigkeiten:[],kriterien:data.werte,varroa:{},notizen:data.notizen||''};
    var res=await sb.from('durchsichten').insert(dbData);
    if(res.error)addSprachLog('❌ Speichern fehlgeschlagen: '+res.error.message);
    else{durchsichten.unshift({id:dbData.id,volkId:v.id,datum:today,taetigkeiten:[],kriterien:data.werte,varroa:{},notizen:data.notizen||'',created:new Date().toISOString()});addSprachLog('💾 '+v.name+' gespeichert');toast('💾 Bewertung für '+v.name+' gespeichert');delete sprachBewertungen[v.id];}
}

function updateSpeechPanel(){
    var vb=document.getElementById('spVolkBox');
    if(currentSprachVolk){var st=standorte.find(function(s){return s.id===currentSprachVolk.standortId;});vb.innerHTML='<div class="sp-volk-name">🐝 '+currentSprachVolk.name+'</div>'+(st?'<div class="sp-volk-standort">📍 '+st.name+'</div>':'');}
    else vb.innerHTML='<div style="color:#94a3b8;font-size:.9rem">🎤 Sage ein Volk: <em>"Volk 1"</em></div>';
    var ke=document.getElementById('spKriterien');
    if(currentSprachVolk&&sprachBewertungen[currentSprachVolk.id]){
        var d=sprachBewertungen[currentSprachVolk.id];var h='';
        KRITERIEN.forEach(function(k){var val=d.werte[k.key];var ch=d.changed.indexOf(k.key)>-1;h+='<div class="sp-krit-row'+(ch?' changed':'')+'"><span>'+k.label+'</span><span class="sp-krit-stars">';for(var i=1;i<=5;i++)h+='<span'+(i>val?' class="off"':'')+'>★</span>';h+=' <span style="font-size:.72rem;color:#7A6652">'+val+'/5</span></span></div>';});
        if(d.notizen)h+='<div style="padding:.4rem 0;font-size:.78rem;color:#7A6652;border-top:1px solid #f5f0eb;margin-top:.25rem">📝 '+d.notizen+'</div>';
        ke.innerHTML=h;
    } else ke.innerHTML='';
    var le=document.getElementById('spLog');le.innerHTML=sprachLogEntries.map(function(e){return '<div class="sp-log-entry">'+e+'</div>';}).join('');le.scrollTop=le.scrollHeight;
}

function addSprachLog(msg){var t=new Date().toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit',second:'2-digit'});sprachLogEntries.push('<span style="color:#94a3b8">'+t+'</span> '+msg);if(sprachLogEntries.length>30)sprachLogEntries.shift();}

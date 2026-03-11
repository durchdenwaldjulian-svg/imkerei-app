// ============================================
// SPRACHEINGABE MODULE (voelker-sprache.js)
// v2.0 – mit Tätigkeiten, TTS, Vibration, Korrektur, Varroa, Auto-Weiter
// Abhängigkeiten:
//   voelker-core.js: voelker, standorte, durchsichten, koeniginnen, KRITERIEN, TAETIGKEITEN, currentUser, toast(), render()
//   config.js: sb (Supabase client)
//   voelker.html: #speechFab, #speechPanel, #spVolkBox, #spKriterien, #spInputArea, #spLog
// ============================================
var speechActive = false;
var recognition = null;
var currentSprachVolk = null;
var sprachBewertungen = {};
var sprachLogEntries = [];
var useFallback = false;
var ttsEnabled = true;

// ============================================
// 1. FEEDBACK: Text-to-Speech + Vibration
// ============================================
function sprecheFeedback(text) {
    if (!ttsEnabled || !window.speechSynthesis) return;
    // Pause recognition briefly to avoid feedback loop
    var wasRunning = recognition && speechActive;
    if (wasRunning) try { recognition.stop(); } catch(e) {}
    var utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'de-DE';
    utter.rate = 1.1;
    utter.pitch = 1.0;
    utter.volume = 0.8;
    // Try to find a German voice
    var voices = speechSynthesis.getVoices();
    var deVoice = voices.find(function(v) { return v.lang.startsWith('de'); });
    if (deVoice) utter.voice = deVoice;
    utter.onend = function() {
        if (wasRunning && speechActive) {
            setTimeout(function() { try { recognition.start(); } catch(e) {} }, 200);
        }
    };
    speechSynthesis.cancel();
    speechSynthesis.speak(utter);
}

function vibriere(muster) {
    if (!navigator.vibrate) return;
    // muster: 'kurz' = erkannt, 'doppelt' = gespeichert, 'lang' = fehler
    if (muster === 'kurz') navigator.vibrate(50);
    else if (muster === 'doppelt') navigator.vibrate([80, 60, 80]);
    else if (muster === 'lang') navigator.vibrate(200);
    else if (muster === 'dreifach') navigator.vibrate([50, 40, 50, 40, 50]);
}

// ============================================
// 2. KEYWORD-ZUORDNUNGEN
// ============================================

// Kriterien-Keywords (viele Varianten wegen Speech-API Ungenauigkeiten)
var SPRACH_KEYWORDS = {
    sanftmut: ['sanftmut','sanft mut','sanftmütig','sanft mütig','sanft','sanftheit','stechverhalten','stech verhalten','friedlich','friedfertig'],
    wabensitz: ['wabensitz','waben sitz','wabenbesitz','sitzt auf der wabe','sitzen auf der wabe','sitz'],
    schwarmtrieb: ['schwarmtrieb','schwarm trieb','schwarm','schwarmlust','schwarm lust','schwarmlustig','schwarmstimmung'],
    volksstaerke: ['volksstärke','volks stärke','volk stärke','volksstaerke','stärke','bienenmasse','bienen masse','volksstark'],
    winterfestigkeit: ['winterfestigkeit','winter festigkeit','winterfest','winter fest','überwinterung','winterhart'],
    hygiene: ['hygiene','hygieneverhalten','hygiene verhalten','putztrieb','putz trieb','sauberkeit','kalkbrut'],
    wabenbau: ['wabenbau','waben bau','wabenbauen','bau verhalten','bauverhalten','naturwabenbau'],
    honigfleiss: ['honigfleiß','honig fleiß','honigfleiss','honig fleiss','sammeleifer','sammel eifer','fleißig','honigertrag','sammelleistung'],
    raumreserve: ['raumreserve','raum reserve','platz','erweiterungsbedarf'],
    weiselrichtigkeit: ['weiselrichtigkeit','weisel','weiselrichtig','königin vorhanden','stifte','eilage','eilage vorhanden'],
    futterversorgung: ['futterversorgung','futter versorgung','futtervorrat','futter vorrat','futterstand'],
    gesundheit: ['gesundheit','gesund','krank','krankheit','krankheitsanzeichen','allgemeinzustand'],
    varroa_beurteilung: ['varroa beurteilung','varroabelastung','varroa belastung']
};

// Wort → Zahl (natürliche Sprache)
var WORT_BEWERTUNG = [
    ['sehr schlecht',1],['ganz schlecht',1],['miserabel',1],['katastrophal',1],['furchtbar',1],['null',1],
    ['schlecht',2],['schwach',2],['mangelhaft',2],['mäßig',2],['nicht gut',2],['wenig',2],['kaum',2],['gering',2],['niedrig',2],
    ['mittel',3],['okay',3],['ok',3],['durchschnittlich',3],['geht so',3],['mittelmäßig',3],['normal',3],['so lala',3],['befriedigend',3],['in ordnung',3],
    ['gut',4],['ordentlich',4],['solide',4],['passt',4],['schön',4],['prima',4],['fein',4],['stark',4],['hoch',4],['viel',4],['reichlich',4],
    ['sehr gut',5],['super',5],['top',5],['hervorragend',5],['perfekt',5],['ausgezeichnet',5],['exzellent',5],['spitze',5],['toll',5],['klasse',5],['mega',5],['fantastisch',5],['wunderbar',5],['erstklassig',5],['eins a',5],['1a',5],['optimal',5],['sehr stark',5],['sehr hoch',5],['sehr viel',5],['maximal',5],['voll',5]
];
WORT_BEWERTUNG.sort(function(a,b){return b[0].length-a[0].length});

// Spezial-Phrasen → direkte Zuordnung
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

// ============================================
// 3. TÄTIGKEITEN-KEYWORDS (NEU)
// ============================================
var SPRACH_TAETIGKEITEN = [
    // Honigernte
    {words:['honigernte','honig geerntet','honig geschleudert','honig entnommen','geschleudert'], key:'honigernte'},
    // Varroa Biotechnik
    {words:['drohnenbrut schneiden','drohnenbrut geschnitten','drohnenrahmen geschnitten','drohnenrahmen entnommen','drohnenbrut'], key:'varroa_bio', sub:'Drohnenbrut schneiden'},
    {words:['bannwabe','bann wabe','bannwabe eingehängt'], key:'varroa_bio', sub:'Bannwabe'},
    {words:['brutentnahme','brut entnommen','brut entnahme','totale brutentnahme'], key:'varroa_bio', sub:'Brutentnahme'},
    {words:['fangwabe','fang wabe'], key:'varroa_bio', sub:'Fangwabe'},
    // Raummanagement
    {words:['honigraum erweitert','honigraum aufgesetzt','honigraum drauf','honigraum gegeben','honigraum dazu'], key:'raummanagement', sub:'Honigraum erweitert'},
    {words:['zarge aufgesetzt','zarge drauf','zarge gegeben','zarge dazu','zarge erweitert'], key:'raummanagement', sub:'Zarge aufgesetzt'},
    {words:['zarge entnommen','zarge weggenommen','zarge weg','zarge abgenommen'], key:'raummanagement', sub:'Zarge entnommen'},
    {words:['absperrgitter','absperr gitter','absperrgitter eingelegt','absperrgitter rein'], key:'raummanagement', sub:'Absperrgitter'},
    {words:['flugling','flugling erstellt','flügling','flugling gemacht'], key:'raummanagement', sub:'Flugling erstellt'},
    // Varroa Medikamente (mit Mengenangabe)
    {words:['oxalsäure','oxal säure','oxal gegeben','oxalsäure geträufelt','oxalsäure gegeben'], key:'varroa_medikamente', sub:'Oxalsäure', menge:true, unit:'ml'},
    {words:['ameisensäure','ameisen säure','ameisensäure gegeben'], key:'varroa_medikamente', sub:'Ameisensäure', menge:true, unit:'ml'},
    {words:['thymol','thymol gegeben','thymol eingelegt'], key:'varroa_medikamente', sub:'Thymol', menge:true, unit:'ml'},
    {words:['bayvarol','bayvarol eingehängt','bayvarol streifen'], key:'varroa_medikamente', sub:'Bayvarol'},
    {words:['apistan','apistan streifen'], key:'varroa_medikamente', sub:'Apistan'},
    // Futtergabe (mit Mengenangabe)
    {words:['zuckersirup','zucker sirup','sirup gegeben','sirup gefüttert'], key:'futtergabe', sub:'Zuckersirup', menge:true, unit:'kg'},
    {words:['futterteig','futter teig','teig gegeben','futterteig gegeben','futterteig aufgelegt'], key:'futtergabe', sub:'Futterteig', menge:true, unit:'kg'},
    {words:['honig gefüttert','honig gegeben'], key:'futtergabe', sub:'Honig', menge:true, unit:'kg'},
    {words:['gefüttert','futter gegeben','aufgefüttert','auffütterung','eingefüttert'], key:'futtergabe', menge:true, unit:'kg'},
    // Umweiselung
    {words:['umweiselung','umgeweiselt','königin getauscht','neue königin eingesetzt','königin zugesetzt','königin eingeweiselt'], key:'umweiselung'},
    // Varroa Diagnose
    {words:['varroa diagnose','varroa kontrolle','varroa check','gemülldiagnose','gemüll diagnose','milbenkontrolle','milben kontrolle','puderzucker methode','puderzuckermethode','auswaschen'], key:'varroa_diagnose'},
    // Sonstiges
    {words:['waben getauscht','mittelwand','mittelwände eingehängt','rähmchen','vereinigt','völker vereinigt','zusammengelegt'], key:'sonstiges'}
];
// Sortiere nach Wortlänge (längste zuerst für korrekte Erkennung)
SPRACH_TAETIGKEITEN.forEach(function(t) {
    t.words.sort(function(a,b) { return b.length - a.length; });
});

var ZAHLWOERTER = {eins:1,eine:1,ein:1,eineinhalb:1.5,anderthalb:1.5,zwei:2,zweieinhalb:2.5,zwo:2,drei:3,vier:4,fünf:5,fuenf:5,sechs:6,sieben:7,acht:8,neun:9,zehn:10,elf:11,zwölf:12,fünfzehn:15,zwanzig:20,dreißig:30,vierzig:40,fünfzig:50,hundert:100};

function normalizeText(t){return t.toLowerCase().replace(/[.,;:!?]+/g,' ').replace(/\s+/g,' ').trim();}

function isSafari(){var u=navigator.userAgent;return /Safari/.test(u)&&!/Chrome/.test(u)&&!/Chromium/.test(u)&&!/CriOS/.test(u)&&!/Edg/.test(u);}

// ============================================
// 4. START / STOP / TOGGLE
// ============================================
function toggleSpeech(){speechActive?stopSpeech():startSpeech();}

function startSpeech(){
    var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    useFallback=!SR||isSafari();
    speechActive=true;currentSprachVolk=null;sprachBewertungen={};sprachLogEntries=[];
    document.getElementById('speechFab').classList.add('active');
    document.getElementById('speechPanel').classList.add('active');
    // Preload TTS voices
    if (window.speechSynthesis) speechSynthesis.getVoices();
    if(useFallback){
        document.getElementById('spInputArea').innerHTML=
            '<div style="background:#FFF8EE;border:2px solid rgba(245,166,35,0.2);border-radius:.75rem;padding:.75rem;margin-bottom:.75rem">'+
            '<div style="font-weight:600;font-size:.9rem;margin-bottom:.5rem">📱 So geht\'s:</div>'+
            '<div style="font-size:.8rem;color:#7A6652;line-height:1.5">'+
            '1. Tippe ins Textfeld unten<br>2. Drücke die <strong>🎤 Taste</strong> auf deiner Tastatur<br>3. Sprich deine Bewertung<br>4. Drücke <strong>"✨ Auswerten"</strong></div></div>'+
            '<textarea id="spDictateBox" class="sp-dictate-area" placeholder="Beispiel: Volk 1, Sanftmut 4, Wabensitz gut, kein Schwarmtrieb, Drohnenbrut geschnitten, 3 kg Futterteig" rows="4"></textarea>'+
            '<button class="sp-dictate-btn" onclick="parseDictation()">✨ Auswerten</button>';
        addSprachLog('📱 Diktier-Modus: Nutze die 🎤 Taste auf deiner Tastatur');
        setTimeout(function(){var b=document.getElementById('spDictateBox');if(b)b.focus();},400);
    } else {
        document.getElementById('spInputArea').innerHTML='<div id="spTranscript" class="sp-transcript"><span style="color:#94a3b8">🎤 Warte auf Sprache...</span></div>';
        recognition=new SR();
        recognition.lang='de-DE';recognition.continuous=true;recognition.interimResults=true;recognition.maxAlternatives=1;
        recognition.onresult=function(ev){
            var interim='';
            for(var i=ev.resultIndex;i<ev.results.length;i++){
                var t=ev.results[i][0].transcript;
                if(ev.results[i].isFinal){processSpeechResult(t);}else{interim=t;}
            }
            var el=document.getElementById('spTranscript');
            if(el&&interim) el.innerHTML='<span class="interim">🎤 '+interim+'</span>';
        };
        recognition.onerror=function(ev){if(ev.error==='no-speech'||ev.error==='aborted')return;addSprachLog('⚠️ Fehler: '+ev.error);vibriere('lang');};
        recognition.onend=function(){if(speechActive){try{recognition.start();}catch(e){}}};
        try{recognition.start();}catch(e){alert('Mikrofon konnte nicht gestartet werden.');speechActive=false;return;}
        addSprachLog('🎤 Sprachmodus gestartet — sprich jetzt');
        sprecheFeedback('Sprachmodus bereit');
    }
    updateSpeechPanel();
}

function stopSpeech(){
    speechActive=false;
    if(window.speechSynthesis) speechSynthesis.cancel();
    if(recognition){try{recognition.stop();}catch(e){}recognition=null;}
    document.getElementById('speechFab').classList.remove('active');
    document.getElementById('speechPanel').classList.remove('active');
    if(currentSprachVolk)autoSaveSprachBewertung();
    render();
}

function parseDictation(){
    var box=document.getElementById('spDictateBox');
    if(!box||!box.value.trim()){addSprachLog('⚠️ Kein Text');updateSpeechPanel();return;}
    var segs=box.value.trim().split(/[.,;\n]+/);
    segs.forEach(function(s){s=s.trim();if(s)processSpeechResult(s);});
    box.value='';box.placeholder='Weiterdiktieren oder nächstes Volk...';box.focus();
    updateSpeechPanel();
}

// ============================================
// 5. HAUPT-VERARBEITUNG
// ============================================
function processSpeechResult(text){
    var raw=text.trim();if(!raw)return;
    var lower=normalizeText(raw);
    var spTr=document.getElementById('spTranscript');
    if(spTr)spTr.innerHTML='💬 <em>"'+raw+'"</em>';

    // --- Commands ---
    if(/^(stopp|stop|fertig|beenden|ende)$/.test(lower)){
        sprecheFeedback('Sprachmodus beendet');
        stopSpeech();return;
    }
    if(/^(ja|speichern|jap|genau|passt|korrekt)$/.test(lower)){saveCurrentSprachBewertung();return;}
    if(/\bableger\b/.test(lower)){handleSprachAbleger(lower);return;}

    // --- TTS Toggle ---
    if(/\b(stumm|ton aus|leise|mute)\b/.test(lower)){
        ttsEnabled=false;addSprachLog('🔇 Sprachausgabe aus');vibriere('kurz');updateSpeechPanel();return;
    }
    if(/\b(ton an|laut|unmute|sprache an)\b/.test(lower)){
        ttsEnabled=true;addSprachLog('🔊 Sprachausgabe an');sprecheFeedback('Sprachausgabe aktiviert');updateSpeechPanel();return;
    }

    // --- Korrektur ---
    if(/^(korrektur|nein|falsch|ändern?|korrigier)/.test(lower)){
        handleKorrektur(lower);return;
    }

    // --- Notiz ---
    var notizM=lower.match(/\bnotiz\s+(.+)/);
    if(notizM&&currentSprachVolk&&sprachBewertungen[currentSprachVolk.id]){
        var n=sprachBewertungen[currentSprachVolk.id].notizen;
        sprachBewertungen[currentSprachVolk.id].notizen=n?n+'. '+notizM[1]:notizM[1];
        addSprachLog('📝 Notiz: '+notizM[1]);
        vibriere('kurz');sprecheFeedback('Notiz gespeichert');
        updateSpeechPanel();return;
    }

    // --- Volk erkennen ---
    var vm=detectSprachVolk(lower);
    if(vm&&(!currentSprachVolk||currentSprachVolk.id!==vm.id)){
        if(currentSprachVolk&&sprachBewertungen[currentSprachVolk.id])autoSaveSprachBewertung();
        currentSprachVolk=vm;
        if(!sprachBewertungen[vm.id])initSprachBew(vm.id);
        var st=standorte.find(function(s){return s.id===vm.standortId;});
        addSprachLog('🐝 '+vm.name+(st?' (📍 '+st.name+')':''));
        vibriere('doppelt');
        sprecheFeedback(vm.name);
    }

    // --- Varroa-Diagnose ---
    if(currentSprachVolk && extractVarroaDiagnose(lower)){
        updateSpeechPanel();return;
    }

    // --- Tätigkeiten + Kriterien ---
    if(currentSprachVolk){
        var tGefunden = extractSprachTaetigkeiten(lower);
        var kGefunden = extractSprachRatings(lower);
        var gesamt = tGefunden + kGefunden;

        if(gesamt===0&&!vm&&!notizM){
            // Nicht erkannt → als Notiz
            var d=sprachBewertungen[currentSprachVolk.id];
            if(d){d.notizen=d.notizen?d.notizen+'. '+raw:raw;addSprachLog('📝 Als Notiz: "'+raw+'"');}
            vibriere('lang');
        }
    } else if(!vm){
        addSprachLog('⚠️ Sage zuerst ein Volk, z.B. "Volk 1"');
        vibriere('lang');
        sprecheFeedback('Sage zuerst ein Volk');
    }
    updateSpeechPanel();
}

// ============================================
// 6. VOLK ERKENNUNG
// ============================================
function detectSprachVolk(text){
    var m=text.match(/(?:volk|folk)\s+(\S+)/i);
    if(m){var f=findSprachVolk(m[1].trim());if(f)return f;}
    var sorted=voelker.slice().sort(function(a,b){return b.name.length-a.name.length;});
    for(var i=0;i<sorted.length;i++){if(text.includes(sorted[i].name.toLowerCase()))return sorted[i];}
    return null;
}

function findSprachVolk(spoken){
    var n=spoken.toLowerCase().trim();
    Object.keys(ZAHLWOERTER).forEach(function(w){n=n.replace(new RegExp('\\b'+w+'\\b','g'),String(ZAHLWOERTER[w]));});
    var f=voelker.find(function(v){return v.name.toLowerCase()===n;});if(f)return f;
    f=voelker.find(function(v){return v.name.toLowerCase()==='volk '+n;});if(f)return f;
    f=voelker.find(function(v){return v.name.toLowerCase().includes(n)||n.includes(v.name.toLowerCase());});if(f)return f;
    if(/^\d+$/.test(n)){f=voelker.find(function(v){return v.name.match(new RegExp('\\b'+n+'\\b'));});if(f)return f;}
    return null;
}

// ============================================
// 7. KORREKTUR PER SPRACHE (NEU)
// ============================================
function handleKorrektur(text) {
    if (!currentSprachVolk) {
        addSprachLog('⚠️ Kein Volk für Korrektur');
        vibriere('lang'); updateSpeechPanel(); return;
    }
    var data = sprachBewertungen[currentSprachVolk.id];
    if (!data) { updateSpeechPanel(); return; }

    // "Korrektur Sanftmut 3" oder "nein Sanftmut war 3"
    var cleaned = text.replace(/^(korrektur|nein|falsch|ändern?|korrigier)\s*/,'');

    // Versuche Kriterium + Zahl zu finden
    var found = false;
    KRITERIEN.forEach(function(k) {
        if (found) return;
        var kws = SPRACH_KEYWORDS[k.key]; if (!kws) return;
        for (var i = 0; i < kws.length; i++) {
            var idx = cleaned.indexOf(kws[i]);
            if (idx === -1) continue;
            var after = cleaned.substring(idx + kws[i].length).trim().replace(/^(ist|hat|war|wird|auf|soll)\s+/,'');
            var r = parseSprachRating(after);
            if (r) {
                var alt = data.werte[k.key];
                data.werte[k.key] = r;
                if (data.changed.indexOf(k.key) === -1) data.changed.push(k.key);
                addSprachLog('🔄 Korrektur: ' + k.label + ' ' + alt + ' → ' + r + '/5');
                vibriere('kurz');
                sprecheFeedback(k.label.split(' ').pop() + ' korrigiert auf ' + r);
                found = true;
            }
            break;
        }
    });

    if (!found) {
        // Versuche Tätigkeit zu entfernen
        var tRemoved = false;
        SPRACH_TAETIGKEITEN.forEach(function(td) {
            if (tRemoved) return;
            for (var w = 0; w < td.words.length; w++) {
                if (cleaned.indexOf(td.words[w]) > -1) {
                    // Entferne diese Tätigkeit
                    var tList = data.taetigkeiten;
                    for (var t = tList.length - 1; t >= 0; t--) {
                        if (tList[t].key === td.key) {
                            tList.splice(t, 1);
                            addSprachLog('🔄 Tätigkeit entfernt: ' + td.key);
                            vibriere('kurz');
                            sprecheFeedback('Tätigkeit entfernt');
                            tRemoved = true;
                            break;
                        }
                    }
                    break;
                }
            }
        });

        if (!tRemoved) {
            addSprachLog('⚠️ Korrektur nicht erkannt. Sage z.B. "Korrektur Sanftmut 3"');
            vibriere('lang');
        }
    }
    updateSpeechPanel();
}

// ============================================
// 8. TÄTIGKEITEN ERKENNUNG (NEU)
// ============================================
function extractSprachTaetigkeiten(text) {
    if (!currentSprachVolk) return 0;
    var data = sprachBewertungen[currentSprachVolk.id]; if (!data) return 0;
    var gefunden = 0;

    SPRACH_TAETIGKEITEN.forEach(function(td) {
        for (var w = 0; w < td.words.length; w++) {
            var idx = text.indexOf(td.words[w]);
            if (idx === -1) continue;

            // Menge extrahieren falls nötig
            var mengeStr = '';
            if (td.menge) {
                mengeStr = extractMenge(text, td.unit || 'kg');
            }

            // Prüfe ob diese Tätigkeit schon existiert
            var existing = null;
            for (var e = 0; e < data.taetigkeiten.length; e++) {
                if (data.taetigkeiten[e].key === td.key) { existing = data.taetigkeiten[e]; break; }
            }

            if (existing) {
                // Sub hinzufügen falls neu
                if (td.sub && existing.subs.indexOf(td.sub) === -1) {
                    existing.subs.push(td.sub);
                }
                if (mengeStr) existing.menge = mengeStr;
            } else {
                var entry = { key: td.key, subs: td.sub ? [td.sub] : [] };
                if (mengeStr) entry.menge = mengeStr;
                data.taetigkeiten.push(entry);
            }

            var tDef = TAETIGKEITEN.find(function(x) { return x.key === td.key; });
            var label = tDef ? tDef.icon + ' ' + tDef.label : td.key;
            if (td.sub) label += ' → ' + td.sub;
            if (mengeStr) label += ' (' + mengeStr + ')';
            addSprachLog('🔧 ' + label);
            vibriere('kurz');
            sprecheFeedback((td.sub || (tDef ? tDef.label : td.key)) + (mengeStr ? ', ' + mengeStr : ''));
            gefunden++;
            // Entferne das gefundene Wort aus dem Text damit es nicht nochmal matcht
            text = text.substring(0, idx) + ' ' + text.substring(idx + td.words[w].length);
            break;
        }
    });

    return gefunden;
}

function extractMenge(text, defaultUnit) {
    // Patterns: "3 kg", "3,5 ml", "drei kg", "3 Kilogramm", "3"
    var unitMap = {
        'kg': 'kg', 'kilogramm': 'kg', 'kilo': 'kg',
        'ml': 'ml', 'milliliter': 'ml',
        'l': 'l', 'liter': 'l',
        'g': 'g', 'gramm': 'g',
        'tropfen': 'Tropfen', 'streifen': 'Streifen'
    };

    // Zahl + Einheit: "3 kg", "3,5 ml", "drei kilo"
    var m = text.match(/(\d+[.,]?\d*)\s*(kg|kilogramm|kilo|ml|milliliter|l|liter|g|gramm|tropfen|streifen)\b/i);
    if (m) {
        var num = m[1].replace(',', '.');
        var unit = unitMap[m[2].toLowerCase()] || m[2];
        return num + ' ' + unit;
    }

    // Zahlwort + Einheit: "drei kg", "fünf ml"
    var keys = Object.keys(ZAHLWOERTER).sort(function(a,b) { return b.length - a.length; });
    for (var i = 0; i < keys.length; i++) {
        var re = new RegExp('\\b' + keys[i] + '\\s*(kg|kilogramm|kilo|ml|milliliter|l|liter|g|gramm|tropfen|streifen)\\b', 'i');
        var zm = text.match(re);
        if (zm) {
            var unit2 = unitMap[zm[1].toLowerCase()] || zm[1];
            return ZAHLWOERTER[keys[i]] + ' ' + unit2;
        }
    }

    // Nur Zahl ohne Einheit: "3" → mit defaultUnit
    var nm = text.match(/\b(\d+[.,]?\d*)\b/);
    if (nm) {
        var numOnly = nm[1].replace(',', '.');
        // Nur wenn die Zahl sinnvoll ist (nicht zu groß, nicht 1-5 = könnte Bewertung sein)
        var numVal = parseFloat(numOnly);
        if (numVal > 5 || (numVal > 0 && numVal <= 5 && defaultUnit !== 'kg')) {
            return numOnly + ' ' + defaultUnit;
        }
    }

    // Zahlwort allein
    for (var j = 0; j < keys.length; j++) {
        if (text.indexOf(keys[j]) > -1) {
            var val = ZAHLWOERTER[keys[j]];
            if (val > 5) return val + ' ' + defaultUnit;
        }
    }

    return '';
}

// ============================================
// 9. VARROA-DIAGNOSE ERKENNUNG (NEU)
// ============================================
function extractVarroaDiagnose(text) {
    if (!currentSprachVolk) return false;
    var data = sprachBewertungen[currentSprachVolk.id]; if (!data) return false;

    // "12 Milben in 3 Tagen" / "12 milben 3 tage"
    var m1 = text.match(/(\d+)\s*milben?\s+(?:in\s+)?(\d+)\s*tage?n?/i);
    if (m1) {
        var milben = parseInt(m1[1]);
        var tage = parseInt(m1[2]);
        var proTag = tage > 0 ? (milben / tage).toFixed(1) : milben;
        data.varroa = { milben: milben, tage: tage, methode: 'Gemülldiagnose' };
        addSprachLog('🔬 Varroa: ' + milben + ' Milben / ' + tage + ' Tage = ' + proTag + ' Milben/Tag');
        vibriere('kurz');
        sprecheFeedback(proTag + ' Milben pro Tag');

        // Automatisch varroa_beurteilung setzen
        var score = proTag <= 1 ? 5 : proTag <= 3 ? 4 : proTag <= 5 ? 3 : proTag <= 10 ? 2 : 1;
        data.werte.varroa_beurteilung = score;
        if (data.changed.indexOf('varroa_beurteilung') === -1) data.changed.push('varroa_beurteilung');
        addSprachLog('📊 Varroa-Beurteilung → ' + score + '/5');

        // Tätigkeit hinzufügen
        var hasVD = data.taetigkeiten.some(function(t) { return t.key === 'varroa_diagnose'; });
        if (!hasVD) data.taetigkeiten.push({ key: 'varroa_diagnose', subs: [] });
        return true;
    }

    // "5 Milben pro Tag"
    var m2 = text.match(/(\d+[.,]?\d*)\s*milben?\s*(?:pro|am|\/)\s*tag/i);
    if (m2) {
        var proTag2 = parseFloat(m2[1].replace(',', '.'));
        data.varroa = { milben: Math.round(proTag2), tage: 1, methode: 'Gemülldiagnose' };
        addSprachLog('🔬 Varroa: ' + proTag2 + ' Milben/Tag');
        vibriere('kurz');
        sprecheFeedback(proTag2 + ' Milben pro Tag');
        var score2 = proTag2 <= 1 ? 5 : proTag2 <= 3 ? 4 : proTag2 <= 5 ? 3 : proTag2 <= 10 ? 2 : 1;
        data.werte.varroa_beurteilung = score2;
        if (data.changed.indexOf('varroa_beurteilung') === -1) data.changed.push('varroa_beurteilung');
        var hasVD2 = data.taetigkeiten.some(function(t) { return t.key === 'varroa_diagnose'; });
        if (!hasVD2) data.taetigkeiten.push({ key: 'varroa_diagnose', subs: [] });
        return true;
    }

    return false;
}

// ============================================
// 10. KRITERIEN ERKENNUNG (bestehend, optimiert)
// ============================================
function initSprachBew(volkId){
    var w={};KRITERIEN.forEach(function(k){w[k.key]=3;});
    sprachBewertungen[volkId]={werte:w,notizen:'',changed:[],taetigkeiten:[],varroa:null};
}

function extractSprachRatings(text){
    if(!currentSprachVolk)return 0;
    var data=sprachBewertungen[currentSprachVolk.id];if(!data)return 0;
    var gefunden=0;
    // 1. Spezial-Phrasen
    SPECIAL_PHRASES.forEach(function(sp){
        if(text.includes(sp[0])){
            data.werte[sp[1]]=sp[2];
            if(data.changed.indexOf(sp[1])===-1)data.changed.push(sp[1]);
            addSprachLog('✅ '+getLabelForKey(sp[1])+' → '+sp[2]+'/5');
            vibriere('kurz');
            sprecheFeedback(getLabelForKey(sp[1]).split(' ').pop()+' '+sp[2]);
            text=text.replace(sp[0],' ');gefunden++;
        }
    });
    // 2. Kriterium + Bewertung
    KRITERIEN.forEach(function(k){
        var kws=SPRACH_KEYWORDS[k.key];if(!kws)return;
        for(var i=0;i<kws.length;i++){
            var idx=text.indexOf(kws[i]);if(idx===-1)continue;
            var after=text.substring(idx+kws[i].length).trim().replace(/^(ist|hat|war|wird|auf)\s+/,'');
            var r=parseSprachRating(after);
            if(r){
                data.werte[k.key]=r;
                if(data.changed.indexOf(k.key)===-1)data.changed.push(k.key);
                addSprachLog('✅ '+k.label+' → '+r+'/5');
                vibriere('kurz');
                sprecheFeedback(k.label.split(' ').pop()+' '+r);
                gefunden++;
            }
            break;
        }
    });
    return gefunden;
}

function parseSprachRating(text){
    text=text.trim().toLowerCase();if(!text)return null;
    var nm=text.match(/^(\d)/);if(nm){var n=parseInt(nm[1]);if(n>=1&&n<=5)return n;}
    var zk=Object.keys(ZAHLWOERTER).sort(function(a,b){return b.length-a.length;});
    for(var z=0;z<zk.length;z++){if(text.startsWith(zk[z])){var v=ZAHLWOERTER[zk[z]];if(v>=1&&v<=5)return v;}}
    var prefixes=['','so ','ganz ','total ','echt ','richtig ','recht ','ziemlich '];
    for(var i=0;i<WORT_BEWERTUNG.length;i++){
        for(var p=0;p<prefixes.length;p++){
            if(text.startsWith(prefixes[p]+WORT_BEWERTUNG[i][0]))return WORT_BEWERTUNG[i][1];
        }
    }
    return null;
}

function getLabelForKey(key){var k=KRITERIEN.find(function(x){return x.key===key;});return k?k.label:key;}

// ============================================
// 11. ABLEGER PER SPRACHE
// ============================================
async function handleSprachAbleger(text){
    var from=currentSprachVolk;
    var vm=text.match(/ableger\s+(?:von|vom|aus)\s+(.+?)(?:[,.]|$)/i);
    if(vm){var f=findSprachVolk(vm[1].trim());if(f)from=f;}
    if(!from){addSprachLog('⚠️ Kein Volk für Ableger erkannt');vibriere('lang');updateSpeechPanel();return;}
    var ablName='Ableger v. '+from.name;
    var existing=voelker.filter(function(v){return v.name.startsWith('Ableger v. '+from.name);});
    if(existing.length>0)ablName+=' ('+(existing.length+1)+')';
    var id=crypto.randomUUID();
    var res=await sb.from('voelker').insert({id:id,name:ablName,standort_id:from.standortId,user_id:currentUser.id,status:'aktiv',typ:'ableger'});
    if(res.error){addSprachLog('❌ '+res.error.message);vibriere('lang');}
    else{
        voelker.push({id:id,standortId:from.standortId,name:ablName,status:'aktiv',typ:'ableger',beutensystem:'Dadant',notizen:'',honigertrag:0});
        addSprachLog('🐝 '+ablName+' erstellt!');toast(ablName+' erstellt!');
        vibriere('doppelt');sprecheFeedback(ablName+' erstellt');
    }
    updateSpeechPanel();
}

// ============================================
// 12. SPEICHERN + AUTO-WEITER (NEU)
// ============================================
async function saveCurrentSprachBewertung(){
    if(!currentSprachVolk){addSprachLog('⚠️ Kein Volk ausgewählt');vibriere('lang');return;}
    await autoSaveSprachBewertung();
    // Auto-Weiter: Reset für nächstes Volk
    currentSprachVolk=null;
    vibriere('dreifach');
    sprecheFeedback('Gespeichert. Nächstes Volk?');
    addSprachLog('➡️ Bereit für nächstes Volk — sage z.B. "Volk 3"');
    updateSpeechPanel();
}

async function autoSaveSprachBewertung(){
    if(!currentSprachVolk)return;
    var data=sprachBewertungen[currentSprachVolk.id];if(!data)return;
    if(data.changed.length===0&&!data.notizen&&data.taetigkeiten.length===0){
        addSprachLog('ℹ️ Nichts zu speichern für '+currentSprachVolk.name);return;
    }
    var v=currentSprachVolk;
    var s=standorte.find(function(x){return x.id===v.standortId;});
    var today=new Date().toISOString().slice(0,10);

    // Zusammenfassung für TTS
    var summary = v.name + ': ';
    if (data.changed.length) summary += data.changed.length + ' Kriterien';
    if (data.taetigkeiten.length) summary += (data.changed.length ? ', ' : '') + data.taetigkeiten.length + ' Tätigkeiten';

    var dbData={
        id:crypto.randomUUID(),user_id:currentUser.id,volk_id:v.id,
        volk_name:v.name,standort_name:s?s.name:'',datum:today,
        taetigkeiten:data.taetigkeiten,kriterien:data.werte,
        varroa:data.varroa||{},notizen:data.notizen||''
    };
    var res=await sb.from('durchsichten').insert(dbData);
    if(res.error){
        addSprachLog('❌ Speichern fehlgeschlagen: '+res.error.message);
        vibriere('lang');
        sprecheFeedback('Fehler beim Speichern');
    } else {
        durchsichten.unshift({
            id:dbData.id,volkId:v.id,datum:today,
            taetigkeiten:data.taetigkeiten,kriterien:data.werte,
            varroa:data.varroa||{},notizen:data.notizen||'',created:new Date().toISOString()
        });
        addSprachLog('💾 '+summary+' gespeichert');
        toast('💾 '+v.name+' gespeichert');
        delete sprachBewertungen[v.id];
    }
}

// ============================================
// 13. UI UPDATES
// ============================================
function updateSpeechPanel(){
    var vb=document.getElementById('spVolkBox');
    if(currentSprachVolk){
        var st=standorte.find(function(s){return s.id===currentSprachVolk.standortId;});
        vb.innerHTML='<div class="sp-volk-name">🐝 '+currentSprachVolk.name+'</div>'+(st?'<div class="sp-volk-standort">📍 '+st.name+'</div>':'');
    }else{vb.innerHTML='<div style="color:#94a3b8;font-size:.9rem">🎤 Sage ein Volk: <em>"Volk 1"</em></div>';}

    var ke=document.getElementById('spKriterien');
    if(currentSprachVolk&&sprachBewertungen[currentSprachVolk.id]){
        var d=sprachBewertungen[currentSprachVolk.id];var h='';

        // Tätigkeiten anzeigen (NEU)
        if(d.taetigkeiten.length){
            h+='<div style="margin-bottom:.5rem;padding-bottom:.5rem;border-bottom:1px solid #f5f0eb">';
            h+='<div style="font-size:.72rem;font-weight:600;color:#92400E;margin-bottom:.25rem">🔧 Tätigkeiten</div>';
            d.taetigkeiten.forEach(function(t){
                var tDef=TAETIGKEITEN.find(function(x){return x.key===t.key;});
                var label=tDef?tDef.icon+' '+tDef.label:t.key;
                if(t.subs&&t.subs.length)label+=' ('+t.subs.join(', ')+')';
                if(t.menge)label+=' – '+t.menge;
                h+='<div style="font-size:.78rem;padding:.2rem 0;color:#3D2E1F">'+label+'</div>';
            });
            h+='</div>';
        }

        // Varroa anzeigen (NEU)
        if(d.varroa&&d.varroa.milben){
            var proTag=(d.varroa.tage>0?(d.varroa.milben/d.varroa.tage).toFixed(1):d.varroa.milben);
            var vc=proTag<=3?'#10b981':proTag<=10?'#f59e0b':'#ef4444';
            h+='<div style="margin-bottom:.5rem;padding:.4rem .6rem;background:linear-gradient(135deg,#fef3c7,#fff);border:1px solid #f59e0b;border-radius:.5rem;font-size:.82rem">';
            h+='🔬 <strong style="color:'+vc+'">'+proTag+' Milben/Tag</strong> <span style="color:#7A6652">('+d.varroa.milben+' in '+d.varroa.tage+' Tagen)</span>';
            h+='</div>';
        }

        // Kriterien
        KRITERIEN.forEach(function(k){
            var val=d.werte[k.key];var ch=d.changed.indexOf(k.key)>-1;
            h+='<div class="sp-krit-row'+(ch?' changed':'')+'"><span>'+k.label+'</span><span class="sp-krit-stars">';
            for(var i=1;i<=5;i++)h+='<span'+(i>val?' class="off"':'')+'>★</span>';
            h+=' <span style="font-size:.72rem;color:#7A6652">'+val+'/5</span></span></div>';
        });
        if(d.notizen)h+='<div style="padding:.4rem 0;font-size:.78rem;color:#7A6652;border-top:1px solid #f5f0eb;margin-top:.25rem">📝 '+d.notizen+'</div>';
        ke.innerHTML=h;
    }else{ke.innerHTML='';}

    var le=document.getElementById('spLog');
    le.innerHTML=sprachLogEntries.map(function(e){return '<div class="sp-log-entry">'+e+'</div>';}).join('');
    le.scrollTop=le.scrollHeight;
}

function addSprachLog(msg){
    var t=new Date().toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
    sprachLogEntries.push('<span style="color:#94a3b8">'+t+'</span> '+msg);
    if(sprachLogEntries.length>50)sprachLogEntries.shift();
}

// ============================================
// DURCHSICHT-MODAL.JS – Durchsicht erstellen/bearbeiten
// ============================================

var MODAL_STEPS = [
    {key:'volk', label:'Volk', icon:'🐝'},
    {key:'taetigkeit', label:'Tätigkeit', icon:'🔧'},
    {key:'bewertung', label:'Bewertung', icon:'⭐'},
    {key:'varroa', label:'Varroa', icon:'🔬'},
    {key:'koenigin', label:'Königin', icon:'👑'}
];

function openDurchsicht(id, volkId) {
    editDurchsicht = id || null;
    modalStep = 0;
    formData = {
        volkId: volkId || '', datum: new Date().toISOString().slice(0,10),
        taetigkeiten: [], kriterien: {},
        varroa: {milben:'', tage:'1', methode:'Puderzucker'},
        koenigin: {begattung:'', herkunft:'', belegstelle:'', nummer:'', markiert:false, farbe:'', jahrgang:new Date().getFullYear(), zuchtbuchNr:'', zuchtwerte:{}, muttervolk_id:'', drohnenvolk_id:''},
        notizen: ''
    };
    KRITERIEN.forEach(function(k){ formData.kriterien[k.key] = 3; });
    if (id) {
        var d = durchsichten.find(function(x){return x.id===id;});
        if (d) {
            formData.volkId = d.volkId; formData.datum = d.datum;
            formData.taetigkeiten = JSON.parse(JSON.stringify(d.taetigkeiten || []));
            formData.kriterien = Object.assign({}, d.kriterien);
            KRITERIEN.forEach(function(k){ if(!formData.kriterien[k.key]) formData.kriterien[k.key] = 3; });
            if (d.varroa) formData.varroa = Object.assign({}, d.varroa);
            formData.notizen = d.notizen || '';
        }
        document.getElementById('modalTitle').textContent = '✏️ Durchsicht bearbeiten';
    } else {
        document.getElementById('modalTitle').textContent = '📋 Neue Durchsicht';
    }
    var vId = formData.volkId || volkId;
    if (vId && koeniginnen[vId]) formData.koenigin = Object.assign({}, koeniginnen[vId]);
    renderModal();
    document.getElementById('durchsichtModal').classList.add('active');
    document.body.classList.add('modal-open');
}

function closeDurchsichtModal() {
    document.getElementById('durchsichtModal').classList.remove('active');
    document.body.classList.remove('modal-open');
}

function goToStep(idx) {
    if (idx > 0 && !formData.volkId) { toast('Bitte zuerst ein Volk wählen!'); return; }
    modalStep = idx; renderModal();
    document.getElementById('modalBody').scrollTop = 0;
}

function stepHasData(key) {
    if (key === 'volk') return !!formData.volkId;
    if (key === 'taetigkeit') return formData.taetigkeiten.length > 0;
    if (key === 'bewertung') return Object.keys(formData.kriterien).some(function(k){return formData.kriterien[k] !== 3;});
    if (key === 'varroa') return parseInt(formData.varroa.milben) > 0;
    if (key === 'koenigin') return !!formData.koenigin.begattung || !!formData.koenigin.zuchtbuchNr;
    return false;
}

function renderModal() {
    var html = '';
    // Stepper
    html += '<div style="display:flex;gap:.15rem;margin-bottom:1.25rem;background:#f5f0eb;border-radius:.75rem;padding:.25rem">';
    MODAL_STEPS.forEach(function(s, i) {
        var active = i === modalStep; var hasData = stepHasData(s.key);
        var bg = active ? '#fff' : 'transparent'; var color = active ? '#1C1410' : '#7A6652'; var fw = active ? '600' : '400';
        var shadow = active ? 'box-shadow:0 1px 3px rgba(0,0,0,.1);' : '';
        var dot = hasData && !active ? '<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#10b981;margin-left:3px;vertical-align:middle"></span>' : '';
        html += '<div onclick="goToStep(' + i + ')" style="flex:1;text-align:center;padding:.45rem .25rem;border-radius:.5rem;cursor:pointer;background:' + bg + ';color:' + color + ';font-weight:' + fw + ';font-size:.72rem;transition:all .15s;' + shadow + '">' + s.icon + '<br>' + s.label + dot + '</div>';
    });
    html += '</div>';
    var stepKey = MODAL_STEPS[modalStep].key;
    if (stepKey === 'volk') html += renderStepVolk();
    else if (stepKey === 'taetigkeit') html += renderStepTaetigkeit();
    else if (stepKey === 'bewertung') html += renderStepBewertung();
    else if (stepKey === 'varroa') html += renderStepVarroa();
    else if (stepKey === 'koenigin') html += renderStepKoenigin();
    // Notizen
    html += '<div style="margin-top:1.25rem;padding-top:.75rem;border-top:1px solid #E8DFD4"><div class="form-group" style="margin-bottom:0"><label class="form-label" style="font-size:.85rem">📝 Notizen</label><textarea class="input" rows="2" placeholder="Besonderheiten, Beobachtungen..." onchange="formData.notizen=this.value">' + (formData.notizen||'') + '</textarea></div></div>';
    document.getElementById('modalBody').innerHTML = html;
}

// === STEPS ===
function renderStepVolk() {
    var html = '<div class="form-group"><label class="form-label">Volk</label><select class="input" onchange="formData.volkId=this.value;if(koeniginnen[this.value])formData.koenigin=Object.assign({},koeniginnen[this.value]);else{formData.koenigin={begattung:\'\',herkunft:\'\',belegstelle:\'\',nummer:\'\',markiert:false,farbe:\'\',jahrgang:new Date().getFullYear(),zuchtbuchNr:\'\',zuchtwerte:{},muttervolk_id:\'\',drohnenvolk_id:\'\'}}">';
    html += '<option value="">-- Volk wählen --</option>';
    standorte.forEach(function(s) {
        var sV = voelker.filter(function(v){return v.standortId===s.id;}); if (!sV.length) return;
        html += '<optgroup label="📍 ' + s.name + '">';
        sV.forEach(function(v) { html += '<option value="' + v.id + '"' + (formData.volkId===v.id?' selected':'') + '>' + v.name + '</option>'; });
        html += '</optgroup>';
    });
    html += '</select></div>';
    html += '<div class="form-group"><label class="form-label">Datum</label><input type="date" class="input" value="' + formData.datum + '" onchange="formData.datum=this.value"></div>';
    return html;
}

function renderStepTaetigkeit() {
    var html = '<div class="taetig-grid">';
    TAETIGKEITEN.forEach(function(t) {
        var sel = formData.taetigkeiten.find(function(x){return x.key===t.key;});
        html += '<div class="taetig-chip ' + (sel?'selected':'') + '" onclick="toggleTaetigkeit(\'' + t.key + '\')"><span class="tc-icon">' + t.icon + '</span>' + t.label + '</div>';
    });
    html += '</div>';
    formData.taetigkeiten.forEach(function(sel) {
        var def = TAETIGKEITEN.find(function(x){return x.key===sel.key;}); if (!def) return;
        if (def.subs && def.subs.length) {
            html += '<div class="sub-options"><div style="font-size:.8rem;font-weight:600;margin-bottom:.35rem">' + def.icon + ' ' + def.label + ':</div>';
            def.subs.forEach(function(sub) { var isSel = (sel.subs||[]).indexOf(sub) > -1; html += '<span class="sub-chip ' + (isSel?'selected':'') + '" onclick="toggleSub(\'' + sel.key + '\',\'' + sub + '\')">' + sub + '</span>'; });
            html += '</div>';
        }
        if (def.menge) { html += '<div class="menge-row"><span class="menge-label">' + def.icon + ' Menge:</span><input type="number" class="menge-input" value="' + (sel.menge||'') + '" placeholder="0" step="0.1" onchange="setMenge(\'' + sel.key + '\',this.value)"><span class="menge-label">' + def.mengeUnit + '</span></div>'; }
    });
    return html;
}

function renderStepBewertung() {
    var html = '<div style="font-size:.75rem;color:#7A6652;margin-bottom:.75rem">Nur ausfüllen was sich geändert hat – Rest bleibt bei 3/5.</div>';
    html += '<div style="font-size:.7rem;font-weight:600;color:#A69580;text-transform:uppercase;letter-spacing:.06em;margin-bottom:.5rem">Zucht-Kriterien</div>';
    KRITERIEN_ALT.forEach(function(k){ html += renderKriteriumRow(k); });
    html += '<div style="font-size:.7rem;font-weight:600;color:#A69580;text-transform:uppercase;letter-spacing:.06em;margin:1rem 0 .5rem">Bestandsführung</div>';
    KRITERIEN_NEU.forEach(function(k){ html += renderKriteriumRow(k); });
    return html;
}

function renderKriteriumRow(k) {
    var val = formData.kriterien[k.key] || 3;
    var html = '<div style="margin-bottom:.75rem"><div style="display:flex;justify-content:space-between;align-items:center"><label style="font-size:.88rem;font-weight:500;color:#3D2E1F">' + k.label + '</label><span style="font-size:.75rem;color:#7A6652;font-weight:600">' + val + '/5</span></div>';
    html += '<div style="font-size:.68rem;color:#94a3b8;margin-bottom:.25rem">' + k.desc + '</div><div class="stars">';
    for (var i = 1; i <= 5; i++) { html += '<span class="star ' + (i<=val?'active':'') + '" onclick="formData.kriterien[\'' + k.key + '\']=' + i + ';renderModal()">★</span>'; }
    html += '</div></div>';
    return html;
}

function renderStepVarroa() {
    var html = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem">';
    html += '<div class="form-group" style="margin:0"><label class="form-label" style="font-size:.82rem">Milben gezählt</label><input type="number" class="input" value="' + (formData.varroa.milben||'') + '" placeholder="0" onchange="formData.varroa.milben=parseInt(this.value)||0;renderModal()"></div>';
    html += '<div class="form-group" style="margin:0"><label class="form-label" style="font-size:.82rem">Tage</label><input type="number" class="input" value="' + (formData.varroa.tage||'1') + '" placeholder="1" min="1" onchange="formData.varroa.tage=parseInt(this.value)||1;renderModal()"></div>';
    html += '</div>';
    html += '<div class="form-group" style="margin-top:.75rem;margin-bottom:.5rem"><label class="form-label" style="font-size:.82rem">Methode</label><select class="input" onchange="formData.varroa.methode=this.value">';
    ['Puderzucker','Windel','Alkoholwaschung','CO2','Sonstiges'].forEach(function(m) { html += '<option' + (formData.varroa.methode===m?' selected':'') + '>' + m + '</option>'; });
    html += '</select></div>';
    var milben = parseInt(formData.varroa.milben) || 0;
    if (milben > 0) {
        var tage = parseInt(formData.varroa.tage) || 1; var mProTag = (milben / tage).toFixed(1);
        var cls = mProTag <= 3 ? 'low' : (mProTag <= 10 ? 'medium' : (mProTag <= 20 ? 'high' : 'critical'));
        var label = mProTag <= 3 ? '🟢 Gering' : (mProTag <= 10 ? '🟡 Mittel' : (mProTag <= 20 ? '🟠 Hoch – behandeln!' : '🔴 Kritisch!'));
        html += '<div class="varroa-result ' + cls + '">' + mProTag + ' Milben/Tag</div><div style="text-align:center;font-size:.8rem;color:#7A6652">' + label + '</div>';
    }
    return html;
}

function renderStepKoenigin() {
    var html = '';
    html += '<div class="form-group" style="margin-bottom:.75rem"><label class="form-label" style="font-size:.82rem">Art der Begattung</label><select class="input" onchange="formData.koenigin.begattung=this.value"><option value="">-- wählen --</option>';
    ['Standbegattung','Belegstelle','Besamung'].forEach(function(b) { html += '<option' + (formData.koenigin.begattung===b?' selected':'') + '>' + b + '</option>'; });
    html += '</select></div>';
    html += '<div class="form-group" style="margin-bottom:.75rem"><label class="form-label" style="font-size:.82rem">Herkunft</label><select class="input" onchange="formData.koenigin.herkunft=this.value;renderModal()"><option value="">-- wählen --</option>';
    [{v:'eigene_aktiv',l:'Eigene Königin (aktives Volk)'},{v:'eigene_aufgeloest',l:'Eigene Königin (aufgelöstes Volk)'},{v:'fremde',l:'Fremde Königin'}].forEach(function(o) { html += '<option value="' + o.v + '"' + (formData.koenigin.herkunft===o.v?' selected':'') + '>' + o.l + '</option>'; });
    html += '</select></div>';
    if (formData.koenigin.herkunft === 'fremde') {
        html += '<div class="form-group" style="margin-bottom:.75rem"><label class="form-label" style="font-size:.82rem">Belegstelle / Quelle</label><input type="text" class="input" value="' + (formData.koenigin.belegstelle||'') + '" placeholder="z.B. Gebirgs-Belegstelle..." onchange="formData.koenigin.belegstelle=this.value"></div>';
        html += '<div class="form-group" style="margin-bottom:.75rem"><label class="form-label" style="font-size:.82rem">Nummer</label><input type="text" class="input" value="' + (formData.koenigin.nummer||'') + '" placeholder="z.B. K-2025-12" onchange="formData.koenigin.nummer=this.value"></div>';
    }
    // Abstammung
    html += '<div style="margin-top:.75rem;padding-top:.75rem;border-top:1px solid #E8DFD4"><h4 style="font-size:.88rem;color:#92400E;margin-bottom:.75rem;display:flex;align-items:center;gap:.35rem">🌳 Abstammung <span style="font-size:.65rem;color:#94a3b8;font-weight:400">für Stammbaum</span></h4>';
    html += '<div class="form-group" style="margin-bottom:.75rem"><label class="form-label" style="font-size:.82rem">Muttervolk</label><select class="input" onchange="formData.koenigin.muttervolk_id=this.value"><option value="">-- kein Muttervolk --</option>';
    voelker.forEach(function(v) { if (v.id === formData.volkId) return; var s = standorte.find(function(x){return x.id===v.standortId;}); html += '<option value="' + v.id + '"' + (formData.koenigin.muttervolk_id===v.id?' selected':'') + '>' + v.name + (s?' ('+s.name+')':'') + '</option>'; });
    html += '</select></div>';
    html += '<div class="form-group" style="margin-bottom:.75rem"><label class="form-label" style="font-size:.82rem">Drohnenvolk</label><select class="input" onchange="formData.koenigin.drohnenvolk_id=this.value"><option value="">-- kein Drohnenvolk --</option>';
    voelker.forEach(function(v) { if (v.id === formData.volkId) return; var s = standorte.find(function(x){return x.id===v.standortId;}); html += '<option value="' + v.id + '"' + (formData.koenigin.drohnenvolk_id===v.id?' selected':'') + '>' + v.name + (s?' ('+s.name+')':'') + '</option>'; });
    html += '</select></div></div>';
    // Jahrgang
    var currentYear = new Date().getFullYear();
    html += '<div class="form-group" style="margin-bottom:.75rem"><label class="form-label" style="font-size:.82rem">Jahrgang</label><select class="input" onchange="formData.koenigin.jahrgang=parseInt(this.value);autoSetFarbe();renderModal()">';
    for (var y = currentYear; y >= currentYear - 8; y--) { html += '<option value="' + y + '"' + (formData.koenigin.jahrgang==y?' selected':'') + '>' + y + ' – ' + getFarbeLabel(y) + '</option>'; }
    html += '</select></div>';
    // Markierung
    html += '<div style="display:flex;align-items:center;gap:.75rem;margin-bottom:.75rem"><label style="font-size:.85rem;font-weight:500">Königin markiert?</label>';
    html += '<label style="display:flex;align-items:center;gap:.35rem;cursor:pointer"><input type="checkbox" ' + (formData.koenigin.markiert?'checked':'') + ' onchange="formData.koenigin.markiert=this.checked;if(this.checked)autoSetFarbe();renderModal()" style="width:20px;height:20px;accent-color:#F5A623"> <span style="font-size:.85rem">' + (formData.koenigin.markiert?'Ja':'Nein') + '</span></label>';
    if (formData.koenigin.jahrgang) html += ' ' + getColorDot(getFarbeFromJahr(formData.koenigin.jahrgang));
    html += '</div>';
    if (formData.koenigin.markiert) {
        html += '<div style="margin-bottom:.75rem"><label class="form-label" style="font-size:.82rem">Farbe</label><div class="color-pills">';
        [{key:'weiss',label:'Weiß',endziffer:'1/6'},{key:'gelb',label:'Gelb',endziffer:'2/7'},{key:'rot',label:'Rot',endziffer:'3/8'},{key:'gruen',label:'Grün',endziffer:'4/9'},{key:'blau',label:'Blau',endziffer:'5/0'}].forEach(function(c) {
            html += '<div style="display:flex;flex-direction:column;align-items:center;gap:.2rem"><div class="color-pill c-' + c.key + ' ' + (formData.koenigin.farbe===c.key?'selected':'') + '" onclick="formData.koenigin.farbe=\'' + c.key + '\';renderModal()"></div><span style="font-size:.55rem;color:#7A6652">' + c.endziffer + '</span></div>';
        });
        html += '</div></div>';
    }
    // Zuchtwerte
    html += '<div style="margin-top:1rem;padding-top:.75rem;border-top:1px solid #E8DFD4"><h4 style="font-size:.88rem;color:#92400E;margin-bottom:.75rem">📊 BeeBreed Zuchtwerte <span style="font-size:.65rem;color:#94a3b8;font-weight:400">optional</span></h4>';
    html += '<div class="form-group" style="margin-bottom:.75rem"><label class="form-label" style="font-size:.82rem">Zuchtbuchnummer</label><input type="text" class="input" style="font-family:monospace" value="' + (formData.koenigin.zuchtbuchNr||'') + '" placeholder="z.B. DE-19-240-1-2024" onchange="formData.koenigin.zuchtbuchNr=this.value"></div>';
    var ZUCHTWERTE = [{key:'honig',label:'Honigleistung',icon:'🍯'},{key:'sanftmut',label:'Sanftmut',icon:'🤲'},{key:'wabensitz',label:'Wabensitz',icon:'🪵'},{key:'schwarm',label:'Schwarmneigung',icon:'🐝'},{key:'varroa',label:'Varroa-Index',icon:'🔬'},{key:'gesamt',label:'Gesamtzuchtwert',icon:'⭐'}];
    if (!formData.koenigin.zuchtwerte) formData.koenigin.zuchtwerte = {};
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem">';
    ZUCHTWERTE.forEach(function(zw) {
        var val = formData.koenigin.zuchtwerte[zw.key] || ''; var isGesamt = zw.key === 'gesamt';
        html += '<div class="form-group" style="margin-bottom:.35rem' + (isGesamt?';grid-column:1/-1':'') + '"><label style="font-size:.75rem;color:#7A6652;display:block;margin-bottom:.2rem">' + zw.icon + ' ' + zw.label + '</label><input type="number" class="input" style="padding:.5rem .75rem;font-size:.88rem' + (isGesamt?';font-weight:700;border-color:#F5A623':'') + '" value="' + val + '" placeholder="100" onchange="if(!formData.koenigin.zuchtwerte)formData.koenigin.zuchtwerte={};formData.koenigin.zuchtwerte[\'' + zw.key + '\']=parseInt(this.value)||null"></div>';
    });
    html += '</div><div style="font-size:.68rem;color:#94a3b8;margin-top:.25rem">100 = Populationsdurchschnitt.</div></div>';
    return html;
}

// === MODAL HELPERS ===
function toggleTaetigkeit(key) {
    var idx = formData.taetigkeiten.findIndex(function(x){return x.key===key;});
    if (idx > -1) formData.taetigkeiten.splice(idx, 1);
    else formData.taetigkeiten.push({key:key, subs:[], menge:null});
    renderModal();
}

function toggleSub(tKey, sub) {
    var t = formData.taetigkeiten.find(function(x){return x.key===tKey;}); if (!t) return;
    if (!t.subs) t.subs = [];
    var idx = t.subs.indexOf(sub);
    if (idx > -1) t.subs.splice(idx,1); else t.subs.push(sub);
    renderModal();
}

function setMenge(tKey, val) {
    var t = formData.taetigkeiten.find(function(x){return x.key===tKey;});
    if (t) t.menge = parseFloat(val) || null;
}

// === CRUD ===
async function saveDurchsicht() {
    var v = voelker.find(function(x){return x.id===formData.volkId;});
    var s = v ? standorte.find(function(x){return x.id===v.standortId;}) : null;
    var dbData = {
        volk_id: formData.volkId, volk_name: v ? v.name : '', standort_name: s ? s.name : '',
        datum: formData.datum, taetigkeiten: formData.taetigkeiten, kriterien: formData.kriterien,
        varroa: (parseInt(formData.varroa.milben) > 0) ? formData.varroa : null, notizen: formData.notizen
    };
    if (editDurchsicht) {
        var res = await sb.from('durchsichten').update(dbData).eq('id', editDurchsicht);
        if (res.error) { alert('Fehler: ' + res.error.message); return; }
        var idx = durchsichten.findIndex(function(x){return x.id===editDurchsicht;});
        if (idx > -1) {
            durchsichten[idx] = Object.assign({id:editDurchsicht, created:durchsichten[idx].created}, {
                volkId: formData.volkId, datum: formData.datum,
                taetigkeiten: JSON.parse(JSON.stringify(formData.taetigkeiten)),
                kriterien: Object.assign({}, formData.kriterien),
                varroa: dbData.varroa ? Object.assign({}, formData.varroa) : null,
                notizen: formData.notizen
            });
        }
        toast('✅ Durchsicht aktualisiert');
    } else {
        var id = crypto.randomUUID();
        dbData.id = id; dbData.user_id = currentUser.id;
        var res = await sb.from('durchsichten').insert(dbData);
        if (res.error) { alert('Fehler: ' + res.error.message); return; }
        durchsichten.unshift({
            id:id, volkId:formData.volkId, datum:formData.datum,
            taetigkeiten: JSON.parse(JSON.stringify(formData.taetigkeiten)),
            kriterien: Object.assign({}, formData.kriterien),
            varroa: dbData.varroa ? Object.assign({}, formData.varroa) : null,
            notizen: formData.notizen, created: new Date().toISOString()
        });
        toast('✅ Durchsicht gespeichert');
    }
    if (formData.koenigin.begattung) {
        koeniginnen[formData.volkId] = Object.assign({}, formData.koenigin);
        await sb.from('voelker').update({koenigin_info: formData.koenigin}).eq('id', formData.volkId);
    }
    closeDurchsichtModal(); render();
}

async function deleteDurchsicht(id) {
    if (!confirm('Durchsicht wirklich löschen?')) return;
    await sb.from('durchsichten').delete().eq('id', id);
    durchsichten = durchsichten.filter(function(d){return d.id!==id;});
    toast('🗑️ Gelöscht'); render();
}

async function deleteLegacyBewertung(id) {
    if (!confirm('Alte Bewertung wirklich löschen?')) return;
    await sb.from('bewertungen').delete().eq('id', id);
    bewertungen = bewertungen.filter(function(b){return b.id!==id;});
    toast('🗑️ Gelöscht'); render();
}

// ============================================
// voelker-durchsicht.js
// Durchsicht Tab + Durchsicht Modal (Inspection Protocol)
// All globals (standorte, voelker, durchsichten, bewertungen,
// koeniginnen, openVolkDetail, modalStep, editDurchsicht,
// formData, selectedStandortFilter, currentUser, sb,
// KRITERIEN, KRITERIEN_ALT, KRITERIEN_NEU, TAETIGKEITEN,
// render, toast, fmtDate, fmtDateShort, renderMiniStars,
// getColorDot, formatHerkunft, druckeStockkarte,
// getDurchsichtenFuerVolk, durchschnittKriterien,
// sortVoelkerNumerisch, autoSetFarbe, getFarbeFromJahr,
// getFarbeLabel) come from voelker-core.js / bewertung.html
// ============================================

// ============================================
// MODAL STEPS
// ============================================
var MODAL_STEPS = [
    {key:'volk', label:'Volk', icon:'🐝'},
    {key:'taetigkeit', label:'Tätigkeit', icon:'🔧'},
    {key:'bewertung', label:'Bewertung', icon:'⭐'},
    {key:'varroa', label:'Varroa', icon:'🔬'},
    {key:'koenigin', label:'Königin', icon:'👑'}
];

// ============================================
// TAB: DURCHSICHT
// ============================================
function renderDurchsicht() {
    var html = '';

    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">';
    html += '<h2 style="margin:0;font-size:1.1rem">📋 Durchsichtprotokoll</h2>';
    html += '<button class="btn btn-primary btn-sm" onclick="openDurchsicht()">+ Neue Durchsicht</button>';
    html += '</div>';

    // Standort-Filter übernehmen
    var anzuzeigende = selectedStandortFilter
        ? standorte.filter(function(s){return s.id===selectedStandortFilter;})
        : standorte;

    if (selectedStandortFilter) {
        var sName = standorte.find(function(s){return s.id===selectedStandortFilter;});
        html += '<div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.75rem;font-size:.85rem;color:#7A6652">';
        html += '<span>Filter: 📍 <strong>' + (sName?sName.name:'') + '</strong></span>';
        html += '<button onclick="selectedStandortFilter=\'\';render()" style="background:none;border:1px solid #E8DFD4;border-radius:.35rem;padding:.15rem .4rem;font-size:.72rem;cursor:pointer;color:#7A6652">✕ Alle zeigen</button>';
        html += '</div>';
    }

    anzuzeigende.forEach(function(s) {
        var sVoelker = sortVoelkerNumerisch(voelker.filter(function(v){return v.standortId===s.id;}));
        if (!sVoelker.length) return;

        html += '<div class="card">';
        html += '<h3 style="margin-bottom:.75rem;display:flex;align-items:center;gap:.5rem">';
        html += '📍 ' + s.name + ' <span style="font-size:.75rem;color:#7A6652;font-weight:400">(' + sVoelker.length + ' Völker)</span>';
        html += '</h3>';

        sVoelker.forEach(function(v) {
            var volkDs = getDurchsichtenFuerVolk(v.id);
            var letzte = volkDs.length ? volkDs[0] : null;
            var kInfo = koeniginnen[v.id];
            var isOpen = openVolkDetail === v.id;

            html += '<div style="border-bottom:1px solid #f5f0eb">';
            html += '<div class="volk-row-clickable" onclick="toggleVolkDetail(\'' + v.id + '\')">';
            html += '<div style="display:flex;justify-content:space-between;align-items:flex-start">';
            html += '<div style="flex:1">';
            html += '<div style="font-weight:600;font-size:.95rem;display:flex;align-items:center;gap:.35rem">🐝 ' + v.name;
            html += ' <span style="font-size:.7rem;color:#7A6652;transform:rotate(' + (isOpen?'90':'0') + 'deg);transition:transform .2s;display:inline-block">▶</span>';
            html += '</div>';

            if (kInfo) {
                var farbeIcon = kInfo.markiert ? getColorDot(kInfo.farbe) : '';
                html += '<div style="font-size:.72rem;color:#7A6652;margin-top:.15rem">';
                html += '👑 ' + (kInfo.jahrgang || '–') + ' · ' + (kInfo.begattung||'–');
                if (farbeIcon) html += ' · ' + farbeIcon;
                html += '</div>';
            }

            if (letzte) {
                var datum = fmtDate(letzte.datum);
                var schnitt = durchschnittKriterien(letzte.kriterien);
                var tags = (letzte.taetigkeiten||[]).map(function(t){
                    var def = TAETIGKEITEN.find(function(x){return x.key===t.key;});
                    return def ? def.icon : '📋';
                }).join(' ');
                html += '<div style="font-size:.75rem;color:#7A6652;margin-top:.2rem">';
                html += 'Letzte: ' + datum + ' · ' + renderMiniStars(schnitt) + ' ' + tags;
                if (letzte.varroa && letzte.varroa.milben) {
                    var mProTag = letzte.varroa.tage > 0 ? (letzte.varroa.milben / letzte.varroa.tage).toFixed(1) : '–';
                    html += ' · 🔬 ' + mProTag + ' M/Tag';
                }
                html += '</div>';
            } else {
                // Fallback: alte Bewertung anzeigen
                var alteBew = bewertungen.find(function(b){return b.volkId===v.id;});
                if (alteBew) {
                    html += '<div style="font-size:.75rem;color:#7A6652;margin-top:.2rem">Letzte Bewertung: ' + fmtDate(alteBew.datum) + '</div>';
                } else {
                    html += '<div style="font-size:.75rem;color:#94a3b8;margin-top:.2rem">Noch keine Durchsicht</div>';
                }
            }

            html += '</div>';
            html += '<div style="display:flex;gap:.25rem;flex-shrink:0;margin-left:.5rem" onclick="event.stopPropagation()">';
            html += '<button class="btn btn-primary btn-xs" onclick="openDurchsicht(null,\'' + v.id + '\')">📋</button>';
            if (letzte) html += '<button class="btn btn-blue btn-xs" onclick="openDurchsicht(\'' + letzte.id + '\')">✏️</button>';
            html += '</div>';
            html += '</div></div>';

            // Volk Detail View
            if (isOpen) {
                html += renderVolkDetail(v, volkDs, kInfo);
            }

            html += '</div>';
        });

        html += '</div>';
    });

    // Letzte Durchsichten
    if (durchsichten.length) {
        var sorted = durchsichten.slice().sort(function(a,b){return new Date(b.datum)-new Date(a.datum);});
        html += '<div class="card">';
        html += '<h3 style="margin-bottom:.75rem">📋 Letzte Durchsichten</h3>';
        sorted.slice(0,8).forEach(function(d) {
            var v = voelker.find(function(x){return x.id===d.volkId;});
            var tags = (d.taetigkeiten||[]).map(function(t){
                var def = TAETIGKEITEN.find(function(x){return x.key===t.key;});
                return '<span class="historie-tag">' + (def?def.icon+' '+def.label:'📋') + '</span>';
            }).join('');

            html += '<div class="historie-entry">';
            html += '<div style="display:flex;justify-content:space-between;align-items:flex-start">';
            html += '<div><div style="font-weight:500;font-size:.9rem">🐝 ' + (v?v.name:'–') + '</div>';
            html += '<div style="font-size:.72rem;color:#7A6652">' + fmtDate(d.datum) + '</div>';
            html += '<div class="historie-tags">' + tags + '</div>';
            if (d.notizen) html += '<div style="font-size:.75rem;color:#94a3b8;margin-top:.25rem">' + d.notizen + '</div>';
            html += '</div>';
            html += '<div style="display:flex;gap:.25rem">';
            html += '<button class="btn btn-blue btn-xs" onclick="openDurchsicht(\'' + d.id + '\')">✏️</button>';
            html += '<button class="btn btn-danger btn-xs" onclick="deleteDurchsicht(\'' + d.id + '\')">🗑️</button>';
            html += '</div></div></div>';
        });
        html += '</div>';
    }

    return html;
}

// ============================================
// VOLK DETAIL (inline aufklappbar)
// ============================================
function toggleVolkDetail(volkId) {
    openVolkDetail = openVolkDetail === volkId ? null : volkId;
    render();
}

function renderVolkDetail(v, volkDs, kInfo) {
    var html = '<div class="volk-detail">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem">';
    html += '<span style="font-size:.85rem;font-weight:600;color:#92400E">📖 Stockkarte: ' + v.name + '</span>';
    html += '<button onclick="event.stopPropagation();druckeStockkarte(\'' + v.id + '\')" class="btn btn-xs" style="background:#f5f0eb;color:#3D2E1F">🖨️ Drucken</button>';
    html += '</div>';

    // Königinnen-Info
    if (kInfo) {
        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:.35rem .75rem;font-size:.78rem;margin-bottom:.75rem;padding:.6rem;background:#fff;border-radius:.5rem">';
        html += '<div><span style="color:#7A6652">👑 Begattung:</span> <strong>' + (kInfo.begattung||'–') + '</strong></div>';
        html += '<div><span style="color:#7A6652">Herkunft:</span> <strong>' + formatHerkunft(kInfo.herkunft) + '</strong></div>';
        html += '<div><span style="color:#7A6652">Jahrgang:</span> <strong>' + (kInfo.jahrgang||'–') + '</strong></div>';
        html += '<div><span style="color:#7A6652">Markiert:</span> <strong>' + (kInfo.markiert?'Ja '+getColorDot(kInfo.farbe):'Nein') + '</strong></div>';
        if (kInfo.belegstelle) html += '<div style="grid-column:1/-1"><span style="color:#7A6652">Belegstelle:</span> <strong>' + kInfo.belegstelle + '</strong></div>';
        if (kInfo.nummer) html += '<div style="grid-column:1/-1"><span style="color:#7A6652">Nummer:</span> <strong>' + kInfo.nummer + '</strong></div>';
        html += '</div>';

        // BeeBreed Zuchtwertkarte
        if (kInfo.zuchtwerte && kInfo.zuchtbuchNr) {
            html += renderZuchtwertkarte(kInfo);
        }
    }

    // Mini-Verlaufschart
    var sorted = volkDs.slice().sort(function(a,b){return new Date(a.datum)-new Date(b.datum);});
    if (sorted.length > 1) {
        html += '<div style="margin-bottom:.75rem;padding:.6rem;background:#fff;border-radius:.5rem">';
        html += '<div style="font-size:.75rem;font-weight:600;color:#7A6652;margin-bottom:.35rem">📈 Verlauf</div>';
        var maxH = 60;
        html += '<div style="display:flex;align-items:end;gap:4px;height:' + maxH + 'px">';
        sorted.forEach(function(d) {
            var schnitt = durchschnittKriterien(d.kriterien);
            var h = Math.max(4, (schnitt/5)*maxH);
            var c = schnitt>=4?'#10b981':(schnitt>=3?'#F5A623':'#ef4444');
            html += '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:1px">';
            html += '<div style="font-size:.55rem;font-weight:600;color:#1C1410">' + schnitt.toFixed(1) + '</div>';
            html += '<div style="width:100%;height:' + h + 'px;background:' + c + ';border-radius:3px 3px 0 0"></div>';
            html += '<div style="font-size:.5rem;color:#7A6652">' + fmtDateShort(d.datum) + '</div>';
            html += '</div>';
        });
        html += '</div></div>';
    }

    // Alle Durchsichten
    var absteigend = volkDs.slice().sort(function(a,b){return new Date(b.datum)-new Date(a.datum);});
    if (!absteigend.length) {
        html += '<div style="text-align:center;padding:.75rem;color:#94a3b8;font-size:.85rem">Noch keine Durchsichten vorhanden.</div>';
    } else {
        html += '<div style="font-size:.75rem;font-weight:600;color:#7A6652;margin-bottom:.35rem">📋 Durchsichten (' + absteigend.length + ')</div>';
        absteigend.forEach(function(d) {
            var schnitt = durchschnittKriterien(d.kriterien);
            var tags = (d.taetigkeiten||[]).map(function(t) {
                var def = TAETIGKEITEN.find(function(x){return x.key===t.key;});
                var label = def ? def.icon + ' ' + def.label : t.key;
                if (t.subs && t.subs.length) label += ' (' + t.subs.join(', ') + ')';
                if (t.menge) label += ' ' + t.menge + (def&&def.mengeUnit?' '+def.mengeUnit:'');
                return '<span class="historie-tag">' + label + '</span>';
            }).join('');

            html += '<div style="padding:.5rem;background:#fff;border-radius:.5rem;margin-bottom:.35rem">';
            html += '<div style="display:flex;justify-content:space-between;align-items:flex-start">';
            html += '<div style="flex:1">';
            html += '<div style="font-weight:600;font-size:.82rem">' + fmtDate(d.datum) + ' ' + renderMiniStars(schnitt) + ' <span style="color:#7A6652;font-size:.75rem">(' + schnitt.toFixed(1) + ')</span></div>';
            html += '<div class="historie-tags" style="margin-top:.2rem">' + tags + '</div>';
            if (d.varroa && d.varroa.milben) {
                var mProTag = d.varroa.tage > 0 ? (d.varroa.milben / d.varroa.tage).toFixed(1) : '–';
                var vClass = mProTag <= 3 ? 'badge-green' : (mProTag <= 10 ? 'badge-yellow' : 'badge-red');
                html += '<div style="margin-top:.2rem"><span class="badge ' + vClass + '" style="font-size:.6rem">🔬 ' + mProTag + ' M/Tag (' + d.varroa.methode + ')</span></div>';
            }
            if (d.notizen) html += '<div style="font-size:.72rem;color:#94a3b8;margin-top:.2rem">' + d.notizen + '</div>';
            html += '</div>';
            html += '<div style="display:flex;gap:.2rem;flex-shrink:0;margin-left:.35rem" onclick="event.stopPropagation()">';
            html += '<button class="btn btn-blue btn-xs" style="padding:.3rem .5rem;font-size:.7rem" onclick="openDurchsicht(\'' + d.id + '\')">✏️</button>';
            html += '<button class="btn btn-danger btn-xs" style="padding:.3rem .5rem;font-size:.7rem" onclick="deleteDurchsicht(\'' + d.id + '\')">🗑️</button>';
            html += '</div></div></div>';
        });
    }

    html += '<button class="btn btn-primary btn-sm" style="width:100%;margin-top:.5rem" onclick="event.stopPropagation();openDurchsicht(null,\'' + v.id + '\')">+ Neue Durchsicht</button>';
    html += '</div>';
    return html;
}

// ============================================
// DURCHSICHT MODAL
// ============================================
function openDurchsicht(id, volkId) {
    editDurchsicht = id || null;
    modalStep = 0;

    formData = {
        volkId: volkId || '',
        datum: new Date().toISOString().slice(0,10),
        taetigkeiten: [],
        kriterien: {},
        varroa: {milben:'', tage:'1', methode:'Puderzucker'},
        koenigin: {begattung:'', herkunft:'', belegstelle:'', nummer:'', markiert:false, farbe:'', jahrgang:new Date().getFullYear(), zuchtbuchNr:'', zuchtwerte:{}, muttervolk_id:'', drohnenvolk_id:''},
        notizen: ''
    };
    KRITERIEN.forEach(function(k){ formData.kriterien[k.key] = 3; });

    if (id) {
        var d = durchsichten.find(function(x){return x.id===id;});
        if (d) {
            formData.volkId = d.volkId;
            formData.datum = d.datum;
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
    if (vId && koeniginnen[vId]) {
        formData.koenigin = Object.assign({}, koeniginnen[vId]);
    }

    renderModal();
    document.getElementById('durchsichtModal').classList.add('active');
    document.body.classList.add('modal-open');
}

function closeDurchsichtModal() {
    document.getElementById('durchsichtModal').classList.remove('active');
    document.body.classList.remove('modal-open');
}

function goToStep(idx) {
    if (idx > 0 && !formData.volkId) {
        toast('Bitte zuerst ein Volk wählen!');
        return;
    }
    modalStep = idx;
    renderModal();
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

    // === STEPPER PUNKTE (klickbar) ===
    html += '<div style="display:flex;gap:.15rem;margin-bottom:1.25rem;background:#f5f0eb;border-radius:.75rem;padding:.25rem">';
    MODAL_STEPS.forEach(function(s, i) {
        var active = i === modalStep;
        var hasData = stepHasData(s.key);
        var bg = active ? '#fff' : 'transparent';
        var color = active ? '#1C1410' : '#7A6652';
        var fw = active ? '600' : '400';
        var shadow = active ? 'box-shadow:0 1px 3px rgba(0,0,0,.1);' : '';
        var dot = hasData && !active ? '<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#10b981;margin-left:3px;vertical-align:middle"></span>' : '';
        html += '<div onclick="goToStep(' + i + ')" style="flex:1;text-align:center;padding:.45rem .25rem;border-radius:.5rem;cursor:pointer;background:' + bg + ';color:' + color + ';font-weight:' + fw + ';font-size:.72rem;transition:all .15s;' + shadow + '">';
        html += s.icon + '<br>' + s.label + dot + '</div>';
    });
    html += '</div>';

    // === AKTIVE SEKTION ===
    var stepKey = MODAL_STEPS[modalStep].key;
    if (stepKey === 'volk') html += renderStepVolk();
    else if (stepKey === 'taetigkeit') html += renderStepTaetigkeit();
    else if (stepKey === 'bewertung') html += renderStepBewertung();
    else if (stepKey === 'varroa') html += renderStepVarroa();
    else if (stepKey === 'koenigin') html += renderStepKoenigin();

    // === NOTIZEN (immer sichtbar) ===
    html += '<div style="margin-top:1.25rem;padding-top:.75rem;border-top:1px solid #E8DFD4">';
    html += '<div class="form-group" style="margin-bottom:0">';
    html += '<label class="form-label" style="font-size:.85rem">📝 Notizen</label>';
    html += '<textarea class="input" rows="2" placeholder="Besonderheiten, Beobachtungen..." onchange="formData.notizen=this.value">' + (formData.notizen||'') + '</textarea>';
    html += '</div></div>';

    document.getElementById('modalBody').innerHTML = html;
}

// ============================================
// STEP: VOLK & DATUM
// ============================================
function renderStepVolk() {
    var html = '';
    html += '<div class="form-group">';
    html += '<label class="form-label">Volk</label>';
    html += '<select class="input" onchange="formData.volkId=this.value;if(koeniginnen[this.value])formData.koenigin=Object.assign({},koeniginnen[this.value]);else{formData.koenigin={begattung:\'\',herkunft:\'\',belegstelle:\'\',nummer:\'\',markiert:false,farbe:\'\',jahrgang:new Date().getFullYear(),zuchtbuchNr:\'\',zuchtwerte:{},muttervolk_id:\'\',drohnenvolk_id:\'\'}}">';
    html += '<option value="">-- Volk wählen --</option>';
    standorte.forEach(function(s) {
        var sV = voelker.filter(function(v){return v.standortId===s.id;});
        if (!sV.length) return;
        html += '<optgroup label="📍 ' + s.name + '">';
        sV.forEach(function(v) {
            html += '<option value="' + v.id + '"' + (formData.volkId===v.id?' selected':'') + '>' + v.name + '</option>';
        });
        html += '</optgroup>';
    });
    html += '</select></div>';

    html += '<div class="form-group">';
    html += '<label class="form-label">Datum</label>';
    html += '<input type="date" class="input" value="' + formData.datum + '" onchange="formData.datum=this.value">';
    html += '</div>';

    return html;
}

// ============================================
// STEP: TÄTIGKEITEN
// ============================================
function renderStepTaetigkeit() {
    var html = '';
    html += '<div class="taetig-grid">';
    TAETIGKEITEN.forEach(function(t) {
        var sel = formData.taetigkeiten.find(function(x){return x.key===t.key;});
        html += '<div class="taetig-chip ' + (sel?'selected':'') + '" onclick="toggleTaetigkeit(\'' + t.key + '\')">';
        html += '<span class="tc-icon">' + t.icon + '</span>' + t.label + '</div>';
    });
    html += '</div>';

    formData.taetigkeiten.forEach(function(sel) {
        var def = TAETIGKEITEN.find(function(x){return x.key===sel.key;});
        if (!def) return;
        if (def.subs && def.subs.length) {
            html += '<div class="sub-options">';
            html += '<div style="font-size:.8rem;font-weight:600;margin-bottom:.35rem">' + def.icon + ' ' + def.label + ':</div>';
            def.subs.forEach(function(sub) {
                var isSel = (sel.subs||[]).indexOf(sub) > -1;
                html += '<span class="sub-chip ' + (isSel?'selected':'') + '" onclick="toggleSub(\'' + sel.key + '\',\'' + sub + '\')">' + sub + '</span>';
            });
            html += '</div>';
        }
        if (def.menge) {
            html += '<div class="menge-row">';
            html += '<span class="menge-label">' + def.icon + ' Menge:</span>';
            html += '<input type="number" class="menge-input" value="' + (sel.menge||'') + '" placeholder="0" step="0.1" onchange="setMenge(\'' + sel.key + '\',this.value)">';
            html += '<span class="menge-label">' + def.mengeUnit + '</span></div>';
        }
    });

    return html;
}

// ============================================
// STEP: BEWERTUNG
// ============================================
function renderStepBewertung() {
    var html = '';
    html += '<div style="font-size:.75rem;color:#7A6652;margin-bottom:.75rem">Nur ausfüllen was sich geändert hat – Rest bleibt bei 3/5.</div>';

    html += '<div style="font-size:.7rem;font-weight:600;color:#A69580;text-transform:uppercase;letter-spacing:.06em;margin-bottom:.5rem">Zucht-Kriterien</div>';
    KRITERIEN_ALT.forEach(function(k){ html += renderKriteriumRow(k); });

    html += '<div style="font-size:.7rem;font-weight:600;color:#A69580;text-transform:uppercase;letter-spacing:.06em;margin:1rem 0 .5rem">Bestandsführung</div>';
    KRITERIEN_NEU.forEach(function(k){ html += renderKriteriumRow(k); });
    return html;
}

function renderKriteriumRow(k) {
    var val = formData.kriterien[k.key] || 3;
    var html = '<div style="margin-bottom:.75rem">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center">';
    html += '<label style="font-size:.88rem;font-weight:500;color:#3D2E1F">' + k.label + '</label>';
    html += '<span style="font-size:.75rem;color:#7A6652;font-weight:600">' + val + '/5</span></div>';
    html += '<div style="font-size:.68rem;color:#94a3b8;margin-bottom:.25rem">' + k.desc + '</div>';
    html += '<div class="stars">';
    for (var i = 1; i <= 5; i++) {
        html += '<span class="star ' + (i<=val?'active':'') + '" onclick="formData.kriterien[\'' + k.key + '\']=' + i + ';renderModal()">★</span>';
    }
    html += '</div></div>';
    return html;
}

// ============================================
// STEP: VARROA
// ============================================
function renderStepVarroa() {
    var html = '';
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem">';
    html += '<div class="form-group" style="margin:0"><label class="form-label" style="font-size:.82rem">Milben gezählt</label>';
    html += '<input type="number" class="input" value="' + (formData.varroa.milben||'') + '" placeholder="0" onchange="formData.varroa.milben=parseInt(this.value)||0;renderModal()"></div>';
    html += '<div class="form-group" style="margin:0"><label class="form-label" style="font-size:.82rem">Tage</label>';
    html += '<input type="number" class="input" value="' + (formData.varroa.tage||'1') + '" placeholder="1" min="1" onchange="formData.varroa.tage=parseInt(this.value)||1;renderModal()"></div>';
    html += '</div>';
    html += '<div class="form-group" style="margin-top:.75rem;margin-bottom:.5rem"><label class="form-label" style="font-size:.82rem">Methode</label>';
    html += '<select class="input" onchange="formData.varroa.methode=this.value">';
    ['Puderzucker','Windel','Alkoholwaschung','CO2','Sonstiges'].forEach(function(m) {
        html += '<option' + (formData.varroa.methode===m?' selected':'') + '>' + m + '</option>';
    });
    html += '</select></div>';

    var milben = parseInt(formData.varroa.milben) || 0;
    var tage = parseInt(formData.varroa.tage) || 1;
    if (milben > 0) {
        var mProTag = (milben / tage).toFixed(1);
        var cls = mProTag <= 3 ? 'low' : (mProTag <= 10 ? 'medium' : (mProTag <= 20 ? 'high' : 'critical'));
        var label = mProTag <= 3 ? '🟢 Gering' : (mProTag <= 10 ? '🟡 Mittel' : (mProTag <= 20 ? '🟠 Hoch – behandeln!' : '🔴 Kritisch!'));
        html += '<div class="varroa-result ' + cls + '">' + mProTag + ' Milben/Tag</div>';
        html += '<div style="text-align:center;font-size:.8rem;color:#7A6652">' + label + '</div>';
    }

    return html;
}

// ============================================
// STEP: KÖNIGIN
// ============================================
function renderStepKoenigin() {
    var html = '';
    html += '<div class="form-group" style="margin-bottom:.75rem"><label class="form-label" style="font-size:.82rem">Art der Begattung</label>';
    html += '<select class="input" onchange="formData.koenigin.begattung=this.value"><option value="">-- wählen --</option>';
    ['Standbegattung','Belegstelle','Besamung'].forEach(function(b) {
        html += '<option' + (formData.koenigin.begattung===b?' selected':'') + '>' + b + '</option>';
    });
    html += '</select></div>';

    html += '<div class="form-group" style="margin-bottom:.75rem"><label class="form-label" style="font-size:.82rem">Herkunft</label>';
    html += '<select class="input" onchange="formData.koenigin.herkunft=this.value;renderModal()"><option value="">-- wählen --</option>';
    [{v:'eigene_aktiv',l:'Eigene Königin (aktives Volk)'},{v:'eigene_aufgeloest',l:'Eigene Königin (aufgelöstes Volk)'},{v:'fremde',l:'Fremde Königin'}].forEach(function(o) {
        html += '<option value="' + o.v + '"' + (formData.koenigin.herkunft===o.v?' selected':'') + '>' + o.l + '</option>';
    });
    html += '</select></div>';

    if (formData.koenigin.herkunft === 'fremde') {
        html += '<div class="form-group" style="margin-bottom:.75rem"><label class="form-label" style="font-size:.82rem">Belegstelle / Quelle</label>';
        html += '<input type="text" class="input" value="' + (formData.koenigin.belegstelle||'') + '" placeholder="z.B. Gebirgs-Belegstelle..." onchange="formData.koenigin.belegstelle=this.value"></div>';
        html += '<div class="form-group" style="margin-bottom:.75rem"><label class="form-label" style="font-size:.82rem">Nummer</label>';
        html += '<input type="text" class="input" value="' + (formData.koenigin.nummer||'') + '" placeholder="z.B. K-2025-12" onchange="formData.koenigin.nummer=this.value"></div>';
    }

    // === Abstammung (Muttervolk & Drohnenvolk) ===
    html += '<div style="margin-top:.75rem;padding-top:.75rem;border-top:1px solid #E8DFD4">';
    html += '<h4 style="font-size:.88rem;color:#92400E;margin-bottom:.75rem;display:flex;align-items:center;gap:.35rem">🌳 Abstammung <span style="font-size:.65rem;color:#94a3b8;font-weight:400">für Stammbaum</span></h4>';

    html += '<div class="form-group" style="margin-bottom:.75rem"><label class="form-label" style="font-size:.82rem">Muttervolk (Königin stammt von)</label>';
    html += '<select class="input" onchange="formData.koenigin.muttervolk_id=this.value"><option value="">-- kein Muttervolk --</option>';
    voelker.forEach(function(v) {
        if (v.id === formData.volkId) return;
        var s = standorte.find(function(x){return x.id===v.standortId;});
        html += '<option value="' + v.id + '"' + (formData.koenigin.muttervolk_id===v.id?' selected':'') + '>' + v.name + (s?' ('+s.name+')':'') + '</option>';
    });
    html += '</select></div>';

    html += '<div class="form-group" style="margin-bottom:.75rem"><label class="form-label" style="font-size:.82rem">Drohnenvolk (Vater-Seite)</label>';
    html += '<select class="input" onchange="formData.koenigin.drohnenvolk_id=this.value"><option value="">-- kein Drohnenvolk --</option>';
    voelker.forEach(function(v) {
        if (v.id === formData.volkId) return;
        var s = standorte.find(function(x){return x.id===v.standortId;});
        html += '<option value="' + v.id + '"' + (formData.koenigin.drohnenvolk_id===v.id?' selected':'') + '>' + v.name + (s?' ('+s.name+')':'') + '</option>';
    });
    html += '</select></div>';
    html += '</div>';

    // Jahrgang (immer sichtbar – jede Königin hat einen Jahrgang)
    var currentYear = new Date().getFullYear();
    html += '<div class="form-group" style="margin-bottom:.75rem"><label class="form-label" style="font-size:.82rem">Jahrgang</label>';
    html += '<select class="input" onchange="formData.koenigin.jahrgang=parseInt(this.value);autoSetFarbe();renderModal()">';
    for (var y = currentYear; y >= currentYear - 8; y--) {
        html += '<option value="' + y + '"' + (formData.koenigin.jahrgang==y?' selected':'') + '>' + y + ' – ' + getFarbeLabel(y) + '</option>';
    }
    html += '</select></div>';

    // Markierung
    html += '<div style="display:flex;align-items:center;gap:.75rem;margin-bottom:.75rem">';
    html += '<label style="font-size:.85rem;font-weight:500">Königin markiert?</label>';
    html += '<label style="display:flex;align-items:center;gap:.35rem;cursor:pointer"><input type="checkbox" ' + (formData.koenigin.markiert?'checked':'') + ' onchange="formData.koenigin.markiert=this.checked;if(this.checked)autoSetFarbe();renderModal()" style="width:20px;height:20px;accent-color:#F5A623"> <span style="font-size:.85rem">' + (formData.koenigin.markiert?'Ja':'Nein') + '</span></label>';
    if (formData.koenigin.jahrgang) {
        var autoFarbe = getFarbeFromJahr(formData.koenigin.jahrgang);
        html += ' ' + getColorDot(autoFarbe);
    }
    html += '</div>';

    if (formData.koenigin.markiert) {
        // Farbpunkte (vorausgewählt nach Jahrgang, manuell änderbar)
        html += '<div style="margin-bottom:.75rem">';
        html += '<label class="form-label" style="font-size:.82rem">Farbe <span style="font-size:.68rem;color:#94a3b8;font-weight:400">automatisch nach Jahrgang – klick zum Ändern</span></label>';
        html += '<div class="color-pills">';
        [{key:'weiss',label:'Weiß',endziffer:'1/6'},{key:'gelb',label:'Gelb',endziffer:'2/7'},{key:'rot',label:'Rot',endziffer:'3/8'},{key:'gruen',label:'Grün',endziffer:'4/9'},{key:'blau',label:'Blau',endziffer:'5/0'}].forEach(function(c) {
            html += '<div style="display:flex;flex-direction:column;align-items:center;gap:.2rem">';
            html += '<div class="color-pill c-' + c.key + ' ' + (formData.koenigin.farbe===c.key?'selected':'') + '" onclick="formData.koenigin.farbe=\'' + c.key + '\';renderModal()"></div>';
            html += '<span style="font-size:.55rem;color:#7A6652">' + c.endziffer + '</span></div>';
        });
        html += '</div></div>';
    }

    // === BeeBreed Zuchtwerte ===
    html += '<div style="margin-top:1rem;padding-top:.75rem;border-top:1px solid #E8DFD4">';
    html += '<h4 style="font-size:.88rem;color:#92400E;margin-bottom:.75rem;display:flex;align-items:center;gap:.35rem">📊 BeeBreed Zuchtwerte <span style="font-size:.65rem;color:#94a3b8;font-weight:400">optional</span></h4>';

    html += '<div class="form-group" style="margin-bottom:.75rem"><label class="form-label" style="font-size:.82rem">Zuchtbuchnummer</label>';
    html += '<input type="text" class="input" style="font-family:monospace" value="' + (formData.koenigin.zuchtbuchNr||'') + '" placeholder="z.B. DE-19-240-1-2024" onchange="formData.koenigin.zuchtbuchNr=this.value"></div>';

    // Zuchtwerte-Tabelle
    var ZUCHTWERTE = [
        {key:'honig', label:'Honigleistung', icon:'🍯'},
        {key:'sanftmut', label:'Sanftmut', icon:'🤲'},
        {key:'wabensitz', label:'Wabensitz', icon:'🪵'},
        {key:'schwarm', label:'Schwarmneigung', icon:'🐝'},
        {key:'varroa', label:'Varroa-Index', icon:'🔬'},
        {key:'gesamt', label:'Gesamtzuchtwert', icon:'⭐'}
    ];

    if (!formData.koenigin.zuchtwerte) formData.koenigin.zuchtwerte = {};

    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem">';
    ZUCHTWERTE.forEach(function(zw) {
        var val = formData.koenigin.zuchtwerte[zw.key] || '';
        var isGesamt = zw.key === 'gesamt';
        html += '<div class="form-group" style="margin-bottom:.35rem' + (isGesamt?';grid-column:1/-1':'') + '">';
        html += '<label style="font-size:.75rem;color:#7A6652;display:block;margin-bottom:.2rem">' + zw.icon + ' ' + zw.label + '</label>';
        html += '<input type="number" class="input" style="padding:.5rem .75rem;font-size:.88rem' + (isGesamt?';font-weight:700;border-color:#F5A623':'') + '" value="' + val + '" placeholder="100" onchange="if(!formData.koenigin.zuchtwerte)formData.koenigin.zuchtwerte={};formData.koenigin.zuchtwerte[\'' + zw.key + '\']=parseInt(this.value)||null">';
        html += '</div>';
    });
    html += '</div>';

    html += '<div style="font-size:.68rem;color:#94a3b8;margin-top:.25rem">100 = Populationsdurchschnitt. Werte aus BeeBreed-Zuchtbuchblatt übernehmen.</div>';
    html += '</div>';

    return html;
}

// ============================================
// MODAL HELPERS
// ============================================
function toggleTaetigkeit(key) {
    var idx = formData.taetigkeiten.findIndex(function(x){return x.key===key;});
    if (idx > -1) formData.taetigkeiten.splice(idx, 1);
    else formData.taetigkeiten.push({key:key, subs:[], menge:null});
    renderModal();
}

function toggleSub(tKey, sub) {
    var t = formData.taetigkeiten.find(function(x){return x.key===tKey;});
    if (!t) return;
    if (!t.subs) t.subs = [];
    var idx = t.subs.indexOf(sub);
    if (idx > -1) t.subs.splice(idx,1);
    else t.subs.push(sub);
    renderModal();
}

function setMenge(tKey, val) {
    var t = formData.taetigkeiten.find(function(x){return x.key===tKey;});
    if (t) t.menge = parseFloat(val) || null;
}

// ============================================
// CRUD
// ============================================
async function saveDurchsicht() {
    var v = voelker.find(function(x){return x.id===formData.volkId;});
    var s = v ? standorte.find(function(x){return x.id===v.standortId;}) : null;

    var dbData = {
        volk_id: formData.volkId,
        volk_name: v ? v.name : '',
        standort_name: s ? s.name : '',
        datum: formData.datum,
        taetigkeiten: formData.taetigkeiten,
        kriterien: formData.kriterien,
        varroa: (parseInt(formData.varroa.milben) > 0) ? formData.varroa : null,
        notizen: formData.notizen
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
        dbData.id = id;
        dbData.user_id = currentUser.id;
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

    // Königin-Info speichern (in voelker-Tabelle als JSON)
    if (formData.koenigin.begattung) {
        koeniginnen[formData.volkId] = Object.assign({}, formData.koenigin);
        await sb.from('voelker').update({koenigin_info: formData.koenigin}).eq('id', formData.volkId);
    }

    closeDurchsichtModal();
    render();
}

async function deleteDurchsicht(id) {
    if (!confirm('Durchsicht wirklich löschen?')) return;
    await sb.from('durchsichten').delete().eq('id', id);
    durchsichten = durchsichten.filter(function(d){return d.id!==id;});
    toast('🗑️ Gelöscht');
    render();
}

async function deleteLegacyBewertung(id) {
    if (!confirm('Alte Bewertung wirklich löschen?')) return;
    await sb.from('bewertungen').delete().eq('id', id);
    bewertungen = bewertungen.filter(function(b){return b.id!==id;});
    toast('🗑️ Gelöscht');
    render();
}

// ============================================
// HELPER: BeeBreed Zuchtwertkarte
// ============================================
function renderZuchtwertkarte(kInfo) {
    var zw = kInfo.zuchtwerte;
    if (!zw) return '';
    var html = '<div class="zw-card">';
    html += '<h4>📊 BeeBreed Zuchtwerte</h4>';
    if (kInfo.zuchtbuchNr) html += '<div class="zw-nr">' + kInfo.zuchtbuchNr + '</div>';

    var felder = [
        {key:'gesamt', label:'Gesamt', icon:'⭐'},
        {key:'honig', label:'Honig', icon:'🍯'},
        {key:'sanftmut', label:'Sanftmut', icon:'🤲'},
        {key:'wabensitz', label:'Wabensitz', icon:'🪵'},
        {key:'schwarm', label:'Schwarm', icon:'🐝'},
        {key:'varroa', label:'Varroa', icon:'🔬'}
    ];

    felder.forEach(function(f) {
        var val = zw[f.key];
        if (!val && val !== 0) return;
        var pct = Math.max(0, Math.min(100, ((val - 70) / 60) * 100)); // 70-130 range -> 0-100%
        var color = val >= 110 ? '#10b981' : (val >= 100 ? '#F5A623' : (val >= 90 ? '#f59e0b' : '#ef4444'));
        var isGesamt = f.key === 'gesamt';

        html += '<div class="zw-row" style="' + (isGesamt?'font-weight:700;margin-top:.25rem;padding-top:.35rem;border-top:1px solid #E8DFD4':'') + '">';
        html += '<span class="zw-label">' + f.icon + ' ' + f.label + '</span>';
        html += '<span class="zw-value" style="color:' + color + '">' + val + '</span>';
        html += '<div class="zw-bar-bg"><div class="zw-bar-ref"></div><div class="zw-bar-fill" style="width:' + pct + '%;background:' + color + '"></div></div>';
        html += '</div>';
    });

    html += '</div>';
    return html;
}

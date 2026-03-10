// ============================================
// STOCKKARTE-VIEW.JS – Völker-Tab, Durchsicht-Tab, Volk-Detail, Suche
// ============================================

// === TAB: VÖLKER (Übersicht) ===
function renderVoelkerTab() {
    var html = '';
    if (!standorte.length) {
        html += '<div class="card" style="text-align:center;padding:3rem;color:#7A6652"><div style="font-size:3rem;margin-bottom:1rem">📍</div><h3>Keine Standorte vorhanden</h3><p style="margin-top:.5rem">Lege zuerst Standorte und Völker unter <span style="color:#F5A623;font-weight:600;cursor:pointer" onclick="switchTab(\'standorte\')">📍 Standorte</span> an.</p></div>';
        return html;
    }
    // Standort-Filter Kacheln
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:.75rem;margin-bottom:1rem">';
    html += '<div class="standort-card' + (!selectedStandortFilter?' selected':'') + '" onclick="selectedStandortFilter=\'\';render()"><div style="font-size:1.5rem;margin-bottom:.25rem">🐝</div><div style="font-weight:600;font-size:.85rem">Alle Völker</div><div style="font-size:.75rem;color:#7A6652">' + voelker.length + ' Völker</div></div>';
    standorte.forEach(function(s) {
        var cnt = voelker.filter(function(v){return v.standortId===s.id;}).length;
        if (!cnt) return;
        html += '<div class="standort-card' + (selectedStandortFilter===s.id?' selected':'') + '" onclick="selectedStandortFilter=\'' + s.id + '\';render()"><div style="font-size:1.5rem;margin-bottom:.25rem">📍</div><div style="font-weight:600;font-size:.85rem">' + s.name + '</div><div style="font-size:.75rem;color:#7A6652">' + cnt + ' Völker</div>';
        html += '<button onclick="event.stopPropagation();druckeAlleQR(\'' + s.id + '\')" style="background:none;border:1px solid #E8DFD4;border-radius:.5rem;padding:.25rem .5rem;cursor:pointer;font-size:.75rem;color:#7A6652;margin-top:.35rem" title="Alle QR-Codes drucken">🏷️ QR-Etiketten</button></div>';
    });
    html += '</div>';
    // Völker-Grid
    var filteredVoelker = sortVoelkerNumerisch(selectedStandortFilter ? voelker.filter(function(v){return v.standortId===selectedStandortFilter;}) : voelker);
    if (!filteredVoelker.length) { html += '<div class="card" style="text-align:center;padding:2rem;color:#7A6652">Keine Völker an diesem Standort.</div>'; return html; }
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:.75rem">';
    filteredVoelker.forEach(function(v) { html += renderVolkKarte(v); });
    html += '</div>';
    return html;
}

function renderVolkKarte(v) {
    var s = standorte.find(function(x){return x.id===v.standortId;});
    var kInfo = koeniginnen[v.id] || {};
    var volkDs = getDurchsichtenFuerVolk(v.id);
    var letzte = volkDs.length ? volkDs[0] : null;
    var html = '<div class="volk-grid-card" onclick="goToVolk(\'' + v.id + '\')" style="cursor:pointer">';
    html += '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.5rem"><div>';
    if (v.typ === 'ableger') html += '<span style="font-size:.65rem;background:#D1FAE5;color:#065F46;padding:.1rem .4rem;border-radius:.25rem;font-weight:600;display:inline-block;margin-bottom:.2rem">🌱 Ableger</span>';
    html += '<div style="font-weight:700;font-size:1rem">🐝 ' + v.name + '</div>';
    if (s) html += '<div style="font-size:.72rem;color:#7A6652">📍 ' + s.name + '</div>';
    html += '</div>';
    if (kInfo.jahrgang) { html += '<span style="font-size:.75rem;background:#FFF8EE;padding:.15rem .5rem;border-radius:.25rem;color:#92400E;white-space:nowrap">👑 ' + kInfo.jahrgang + ' ' + (kInfo.markiert?getColorDot(kInfo.farbe):'') + '</span>'; }
    html += '</div>';
    if (kInfo.begattung) { html += '<div style="font-size:.75rem;color:#7A6652;margin-bottom:.35rem">' + [kInfo.begattung, kInfo.zuchtbuchNr?'Nr: '+kInfo.zuchtbuchNr:''].filter(Boolean).join(' · ') + '</div>'; }
    if (kInfo.muttervolk_id || kInfo.drohnenvolk_id) {
        html += '<div style="font-size:.72rem;color:#92400E;background:#FFFBF0;padding:.3rem .5rem;border-radius:.35rem;margin-bottom:.35rem">';
        if (kInfo.muttervolk_id) { var mv = voelker.find(function(x){return x.id===kInfo.muttervolk_id;}); if (mv) html += '👑 ' + mv.name + ' '; }
        if (kInfo.drohnenvolk_id) { var dv = voelker.find(function(x){return x.id===kInfo.drohnenvolk_id;}); if (dv) html += '🐝♂ ' + dv.name; }
        html += '</div>';
    }
    if (letzte) {
        var schnitt = durchschnittKriterien(letzte.kriterien);
        var tage = Math.floor((Date.now() - new Date(letzte.datum).getTime()) / 86400000);
        var tageLabel = tage === 0 ? 'Heute' : tage === 1 ? 'Gestern' : 'vor ' + tage + ' Tagen';
        var tageColor = tage > 14 ? '#ef4444' : tage > 7 ? '#f59e0b' : '#10b981';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;font-size:.75rem;padding-top:.35rem;border-top:1px solid #f5f0eb"><span>' + renderMiniStars(schnitt) + '</span><span style="color:' + tageColor + ';font-weight:500">' + tageLabel + '</span></div>';
    } else {
        html += '<div style="font-size:.75rem;color:#A69580;padding-top:.35rem;border-top:1px solid #f5f0eb">Noch keine Durchsicht</div>';
    }
    html += '<div style="margin-top:.5rem;text-align:right"><button onclick="event.stopPropagation();druckeStockkarte(\'' + v.id + '\')" style="background:none;border:none;cursor:pointer;font-size:.85rem;color:#7A6652" title="Stockkarte drucken">🖨️</button></div>';
    html += '</div>';
    return html;
}

// === SUCHFUNKTION ===
function renderSuchergebnisse() {
    var html = ''; var q = suchBegriff.trim().toLowerCase();
    var treffer = voelker.filter(function(v) {
        if (v.name.toLowerCase().indexOf(q) > -1) return true;
        var s = standorte.find(function(x){return x.id===v.standortId;});
        if (s && s.name.toLowerCase().indexOf(q) > -1) return true;
        var kInfo = koeniginnen[v.id];
        if (kInfo) { if (kInfo.zuchtbuchNr && kInfo.zuchtbuchNr.toLowerCase().indexOf(q) > -1) return true; if (kInfo.begattung && kInfo.begattung.toLowerCase().indexOf(q) > -1) return true; }
        return false;
    });
    if (!treffer.length) { html += '<div class="card" style="text-align:center;padding:2rem;color:#7A6652"><div style="font-size:2rem;margin-bottom:.5rem">🔍</div><p>Kein Volk gefunden für "<strong>' + suchBegriff + '</strong>"</p></div>'; return html; }
    html += '<div style="font-size:.8rem;color:#7A6652;margin-bottom:.5rem">' + treffer.length + ' Ergebnis' + (treffer.length>1?'se':'') + '</div>';
    if (treffer.length === 1) { html += renderVolkProfil(treffer[0]); return html; }
    treffer = sortVoelkerNumerisch(treffer);
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:.75rem">';
    treffer.forEach(function(v) { html += renderVolkKarte(v); });
    html += '</div>';
    return html;
}

function renderVolkProfil(v) {
    var html = ''; var s = standorte.find(function(x){return x.id===v.standortId;}); var kInfo = koeniginnen[v.id] || {}; var volkDs = getDurchsichtenFuerVolk(v.id);
    html += '<div class="such-ergebnis">';
    html += '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.75rem"><div><h2 style="margin:0;font-size:1.2rem">🐝 ' + v.name + '</h2>';
    if (s) html += '<div style="font-size:.85rem;color:#7A6652">📍 ' + s.name + '</div>';
    html += '</div><div style="display:flex;gap:.5rem">';
    html += '<button class="btn btn-sm" onclick="selectedVerlaufVolk=\'' + v.id + '\';suchBegriff=\'\';switchTab(\'historie\')" style="padding:.3rem .6rem;background:#F5A623;color:#fff;border:none;border-radius:.5rem;font-size:.75rem;cursor:pointer">📜 Historie</button>';
    html += '<button class="btn btn-sm" onclick="selectedStammbaumVolk=\'' + v.id + '\';suchBegriff=\'\';switchTab(\'stammbaum\')" style="padding:.3rem .6rem;background:#F5A623;color:#fff;border:none;border-radius:.5rem;font-size:.75rem;cursor:pointer">🌳 Stammbaum</button>';
    html += '</div></div>';
    if (kInfo.begattung || kInfo.jahrgang || kInfo.zuchtbuchNr) {
        html += '<div class="koenigin-section" style="margin-bottom:.75rem"><h4>👑 Königinnen-Info</h4><div style="display:grid;grid-template-columns:1fr 1fr;gap:.4rem;font-size:.85rem">';
        if (kInfo.jahrgang) html += '<div><span style="color:#7A6652">Jahrgang:</span> <strong>' + kInfo.jahrgang + '</strong> ' + (kInfo.markiert?getColorDot(kInfo.farbe):'') + '</div>';
        if (kInfo.begattung) html += '<div><span style="color:#7A6652">Begattung:</span> <strong>' + kInfo.begattung + '</strong></div>';
        if (kInfo.herkunft) html += '<div><span style="color:#7A6652">Herkunft:</span> <strong>' + formatHerkunft(kInfo.herkunft) + '</strong></div>';
        if (kInfo.zuchtbuchNr) html += '<div><span style="color:#7A6652">Zuchtbuch:</span> <strong>' + kInfo.zuchtbuchNr + '</strong></div>';
        if (kInfo.belegstelle) html += '<div style="grid-column:1/-1"><span style="color:#7A6652">Belegstelle:</span> <strong>' + kInfo.belegstelle + '</strong></div>';
        if (kInfo.muttervolk_id) { var mv = voelker.find(function(x){return x.id===kInfo.muttervolk_id;}); if (mv) html += '<div><span style="color:#7A6652">Muttervolk:</span> <strong>' + mv.name + '</strong></div>'; }
        if (kInfo.drohnenvolk_id) { var dv = voelker.find(function(x){return x.id===kInfo.drohnenvolk_id;}); if (dv) html += '<div><span style="color:#7A6652">Drohnenvolk:</span> <strong>' + dv.name + '</strong></div>'; }
        html += '</div>';
        if (kInfo.zuchtwerte && Object.keys(kInfo.zuchtwerte).some(function(k){return kInfo.zuchtwerte[k];})) {
            html += '<div style="margin-top:.5rem;padding-top:.5rem;border-top:1px solid rgba(245,166,35,0.15)"><div style="font-size:.78rem;font-weight:600;color:#92400E;margin-bottom:.3rem">📊 Zuchtwerte</div><div style="display:flex;flex-wrap:wrap;gap:.4rem">';
            [{key:'honig',icon:'🍯'},{key:'sanftmut',icon:'🤲'},{key:'wabensitz',icon:'🪵'},{key:'schwarm',icon:'🐝'},{key:'varroa',icon:'🔬'},{key:'gesamt',icon:'⭐'}].forEach(function(zw) {
                if (kInfo.zuchtwerte[zw.key]) { var val = kInfo.zuchtwerte[zw.key]; var c = val >= 110 ? '#10b981' : val >= 90 ? '#7A6652' : '#ef4444'; html += '<span style="font-size:.72rem;padding:.15rem .4rem;border-radius:.25rem;background:#f5f0eb;color:' + c + '">' + zw.icon + ' ' + val + '</span>'; }
            });
            html += '</div></div>';
        }
        html += '</div>';
    }
    if (volkDs.length) {
        var letzte = volkDs[0]; var schnitt = durchschnittKriterien(letzte.kriterien);
        html += '<div style="margin-bottom:.75rem"><div style="font-size:.82rem;font-weight:600;margin-bottom:.35rem">Letzte Durchsicht: ' + fmtDate(letzte.datum) + '</div>';
        html += '<div style="display:flex;flex-wrap:wrap;gap:.35rem;margin-bottom:.35rem">';
        KRITERIEN.forEach(function(k) { var val = letzte.kriterien[k.key] || 3; var c = val >= 4 ? '#10b981' : val <= 2 ? '#ef4444' : '#f59e0b'; html += '<span style="font-size:.7rem;padding:.2rem .4rem;border-radius:.25rem;background:#f5f0eb"><span style="color:' + c + '">●</span> ' + k.label.split(' ').pop() + ' ' + val + '/5</span>'; });
        html += '</div>';
        var tags = (letzte.taetigkeiten||[]).map(function(t) { var def = TAETIGKEITEN.find(function(x){return x.key===t.key;}); return def ? def.icon + ' ' + def.label : t.key; });
        if (tags.length) { html += '<div style="display:flex;flex-wrap:wrap;gap:.25rem">'; tags.forEach(function(t) { html += '<span class="historie-tag">' + t + '</span>'; }); html += '</div>'; }
        if (letzte.notizen) html += '<div style="font-size:.78rem;color:#7A6652;margin-top:.3rem;font-style:italic">"' + letzte.notizen + '"</div>';
        html += '</div>';
    }
    // QR-Code
    html += '<div style="margin-top:1rem;padding:1rem;background:#f5f0eb;border-radius:.75rem;text-align:center"><div style="font-size:.85rem;font-weight:600;color:#3D2E1F;margin-bottom:.5rem">📱 QR-Code</div><div id="qrcode-' + v.id + '" style="display:inline-block;background:#fff;padding:.75rem;border-radius:.5rem"></div>';
    html += '<div style="margin-top:.75rem"><button class="btn btn-sm btn-primary" onclick="druckeStockkarte(\'' + v.id + '\')">🖨️ Stockkarte drucken</button></div></div>';
    html += '</div>';
    return html;
}

// === TAB: DURCHSICHT ===
function renderDurchsicht() {
    var html = '';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem"><h2 style="margin:0;font-size:1.1rem">📋 Durchsichtprotokoll</h2><button class="btn btn-primary btn-sm" onclick="openDurchsicht()">+ Neue Durchsicht</button></div>';
    var anzuzeigende = selectedStandortFilter ? standorte.filter(function(s){return s.id===selectedStandortFilter;}) : standorte;
    if (selectedStandortFilter) {
        var sName = standorte.find(function(s){return s.id===selectedStandortFilter;});
        html += '<div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.75rem;font-size:.85rem;color:#7A6652"><span>Filter: 📍 <strong>' + (sName?sName.name:'') + '</strong></span><button onclick="selectedStandortFilter=\'\';render()" style="background:none;border:1px solid #E8DFD4;border-radius:.35rem;padding:.15rem .4rem;font-size:.72rem;cursor:pointer;color:#7A6652">✕ Alle zeigen</button></div>';
    }
    anzuzeigende.forEach(function(s) {
        var sVoelker = sortVoelkerNumerisch(voelker.filter(function(v){return v.standortId===s.id;}));
        if (!sVoelker.length) return;
        html += '<div class="card"><h3 style="margin-bottom:.75rem;display:flex;align-items:center;gap:.5rem">📍 ' + s.name + ' <span style="font-size:.75rem;color:#7A6652;font-weight:400">(' + sVoelker.length + ' Völker)</span></h3>';
        sVoelker.forEach(function(v) {
            var volkDs = getDurchsichtenFuerVolk(v.id); var letzte = volkDs.length ? volkDs[0] : null; var kInfo = koeniginnen[v.id]; var isOpen = openVolkDetail === v.id;
            html += '<div style="border-bottom:1px solid #f5f0eb"><div class="volk-row-clickable" onclick="toggleVolkDetail(\'' + v.id + '\')">';
            html += '<div style="display:flex;justify-content:space-between;align-items:flex-start"><div style="flex:1">';
            html += '<div style="font-weight:600;font-size:.95rem;display:flex;align-items:center;gap:.35rem">🐝 ' + v.name + ' <span style="font-size:.7rem;color:#7A6652;transform:rotate(' + (isOpen?'90':'0') + 'deg);transition:transform .2s;display:inline-block">▶</span></div>';
            if (kInfo) { html += '<div style="font-size:.72rem;color:#7A6652;margin-top:.15rem">👑 ' + (kInfo.jahrgang||'–') + ' · ' + (kInfo.begattung||'–') + (kInfo.markiert?' · '+getColorDot(kInfo.farbe):'') + '</div>'; }
            if (letzte) {
                var schnitt = durchschnittKriterien(letzte.kriterien);
                var tags = (letzte.taetigkeiten||[]).map(function(t){var def = TAETIGKEITEN.find(function(x){return x.key===t.key;});return def?def.icon:'📋';}).join(' ');
                html += '<div style="font-size:.75rem;color:#7A6652;margin-top:.2rem">Letzte: ' + fmtDate(letzte.datum) + ' · ' + renderMiniStars(schnitt) + ' ' + tags;
                if (letzte.varroa && letzte.varroa.milben) { var mProTag = letzte.varroa.tage > 0 ? (letzte.varroa.milben / letzte.varroa.tage).toFixed(1) : '–'; html += ' · 🔬 ' + mProTag + ' M/Tag'; }
                html += '</div>';
            } else {
                var alteBew = bewertungen.find(function(b){return b.volkId===v.id;});
                html += alteBew ? '<div style="font-size:.75rem;color:#7A6652;margin-top:.2rem">Letzte Bewertung: ' + fmtDate(alteBew.datum) + '</div>' : '<div style="font-size:.75rem;color:#94a3b8;margin-top:.2rem">Noch keine Durchsicht</div>';
            }
            html += '</div><div style="display:flex;gap:.25rem;flex-shrink:0;margin-left:.5rem" onclick="event.stopPropagation()">';
            html += '<button class="btn btn-primary btn-xs" onclick="openDurchsicht(null,\'' + v.id + '\')">📋</button>';
            if (letzte) html += '<button class="btn btn-blue btn-xs" onclick="openDurchsicht(\'' + letzte.id + '\')">✏️</button>';
            html += '</div></div></div>';
            if (isOpen) html += renderVolkDetail(v, volkDs, kInfo);
            html += '</div>';
        });
        html += '</div>';
    });
    // Letzte Durchsichten
    if (durchsichten.length) {
        var sorted = durchsichten.slice().sort(function(a,b){return new Date(b.datum)-new Date(a.datum);});
        html += '<div class="card"><h3 style="margin-bottom:.75rem">📋 Letzte Durchsichten</h3>';
        sorted.slice(0,8).forEach(function(d) {
            var v = voelker.find(function(x){return x.id===d.volkId;});
            var tags = (d.taetigkeiten||[]).map(function(t){var def=TAETIGKEITEN.find(function(x){return x.key===t.key;});return '<span class="historie-tag">'+(def?def.icon+' '+def.label:'📋')+'</span>';}).join('');
            html += '<div class="historie-entry"><div style="display:flex;justify-content:space-between;align-items:flex-start"><div><div style="font-weight:500;font-size:.9rem">🐝 ' + (v?v.name:'–') + '</div><div style="font-size:.72rem;color:#7A6652">' + fmtDate(d.datum) + '</div><div class="historie-tags">' + tags + '</div>';
            if (d.notizen) html += '<div style="font-size:.75rem;color:#94a3b8;margin-top:.25rem">' + d.notizen + '</div>';
            html += '</div><div style="display:flex;gap:.25rem"><button class="btn btn-blue btn-xs" onclick="openDurchsicht(\'' + d.id + '\')">✏️</button><button class="btn btn-danger btn-xs" onclick="deleteDurchsicht(\'' + d.id + '\')">🗑️</button></div></div></div>';
        });
        html += '</div>';
    }
    return html;
}

// === VOLK DETAIL (inline) ===
function toggleVolkDetail(volkId) { openVolkDetail = openVolkDetail === volkId ? null : volkId; render(); }

function renderVolkDetail(v, volkDs, kInfo) {
    var html = '<div class="volk-detail"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem"><span style="font-size:.85rem;font-weight:600;color:#92400E">📖 Stockkarte: ' + v.name + '</span><button onclick="event.stopPropagation();druckeStockkarte(\'' + v.id + '\')" class="btn btn-xs" style="background:#f5f0eb;color:#3D2E1F">🖨️ Drucken</button></div>';
    if (kInfo) {
        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:.35rem .75rem;font-size:.78rem;margin-bottom:.75rem;padding:.6rem;background:#fff;border-radius:.5rem">';
        html += '<div><span style="color:#7A6652">👑 Begattung:</span> <strong>' + (kInfo.begattung||'–') + '</strong></div>';
        html += '<div><span style="color:#7A6652">Herkunft:</span> <strong>' + formatHerkunft(kInfo.herkunft) + '</strong></div>';
        html += '<div><span style="color:#7A6652">Jahrgang:</span> <strong>' + (kInfo.jahrgang||'–') + '</strong></div>';
        html += '<div><span style="color:#7A6652">Markiert:</span> <strong>' + (kInfo.markiert?'Ja '+getColorDot(kInfo.farbe):'Nein') + '</strong></div>';
        if (kInfo.belegstelle) html += '<div style="grid-column:1/-1"><span style="color:#7A6652">Belegstelle:</span> <strong>' + kInfo.belegstelle + '</strong></div>';
        if (kInfo.nummer) html += '<div style="grid-column:1/-1"><span style="color:#7A6652">Nummer:</span> <strong>' + kInfo.nummer + '</strong></div>';
        html += '</div>';
        if (kInfo.zuchtwerte && kInfo.zuchtbuchNr) html += renderZuchtwertkarte(kInfo);
    }
    // Mini-Verlauf
    var sorted = volkDs.slice().sort(function(a,b){return new Date(a.datum)-new Date(b.datum);});
    if (sorted.length > 1) {
        html += '<div style="margin-bottom:.75rem;padding:.6rem;background:#fff;border-radius:.5rem"><div style="font-size:.75rem;font-weight:600;color:#7A6652;margin-bottom:.35rem">📈 Verlauf</div>';
        html += '<div style="display:flex;align-items:end;gap:4px;height:60px">';
        sorted.forEach(function(d) { var schnitt = durchschnittKriterien(d.kriterien); var h = Math.max(4, (schnitt/5)*60); var c = schnitt>=4?'#10b981':(schnitt>=3?'#F5A623':'#ef4444'); html += '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:1px"><div style="font-size:.55rem;font-weight:600;color:#1C1410">' + schnitt.toFixed(1) + '</div><div style="width:100%;height:' + h + 'px;background:' + c + ';border-radius:3px 3px 0 0"></div><div style="font-size:.5rem;color:#7A6652">' + fmtDateShort(d.datum) + '</div></div>'; });
        html += '</div></div>';
    }
    // Durchsichten
    var absteigend = volkDs.slice().sort(function(a,b){return new Date(b.datum)-new Date(a.datum);});
    if (!absteigend.length) { html += '<div style="text-align:center;padding:.75rem;color:#94a3b8;font-size:.85rem">Noch keine Durchsichten vorhanden.</div>'; }
    else {
        html += '<div style="font-size:.75rem;font-weight:600;color:#7A6652;margin-bottom:.35rem">📋 Durchsichten (' + absteigend.length + ')</div>';
        absteigend.forEach(function(d) {
            var schnitt = durchschnittKriterien(d.kriterien);
            var tags = (d.taetigkeiten||[]).map(function(t) { var def = TAETIGKEITEN.find(function(x){return x.key===t.key;}); var label = def ? def.icon + ' ' + def.label : t.key; if (t.subs && t.subs.length) label += ' (' + t.subs.join(', ') + ')'; if (t.menge) label += ' ' + t.menge + (def&&def.mengeUnit?' '+def.mengeUnit:''); return '<span class="historie-tag">' + label + '</span>'; }).join('');
            html += '<div style="padding:.5rem;background:#fff;border-radius:.5rem;margin-bottom:.35rem"><div style="display:flex;justify-content:space-between;align-items:flex-start"><div style="flex:1">';
            html += '<div style="font-weight:600;font-size:.82rem">' + fmtDate(d.datum) + ' ' + renderMiniStars(schnitt) + ' <span style="color:#7A6652;font-size:.75rem">(' + schnitt.toFixed(1) + ')</span></div>';
            html += '<div class="historie-tags" style="margin-top:.2rem">' + tags + '</div>';
            if (d.varroa && d.varroa.milben) { var mProTag = d.varroa.tage > 0 ? (d.varroa.milben / d.varroa.tage).toFixed(1) : '–'; var vClass = mProTag <= 3 ? 'badge-green' : (mProTag <= 10 ? 'badge-yellow' : 'badge-red'); html += '<div style="margin-top:.2rem"><span class="badge ' + vClass + '" style="font-size:.6rem">🔬 ' + mProTag + ' M/Tag (' + d.varroa.methode + ')</span></div>'; }
            if (d.notizen) html += '<div style="font-size:.72rem;color:#94a3b8;margin-top:.2rem">' + d.notizen + '</div>';
            html += '</div><div style="display:flex;gap:.2rem;flex-shrink:0;margin-left:.35rem" onclick="event.stopPropagation()"><button class="btn btn-blue btn-xs" style="padding:.3rem .5rem;font-size:.7rem" onclick="openDurchsicht(\'' + d.id + '\')">✏️</button><button class="btn btn-danger btn-xs" style="padding:.3rem .5rem;font-size:.7rem" onclick="deleteDurchsicht(\'' + d.id + '\')">🗑️</button></div></div></div>';
        });
    }
    html += '<button class="btn btn-primary btn-sm" style="width:100%;margin-top:.5rem" onclick="event.stopPropagation();openDurchsicht(null,\'' + v.id + '\')">+ Neue Durchsicht</button>';
    html += '</div>';
    return html;
}

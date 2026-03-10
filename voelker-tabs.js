// ============================================
// VOELKER-TABS.JS – Ranking, Historie, Stammbaum
// ============================================

// === TAB: RANKING ===
function renderRanking() {
    var volkRanking = [];
    voelker.forEach(function(v) {
        var volkDs = getDurchsichtenFuerVolk(v.id); if (!volkDs.length) return;
        var letzte = volkDs[0]; var schnitt = durchschnittKriterien(letzte.kriterien);
        var s = standorte.find(function(x){return x.id===v.standortId;});
        volkRanking.push({volk:v, durchsicht:letzte, schnitt:schnitt, standortName:s?s.name:''});
    });
    volkRanking.sort(function(a,b){return b.schnitt-a.schnitt;});
    var html = '<div class="card"><h3 style="margin-bottom:1rem;text-align:center">🏆 Zucht-Ranking</h3>';
    if (!volkRanking.length) {
        html += '<div style="text-align:center;padding:2rem;color:#7A6652"><div style="font-size:3rem;margin-bottom:.5rem">🏆</div><p>Noch keine Durchsichten vorhanden.</p><button class="btn btn-primary" style="margin-top:1rem" onclick="switchTab(\'durchsicht\')">Erste Durchsicht erstellen</button></div></div>';
        return html;
    }
    volkRanking.forEach(function(item, i) {
        var medal = i===0?'🥇':(i===1?'🥈':(i===2?'🥉':(i+1)+'.'));
        var barColor = item.schnitt>=4?'#10b981':(item.schnitt>=3?'#F5A623':'#ef4444');
        html += '<div style="padding:.75rem 0;border-bottom:1px solid #f5f0eb"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.375rem"><div style="display:flex;align-items:center;gap:.5rem"><span style="font-size:1.25rem;width:2rem;text-align:center">' + medal + '</span>';
        html += '<div><div style="font-weight:600;cursor:pointer;border-bottom:1px dashed #E8DFD4;display:inline-block" onclick="goToVolk(\'' + item.volk.id + '\')">' + item.volk.name + '</div><div style="font-size:.75rem;color:#7A6652">📍 ' + item.standortName + '</div></div></div>';
        html += '<div style="font-size:1.25rem;font-weight:bold;color:' + barColor + '">' + item.schnitt.toFixed(1) + '</div></div>';
        html += '<div style="display:flex;gap:3px;margin-left:2.5rem">';
        KRITERIEN.forEach(function(k) { var val = (item.durchsicht.kriterien[k.key]) || 3; var w = (val/5*100); var c = val>=4?'#10b981':(val>=3?'#F5A623':'#ef4444'); html += '<div style="flex:1;height:6px;background:#E8DFD4;border-radius:3px" title="' + k.label + ': ' + val + '/5"><div style="height:100%;border-radius:3px;background:' + c + ';width:' + w + '%"></div></div>'; });
        html += '</div>';
        var staerken = KRITERIEN.filter(function(k){return (item.durchsicht.kriterien[k.key]||3)>=4;}).map(function(k){return k.label.split(' ')[0];});
        var schwaechen = KRITERIEN.filter(function(k){return (item.durchsicht.kriterien[k.key]||3)<=2;}).map(function(k){return k.label.split(' ')[0];});
        if (staerken.length || schwaechen.length) { html += '<div style="margin-left:2.5rem;margin-top:.25rem;font-size:.7rem">'; if (staerken.length) html += '<span style="color:#10b981">▲ ' + staerken.join(' ') + '</span> '; if (schwaechen.length) html += '<span style="color:#ef4444">▼ ' + schwaechen.join(' ') + '</span>'; html += '</div>'; }
        html += '</div>';
    });
    html += '</div>';
    if (volkRanking.length >= 2) {
        var beste = volkRanking[0];
        html += '<div class="card" style="background:linear-gradient(135deg,#f0fdf4,#fff);border-left:4px solid #10b981"><h3 style="margin-bottom:.5rem">👑 Zuchtempfehlung</h3><p style="font-size:.9rem;color:#7A6652"><strong>' + beste.volk.name + '</strong> (📍 ' + beste.standortName + ') hat mit <strong>' + beste.schnitt.toFixed(1) + '/5.0</strong> die beste Gesamtbewertung.</p></div>';
    }
    return html;
}

// === TAB: HISTORIE ===
function renderHistorie() {
    var html = '<div class="card"><h3 style="margin-bottom:.75rem">📜 Durchsicht-Historie</h3>';
    html += '<select class="input" onchange="selectedVerlaufVolk=this.value;render()"><option value="">-- Volk wählen --</option>';
    voelker.forEach(function(v) {
        var s = standorte.find(function(x){return x.id===v.standortId;}); var count = durchsichten.filter(function(d){return d.volkId===v.id;}).length;
        html += '<option value="' + v.id + '"' + (selectedVerlaufVolk===v.id?' selected':'') + '>' + v.name + ' (' + (s?s.name:'') + ') – ' + count + ' Einträge</option>';
    });
    html += '</select></div>';
    if (selectedVerlaufVolk) {
        var kInfo = koeniginnen[selectedVerlaufVolk]; var volkDs = getDurchsichtenFuerVolk(selectedVerlaufVolk);
        if (kInfo) {
            html += '<div class="card koenigin-section"><h4>👑 Königinnen-Info</h4><div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;font-size:.85rem">';
            html += '<div><span style="color:#7A6652">Begattung:</span> <strong>' + (kInfo.begattung||'–') + '</strong></div>';
            html += '<div><span style="color:#7A6652">Herkunft:</span> <strong>' + formatHerkunft(kInfo.herkunft) + '</strong></div>';
            html += '<div><span style="color:#7A6652">Jahrgang:</span> <strong>' + (kInfo.jahrgang||'–') + '</strong></div>';
            html += '<div><span style="color:#7A6652">Markiert:</span> <strong>' + (kInfo.markiert?'Ja '+getColorDot(kInfo.farbe):'Nein') + '</strong></div>';
            if (kInfo.belegstelle) html += '<div style="grid-column:1/-1"><span style="color:#7A6652">Belegstelle:</span> <strong>' + kInfo.belegstelle + '</strong></div>';
            if (kInfo.muttervolk_id) { var mv = voelker.find(function(x){return x.id===kInfo.muttervolk_id;}); if (mv) html += '<div style="grid-column:1/-1"><span style="color:#7A6652">🌳 Muttervolk:</span> <strong>' + mv.name + '</strong></div>'; }
            if (kInfo.drohnenvolk_id) { var dv = voelker.find(function(x){return x.id===kInfo.drohnenvolk_id;}); if (dv) html += '<div style="grid-column:1/-1"><span style="color:#7A6652">🌳 Drohnenvolk:</span> <strong>' + dv.name + '</strong></div>'; }
            html += '</div></div>';
            if (kInfo.zuchtwerte && kInfo.zuchtbuchNr) html += renderZuchtwertkarte(kInfo);
        }
        if (volkDs.length > 0) {
            var bews = volkDs.slice().reverse();
            html += '<div class="card"><h3 style="margin-bottom:.75rem">📈 Bewertungsverlauf</h3><div style="display:flex;align-items:end;gap:8px;height:120px;padding:0 .5rem">';
            bews.forEach(function(d) { var schnitt = durchschnittKriterien(d.kriterien); var h = Math.max(8, (schnitt/5)*120); var c = schnitt>=4?'#10b981':(schnitt>=3?'#F5A623':'#ef4444'); html += '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px"><div style="font-size:.65rem;font-weight:600;color:#1C1410">' + schnitt.toFixed(1) + '</div><div style="width:100%;height:' + h + 'px;background:' + c + ';border-radius:4px 4px 0 0"></div><div style="font-size:.6rem;color:#7A6652">' + fmtDateShort(d.datum) + '</div></div>'; });
            html += '</div></div>';
            // Kriterien-Übersicht
            html += '<div class="card"><h3 style="margin-bottom:.75rem">Nach Kriterium</h3>';
            var letzte = volkDs[0]; var erste = volkDs[volkDs.length-1];
            KRITERIEN.forEach(function(k) {
                var val = letzte.kriterien[k.key] || 3; var altVal = erste.kriterien[k.key] || 3; var diff = val - altVal;
                var trend = volkDs.length > 1 ? (diff > 0 ? '<span style="color:#10b981">▲+'+diff+'</span>' : (diff < 0 ? '<span style="color:#ef4444">▼'+diff+'</span>' : '<span style="color:#94a3b8">→</span>')) : '';
                var barColor = val >= 4 ? '#10b981' : (val >= 3 ? '#F5A623' : '#ef4444');
                html += '<div style="margin-bottom:.75rem"><div style="display:flex;justify-content:space-between;font-size:.85rem;margin-bottom:.25rem"><span>' + k.label + '</span><span><strong>' + val + '/5</strong> ' + trend + '</span></div>';
                html += '<div style="background:#E8DFD4;height:.5rem;border-radius:.25rem"><div style="background:' + barColor + ';height:100%;border-radius:.25rem;width:' + (val/5*100) + '%;transition:width .3s"></div></div></div>';
            });
            html += '</div>';
            // Alle Durchsichten
            html += '<div class="card"><h3 style="margin-bottom:.75rem">Alle Durchsichten</h3>';
            volkDs.forEach(function(d) {
                var schnitt = durchschnittKriterien(d.kriterien);
                var tags = (d.taetigkeiten||[]).map(function(t) { var def = TAETIGKEITEN.find(function(x){return x.key===t.key;}); var label = def ? def.icon + ' ' + def.label : t.key; if (t.subs && t.subs.length) label += ' (' + t.subs.join(', ') + ')'; if (t.menge) label += ' – ' + t.menge + (def&&def.mengeUnit?' '+def.mengeUnit:''); return '<span class="historie-tag">' + label + '</span>'; }).join('');
                html += '<div class="historie-entry"><div style="display:flex;justify-content:space-between;align-items:flex-start"><div style="flex:1"><div style="font-weight:600;font-size:.9rem">' + fmtDate(d.datum) + ' · ' + renderMiniStars(schnitt) + ' (' + schnitt.toFixed(1) + ')</div><div class="historie-tags">' + tags + '</div>';
                if (d.varroa && d.varroa.milben) { var mProTag = d.varroa.tage > 0 ? (d.varroa.milben / d.varroa.tage).toFixed(1) : '–'; var vClass = mProTag <= 3 ? 'badge-green' : (mProTag <= 10 ? 'badge-yellow' : 'badge-red'); html += '<div style="margin-top:.25rem"><span class="badge ' + vClass + '">🔬 ' + mProTag + ' Milben/Tag (' + d.varroa.methode + ')</span></div>'; }
                if (d.notizen) html += '<div style="font-size:.75rem;color:#94a3b8;margin-top:.25rem">' + d.notizen + '</div>';
                html += '</div><div style="display:flex;gap:.25rem"><button class="btn btn-blue btn-xs" onclick="openDurchsicht(\'' + d.id + '\')">✏️</button><button class="btn btn-danger btn-xs" onclick="deleteDurchsicht(\'' + d.id + '\')">🗑️</button></div></div></div>';
            });
            html += '</div>';
        }
    } else {
        html += '<div class="card" style="text-align:center;padding:1.5rem;color:#7A6652"><p>Wähle ein Volk um die Historie zu sehen.</p></div>';
    }
    return html;
}

// === TAB: STAMMBAUM ===
function renderStammbaum() {
    var html = '<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.75rem"><h3 style="margin:0">🌳 Stammbaum</h3>';
    if (selectedStammbaumVolk) html += '<button onclick="exportStammbaumPDF()" style="padding:.4rem .8rem;background:#F5A623;color:#fff;border:none;border-radius:.5rem;font-size:.8rem;font-weight:600;cursor:pointer">📄 PDF Export</button>';
    html += '</div><select class="input" onchange="selectedStammbaumVolk=this.value;render()"><option value="">-- Volk wählen --</option>';
    standorte.forEach(function(s) {
        var sV = voelker.filter(function(v){return v.standortId===s.id;}); if (!sV.length) return;
        html += '<optgroup label="📍 ' + s.name + '">';
        sV.forEach(function(v) { var kI = koeniginnen[v.id]; var hat = kI && (kI.muttervolk_id || kI.drohnenvolk_id); html += '<option value="' + v.id + '"' + (selectedStammbaumVolk===v.id?' selected':'') + '>' + v.name + (hat?' 🌳':'') + '</option>'; });
        html += '</optgroup>';
    });
    html += '</select></div>';
    if (!selectedStammbaumVolk) {
        var mitAbstammung = voelker.filter(function(v) { var kI = koeniginnen[v.id]; return kI && (kI.muttervolk_id || kI.drohnenvolk_id); });
        if (mitAbstammung.length) {
            html += '<div class="card"><h3 style="margin-bottom:.75rem">🌳 Völker mit Abstammung</h3><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:.75rem">';
            mitAbstammung.forEach(function(v) {
                var kI = koeniginnen[v.id] || {}; var s = standorte.find(function(x){return x.id===v.standortId;});
                var mv = kI.muttervolk_id ? voelker.find(function(x){return x.id===kI.muttervolk_id;}) : null;
                var dv = kI.drohnenvolk_id ? voelker.find(function(x){return x.id===kI.drohnenvolk_id;}) : null;
                html += '<div class="volk-grid-card" onclick="selectedStammbaumVolk=\'' + v.id + '\';render()" style="cursor:pointer"><div style="font-weight:700">🐝 ' + v.name + '</div>';
                if (s) html += '<div style="font-size:.72rem;color:#7A6652">📍 ' + s.name + '</div>';
                html += '<div style="margin-top:.35rem;font-size:.78rem">';
                if (mv) html += '<div style="color:#D4930D">👑 Mutter: ' + mv.name + '</div>';
                if (dv) html += '<div style="color:#3B82F6">🐝♂ Drohne: ' + dv.name + '</div>';
                html += '</div></div>';
            });
            html += '</div></div>';
        } else {
            html += '<div class="card" style="text-align:center;padding:3rem;color:#7A6652"><div style="font-size:3rem;margin-bottom:1rem">🌳</div><h3>Noch keine Abstammungsdaten</h3><p style="margin-top:.5rem">Pflege Mutter- und Drohnenvolk über 📋 Durchsicht → 👑 Königin → 🌳 Abstammung</p></div>';
        }
        return html;
    }
    html += '<div id="stammbaumContainer" class="card" style="overflow-x:auto"><div class="stammbaum-tree">' + renderBaumKnoten(selectedStammbaumVolk, 0) + '</div></div>';
    html += '<div class="card" style="display:flex;gap:1.5rem;align-items:center;flex-wrap:wrap;font-size:.8rem;color:#7A6652"><strong>Legende:</strong><span class="stammbaum-label mutter" style="margin:0">👑 Muttervolk</span><span class="stammbaum-label drohne" style="margin:0">🐝 Drohnenvolk</span></div>';
    return html;
}

function renderBaumKnoten(volkId, tiefe) {
    if (!volkId || tiefe > 4) return '';
    var v = voelker.find(function(x){return x.id===volkId;});
    if (!v) return '<div style="padding:.5rem;color:#A69580;font-size:.8rem;font-style:italic;text-align:center">Volk nicht mehr vorhanden</div>';
    var kInfo = koeniginnen[volkId] || {}; var s = standorte.find(function(x){return x.id===v.standortId;});
    var html = '<div class="stammbaum-connector">';
    var cls = 'stammbaum-node-card' + (tiefe===0?' root':'');
    html += '<div class="' + cls + '">';
    if (tiefe > 0) html += '<span class="stammbaum-gen">Gen ' + tiefe + '</span>';
    if (kInfo.markiert && kInfo.farbe) { var fMap = {weiss:'#E5E7EB',gelb:'#FDE047',rot:'#EF4444',gruen:'#22C55E',blau:'#3B82F6'}; html += '<div style="width:12px;height:12px;border-radius:50%;background:' + (fMap[kInfo.farbe]||'#ccc') + ';border:2px solid rgba(0,0,0,0.15);position:absolute;top:.75rem;left:.75rem"></div>'; }
    html += '<div style="font-weight:700;font-size:' + (tiefe===0?'1.15rem':'1rem') + ';margin-bottom:.25rem">' + (tiefe===0?'👑 ':'') + v.name + '</div>';
    if (s) html += '<div style="font-size:.72rem;color:#7A6652;margin-bottom:.35rem">📍 ' + s.name + '</div>';
    var chips = [];
    if (kInfo.jahrgang) chips.push('<span class="stammbaum-badge" style="background:#FFF8EE;color:#92400E">' + kInfo.jahrgang + '</span>');
    if (kInfo.begattung) chips.push('<span class="stammbaum-badge" style="background:#f5f0eb;color:#7A6652">' + kInfo.begattung + '</span>');
    if (kInfo.zuchtbuchNr) chips.push('<span class="stammbaum-badge" style="background:#EEF2FF;color:#5B21B6;font-family:monospace">' + kInfo.zuchtbuchNr + '</span>');
    if (chips.length) html += '<div style="display:flex;flex-wrap:wrap;gap:.25rem;justify-content:center;margin-bottom:.25rem">' + chips.join('') + '</div>';
    if (kInfo.zuchtwerte && kInfo.zuchtwerte.gesamt) {
        var val = kInfo.zuchtwerte.gesamt; var barColor = val >= 110 ? '#10b981' : val >= 100 ? '#F5A623' : val >= 90 ? '#f59e0b' : '#ef4444';
        var barW = Math.min(Math.max((val - 70) * 100 / 60, 5), 100);
        html += '<div style="margin-top:.25rem"><div style="font-size:.65rem;color:#7A6652;margin-bottom:.15rem">⭐ Zuchtwert: <strong>' + val + '</strong></div><div style="height:6px;background:#f5f0eb;border-radius:3px;overflow:hidden"><div style="height:100%;width:' + barW + '%;background:' + barColor + ';border-radius:3px;transition:width .5s"></div></div></div>';
    }
    html += '</div>';
    var hatMutter = kInfo.muttervolk_id && voelker.find(function(x){return x.id===kInfo.muttervolk_id;});
    var hatDrohne = kInfo.drohnenvolk_id && voelker.find(function(x){return x.id===kInfo.drohnenvolk_id;});
    if (hatMutter || hatDrohne) {
        html += '<div class="stammbaum-vline"></div><div class="stammbaum-eltern">';
        if (hatMutter) { html += '<div class="stammbaum-zweig"><span class="stammbaum-label mutter">👑 Muttervolk</span><div class="stammbaum-vline"></div>' + renderBaumKnoten(kInfo.muttervolk_id, tiefe + 1) + '</div>'; }
        if (hatDrohne) { html += '<div class="stammbaum-zweig"><span class="stammbaum-label drohne">🐝 Drohnenvolk</span><div class="stammbaum-vline drohne"></div>' + renderBaumKnoten(kInfo.drohnenvolk_id, tiefe + 1) + '</div>'; }
        html += '</div>';
    } else if (tiefe === 0) {
        html += '<div style="margin-top:1rem;padding:.75rem;color:#A69580;font-size:.85rem;background:#FFFBF0;border-radius:.5rem;text-align:center;max-width:400px">💡 Pflege Mutter- und Drohnenvolk über 📋 Durchsicht → 👑 Königin → 🌳 Abstammung</div>';
    }
    html += '</div>';
    return html;
}

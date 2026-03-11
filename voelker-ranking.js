// ============================================
// VÖLKER & STANDORTE – RANKING / HISTORIE MODULE
// ============================================

// === TAB: RANKING ===
function renderRanking() {
    var volkRanking = [];
    voelker.forEach(function(v) {
        var volkDs = getDurchsichtenFuerVolk(v.id);
        if (!volkDs.length) return;
        var letzte = volkDs[0];
        var schnitt = durchschnittKriterien(letzte.kriterien);
        var s = standorte.find(function(x){return x.id===v.standortId;});
        volkRanking.push({volk:v, durchsicht:letzte, schnitt:schnitt, standortName:s?s.name:''});
    });
    volkRanking.sort(function(a,b){return b.schnitt-a.schnitt;});

    var html = '<div class="card">';
    html += '<h3 style="margin-bottom:1rem;text-align:center">🏆 Zucht-Ranking</h3>';

    if (!volkRanking.length) {
        html += '<div style="text-align:center;padding:2rem;color:#7A6652"><div style="font-size:3rem;margin-bottom:.5rem">🏆</div>';
        html += '<p>Noch keine Durchsichten vorhanden.</p>';
        html += '<button class="btn btn-primary" style="margin-top:1rem" onclick="switchTab(\'durchsicht\')">Erste Durchsicht erstellen</button></div>';
        html += '</div>';
        return html;
    }

    volkRanking.forEach(function(item, i) {
        var medal = i===0?'🥇':(i===1?'🥈':(i===2?'🥉':(i+1)+'.'));
        var barColor = item.schnitt>=4?'#10b981':(item.schnitt>=3?'#F5A623':'#ef4444');

        html += '<div style="padding:.75rem 0;border-bottom:1px solid #f5f0eb">';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.375rem">';
        html += '<div style="display:flex;align-items:center;gap:.5rem">';
        html += '<span style="font-size:1.25rem;width:2rem;text-align:center">' + medal + '</span>';
        html += '<div><div style="font-weight:600;cursor:pointer;border-bottom:1px dashed #E8DFD4;display:inline-block" onclick="goToVolk(\'' + item.volk.id + '\')">' + item.volk.name + '</div>';
        html += '<div style="font-size:.75rem;color:#7A6652">📍 ' + item.standortName + '</div></div>';
        html += '</div>';
        html += '<div style="font-size:1.25rem;font-weight:bold;color:' + barColor + '">' + item.schnitt.toFixed(1) + '</div>';
        html += '</div>';

        html += '<div style="display:flex;gap:3px;margin-left:2.5rem">';
        KRITERIEN.forEach(function(k) {
            var val = (item.durchsicht.kriterien[k.key]) || 3;
            var w = (val/5*100);
            var c = val>=4?'#10b981':(val>=3?'#F5A623':'#ef4444');
            html += '<div style="flex:1;height:6px;background:#E8DFD4;border-radius:3px" title="' + k.label + ': ' + val + '/5"><div style="height:100%;border-radius:3px;background:' + c + ';width:' + w + '%"></div></div>';
        });
        html += '</div>';

        var staerken = KRITERIEN.filter(function(k){return (item.durchsicht.kriterien[k.key]||3)>=4;}).map(function(k){return k.label.split(' ')[0];});
        var schwaechen = KRITERIEN.filter(function(k){return (item.durchsicht.kriterien[k.key]||3)<=2;}).map(function(k){return k.label.split(' ')[0];});
        if (staerken.length || schwaechen.length) {
            html += '<div style="margin-left:2.5rem;margin-top:.25rem;font-size:.7rem">';
            if (staerken.length) html += '<span style="color:#10b981">▲ ' + staerken.join(' ') + '</span> ';
            if (schwaechen.length) html += '<span style="color:#ef4444">▼ ' + schwaechen.join(' ') + '</span>';
            html += '</div>';
        }
        html += '</div>';
    });
    html += '</div>';

    if (volkRanking.length >= 2) {
        var beste = volkRanking[0];
        html += '<div class="card" style="background:linear-gradient(135deg,#f0fdf4,#fff);border-left:4px solid #10b981">';
        html += '<h3 style="margin-bottom:.5rem">👑 Zuchtempfehlung</h3>';
        html += '<p style="font-size:.9rem;color:#7A6652"><strong>' + beste.volk.name + '</strong> (📍 ' + beste.standortName + ') hat mit <strong>' + beste.schnitt.toFixed(1) + '/5.0</strong> die beste Gesamtbewertung.</p>';
        html += '</div>';
    }

    return html;
}

// === TAB: HISTORIE ===
function renderHistorie() {
    var html = '';

    html += '<div class="card">';
    html += '<h3 style="margin-bottom:.75rem">📜 Durchsicht-Historie</h3>';
    html += '<select class="input" onchange="selectedVerlaufVolk=this.value;render()">';
    html += '<option value="">-- Volk wählen --</option>';
    voelker.forEach(function(v) {
        var s = standorte.find(function(x){return x.id===v.standortId;});
        var count = durchsichten.filter(function(d){return d.volkId===v.id;}).length;
        html += '<option value="' + v.id + '"' + (selectedVerlaufVolk===v.id?' selected':'') + '>' + v.name + ' (' + (s?s.name:'') + ') – ' + count + ' Einträge</option>';
    });
    html += '</select></div>';

    if (selectedVerlaufVolk) {
        var kInfo = koeniginnen[selectedVerlaufVolk];
        var volkDs = getDurchsichtenFuerVolk(selectedVerlaufVolk);

        // Königin-Karte
        if (kInfo) {
            html += '<div class="card koenigin-section">';
            html += '<h4>👑 Königinnen-Info</h4>';
            html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;font-size:.85rem">';
            html += '<div><span style="color:#7A6652">Begattung:</span> <strong>' + (kInfo.begattung||'–') + '</strong></div>';
            html += '<div><span style="color:#7A6652">Herkunft:</span> <strong>' + formatHerkunft(kInfo.herkunft) + '</strong></div>';
            html += '<div><span style="color:#7A6652">Jahrgang:</span> <strong>' + (kInfo.jahrgang||'–') + '</strong></div>';
            html += '<div><span style="color:#7A6652">Markiert:</span> <strong>' + (kInfo.markiert?'Ja '+getColorDot(kInfo.farbe):'Nein') + '</strong></div>';
            if (kInfo.belegstelle) html += '<div style="grid-column:1/-1"><span style="color:#7A6652">Belegstelle:</span> <strong>' + kInfo.belegstelle + '</strong></div>';
            if (kInfo.nummer) html += '<div style="grid-column:1/-1"><span style="color:#7A6652">Nummer:</span> <strong>' + kInfo.nummer + '</strong></div>';
            if (kInfo.muttervolk_id) {
                var mv = voelker.find(function(x){return x.id===kInfo.muttervolk_id;});
                if (mv) html += '<div style="grid-column:1/-1"><span style="color:#7A6652">🌳 Muttervolk:</span> <strong>' + mv.name + '</strong></div>';
            }
            if (kInfo.drohnenvolk_id) {
                var dv = voelker.find(function(x){return x.id===kInfo.drohnenvolk_id;});
                if (dv) html += '<div style="grid-column:1/-1"><span style="color:#7A6652">🌳 Drohnenvolk:</span> <strong>' + dv.name + '</strong></div>';
            }
            html += '</div></div>';

            // BeeBreed Zuchtwertkarte
            if (kInfo.zuchtwerte && kInfo.zuchtbuchNr) {
                html += renderZuchtwertkarte(kInfo);
            }
        }

        // Verlaufsgrafik
        if (volkDs.length > 0) {
            var bews = volkDs.slice().reverse();
            html += '<div class="card">';
            html += '<h3 style="margin-bottom:.75rem">📈 Bewertungsverlauf</h3>';
            var maxH = 120;
            html += '<div style="display:flex;align-items:end;gap:8px;height:' + maxH + 'px;padding:0 .5rem">';
            bews.forEach(function(d) {
                var schnitt = durchschnittKriterien(d.kriterien);
                var h = Math.max(8, (schnitt/5)*maxH);
                var c = schnitt>=4?'#10b981':(schnitt>=3?'#F5A623':'#ef4444');
                html += '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px">';
                html += '<div style="font-size:.65rem;font-weight:600;color:#1C1410">' + schnitt.toFixed(1) + '</div>';
                html += '<div style="width:100%;height:' + h + 'px;background:' + c + ';border-radius:4px 4px 0 0"></div>';
                html += '<div style="font-size:.6rem;color:#7A6652">' + fmtDateShort(d.datum) + '</div>';
                html += '</div>';
            });
            html += '</div></div>';

            // Kriterien-Übersicht
            html += '<div class="card">';
            html += '<h3 style="margin-bottom:.75rem">Nach Kriterium</h3>';
            var letzte = volkDs[0];
            var erste = volkDs[volkDs.length-1];
            KRITERIEN.forEach(function(k) {
                var val = letzte.kriterien[k.key] || 3;
                var altVal = erste.kriterien[k.key] || 3;
                var diff = val - altVal;
                var trend = volkDs.length > 1 ? (diff > 0 ? '<span style="color:#10b981">▲+'+diff+'</span>' : (diff < 0 ? '<span style="color:#ef4444">▼'+diff+'</span>' : '<span style="color:#94a3b8">→</span>')) : '';
                var barColor = val >= 4 ? '#10b981' : (val >= 3 ? '#F5A623' : '#ef4444');

                html += '<div style="margin-bottom:.75rem">';
                html += '<div style="display:flex;justify-content:space-between;font-size:.85rem;margin-bottom:.25rem">';
                html += '<span>' + k.label + '</span>';
                html += '<span><strong>' + val + '/5</strong> ' + trend + '</span>';
                html += '</div>';
                html += '<div style="background:#E8DFD4;height:.5rem;border-radius:.25rem"><div style="background:' + barColor + ';height:100%;border-radius:.25rem;width:' + (val/5*100) + '%;transition:width .3s"></div></div>';
                html += '</div>';
            });
            html += '</div>';

            // Alle Durchsichten
            html += '<div class="card">';
            html += '<h3 style="margin-bottom:.75rem">Alle Durchsichten</h3>';
            volkDs.forEach(function(d) {
                var schnitt = durchschnittKriterien(d.kriterien);
                var tags = (d.taetigkeiten||[]).map(function(t) {
                    var def = TAETIGKEITEN.find(function(x){return x.key===t.key;});
                    var label = def ? def.icon + ' ' + def.label : t.key;
                    if (t.subs && t.subs.length) label += ' (' + t.subs.join(', ') + ')';
                    if (t.menge) label += ' – ' + t.menge + (def&&def.mengeUnit?' '+def.mengeUnit:'');
                    return '<span class="historie-tag">' + label + '</span>';
                }).join('');

                html += '<div class="historie-entry">';
                html += '<div style="display:flex;justify-content:space-between;align-items:flex-start">';
                html += '<div style="flex:1">';
                html += '<div style="font-weight:600;font-size:.9rem">' + fmtDate(d.datum) + ' · ' + renderMiniStars(schnitt) + ' (' + schnitt.toFixed(1) + ')</div>';
                html += '<div class="historie-tags">' + tags + '</div>';
                if (d.varroa && d.varroa.milben) {
                    var mProTag = d.varroa.tage > 0 ? (d.varroa.milben / d.varroa.tage).toFixed(1) : '–';
                    var vClass = mProTag <= 3 ? 'badge-green' : (mProTag <= 10 ? 'badge-yellow' : 'badge-red');
                    html += '<div style="margin-top:.25rem"><span class="badge ' + vClass + '">🔬 ' + mProTag + ' Milben/Tag (' + d.varroa.methode + ')</span></div>';
                }
                if (d.notizen) html += '<div style="font-size:.75rem;color:#94a3b8;margin-top:.25rem">' + d.notizen + '</div>';
                html += '</div>';
                html += '<div style="display:flex;gap:.25rem">';
                html += '<button class="btn btn-blue btn-xs" onclick="openDurchsicht(\'' + d.id + '\')">✏️</button>';
                html += '<button class="btn btn-danger btn-xs" onclick="deleteDurchsicht(\'' + d.id + '\')">🗑️</button>';
                html += '</div></div></div>';
            });
            html += '</div>';
        }
    } else {
        html += '<div class="card" style="text-align:center;padding:1.5rem;color:#7A6652"><p>Wähle ein Volk um die Historie zu sehen.</p></div>';
    }

    return html;
}

// ============================================
// VÖLKER & STANDORTE – VÖLKER MODULE
// Völker-Tab, Karten, Suche, Druck
// ============================================

// === TAB: VÖLKER (Übersicht) ===
function renderVoelkerTab() {
    var html = '';

    if (!standorte.length) {
        html += '<div class="card" style="text-align:center;padding:3rem;color:#7A6652">';
        html += '<div style="font-size:3rem;margin-bottom:1rem">📍</div>';
        html += '<h3>Keine Standorte vorhanden</h3>';
        html += '<p style="margin-top:.5rem">Lege zuerst Standorte und Völker unter 📍 Standorte an.</p>';
        html += '</div>';
        return html;
    }

    // Standort-Kacheln
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:.75rem;margin-bottom:1rem">';
    html += '<div class="standort-card' + (!selectedStandortFilter?' selected':'') + '" onclick="selectedStandortFilter=\'\';render()">';
    html += '<div style="font-size:1.5rem;margin-bottom:.25rem">🐝</div>';
    html += '<div style="font-weight:600;font-size:.85rem">Alle Völker</div>';
    html += '<div style="font-size:.75rem;color:#7A6652">' + voelker.length + ' Völker</div>';
    html += '</div>';
    standorte.forEach(function(s) {
        var cnt = voelker.filter(function(v){return v.standortId===s.id;}).length;
        if (!cnt) return;
        html += '<div class="standort-card' + (selectedStandortFilter===s.id?' selected':'') + '" onclick="selectedStandortFilter=\'' + s.id + '\';render()">';
        html += '<div style="font-size:1.5rem;margin-bottom:.25rem">📍</div>';
        html += '<div style="font-weight:600;font-size:.85rem">' + s.name + '</div>';
        html += '<div style="font-size:.75rem;color:#7A6652">' + cnt + ' Völker</div>';
        html += '<button onclick="event.stopPropagation();druckeAlleQR(\'' + s.id + '\')" style="background:none;border:1px solid #E8DFD4;border-radius:.5rem;padding:.25rem .5rem;cursor:pointer;font-size:.75rem;color:#7A6652;margin-top:.35rem" title="Alle QR-Codes drucken">🏷️ QR-Etiketten</button>';
        html += '</div>';
    });
    html += '</div>';

    // Völker-Grid
    var filteredVoelker = sortVoelkerNumerisch(selectedStandortFilter
        ? voelker.filter(function(v){return v.standortId===selectedStandortFilter;})
        : voelker);

    if (!filteredVoelker.length) {
        html += '<div class="card" style="text-align:center;padding:2rem;color:#7A6652">Keine Völker an diesem Standort.</div>';
        return html;
    }

    html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:.75rem">';
    filteredVoelker.forEach(function(v) {
        html += renderVolkKarte(v);
    });
    html += '</div>';

    return html;
}

function renderVolkKarte(v) {
    var s = standorte.find(function(x){return x.id===v.standortId;});
    var kInfo = koeniginnen[v.id] || {};
    var volkDs = getDurchsichtenFuerVolk(v.id);
    var letzte = volkDs.length ? volkDs[0] : null;

    var html = '<div class="volk-grid-card" onclick="goToVolk(\'' + v.id + '\')" style="cursor:pointer">';

    // Header
    html += '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.5rem">';
    html += '<div>';
    if (v.typ === 'ableger') html += '<span style="font-size:.65rem;background:#D1FAE5;color:#065F46;padding:.1rem .4rem;border-radius:.25rem;font-weight:600;display:inline-block;margin-bottom:.2rem">🌱 Ableger</span>';
    html += '<div style="font-weight:700;font-size:1rem">🐝 ' + v.name + '</div>';
    if (s) html += '<div style="font-size:.72rem;color:#7A6652">📍 ' + s.name + '</div>';
    html += '</div>';
    if (kInfo.jahrgang) {
        var farbDot = kInfo.markiert ? getColorDot(kInfo.farbe) : '';
        html += '<span style="font-size:.75rem;background:#FFF8EE;padding:.15rem .5rem;border-radius:.25rem;color:#92400E;white-space:nowrap">👑 ' + kInfo.jahrgang + ' ' + farbDot + '</span>';
    }
    html += '</div>';

    // Königin-Info kompakt
    if (kInfo.begattung) {
        html += '<div style="font-size:.75rem;color:#7A6652;margin-bottom:.35rem">';
        var details = [];
        if (kInfo.begattung) details.push(kInfo.begattung);
        if (kInfo.zuchtbuchNr) details.push('Nr: ' + kInfo.zuchtbuchNr);
        html += details.join(' · ');
        html += '</div>';
    }

    // Abstammung
    if (kInfo.muttervolk_id || kInfo.drohnenvolk_id) {
        html += '<div style="font-size:.72rem;color:#92400E;background:#FFFBF0;padding:.3rem .5rem;border-radius:.35rem;margin-bottom:.35rem">';
        if (kInfo.muttervolk_id) {
            var mv = voelker.find(function(x){return x.id===kInfo.muttervolk_id;});
            if (mv) html += '👑 ' + mv.name + ' ';
        }
        if (kInfo.drohnenvolk_id) {
            var dv = voelker.find(function(x){return x.id===kInfo.drohnenvolk_id;});
            if (dv) html += '🐝♂ ' + dv.name;
        }
        html += '</div>';
    }

    // Letzte Durchsicht
    if (letzte) {
        var schnitt = durchschnittKriterien(letzte.kriterien);
        var tage = Math.floor((Date.now() - new Date(letzte.datum).getTime()) / 86400000);
        var tageLabel = tage === 0 ? 'Heute' : tage === 1 ? 'Gestern' : 'vor ' + tage + ' Tagen';
        var tageColor = tage > 14 ? '#ef4444' : tage > 7 ? '#f59e0b' : '#10b981';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;font-size:.75rem;padding-top:.35rem;border-top:1px solid #f5f0eb">';
        html += '<span>' + renderMiniStars(schnitt) + '</span>';
        html += '<span style="color:' + tageColor + ';font-weight:500">' + tageLabel + '</span>';
        html += '</div>';
    } else {
        html += '<div style="font-size:.75rem;color:#A69580;padding-top:.35rem;border-top:1px solid #f5f0eb">Noch keine Durchsicht</div>';
    }

    html += '<div style="margin-top:.5rem;text-align:right"><button onclick="event.stopPropagation();druckeStockkarte(\'' + v.id + '\')" style="background:none;border:none;cursor:pointer;font-size:.85rem;color:#7A6652" title="Stockkarte drucken">🖨️</button></div>';

    html += '</div>';
    return html;
}

// === SUCHFUNKTION ===
function renderSuchergebnisse() {
    var html = '';
    var q = suchBegriff.trim().toLowerCase();

    var treffer = voelker.filter(function(v) {
        if (v.name.toLowerCase().indexOf(q) > -1) return true;
        var s = standorte.find(function(x){return x.id===v.standortId;});
        if (s && s.name.toLowerCase().indexOf(q) > -1) return true;
        var kInfo = koeniginnen[v.id];
        if (kInfo) {
            if (kInfo.zuchtbuchNr && kInfo.zuchtbuchNr.toLowerCase().indexOf(q) > -1) return true;
            if (kInfo.begattung && kInfo.begattung.toLowerCase().indexOf(q) > -1) return true;
        }
        return false;
    });

    if (!treffer.length) {
        html += '<div class="card" style="text-align:center;padding:2rem;color:#7A6652">';
        html += '<div style="font-size:2rem;margin-bottom:.5rem">🔍</div>';
        html += '<p>Kein Volk gefunden für "<strong>' + suchBegriff + '</strong>"</p>';
        html += '</div>';
        return html;
    }

    html += '<div style="font-size:.8rem;color:#7A6652;margin-bottom:.5rem">' + treffer.length + ' Ergebnis' + (treffer.length>1?'se':'') + ' für "<strong>' + suchBegriff + '</strong>"</div>';

    if (treffer.length === 1) {
        html += renderVolkProfil(treffer[0]);
        return html;
    }

    treffer = sortVoelkerNumerisch(treffer);
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:.75rem">';
    treffer.forEach(function(v) {
        html += renderVolkKarte(v);
    });
    html += '</div>';

    return html;
}

function renderVolkProfil(v) {
    var html = '';
    var s = standorte.find(function(x){return x.id===v.standortId;});
    var kInfo = koeniginnen[v.id] || {};
    var volkDs = getDurchsichtenFuerVolk(v.id);

    html += '<div class="such-ergebnis">';
    html += '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.75rem">';
    html += '<div>';
    html += '<h2 style="margin:0;font-size:1.2rem">🐝 ' + v.name + '</h2>';
    if (s) html += '<div style="font-size:.85rem;color:#7A6652">📍 ' + s.name + '</div>';
    html += '</div>';
    html += '<div style="display:flex;gap:.5rem">';
    html += '<button class="btn btn-sm" onclick="selectedVerlaufVolk=\'' + v.id + '\';suchBegriff=\'\';switchTab(\'historie\')" style="padding:.3rem .6rem;background:#F5A623;color:#fff;border:none;border-radius:.5rem;font-size:.75rem;cursor:pointer">📜 Historie</button>';
    html += '<button class="btn btn-sm" onclick="selectedStammbaumVolk=\'' + v.id + '\';suchBegriff=\'\';switchTab(\'stammbaum\')" style="padding:.3rem .6rem;background:#F5A623;color:#fff;border:none;border-radius:.5rem;font-size:.75rem;cursor:pointer">🌳 Stammbaum</button>';
    html += '</div>';
    html += '</div>';

    // Königin-Info
    if (kInfo.begattung || kInfo.jahrgang || kInfo.zuchtbuchNr) {
        html += '<div class="koenigin-section" style="margin-bottom:.75rem">';
        html += '<h4>👑 Königinnen-Info</h4>';
        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:.4rem;font-size:.85rem">';
        if (kInfo.jahrgang) html += '<div><span style="color:#7A6652">Jahrgang:</span> <strong>' + kInfo.jahrgang + '</strong> ' + (kInfo.markiert?getColorDot(kInfo.farbe):'') + '</div>';
        if (kInfo.begattung) html += '<div><span style="color:#7A6652">Begattung:</span> <strong>' + kInfo.begattung + '</strong></div>';
        if (kInfo.herkunft) html += '<div><span style="color:#7A6652">Herkunft:</span> <strong>' + formatHerkunft(kInfo.herkunft) + '</strong></div>';
        if (kInfo.zuchtbuchNr) html += '<div><span style="color:#7A6652">Zuchtbuch:</span> <strong>' + kInfo.zuchtbuchNr + '</strong></div>';
        if (kInfo.belegstelle) html += '<div style="grid-column:1/-1"><span style="color:#7A6652">Belegstelle:</span> <strong>' + kInfo.belegstelle + '</strong></div>';
        if (kInfo.muttervolk_id) {
            var mv = voelker.find(function(x){return x.id===kInfo.muttervolk_id;});
            if (mv) html += '<div><span style="color:#7A6652">Muttervolk:</span> <strong>' + mv.name + '</strong></div>';
        }
        if (kInfo.drohnenvolk_id) {
            var dv = voelker.find(function(x){return x.id===kInfo.drohnenvolk_id;});
            if (dv) html += '<div><span style="color:#7A6652">Drohnenvolk:</span> <strong>' + dv.name + '</strong></div>';
        }
        html += '</div>';

        if (kInfo.zuchtwerte && Object.keys(kInfo.zuchtwerte).some(function(k){return kInfo.zuchtwerte[k];})) {
            html += '<div style="margin-top:.5rem;padding-top:.5rem;border-top:1px solid rgba(245,166,35,0.15)">';
            html += '<div style="font-size:.78rem;font-weight:600;color:#92400E;margin-bottom:.3rem">📊 Zuchtwerte</div>';
            html += '<div style="display:flex;flex-wrap:wrap;gap:.4rem">';
            [{key:'honig',icon:'🍯'},{key:'sanftmut',icon:'🤲'},{key:'wabensitz',icon:'🪵'},{key:'schwarm',icon:'🐝'},{key:'varroa',icon:'🔬'},{key:'gesamt',icon:'⭐'}].forEach(function(zw) {
                if (kInfo.zuchtwerte[zw.key]) {
                    var val = kInfo.zuchtwerte[zw.key];
                    var c = val >= 110 ? '#10b981' : val >= 90 ? '#7A6652' : '#ef4444';
                    html += '<span style="font-size:.72rem;padding:.15rem .4rem;border-radius:.25rem;background:#f5f0eb;color:' + c + '">' + zw.icon + ' ' + val + '</span>';
                }
            });
            html += '</div></div>';
        }
        html += '</div>';
    }

    // Letzte Bewertung
    if (volkDs.length) {
        var letzte = volkDs[0];
        var schnitt = durchschnittKriterien(letzte.kriterien);
        html += '<div style="margin-bottom:.75rem">';
        html += '<div style="font-size:.82rem;font-weight:600;margin-bottom:.35rem">Letzte Durchsicht: ' + fmtDate(letzte.datum) + '</div>';
        html += '<div style="display:flex;flex-wrap:wrap;gap:.35rem;margin-bottom:.35rem">';
        KRITERIEN.forEach(function(k) {
            var val = letzte.kriterien[k.key] || 3;
            var c = val >= 4 ? '#10b981' : val <= 2 ? '#ef4444' : '#f59e0b';
            html += '<span style="font-size:.7rem;padding:.2rem .4rem;border-radius:.25rem;background:#f5f0eb"><span style="color:' + c + '">●</span> ' + k.label.split(' ').pop() + ' ' + val + '/5</span>';
        });
        html += '</div>';
        var tags = (letzte.taetigkeiten||[]).map(function(t) {
            var def = TAETIGKEITEN.find(function(x){return x.key===t.key;});
            return def ? def.icon + ' ' + def.label : t.key;
        });
        if (tags.length) {
            html += '<div style="display:flex;flex-wrap:wrap;gap:.25rem">';
            tags.forEach(function(t) { html += '<span class="historie-tag">' + t + '</span>'; });
            html += '</div>';
        }
        if (letzte.notizen) html += '<div style="font-size:.78rem;color:#7A6652;margin-top:.3rem;font-style:italic">"' + letzte.notizen + '"</div>';
        html += '</div>';
    }

    // Durchsicht-Historie kompakt
    if (volkDs.length > 1) {
        html += '<div style="border-top:1px solid #E8DFD4;padding-top:.5rem">';
        html += '<div style="font-size:.82rem;font-weight:600;margin-bottom:.35rem">📜 Alle Durchsichten (' + volkDs.length + ')</div>';
        volkDs.slice(0, 10).forEach(function(d, i) {
            if (i === 0) return;
            var tags = (d.taetigkeiten||[]).map(function(t){
                var def = TAETIGKEITEN.find(function(x){return x.key===t.key;});
                return def ? def.icon : '';
            }).join(' ');
            html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:.35rem 0;font-size:.8rem;border-bottom:1px solid #f5f0eb">';
            html += '<span>' + fmtDate(d.datum) + ' ' + tags + '</span>';
            html += '<span>' + renderMiniStars(durchschnittKriterien(d.kriterien)) + '</span>';
            html += '</div>';
        });
        if (volkDs.length > 10) html += '<div style="font-size:.75rem;color:#A69580;margin-top:.25rem">... und ' + (volkDs.length - 10) + ' weitere</div>';
        html += '</div>';
    }

    // QR-Code
    html += '<div style="margin-top:1rem;padding:1rem;background:#f5f0eb;border-radius:.75rem;text-align:center">';
    html += '<div style="font-size:.85rem;font-weight:600;color:#3D2E1F;margin-bottom:.5rem">📱 QR-Code für dieses Volk</div>';
    html += '<div id="qrcode-' + v.id + '" style="display:inline-block;background:#fff;padding:.75rem;border-radius:.5rem"></div>';
    html += '<div style="margin-top:.75rem;display:flex;gap:.5rem;justify-content:center;flex-wrap:wrap">';
    html += '<button class="btn btn-sm btn-primary" onclick="druckeStockkarte(\'' + v.id + '\')">🖨️ Stockkarte drucken</button>';
    html += '</div>';
    html += '</div>';

    html += '</div>';
    return html;
}

// === DRUCK-FUNKTIONEN ===
function druckeStockkarte(volkId) {
    var v = voelker.find(function(x){return x.id===volkId;});
    if (!v) return;
    var s = standorte.find(function(x){return x.id===v.standortId;});
    var kInfo = koeniginnen[volkId] || {};
    var volkDs = durchsichten.filter(function(d){return d.volkId===volkId;}).sort(function(a,b){return b.datum.localeCompare(a.datum);});

    var w = window.open('','_blank');
    var h = '';
    h += '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Stockkarte ' + v.name + '</title>';
    h += '<script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"><\/script>';
    h += '<style>';
    h += '*{margin:0;padding:0;box-sizing:border-box}';
    h += 'body{font-family:Arial,sans-serif;padding:1.5rem;color:#1C1410;font-size:.8rem}';
    h += 'h1{font-size:1.4rem;margin-bottom:.15rem}';
    h += 'h2{font-size:1rem;color:#92400E;margin:1rem 0 .5rem;border-bottom:2px solid #E8DFD4;padding-bottom:.25rem}';
    h += '.subtitle{color:#7A6652;font-size:.85rem;margin-bottom:1rem}';
    h += '.grid{display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:.75rem}';
    h += '.grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:.5rem;margin-bottom:.75rem}';
    h += '.box{border:1px solid #E8DFD4;border-radius:.4rem;padding:.6rem}';
    h += '.box h3{font-size:.8rem;color:#92400E;margin-bottom:.4rem;border-bottom:1px solid #E8DFD4;padding-bottom:.2rem}';
    h += '.box p{margin-bottom:.2rem}';
    h += '.stars{color:#F5A623;letter-spacing:1px}';
    h += '.ds-entry{border:1px solid #E8DFD4;border-radius:.4rem;padding:.6rem;margin-bottom:.5rem;page-break-inside:avoid}';
    h += '.ds-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:.35rem;font-weight:600}';
    h += '.ds-tags{display:flex;flex-wrap:wrap;gap:.25rem;margin-bottom:.35rem}';
    h += '.ds-tag{background:#f5f0eb;padding:.15rem .4rem;border-radius:.25rem;font-size:.7rem}';
    h += '.zw-bar{display:flex;align-items:center;gap:.4rem;margin-bottom:.2rem}';
    h += '.zw-bar .bar{height:8px;border-radius:4px;min-width:4px}';
    h += '.zw-label{width:100px;font-size:.7rem}';
    h += '.zw-val{font-size:.7rem;font-weight:600;width:30px;text-align:right}';
    h += '.qr-section{text-align:center;margin-top:1rem;padding-top:.75rem;border-top:2px solid #E8DFD4}';
    h += '.qr-section p{font-size:.65rem;color:#7A6652;margin-top:.35rem}';
    h += '.footer{display:flex;justify-content:space-between;align-items:flex-end}';
    h += '.footer-left{flex:1}';
    h += '@media print{body{padding:1cm}h2{margin-top:.75rem}}';
    h += '</style></head><body>';

    var typIcon = (v.typ === 'ableger') ? '🌱' : '🐝';
    h += '<h1>' + typIcon + ' ' + v.name + '</h1>';
    h += '<div class="subtitle">📍 ' + (s ? s.name : 'Unbekannt') + ' | Status: ' + (v.status || 'ok') + (v.typ === 'ableger' ? ' | Ableger' : '') + ' | Erstellt: ' + new Date().toLocaleDateString('de-DE') + '</div>';

    h += '<h2>👑 Königin</h2>';
    h += '<div class="grid">';
    h += '<div class="box"><h3>Stammdaten</h3>';
    if (kInfo.begattung) {
        h += '<p>Begattung: <strong>' + kInfo.begattung + '</strong></p>';
        if (kInfo.herkunft) h += '<p>Herkunft: ' + kInfo.herkunft + '</p>';
        if (kInfo.jahrgang) h += '<p>Jahrgang: ' + kInfo.jahrgang + '</p>';
        if (kInfo.farbe) h += '<p>Markierung: ' + kInfo.farbe + (kInfo.markiert ? ' ✓' : '') + '</p>';
        if (kInfo.belegstelle) h += '<p>Belegstelle: ' + kInfo.belegstelle + '</p>';
        if (kInfo.zuchtbuchNr) h += '<p>Zuchtbuch: <strong>' + kInfo.zuchtbuchNr + '</strong></p>';
        if (kInfo.nummer) h += '<p>Nummer: ' + kInfo.nummer + '</p>';
        if (kInfo.muttervolk_id) {
            var mv = voelker.find(function(x){return x.id===kInfo.muttervolk_id;});
            if (mv) h += '<p>Muttervolk: ' + mv.name + '</p>';
        }
        if (kInfo.drohnenvolk_id) {
            var dv = voelker.find(function(x){return x.id===kInfo.drohnenvolk_id;});
            if (dv) h += '<p>Drohnenvolk: ' + dv.name + '</p>';
        }
    } else {
        h += '<p style="color:#9CA3AF">Keine Königin-Daten</p>';
    }
    h += '</div>';

    h += '<div class="box"><h3>Zuchtwerte (BeeBreed)</h3>';
    if (kInfo.zuchtwerte && kInfo.zuchtbuchNr) {
        var zw = kInfo.zuchtwerte;
        var zwKeys = [{key:'honig',label:'Honig'},{key:'sanftmut',label:'Sanftmut'},{key:'wabensitz',label:'Wabensitz'},{key:'schwarm',label:'Schwarmtrieb'},{key:'varroa',label:'Varroa'},{key:'gesamt',label:'Gesamt'}];
        zwKeys.forEach(function(z) {
            var val = zw[z.key] || 100;
            var pct = Math.min(150, Math.max(50, val));
            var color = val >= 110 ? '#10b981' : val >= 100 ? '#F5A623' : '#ef4444';
            h += '<div class="zw-bar"><span class="zw-label">' + z.label + '</span><div style="flex:1;background:#f5f0eb;border-radius:4px;height:8px"><div class="bar" style="width:' + ((pct-50)/100*100) + '%;background:' + color + '"></div></div><span class="zw-val">' + val + '</span></div>';
        });
    } else {
        h += '<p style="color:#9CA3AF">Keine Zuchtwerte</p>';
    }
    h += '</div></div>';

    h += '<h2>📋 Durchsichten (' + volkDs.length + ')</h2>';
    if (volkDs.length === 0) {
        h += '<p style="color:#9CA3AF">Keine Durchsichten vorhanden</p>';
    }
    volkDs.forEach(function(ds) {
        h += '<div class="ds-entry">';
        var schnitt = 0, anzahl = 0;
        if (ds.kriterien) {
            KRITERIEN.forEach(function(k) {
                var w = ds.kriterien[k.key];
                if (w && w !== 3) { schnitt += w; anzahl++; }
                else { schnitt += 3; anzahl++; }
            });
        }
        var avg = anzahl > 0 ? (schnitt / anzahl).toFixed(1) : '–';
        h += '<div class="ds-header"><span>📅 ' + new Date(ds.datum).toLocaleDateString('de-DE') + '</span><span>' + avg + ' ⌀</span></div>';
        if (ds.taetigkeiten && ds.taetigkeiten.length) {
            h += '<div class="ds-tags">';
            ds.taetigkeiten.forEach(function(t) {
                var tDef = TAETIGKEITEN.find(function(td){return td.key===t.key;});
                var label = tDef ? (tDef.icon + ' ' + tDef.label) : t.key;
                if (t.subs && t.subs.length) label += ' (' + t.subs.join(', ') + ')';
                if (t.menge) label += ' ' + t.menge;
                h += '<span class="ds-tag">' + label + '</span>';
            });
            h += '</div>';
        }
        if (ds.kriterien) {
            h += '<div class="grid3">';
            KRITERIEN.forEach(function(k) {
                var w = ds.kriterien[k.key] || 3;
                var sterne = '';
                for (var i = 1; i <= 5; i++) sterne += i <= w ? '★' : '☆';
                h += '<div style="font-size:.7rem"><span style="color:#7A6652">' + k.label.split(' ').slice(1).join(' ') + ':</span> <span class="stars">' + sterne + '</span></div>';
            });
            h += '</div>';
        }
        if (ds.varroa && parseInt(ds.varroa.milben) > 0) {
            var milbenTag = ds.varroa.tage > 0 ? (ds.varroa.milben / ds.varroa.tage).toFixed(1) : ds.varroa.milben;
            h += '<p>🔬 Varroa: <strong>' + milbenTag + ' Milben/Tag</strong> (' + ds.varroa.methode + ')</p>';
        }
        if (ds.notizen) {
            h += '<p>💬 ' + ds.notizen + '</p>';
        }
        h += '</div>';
    });

    h += '<div class="qr-section"><div class="footer"><div class="footer-left">';
    h += '<p>QR-Code scannen um dieses Volk in der App zu öffnen</p>';
    h += '<p style="font-size:.6rem;color:#A69580">bienenplan.de | ' + v.name + ' | ' + (s ? s.name : '') + '</p>';
    h += '</div><div id="printQR"></div></div></div>';

    h += '<script>new QRCode(document.getElementById("printQR"),{text:"https://www.bienenplan.de/voelker.html?volk=' + volkId + '",width:120,height:120,colorDark:"#1C1410",colorLight:"#ffffff"});setTimeout(function(){window.print();},600);<\/script>';
    h += '</body></html>';
    w.document.write(h);
    w.document.close();
}

function druckeAlleQR(standortId) {
    var s = standorte.find(function(x){return x.id===standortId;});
    var sVoelker = voelker.filter(function(v){return v.standortId===standortId;});
    if (!sVoelker.length) { toast('Keine Völker an diesem Standort'); return; }

    var w = window.open('','_blank');
    w.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>QR-Etiketten ' + (s?s.name:'') + '</title>');
    w.document.write('<script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"><\/script>');
    w.document.write('<style>');
    w.document.write('*{margin:0;padding:0;box-sizing:border-box}');
    w.document.write('body{font-family:Arial,sans-serif;padding:1.5rem;color:#1C1410}');
    w.document.write('h1{font-size:1.2rem;margin-bottom:.25rem}');
    w.document.write('.subtitle{color:#7A6652;font-size:.8rem;margin-bottom:1.5rem}');
    w.document.write('.etiketten{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem}');
    w.document.write('.etikett{border:1px dashed #E8DFD4;border-radius:.5rem;padding:.75rem;text-align:center;page-break-inside:avoid}');
    w.document.write('.etikett h3{font-size:.85rem;margin-bottom:.25rem}');
    w.document.write('.etikett .standort{font-size:.7rem;color:#7A6652;margin-bottom:.5rem}');
    w.document.write('.etikett .qr{display:inline-block}');
    w.document.write('.etikett .url{font-size:.55rem;color:#A69580;margin-top:.35rem;word-break:break-all}');
    w.document.write('@media print{body{padding:1cm}.etiketten{gap:.75rem}}');
    w.document.write('</style></head><body>');

    w.document.write('<h1>🏷️ QR-Etiketten</h1>');
    w.document.write('<div class="subtitle">📍 ' + (s?s.name:'Standort') + ' — ' + sVoelker.length + ' Völker</div>');
    w.document.write('<div class="etiketten">');

    sVoelker.forEach(function(v) {
        w.document.write('<div class="etikett">');
        w.document.write('<h3>🐝 ' + v.name + '</h3>');
        w.document.write('<div class="standort">' + (s?s.name:'') + '</div>');
        w.document.write('<div class="qr" id="qr-' + v.id + '"></div>');
        w.document.write('<div class="url">bienenplan.de</div>');
        w.document.write('</div>');
    });

    w.document.write('</div>');
    w.document.write('<script>');
    sVoelker.forEach(function(v) {
        w.document.write('new QRCode(document.getElementById("qr-' + v.id + '"),{text:"https://www.bienenplan.de/voelker.html?volk=' + v.id + '",width:100,height:100,colorDark:"#1C1410",colorLight:"#ffffff"});');
    });
    w.document.write('setTimeout(function(){window.print();},800);');
    w.document.write('<\/script>');
    w.document.write('</body></html>');
    w.document.close();
}

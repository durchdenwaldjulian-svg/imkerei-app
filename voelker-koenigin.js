// ============================================
// VÖLKER & STANDORTE – KÖNIGIN / STAMMBAUM MODULE
// ============================================

// === TAB: STAMMBAUM ===
function renderStammbaum() {
    var html = '';

    html += '<div class="card">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.75rem">';
    html += '<h3 style="margin:0">🌳 Stammbaum</h3>';
    if (selectedStammbaumVolk) {
        html += '<button onclick="exportStammbaumPDF()" style="padding:.4rem .8rem;background:#F5A623;color:#fff;border:none;border-radius:.5rem;font-size:.8rem;font-weight:600;cursor:pointer">📄 PDF Export</button>';
    }
    html += '</div>';
    html += '<select class="input" onchange="selectedStammbaumVolk=this.value;render()">';
    html += '<option value="">-- Volk wählen --</option>';
    standorte.forEach(function(s) {
        var sV = voelker.filter(function(v){return v.standortId===s.id;});
        if (!sV.length) return;
        html += '<optgroup label="📍 ' + s.name + '">';
        sV.forEach(function(v) {
            var kI = koeniginnen[v.id];
            var hatAbstammung = kI && (kI.muttervolk_id || kI.drohnenvolk_id);
            html += '<option value="' + v.id + '"' + (selectedStammbaumVolk===v.id?' selected':'') + '>' + v.name + (hatAbstammung?' 🌳':'') + '</option>';
        });
        html += '</optgroup>';
    });
    html += '</select></div>';

    if (!selectedStammbaumVolk) {
        var mitAbstammung = voelker.filter(function(v) {
            var kI = koeniginnen[v.id];
            return kI && (kI.muttervolk_id || kI.drohnenvolk_id);
        });

        if (mitAbstammung.length) {
            html += '<div class="card"><h3 style="margin-bottom:.75rem">🌳 Völker mit Abstammung</h3>';
            html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:.75rem">';
            mitAbstammung.forEach(function(v) {
                var kI = koeniginnen[v.id] || {};
                var s = standorte.find(function(x){return x.id===v.standortId;});
                var mv = kI.muttervolk_id ? voelker.find(function(x){return x.id===kI.muttervolk_id;}) : null;
                var dv = kI.drohnenvolk_id ? voelker.find(function(x){return x.id===kI.drohnenvolk_id;}) : null;
                html += '<div class="volk-grid-card" onclick="selectedStammbaumVolk=\'' + v.id + '\';render()" style="cursor:pointer">';
                html += '<div style="font-weight:700">🐝 ' + v.name + '</div>';
                if (s) html += '<div style="font-size:.72rem;color:#7A6652">📍 ' + s.name + '</div>';
                html += '<div style="margin-top:.35rem;font-size:.78rem">';
                if (mv) html += '<div style="color:#D4930D">👑 Mutter: ' + mv.name + '</div>';
                if (dv) html += '<div style="color:#3B82F6">🐝♂ Drohne: ' + dv.name + '</div>';
                html += '</div></div>';
            });
            html += '</div></div>';
        } else {
            html += '<div class="card" style="text-align:center;padding:3rem;color:#7A6652">';
            html += '<div style="font-size:3rem;margin-bottom:1rem">🌳</div>';
            html += '<h3>Noch keine Abstammungsdaten</h3>';
            html += '<p style="margin-top:.5rem">Pflege Mutter- und Drohnenvolk über 📋 Durchsicht → 👑 Königin → 🌳 Abstammung</p>';
            html += '</div>';
        }
        return html;
    }

    html += '<div id="stammbaumContainer" class="card" style="overflow-x:auto">';
    html += '<div class="stammbaum-tree">';
    html += renderBaumKnoten(selectedStammbaumVolk, 0);
    html += '</div></div>';

    html += '<div class="card" style="display:flex;gap:1.5rem;align-items:center;flex-wrap:wrap;font-size:.8rem;color:#7A6652">';
    html += '<strong>Legende:</strong>';
    html += '<span class="stammbaum-label mutter" style="margin:0">👑 Muttervolk</span>';
    html += '<span class="stammbaum-label drohne" style="margin:0">🐝 Drohnenvolk</span>';
    html += '</div>';

    return html;
}

function renderBaumKnoten(volkId, tiefe) {
    if (!volkId || tiefe > 4) return '';
    var v = voelker.find(function(x){return x.id===volkId;});
    if (!v) return '<div style="padding:.5rem;color:#A69580;font-size:.8rem;font-style:italic;text-align:center">Volk nicht mehr vorhanden</div>';

    var kInfo = koeniginnen[volkId] || {};
    var s = standorte.find(function(x){return x.id===v.standortId;});

    var html = '<div class="stammbaum-connector">';

    var cls = 'stammbaum-node-card' + (tiefe===0?' root':'');
    html += '<div class="' + cls + '">';

    if (tiefe > 0) html += '<span class="stammbaum-gen">Gen ' + tiefe + '</span>';

    if (kInfo.markiert && kInfo.farbe) {
        var fMap = {weiss:'#E5E7EB',gelb:'#FDE047',rot:'#EF4444',gruen:'#22C55E',blau:'#3B82F6'};
        html += '<div style="width:12px;height:12px;border-radius:50%;background:' + (fMap[kInfo.farbe]||'#ccc') + ';border:2px solid rgba(0,0,0,0.15);position:absolute;top:.75rem;left:.75rem"></div>';
    }

    html += '<div style="font-weight:700;font-size:' + (tiefe===0?'1.15rem':'1rem') + ';margin-bottom:.25rem">';
    if (tiefe===0) html += '👑 ';
    html += v.name + '</div>';
    if (s) html += '<div style="font-size:.72rem;color:#7A6652;margin-bottom:.35rem">📍 ' + s.name + '</div>';

    var chips = [];
    if (kInfo.jahrgang) chips.push('<span class="stammbaum-badge" style="background:#FFF8EE;color:#92400E">' + kInfo.jahrgang + '</span>');
    if (kInfo.begattung) chips.push('<span class="stammbaum-badge" style="background:#f5f0eb;color:#7A6652">' + kInfo.begattung + '</span>');
    if (kInfo.zuchtbuchNr) chips.push('<span class="stammbaum-badge" style="background:#EEF2FF;color:#5B21B6;font-family:monospace">' + kInfo.zuchtbuchNr + '</span>');
    if (chips.length) html += '<div style="display:flex;flex-wrap:wrap;gap:.25rem;justify-content:center;margin-bottom:.25rem">' + chips.join('') + '</div>';

    if (kInfo.zuchtwerte && kInfo.zuchtwerte.gesamt) {
        var val = kInfo.zuchtwerte.gesamt;
        var barColor = val >= 110 ? '#10b981' : val >= 100 ? '#F5A623' : val >= 90 ? '#f59e0b' : '#ef4444';
        var barW = Math.min(Math.max((val - 70) * 100 / 60, 5), 100);
        html += '<div style="margin-top:.25rem">';
        html += '<div style="font-size:.65rem;color:#7A6652;margin-bottom:.15rem">⭐ Zuchtwert: <strong>' + val + '</strong></div>';
        html += '<div style="height:6px;background:#f5f0eb;border-radius:3px;overflow:hidden"><div style="height:100%;width:' + barW + '%;background:' + barColor + ';border-radius:3px;transition:width .5s"></div></div>';
        html += '</div>';
    }

    html += '</div>';

    var hatMutter = kInfo.muttervolk_id && voelker.find(function(x){return x.id===kInfo.muttervolk_id;});
    var hatDrohne = kInfo.drohnenvolk_id && voelker.find(function(x){return x.id===kInfo.drohnenvolk_id;});

    if (hatMutter || hatDrohne) {
        html += '<div class="stammbaum-vline"></div>';
        html += '<div class="stammbaum-eltern">';

        if (hatMutter) {
            html += '<div class="stammbaum-zweig">';
            html += '<span class="stammbaum-label mutter">👑 Muttervolk</span>';
            html += '<div class="stammbaum-vline"></div>';
            html += renderBaumKnoten(kInfo.muttervolk_id, tiefe + 1);
            html += '</div>';
        }

        if (hatDrohne) {
            html += '<div class="stammbaum-zweig">';
            html += '<span class="stammbaum-label drohne">🐝 Drohnenvolk</span>';
            html += '<div class="stammbaum-vline drohne"></div>';
            html += renderBaumKnoten(kInfo.drohnenvolk_id, tiefe + 1);
            html += '</div>';
        }

        html += '</div>';
    } else if (tiefe === 0) {
        html += '<div style="margin-top:1rem;padding:.75rem;color:#A69580;font-size:.85rem;background:#FFFBF0;border-radius:.5rem;text-align:center;max-width:400px">';
        html += '💡 Pflege Mutter- und Drohnenvolk über 📋 Durchsicht → 👑 Königin → 🌳 Abstammung';
        html += '</div>';
    }

    html += '</div>';
    return html;
}

// === PDF EXPORT ===
function exportStammbaumPDF() {
    var container = document.getElementById('stammbaumContainer');
    if (!container) return;

    var v = voelker.find(function(x){return x.id===selectedStammbaumVolk;});
    var volkName = v ? v.name : 'Unbekannt';
    var datum = new Date().toLocaleDateString('de-DE');

    var printWin = window.open('', '_blank');
    printWin.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Stammbaum – ' + volkName + '</title>');
    printWin.document.write('<style>');
    printWin.document.write('*{margin:0;padding:0;box-sizing:border-box}');
    printWin.document.write('body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:2rem;color:#1C1410;max-width:900px;margin:auto}');
    printWin.document.write('.header{text-align:center;margin-bottom:2rem;padding-bottom:1rem;border-bottom:3px solid #F5A623}');
    printWin.document.write('.header h1{font-size:1.5rem;color:#1C1410;margin-bottom:.25rem}');
    printWin.document.write('.header p{font-size:.85rem;color:#7A6652}');
    printWin.document.write('.stammbaum-tree{display:flex;flex-direction:column;align-items:center}');
    printWin.document.write('.stammbaum-connector{display:flex;flex-direction:column;align-items:center}');
    printWin.document.write('.stammbaum-node-card{border:2px solid #E8DFD4;border-radius:1rem;padding:.75rem 1rem;min-width:180px;max-width:280px;text-align:center;position:relative;margin-bottom:.25rem;background:#fff}');
    printWin.document.write('.stammbaum-node-card.root{border-color:#F5A623;border-width:3px;background:#FFFBF0}');
    printWin.document.write('.stammbaum-node-card.mutter{border-left:4px solid #D4930D}');
    printWin.document.write('.stammbaum-node-card.drohne{border-left:4px solid #3B82F6}');
    printWin.document.write('.stammbaum-vline{width:2px;height:20px;background:#ccc}');
    printWin.document.write('.stammbaum-eltern{display:flex;justify-content:center;gap:1.5rem;flex-wrap:wrap;position:relative}');
    printWin.document.write('.stammbaum-eltern::before{content:"";position:absolute;top:-10px;left:25%;right:25%;height:2px;background:#ccc}');
    printWin.document.write('.stammbaum-zweig{display:flex;flex-direction:column;align-items:center;flex:1;min-width:200px}');
    printWin.document.write('.stammbaum-label{font-size:.65rem;font-weight:700;text-transform:uppercase;padding:.2rem .5rem;border-radius:999px;margin-bottom:.25rem}');
    printWin.document.write('.stammbaum-label.mutter{background:#FFF3CD;color:#92400E}');
    printWin.document.write('.stammbaum-label.drohne{background:#DBEAFE;color:#1E40AF}');
    printWin.document.write('.stammbaum-badge{display:inline-block;font-size:.6rem;padding:.1rem .3rem;border-radius:.2rem}');
    printWin.document.write('.stammbaum-gen{font-size:.55rem;color:#999;position:absolute;top:-.4rem;right:-.4rem;background:#f5f5f5;padding:.1rem .25rem;border-radius:.2rem}');
    printWin.document.write('.legende{margin-top:2rem;padding-top:1rem;border-top:1px solid #E8DFD4;font-size:.8rem;color:#7A6652;display:flex;gap:1rem;align-items:center}');
    printWin.document.write('@media print{body{padding:.5rem}@page{margin:1.5cm;size:landscape}}');
    printWin.document.write('</style></head><body>');
    printWin.document.write('<div class="header"><h1>🌳 Stammbaum – ' + volkName + '</h1>');
    printWin.document.write('<p>Erstellt am ' + datum + ' · Imkerei Tagesplaner</p></div>');
    printWin.document.write(container.innerHTML);
    printWin.document.write('<div class="legende"><strong>Legende:</strong> <span class="stammbaum-label mutter">👑 Muttervolk</span> <span class="stammbaum-label drohne">🐝 Drohnenvolk</span></div>');
    printWin.document.write('</body></html>');
    printWin.document.close();
    setTimeout(function(){ printWin.print(); }, 500);
}

// ============================================
// DRUCK-MODULE.JS – Stockkarte drucken, QR-Etiketten, Stammbaum PDF
// ============================================

function druckeStockkarte(volkId) {
    var v = voelker.find(function(x){return x.id===volkId;}); if (!v) return;
    var s = standorte.find(function(x){return x.id===v.standortId;});
    var kInfo = koeniginnen[volkId] || {};
    var volkDs = durchsichten.filter(function(d){return d.volkId===volkId;}).sort(function(a,b){return b.datum.localeCompare(a.datum);});
    var w = window.open('','_blank'); var h = '';
    h += '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Stockkarte ' + v.name + '</title>';
    h += '<script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"><\/script>';
    h += '<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;padding:1.5rem;color:#1C1410;font-size:.8rem}h1{font-size:1.4rem;margin-bottom:.15rem}h2{font-size:1rem;color:#92400E;margin:1rem 0 .5rem;border-bottom:2px solid #E8DFD4;padding-bottom:.25rem}.subtitle{color:#7A6652;font-size:.85rem;margin-bottom:1rem}.grid{display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:.75rem}.grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:.5rem;margin-bottom:.75rem}.box{border:1px solid #E8DFD4;border-radius:.4rem;padding:.6rem}.box h3{font-size:.8rem;color:#92400E;margin-bottom:.4rem;border-bottom:1px solid #E8DFD4;padding-bottom:.2rem}.stars{color:#F5A623;letter-spacing:1px}.ds-entry{border:1px solid #E8DFD4;border-radius:.4rem;padding:.6rem;margin-bottom:.5rem;page-break-inside:avoid}.ds-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:.35rem;font-weight:600}.ds-tags{display:flex;flex-wrap:wrap;gap:.25rem;margin-bottom:.35rem}.ds-tag{background:#f5f0eb;padding:.15rem .4rem;border-radius:.25rem;font-size:.7rem}.zw-bar{display:flex;align-items:center;gap:.4rem;margin-bottom:.2rem}.zw-bar .bar{height:8px;border-radius:4px;min-width:4px}.zw-label{width:100px;font-size:.7rem}.zw-val{font-size:.7rem;font-weight:600;width:30px;text-align:right}.qr-section{text-align:center;margin-top:1rem;padding-top:.75rem;border-top:2px solid #E8DFD4}.footer{display:flex;justify-content:space-between;align-items:flex-end}.footer-left{flex:1}@media print{body{padding:1cm}h2{margin-top:.75rem}}</style></head><body>';
    h += '<h1>' + (v.typ==='ableger'?'🌱':'🐝') + ' ' + v.name + '</h1>';
    h += '<div class="subtitle">📍 ' + (s?s.name:'Unbekannt') + ' | Status: ' + (v.status||'ok') + (v.typ==='ableger'?' | Ableger':'') + ' | ' + new Date().toLocaleDateString('de-DE') + '</div>';
    h += '<h2>👑 Königin</h2><div class="grid"><div class="box"><h3>Stammdaten</h3>';
    if (kInfo.begattung) {
        h += '<p>Begattung: <strong>' + kInfo.begattung + '</strong></p>';
        if (kInfo.herkunft) h += '<p>Herkunft: ' + kInfo.herkunft + '</p>';
        if (kInfo.jahrgang) h += '<p>Jahrgang: ' + kInfo.jahrgang + '</p>';
        if (kInfo.farbe) h += '<p>Markierung: ' + kInfo.farbe + (kInfo.markiert?' ✓':'') + '</p>';
        if (kInfo.belegstelle) h += '<p>Belegstelle: ' + kInfo.belegstelle + '</p>';
        if (kInfo.zuchtbuchNr) h += '<p>Zuchtbuch: <strong>' + kInfo.zuchtbuchNr + '</strong></p>';
        if (kInfo.nummer) h += '<p>Nummer: ' + kInfo.nummer + '</p>';
        if (kInfo.muttervolk_id) { var mv = voelker.find(function(x){return x.id===kInfo.muttervolk_id;}); if (mv) h += '<p>Muttervolk: ' + mv.name + '</p>'; }
        if (kInfo.drohnenvolk_id) { var dv = voelker.find(function(x){return x.id===kInfo.drohnenvolk_id;}); if (dv) h += '<p>Drohnenvolk: ' + dv.name + '</p>'; }
    } else h += '<p style="color:#9CA3AF">Keine Königin-Daten</p>';
    h += '</div><div class="box"><h3>Zuchtwerte (BeeBreed)</h3>';
    if (kInfo.zuchtwerte && kInfo.zuchtbuchNr) {
        var zw = kInfo.zuchtwerte;
        [{key:'honig',label:'Honig'},{key:'sanftmut',label:'Sanftmut'},{key:'wabensitz',label:'Wabensitz'},{key:'schwarm',label:'Schwarmtrieb'},{key:'varroa',label:'Varroa'},{key:'gesamt',label:'Gesamt'}].forEach(function(z) {
            var val = zw[z.key] || 100; var pct = Math.min(150, Math.max(50, val));
            var color = val >= 110 ? '#10b981' : val >= 100 ? '#F5A623' : '#ef4444';
            h += '<div class="zw-bar"><span class="zw-label">' + z.label + '</span><div style="flex:1;background:#f5f0eb;border-radius:4px;height:8px"><div class="bar" style="width:' + ((pct-50)/100*100) + '%;background:' + color + '"></div></div><span class="zw-val">' + val + '</span></div>';
        });
    } else h += '<p style="color:#9CA3AF">Keine Zuchtwerte</p>';
    h += '</div></div>';
    h += '<h2>📋 Durchsichten (' + volkDs.length + ')</h2>';
    if (!volkDs.length) h += '<p style="color:#9CA3AF">Keine Durchsichten vorhanden</p>';
    volkDs.forEach(function(ds) {
        h += '<div class="ds-entry">';
        var schnitt = 0, anzahl = 0;
        if (ds.kriterien) { KRITERIEN.forEach(function(k) { var w = ds.kriterien[k.key]; schnitt += (w||3); anzahl++; }); }
        var avg = anzahl > 0 ? (schnitt / anzahl).toFixed(1) : '–';
        h += '<div class="ds-header"><span>📅 ' + new Date(ds.datum).toLocaleDateString('de-DE') + '</span><span>' + avg + ' ⌀</span></div>';
        if (ds.taetigkeiten && ds.taetigkeiten.length) {
            h += '<div class="ds-tags">';
            ds.taetigkeiten.forEach(function(t) { var tDef = TAETIGKEITEN.find(function(td){return td.key===t.key;}); var label = tDef ? (tDef.icon + ' ' + tDef.label) : t.key; if (t.subs && t.subs.length) label += ' (' + t.subs.join(', ') + ')'; if (t.menge) label += ' ' + t.menge; h += '<span class="ds-tag">' + label + '</span>'; });
            h += '</div>';
        }
        if (ds.kriterien) {
            h += '<div class="grid3">';
            KRITERIEN.forEach(function(k) { var w = ds.kriterien[k.key] || 3; var sterne = ''; for (var i = 1; i <= 5; i++) sterne += i <= w ? '★' : '☆'; h += '<div style="font-size:.7rem"><span style="color:#7A6652">' + k.label.split(' ').slice(1).join(' ') + ':</span> <span class="stars">' + sterne + '</span></div>'; });
            h += '</div>';
        }
        if (ds.varroa && parseInt(ds.varroa.milben) > 0) { var mT = ds.varroa.tage > 0 ? (ds.varroa.milben / ds.varroa.tage).toFixed(1) : ds.varroa.milben; h += '<p>🔬 Varroa: <strong>' + mT + ' Milben/Tag</strong> (' + ds.varroa.methode + ')</p>'; }
        if (ds.notizen) h += '<p>💬 ' + ds.notizen + '</p>';
        h += '</div>';
    });
    h += '<div class="qr-section"><div class="footer"><div class="footer-left"><p>QR-Code scannen um dieses Volk in der App zu öffnen</p><p style="font-size:.6rem;color:#A69580">bienenplan.de | ' + v.name + ' | ' + (s?s.name:'') + '</p></div><div id="printQR"></div></div></div>';
    h += '<script>new QRCode(document.getElementById("printQR"),{text:"https://www.bienenplan.de/voelker.html?volk=' + volkId + '",width:120,height:120,colorDark:"#1C1410",colorLight:"#ffffff"});setTimeout(function(){window.print();},600);<\/script>';
    h += '</body></html>';
    w.document.write(h); w.document.close();
}

function druckeAlleQR(standortId) {
    var s = standorte.find(function(x){return x.id===standortId;});
    var sVoelker = voelker.filter(function(v){return v.standortId===standortId;});
    if (!sVoelker.length) { toast('Keine Völker an diesem Standort'); return; }
    var w = window.open('','_blank');
    w.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>QR-Etiketten ' + (s?s.name:'') + '</title>');
    w.document.write('<script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"><\/script>');
    w.document.write('<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;padding:1.5rem;color:#1C1410}h1{font-size:1.2rem;margin-bottom:.25rem}.subtitle{color:#7A6652;font-size:.8rem;margin-bottom:1.5rem}.etiketten{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem}.etikett{border:1px dashed #E8DFD4;border-radius:.5rem;padding:.75rem;text-align:center;page-break-inside:avoid}.etikett h3{font-size:.85rem;margin-bottom:.25rem}.etikett .standort{font-size:.7rem;color:#7A6652;margin-bottom:.5rem}.etikett .url{font-size:.55rem;color:#A69580;margin-top:.35rem;word-break:break-all}@media print{body{padding:1cm}.etiketten{gap:.75rem}}</style></head><body>');
    w.document.write('<h1>🏷️ QR-Etiketten</h1><div class="subtitle">📍 ' + (s?s.name:'Standort') + ' — ' + sVoelker.length + ' Völker</div><div class="etiketten">');
    sVoelker.forEach(function(v) {
        w.document.write('<div class="etikett"><h3>🐝 ' + v.name + '</h3><div class="standort">' + (s?s.name:'') + '</div><div id="qr-' + v.id + '"></div><div class="url">bienenplan.de</div></div>');
    });
    w.document.write('</div><script>');
    sVoelker.forEach(function(v) { w.document.write('new QRCode(document.getElementById("qr-' + v.id + '"),{text:"https://www.bienenplan.de/voelker.html?volk=' + v.id + '",width:100,height:100,colorDark:"#1C1410",colorLight:"#ffffff"});'); });
    w.document.write('setTimeout(function(){window.print();},800);<\/script></body></html>');
    w.document.close();
}

function exportStammbaumPDF() {
    var container = document.getElementById('stammbaumContainer'); if (!container) return;
    var v = voelker.find(function(x){return x.id===selectedStammbaumVolk;}); var volkName = v ? v.name : 'Unbekannt';
    var datum = new Date().toLocaleDateString('de-DE');
    var pw = window.open('', '_blank');
    pw.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Stammbaum – ' + volkName + '</title>');
    pw.document.write('<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:2rem;color:#1C1410;max-width:900px;margin:auto}.header{text-align:center;margin-bottom:2rem;padding-bottom:1rem;border-bottom:3px solid #F5A623}.header h1{font-size:1.5rem;color:#1C1410;margin-bottom:.25rem}.header p{font-size:.85rem;color:#7A6652}');
    pw.document.write('.stammbaum-tree{display:flex;flex-direction:column;align-items:center}.stammbaum-connector{display:flex;flex-direction:column;align-items:center}.stammbaum-node-card{border:2px solid #E8DFD4;border-radius:1rem;padding:.75rem 1rem;min-width:180px;max-width:280px;text-align:center;position:relative;margin-bottom:.25rem;background:#fff}.stammbaum-node-card.root{border-color:#F5A623;border-width:3px;background:#FFFBF0}.stammbaum-vline{width:2px;height:20px;background:#ccc}.stammbaum-eltern{display:flex;justify-content:center;gap:1.5rem;flex-wrap:wrap;position:relative}.stammbaum-eltern::before{content:"";position:absolute;top:-10px;left:25%;right:25%;height:2px;background:#ccc}.stammbaum-zweig{display:flex;flex-direction:column;align-items:center;flex:1;min-width:200px}');
    pw.document.write('.stammbaum-label{font-size:.65rem;font-weight:700;text-transform:uppercase;padding:.2rem .5rem;border-radius:999px;margin-bottom:.25rem}.stammbaum-label.mutter{background:#FFF3CD;color:#92400E}.stammbaum-label.drohne{background:#DBEAFE;color:#1E40AF}.stammbaum-badge{display:inline-block;font-size:.6rem;padding:.1rem .3rem;border-radius:.2rem}.stammbaum-gen{font-size:.55rem;color:#999;position:absolute;top:-.4rem;right:-.4rem;background:#f5f5f5;padding:.1rem .25rem;border-radius:.2rem}.legende{margin-top:2rem;padding-top:1rem;border-top:1px solid #E8DFD4;font-size:.8rem;color:#7A6652;display:flex;gap:1rem;align-items:center}@media print{body{padding:.5rem}@page{margin:1.5cm;size:landscape}}');
    pw.document.write('</style></head><body>');
    pw.document.write('<div class="header"><h1>🌳 Stammbaum – ' + volkName + '</h1><p>Erstellt am ' + datum + ' · Imkerei Tagesplaner</p></div>');
    pw.document.write(container.innerHTML);
    pw.document.write('<div class="legende"><strong>Legende:</strong> <span class="stammbaum-label mutter">👑 Muttervolk</span> <span class="stammbaum-label drohne">🐝 Drohnenvolk</span></div>');
    pw.document.write('</body></html>');
    pw.document.close();
    setTimeout(function(){ pw.print(); }, 500);
}

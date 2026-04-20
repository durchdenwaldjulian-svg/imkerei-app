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

    // Aktive (nicht archivierte) Völker zählen
    var aktiveVoelker = voelker.filter(function(v){return !v.archiviert;});
    var archivierteVoelker = voelker.filter(function(v){return v.archiviert;});

    // Standort-Kacheln
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:.75rem;margin-bottom:1rem">';
    html += '<div class="standort-card' + (!selectedStandortFilter?' selected':'') + '" onclick="selectedStandortFilter=\'\';render()">';
    html += '<div style="font-size:1.5rem;margin-bottom:.25rem">🐝</div>';
    html += '<div style="font-weight:600;font-size:.85rem">Alle Völker</div>';
    html += '<div style="font-size:.75rem;color:#7A6652">' + aktiveVoelker.length + ' Völker</div>';
    html += '</div>';
    standorte.forEach(function(s) {
        var cnt = aktiveVoelker.filter(function(v){return v.standortId===s.id;}).length;
        if (!cnt) return;
        html += '<div class="standort-card' + (selectedStandortFilter===s.id?' selected':'') + '" onclick="selectedStandortFilter=\'' + s.id + '\';render()">';
        html += '<div style="font-size:1.5rem;margin-bottom:.25rem">📍</div>';
        html += '<div style="font-weight:600;font-size:.85rem">' + esc(s.name) + '</div>';
        html += '<div style="font-size:.75rem;color:#7A6652">' + cnt + ' Völker</div>';
        html += '<div style="display:flex;gap:.25rem;margin-top:.35rem;flex-wrap:wrap;justify-content:center">';
        html += '<button onclick="event.stopPropagation();druckeAlleQR(\'' + s.id + '\')" style="background:none;border:1px solid #E8DFD4;border-radius:.5rem;padding:.25rem .5rem;cursor:pointer;font-size:.72rem;color:#7A6652" title="Alle QR-Codes als PDF drucken">🏷️ PDF</button>';
        html += '<button onclick="event.stopPropagation();druckeQR3DStandort(\'' + s.id + '\', event)" style="background:none;border:1px solid #2563EB;border-radius:.5rem;padding:.25rem .5rem;cursor:pointer;font-size:.72rem;color:#2563EB" title="Alle QR-Codes als STL (3D-Druck, mit Bohrloch)">🧊 3D-STL</button>';
        html += '</div>';
        html += '</div>';
    });
    // Archiv-Kachel wenn vorhanden
    if (archivierteVoelker.length) {
        html += '<div class="standort-card' + (selectedStandortFilter==='__archiv__'?' selected':'') + '" onclick="selectedStandortFilter=\'__archiv__\';render()" style="background:#FEF3C7;border-color:#D97706">';
        html += '<div style="font-size:1.5rem;margin-bottom:.25rem">🗄️</div>';
        html += '<div style="font-weight:600;font-size:.85rem">Archiv</div>';
        html += '<div style="font-size:.75rem;color:#78350F">' + archivierteVoelker.length + ' archiviert</div>';
        html += '</div>';
    }
    html += '</div>';

    // Völker-Grid — Archiv nur wenn explizit ausgewählt
    var filterQuelle;
    if (selectedStandortFilter === '__archiv__') {
        filterQuelle = archivierteVoelker;
    } else if (selectedStandortFilter) {
        filterQuelle = aktiveVoelker.filter(function(v){return v.standortId===selectedStandortFilter;});
    } else {
        filterQuelle = aktiveVoelker;
    }
    var filteredVoelker = sortVoelkerNumerisch(filterQuelle);

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
    html += '<div style="font-weight:700;font-size:1rem">🐝 ' + esc(v.name) + '</div>';
    if (s) html += '<div style="font-size:.72rem;color:#7A6652">📍 ' + esc(s.name) + '</div>';
    if (v.rasse) html += '<div style="font-size:.7rem;color:#92400E;margin-top:.15rem">🧬 ' + esc(v.rasse) + '</div>';
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
            if (mv) html += '👑 ' + esc(mv.name) + ' ';
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

    // Archiv-Badge bei archivierten Völkern
    if (v.archiviert) {
        var dat = v.archiviert_am ? new Date(v.archiviert_am).toLocaleDateString('de-DE') : '';
        var grundTxt = v.archiviert_grund ? ' – ' + esc(v.archiviert_grund) : '';
        html += '<div style="font-size:.7rem;background:#FEF3C7;color:#78350F;padding:.25rem .4rem;border-radius:.25rem;margin-top:.35rem">🗄️ Archiviert ' + dat + grundTxt + '</div>';
    }

    // Action-Buttons unten rechts
    html += '<div style="margin-top:.5rem;display:flex;justify-content:flex-end;gap:.35rem;align-items:center">';
    html += '<button onclick="event.stopPropagation();druckeStockkarte(\'' + v.id + '\')" '
         + 'style="background:none;border:none;cursor:pointer;font-size:.9rem;color:#7A6652;padding:.2rem" '
         + 'title="Stockkarte drucken">🖨️</button>';
    html += '<button onclick="druckeQR3D(\'' + v.id + '\', event)" '
         + 'style="background:none;border:none;cursor:pointer;font-size:.9rem;color:#2563EB;padding:.2rem" '
         + 'title="QR-Code als 3D-Druck-Vorlage (STL)">🧊</button>';
    if (v.archiviert) {
        html += '<button onclick="unarchiveVolk(\'' + v.id + '\', event)" '
             + 'style="background:none;border:none;cursor:pointer;font-size:.9rem;color:#059669;padding:.2rem" '
             + 'title="Wiederherstellen (aus Archiv holen)">↩️</button>';
    } else {
        html += '<button onclick="archiveVolk(\'' + v.id + '\', event)" '
             + 'style="background:none;border:none;cursor:pointer;font-size:.9rem;color:#92400E;padding:.2rem" '
             + 'title="Archivieren (ausblenden, Historie bleibt)">🗄️</button>';
    }
    html += '<button onclick="deleteVolkKomplett(\'' + v.id + '\', event)" '
         + 'style="background:none;border:none;cursor:pointer;font-size:.9rem;color:#DC2626;padding:.2rem" '
         + 'title="Komplett löschen (inkl. aller Durchsichten, UNWIDERRUFLICH)">🗑️</button>';
    html += '</div>';

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
        html += '<p>Kein Volk gefunden für "<strong>' + esc(suchBegriff) + '</strong>"</p>';
        html += '</div>';
        return html;
    }

    html += '<div style="font-size:.8rem;color:#7A6652;margin-bottom:.5rem">' + treffer.length + ' Ergebnis' + (treffer.length>1?'se':'') + ' für "<strong>' + esc(suchBegriff) + '</strong>"</div>';

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
    html += '<h2 style="margin:0;font-size:1.2rem">🐝 ' + esc(v.name) + '</h2>';
    if (s) html += '<div style="font-size:.85rem;color:#7A6652">📍 ' + esc(s.name) + '</div>';
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
        if (kInfo.zuchtbuchNr) html += '<div><span style="color:#7A6652">Zuchtbuch:</span> <strong>' + esc(kInfo.zuchtbuchNr) + '</strong></div>';
        if (kInfo.belegstelle) html += '<div style="grid-column:1/-1"><span style="color:#7A6652">Belegstelle:</span> <strong>' + esc(kInfo.belegstelle) + '</strong></div>';
        if (kInfo.muttervolk_id) {
            var mv = voelker.find(function(x){return x.id===kInfo.muttervolk_id;});
            if (mv) html += '<div><span style="color:#7A6652">Muttervolk:</span> <strong>' + esc(mv.name) + '</strong></div>';
        }
        if (kInfo.drohnenvolk_id) {
            var dv = voelker.find(function(x){return x.id===kInfo.drohnenvolk_id;});
            if (dv) html += '<div><span style="color:#7A6652">Drohnenvolk:</span> <strong>' + esc(dv.name) + '</strong></div>';
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
        if (letzte.notizen) html += '<div style="font-size:.78rem;color:#7A6652;margin-top:.3rem;font-style:italic">"' + esc(letzte.notizen) + '"</div>';
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
    html += '<button class="btn btn-sm" style="background:#2563EB;color:#fff" onclick="druckeQR3D(\'' + v.id + '\', event)">🧊 3D-Druck STL</button>';
    html += '</div>';
    html += '</div>';

    html += '</div>';
    return html;
}

// === DRUCK-FUNKTIONEN ===
// ============================================================
// QR-CODE ALS STL FUER 3D-DRUCK (18.04.2026)
// ============================================================
// Erzeugt STL-Datei (40x40mm Tag mit 2mm Basis + 1mm erhabenen QR-Pixeln)
// Laesst sich direkt in BambuStudio/Cura/PrusaSlicer oeffnen.

function _qr3d_makeCubeTriangles(x, y, z, w, d, h) {
    var x2=x+w, y2=y+d, z2=z+h;
    return [
        [[x,y,z],[x2,y,z],[x2,y2,z]], [[x,y,z],[x2,y2,z],[x,y2,z]],       // Boden
        [[x,y,z2],[x2,y2,z2],[x2,y,z2]], [[x,y,z2],[x,y2,z2],[x2,y2,z2]], // Deckel
        [[x,y,z],[x2,y,z2],[x2,y,z]], [[x,y,z],[x,y,z2],[x2,y,z2]],       // Front
        [[x,y2,z],[x2,y2,z],[x2,y2,z2]], [[x,y2,z],[x2,y2,z2],[x,y2,z2]], // Back
        [[x,y,z],[x,y2,z2],[x,y2,z]], [[x,y,z],[x,y,z2],[x,y2,z2]],       // Left
        [[x2,y,z],[x2,y2,z],[x2,y2,z2]], [[x2,y,z],[x2,y2,z2],[x2,y,z2]]  // Right
    ];
}

function _qr3d_trianglesToStl(triangles, name) {
    var lines = ['solid ' + name];
    for (var t=0; t<triangles.length; t++) {
        var tri = triangles[t];
        var ux=tri[1][0]-tri[0][0], uy=tri[1][1]-tri[0][1], uz=tri[1][2]-tri[0][2];
        var vx=tri[2][0]-tri[0][0], vy=tri[2][1]-tri[0][1], vz=tri[2][2]-tri[0][2];
        var nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx;
        var len = Math.sqrt(nx*nx+ny*ny+nz*nz) || 1;
        lines.push('  facet normal ' + (nx/len).toFixed(6) + ' ' + (ny/len).toFixed(6) + ' ' + (nz/len).toFixed(6));
        lines.push('    outer loop');
        lines.push('      vertex ' + tri[0][0].toFixed(4) + ' ' + tri[0][1].toFixed(4) + ' ' + tri[0][2].toFixed(4));
        lines.push('      vertex ' + tri[1][0].toFixed(4) + ' ' + tri[1][1].toFixed(4) + ' ' + tri[1][2].toFixed(4));
        lines.push('      vertex ' + tri[2][0].toFixed(4) + ' ' + tri[2][1].toFixed(4) + ' ' + tri[2][2].toFixed(4));
        lines.push('    endloop');
        lines.push('  endfacet');
    }
    lines.push('endsolid ' + name);
    return lines.join('\n');
}

// Zwei-Teil-STL: Basis (weiss) und Code (schwarz) als separate solid-Bloecke
// BambuStudio erkennt das als zwei Objekte -> jedem kann man eine Filament-Farbe zuweisen
function _qr3d_zweiTeilStl(basisTri, codeTri, basisName) {
    return _qr3d_trianglesToStl(basisTri, basisName + '_basis_weiss') + '\n'
         + _qr3d_trianglesToStl(codeTri, basisName + '_code_schwarz');
}

function _qr3d_getMatrix(canvas) {
    var ctx = canvas.getContext('2d');
    var W = canvas.width;
    var px = ctx.getImageData(0, 0, W, W).data;
    function isBlack(x, y) {
        if (x<0||x>=W||y<0||y>=W) return false;
        var i=(y*W+x)*4;
        return (px[i]+px[i+1]+px[i+2])/3 < 128;
    }
    // Finder-Pattern-Höhe als Referenz: Scan ab 5% nach unten nach erstem Schwarz
    var y0 = Math.floor(W*0.05);
    var firstBlack = -1;
    for (var x=0; x<W; x++) if (isBlack(x, y0)) { firstBlack=x; break; }
    if (firstBlack < 0) return null;
    var blackEnd = firstBlack;
    while (blackEnd<W && isBlack(blackEnd, y0)) blackEnd++;
    var modulePx = blackEnd - firstBlack;
    if (modulePx < 2) return null;
    var n = Math.round(W / modulePx);
    var matrix = [];
    for (var r=0; r<n; r++) {
        var row = [];
        var yy = Math.round((r+0.5)*modulePx);
        for (var c=0; c<n; c++) {
            var xx = Math.round((c+0.5)*modulePx);
            row.push(isBlack(xx, yy));
        }
        matrix.push(row);
    }
    return matrix;
}

function _qr3d_matrixToStl(matrix, name, opts) {
    opts = Object.assign({groesseMm:40, basisMm:2, pixelMm:1, randMm:3}, opts||{});
    var n = matrix.length;
    var innereGroesse = opts.groesseMm - 2*opts.randMm;
    var modulMm = innereGroesse / n;
    var triangles = [];
    // Basis
    Array.prototype.push.apply(triangles, _qr3d_makeCubeTriangles(0,0,0,opts.groesseMm,opts.groesseMm,opts.basisMm));
    // Pixel-Quader
    for (var r=0; r<n; r++) {
        for (var c=0; c<n; c++) {
            if (matrix[r][c]) {
                var x = opts.randMm + c*modulMm;
                var y = opts.randMm + (n-1-r)*modulMm;
                Array.prototype.push.apply(triangles,
                    _qr3d_makeCubeTriangles(x, y, opts.basisMm, modulMm, modulMm, opts.pixelMm));
            }
        }
    }
    return _qr3d_trianglesToStl(triangles, name);
}

// ============================================================
// PLATTE MIT RUNDEM BOHRLOCH (fuer Aufhaenger)
// ============================================================
// Erzeugt Triangles fuer einen flachen Quader (w x d x h) mit einem zylindrischen
// Loch (holeX, holeY, holeR) das die gesamte Hoehe durchdringt.
function _qr3d_plateWithHole(offX, offY, offZ, w, d, h, holeX, holeY, holeR, seg) {
    seg = seg || 24;
    var triangles = [];
    var TAU = 2*Math.PI;
    var cx = offX + holeX, cy = offY + holeY;

    // Kreis-Punkte (innen)
    var cp = [];
    for (var i=0; i<seg; i++) {
        var a = TAU*i/seg;
        cp.push([cx + holeR*Math.cos(a), cy + holeR*Math.sin(a)]);
    }
    // Rand-Punkte: Strahl vom Zentrum -> Schnittpunkt mit Rechteck
    var ex = offX + w, ey = offY + d;
    var rp = [];
    for (var i=0; i<seg; i++) {
        var ang = TAU*i/seg;
        var dx = Math.cos(ang), dy = Math.sin(ang);
        var ts = [];
        if (dx > 1e-9) ts.push((ex - cx) / dx);
        else if (dx < -1e-9) ts.push((offX - cx) / dx);
        if (dy > 1e-9) ts.push((ey - cy) / dy);
        else if (dy < -1e-9) ts.push((offY - cy) / dy);
        ts = ts.filter(function(t){return t > 0 && isFinite(t);});
        var t = ts.length ? Math.min.apply(null, ts) : holeR*2;
        rp.push([cx + t*dx, cy + t*dy]);
    }
    var z0 = offZ, z1 = offZ + h;

    // Top (z1, normal +Z) — CCW von oben = inner i -> outer i -> outer i+1 -> inner i+1
    for (var i=0; i<seg; i++) {
        var ni = (i+1)%seg;
        triangles.push([[cp[i][0],cp[i][1],z1], [rp[i][0],rp[i][1],z1], [rp[ni][0],rp[ni][1],z1]]);
        triangles.push([[cp[i][0],cp[i][1],z1], [rp[ni][0],rp[ni][1],z1], [cp[ni][0],cp[ni][1],z1]]);
    }
    // Bottom (z0, normal -Z) — umgekehrte Reihenfolge
    for (var i=0; i<seg; i++) {
        var ni = (i+1)%seg;
        triangles.push([[cp[i][0],cp[i][1],z0], [rp[ni][0],rp[ni][1],z0], [rp[i][0],rp[i][1],z0]]);
        triangles.push([[cp[i][0],cp[i][1],z0], [cp[ni][0],cp[ni][1],z0], [rp[ni][0],rp[ni][1],z0]]);
    }
    // Inner Zylinder-Mantel (Normale zeigt ins Loch = aus dem Material raus)
    for (var i=0; i<seg; i++) {
        var ni = (i+1)%seg;
        // CCW von innerhalb des Lochs gesehen: i(z0) -> ni(z0) -> ni(z1), dann i(z0) -> ni(z1) -> i(z1)
        // → Normale zeigt RAUS aus dem Material (ins Loch)
        triangles.push([[cp[i][0],cp[i][1],z0], [cp[ni][0],cp[ni][1],z0], [cp[ni][0],cp[ni][1],z1]]);
        triangles.push([[cp[i][0],cp[i][1],z0], [cp[ni][0],cp[ni][1],z1], [cp[i][0],cp[i][1],z1]]);
    }
    // Außenseiten (4 Rechteck-Seiten) — gleich wie normaler Quader
    // Front y=offY, Back y=ey, Left x=offX, Right x=ex
    // Front (normal 0,-1,0)
    triangles.push([[offX,offY,z0],[ex,offY,z1],[ex,offY,z0]]);
    triangles.push([[offX,offY,z0],[offX,offY,z1],[ex,offY,z1]]);
    // Back (normal 0,+1,0)
    triangles.push([[offX,ey,z0],[ex,ey,z0],[ex,ey,z1]]);
    triangles.push([[offX,ey,z0],[ex,ey,z1],[offX,ey,z1]]);
    // Left (normal -1,0,0)
    triangles.push([[offX,offY,z0],[offX,ey,z1],[offX,ey,z0]]);
    triangles.push([[offX,offY,z0],[offX,offY,z1],[offX,ey,z1]]);
    // Right (normal +1,0,0)
    triangles.push([[ex,offY,z0],[ex,ey,z0],[ex,ey,z1]]);
    triangles.push([[ex,offY,z0],[ex,ey,z1],[ex,offY,z1]]);
    return triangles;
}

// 5x7 Pixel-Font fuer Text auf Tag (Ziffern + Buchstaben)
var QR3D_FONT = {
    '0':'01110/10001/10011/10101/11001/10001/01110','1':'00100/01100/00100/00100/00100/00100/01110',
    '2':'01110/10001/00001/00110/01000/10000/11111','3':'01110/10001/00001/00110/00001/10001/01110',
    '4':'00010/00110/01010/10010/11111/00010/00010','5':'11111/10000/11110/00001/00001/10001/01110',
    '6':'00110/01000/10000/11110/10001/10001/01110','7':'11111/00001/00010/00100/01000/01000/01000',
    '8':'01110/10001/10001/01110/10001/10001/01110','9':'01110/10001/10001/01111/00001/00010/01100',
    'A':'01110/10001/10001/11111/10001/10001/10001','B':'11110/10001/10001/11110/10001/10001/11110',
    'C':'01110/10001/10000/10000/10000/10001/01110','D':'11110/10001/10001/10001/10001/10001/11110',
    'E':'11111/10000/10000/11110/10000/10000/11111','F':'11111/10000/10000/11110/10000/10000/10000',
    'G':'01110/10001/10000/10111/10001/10001/01110','H':'10001/10001/10001/11111/10001/10001/10001',
    'I':'01110/00100/00100/00100/00100/00100/01110','J':'11111/00010/00010/00010/00010/10010/01100',
    'K':'10001/10010/10100/11000/10100/10010/10001','L':'10000/10000/10000/10000/10000/10000/11111',
    'M':'10001/11011/10101/10001/10001/10001/10001','N':'10001/10001/11001/10101/10011/10001/10001',
    'O':'01110/10001/10001/10001/10001/10001/01110','P':'11110/10001/10001/11110/10000/10000/10000',
    'Q':'01110/10001/10001/10001/10101/10010/01101','R':'11110/10001/10001/11110/10100/10010/10001',
    'S':'01110/10001/10000/01110/00001/10001/01110','T':'11111/00100/00100/00100/00100/00100/00100',
    'U':'10001/10001/10001/10001/10001/10001/01110','V':'10001/10001/10001/10001/10001/01010/00100',
    'W':'10001/10001/10001/10001/10101/10101/01010','X':'10001/10001/01010/00100/01010/10001/10001',
    'Y':'10001/10001/01010/00100/00100/00100/00100','Z':'11111/00001/00010/00100/01000/10000/11111',
    '-':'00000/00000/00000/11111/00000/00000/00000',' ':'00000/00000/00000/00000/00000/00000/00000'
};

function _qr3d_textToTriangles(text, startX, startY, z, pixelMm, hoeheMm) {
    var triangles = [];
    var x = startX;
    for (var i=0; i<text.length; i++) {
        var c = text[i].toUpperCase();
        var def = QR3D_FONT[c];
        if (!def) { x += 6*pixelMm; continue; }
        var rows = def.split('/');
        for (var r=0; r<7; r++) {
            for (var k=0; k<5; k++) {
                if (rows[r].charAt(k) === '1') {
                    var px = x + k*pixelMm;
                    var py = startY + (6-r)*pixelMm;
                    Array.prototype.push.apply(triangles,
                        _qr3d_makeCubeTriangles(px, py, z, pixelMm, pixelMm, hoeheMm));
                }
            }
        }
        x += 6*pixelMm;  // 5 Pixel + 1 Pixel Abstand
    }
    return triangles;
}

// Label aus Volkname extrahieren: "Volk 3" -> "V3", "Ableger 5" -> "A5",
// sonst erste 6 Zeichen gross
function _qr3d_extractLabel(volkName, typ) {
    var m = (volkName || '').match(/(\d+)/);
    if (m) {
        var prefix = (typ === 'ableger') ? 'A' : 'V';
        return prefix + m[1];
    }
    return (volkName || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
}

function _qr3d_textPixelSize(label, maxBreiteMm) {
    // Automatisch passende Pixel-Groesse damit Label in maxBreiteMm passt
    // Jedes Zeichen = 6 Pixel breit (5 + 1 Abstand)
    var pixCount = label.length * 6;
    return Math.min(2.0, Math.max(0.6, maxBreiteMm / pixCount));
}

// Tag fuer ein Volk: Basis mit Bohrloch + QR-Pixel + Textlabel
// Gesamtgroesse: 40 (breit) x 60mm (lang)
//   y =  0..40  : QR-Bereich (40x40)
//   y = 40..50  : Text-Bereich (Label erhaben)
//   y = 50..60  : Aufhaenge-Lasche mit Loch
// Rueckgabe: {basis: [triangles], code: [triangles]} fuer Zwei-Farb-Druck
// Echte INLAY-Geometrie: Basis und Code teilen sich das Volumen disjoint auf.
// Jedes Voxel ist eindeutig entweder Basis ODER Code, keine Ueberlappung.
// Slicer hat keine Mehrdeutigkeit → perfekt scharfe Farbgrenzen.
function _qr3d_volkTagTriangles(matrix, offX, offY, opts) {
    opts = Object.assign({
        groesseMm: 60, basisMm: 2, randMm: 4,
        textMm: 12, aufhMm: 12,
        lochDurchMm: 5, lochAbstandMm: 6,
        label: ''
    }, opts || {});
    var totalW = opts.groesseMm;
    var totalD = opts.groesseMm + opts.textMm + opts.aufhMm;
    var basisTri = [];
    var codeTri  = [];

    // --- 1. Aufhaenger (Basis mit Loch) ---
    var aufhY0 = opts.groesseMm + opts.textMm;
    var lochX = totalW / 2;
    var lochY = aufhY0 + (opts.aufhMm - opts.lochAbstandMm);
    var lochR = opts.lochDurchMm / 2;
    Array.prototype.push.apply(basisTri,
        _qr3d_plateWithHole(offX, offY + aufhY0, 0, totalW, opts.aufhMm, opts.basisMm,
                             lochX, lochY - aufhY0, lochR, 32));

    // --- 2. Text-Bereich: Basis-Platte, Text als Code-Pixel ausgestanzt ---
    // Zur einfachheit: Basis fuellt den Text-Bereich komplett; die Text-Pixel werden als
    // Code-Quader darueber gelegt (hoeher als Basis). Ergibt leicht erhabenen Text.
    // Das funktioniert weil Text-Pixel GENAU gegenueber der Basis liegen ohne Ueberlapp.
    // Besser: Text als DISJOINT Inlay, genauso wie QR-Pixel. Machen wir — per gleicher Logik.

    // Text-Bereich: Basis plus Code-Text-Pixel die in Basis versenkt sind
    var txtY0 = opts.groesseMm;
    Array.prototype.push.apply(basisTri,
        _qr3d_makeCubeTriangles(offX, offY + txtY0, 0, totalW, opts.textMm, opts.basisMm));

    // --- 3. Rand um den QR-Bereich ---
    // QR-Bereich: x=randMm..groesse-randMm, y=randMm..groesse-randMm
    // Rand-Streifen: links, rechts, unten, oben
    var rm = opts.randMm;
    var g = opts.groesseMm;
    // Unten-Streifen (0..g in x, 0..rm in y)
    Array.prototype.push.apply(basisTri,
        _qr3d_makeCubeTriangles(offX, offY, 0, g, rm, opts.basisMm));
    // Oben-Streifen (0..g in x, g-rm..g in y)
    Array.prototype.push.apply(basisTri,
        _qr3d_makeCubeTriangles(offX, offY + g - rm, 0, g, rm, opts.basisMm));
    // Links-Streifen (0..rm in x, rm..g-rm in y)
    Array.prototype.push.apply(basisTri,
        _qr3d_makeCubeTriangles(offX, offY + rm, 0, rm, g - 2*rm, opts.basisMm));
    // Rechts-Streifen (g-rm..g in x, rm..g-rm in y)
    Array.prototype.push.apply(basisTri,
        _qr3d_makeCubeTriangles(offX + g - rm, offY + rm, 0, rm, g - 2*rm, opts.basisMm));

    // --- 4. QR-Bereich: jeder Modul eindeutig Basis ODER Code ---
    var n = matrix.length;
    var innereGroesse = g - 2*rm;
    var modulMm = innereGroesse / n;
    for (var r=0; r<n; r++) {
        for (var c=0; c<n; c++) {
            var x = offX + rm + c*modulMm;
            var y = offY + rm + (n-1-r)*modulMm;
            if (matrix[r][c]) {
                Array.prototype.push.apply(codeTri,
                    _qr3d_makeCubeTriangles(x, y, 0, modulMm, modulMm, opts.basisMm));
            } else {
                Array.prototype.push.apply(basisTri,
                    _qr3d_makeCubeTriangles(x, y, 0, modulMm, modulMm, opts.basisMm));
            }
        }
    }

    // --- 5. Text-Label als leichtes Relief oben drauf (damit lesbar) ---
    if (opts.label) {
        var labelY0 = opts.groesseMm + 1;
        var maxTextBreite = totalW - 4;
        var ps = _qr3d_textPixelSize(opts.label, maxTextBreite);
        var textBreite = opts.label.length * 6 * ps;
        var textStartX = offX + (totalW - textBreite) / 2;
        var textStartY = offY + labelY0 + (opts.textMm - 2 - 7*ps) / 2;
        // Text 0.4mm in die Basis versenkt: z=basisMm-0.4 bis z=basisMm (flach, aber als Code-Part)
        // Tatsaechlich: Text als Pixel oben auf der Basis ist klarer — 0.4mm erhaben
        var textTris = _qr3d_textToTriangles(opts.label, textStartX, textStartY,
                                              opts.basisMm, ps, 0.4);
        Array.prototype.push.apply(codeTri, textTris);
    }

    return {basis: basisTri, code: codeTri};
}

function _qr3d_downloadStl(content, filename) {
    var blob = new Blob([content], {type: 'application/sla'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
}

// ============================================================
// 3MF-WRITER (Bambu-Lab / Prusa kompatibel)
// ============================================================
// Minimaler ZIP-Writer ohne Kompression (STORED) + 3MF-XML
// Baut eine .3mf Datei mit zwei Objekten (basis weiss, code schwarz)

var _qr3d_crcTable = null;
function _qr3d_crc32(buf) {
    if (!_qr3d_crcTable) {
        _qr3d_crcTable = new Uint32Array(256);
        for (var i=0; i<256; i++) {
            var c = i;
            for (var k=0; k<8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
            _qr3d_crcTable[i] = c >>> 0;
        }
    }
    var c = 0xFFFFFFFF;
    for (var i=0; i<buf.length; i++) c = _qr3d_crcTable[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
}

function _qr3d_strToBytes(s) {
    var enc = new TextEncoder();
    return enc.encode(s);
}

function _qr3d_u16(n) { return new Uint8Array([n & 0xFF, (n>>>8) & 0xFF]); }
function _qr3d_u32(n) { return new Uint8Array([n & 0xFF, (n>>>8) & 0xFF, (n>>>16) & 0xFF, (n>>>24) & 0xFF]); }

function _qr3d_concatArrays(arrs) {
    var total = 0;
    for (var i=0; i<arrs.length; i++) total += arrs[i].length;
    var out = new Uint8Array(total);
    var p = 0;
    for (var i=0; i<arrs.length; i++) { out.set(arrs[i], p); p += arrs[i].length; }
    return out;
}

// files: array of {name: 'path/file.ext', data: Uint8Array}
function _qr3d_makeZip(files) {
    var parts = [];
    var cds = [];
    var offset = 0;
    for (var i=0; i<files.length; i++) {
        var f = files[i];
        var name = _qr3d_strToBytes(f.name);
        var data = f.data;
        var crc = _qr3d_crc32(data);
        var size = data.length;
        // Local File Header
        var lfh = _qr3d_concatArrays([
            _qr3d_u32(0x04034b50), _qr3d_u16(20), _qr3d_u16(0), _qr3d_u16(0),
            _qr3d_u16(0), _qr3d_u16(0),
            _qr3d_u32(crc), _qr3d_u32(size), _qr3d_u32(size),
            _qr3d_u16(name.length), _qr3d_u16(0),
            name
        ]);
        parts.push(lfh);
        parts.push(data);
        // Central Directory
        var cd = _qr3d_concatArrays([
            _qr3d_u32(0x02014b50), _qr3d_u16(20), _qr3d_u16(20), _qr3d_u16(0),
            _qr3d_u16(0), _qr3d_u16(0), _qr3d_u16(0),
            _qr3d_u32(crc), _qr3d_u32(size), _qr3d_u32(size),
            _qr3d_u16(name.length), _qr3d_u16(0), _qr3d_u16(0),
            _qr3d_u16(0), _qr3d_u16(0), _qr3d_u32(0),
            _qr3d_u32(offset), name
        ]);
        cds.push(cd);
        offset += lfh.length + data.length;
    }
    var cdStart = offset;
    var cdSize = 0;
    for (var i=0; i<cds.length; i++) { parts.push(cds[i]); cdSize += cds[i].length; }
    // End of Central Directory
    parts.push(_qr3d_concatArrays([
        _qr3d_u32(0x06054b50), _qr3d_u16(0), _qr3d_u16(0),
        _qr3d_u16(files.length), _qr3d_u16(files.length),
        _qr3d_u32(cdSize), _qr3d_u32(cdStart), _qr3d_u16(0)
    ]));
    return _qr3d_concatArrays(parts);
}

// Triangles → 3MF mesh XML (mit vertex-dedup)
function _qr3d_trianglesToMeshXml(triangles) {
    var vertexMap = {};
    var vertices = [];
    var tris = [];
    function addVertex(v) {
        var key = v[0].toFixed(4) + '_' + v[1].toFixed(4) + '_' + v[2].toFixed(4);
        if (vertexMap[key] === undefined) {
            vertexMap[key] = vertices.length;
            vertices.push(v);
        }
        return vertexMap[key];
    }
    for (var i=0; i<triangles.length; i++) {
        var t = triangles[i];
        tris.push([addVertex(t[0]), addVertex(t[1]), addVertex(t[2])]);
    }
    var xml = '<mesh><vertices>';
    for (var i=0; i<vertices.length; i++) {
        xml += '<vertex x="' + vertices[i][0].toFixed(4) + '" y="' + vertices[i][1].toFixed(4) + '" z="' + vertices[i][2].toFixed(4) + '"/>';
    }
    xml += '</vertices><triangles>';
    for (var i=0; i<tris.length; i++) {
        xml += '<triangle v1="' + tris[i][0] + '" v2="' + tris[i][1] + '" v3="' + tris[i][2] + '"/>';
    }
    xml += '</triangles></mesh>';
    return xml;
}

// Baut komplette 3MF-Datei (Uint8Array) als EIN Objekt mit zwei Parts
// Damit bleibt der Z-Abstand (Code ueber Basis) erhalten — Bambu verschiebt nicht
function _qr3d_make3MF(basisTri, codeTri) {
    var contentTypes = '<?xml version="1.0" encoding="UTF-8"?>\n'
        + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
        + '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
        + '<Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/>'
        + '<Default Extension="config" ContentType="application/vnd.bambulab-package.3dmanufacturing-cfg+xml"/>'
        + '</Types>';
    var rels = '<?xml version="1.0" encoding="UTF-8"?>\n'
        + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        + '<Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/>'
        + '</Relationships>';
    var modelRels = '<?xml version="1.0" encoding="UTF-8"?>\n'
        + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        + '<Relationship Target="/Metadata/model_settings.config" Id="rel-1" Type="http://schemas.bambulab.com/package/2021/model-config"/>'
        + '</Relationships>';
    // id 2 = Basis-Mesh, id 3 = Code-Mesh, id 1 = Container mit Components (baut beide als EIN Objekt)
    var model = '<?xml version="1.0" encoding="UTF-8"?>\n'
        + '<model unit="millimeter" xml:lang="en-US" '
        + 'xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02" '
        + 'xmlns:BambuStudio="http://schemas.bambulab.com/package/2021">'
        + '<resources>'
        + '<object id="2" type="model">' + _qr3d_trianglesToMeshXml(basisTri) + '</object>'
        + '<object id="3" type="model">' + _qr3d_trianglesToMeshXml(codeTri) + '</object>'
        + '<object id="1" type="model">'
        +   '<components>'
        +     '<component objectid="2" transform="1 0 0 0 1 0 0 0 1 0 0 0"/>'
        +     '<component objectid="3" transform="1 0 0 0 1 0 0 0 1 0 0 0"/>'
        +   '</components>'
        + '</object>'
        + '</resources>'
        + '<build>'
        + '<item objectid="1" transform="1 0 0 0 1 0 0 0 1 0 0 0"/>'
        + '</build>'
        + '</model>';
    // In Bambus model_settings.config werden die PARTS (2 und 3) mit Filament zugewiesen
    var bambuConfig = '<?xml version="1.0" encoding="UTF-8"?>\n'
        + '<config>'
        + '<object id="1">'
        +   '<metadata key="name" value="QR_Tag"/>'
        +   '<part id="2" subtype="normal_part">'
        +     '<metadata key="name" value="Basis_weiss"/>'
        +     '<metadata key="matrix" value="1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 1"/>'
        +     '<metadata key="extruder" value="1"/>'
        +   '</part>'
        +   '<part id="3" subtype="normal_part">'
        +     '<metadata key="name" value="Code_schwarz"/>'
        +     '<metadata key="matrix" value="1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 1"/>'
        +     '<metadata key="extruder" value="2"/>'
        +   '</part>'
        + '</object>'
        + '</config>';
    return _qr3d_makeZip([
        {name: '[Content_Types].xml',             data: _qr3d_strToBytes(contentTypes)},
        {name: '_rels/.rels',                     data: _qr3d_strToBytes(rels)},
        {name: '3D/3dmodel.model',                data: _qr3d_strToBytes(model)},
        {name: '3D/_rels/3dmodel.model.rels',     data: _qr3d_strToBytes(modelRels)},
        {name: 'Metadata/model_settings.config',  data: _qr3d_strToBytes(bambuConfig)}
    ]);
}

function _qr3d_download3MF(uint8arr, filename) {
    var blob = new Blob([uint8arr], {type: 'application/vnd.ms-package.3dmanufacturing-3dmodel+xml'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
}

// Helper: Rendert QR auf temporaeren Canvas und liefert Matrix zurueck
async function _qr3d_renderMatrixFor(url) {
    var div = document.createElement('div');
    div.style.position='absolute'; div.style.left='-9999px'; div.style.top='-9999px';
    document.body.appendChild(div);
    try {
        new QRCode(div, {text:url, width:512, height:512, colorDark:'#000', colorLight:'#fff',
                         correctLevel: QRCode.CorrectLevel.H});
        await new Promise(function(r){ setTimeout(r, 150); });
        var canvas = div.querySelector('canvas');
        if (!canvas) {
            var img = div.querySelector('img');
            if (!img) throw new Error('QR konnte nicht gerendert werden');
            canvas = document.createElement('canvas');
            canvas.width = 512; canvas.height = 512;
            var ctx = canvas.getContext('2d');
            ctx.fillStyle='#fff'; ctx.fillRect(0,0,512,512);
            await new Promise(function(resolve, reject){
                if (img.complete && img.naturalWidth) resolve();
                else { img.onload = resolve; img.onerror = reject; }
            });
            ctx.drawImage(img, 0, 0, 512, 512);
        }
        return _qr3d_getMatrix(canvas);
    } finally {
        if (div.parentNode) document.body.removeChild(div);
    }
}

async function druckeQR3D(volkId, event) {
    if (event) event.stopPropagation();
    var v = voelker.find(function(x){return x.id===volkId;});
    if (!v) return;
    if (typeof QRCode === 'undefined') { toast('QR-Library nicht geladen', 'error'); return; }
    try {
        var url = 'https://www.bienenplan.de/voelker.html?volk=' + volkId;
        var matrix = await _qr3d_renderMatrixFor(url);
        if (!matrix) { toast('QR-Matrix konnte nicht gelesen werden', 'error'); return; }
        var label = _qr3d_extractLabel(v.name, v.typ);
        var safeName = v.name.replace(/[^a-zA-Z0-9_-]/g, '_');
        var parts = _qr3d_volkTagTriangles(matrix, 0, 0, {label: label});
        // 3MF-Datei mit 2 Objekten (Basis weiss/Filament 1, Code schwarz/Filament 2)
        var buf = _qr3d_make3MF(parts.basis, parts.code);
        _qr3d_download3MF(buf, 'QR_' + safeName + '.3mf');
        toast('🧊 3MF: ' + safeName + ' — Filament 1 (weiß) + Filament 2 (schwarz) vorbelegt, direkt in BambuStudio öffnen!', 'success');
    } catch (e) {
        console.error('druckeQR3D Fehler:', e);
        toast('❌ STL-Erzeugung fehlgeschlagen: ' + e.message, 'error');
    }
}

// Sammel-STL fuer alle Voelker eines Standorts — alle Tags in einem Grid
async function druckeQR3DStandort(standortId, event) {
    if (event) event.stopPropagation();
    var s = standorte.find(function(x){return x.id===standortId;});
    if (!s) return;
    var sVoelker = sortVoelkerNumerisch(voelker.filter(function(v){return v.standortId===standortId && !v.archiviert;}));
    if (!sVoelker.length) { toast('Keine aktiven Völker an diesem Standort', 'info'); return; }
    if (typeof QRCode === 'undefined') { toast('QR-Library nicht geladen', 'error'); return; }

    var spalten = Math.min(3, sVoelker.length);
    var zeilen = Math.ceil(sVoelker.length / spalten);
    var tagW = 40, tagD = 60, abstand = 5;
    var druckW = spalten * tagW + (spalten-1) * abstand;
    var druckD = zeilen * tagD + (zeilen-1) * abstand;

    if (druckW > 250 || druckD > 250) {
        if (!confirm('⚠️ Gesamtgröße ' + druckW.toFixed(0) + '×' + druckD.toFixed(0) + 'mm überschreitet '
                   + 'typische Druckplatte (256×256mm). Trotzdem fortfahren?\n\n'
                   + 'Tipp: Du kannst die STL in BambuStudio aufteilen.')) return;
    }

    toast('Erzeuge ' + sVoelker.length + ' QR-Codes... (dauert ' + sVoelker.length + '-' + (sVoelker.length*2) + ' Sek)', 'info');
    try {
        var allBasis = [], allCode = [];
        for (var i=0; i<sVoelker.length; i++) {
            var v = sVoelker[i];
            var url = 'https://www.bienenplan.de/voelker.html?volk=' + v.id;
            var matrix = await _qr3d_renderMatrixFor(url);
            if (!matrix) continue;
            var col = i % spalten;
            var row = Math.floor(i / spalten);
            var offX = col * (tagW + abstand);
            var offY = (zeilen - 1 - row) * (tagD + abstand);
            var label = _qr3d_extractLabel(v.name, v.typ);
            var parts = _qr3d_volkTagTriangles(matrix, offX, offY, {label: label});
            Array.prototype.push.apply(allBasis, parts.basis);
            Array.prototype.push.apply(allCode, parts.code);
        }
        if (!allBasis.length) { toast('❌ Keine Tags erzeugt', 'error'); return; }
        var safeName = (s.name || 'Standort').replace(/[^a-zA-Z0-9_-]/g, '_');
        // 3MF mit 2 Objekten (Basis weiss, Code schwarz) - Bambu-Filament-Zuweisung inkludiert
        var buf = _qr3d_make3MF(allBasis, allCode);
        _qr3d_download3MF(buf, 'QR_Standort_' + safeName + '_' + sVoelker.length + 'Tags.3mf');
        toast('🧊 3MF: ' + sVoelker.length + ' Tags (' + druckW.toFixed(0) + '×' + druckD.toFixed(0) + 'mm, Filament 1 weiß + 2 schwarz vorbelegt)', 'success');
    } catch (e) {
        console.error('druckeQR3DStandort Fehler:', e);
        toast('❌ Fehler: ' + e.message, 'error');
    }
}

function druckeStockkarte(volkId) {
    var v = voelker.find(function(x){return x.id===volkId;});
    if (!v) return;
    var s = standorte.find(function(x){return x.id===v.standortId;});
    var kInfo = koeniginnen[volkId] || {};
    var volkDs = durchsichten.filter(function(d){return d.volkId===volkId;}).sort(function(a,b){return b.datum.localeCompare(a.datum);});

    var w = window.open('','_blank');
    var h = '';
    h += '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Stockkarte ' + esc(v.name) + '</title>';
    h += '<script src="vendor/qrcode.min.js"><\/script>';
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
    h += '<h1>' + typIcon + ' ' + esc(v.name) + '</h1>';
    h += '<div class="subtitle">📍 ' + (s ? s.name : 'Unbekannt') + ' | Status: ' + (v.status || 'ok') + (v.typ === 'ableger' ? ' | Ableger' : '') + ' | Erstellt: ' + new Date().toLocaleDateString('de-DE') + '</div>';

    h += '<h2>👑 Königin</h2>';
    h += '<div class="grid">';
    h += '<div class="box"><h3>Stammdaten</h3>';
    if (kInfo.begattung) {
        h += '<p>Begattung: <strong>' + kInfo.begattung + '</strong></p>';
        if (kInfo.herkunft) h += '<p>Herkunft: ' + esc(kInfo.herkunft) + '</p>';
        if (kInfo.jahrgang) h += '<p>Jahrgang: ' + kInfo.jahrgang + '</p>';
        if (kInfo.farbe) h += '<p>Markierung: ' + esc(kInfo.farbe) + (kInfo.markiert ? ' ✓' : '') + '</p>';
        if (kInfo.belegstelle) h += '<p>Belegstelle: ' + esc(kInfo.belegstelle) + '</p>';
        if (kInfo.zuchtbuchNr) h += '<p>Zuchtbuch: <strong>' + esc(kInfo.zuchtbuchNr) + '</strong></p>';
        if (kInfo.nummer) h += '<p>Nummer: ' + esc(kInfo.nummer) + '</p>';
        if (kInfo.muttervolk_id) {
            var mv = voelker.find(function(x){return x.id===kInfo.muttervolk_id;});
            if (mv) h += '<p>Muttervolk: ' + esc(mv.name) + '</p>';
        }
        if (kInfo.drohnenvolk_id) {
            var dv = voelker.find(function(x){return x.id===kInfo.drohnenvolk_id;});
            if (dv) h += '<p>Drohnenvolk: ' + esc(dv.name) + '</p>';
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
            h += '<p>💬 ' + esc(ds.notizen) + '</p>';
        }
        h += '</div>';
    });

    h += '<div class="qr-section"><div class="footer"><div class="footer-left">';
    h += '<p>QR-Code scannen um dieses Volk in der App zu öffnen</p>';
    h += '<p style="font-size:.6rem;color:#A69580">bienenplan.de | ' + esc(v.name) + ' | ' + (s ? s.name : '') + '</p>';
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
    w.document.write('<script src="vendor/qrcode.min.js"><\/script>');
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
        w.document.write('<h3>🐝 ' + esc(v.name) + '</h3>');
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

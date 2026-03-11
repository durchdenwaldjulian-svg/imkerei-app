// ============================================
// VÖLKER & STANDORTE – QR SCANNER MODULE
// Dauerhafter Scanner-Modus für Imker mit Handschuhen
// ============================================

var scannerActive = false;
var html5QrCode = null;
var scannerResultTimer = null;
var lastScannedVolk = null;

function openScanner() {
    var overlay = document.getElementById('scannerOverlay');
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    scannerActive = true;
    startQrScanner();
}

function closeScanner() {
    scannerActive = false;
    if (html5QrCode) {
        html5QrCode.stop().then(function() {
            html5QrCode.clear();
        }).catch(function(){});
    }
    html5QrCode = null;
    document.getElementById('scannerOverlay').style.display = 'none';
    document.getElementById('scannerResult').classList.remove('visible');
    document.body.style.overflow = '';
    clearTimeout(scannerResultTimer);
    lastScannedVolk = null;
}

function startQrScanner() {
    var reader = document.getElementById('scannerReader');
    reader.innerHTML = '';

    html5QrCode = new Html5Qrcode('scannerReader');

    var config = {
        fps: 10,
        qrbox: function(viewfinderWidth, viewfinderHeight) {
            var size = Math.min(viewfinderWidth, viewfinderHeight) * 0.7;
            return { width: size, height: size };
        },
        aspectRatio: 1.0
    };

    html5QrCode.start(
        { facingMode: 'environment' },
        config,
        function(decodedText) {
            onQrScanned(decodedText);
        },
        function() { /* ignore errors during scanning */ }
    ).catch(function(err) {
        document.getElementById('scannerReader').innerHTML =
            '<div style="color:#fff;text-align:center;padding:2rem">' +
            '<div style="font-size:3rem;margin-bottom:1rem">📷</div>' +
            '<h3>Kamera nicht verfügbar</h3>' +
            '<p style="margin-top:.5rem;color:#ccc">Bitte Kamera-Berechtigung erteilen</p>' +
            '</div>';
    });
}

function onQrScanned(text) {
    // URL parsen: voelker.html?volk=VOLK_ID oder bienenplan.de/voelker.html?volk=VOLK_ID
    var volkId = null;
    try {
        var url = new URL(text, window.location.origin);
        volkId = url.searchParams.get('volk');
    } catch(e) {
        // Falls kein gültiger URL, direkt als ID versuchen
        if (text && text.length > 5 && text.length < 50) volkId = text;
    }

    if (!volkId) return;

    // Nicht das gleiche Volk nochmal anzeigen
    if (lastScannedVolk === volkId) return;
    lastScannedVolk = volkId;

    var v = voelker.find(function(x) { return x.id === volkId; });
    if (!v) {
        showScannerResult(null, volkId);
        return;
    }

    // Vibration als Feedback
    if (navigator.vibrate) navigator.vibrate(200);

    showScannerResult(v);

    // Nach 6 Sekunden automatisch ausblenden damit nächstes Volk gescannt werden kann
    clearTimeout(scannerResultTimer);
    scannerResultTimer = setTimeout(function() {
        document.getElementById('scannerResult').classList.remove('visible');
        lastScannedVolk = null;
    }, 6000);
}

function showScannerResult(v, unknownId) {
    var card = document.getElementById('scannerResult');

    if (!v) {
        card.innerHTML =
            '<div style="text-align:center;padding:1.5rem;color:#7A6652">' +
            '<div style="font-size:2rem;margin-bottom:.5rem">❓</div>' +
            '<p>Volk nicht gefunden</p>' +
            '</div>';
        card.classList.add('visible');
        return;
    }

    var s = standorte.find(function(x) { return x.id === v.standortId; });
    var kInfo = koeniginnen[v.id];
    var volkDs = getDurchsichtenFuerVolk(v.id);
    var letzteDurchsicht = volkDs.length ? volkDs[0] : null;

    var statusLabels = {'ok':'✅ Gut','schwach':'⚠️ Schwach','weisellos':'👑 Weisellos','problem':'❌ Problem'};
    var statusColors = {'ok':'#10b981','schwach':'#f59e0b','weisellos':'#8b5cf6','problem':'#ef4444'};

    var html = '';

    // Volk Header
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.75rem">';
    html += '<div>';
    html += '<div style="font-size:1.3rem;font-weight:700">' + (v.typ === 'ableger' ? '🌱 ' : '🐝 ') + v.name + '</div>';
    if (s) html += '<div style="font-size:.85rem;color:#7A6652">📍 ' + s.name + '</div>';
    html += '</div>';
    html += '<div style="display:flex;align-items:center;gap:.5rem">';
    html += '<span style="width:14px;height:14px;border-radius:50%;background:' + (statusColors[v.status] || statusColors.ok) + ';display:inline-block"></span>';
    html += '<span style="font-size:.85rem;font-weight:600">' + (statusLabels[v.status] || statusLabels.ok) + '</span>';
    html += '</div>';
    html += '</div>';

    // Info-Zeile
    html += '<div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:.75rem">';
    html += '<span class="scanner-chip">📦 ' + (v.beutensystem || 'Dadant') + '</span>';
    html += '<span class="scanner-chip">🍯 ' + (v.honigertrag || 0).toFixed(1) + ' kg</span>';
    if (kInfo && kInfo.jahrgang) {
        html += '<span class="scanner-chip">👑 ' + kInfo.jahrgang;
        if (kInfo.markiert && kInfo.farbe) html += ' ' + getColorDot(kInfo.farbe);
        html += '</span>';
    }
    if (letzteDurchsicht) {
        var schnitt = durchschnittKriterien(letzteDurchsicht.kriterien);
        html += '<span class="scanner-chip">📋 ' + fmtDateShort(letzteDurchsicht.datum) + ' (' + schnitt.toFixed(1) + '★)</span>';
    }
    html += '</div>';

    // Große Buttons (handschuhfreundlich)
    html += '<div style="display:flex;gap:.75rem">';
    html += '<button class="scanner-action-btn primary" onclick="scannerGoToDurchsicht(\'' + v.id + '\')">';
    html += '📋 Durchsicht starten</button>';
    html += '<button class="scanner-action-btn" onclick="scannerGoToDetails(\'' + v.id + '\')">';
    html += 'ℹ️ Details</button>';
    html += '</div>';

    card.innerHTML = html;
    card.classList.add('visible');
}

function scannerGoToDurchsicht(volkId) {
    closeScanner();
    // Zum Durchsicht-Tab wechseln und Modal öffnen
    var v = voelker.find(function(x) { return x.id === volkId; });
    if (v) {
        selectedStandortFilter = v.standortId;
        activeTab = 'durchsicht';
        openVolkDetail = volkId;
        render();
        // Neue Durchsicht direkt öffnen
        setTimeout(function() { openDurchsicht(null, volkId); }, 300);
    }
}

function scannerGoToDetails(volkId) {
    closeScanner();
    goToVolk(volkId);
}

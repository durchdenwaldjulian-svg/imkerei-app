/* ============================================
   PDF EXPORT – Schlagberichte, Jahresberichte
   ============================================ */

const PDFExport = {
  // Prüfe ob jsPDF verfügbar ist
  isAvailable() {
    return typeof window.jspdf !== 'undefined';
  },

  createDoc() {
    if (!this.isAvailable()) {
      showToast('PDF-Bibliothek nicht geladen', 'error');
      return null;
    }
    const doc = new window.jspdf.jsPDF();
    doc.setFont('helvetica');
    return doc;
  },

  addHeader(doc, title, subtitle) {
    doc.setFillColor(21, 128, 61);
    doc.rect(0, 0, 210, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text(title, 14, 14);
    doc.setFontSize(9);
    doc.text(subtitle || 'Ackerschlagkartei – Terra', 14, 22);
    doc.setTextColor(0, 0, 0);
    return 36;
  },

  addFooter(doc) {
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text(`Seite ${i} von ${pageCount} – Erstellt am ${new Date().toLocaleDateString('de-DE')} – Terra Ackerschlagkartei`, 14, 290);
    }
  },

  async exportSchlagbericht(schlagId) {
    const doc = this.createDoc();
    if (!doc) return;

    const schlag = await Storage.getSchlag(schlagId);
    if (!schlag) { showToast('Schlag nicht gefunden', 'error'); return; }

    const kulturen = await Storage.getKulturenBySchlag(schlagId);
    const massnahmen = await Storage.getMassnahmenBySchlag(schlagId);

    let y = this.addHeader(doc, `Schlagbericht: ${schlag.name}`, `${schlag.groesse} ha – ${new Date().toLocaleDateString('de-DE')}`);

    // Stammdaten
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Stammdaten', 14, y);
    y += 7;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    const bodenLabels = { 'sand': 'Sand', 'lehm': 'Lehm', 'ton': 'Ton', 'schluff': 'Schluff', 'moor': 'Moor', 'loess': 'Löss' };
    const stamm = [
      ['Schlagname', schlag.name],
      ['Fläche', `${schlag.groesse} ha`],
      ['Flurstück', schlag.flurstueck || '–'],
      ['Bodenart', bodenLabels[schlag.bodenart] || '–'],
      ['Bodenpunkte', schlag.bodenpunkte || '–'],
      ['Koordinaten', schlag.lat && schlag.lng ? `${schlag.lat}, ${schlag.lng}` : '–']
    ];

    stamm.forEach(([label, val]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label + ':', 14, y);
      doc.setFont('helvetica', 'normal');
      doc.text(String(val), 60, y);
      y += 5;
    });

    // Kulturen
    y += 5;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Fruchtfolge', 14, y);
    y += 3;

    if (kulturen.length) {
      doc.autoTable({
        startY: y,
        head: [['Jahr', 'Kultur', 'Sorte', 'Aussaat', 'Ernte', 'Ertrag (dt/ha)']],
        body: kulturen.sort((a, b) => b.jahr - a.jahr).map(k => [
          k.jahr,
          k.kultur,
          k.sorte || '–',
          k.aussaat ? new Date(k.aussaat).toLocaleDateString('de-DE') : '–',
          k.ernte ? new Date(k.ernte).toLocaleDateString('de-DE') : '–',
          k.ertrag || '–'
        ]),
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [21, 128, 61], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        margin: { left: 14 }
      });
      y = doc.lastAutoTable.finalY + 8;
    } else {
      y += 5;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text('Keine Kulturen eingetragen', 14, y);
      y += 8;
    }

    // Maßnahmen
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Maßnahmen', 14, y);
    y += 3;

    if (massnahmen.length) {
      const typLabels = { 'duengung': 'Düngung', 'pflanzenschutz': 'PSM', 'bodenbearbeitung': 'Boden', 'aussaat': 'Aussaat', 'ernte': 'Ernte', 'sonstiges': 'Sonstig' };
      doc.autoTable({
        startY: y,
        head: [['Datum', 'Typ', 'Mittel', 'Menge', 'Kosten']],
        body: massnahmen.sort((a, b) => new Date(b.datum) - new Date(a.datum)).map(m => [
          new Date(m.datum).toLocaleDateString('de-DE'),
          typLabels[m.typ] || m.typ,
          m.mittel || '–',
          m.menge ? `${m.menge} ${m.einheit || ''}` : '–',
          m.kosten ? `${parseFloat(m.kosten).toFixed(2)} €` : '–'
        ]),
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [21, 128, 61], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        margin: { left: 14 }
      });
    }

    this.addFooter(doc);
    doc.save(`Schlagbericht_${schlag.name.replace(/\s+/g, '_')}.pdf`);
    showToast('Schlagbericht exportiert', 'success');
  },

  async exportJahresbericht(jahr) {
    if (!jahr) jahr = new Date().getFullYear();
    const doc = this.createDoc();
    if (!doc) return;

    const schlaege = await Storage.getSchlaege();
    const kulturen = await Storage.getKulturen();
    const massnahmen = await Storage.getMassnahmen();
    const jahrKulturen = kulturen.filter(k => parseInt(k.jahr) === jahr);
    const jahrMassnahmen = massnahmen.filter(m => new Date(m.datum).getFullYear() === jahr);

    let y = this.addHeader(doc, `Jahresbericht ${jahr}`, `${schlaege.length} Schläge – ${new Date().toLocaleDateString('de-DE')}`);

    // Zusammenfassung
    const totalHa = schlaege.reduce((s, x) => s + (parseFloat(x.groesse) || 0), 0);
    const totalKosten = jahrMassnahmen.reduce((s, m) => s + (parseFloat(m.kosten) || 0), 0);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Gesamtfläche: ${totalHa.toFixed(2)} ha | Kulturen: ${jahrKulturen.length} | Maßnahmen: ${jahrMassnahmen.length} | Kosten: ${totalKosten.toFixed(0)} €`, 14, y);
    y += 10;

    // Schlagübersicht
    const typLabels = { 'duengung': 'Düngung', 'pflanzenschutz': 'PSM', 'bodenbearbeitung': 'Boden', 'aussaat': 'Aussaat', 'ernte': 'Ernte', 'sonstiges': 'Sonstig' };
    doc.autoTable({
      startY: y,
      head: [['Schlag', 'Fläche (ha)', 'Kultur', 'Ertrag (dt/ha)', 'Maßnahmen', 'Kosten (€)']],
      body: schlaege.map(s => {
        const k = jahrKulturen.find(x => x.schlagId === s.id);
        const sm = jahrMassnahmen.filter(x => x.schlagId === s.id);
        const kosten = sm.reduce((sum, m) => sum + (parseFloat(m.kosten) || 0), 0);
        return [
          s.name,
          parseFloat(s.groesse).toFixed(2),
          k ? k.kultur : '–',
          k && k.ertrag ? parseFloat(k.ertrag).toFixed(1) : '–',
          sm.length,
          kosten > 0 ? kosten.toFixed(0) : '–'
        ];
      }),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [21, 128, 61], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { left: 14 }
    });

    // Maßnahmen-Detail
    y = doc.lastAutoTable.finalY + 10;
    if (y > 250) { doc.addPage(); y = 20; }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Maßnahmen-Übersicht', 14, y);
    y += 3;

    if (jahrMassnahmen.length) {
      doc.autoTable({
        startY: y,
        head: [['Datum', 'Schlag', 'Typ', 'Mittel', 'Menge', 'Kosten']],
        body: jahrMassnahmen.sort((a, b) => new Date(a.datum) - new Date(b.datum)).map(m => {
          const s = schlaege.find(x => x.id === m.schlagId);
          return [
            new Date(m.datum).toLocaleDateString('de-DE'),
            s ? s.name : '?',
            typLabels[m.typ] || m.typ,
            m.mittel || '–',
            m.menge ? `${m.menge} ${m.einheit || ''}` : '–',
            m.kosten ? `${parseFloat(m.kosten).toFixed(2)} €` : '–'
          ];
        }),
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: [21, 128, 61], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        margin: { left: 14 }
      });
    }

    this.addFooter(doc);
    doc.save(`Jahresbericht_${jahr}.pdf`);
    showToast('Jahresbericht exportiert', 'success');
  },

  async exportDuengebericht(jahr) {
    if (!jahr) jahr = new Date().getFullYear();
    const doc = this.createDoc();
    if (!doc) return;

    const schlaege = await Storage.getSchlaege();
    const kulturen = await Storage.getKulturen();
    const massnahmen = await Storage.getMassnahmen();
    const jahrMassnahmen = massnahmen.filter(m => new Date(m.datum).getFullYear() === jahr && m.typ === 'duengung');
    const jahrKulturen = kulturen.filter(k => parseInt(k.jahr) === jahr);

    let y = this.addHeader(doc, `Düngebericht ${jahr}`, `Nährstoffbilanz gemäß DüV`);

    doc.autoTable({
      startY: y,
      head: [['Schlag', 'Kultur', 'Fläche', 'N Zufuhr', 'P Zufuhr', 'K Zufuhr', 'N org.']],
      body: schlaege.map(s => {
        const k = jahrKulturen.find(x => x.schlagId === s.id);
        const dueng = jahrMassnahmen.filter(m => m.schlagId === s.id);
        let nZ = 0, pZ = 0, kZ = 0, nOrg = 0;
        dueng.forEach(d => {
          nZ += parseFloat(d.n_gehalt) || 0;
          pZ += parseFloat(d.p_gehalt) || 0;
          kZ += parseFloat(d.k_gehalt) || 0;
          if (d.duenger_typ === 'organisch') nOrg += parseFloat(d.n_gehalt) || 0;
        });
        return [
          s.name,
          k ? k.kultur : '–',
          `${parseFloat(s.groesse).toFixed(2)} ha`,
          `${nZ.toFixed(0)} kg`,
          `${pZ.toFixed(0)} kg`,
          `${kZ.toFixed(0)} kg`,
          `${nOrg.toFixed(0)} kg`
        ];
      }),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [21, 128, 61], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { left: 14 }
    });

    this.addFooter(doc);
    doc.save(`Duengebericht_${jahr}.pdf`);
    showToast('Düngebericht exportiert', 'success');
  },

  async exportGesamtbericht() {
    const jahr = new Date().getFullYear();
    const doc = this.createDoc();
    if (!doc) return;

    let y = this.addHeader(doc, 'Cross-Compliance Gesamtbericht', `Betriebsübersicht ${jahr}`);

    const schlaege = await Storage.getSchlaege();
    const kulturen = await Storage.getKulturen();
    const massnahmen = await Storage.getMassnahmen();
    const totalHa = schlaege.reduce((s, x) => s + (parseFloat(x.groesse) || 0), 0);

    doc.setFontSize(10);
    doc.text(`Betriebsfläche: ${totalHa.toFixed(2)} ha | Schläge: ${schlaege.length} | Kulturen: ${kulturen.length} | Maßnahmen: ${massnahmen.length}`, 14, y);
    y += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Schlagverzeichnis', 14, y);
    y += 3;

    doc.autoTable({
      startY: y,
      head: [['Schlag', 'Fläche', 'Bodenart', 'Flurstück']],
      body: schlaege.map(s => {
        const bodenLabels = { 'sand': 'Sand', 'lehm': 'Lehm', 'ton': 'Ton', 'schluff': 'Schluff', 'moor': 'Moor', 'loess': 'Löss' };
        return [s.name, `${parseFloat(s.groesse).toFixed(2)} ha`, bodenLabels[s.bodenart] || '–', s.flurstueck || '–'];
      }),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [21, 128, 61], textColor: 255 },
      margin: { left: 14 }
    });

    this.addFooter(doc);
    doc.save(`Cross_Compliance_Gesamtbericht_${jahr}.pdf`);
    showToast('Gesamtbericht exportiert', 'success');
  }
};

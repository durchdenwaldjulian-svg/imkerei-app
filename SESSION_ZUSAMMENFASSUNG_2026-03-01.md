# Imkerei Tagesplaner – Zusammenfassung für neuen Chat
## Stand: 01. März 2026, ~15:30 Uhr (Session 16)

---

## Projekt-Überblick

Web-App für Imker – **bienenplan.de**
- **GitHub Repo:** durchdenwaldjulian-svg/imkerei-app
- **Hosting:** GitHub Pages (kostenlos)
- **Backend:** Supabase (Auth + PostgreSQL)
- **Domain:** bienenplan.de + bienenplan.com (IONOS)
- **Supabase:** reyswuedptkyfdkmdpft.supabase.co

---

## Alle Dateien im Projekt (20 Dateien)

| Datei | Funktion | nav.js |
|---|---|---|
| `index.html` | Hauptapp (Heute, Aufgaben, Kosten, Einstellungen, Wetter, Backup) ~2616 Z. | ✅ |
| `standorte.html` | Standort- & Völker-Verwaltung (Leaflet-Karten) ~570 Z. | ✅ |
| `behandlung.html` | Varroa-Behandlungen (CRUD, Methoden, Termine) ~704 Z. | ✅ |
| `tracht.html` | Trachtkalender (40 Typen, Timeline, Teilen) ~566 Z. | ✅ |
| `packliste.html` | Packliste (Schnell-Buttons, Mengen, Drucken) ~381 Z. | ✅ |
| `zuchtplan.html` | Königinnenzucht (Sammelbrut, Umlarven, Zusetzen) ~572 Z. | ✅ |
| `bewertung.html` | Standort-Bewertung ~622 Z. | ✅ |
| `ernte.html` | Ernteverwaltung ~537 Z. | ✅ |
| `assistent.html` | KI-Assistent ~685 Z. | ✅ |
| `bestandsbuch.html` | PDF-Export Bestandsbuch (jsPDF) ~870 Z. | ✅ |
| `forum.html` | Community-Forum (Preview-Modus) ~689 Z. | ✅ |
| `trachtkarte.html` | Öffentliche Trachtkarte (Leaflet, kein Login) ~395 Z. | ❌ |
| `imkermeister.html` | Admin-Seite (Nutzer, Statistik, Präsenz) ~915 Z. | ❌ |
| `landing.html` | Öffentliche Marketing-Startseite ~1215 Z. | ❌ |
| `config.js` | Supabase-Client, DB Helper ~103 Z. | – |
| `nav.js` | Zentrale Navigation (Desktop + Mobile) ~257 Z. | – |
| `presence.js` | Cross-Page Online-Tracking für Imkermeister ~60 Z. | – |
| `shared-styles.css` | Gemeinsame Styles ~270 Z. | – |
| `sw.js` | Service Worker (PWA Phase 1) | – |
| `manifest.json` | PWA Manifest | – |

**Rechtliche Seiten:** impressum.html, datenschutz.html, agb.html

---

## Was in den letzten Sessions passiert ist

### Sessions 7-9 (27. Feb): Navigation + Domain
- nav.js erstellt als zentrale Navigation (Single Source of Truth)
- Domain bienenplan.de + .com bei IONOS eingerichtet
- Impressum, Datenschutz, AGB erstellt

### Sessions 10-13 (27. Feb): Großes Refactoring
- index.html von 4527 → 2616 Zeilen (-42%)
- 4 Module ausgelagert: Behandlung, Tracht, Packliste, Standorte
- Alle Seiten auf nav.js umgestellt
- Diverse Bugfixes (Modal z-index, Leaflet, closeModal crashs)

### Session 14 (28. Feb): Weiteres Feintuning
- Packliste Widget-Fix
- Assistent-Bugs behoben
- Standorte-Extraktion abgeschlossen

### Session 15 (01. März): Mobile UI + Features
- Mobile Navigation Fix (Hamburger-Menü fehlte)
- Custom Task Input-Workflow (freie Aufgaben eingeben)
- presence.js erstellt (zeigt wer online ist im Imkermeister)
- Leaflet z-index Fix auf Mobile
- Behandlungen abhakbar gemacht (Checkbox)
- Zeitfelder für Aufgaben hinzugefügt

### Session 16 (01. März – AKTUELL): Marketing + Präsentation
- Instagram Carousel Slides erstellt (5 Slides, React-Artifact)
- **PPTX Präsentation erstellt (13 Folien, v3)**
  - Im Landing-Page Design-System (gleiche Farben, Typografie)
  - Fixes: Hero sauber, alle 5 Behandlungsmethoden sichtbar, 
    neue Trachtkarte-Slide, Wetter 14-Tage, Pricing sauber
- **Ordnerstruktur besprochen** → Entscheidung: Erst Bugs fixen, dann umstrukturieren
- **Branch erklärt** → User hat verstanden was ein Branch ist

---

## Bekannte offene Bugs / To-Dos

### Vom User gemeldete Bugs (noch zu identifizieren)
- User sagte: "es gibt noch paar sachen die wir fixen müssen"
- **Konkrete Bugs wurden NOCH NICHT besprochen** – das ist der nächste Schritt!

### Bekannte offene Punkte (aus PROJECT_STATUS.md)
1. **Forum Vollausbau** – Suche, Bearbeiten/Löschen, Bilder, Moderation, Pagination
2. **PWA Phase 2+3** – Offline-Cache, IndexedDB Sync (WARTEN bis Features stehen)
3. **Debug-Code entfernen** – Console.log in toggleUI, Packliste, Event Delegation
4. **RLS-Policies mit WITH CHECK** – Supabase Security Enhancement
5. **Monetarisierung** – Stripe Abo (besprochen, nicht umgesetzt)
6. **USt-IdNr. im Impressum** – Falls vorhanden eintragen
7. **Landing-Page URLs** – Links auf bienenplan.de umstellen (statt github.io)

### Geplante Verbesserungen
- **Ordnerstruktur auf GitHub** – css/, js/, pages/, admin/, legal/, docs/
  → In eigenem Branch machen, erst wenn alle Bugs gefixt sind
  → Alle HTML-Pfade müssen angepasst werden (ca. 20 Dateien)

---

## Architektur-Notizen

### Navigation (nav.js)
- Desktop: Sidebar links (dynamisch generiert)
- Mobile: Bottom-Bar + Fullscreen-Menu (unter 768px)
- Hash-Links für index.html-interne Seiten (#aufgaben, #kosten, etc.)
- `navSetActive()` Hilfsfunktion für Active-States

### Auth-Flow
- Supabase Auth über `supabase.auth.getUser()`
- Jede Seite hat eigenen Auth-Check
- Preview-Modus möglich (Login umgehen zum Testen)

### Datenbank-Tabellen
standorte, voelker, durchsichten, trachten, profiles, ernte, packliste, 
behandlungen, kosten, zuchtplaene, trachten_shared, forum_kategorien, 
forum_beitraege, forum_antworten, forum_likes

### Technische Details
- **Wetter:** Open-Meteo API (kostenlos, 14-Tage)
- **Karten:** Leaflet + OpenStreetMap
- **PDF:** jsPDF für Bestandsbuch
- **Fonts:** DM Serif Display + Outfit (Google Fonts)
- **PWA:** Nur Phase 1 (manifest.json, installierbar, kein Offline)

---

## Arbeitsregeln (vom User festgelegt)

1. **Große Aufgaben in Teilschritten** – Module einzeln, dann zusammenführen
2. **Vorschau-Version ohne Login** zum Layout-Testen
3. **Jeden Chat mit Datum/Uhrzeit benennen**
4. **VOR dem Programmieren Plan vorstellen** – Genehmigung einholen
5. **KEINE bestehende Logik ändern** ohne Bestätigung
6. **Transcripts als Source of Truth** – /mnt/project/ kann veraltet sein
7. **Immer wie Profis arbeiten** – Single Source of Truth, saubere Architektur
8. **imkermeister.html = Admin-Seite** – braucht keine nav.js
9. **trachtkarte.html = Vollbild-Karte** – braucht keine nav.js

---

## Nächster Schritt im neuen Chat

**→ User hat Bugs zu melden! Zuerst alle Bugs sammeln und systematisch durchgehen.**

Danach:
1. Bugs fixen (einzeln, Teilschritte)
2. Testen ob alles funktioniert
3. Ordnerstruktur in eigenem Git-Branch umbauen

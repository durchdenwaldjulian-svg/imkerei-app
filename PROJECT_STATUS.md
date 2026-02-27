# Imkerei Planer – Projektstatus
**Stand: 27. Februar 2026, ~21:30 Uhr (Session 13)**

---

## Projektübersicht

Web-App für Imker zur Verwaltung von Bienenständen, Völkern, Durchsichten, Trachten, Ernte und Bewertungen.

- **Live-URL:** https://bienenplan.de
- **Alternative:** https://bienenplan.com (leitet auf .de weiter)
- **Alte URL:** https://durchdenwaldjulian-svg.github.io/imkerei-app/ (leitet auf bienenplan.de weiter)
- **GitHub Repo:** durchdenwaldjulian-svg/imkerei-app
- **Hosting:** GitHub Pages (kostenlos)
- **Backend:** Supabase (Auth + Datenbank)
- **Supabase Projekt:** reyswuedptkyfdkmdpft.supabase.co
- **Domain-Anbieter:** IONOS (bienenplan.de + bienenplan.com)

---

## Architektur (aktuell nach Refactoring)

### Prinzip: Single Source of Truth
- **nav.js** = zentrale Navigation für ALLE Seiten (Desktop-Sidebar + Mobile)
- Menüänderungen nur in nav.js → wirkt überall
- Jede eigenständige Seite: eigene Auth, eigenes Supabase-Loading, eigener Render-Loop
- index.html = Hauptseite mit internen Hash-Pages (Heute, Aufgaben, Kosten, Einstellungen)

### Dateien & Struktur

| Datei | Funktion | Zeilen ca. | nav.js |
|---|---|---|---|
| `index.html` | Hauptapp (Heute, Aufgaben, Kosten, Einstellungen, Wetter, Backup, Export) | ~2616 | ✅ |
| `standorte.html` | Standort- & Völker-Verwaltung (Leaflet-Karten, CRUD) | ~570 | ✅ |
| `behandlung.html` | Behandlungen (CRUD, Methoden, Termine, Intervalle) | ~704 | ✅ |
| `tracht.html` | Trachtkalender (40 Trachttypen, Timeline, Teilen) | ~566 | ✅ |
| `packliste.html` | Packliste (Schnell-Buttons, Mengen, Drucken) | ~381 | ✅ |
| `zuchtplan.html` | Königinnenzucht (Sammelbrut, Umlarven, Zusetzen) | ~572 | ✅ |
| `bewertung.html` | Standort-Bewertung (collapsible Standorte) | ~622 | ✅ |
| `ernte.html` | Ernteverwaltung | ~537 | ✅ |
| `assistent.html` | KI-Assistent | ~685 | ✅ |
| `bestandsbuch.html` | PDF-Export Bestandsbuch (jsPDF) | ~870 | ✅ |
| `forum.html` | Community-Forum (Preview-Modus, 3 Views) | ~689 | ✅ |
| `trachtkarte.html` | Öffentliche Trachtkarte (Leaflet, kein Login) | ~395 | ❌ braucht keine |
| `imkermeister.html` | Admin-Seite / Gamification | ~915 | ❌ Admin-Seite |
| `landing.html` | Öffentliche Startseite | ~1215 | ❌ braucht keine |
| `config.js` | Supabase-Client, DB Helper | ~103 | – |
| `nav.js` | Zentrale Navigation (Desktop + Mobile) | ~257 | – |
| `shared-styles.css` | Gemeinsame Styles | ~270 | – |
| `sw.js` | Service Worker (PWA Phase 1) | – | – |
| `manifest.json` | PWA-Manifest | ~29 | – |
| `impressum.html` | Impressum (§ 5 DDG) | ~104 | ❌ braucht keine |
| `datenschutz.html` | Datenschutzerklärung (Art. 13 DSGVO) | ~199 | ❌ braucht keine |
| `agb.html` | AGB (11 Paragraphen) | ~151 | ❌ braucht keine |
| `CNAME` | GitHub Pages Custom Domain | 1 | – |

---

## Refactoring-Historie (Sessions 9-13, 27.02.2026)

### Was gemacht wurde
Die index.html wurde von **4527 auf 2616 Zeilen** reduziert (-42%) durch Auslagerung von 4 Modulen in eigenständige Seiten:

| Modul | Zeilen entfernt | Neue Datei |
|---|---|---|
| Behandlungen | ~515 | behandlung.html (704 Z.) |
| Tracht | ~498 | tracht.html (566 Z.) |
| Packliste | ~250 | packliste.html (381 Z.) |
| Standorte & Völker | ~533 | standorte.html (570 Z.) |
| Nav → nav.js | ~125 | (in nav.js integriert) |

### Mini-Helfer in index.html
Für jedes ausgelagerte Modul bleibt ein Mini-Stub in index.html, damit die Heute-Seite, Export und Backup weiterhin funktionieren:
- `behandlungMod` – Daten für Heute-Timeline
- `trachtkalenderMod` – Daten für Heute-Statistik
- `packlisteMod` – Daten + toggle() für Heute-Packlisten-Widget
- `app.data.standorte` / `app.data.voelker` – Daten für Heute/Export/Wetter

### nav.js Umstellung
Alle Seiten nutzen jetzt die zentrale nav.js (Single Source of Truth):
- Desktop-Sidebar wird dynamisch generiert
- Mobile Bottom-Bar + Fullscreen-Menu werden dynamisch generiert
- Hash-Links für index.html-interne Seiten werden automatisch abgefangen
- `navSetActive()` Hilfsfunktion für externe Active-State-Steuerung

### Bugfixes während Refactoring
- `closeModal()` crashte auf gelöschte Modal-Elemente → getElementById-Aufrufe entfernt
- Standorte: Leaflet-Karten überlagerten Bearbeitungs-Modal → z-index:10000 + Leaflet-Container-Reset beim Modal-Öffnen
- assistent.html: Hardcodierte Nav hatte falschen CSS-Klassennamen → auf nav.js umgestellt

---

## Domain-Setup (eingerichtet 26.02.2026)

### DNS bei IONOS (bienenplan.de)
| Typ | Hostname | Wert |
|-----|----------|------|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | durchdenwaldjulian-svg.github.io |

### bienenplan.com
- Domain-Weiterleitung auf https://bienenplan.de (HTTP-Redirect bei IONOS)

### GitHub Pages
- Custom Domain: bienenplan.de
- Enforce HTTPS: aktiviert ✅

### Supabase Auth
- Site URL: https://bienenplan.de
- Redirect URLs:
  - https://bienenplan.de
  - https://bienenplan.de/**
  - https://www.bienenplan.de
  - https://www.bienenplan.de/**
  - https://durchdenwaldjulian-svg.github.io/imkerei-app/** (Backup)

---

## Rechtliches (DSGVO/DDG)

### Impressum (impressum.html)
- Julian Durchdenwald, Imkerei Durchdenwald
- Lange Straße 46, 74405 Gaildorf
- info@imkershop-durchdenwald.de
- USt-IdNr.: noch eintragen falls vorhanden

### Datenschutz (datenschutz.html)
- Supabase (EU-Server Frankfurt)
- GitHub Pages, Open-Meteo, EmailJS
- Google Fonts, OpenStreetMap
- Forum, Trachtkarte, localStorage

### AGB (agb.html)
- 11 Paragraphen

---

## Offene Punkte

### 1. Forum Vollausbau
- Suche, Bearbeiten/Löschen, Bilder, Moderation, Pagination

### 2. PWA Phase 2+3 (NICHT JETZT)
- Phase 2: Service Worker für Offline-Cache
- Phase 3: Offline-Daten + Sync mit IndexedDB
- Warten bis alle Features stehen

### 3. Debug-Code entfernen
- Console.log in toggleUI, Packliste, Event Delegation

### 4. RLS-Policies mit WITH CHECK versehen
```sql
-- Empfohlen für alle Tabellen:
DROP POLICY IF EXISTS "Users can update own standorte" ON standorte;
CREATE POLICY "Users can update own standorte" ON standorte FOR UPDATE 
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- (analog für voelker, aufgaben, trachten, behandlungen, kosten, zuchtplaene)
```

### 5. Monetarisierung (besprochen, nicht umgesetzt)
- Freemium-Abo: Starter kostenlos, Pro 4,99€, Meister 12,99€
- Stripe als Zahlungsanbieter

### 6. USt-IdNr. im Impressum eintragen
- Falls vorhanden in impressum.html ergänzen

### 7. Landing-Page URLs aktualisieren
- Links in landing.html auf bienenplan.de umstellen (statt github.io)

---

## Wichtige technische Details

- **Supabase Auth** über `supabase.auth.getUser()`
- **Tabellen:** standorte, voelker, durchsichten, trachten, profiles, ernte, packliste, behandlungen, kosten, zuchtplaene, trachten_shared, forum_kategorien, forum_beitraege, forum_antworten, forum_likes
- **db Helper** in `config.js`: `db.upsert()`, `db.insert()`, `db.update()`, `db.del()`, `db.delWhere()`
- **Öffentlicher Client** (`createPublicClient`) für trachtkarte.html
- **Wetter:** Open-Meteo API (kostenlos, 14-Tage-Vorhersage, Bienen-Flugwetter)
- **Hash-Navigation:** `_startPageHash` Variable in index.html
- **Bestandsbuch PDF:** jsPDF, `alleStandortePDF()`
- **Mobile Nav:** nav.js generiert Bottom-Bar + Overlay-Menü (unter 768px)
- **PWA:** Nur Phase 1 (manifest.json, installierbar, kein Offline)

---

## Arbeitsregeln (vom User festgelegt)

1. **Große Aufgaben in Teilschritten** – Module einzeln, dann zusammenführen
2. **Vorschau-Version ohne Login** erstellen zum Layout-Testen
3. **Jeden Chat mit Datum/Uhrzeit benennen**
4. **VOR dem Programmieren Plan vorstellen** – Genehmigung einholen
5. **KEINE bestehende Logik ändern** ohne Bestätigung
6. **Transcripts als Source of Truth** – `/mnt/project/` kann veraltet sein
7. **Immer wie Profis arbeiten** – Single Source of Truth, keine Duplizierung, saubere Architektur
8. **imkermeister.html ist die Admin-Seite** – braucht keine nav.js
9. **trachtkarte.html ist reine Vollbild-Karte** – braucht keine nav.js

---

## Transcript-Dateien (chronologisch)
1. `2026-02-26-08-22-44-refactoring-shared-files-tracht-fixes.txt`
2. `2026-02-26-10-19-59-pwa-setup-wetter-ui-sidebar-fixes.txt`
3. `2026-02-26-11-30-20-pwa-rebuild-fixes-wetter-tracht-bestandsbuch.txt`
4. Session 4 – Tracht-Standort-Fix
5. Session 5 (13:00 Uhr) – PWA Phase 1, Mobile Nav, Packliste-Fix, UI-State-Fix
6. Session 6 – Forum-Planung
7. Session 7 – Zuchtplan-Bug + Rechtssicherheit (Impressum, Datenschutz, AGB)
8. Session 8 – Domain-Setup (bienenplan.de + bienenplan.com)
9. Session 9 – nav.js erstellt, Sidebar-Links konvertiert
10. Session 10 – index.html Analyse (4527 Zeilen, 8 interne Seiten)
11. Session 11 – Behandlung ausgelagert (behandlung.html, -515 Zeilen)
12. Session 12 – Tracht ausgelagert (tracht.html, -498 Zeilen), assistent.html Nav-Fix
13. Session 13 – Packliste + Standorte ausgelagert, index.html + zuchtplan.html auf nav.js, PROJECT_STATUS.md aktualisiert

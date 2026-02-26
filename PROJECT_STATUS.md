# Imkerei Planer – Projektstatus
**Stand: 26. Februar 2026, 19:00 Uhr (Session 8)**

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

## Dateien & Struktur

| Datei | Funktion | Zeilen ca. |
|---|---|---|
| `index.html` | Hauptapp (Heute, Standorte, Völker, Durchsichten, Trachtkalender, Wetter, Backup) | ~4790 |
| `config.js` | Supabase-Client, DB Helper (upsert/insert/update/del/delWhere), Auth | ~103 |
| `shared-styles.css` | Gemeinsame Styles für alle Seiten | ~270 |
| `landing.html` | Öffentliche Startseite (nicht eingeloggt) | ~38k |
| `imkermeister.html` | Gamification / Fortschrittssystem | ~38k |
| `bewertung.html` | Standort-Bewertung (Sidebar, collapsible Standorte) | ~644 |
| `ernte.html` | Ernteverwaltung (Sidebar) | ~559 |
| `assistent.html` | KI-Assistent (Sidebar) | ~706 |
| `bestandsbuch.html` | PDF-Export Bestandsbuch (jsPDF) + Jahresfilter-Persistenz | ~742 |
| `trachtkarte.html` | Öffentliche Trachtkarte (Leaflet, shared Trachten) | ~394 |
| `zuchtplan.html` | Königinnenzucht – eigenständige Seite, Supabase-Speicherung | ~neu |
| `forum.html` | Community-Forum mit Preview-Modus, 3 Views | ~neu |
| `impressum.html` | § 5 DDG – Julian Durchdenwald, Imkerei Durchdenwald | ~neu |
| `datenschutz.html` | Art. 13 DSGVO – Supabase, GitHub Pages, Open-Meteo etc. | ~neu |
| `agb.html` | 11 Paragraphen – Leistung, Registrierung, Haftung etc. | ~neu |
| `manifest.json` | PWA-Manifest (Phase 1 – nur installierbar, kein Service Worker) | ~29 |
| `icon192.png` | PWA-Icon 192x192 (Honigwaben-Design mit Biene) | – |
| `icon512.png` | PWA-Icon 512x512 | – |

---

## Rechtliches (DSGVO/DDG – eingerichtet 26.02.2026)

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

### Integration
- Sidebar: Abschnitt "Rechtliches" in allen Seiten
- Mobile: Links im Overlay-Menü
- Landing-Page: Footer-Links

---

## Forum (Basis erstellt, Vollausbau ausstehend)

### SQL-Tabellen (forum-setup.sql)
- forum_kategorien, forum_beitraege, forum_antworten, forum_likes
- RLS-Policies, 5 Kategorien, Trigger für antworten_count

### Features (Basis)
- 3 Views: Kategorien-Übersicht, Thread-Liste, Thread-Ansicht
- Preview-Modus mit Demo-Daten
- Sidebar-Navigation, Mobile-optimiert

### Geplante Features (Vollausbau)
- Suche, Bearbeiten/Löschen, Bilder hochladen
- Moderation, User-Profile, Benachrichtigungen
- Zitat-Funktion, Pagination

---

## Zuchtplan (Bug behoben 26.02.2026)

### Problem & Lösung
- **Bug:** Zuchtpläne in localStorage statt Supabase → Daten nach Reload weg
- **Fix:** Neue eigenständige zuchtplan.html mit direkter Supabase-Speicherung
- **SQL:** `ALTER TABLE zuchtplaene ADD COLUMN IF NOT EXISTS erledigt_schritte jsonb DEFAULT '[]'`

### Heute-Seite Integration
- Zeigt alle 3 Schritte: 📦 Sammelbrut, 🔬 Umlarven, 👑 Zusetzen
- Abhak-Buttons speichern in Supabase
- 📋-Button verlinkt zu zuchtplan.html

---

## Was am 26.02.2026 passiert ist (8 Sessions)

### Session 1: Refactoring & Tracht-Fixes
### Session 2: PWA, Wetter-Picker, Sidebar
### Session 3: Kompletter Rebuild nach PWA-Crash
### Session 4: Tracht-Standort Fix
### Session 5: PWA Phase 1, Mobile Nav, Bugfixes

### Session 6: Forum-Planung
- Forum basis-Version erstellt (forum.html + forum-setup.sql)
- Navigation in allen Seiten aktualisiert

### Session 7: Zuchtplan-Bug + Rechtssicherheit
- Zuchtplan localStorage→Supabase Migration
- zuchtplan.html als eigenständige Seite
- Impressum, Datenschutz, AGB erstellt
- Sidebar "Rechtliches" in allen Seiten

### Session 8: Domain-Setup
- bienenplan.de + bienenplan.com bei IONOS gekauft
- DNS A-Records + CNAME für GitHub Pages eingerichtet
- GitHub Pages Custom Domain + HTTPS aktiviert
- Supabase Auth URLs aktualisiert
- bienenplan.com → bienenplan.de Weiterleitung
- **App live unter https://bienenplan.de** ✅

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
-- Empfohlen für alle Tabellen (Packliste + Profiles schon gemacht):
DROP POLICY IF EXISTS "Users can update own standorte" ON standorte;
CREATE POLICY "Users can update own standorte" ON standorte FOR UPDATE 
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own voelker" ON voelker;
CREATE POLICY "Users can update own voelker" ON voelker FOR UPDATE 
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own aufgaben" ON aufgaben;
CREATE POLICY "Users can update own aufgaben" ON aufgaben FOR UPDATE 
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own trachten" ON trachten;
CREATE POLICY "Users can update own trachten" ON trachten FOR UPDATE 
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own behandlungen" ON behandlungen;
CREATE POLICY "Users can update own behandlungen" ON behandlungen FOR UPDATE 
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own kosten" ON kosten;
CREATE POLICY "Users can update own kosten" ON kosten FOR UPDATE 
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own zuchtplaene" ON zuchtplaene;
CREATE POLICY "Users can update own zuchtplaene" ON zuchtplaene FOR UPDATE 
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

### 5. Monetarisierung (besprochen, nicht umgesetzt)
- Freemium-Abo: Starter kostenlos, Pro 4,99€, Meister 12,99€
- Stripe als Zahlungsanbieter

### 6. Zentrale nav.js (optional)
- Würde Sidebar-Änderungen vereinfachen (aktuell in jeder HTML-Datei kopiert)
- Größeres Refactoring, kein Muss

### 7. USt-IdNr. im Impressum eintragen
- Falls vorhanden in impressum.html ergänzen

### 8. Landing-Page URLs aktualisieren
- Links in landing.html auf bienenplan.de umstellen (statt github.io)

---

## Wichtige technische Details

- **Supabase Auth** über `supabase.auth.getUser()`
- **Tabellen:** standorte, voelker, durchsichten, trachten, profiles, ernte, packliste, behandlungen, kosten, zuchtplaene, trachten_shared, forum_kategorien, forum_beitraege, forum_antworten, forum_likes
- **db Helper** in `config.js`: `db.upsert()`, `db.insert()`, `db.update()`, `db.del()`, `db.delWhere()`
- **Öffentlicher Client** (`createPublicClient`) für trachtkarte.html
- **Wetter:** Open-Meteo API (kostenlos)
- **Hash-Navigation:** `_startPageHash` Variable
- **Bestandsbuch PDF:** jsPDF, `alleStandortePDF()`
- **Mobile Nav:** Bottom-Bar + Overlay-Menü (unter 768px)
- **PWA:** Nur Phase 1 (manifest.json, kein Service Worker)

---

## Arbeitsregeln (vom User festgelegt)

1. **Große Aufgaben in Teilschritten** – Module einzeln, dann zusammenführen
2. **Vorschau-Version ohne Login** erstellen zum Layout-Testen
3. **Jeden Chat mit Datum/Uhrzeit benennen**
4. **VOR dem Programmieren Plan vorstellen** – Genehmigung einholen
5. **KEINE bestehende Logik ändern** ohne Bestätigung
6. **Transcripts als Source of Truth** – `/mnt/project/` kann veraltet sein

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

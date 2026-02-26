# Imkerei Planer – Projektstatus
**Stand: 26. Februar 2026, 13:00 Uhr (Session 5)**

---

## Projektübersicht

Web-App für Imker zur Verwaltung von Bienenständen, Völkern, Durchsichten, Trachten, Ernte und Bewertungen. Gehostet auf **GitHub Pages**, Backend über **Supabase** (Auth + Datenbank).

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
| `manifest.json` | PWA-Manifest (Phase 1 – nur installierbar, kein Service Worker) | ~29 |
| `icon192.png` | PWA-Icon 192x192 (Honigwaben-Design mit Biene) | – |
| `icon512.png` | PWA-Icon 512x512 | – |

---

## Was am 26.02.2026 passiert ist (5 Sessions)

### Session 1: Refactoring & Tracht-Fixes
- Shared CSS und Config extrahiert
- Trachtkalender Toggle/Persistence Bugs gefixt
- Delete-Funktionen für shared Trachten mit Voll-Backup
- UI State Persistence in Supabase

### Session 2: PWA, Wetter-Picker, Sidebar
- Wetter-Standort-Picker mit Modal (Karte/Suche/Standort-Auswahl)
- Sidebar-Navigation für bewertung, ernte, assistent, bestandsbuch
- Hash-basierte Navigation (#trachten, #wetter etc.)
- PWA-Implementierung versucht

### Session 3: Kompletter Rebuild nach PWA-Crash
- **PWA hat die gesamte App zerstört** – nichts lud mehr
- Alle 10 Dateien komplett neu aufgebaut aus Transcripts
- PWA-Code vollständig entfernt
- Bestandsbuch: Multi-Standort-PDF als EIN Dokument statt mehrere Downloads
- Tracht-Standort-Validierung: Fallbacks eingebaut

### Session 4: Tracht-Standort Fix
- Bug: "Typ und Standort eingeben" obwohl Karte geklickt wurde
- Fix in `saveTracht()`: 3 Fallback-Stufen

### Session 5: PWA Phase 1, Mobile Nav, Bugfixes (13:00 Uhr)

#### Erledigt:
1. **Sidebar Schriftfarbe Fix** – `color:inherit` bei `<a>`-Links entfernt, alle Nav-Items nutzen jetzt einheitlich `.nav-item` CSS
2. **Heute-Seite Fächer: State-Persistenz gefixt**
   - onclick-Handler auf Fächern funktionierten nicht (onclick auf divs im innerHTML)
   - **Lösung:** `data-toggle-ui` Attribute + Event Delegation auf `document`
   - `toggleUI()` speichert jetzt in Supabase UND localStorage als Fallback
   - Supabase `ui_state` Spalte existiert und funktioniert (WITH CHECK Policy wurde ergänzt)
3. **Bestandsbuch Jahresfilter** – Gewähltes Jahr wird in localStorage gespeichert und beim nächsten Öffnen wiederhergestellt
4. **PWA Phase 1 – App installierbar**
   - `manifest.json` Icon-Pfade korrigiert (`icon192.png` statt `icon-192.png`)
   - `<link rel="manifest">` + `<meta name="theme-color">` in alle 8 HTML-Dateien eingefügt
   - **Kein Service Worker, kein Cache** – nur installierbar auf Homescreen
   - Kein Wartungsaufwand, null Risiko
5. **Mobile Navigation komplett überarbeitet**
   - Desktop-Sidebar bleibt unverändert
   - Neue mobile Bottom-Nav mit 6 Buttons: ☰ Menü, Heute, Standorte, Aufgaben, Tracht, Mehr
   - Vollbild-Overlay-Menü (☰) mit allen 14 Seiten als Grid-Buttons
   - Footer auf Mobile ausgeblendet
   - Swipe-Navigation (links/rechts) funktioniert weiterhin
6. **Trachtkarte Mobile** – Filter-Bar von `top:65px` auf `top:110px` verschoben, überlagert den Button nicht mehr
7. **Packliste Supabase-Persistenz gefixt** ⚠️ WICHTIGER BUG
   - **Ursache:** `speichern()` war komplett leer (nur Kommentar)! Items wurden nie nach Supabase geschrieben
   - Bei jedem Reload: Supabase leer → neue Items generiert → neue IDs → alle Änderungen weg
   - **Fix:** `speichern()` implementiert mit `sb.from('packliste').upsert(rows)`
   - `toggle()` nutzt jetzt `upsert` statt `update` (legt Datensatz an falls er fehlt)
   - **Funktioniert jetzt:** Abhaken, Löschen, Menge ändern bleibt nach Reload erhalten

#### Supabase RLS-Policies geändert:
- `profiles` UPDATE: WITH CHECK ergänzt (`auth.uid() = id`)
- `packliste` UPDATE: WITH CHECK ergänzt (`auth.uid() = user_id`)
- **Empfehlung:** Alle Tabellen-Policies mit WITH CHECK versehen (SQL im Chat vorhanden)

#### Debug-Code noch drin (entfernen in nächster Session):
- `toggleUI()` hat Console-Logs (`[toggleUI] ➡️ ...`)
- `packlisteMod.toggle()` hat Console-Logs (`[Packliste] Toggle: ...`)
- `packlisteMod.speichern()` hat Console-Logs
- `packlisteMod.loescheItem()` hat Console-Logs
- Event Delegation hat Console-Log (`[EVENT] Klick auf data-toggle-ui:`)

---

## Offene Punkte

### 1. PWA Phase 2+3 (NICHT JETZT – erst wenn App stabil)
- Phase 2: Service Worker für Offline-Cache (HTML/CSS/JS)
- Phase 3: Offline-Daten + Sync mit IndexedDB
- **Warten bis:** Alle Features stehen, Layout final, Tabellen stabil

### 2. Debug-Code entfernen
- Console.log-Meldungen in toggleUI, Packliste, Event Delegation
- Erst entfernen wenn alles stabil getestet

### 3. SQL-Spalten (manche schon angelegt)
```sql
-- Diese wurden in Session 5 bestätigt als vorhanden:
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ui_state jsonb DEFAULT '{}';

-- Diese sollten geprüft werden:
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS wetter_ort text DEFAULT 'Spöck';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS wetter_lat double precision DEFAULT 49.0833;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS wetter_lng double precision DEFAULT 8.45;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bewertung_collapsed jsonb DEFAULT '[]';
ALTER TABLE trachten ADD COLUMN IF NOT EXISTS lat double precision;
ALTER TABLE trachten ADD COLUMN IF NOT EXISTS lng double precision;
ALTER TABLE trachten ADD COLUMN IF NOT EXISTS shared boolean DEFAULT false;
```

### 4. RLS-Policies für alle Tabellen mit WITH CHECK versehen
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
- Freemium-Abo empfohlen (Starter kostenlos, Pro 4,99€, Meister 12,99€)
- Stripe als Zahlungsanbieter
- Preisstruktur auf landing.html bereits angelegt

---

## Wichtige technische Details

- **Supabase Auth** über `supabase.auth.getUser()`
- **Tabellen:** standorte, voelker, durchsichten, trachten, profiles, ernte, packliste, behandlungen, kosten, zuchtplaene, trachten_shared
- **db Helper** in `config.js`: `db.upsert()`, `db.insert()`, `db.update()`, `db.del()`, `db.delWhere()`
- **Packliste:** `packlisteMod.speichern()` macht Bulk-Upsert, `toggle()` macht Einzel-Upsert
- **UI-State:** Event Delegation via `data-toggle-ui` Attribute + `document.addEventListener('click')`
- **Öffentlicher Client** (`createPublicClient`) für trachtkarte.html
- **Wetter:** Open-Meteo API (kostenlos), Standort in profiles gespeichert
- **Hash-Navigation:** `_startPageHash` Variable fängt Hash vor Auth-Redirect ab
- **Backup:** JSON-Export, Voll-Backup vor Löschaktionen
- **Bestandsbuch PDF:** jsPDF, `alleStandortePDF()` = EIN Multi-Page-PDF
- **Mobile Nav:** Eigene Bottom-Bar + Overlay-Menü (nur unter 768px sichtbar), Desktop-Sidebar unverändert
- **PWA:** Nur Phase 1 (manifest.json verlinkt, kein Service Worker)

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

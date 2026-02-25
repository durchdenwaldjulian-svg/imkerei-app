# 🐝 Imkerei Tagesplaner – Projekt-Zusammenfassung

## Kontext für neuen Chat
Diese Zusammenfassung enthält alles Wichtige zum Projekt. Bitte alle hochgeladenen HTML/SQL-Dateien als Arbeitsgrundlage verwenden. Änderungen direkt in die bestehenden Dateien einarbeiten. Vorschau-Versionen sollen Login umgehen (Preview-Modus mit Demo-Daten).

### Chat-Benennung
Jeden neuen Chat mit Datum/Uhrzeit starten, z.B.: `2026-02-25 16:00 – Statistik-Dashboard bauen`

---

## 🔧 Technologie-Stack
- **Frontend**: Vanilla HTML/CSS/JS (kein Framework), Single-Page-App (index.html) + separate Seiten
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Design**: Warme Farben (#F5A623 Gold, #1C1410 Dunkelbraun, #FFFBF0 Creme), Fonts: DM Serif Display + Outfit
- **Maps**: Leaflet.js + OpenStreetMap
- **Supabase-URL**: `https://reyswuedptkyfdkmdpft.supabase.co`
- **Supabase-Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJleXN3dWVkcHRreWZka21kcGZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NjM0MDQsImV4cCI6MjA4NzQzOTQwNH0.mrqs7lPs3S7B62sKpTbuzuxAcodil04RQ7HUjuQHuKI`

---

## 📁 Dateistruktur

### Gemeinsame Dateien (NEU – Refactoring Chat 1)
| Datei | Beschreibung |
|-------|-------------|
| `shared-styles.css` | Alle gemeinsamen CSS-Styles (Reset, Typo, Cards, Buttons, Forms, Modals, Toast, Badges, Tabs, Topbar, Charts, Animations) |
| `config.js` | Supabase-Config (URL+Key), DB-Helper (CRUD), Auth-Helper (`checkAuth()`), Toast-Helper |

### Hauptdateien
| Datei | Zeilen | Beschreibung | Nutzt shared files? |
|-------|--------|-------------|---------------------|
| `index.html` | ~4308 | Hauptapp: Login, Sidebar, alle internen Seiten | ✅ shared-styles.css + config.js |
| `ernte.html` | ~520 | Honigernte-Erfassung + Archiv mit Charts | ✅ shared-styles.css + config.js |
| `bewertung.html` | ~575 | Völker-Bewertung (8 Kriterien, Ranking, Verlauf) | ✅ shared-styles.css + config.js |
| `bestandsbuch.html` | ~710 | EU-konformes Bestandsbuch für Behandlungen | ✅ config.js (eigenes CSS-System mit Variablen) |
| `assistent.html` | ~675 | Behandlungsassistent (Wizard mit Empfehlungen) | ✅ config.js |
| `trachtkarte.html` | ~293 | Trachtkarte mit Leaflet | ❌ noch eigene Config (spezielle Supabase-Optionen) |
| `imkermeister.html` | ~xxx | Imkermeister-Seite | ❌ noch eigene Config (spezielle Supabase-Optionen) |
| `landing.html` | ~xxx | Landing Page | ❌ kein Supabase |

---

## 🗄️ Supabase-Tabellen (alle mit RLS, user_id-basiert)

| Tabelle | Verwendet in | Zweck |
|---------|-------------|-------|
| `standorte` | index.html | Standorte mit Name, Adresse, lat/lng |
| `voelker` | index.html | Bienenvölker mit Rasse, Königin, Status |
| `aufgaben` | index.html | Aufgaben mit Typ, Datum, standort_id, intervall_tage |
| `kosten` | index.html | Kostentracking (Kategorie, Betrag) |
| `behandlungen` | index.html, bestandsbuch.html, assistent.html | Behandlungseinträge |
| `zuchtplaene` | index.html | Königinnenzucht-Planung |
| `trachten` | index.html | Eigene Trachtquellen |
| `trachten_shared` | index.html | Vordefinierte Trachtquellen |
| `trachten_ausgeblendet` | index.html | Ausgeblendete Trachten (Supabase, nicht localStorage!) |
| `packliste` | index.html | Packliste mit checked/menge (Supabase-persistent) |
| `ernten` | ernte.html | Honigernten (Menge, Sorte, Standort) |
| `bewertungen` | bewertung.html | Völker-Bewertung (8 Kriterien, 1-5 Sterne) |
| `profiles` | index.html | Benutzerprofile |

---

## 📱 Sidebar-Struktur (index.html)

```
ÜBERSICHT
  📅 Heute          → Unified Timeline (Aufgaben+Behandlungen+Zucht) – ALLE Gruppen einklappbar
  📍 Standorte      → Standort-Karten mit Mini-Maps
  📝 Aufgaben       → Mit Intervallen & Standort-Zuweisung

VÖLKER
  👑 Königinnenzucht
  💉 Behandlungen
  ⭐ Völker-Bewertung  → bewertung.html (extern)
  🤖 Assistent         → assistent.html (extern)
  📋 Bestandsbuch      → bestandsbuch.html (extern)

ERNTE & PLANUNG
  🍯 Honigernte     → ernte.html (extern)
  🌸 Tracht         → Trachtkalender
  📦 Packliste      → Mit Druckfunktion

VERWALTUNG
  💰 Kosten
  ⚙️ Einstellungen  → Auto-Backup-System
  🚪 Abmelden
```

---

## ✅ Bereits implementierte Features

### index.html (Hauptapp)
- **Login/Auth**: Supabase Auth mit E-Mail/Passwort, Session-Handling
- **Heute-Tab**: Unified Timeline – alle Events nach Dringlichkeit sortiert. **Alle 4 Gruppen einklappbar** (Überfällig ▼, Heute ▼, Nächste 7 Tage ▼, Später ▶)
- **Standorte**: CRUD mit Kartenauswahl (Leaflet), Mini-Maps in Übersicht, Völker pro Standort
- **Völker**: CRUD mit Rasse, Königin-Info, Status, Honigertrag
- **Aufgaben**: Mit Typ-Auswahl, Standort-Zuweisung, Intervall-System
- **Behandlungen**: Erfassung mit Medikament, Diagnose, Dosierung, Dauer, Wartezeit, ChargenNr, Tierarzt
- **Königinnenzucht**: Zuchtpläne mit Terminen
- **Trachtkalender**: Monatsansicht, eigene + vordefinierte Trachten
- **Packliste**: Kategorien, Mengen, Check-Status – Supabase-persistent + Druckfunktion
- **Kosten**: Kategorie, Betrag, Datum, Jahresübersicht
- **Auto-Backup**: Vor jedem Löschen automatisch Backup

### ernte.html
- Erfassung + Archiv mit Balkendiagrammen

### bewertung.html
- 8 Kriterien, Ranking, Verlauf mit Trend-Pfeilen

### bestandsbuch.html
- EU-konforme Behandlungsdokumentation, Druckansicht

### assistent.html
- 4-Schritt-Wizard mit kontextsensitiven Empfehlungen

---

## 🐛 Behobene Bugs
1. Standort-Update: closeModal() vor db.update() → Fix: Save BEFORE closeModal
2. Trachten ausblenden: localStorage statt Supabase → Fix: trachten_ausgeblendet-Tabelle
3. Packliste: checked/menge nur lokal → Fix: Supabase-Calls

---

## 🏗️ Architektur-Prinzipien
- **shared-styles.css** = Alle gemeinsamen Styles (einmal ändern, überall wirkt)
- **config.js** = Supabase-Config + DB-Helper + Auth-Helper (einmal ändern, überall wirkt)
- **index.html** = Hauptapp mit Login + Sidebar (SPA mit pages-Object)
- **Externe Seiten** = eigenständige HTML-Dateien die config.js + shared-styles.css einbinden
- Alle Daten über Supabase RLS geschützt (user_id = auth.uid())

---

## 🔄 Refactoring-Status

### ✅ Chat 1 (2026-02-25): shared-styles.css + config.js extrahiert
- Gemeinsame CSS in shared-styles.css ausgelagert
- Supabase-Config + DB-Helper + Auth-Helper in config.js
- index.html, ernte.html, bewertung.html, bestandsbuch.html, assistent.html refaktoriert
- Heute-Seite: alle 4 Timeline-Gruppen jetzt einklappbar

### 🔲 Chat 2 (geplant): trachtkarte.html + imkermeister.html auf config.js umstellen
### 🔲 Chat 3 (geplant): index.html JS-Module aufteilen (Sidebar, einzelne Seiten)
### 🔲 Chat 4-5 (geplant): Testen, Bugs fixen, Preview-Modus überall

---

## 🔮 Nächste geplante Features
- Weitere Assistenten: Schwarm-, Fütterungs-, Ableger-Assistent
- Wetter-Integration
- Foto-Upload
- PDF-Export
- Statistik-Dashboard

---

## 💡 Wichtige Hinweise für Entwicklung
1. **Neue Seiten** müssen `<link rel="stylesheet" href="shared-styles.css">` und `<script src="config.js"></script>` einbinden
2. **Supabase-Config nur in config.js ändern** – nicht in einzelnen Dateien!
3. **Neue CSS-Klassen** die in mehreren Dateien gebraucht werden → in shared-styles.css
4. **Seiten-spezifische Styles** → im `<style>`-Block der jeweiligen HTML-Datei
5. **Preview-Modus**: `checkAuth({preview: true})` nutzen für Demo-Modus ohne Login
6. **Backups**: autoBackup-System in index.html – bei neuen Tabellen dort ergänzen

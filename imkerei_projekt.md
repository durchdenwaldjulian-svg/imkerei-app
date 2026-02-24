# Imkerei-App – Projektdokumentation
## Stand: 24. Februar 2026

---

## ZUGANG & URLS

- **GitHub Repo:** durchdenwaldjulian-svg/imkerei-app
- **Website:** https://durchdenwaldjulian-svg.github.io/imkerei-app/
- **Trachtkarte:** https://durchdenwaldjulian-svg.github.io/imkerei-app/trachtkarte.html
- **Admin:** https://durchdenwaldjulian-svg.github.io/imkerei-app/imkermeister.html (Passwort: Veronika4701)
- **Supabase Projekt:** reyswuedptkyfdkmdpft.supabase.co
- **Supabase Anon Key:** eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJleXN3dWVkcHRreWZka21kcGZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NjM0MDQsImV4cCI6MjA4NzQzOTQwNH0.mrqs7lPs3S7B62sKpTbuzuxAcodil04RQ7HUjuQHuKI

---

## DATEIEN AUF GITHUB

- **index.html** – Hauptapp (vorher imkerei_cloud.html)
- **trachtkarte.html** – Öffentliche Karte mit geteilten Trachten (Leaflet + Supabase)
- **imkermeister.html** – Admin-Seite (passwortgeschützt)

---

## TECHNIK

- **Frontend:** Einzelne HTML-Dateien, kein Framework, vanilla JS
- **Backend:** Supabase (PostgreSQL + Auth + RLS)
- **Hosting:** GitHub Pages (kostenlos, statisch)
- **Karten:** Leaflet.js mit OpenStreetMap (kein API Key nötig)
- **Auth:** Supabase Auth mit E-Mail/Passwort

---

## SUPABASE TABELLEN

1. **profiles** – user_id, email, name, imkerei, created_at, last_login
2. **standorte** – id, user_id, name, notizen, maps_link, lat, lng, created_at
3. **voelker** – id, user_id, standort_id, name, beutensystem, status, notizen, honigertrag, created_at
4. **aufgaben** – id, user_id, titel, beschreibung, datum, erledigt, created_at
5. **trachten** – id, user_id, typ, standort, beginn, ende, ertrag, notizen, created_at
6. **behandlungen** – id, user_id, voelker_ids, voelker_label, methode, methode_name, datum, intervall, intervall_label, termine, notizen, created_at
7. **kosten** – id, user_id, kategorie, beschreibung, betrag, datum, created_at
8. **packliste** – id, user_id, kategorie, name, checked, menge, ist_schnell, schnell_typ
9. **trachten_shared** – id, user_id, user_name, typ, standort, lat, lng, beginn, ende, ertrag, notizen, jahr, created_at (öffentlich lesbar für Trachtkarte)
10. **zuchtplaene** – Königinnenzucht-Pläne

---

## APP-FEATURES (Sidebar/Navigation)

- 🏠 Heute – Dashboard mit Schnellübersicht, überfällige Aufgaben, anstehende Behandlungen, Zuchtplan-Termine
- 📍 Standorte – Standorte mit Völkern verwalten, GPS-Koordinaten per Karten-Picker
- 🐝 Völker – Völker pro Standort, Status, Beutensystem
- ✓ Aufgaben – Todo-Liste für Imkerei
- 🌸 Tracht – Trachten erfassen mit Karten-Picker für GPS, Teilen-Checkbox für öffentliche Karte, Bearbeiten-Button, Trachtkalender (Gantt-Chart)
- 💉 Behandlung – Varroabehandlungen mit Terminen
- 🍯 Ernte – Honigernte pro Standort/Volk
- 💰 Kosten – Ausgaben tracken
- 👑 Zuchtplan – Königinnenzucht mit automatischer Datumsberechnung
- 📦 Packliste – Ausrüstung abhaken

---

## OFFENE PROBLEME (24.02.2026)

### 1. Trachten werden NICHT auf der Trachtkarte angezeigt
- **Problem:** Beim Speichern einer neuen Tracht (mit Karten-Klick + Share-Checkbox) wird nichts in `trachten_shared` geschrieben
- **Debug-Status:** console.log mit "SAVE TRACHT:" wurde eingebaut aber User hat noch nicht getestet
- **Vermutung:** Die hidden inputs `trachtLatE` und `trachtLngE` bekommen die Werte vom Map-Picker nicht korrekt, ODER `share` ist false
- **saveTracht()** ist in `trachtkalenderMod` (ca. Zeile 2941), ist jetzt `async`
- **RLS Policies** auf trachten_shared sind korrekt (anon + authenticated können SELECT, authenticated kann INSERT/UPDATE/DELETE)
- Die INSERT Policy wurde gelockert: `TO anon, authenticated WITH CHECK (true)`

### 2. Trachten aus localStorage kamen nach Löschen zurück
- **Fix:** `trachtkalenderMod.init()` lädt nicht mehr aus localStorage, `speichern()` ist leer
- **Fix:** `deleteTracht()` löscht jetzt aus Supabase via `db.del()`
- **Fix:** localStorage wird beim Login gelöscht
- **Status:** Sollte funktionieren, muss getestet werden

### 3. Tracht bearbeiten
- **Eingebaut:** ✏️ Button bei jeder Tracht, öffnet Modal mit vorausgefüllten Feldern
- **Status:** Sollte funktionieren, muss getestet werden

---

## WICHTIGE CODE-STRUKTUREN

### Daten laden (startApp)
- Alle Daten werden parallel aus Supabase geladen in `startApp()`
- `trachtkalenderMod.trachten` wird aus Supabase befüllt (Zeile ~796)
- NICHT aus localStorage

### Tracht-System
- **Zwei Tracht-Bereiche:** rTracht (Zeile ~2104, mit Share/Edit/Delete Buttons) + rTrachtkalender (Gantt-Chart, eingebettet in rTracht)
- **Route:** `tracht: this.rTracht.bind(this)` 
- **Modal:** `trachtModalEnhanced` mit Leaflet Map-Picker
- **trachtkalenderMod:** separates Modul mit openModal, editTracht, saveTracht, deleteTracht, etc.

### Map-Picker
- `app.initMapPicker(type)` – initialisiert Leaflet-Karte in Modal
- type = 'standort' oder 'tracht'
- Klick auf Karte setzt hidden inputs (standortLat/standortLng oder trachtLatE/trachtLngE)
- Zeigt ✅ Status-Text

### Supabase Client
- Hauptapp: normaler Client mit Auth
- trachtkarte.html: Client mit `auth: {persistSession: false, autoRefreshToken: false, detectSessionInUrl: false}` (verhindert postMessage errors)

---

## DEPLOYMENT-WORKFLOW

1. Claude erstellt/ändert `index.html` (oder andere Dateien)
2. User lädt auf GitHub hoch: alte Datei löschen → Add file → Upload → Commit
3. GitHub Pages deployt automatisch (1-2 Min warten)
4. SQL-Änderungen: User führt im Supabase SQL Editor aus

**WICHTIG:** Datei immer als `index.html` benennen (nicht imkerei_cloud.html)

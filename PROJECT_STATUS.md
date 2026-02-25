# Imkerei-App – Projektstatus & Kontext

> **Zweck dieser Datei:** Dient als Briefing für KI-Assistenten (z. B. Claude) in neuen Chat-Sitzungen.
> Abrufbar via: `https://raw.githubusercontent.com/durchdenwaldjulian-svg/imkerei-app/main/PROJECT_STATUS.md`

---

## 1. Projektübersicht

| Eigenschaft | Wert |
|---|---|
| **GitHub-Repo** | `durchdenwaldjulian-svg/imkerei-app` |
| **Hosting** | GitHub Pages (vermutlich `https://durchdenwaldjulian-svg.github.io/imkerei-app/`) |
| **Backend** | Supabase |
| **Supabase-Projekt-Ref** | `reyswuedptkyfdkmdpft` |
| **Supabase-URL** | `https://reyswuedptkyfdkmdpft.supabase.co` |
| **Technologie** | Vanilla HTML/CSS/JS (kein Framework), Supabase JS Client |
| **Sprache** | Deutsch |

### Bekannte Seiten / Dateien
- `index.html` – Hauptseite / Login / Dashboard
- `trachtkarte.html` – Trachtkarte (Karte mit Trachtquellen für Bienen)
- Weitere Seiten möglicherweise vorhanden (z. B. Stockkarten, Völkerverwaltung, etc.)

---

## 2. Offene Probleme (Stand: Februar 2026)

### 🔴 Problem 1: Login / Password Recovery zeigt auf `localhost`

**Symptom:** Wenn ein Benutzer "Passwort vergessen" nutzt, enthält die E-Mail einen Link mit `http://localhost:...` statt der echten App-URL.

**Ursache (sehr wahrscheinlich):** In den Supabase-Projekteinstellungen ist die Site-URL noch auf localhost konfiguriert.

**Fix – Supabase Dashboard:**
1. Gehe zu: **Authentication → URL Configuration**
2. Setze **Site URL** auf: `https://durchdenwaldjulian-svg.github.io/imkerei-app/`
3. Füge unter **Redirect URLs** hinzu:
   - `https://durchdenwaldjulian-svg.github.io/imkerei-app/index.html`
   - `https://durchdenwaldjulian-svg.github.io/imkerei-app/**` (Wildcard)
4. Speichern.

**Fix – ggf. auch im Code prüfen:**
- Suche in `index.html` nach `redirectTo` im `resetPasswordForEmail()`-Aufruf
- Falls dort `localhost` hardcoded ist, durch die echte URL ersetzen
- Beispiel:
  ```js
  // FALSCH:
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'http://localhost:3000/reset'
  })
  // RICHTIG:
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://durchdenwaldjulian-svg.github.io/imkerei-app/index.html'
  })
  ```

---

### 🔴 Problem 2: Trachten werden nicht auf der Trachtkarte angezeigt (`trachten_shared` bleibt leer)

**Symptom:** Benutzer speichert eine Tracht, aber sie erscheint nicht auf der Karte. Die Tabelle `trachten_shared` in Supabase bleibt leer.

**Mögliche Ursachen (nach Wahrscheinlichkeit sortiert):**

1. **Code schreibt nur in `trachten` (private Tabelle), nicht in `trachten_shared`**
   - Prüfe die Speicher-Funktion in `trachtkarte.html`
   - Suche nach `.insert(` oder `.upsert(` und prüfe den Tabellennamen

2. **RLS (Row Level Security) blockiert den INSERT auf `trachten_shared`**
   - Supabase hat RLS standardmäßig aktiviert
   - Prüfe im Supabase Dashboard unter **Table Editor → trachten_shared → Policies**
   - Es braucht mindestens:
     ```sql
     -- INSERT erlauben für eingeloggte Benutzer
     CREATE POLICY "Eingeloggte Benutzer können Trachten teilen"
     ON trachten_shared FOR INSERT
     TO authenticated
     WITH CHECK (true);

     -- SELECT erlauben für alle eingeloggten Benutzer
     CREATE POLICY "Alle können geteilte Trachten sehen"
     ON trachten_shared FOR SELECT
     TO authenticated
     USING (true);
     ```

3. **Spalten-Mismatch** – Der Code sendet Felder, die in der Tabelle nicht existieren (oder umgekehrt)
   - Prüfe die Tabellenstruktur in Supabase und vergleiche mit dem JS-Insert-Objekt

4. **Kein Fehlerhandling** – Fehler beim Insert werden verschluckt
   - Prüfe ob `.insert()` Fehler abfängt:
     ```js
     const { data, error } = await supabase.from('trachten_shared').insert([...]);
     if (error) console.error('Insert-Fehler:', error);
     ```

---

## 3. Weitere potenzielle Probleme (noch zu prüfen)

### 🟡 Auth-Session-Handling
- Wird `supabase.auth.onAuthStateChange()` korrekt verwendet?
- Werden geschützte Seiten bei fehlendem Login umgeleitet?
- Wird der Auth-Token bei Seitennavigation beibehalten (wichtig bei GitHub Pages als Multi-Page-App)?

### 🟡 Supabase Anon Key exponiert
- Bei einer rein clientseitigen App liegt der Supabase `anon`-Key im Quellcode offen
- Das ist bei Supabase so vorgesehen, ABER: RLS-Policies müssen dann korrekt konfiguriert sein
- Prüfe, dass kein `service_role`-Key im Frontend-Code steht!

### 🟡 CORS / Mixed Content
- GitHub Pages ist HTTPS – alle Supabase-Aufrufe müssen ebenfalls HTTPS verwenden
- Die Supabase-URL ist HTTPS, sollte also passen

### 🟡 Leaflet / Kartenintegration (Trachtkarte)
- Falls Leaflet.js oder eine ähnliche Bibliothek verwendet wird: Werden Marker korrekt aus `trachten_shared` geladen?
- Wird `SELECT` beim Laden der Seite ausgeführt?
- Werden Koordinaten korrekt als `float`/`numeric` gespeichert (nicht als String)?

### 🟡 Multi-Page-App auf GitHub Pages
- GitHub Pages unterstützt kein serverseitiges Routing
- Alle Links müssen relativ sein oder auf `.html`-Dateien zeigen
- Deep Links (z. B. Passwort-Reset-Callback) funktionieren nur, wenn die Redirect-URL auf eine existierende `.html`-Datei zeigt

### 🟡 Offline-Fähigkeit / PWA
- Falls die App als PWA geplant ist: Service Worker, Manifest etc. prüfen
- Falls nicht: ignorieren

---

## 4. Bekannte Supabase-Tabellen

| Tabelle | Zweck | Status |
|---|---|---|
| `trachten_shared` | Geteilte Trachtquellen für die Karte | ⚠️ Bleibt leer – siehe Problem 2 |
| `trachten` (vermutet) | Private Trachten pro Benutzer? | Unbekannt |
| Weitere Tabellen | Unbekannt – Code muss gelesen werden | Unbekannt |

---

## 5. Anweisungen für KI-Assistenten

Wenn du dieses Dokument in einem neuen Chat liest:

1. **Lies zuerst die relevanten HTML-Dateien** aus dem Repo (`index.html`, `trachtkarte.html`, etc.)
2. **Prüfe die offenen Probleme** oben und arbeite sie der Reihe nach ab
3. **Aktualisiere diese Datei** nach jeder Sitzung mit neuen Erkenntnissen
4. Das Repo ist möglicherweise **privat** – der Benutzer muss die Dateien ggf. hochladen oder die URLs einzeln einfügen

### Zum Abrufen dieser Datei in einem neuen Chat:
```
Bitte lies: https://raw.githubusercontent.com/durchdenwaldjulian-svg/imkerei-app/main/PROJECT_STATUS.md
```

---

## 6. Changelog

| Datum | Änderung |
|---|---|
| 2026-02-25 | Erstversion erstellt. Bekannte Probleme: Login-Redirect, trachten_shared leer. |

---

*Letzte Aktualisierung: 25. Februar 2026*

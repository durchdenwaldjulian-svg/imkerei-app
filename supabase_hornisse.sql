-- ============================================
-- HORNISSEN-MELDER: Supabase Setup
-- Dieses SQL im Supabase SQL Editor ausführen
-- ============================================

-- 1. Tabelle erstellen
CREATE TABLE IF NOT EXISTS hornissen_meldungen (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    melder_name TEXT NOT NULL,
    melder_ort TEXT,
    melder_telefon TEXT,
    typ TEXT NOT NULL CHECK (typ IN ('einzeln','mehrere','nest','angriff')),
    datum DATE NOT NULL DEFAULT CURRENT_DATE,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    verhalten TEXT,
    nest_groesse TEXT,
    nest_hoehe TEXT,
    notizen TEXT,
    foto_url TEXT,
    status TEXT NOT NULL DEFAULT 'unbestaetigt' CHECK (status IN ('unbestaetigt','bestaetigt','entfernt')),
    bestaetigt_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Row Level Security aktivieren
ALTER TABLE hornissen_meldungen ENABLE ROW LEVEL SECURITY;

-- 3. Policies: Jeder kann lesen (öffentliche Karte)
CREATE POLICY "hornissen_select_public" ON hornissen_meldungen
    FOR SELECT USING (true);

-- 4. Eingeloggte User können neue Meldungen erstellen
CREATE POLICY "hornissen_insert_auth" ON hornissen_meldungen
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Nur eigene Meldungen direkt bearbeiten
CREATE POLICY "hornissen_update_own" ON hornissen_meldungen
    FOR UPDATE USING (auth.uid() = user_id);

-- 6b. Sichere RPC-Funktion für Bestätigungen und Status-Updates
-- (verhindert dass fremde User beliebige Felder ändern können)
CREATE OR REPLACE FUNCTION update_hornissen_status(meldung_id UUID, new_count INTEGER, new_status TEXT)
RETURNS void AS $$
BEGIN
    IF new_status NOT IN ('unbestaetigt','bestaetigt','entfernt') THEN
        RAISE EXCEPTION 'Ungültiger Status';
    END IF;
    UPDATE hornissen_meldungen
    SET bestaetigt_count = new_count, status = new_status
    WHERE id = meldung_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Nur eigene Meldungen löschen
CREATE POLICY "hornissen_delete_own" ON hornissen_meldungen
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 7. Bestätigungs-Tabelle (Pro-Lösung: eigene Tabelle statt Zähler)
-- ============================================
CREATE TABLE IF NOT EXISTS hornissen_bestaetigungen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid()
  ,meldung_id UUID NOT NULL REFERENCES hornissen_meldungen(id) ON DELETE CASCADE
  ,user_id UUID NOT NULL REFERENCES auth.users(id)
  ,created_at TIMESTAMPTZ DEFAULT NOW()
  ,UNIQUE(meldung_id, user_id)
);

ALTER TABLE hornissen_bestaetigungen ENABLE ROW LEVEL SECURITY;

CREATE POLICY "best_select_public" ON hornissen_bestaetigungen FOR SELECT USING (true);

CREATE POLICY "best_insert_auth" ON hornissen_bestaetigungen FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "best_delete_own" ON hornissen_bestaetigungen FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- WICHTIG: Storage Bucket manuell erstellen!
-- Supabase Dashboard → Storage → New Bucket
-- Name: hornissen-fotos
-- Public: JA (Toggle aktivieren)
--
-- Dann unter Storage → Policies für hornissen-fotos:
-- SELECT: Allow public access (alle können Fotos sehen)
-- INSERT: Allow authenticated users (nur eingeloggte können hochladen)
-- ============================================

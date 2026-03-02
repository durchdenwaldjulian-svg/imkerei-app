-- ============================================
-- ADMINS-TABELLE für Imkermeister
-- Ausführen im Supabase SQL Editor
-- ============================================

-- 1. Tabelle erstellen
CREATE TABLE IF NOT EXISTS admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RLS aktivieren
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Nur Admins dürfen die Tabelle lesen
CREATE POLICY "Admins can read admins" ON admins
    FOR SELECT USING (auth.uid() IN (SELECT user_id FROM admins));

-- 4. Policy: Nur Admins dürfen andere Admins hinzufügen/entfernen
CREATE POLICY "Admins can insert admins" ON admins
    FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM admins));

CREATE POLICY "Admins can delete admins" ON admins
    FOR DELETE USING (auth.uid() IN (SELECT user_id FROM admins));

-- ============================================
-- 5. DICH ALS ERSTEN ADMIN EINTRAGEN
--
-- Gehe zu: Supabase Dashboard → Authentication → Users
-- Kopiere deine User-ID (die UUID neben deiner E-Mail)
-- Ersetze DEINE-USER-ID-HIER mit deiner echten UUID:
-- ============================================

-- WICHTIG: Vor dem Ausführen die UUID und E-Mail ersetzen!
-- INSERT INTO admins (user_id, email) VALUES ('DEINE-USER-ID-HIER', 'deine@email.de');

-- ============================================
-- ACHTUNG: Beim ersten Admin muss die RLS Policy 
-- kurz deaktiviert werden, weil noch niemand in 
-- der Tabelle steht. Daher so:
-- ============================================

-- Schritt A: RLS kurz aus
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;

-- Schritt B: Deinen User eintragen (UUID + E-Mail ersetzen!)
-- INSERT INTO admins (user_id, email) VALUES ('DEINE-USER-ID-HIER', 'deine@email.de');

-- Schritt C: RLS wieder an
-- ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ANLEITUNG:
-- 1. Alles bis Zeile 28 ausführen (Tabelle + Policies)
-- 2. Zeile 41 ausführen (RLS aus)
-- 3. Zeile 44 mit deiner UUID + E-Mail ausfüllen und ausführen
-- 4. Zeile 47 ausführen (RLS wieder an)
-- Fertig! Du bist Admin.
-- ============================================

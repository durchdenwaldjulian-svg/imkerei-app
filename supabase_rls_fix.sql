-- ============================================
-- RLS SECURITY FIX
-- Führe dieses SQL im Supabase SQL Editor aus!
-- ============================================

-- =============================================
-- 1. KRITISCH: admins - RLS aktivieren
-- =============================================
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 2. KRITISCH: Gefährliche "Anon can..." Policies löschen
-- Diese erlauben nicht-eingeloggten Usern Zugriff!
-- =============================================

-- aufgaben
DROP POLICY IF EXISTS "Anon can delete aufgaben" ON aufgaben;
DROP POLICY IF EXISTS "Anon can read aufgaben" ON aufgaben;

-- behandlungen
DROP POLICY IF EXISTS "Anon can delete behandlungen" ON behandlungen;
DROP POLICY IF EXISTS "Anon can read behandlungen" ON behandlungen;

-- kosten
DROP POLICY IF EXISTS "Anon can delete kosten" ON kosten;
DROP POLICY IF EXISTS "Anon can read kosten" ON kosten;

-- packliste
DROP POLICY IF EXISTS "Anon can delete packliste" ON packliste;
DROP POLICY IF EXISTS "Anon can read packliste" ON packliste;

-- standorte
DROP POLICY IF EXISTS "Anon can delete standorte" ON standorte;
DROP POLICY IF EXISTS "Anon can read standorte" ON standorte;

-- trachten
DROP POLICY IF EXISTS "Anon can delete trachten" ON trachten;
DROP POLICY IF EXISTS "Anon can read trachten" ON trachten;

-- voelker
DROP POLICY IF EXISTS "Anon can delete voelker" ON voelker;
DROP POLICY IF EXISTS "Anon can read voelker" ON voelker;

-- =============================================
-- 3. profiles: "Anyone can view" einschränken
-- Nur eigenes Profil + Admins dürfen alles lesen
-- =============================================
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
-- Admin-Policy bleibt bestehen (die prüft vermutlich schon auf Admin-Rolle)

-- =============================================
-- FERTIG - Zusammenfassung:
-- - admins: RLS jetzt aktiv
-- - 14 gefährliche Anon-Policies gelöscht
-- - profiles: Nur eigenes Profil sichtbar
-- =============================================

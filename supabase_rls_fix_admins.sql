-- ============================================
-- FIX: admins Tabelle - Lesen erlauben für Auth-Check
-- ============================================

-- Alte Policies löschen (waren für public, funktionieren jetzt nicht mehr richtig)
DROP POLICY IF EXISTS "Admins can read admins" ON admins;
DROP POLICY IF EXISTS "Admins can insert admins" ON admins;
DROP POLICY IF EXISTS "Admins can delete admins" ON admins;

-- Neue Policies:
-- 1. Jeder eingeloggte User darf die admins-Tabelle LESEN (um zu prüfen ob er Admin ist)
CREATE POLICY "Authenticated can read admins" ON admins
  FOR SELECT TO authenticated USING (true);

-- 2. Nur bestehende Admins dürfen neue Admins eintragen
CREATE POLICY "Admins can insert admins" ON admins
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() IN (SELECT user_id FROM admins)
  );

-- 3. Nur bestehende Admins dürfen Admins löschen
CREATE POLICY "Admins can delete admins" ON admins
  FOR DELETE TO authenticated USING (
    auth.uid() IN (SELECT user_id FROM admins)
  );

-- 4. Sonderfall: Wenn Tabelle LEER ist, darf sich der erste User eintragen (Erst-Setup)
CREATE POLICY "First admin setup" ON admins
  FOR INSERT TO authenticated WITH CHECK (
    (SELECT count(*) FROM admins) = 0
  );

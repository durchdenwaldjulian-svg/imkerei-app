-- ============================================
-- Zuchtplan: 3 neue Spalten für manuelles Abhaken
-- Ausführen im Supabase SQL Editor
-- ============================================

-- Sammelbrut erledigt (Timestamp in Millisekunden, NULL = noch offen)
ALTER TABLE zuchtplaene ADD COLUMN IF NOT EXISTS sammelbrut_done BIGINT DEFAULT NULL;

-- Umlarven erledigt
ALTER TABLE zuchtplaene ADD COLUMN IF NOT EXISTS umlarven_done BIGINT DEFAULT NULL;

-- Zusetzen erledigt
ALTER TABLE zuchtplaene ADD COLUMN IF NOT EXISTS zusetzen_done BIGINT DEFAULT NULL;

-- Fertig! Bestehende Zuchtpläne bekommen automatisch NULL (= noch nicht abgehakt)

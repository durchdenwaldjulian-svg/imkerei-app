-- ============================================
-- HONIG-REZEPTE: Supabase Tabellen
-- Ausführen im Supabase SQL Editor
-- ============================================

-- Rezepte-Tabelle
CREATE TABLE IF NOT EXISTS rezepte (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    kategorie TEXT NOT NULL CHECK (kategorie IN ('essen', 'kosmetik', 'hausmittel')),
    titel TEXT NOT NULL,
    beschreibung TEXT,
    zutaten JSONB DEFAULT '[]'::jsonb,
    schritte JSONB DEFAULT '[]'::jsonb,
    zeitaufwand INTEGER,
    schwierigkeit TEXT DEFAULT 'leicht' CHECK (schwierigkeit IN ('leicht', 'mittel', 'fortgeschritten')),
    is_preset BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Favoriten-Tabelle
CREATE TABLE IF NOT EXISTS rezept_favoriten (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rezept_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, rezept_id)
);

-- RLS aktivieren
ALTER TABLE rezepte ENABLE ROW LEVEL SECURITY;
ALTER TABLE rezept_favoriten ENABLE ROW LEVEL SECURITY;

-- Rezepte: Alle können lesen, eigene können bearbeiten
CREATE POLICY "Rezepte lesen" ON rezepte FOR SELECT USING (true);
CREATE POLICY "Eigene Rezepte erstellen" ON rezepte FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Eigene Rezepte bearbeiten" ON rezepte FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Eigene Rezepte löschen" ON rezepte FOR DELETE USING (auth.uid() = user_id);

-- Favoriten: Nur eigene
CREATE POLICY "Eigene Favoriten lesen" ON rezept_favoriten FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Eigene Favoriten erstellen" ON rezept_favoriten FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Eigene Favoriten löschen" ON rezept_favoriten FOR DELETE USING (auth.uid() = user_id);

-- Indizes
CREATE INDEX IF NOT EXISTS idx_rezepte_user ON rezepte(user_id);
CREATE INDEX IF NOT EXISTS idx_rezepte_kategorie ON rezepte(kategorie);
CREATE INDEX IF NOT EXISTS idx_rezept_favoriten_user ON rezept_favoriten(user_id);

-- ============================================
-- ACKERSCHLAGKARTEI – Supabase Migration
-- Tabellen: ask_schlaege, ask_kulturen, ask_massnahmen
-- ============================================

-- === SCHLÄGE ===
CREATE TABLE IF NOT EXISTS ask_schlaege (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  groesse NUMERIC(10,2) NOT NULL DEFAULT 0,
  flurstueck TEXT DEFAULT '',
  bodenart TEXT DEFAULT '',
  bodenpunkte INTEGER,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  notiz TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- === KULTUREN ===
CREATE TABLE IF NOT EXISTS ask_kulturen (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  schlag_id UUID REFERENCES ask_schlaege(id) ON DELETE CASCADE NOT NULL,
  jahr INTEGER NOT NULL,
  kultur TEXT NOT NULL,
  sorte TEXT DEFAULT '',
  aussaat DATE,
  ernte DATE,
  ertrag NUMERIC(10,2),
  notiz TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- === MASSNAHMEN ===
CREATE TABLE IF NOT EXISTS ask_massnahmen (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  schlag_id UUID REFERENCES ask_schlaege(id) ON DELETE CASCADE NOT NULL,
  typ TEXT NOT NULL,
  datum DATE NOT NULL,
  mittel TEXT DEFAULT '',
  menge NUMERIC(10,2),
  einheit TEXT DEFAULT '',
  beschreibung TEXT DEFAULT '',
  kosten NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- === ROW LEVEL SECURITY ===
ALTER TABLE ask_schlaege ENABLE ROW LEVEL SECURITY;
ALTER TABLE ask_kulturen ENABLE ROW LEVEL SECURITY;
ALTER TABLE ask_massnahmen ENABLE ROW LEVEL SECURITY;

-- User sieht nur eigene Daten
CREATE POLICY "ask_schlaege_user" ON ask_schlaege
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ask_kulturen_user" ON ask_kulturen
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ask_massnahmen_user" ON ask_massnahmen
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- === INDEXES ===
CREATE INDEX IF NOT EXISTS idx_ask_schlaege_user ON ask_schlaege(user_id);
CREATE INDEX IF NOT EXISTS idx_ask_kulturen_user ON ask_kulturen(user_id);
CREATE INDEX IF NOT EXISTS idx_ask_kulturen_schlag ON ask_kulturen(schlag_id);
CREATE INDEX IF NOT EXISTS idx_ask_massnahmen_user ON ask_massnahmen(user_id);
CREATE INDEX IF NOT EXISTS idx_ask_massnahmen_schlag ON ask_massnahmen(schlag_id);
CREATE INDEX IF NOT EXISTS idx_ask_massnahmen_datum ON ask_massnahmen(datum);

-- === UPDATED_AT TRIGGER ===
CREATE OR REPLACE FUNCTION ask_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ask_schlaege_updated BEFORE UPDATE ON ask_schlaege
  FOR EACH ROW EXECUTE FUNCTION ask_update_timestamp();

CREATE TRIGGER ask_kulturen_updated BEFORE UPDATE ON ask_kulturen
  FOR EACH ROW EXECUTE FUNCTION ask_update_timestamp();

CREATE TRIGGER ask_massnahmen_updated BEFORE UPDATE ON ask_massnahmen
  FOR EACH ROW EXECUTE FUNCTION ask_update_timestamp();

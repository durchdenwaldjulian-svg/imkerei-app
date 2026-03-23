-- ============================================
-- BIENEN-ZÄHLER + VÖLKER ERWEITERUNGEN
-- Ausführen in Supabase SQL Editor
-- ============================================

-- 1. Neue Tabelle: Bienen-Zählungen (mit Volk-Zuordnung)
CREATE TABLE IF NOT EXISTS bienen_zaehlungen (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    volk_id UUID REFERENCES voelker(id) ON DELETE SET NULL,
    datum TIMESTAMPTZ DEFAULT NOW(),
    total INTEGER DEFAULT 0,
    bienen INTEGER DEFAULT 0,
    drohnen INTEGER DEFAULT 0,
    koeniginnen INTEGER DEFAULT 0,
    pollenbienen INTEGER DEFAULT 0,
    konfidenz INTEGER DEFAULT 0,
    foto_url TEXT,
    notizen TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS aktivieren
ALTER TABLE bienen_zaehlungen ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Eigene Zählungen lesen" ON bienen_zaehlungen
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Eigene Zählungen erstellen" ON bienen_zaehlungen
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Eigene Zählungen löschen" ON bienen_zaehlungen
    FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Eigene Zählungen aktualisieren" ON bienen_zaehlungen
    FOR UPDATE USING (auth.uid() = user_id);

-- Indizes
CREATE INDEX IF NOT EXISTS idx_zaehlung_user ON bienen_zaehlungen(user_id);
CREATE INDEX IF NOT EXISTS idx_zaehlung_volk ON bienen_zaehlungen(volk_id);
CREATE INDEX IF NOT EXISTS idx_zaehlung_datum ON bienen_zaehlungen(datum DESC);

-- 2. Bienenrasse als Spalte zu voelker hinzufügen
ALTER TABLE voelker ADD COLUMN IF NOT EXISTS rasse TEXT DEFAULT '';

-- 3. Storage Bucket für Völker-Fotos
INSERT INTO storage.buckets (id, name, public)
VALUES ('voelker-fotos', 'voelker-fotos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy: Eigene Fotos hochladen
CREATE POLICY "Eigene Fotos hochladen" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'voelker-fotos'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Storage Policy: Eigene Fotos lesen (öffentlich)
CREATE POLICY "Fotos lesen" ON storage.objects
    FOR SELECT USING (bucket_id = 'voelker-fotos');

-- Storage Policy: Eigene Fotos löschen
CREATE POLICY "Eigene Fotos löschen" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'voelker-fotos'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- ============================================================
-- Migration 005: Pillar settings — editable metadata per pillar
-- ============================================================

CREATE TABLE IF NOT EXISTS public.pillar_settings (
  slug        TEXT PRIMARY KEY, -- matches the course_pillar enum value
  description TEXT NOT NULL DEFAULT '',
  subtitle    TEXT NOT NULL DEFAULT '',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed default descriptions
INSERT INTO public.pillar_settings (slug, description, subtitle) VALUES
  ('Digital Literacy',
   'Core computer and technology skills — Microsoft Office suite, digital tools, and workplace software that every modern professional needs.',
   'Microsoft Office & Workplace Tech'),
  ('Career Readiness',
   'Professional development, workplace communication, CV writing, interview preparation, and career planning to launch a successful career.',
   'Professional Development'),
  ('Life Skills',
   'Practical everyday skills covering personal finance, time management, communication, and social effectiveness for independent living.',
   'Personal Effectiveness'),
  ('Cultural Identity',
   'Celebrating and understanding cultural heritage, identity, values, and the role of culture in shaping who we are and how we engage with the world.',
   'Heritage & Values')
ON CONFLICT (slug) DO NOTHING;

-- RLS
ALTER TABLE public.pillar_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read
DROP POLICY IF EXISTS "Pillar settings are publicly readable" ON public.pillar_settings;
CREATE POLICY "Pillar settings are publicly readable"
  ON public.pillar_settings FOR SELECT
  USING (true);

-- Only admins can update
DROP POLICY IF EXISTS "Admins can update pillar settings" ON public.pillar_settings;
CREATE POLICY "Admins can update pillar settings"
  ON public.pillar_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles AS p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles AS p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

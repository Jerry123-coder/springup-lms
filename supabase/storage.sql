-- ============================================================
-- Supabase Storage: Create the submissions bucket
-- Run this in the Supabase SQL Editor
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('submissions', 'submissions', true)
ON CONFLICT (id) DO NOTHING;

-- Students can upload to their own folder
CREATE POLICY "Students can upload submissions"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'submissions'
    AND auth.uid() IS NOT NULL
  );

-- Anyone authenticated can read submission files
CREATE POLICY "Authenticated users can read submissions"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'submissions'
    AND auth.uid() IS NOT NULL
  );

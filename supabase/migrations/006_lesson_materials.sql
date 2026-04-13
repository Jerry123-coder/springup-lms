-- Lesson materials: links, files, and extra videos per lesson (admin-managed)

CREATE TABLE IF NOT EXISTS public.lesson_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'link' CHECK (kind IN ('link', 'file', 'video')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lesson_materials_lesson_order
  ON public.lesson_materials(lesson_id, order_index);

ALTER TABLE public.lesson_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view lesson_materials"
  ON public.lesson_materials FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins and instructors can insert lesson_materials"
  ON public.lesson_materials FOR INSERT
  WITH CHECK (public.get_user_role() IN ('admin', 'instructor'));

CREATE POLICY "Admins and instructors can update lesson_materials"
  ON public.lesson_materials FOR UPDATE
  USING (public.get_user_role() IN ('admin', 'instructor'));

CREATE POLICY "Admins and instructors can delete lesson_materials"
  ON public.lesson_materials FOR DELETE
  USING (public.get_user_role() IN ('admin', 'instructor'));

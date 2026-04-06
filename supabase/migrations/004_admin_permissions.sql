-- ============================================================
-- Migration 004: Admin permissions — instructor course editing
-- ============================================================

-- Add per-instructor course-editing privilege flag
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS can_edit_courses BOOLEAN NOT NULL DEFAULT false;

-- ── RLS: Admin full access on profiles ───────────────────────────
-- Admins must be able to UPDATE all profiles (change roles, permissions)
DROP POLICY IF EXISTS "Admins can view all profiles"   ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

CREATE POLICY "Admins can manage all profiles"
  ON public.profiles
  FOR ALL
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

-- ── RLS: Admin full access on cohorts ────────────────────────────
DROP POLICY IF EXISTS "Admins can manage all cohorts" ON public.cohorts;

CREATE POLICY "Admins can manage all cohorts"
  ON public.cohorts
  FOR ALL
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

-- ── RLS: Admin full access on cohort_students ────────────────────
DROP POLICY IF EXISTS "Admins can manage all cohort_students" ON public.cohort_students;

CREATE POLICY "Admins can manage all cohort_students"
  ON public.cohort_students
  FOR ALL
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

-- ── RLS: Admin full access on instructor_student_assignments ─────
DROP POLICY IF EXISTS "Admins can manage all assignments" ON public.instructor_student_assignments;

CREATE POLICY "Admins can manage all assignments"
  ON public.instructor_student_assignments
  FOR ALL
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

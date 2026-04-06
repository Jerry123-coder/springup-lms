-- ============================================================
-- Cohorts (instructor-managed classes) + cohort students
-- Run in Supabase SQL Editor after 002_lesson_progress_instructor_assignments.sql
-- ============================================================

-- ── Tables ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.cohorts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  description  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cohorts_instructor
  ON public.cohorts(instructor_id);

CREATE TABLE IF NOT EXISTS public.cohort_students (
  cohort_id  UUID NOT NULL REFERENCES public.cohorts(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (cohort_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_cohort_students_cohort
  ON public.cohort_students(cohort_id);

CREATE INDEX IF NOT EXISTS idx_cohort_students_student
  ON public.cohort_students(student_id);

-- ── RLS ────────────────────────────────────────────────────────

ALTER TABLE public.cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohort_students ENABLE ROW LEVEL SECURITY;

-- Cohorts: instructors manage their own; admins see all
DROP POLICY IF EXISTS "Instructors manage own cohorts" ON public.cohorts;
CREATE POLICY "Instructors manage own cohorts"
  ON public.cohorts FOR ALL
  USING (instructor_id = auth.uid())
  WITH CHECK (instructor_id = auth.uid());

DROP POLICY IF EXISTS "Admins manage all cohorts" ON public.cohorts;
CREATE POLICY "Admins manage all cohorts"
  ON public.cohorts FOR ALL
  USING (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

DROP POLICY IF EXISTS "Students view cohorts they belong to" ON public.cohorts;
CREATE POLICY "Students view cohorts they belong to"
  ON public.cohorts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cohort_students cs
      WHERE cs.cohort_id = id AND cs.student_id = auth.uid()
    )
  );

-- Cohort students: instructors manage membership in own cohorts
DROP POLICY IF EXISTS "Instructors manage cohort membership" ON public.cohort_students;
CREATE POLICY "Instructors manage cohort membership"
  ON public.cohort_students FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.cohorts c
      WHERE c.id = cohort_id AND c.instructor_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cohorts c
      WHERE c.id = cohort_id AND c.instructor_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins manage all cohort students" ON public.cohort_students;
CREATE POLICY "Admins manage all cohort students"
  ON public.cohort_students FOR ALL
  USING (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

DROP POLICY IF EXISTS "Students view own cohort membership" ON public.cohort_students;
CREATE POLICY "Students view own cohort membership"
  ON public.cohort_students FOR SELECT
  USING (student_id = auth.uid());

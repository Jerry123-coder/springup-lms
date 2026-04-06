-- ============================================================
-- Lesson video progress + instructor–student assignments
-- Run in Supabase SQL Editor after schema.sql (additive migration)
-- ============================================================

-- ── Tables ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.lesson_progress (
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id  UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  video_watched_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (student_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson
  ON public.lesson_progress(lesson_id);

CREATE TABLE IF NOT EXISTS public.instructor_student_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (instructor_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_instructor_assignments_instructor
  ON public.instructor_student_assignments(instructor_id);

CREATE INDEX IF NOT EXISTS idx_instructor_assignments_student
  ON public.instructor_student_assignments(student_id);

-- ── RLS ────────────────────────────────────────────────────────────

ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructor_student_assignments ENABLE ROW LEVEL SECURITY;

-- lesson_progress: students manage own rows
DROP POLICY IF EXISTS "Students insert own lesson progress" ON public.lesson_progress;
CREATE POLICY "Students insert own lesson progress"
  ON public.lesson_progress FOR INSERT
  WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Students update own lesson progress" ON public.lesson_progress;
CREATE POLICY "Students update own lesson progress"
  ON public.lesson_progress FOR UPDATE
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Students select own lesson progress" ON public.lesson_progress;
CREATE POLICY "Students select own lesson progress"
  ON public.lesson_progress FOR SELECT
  USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Admins select all lesson progress" ON public.lesson_progress;
CREATE POLICY "Admins select all lesson progress"
  ON public.lesson_progress FOR SELECT
  USING (public.get_user_role() = 'admin');

DROP POLICY IF EXISTS "Instructors select lesson progress" ON public.lesson_progress;
CREATE POLICY "Instructors select lesson progress"
  ON public.lesson_progress FOR SELECT
  USING (
    public.get_user_role() = 'instructor'
    AND (
      NOT EXISTS (
        SELECT 1 FROM public.instructor_student_assignments isa
        WHERE isa.instructor_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM public.instructor_student_assignments isa
        WHERE isa.instructor_id = auth.uid()
          AND isa.student_id = lesson_progress.student_id
      )
    )
  );

-- instructor_student_assignments: admins manage; instructors read own
DROP POLICY IF EXISTS "Admins manage instructor assignments" ON public.instructor_student_assignments;
CREATE POLICY "Admins manage instructor assignments"
  ON public.instructor_student_assignments FOR ALL
  USING (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

DROP POLICY IF EXISTS "Instructors read own assignments" ON public.instructor_student_assignments;
CREATE POLICY "Instructors read own assignments"
  ON public.instructor_student_assignments FOR SELECT
  USING (instructor_id = auth.uid());

DROP POLICY IF EXISTS "Students read own assignment rows" ON public.instructor_student_assignments;
CREATE POLICY "Students read own assignment rows"
  ON public.instructor_student_assignments FOR SELECT
  USING (student_id = auth.uid());

-- Profiles: instructors need student names for grading
DROP POLICY IF EXISTS "Instructors can view student profiles" ON public.profiles;
CREATE POLICY "Instructors can view student profiles"
  ON public.profiles FOR SELECT
  USING (
    public.get_user_role() = 'instructor'
    AND role = 'student'::public.user_role
  );

-- Submissions: narrow instructor visibility when assignments exist
DROP POLICY IF EXISTS "Instructors can view all submissions" ON public.submissions;
CREATE POLICY "Instructors view submissions by assignment or all if unscoped"
  ON public.submissions FOR SELECT
  USING (
    public.get_user_role() = 'admin'
    OR student_id = auth.uid()
    OR (
      public.get_user_role() = 'instructor'
      AND (
        NOT EXISTS (
          SELECT 1 FROM public.instructor_student_assignments isa
          WHERE isa.instructor_id = auth.uid()
        )
        OR EXISTS (
          SELECT 1 FROM public.instructor_student_assignments isa
          WHERE isa.instructor_id = auth.uid()
            AND isa.student_id = submissions.student_id
        )
      )
    )
  );

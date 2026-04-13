-- ============================================================
-- Fix instructor access for cohort-based teaching:
-- 1) Submissions SELECT/UPDATE — include cohort members (not only
--    instructor_student_assignments). Keeps legacy "see all" only
--    when the instructor has no assignments AND teaches no cohort.
-- 2) lesson_progress SELECT — same scope as submissions.
-- 3) certificates SELECT — instructors can see certs for their students.
-- 4) RPC instructor_visible_student_ids() — reliable list for UI.
-- Requires cohort_instructors (migration 008).
-- ============================================================

-- ── Helper: instructor teaches this student via assignment or cohort ──
CREATE OR REPLACE FUNCTION public.instructor_teaches_student(
  p_instructor_id uuid,
  p_student_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    EXISTS (
      SELECT 1
      FROM public.instructor_student_assignments AS isa
      WHERE isa.instructor_id = p_instructor_id
        AND isa.student_id = p_student_id
    )
    OR EXISTS (
      SELECT 1
      FROM public.cohort_students AS cs
      INNER JOIN public.cohorts AS c ON c.id = cs.cohort_id
      WHERE cs.student_id = p_student_id
        AND (
          c.instructor_id = p_instructor_id
          OR EXISTS (
            SELECT 1 FROM public.cohort_instructors AS ci
            WHERE ci.cohort_id = c.id AND ci.instructor_id = p_instructor_id
          )
        )
    );
$$;

-- ── RPC: all student profile IDs this instructor may manage ──
CREATE OR REPLACE FUNCTION public.instructor_visible_student_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT q.sid
  FROM (
    SELECT isa.student_id AS sid
    FROM public.instructor_student_assignments AS isa
    WHERE isa.instructor_id = auth.uid()
    UNION
    SELECT cs.student_id AS sid
    FROM public.cohort_students AS cs
    INNER JOIN public.cohorts AS c ON c.id = cs.cohort_id
    WHERE c.instructor_id = auth.uid()
    UNION
    SELECT cs.student_id AS sid
    FROM public.cohort_students AS cs
    INNER JOIN public.cohort_instructors AS ci ON ci.cohort_id = cs.cohort_id
    WHERE ci.instructor_id = auth.uid()
  ) AS q
  INNER JOIN public.profiles AS me ON me.id = auth.uid() AND me.role = 'instructor';
$$;

REVOKE ALL ON FUNCTION public.instructor_teaches_student(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.instructor_visible_student_ids() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.instructor_visible_student_ids() TO authenticated;

-- ── Submissions: replace instructor SELECT ────────────────────
DROP POLICY IF EXISTS "Instructors view submissions by assignment or all if unscoped" ON public.submissions;
CREATE POLICY "Instructors view submissions by assignment cohort or legacy unscoped"
  ON public.submissions FOR SELECT
  USING (
    public.get_user_role() = 'admin'
    OR student_id = auth.uid()
    OR (
      public.get_user_role() = 'instructor'
      AND (
        public.instructor_teaches_student(auth.uid(), submissions.student_id)
        OR (
          NOT EXISTS (
            SELECT 1 FROM public.instructor_student_assignments AS isa
            WHERE isa.instructor_id = auth.uid()
          )
          AND NOT EXISTS (
            SELECT 1 FROM public.cohorts AS c WHERE c.instructor_id = auth.uid()
          )
          AND NOT EXISTS (
            SELECT 1 FROM public.cohort_instructors AS ci
            WHERE ci.instructor_id = auth.uid()
          )
        )
      )
    )
  );

DROP POLICY IF EXISTS "Instructors can update submissions" ON public.submissions;
CREATE POLICY "Instructors update submissions they can view"
  ON public.submissions FOR UPDATE
  USING (
    public.get_user_role() = 'admin'
    OR (
      public.get_user_role() = 'instructor'
      AND (
        public.instructor_teaches_student(auth.uid(), submissions.student_id)
        OR (
          NOT EXISTS (
            SELECT 1 FROM public.instructor_student_assignments AS isa
            WHERE isa.instructor_id = auth.uid()
          )
          AND NOT EXISTS (
            SELECT 1 FROM public.cohorts AS c WHERE c.instructor_id = auth.uid()
          )
          AND NOT EXISTS (
            SELECT 1 FROM public.cohort_instructors AS ci
            WHERE ci.instructor_id = auth.uid()
          )
        )
      )
    )
  )
  WITH CHECK (
    public.get_user_role() = 'admin'
    OR (
      public.get_user_role() = 'instructor'
      AND (
        public.instructor_teaches_student(auth.uid(), submissions.student_id)
        OR (
          NOT EXISTS (
            SELECT 1 FROM public.instructor_student_assignments AS isa
            WHERE isa.instructor_id = auth.uid()
          )
          AND NOT EXISTS (
            SELECT 1 FROM public.cohorts AS c WHERE c.instructor_id = auth.uid()
          )
          AND NOT EXISTS (
            SELECT 1 FROM public.cohort_instructors AS ci
            WHERE ci.instructor_id = auth.uid()
          )
        )
      )
    )
  );

-- ── lesson_progress: replace instructor SELECT ────────────────
DROP POLICY IF EXISTS "Instructors select lesson progress" ON public.lesson_progress;
CREATE POLICY "Instructors select lesson progress for their students"
  ON public.lesson_progress FOR SELECT
  USING (
    public.get_user_role() = 'instructor'
    AND (
      public.instructor_teaches_student(auth.uid(), lesson_progress.student_id)
      OR (
        NOT EXISTS (
          SELECT 1 FROM public.instructor_student_assignments AS isa
          WHERE isa.instructor_id = auth.uid()
        )
        AND NOT EXISTS (
          SELECT 1 FROM public.cohorts AS c WHERE c.instructor_id = auth.uid()
        )
        AND NOT EXISTS (
          SELECT 1 FROM public.cohort_instructors AS ci
          WHERE ci.instructor_id = auth.uid()
        )
      )
    )
  );

-- ── certificates: instructors see certs for students they teach ─
DROP POLICY IF EXISTS "Instructors view certificates of their students" ON public.certificates;
CREATE POLICY "Instructors view certificates of their students"
  ON public.certificates FOR SELECT
  USING (
    public.get_user_role() = 'instructor'
    AND public.instructor_teaches_student(auth.uid(), certificates.student_id)
  );

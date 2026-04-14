-- ============================================================
-- Fix infinite recursion on cohort_instructors RLS.
-- Policies that SELECT from cohort_instructors inside a policy ON
-- cohort_instructors re-enter RLS → recursion. Same pattern under
-- profiles/cohorts/cohort_students can trigger it when any query
-- touches cohort_instructors.
-- Use SECURITY DEFINER helpers (owner bypasses RLS inside the fn).
-- ============================================================

-- True if auth.uid() is primary instructor OR co-instructor for this cohort.
CREATE OR REPLACE FUNCTION public.auth_user_is_cohort_instructor(p_cohort_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.cohorts c
    WHERE c.id = p_cohort_id AND c.instructor_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.cohort_instructors ci
    WHERE ci.cohort_id = p_cohort_id AND ci.instructor_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.auth_user_is_cohort_instructor(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_user_is_cohort_instructor(uuid) TO authenticated;

-- True if auth.uid() is an instructor who teaches p_student_id via cohort (primary or co).
CREATE OR REPLACE FUNCTION public.instructor_can_see_student_profile_via_cohort(p_student_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.cohort_students AS cs
    INNER JOIN public.cohorts AS c ON c.id = cs.cohort_id
    WHERE cs.student_id = p_student_id
      AND (
        c.instructor_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.cohort_instructors AS ci
          WHERE ci.cohort_id = c.id AND ci.instructor_id = auth.uid()
        )
      )
  );
$$;

REVOKE ALL ON FUNCTION public.instructor_can_see_student_profile_via_cohort(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.instructor_can_see_student_profile_via_cohort(uuid) TO authenticated;

-- ── cohort_instructors: replace self-referential SELECT policy ──
DROP POLICY IF EXISTS "Instructors view cohort_instructors for their cohorts" ON public.cohort_instructors;
CREATE POLICY "Instructors view cohort_instructors for their cohorts"
  ON public.cohort_instructors FOR SELECT
  USING (public.auth_user_is_cohort_instructor(cohort_id));

-- ── cohorts: remove nested cohort_instructors subquery ──
DROP POLICY IF EXISTS "Instructors manage own cohorts" ON public.cohorts;
CREATE POLICY "Instructors manage own cohorts"
  ON public.cohorts FOR ALL
  USING (
    instructor_id = auth.uid()
    OR public.auth_user_is_cohort_instructor(id)
  )
  WITH CHECK (
    instructor_id = auth.uid()
    OR public.auth_user_is_cohort_instructor(id)
  );

-- ── cohort_students: remove nested cohort_instructors subquery ──
DROP POLICY IF EXISTS "Instructors manage cohort membership" ON public.cohort_students;
CREATE POLICY "Instructors manage cohort membership"
  ON public.cohort_students FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.cohorts AS c
      WHERE c.id = cohort_students.cohort_id
        AND public.auth_user_is_cohort_instructor(c.id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cohorts AS c
      WHERE c.id = cohort_students.cohort_id
        AND public.auth_user_is_cohort_instructor(c.id)
    )
  );

-- ── profiles: cohort branch — avoid EXISTS on cohort_instructors in policy ──
DROP POLICY IF EXISTS "Instructors view profiles of cohort members" ON public.profiles;
CREATE POLICY "Instructors view profiles of cohort members"
  ON public.profiles FOR SELECT
  USING (
    public.get_user_role() = 'instructor'
    AND (
      EXISTS (
        SELECT 1
        FROM public.instructor_student_assignments AS isa
        WHERE isa.student_id = profiles.id
          AND isa.instructor_id = auth.uid()
      )
      OR public.instructor_can_see_student_profile_via_cohort(profiles.id)
    )
  );

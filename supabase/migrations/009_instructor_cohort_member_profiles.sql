-- ============================================================
-- Instructors can read profiles of users in their cohorts
-- (any role). Complements 002 "Instructors can view student
-- profiles" which only allows role = student.
-- Requires 008 (cohort_instructors) to exist for co-instructor OR.
-- ============================================================

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
      OR EXISTS (
        SELECT 1
        FROM public.cohort_students AS cs
        INNER JOIN public.cohorts AS c ON c.id = cs.cohort_id
        WHERE cs.student_id = profiles.id
          AND (
            c.instructor_id = auth.uid()
            OR EXISTS (
              SELECT 1 FROM public.cohort_instructors AS ci
              WHERE ci.cohort_id = c.id AND ci.instructor_id = auth.uid()
            )
          )
      )
    )
  );

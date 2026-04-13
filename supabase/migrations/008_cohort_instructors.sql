-- ============================================================
-- Multiple instructors per cohort (junction table).
-- cohorts.instructor_id remains the "primary" instructor for
-- backwards compatibility and simpler policies.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.cohort_instructors (
  cohort_id     UUID NOT NULL REFERENCES public.cohorts(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (cohort_id, instructor_id)
);

CREATE INDEX IF NOT EXISTS idx_cohort_instructors_instructor
  ON public.cohort_instructors(instructor_id);

-- Backfill from existing primary instructor column
INSERT INTO public.cohort_instructors (cohort_id, instructor_id)
SELECT id, instructor_id FROM public.cohorts
ON CONFLICT DO NOTHING;

ALTER TABLE public.cohort_instructors ENABLE ROW LEVEL SECURITY;

-- Admins: full access
DROP POLICY IF EXISTS "Admins manage cohort_instructors" ON public.cohort_instructors;
CREATE POLICY "Admins manage cohort_instructors"
  ON public.cohort_instructors FOR ALL
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

-- Any instructor assigned to the cohort (primary or co-) can see the full instructor list
DROP POLICY IF EXISTS "Instructors view cohort_instructors for their cohorts" ON public.cohort_instructors;
CREATE POLICY "Instructors view cohort_instructors for their cohorts"
  ON public.cohort_instructors FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cohort_instructors AS ci
      WHERE ci.cohort_id = cohort_instructors.cohort_id
        AND ci.instructor_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.cohorts AS c
      WHERE c.id = cohort_instructors.cohort_id
        AND c.instructor_id = auth.uid()
    )
  );

-- Primary instructor can add/remove co-instructors (rows for their cohort)
DROP POLICY IF EXISTS "Primary instructor manages cohort_instructors" ON public.cohort_instructors;
CREATE POLICY "Primary instructor manages cohort_instructors"
  ON public.cohort_instructors FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.cohorts AS c
      WHERE c.id = cohort_instructors.cohort_id
        AND c.instructor_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cohorts AS c
      WHERE c.id = cohort_instructors.cohort_id
        AND c.instructor_id = auth.uid()
    )
  );

-- Co-instructors may leave the cohort (remove only their own row)
DROP POLICY IF EXISTS "Instructors leave cohort as co-instructor" ON public.cohort_instructors;
CREATE POLICY "Instructors leave cohort as co-instructor"
  ON public.cohort_instructors FOR DELETE
  USING (instructor_id = auth.uid());

-- Cohorts: primary OR any listed co-instructor can manage the class row
DROP POLICY IF EXISTS "Instructors manage own cohorts" ON public.cohorts;
CREATE POLICY "Instructors manage own cohorts"
  ON public.cohorts FOR ALL
  USING (
    instructor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.cohort_instructors AS ci
      WHERE ci.cohort_id = cohorts.id AND ci.instructor_id = auth.uid()
    )
  )
  WITH CHECK (
    instructor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.cohort_instructors AS ci
      WHERE ci.cohort_id = cohorts.id AND ci.instructor_id = auth.uid()
    )
  );

-- Cohort students: primary or any co-instructor
DROP POLICY IF EXISTS "Instructors manage cohort membership" ON public.cohort_students;
CREATE POLICY "Instructors manage cohort membership"
  ON public.cohort_students FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.cohorts AS c
      WHERE c.id = cohort_students.cohort_id
        AND (
          c.instructor_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.cohort_instructors AS ci
            WHERE ci.cohort_id = c.id AND ci.instructor_id = auth.uid()
          )
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cohorts AS c
      WHERE c.id = cohort_students.cohort_id
        AND (
          c.instructor_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.cohort_instructors AS ci
            WHERE ci.cohort_id = c.id AND ci.instructor_id = auth.uid()
          )
        )
    )
  );

-- ============================================================
-- Ensure every authenticated user can UPDATE their own profiles row.
-- Instructors and students rely on this for the profile page; admins
-- also have "Admins can manage all profiles" from migration 004.
-- ============================================================

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

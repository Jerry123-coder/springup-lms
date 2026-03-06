-- ============================================================
-- DIAGNOSTIC: Check what's in auth.users vs profiles
-- ============================================================

-- 1. How many users exist in auth?
SELECT count(*) AS auth_user_count FROM auth.users;

-- 2. How many profiles exist?
SELECT count(*) AS profile_count FROM public.profiles;

-- 3. Does the trigger exist?
SELECT tgname, tgrelid::regclass
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- ============================================================
-- FIX: Recreate the trigger function (more robust version)
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    'student'::public.user_role
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- FIX: Backfill profiles for any auth users that were created
-- before the trigger was working
-- ============================================================

INSERT INTO public.profiles (id, email, full_name, role)
SELECT
  u.id,
  COALESCE(u.email, ''),
  COALESCE(u.raw_user_meta_data ->> 'full_name', ''),
  'student'::public.user_role
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- ============================================================
-- VERIFY: Check the result
-- ============================================================

SELECT id, email, full_name, role, created_at FROM public.profiles;

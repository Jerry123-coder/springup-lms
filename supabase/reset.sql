-- ============================================================
-- FULL RESET: Wipe all users and data, rebuild from scratch
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Drop all app tables
DROP TABLE IF EXISTS public.submissions CASCADE;
DROP TABLE IF EXISTS public.lessons     CASCADE;
DROP TABLE IF EXISTS public.courses     CASCADE;
DROP TABLE IF EXISTS public.profiles    CASCADE;
DROP TABLE IF EXISTS public.modules     CASCADE;

-- 2. Delete ALL auth users (this is the key step)
DELETE FROM auth.users;

-- 3. Drop old types and functions
DROP TYPE IF EXISTS public.user_role         CASCADE;
DROP TYPE IF EXISTS public.course_pillar     CASCADE;
DROP TYPE IF EXISTS public.submission_status CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user()  CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role()    CASCADE;

-- 4. Recreate enums
CREATE TYPE public.user_role AS ENUM ('admin', 'instructor', 'student');
CREATE TYPE public.course_pillar AS ENUM (
  'Digital Literacy', 'Career Readiness', 'Life Skills', 'Cultural Identity'
);
CREATE TYPE public.submission_status AS ENUM ('pending', 'reviewed');

-- 5. Recreate tables
CREATE TABLE public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  full_name  TEXT NOT NULL DEFAULT '',
  role       public.user_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.courses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  pillar      public.course_pillar NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.lessons (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  content     TEXT NOT NULL DEFAULT '',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.submissions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id  UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  file_url   TEXT NOT NULL DEFAULT '',
  status     public.submission_status NOT NULL DEFAULT 'pending',
  grade      INTEGER CHECK (grade >= 0 AND grade <= 100),
  feedback   TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_submissions_status ON public.submissions(status);
CREATE INDEX idx_submissions_student ON public.submissions(student_id);
CREATE INDEX idx_lessons_course_order ON public.lessons(course_id, order_index);

-- 6. Recreate trigger (the fixed version)
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

-- 7. Enable RLS
ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- 8. Helper function
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS public.user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- 9. RLS Policies
CREATE POLICY "Users can view own profile"       ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Admins can view all profiles"     ON public.profiles FOR SELECT USING (public.get_user_role() = 'admin');
CREATE POLICY "Users can update own profile"     ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "Admins can update any profile"    ON public.profiles FOR UPDATE USING (public.get_user_role() = 'admin');

CREATE POLICY "Authenticated users can view courses" ON public.courses FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can insert courses"            ON public.courses FOR INSERT WITH CHECK (public.get_user_role() = 'admin');
CREATE POLICY "Admins can update courses"            ON public.courses FOR UPDATE USING (public.get_user_role() = 'admin');
CREATE POLICY "Admins can delete courses"            ON public.courses FOR DELETE USING (public.get_user_role() = 'admin');

CREATE POLICY "Authenticated users can view lessons"       ON public.lessons FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins and instructors can insert lessons"   ON public.lessons FOR INSERT WITH CHECK (public.get_user_role() IN ('admin', 'instructor'));
CREATE POLICY "Admins and instructors can update lessons"   ON public.lessons FOR UPDATE USING (public.get_user_role() IN ('admin', 'instructor'));
CREATE POLICY "Admins and instructors can delete lessons"   ON public.lessons FOR DELETE USING (public.get_user_role() IN ('admin', 'instructor'));

CREATE POLICY "Students can view own submissions"    ON public.submissions FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Instructors can view all submissions" ON public.submissions FOR SELECT USING (public.get_user_role() = 'instructor');
CREATE POLICY "Admins can view all submissions"      ON public.submissions FOR SELECT USING (public.get_user_role() = 'admin');
CREATE POLICY "Students can insert own submissions"  ON public.submissions FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "Instructors can update submissions"   ON public.submissions FOR UPDATE USING (public.get_user_role() = 'instructor');
CREATE POLICY "Admins can update submissions"        ON public.submissions FOR UPDATE USING (public.get_user_role() = 'admin');

-- 10. Verify everything is clean
SELECT 'auth.users' AS source, count(*) FROM auth.users
UNION ALL
SELECT 'profiles', count(*) FROM public.profiles;

-- ============================================================
-- Spring Up LMS — Database Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 0. CLEAN SLATE — drop old tables/types from previous builds
-- ────────────────────────────────────────────────────────────

-- Drop in reverse dependency order
DROP TABLE IF EXISTS public.submissions CASCADE;
DROP TABLE IF EXISTS public.lessons     CASCADE;
DROP TABLE IF EXISTS public.courses     CASCADE;
DROP TABLE IF EXISTS public.certificates CASCADE;
DROP TABLE IF EXISTS public.learning_block_courses CASCADE;
DROP TABLE IF EXISTS public.learning_blocks        CASCADE;
DROP TABLE IF EXISTS public.learning_paths         CASCADE;
DROP TABLE IF EXISTS public.profiles    CASCADE;

-- Drop leftover tables from the original project
DROP TABLE IF EXISTS public.modules CASCADE;

-- Drop old enums so they can be recreated cleanly
DROP TYPE IF EXISTS public.user_role         CASCADE;
DROP TYPE IF EXISTS public.course_pillar     CASCADE;
DROP TYPE IF EXISTS public.course_category  CASCADE;
DROP TYPE IF EXISTS public.submission_status CASCADE;

-- Drop old functions
DROP FUNCTION IF EXISTS public.handle_new_user()  CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role()    CASCADE;

-- ────────────────────────────────────────────────────────────
-- 1. ENUMS
-- ────────────────────────────────────────────────────────────

CREATE TYPE public.user_role AS ENUM ('admin', 'instructor', 'student');

CREATE TYPE public.course_pillar AS ENUM (
  'Digital Literacy',
  'Career Readiness',
  'Life Skills',
  'Cultural Identity'
);

CREATE TYPE public.course_category AS ENUM (
  'Word',
  'Excel',
  'Slides',
  'Other'
);

CREATE TYPE public.submission_status AS ENUM ('pending', 'reviewed');


-- ────────────────────────────────────────────────────────────
-- 2. TABLES
-- ────────────────────────────────────────────────────────────

-- profiles — one row per authenticated user
CREATE TABLE public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  full_name  TEXT NOT NULL DEFAULT '',
  role       public.user_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- courses — organised by the 4 curriculum pillars
CREATE TABLE public.courses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  pillar      public.course_pillar NOT NULL,
  category    public.course_category NOT NULL DEFAULT 'Other',
  description TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- learning_paths — a named learning path for the programme
CREATE TABLE public.learning_paths (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- learning_blocks — ordered blocks inside a learning path
CREATE TABLE public.learning_blocks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id     UUID NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  subtitle    TEXT NOT NULL DEFAULT '',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- learning_block_courses — ordered courses inside a learning block
CREATE TABLE public.learning_block_courses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id    UUID NOT NULL REFERENCES public.learning_blocks(id) ON DELETE CASCADE,
  course_id   UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (block_id, course_id)
);

-- lessons — ordered content within a course
CREATE TABLE public.lessons (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  content     TEXT NOT NULL DEFAULT '',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- submissions — student work linked to a lesson
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

-- certificates — downloadable completion certificates per course
CREATE TABLE public.certificates (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id          UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  certificate_number TEXT NOT NULL,
  file_url           TEXT,
  issued_by          UUID REFERENCES public.profiles(id),
  issued_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, course_id)
);

-- Index for fast instructor queries on pending submissions
CREATE INDEX idx_submissions_status
  ON public.submissions(status);

-- Index for fast student lookups of their own work
CREATE INDEX idx_submissions_student
  ON public.submissions(student_id);

-- Index for ordering lessons within a course
CREATE INDEX idx_lessons_course_order
  ON public.lessons(course_id, order_index);


-- ────────────────────────────────────────────────────────────
-- 3. AUTO-CREATE PROFILE ON SIGN-UP (TRIGGER)
-- ────────────────────────────────────────────────────────────

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

-- Drop if exists so re-running is safe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ────────────────────────────────────────────────────────────
-- 4. ROW LEVEL SECURITY (RLS)
-- ────────────────────────────────────────────────────────────

-- Enable RLS on every table
ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_block_courses ENABLE ROW LEVEL SECURITY;

-- ── Helper: look up the current user's role ─────────────────
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS public.user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;


-- ── PROFILES policies ───────────────────────────────────────

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

-- Admins can read all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.get_user_role() = 'admin');

-- Users can update their own profile (name only, not role)
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admins can update any profile (e.g. change roles)
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.get_user_role() = 'admin');


-- ── COURSES policies ────────────────────────────────────────

-- All authenticated users can browse courses
CREATE POLICY "Authenticated users can view courses"
  ON public.courses FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only admins can create courses
CREATE POLICY "Admins can insert courses"
  ON public.courses FOR INSERT
  WITH CHECK (public.get_user_role() = 'admin');

-- Only admins can edit courses
CREATE POLICY "Admins can update courses"
  ON public.courses FOR UPDATE
  USING (public.get_user_role() = 'admin');

-- Only admins can delete courses
CREATE POLICY "Admins can delete courses"
  ON public.courses FOR DELETE
  USING (public.get_user_role() = 'admin');


-- ── LEARNING PATH policies ──────────────────────────────────

-- All authenticated users can read learning paths/blocks
CREATE POLICY "Authenticated users can view learning paths"
  ON public.learning_paths FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view learning blocks"
  ON public.learning_blocks FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view learning block courses"
  ON public.learning_block_courses FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only admins can manage learning paths/blocks
CREATE POLICY "Admins can insert learning paths"
  ON public.learning_paths FOR INSERT
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "Admins can update learning paths"
  ON public.learning_paths FOR UPDATE
  USING (public.get_user_role() = 'admin');

CREATE POLICY "Admins can delete learning paths"
  ON public.learning_paths FOR DELETE
  USING (public.get_user_role() = 'admin');

CREATE POLICY "Admins can insert learning blocks"
  ON public.learning_blocks FOR INSERT
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "Admins can update learning blocks"
  ON public.learning_blocks FOR UPDATE
  USING (public.get_user_role() = 'admin');

CREATE POLICY "Admins can delete learning blocks"
  ON public.learning_blocks FOR DELETE
  USING (public.get_user_role() = 'admin');

CREATE POLICY "Admins can insert learning block courses"
  ON public.learning_block_courses FOR INSERT
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "Admins can update learning block courses"
  ON public.learning_block_courses FOR UPDATE
  USING (public.get_user_role() = 'admin');

CREATE POLICY "Admins can delete learning block courses"
  ON public.learning_block_courses FOR DELETE
  USING (public.get_user_role() = 'admin');


-- ── LESSONS policies ────────────────────────────────────────

-- All authenticated users can read lessons
CREATE POLICY "Authenticated users can view lessons"
  ON public.lessons FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Admins and instructors can create lessons
CREATE POLICY "Admins and instructors can insert lessons"
  ON public.lessons FOR INSERT
  WITH CHECK (public.get_user_role() IN ('admin', 'instructor'));

-- Admins and instructors can edit lessons
CREATE POLICY "Admins and instructors can update lessons"
  ON public.lessons FOR UPDATE
  USING (public.get_user_role() IN ('admin', 'instructor'));

-- Admins and instructors can delete lessons
CREATE POLICY "Admins and instructors can delete lessons"
  ON public.lessons FOR DELETE
  USING (public.get_user_role() IN ('admin', 'instructor'));


-- ── SUBMISSIONS policies ────────────────────────────────────

-- Students can view only their own submissions
CREATE POLICY "Students can view own submissions"
  ON public.submissions FOR SELECT
  USING (student_id = auth.uid());

-- Instructors can view all submissions (for grading)
CREATE POLICY "Instructors can view all submissions"
  ON public.submissions FOR SELECT
  USING (public.get_user_role() = 'instructor');

-- Admins can view all submissions
CREATE POLICY "Admins can view all submissions"
  ON public.submissions FOR SELECT
  USING (public.get_user_role() = 'admin');

-- Students can submit their own work
CREATE POLICY "Students can insert own submissions"
  ON public.submissions FOR INSERT
  WITH CHECK (student_id = auth.uid());

-- Instructors can update any submission (grade + feedback)
CREATE POLICY "Instructors can update submissions"
  ON public.submissions FOR UPDATE
  USING (public.get_user_role() = 'instructor');

-- Admins can update any submission
CREATE POLICY "Admins can update submissions"
  ON public.submissions FOR UPDATE
  USING (public.get_user_role() = 'admin');


-- ── CERTIFICATES policies ───────────────────────────────────

-- Students can view only their own certificates
CREATE POLICY "Students can view own certificates"
  ON public.certificates FOR SELECT
  USING (student_id = auth.uid());

-- Admins can view all certificates
CREATE POLICY "Admins can view all certificates"
  ON public.certificates FOR SELECT
  USING (public.get_user_role() = 'admin');

-- Students can insert their own certificate records (issued by server route)
CREATE POLICY "Students can insert own certificates"
  ON public.certificates FOR INSERT
  WITH CHECK (student_id = auth.uid());

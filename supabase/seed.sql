-- ============================================================
-- Spring Up LMS — Seed & Role Promotion
-- Run this in the Supabase SQL Editor AFTER schema.sql
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- PROMOTE A USER TO ADMIN
-- ────────────────────────────────────────────────────────────
-- Step 1: Sign up a user at /login?tab=signup
-- Step 2: Replace the email below with the user's email
-- Step 3: Run this query in the Supabase SQL Editor

UPDATE public.profiles
SET role = 'admin'
WHERE email = 'YOUR_ADMIN_EMAIL@example.com';

-- ────────────────────────────────────────────────────────────
-- PROMOTE A USER TO INSTRUCTOR
-- ────────────────────────────────────────────────────────────

-- UPDATE public.profiles
-- SET role = 'instructor'
-- WHERE email = 'YOUR_INSTRUCTOR_EMAIL@example.com';

-- ────────────────────────────────────────────────────────────
-- VERIFY ROLES
-- ────────────────────────────────────────────────────────────

-- SELECT id, email, full_name, role FROM public.profiles;

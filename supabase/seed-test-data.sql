-- ============================================================
-- Seed: Test students, lesson progress, and submissions
-- Run AFTER seed-courses.sql
-- Safe to re-run (idempotent throughout).
-- ============================================================

DO $$
DECLARE
  -- ── Fixed student UUIDs ───────────────────────────────────
  kai_id      UUID := '11111111-aaaa-4aaa-8aaa-111111111001';
  amara_id    UUID := '11111111-aaaa-4aaa-8aaa-111111111002';
  emmanuel_id UUID := '11111111-aaaa-4aaa-8aaa-111111111003';
  nana_id     UUID := '11111111-aaaa-4aaa-8aaa-111111111004';
  fatima_id   UUID := '11111111-aaaa-4aaa-8aaa-111111111005';
  kwame_id    UUID := '11111111-aaaa-4aaa-8aaa-111111111006';
  ama_id      UUID := '11111111-aaaa-4aaa-8aaa-111111111007';
  abena_id    UUID := '11111111-aaaa-4aaa-8aaa-111111111008';

  -- ── Lesson ID variables ───────────────────────────────────
  word_l1   UUID; word_l2   UUID; word_l3   UUID;
  word_l4   UUID; word_l5   UUID;
  excel_l1  UUID; excel_l2  UUID; excel_l3  UUID;
  excel_l4  UUID; excel_l5  UUID;
  slides_l1 UUID; slides_l2 UUID; slides_l3 UUID;
  slides_l4 UUID; slides_l5 UUID;
  career_l1 UUID; career_l2 UUID;

  -- ── Misc ─────────────────────────────────────────────────
  instr_id  UUID;
  cohort_id UUID;
  all_students UUID[] := ARRAY[
    '11111111-aaaa-4aaa-8aaa-111111111001',
    '11111111-aaaa-4aaa-8aaa-111111111002',
    '11111111-aaaa-4aaa-8aaa-111111111003',
    '11111111-aaaa-4aaa-8aaa-111111111004',
    '11111111-aaaa-4aaa-8aaa-111111111005',
    '11111111-aaaa-4aaa-8aaa-111111111006',
    '11111111-aaaa-4aaa-8aaa-111111111007',
    '11111111-aaaa-4aaa-8aaa-111111111008'
  ];

BEGIN

  -- ── Step 0: Ensure required tables exist ─────────────────

  CREATE TABLE IF NOT EXISTS public.lesson_progress (
    student_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    lesson_id        UUID NOT NULL REFERENCES public.lessons(id)  ON DELETE CASCADE,
    video_watched_at TIMESTAMPTZ,
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (student_id, lesson_id)
  );

  CREATE TABLE IF NOT EXISTS public.instructor_student_assignments (
    instructor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    assigned_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (instructor_id, student_id)
  );

  CREATE TABLE IF NOT EXISTS public.cohorts (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instructor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name          TEXT NOT NULL,
    description   TEXT NOT NULL DEFAULT '',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS public.cohort_students (
    cohort_id  UUID NOT NULL REFERENCES public.cohorts(id)   ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id)  ON DELETE CASCADE,
    joined_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (cohort_id, student_id)
  );

  -- ── Step 1: Clean up prior test data ─────────────────────

  DELETE FROM public.lesson_progress   WHERE student_id = ANY(all_students);
  DELETE FROM public.submissions        WHERE student_id = ANY(all_students);
  DELETE FROM public.cohort_students    WHERE student_id = ANY(all_students);
  DELETE FROM public.cohorts            WHERE instructor_id IN (
    SELECT id FROM public.profiles WHERE role = 'instructor'
  );
  DELETE FROM public.instructor_student_assignments WHERE student_id = ANY(all_students);
  DELETE FROM public.profiles           WHERE id = ANY(all_students);
  DELETE FROM auth.users                WHERE id = ANY(all_students);

  -- ── Step 2: Create auth users ─────────────────────────────

  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data, is_sso_user
  ) VALUES
    (kai_id,      '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'kai.appiah@test.springup',      crypt('Test1234!', gen_salt('bf')),
     NOW(), NOW() - INTERVAL '90 days', NOW(),
     '{"provider":"email","providers":["email"]}', '{"full_name":"Kai Appiah"}',      false),

    (amara_id,    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'amara.mensah@test.springup',    crypt('Test1234!', gen_salt('bf')),
     NOW(), NOW() - INTERVAL '85 days', NOW(),
     '{"provider":"email","providers":["email"]}', '{"full_name":"Amara Mensah"}',    false),

    (emmanuel_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'emmanuel.osei@test.springup',   crypt('Test1234!', gen_salt('bf')),
     NOW(), NOW() - INTERVAL '80 days', NOW(),
     '{"provider":"email","providers":["email"]}', '{"full_name":"Emmanuel Osei"}',   false),

    (nana_id,     '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'nana.adjei@test.springup',      crypt('Test1234!', gen_salt('bf')),
     NOW(), NOW() - INTERVAL '75 days', NOW(),
     '{"provider":"email","providers":["email"]}', '{"full_name":"Nana Adjei"}',      false),

    (fatima_id,   '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'fatima.diallo@test.springup',   crypt('Test1234!', gen_salt('bf')),
     NOW(), NOW() - INTERVAL '60 days', NOW(),
     '{"provider":"email","providers":["email"]}', '{"full_name":"Fatima Diallo"}',   false),

    (kwame_id,    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'kwame.asante@test.springup',    crypt('Test1234!', gen_salt('bf')),
     NOW(), NOW() - INTERVAL '30 days', NOW(),
     '{"provider":"email","providers":["email"]}', '{"full_name":"Kwame Asante"}',    false),

    (ama_id,      '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'ama.boateng@test.springup',     crypt('Test1234!', gen_salt('bf')),
     NOW(), NOW() - INTERVAL '10 days', NOW(),
     '{"provider":"email","providers":["email"]}', '{"full_name":"Ama Boateng"}',     false),

    (abena_id,    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'abena.darko@test.springup',     crypt('Test1234!', gen_salt('bf')),
     NOW(), NOW() - INTERVAL '5 days', NOW(),
     '{"provider":"email","providers":["email"]}', '{"full_name":"Abena Darko"}',     false)
  ON CONFLICT (id) DO NOTHING;

  -- ── Step 3: Upsert profiles ───────────────────────────────

  INSERT INTO public.profiles (id, email, full_name, role) VALUES
    (kai_id,      'kai.appiah@test.springup',      'Kai Appiah',      'student'),
    (amara_id,    'amara.mensah@test.springup',    'Amara Mensah',    'student'),
    (emmanuel_id, 'emmanuel.osei@test.springup',   'Emmanuel Osei',   'student'),
    (nana_id,     'nana.adjei@test.springup',      'Nana Adjei',      'student'),
    (fatima_id,   'fatima.diallo@test.springup',   'Fatima Diallo',   'student'),
    (kwame_id,    'kwame.asante@test.springup',    'Kwame Asante',    'student'),
    (ama_id,      'ama.boateng@test.springup',     'Ama Boateng',     'student'),
    (abena_id,    'abena.darko@test.springup',     'Abena Darko',     'student')
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role      = EXCLUDED.role;

  -- ── Step 4: Fetch lesson IDs ──────────────────────────────

  SELECT id INTO word_l1   FROM public.lessons WHERE course_id = 'c0dec001-face-4ade-babe-deadbeef0001' ORDER BY order_index LIMIT 1 OFFSET 0;
  SELECT id INTO word_l2   FROM public.lessons WHERE course_id = 'c0dec001-face-4ade-babe-deadbeef0001' ORDER BY order_index LIMIT 1 OFFSET 1;
  SELECT id INTO word_l3   FROM public.lessons WHERE course_id = 'c0dec001-face-4ade-babe-deadbeef0001' ORDER BY order_index LIMIT 1 OFFSET 2;
  SELECT id INTO word_l4   FROM public.lessons WHERE course_id = 'c0dec001-face-4ade-babe-deadbeef0001' ORDER BY order_index LIMIT 1 OFFSET 3;
  SELECT id INTO word_l5   FROM public.lessons WHERE course_id = 'c0dec001-face-4ade-babe-deadbeef0001' ORDER BY order_index LIMIT 1 OFFSET 4;

  SELECT id INTO excel_l1  FROM public.lessons WHERE course_id = 'c0dec002-face-4ade-babe-deadbeef0002' ORDER BY order_index LIMIT 1 OFFSET 0;
  SELECT id INTO excel_l2  FROM public.lessons WHERE course_id = 'c0dec002-face-4ade-babe-deadbeef0002' ORDER BY order_index LIMIT 1 OFFSET 1;
  SELECT id INTO excel_l3  FROM public.lessons WHERE course_id = 'c0dec002-face-4ade-babe-deadbeef0002' ORDER BY order_index LIMIT 1 OFFSET 2;
  SELECT id INTO excel_l4  FROM public.lessons WHERE course_id = 'c0dec002-face-4ade-babe-deadbeef0002' ORDER BY order_index LIMIT 1 OFFSET 3;
  SELECT id INTO excel_l5  FROM public.lessons WHERE course_id = 'c0dec002-face-4ade-babe-deadbeef0002' ORDER BY order_index LIMIT 1 OFFSET 4;

  SELECT id INTO slides_l1 FROM public.lessons WHERE course_id = 'c0dec003-face-4ade-babe-deadbeef0003' ORDER BY order_index LIMIT 1 OFFSET 0;
  SELECT id INTO slides_l2 FROM public.lessons WHERE course_id = 'c0dec003-face-4ade-babe-deadbeef0003' ORDER BY order_index LIMIT 1 OFFSET 1;
  SELECT id INTO slides_l3 FROM public.lessons WHERE course_id = 'c0dec003-face-4ade-babe-deadbeef0003' ORDER BY order_index LIMIT 1 OFFSET 2;
  SELECT id INTO slides_l4 FROM public.lessons WHERE course_id = 'c0dec003-face-4ade-babe-deadbeef0003' ORDER BY order_index LIMIT 1 OFFSET 3;
  SELECT id INTO slides_l5 FROM public.lessons WHERE course_id = 'c0dec003-face-4ade-babe-deadbeef0003' ORDER BY order_index LIMIT 1 OFFSET 4;

  SELECT id INTO career_l1 FROM public.lessons WHERE course_id = 'c0dec201-cafe-4ade-babe-deadbeef0201' ORDER BY order_index LIMIT 1 OFFSET 0;
  SELECT id INTO career_l2 FROM public.lessons WHERE course_id = 'c0dec201-cafe-4ade-babe-deadbeef0201' ORDER BY order_index LIMIT 1 OFFSET 1;

  -- ── Preflight: abort if courses/lessons are missing ───────

  IF NOT EXISTS (SELECT 1 FROM public.courses WHERE id = 'c0dec001-face-4ade-babe-deadbeef0001') THEN
    RAISE EXCEPTION
      E'\n\nSEED FAILED: courses not found.\n'
      'Run seed-courses.sql first, then re-run this file.';
  END IF;

  IF word_l1 IS NULL THEN
    RAISE EXCEPTION
      E'\n\nSEED FAILED: Word lessons not found.\n'
      'Course c0dec001 exists but has no lessons — re-run seed-courses.sql.';
  END IF;

  IF excel_l1 IS NULL THEN
    RAISE EXCEPTION
      E'\n\nSEED FAILED: Excel lessons not found.\n'
      'Course c0dec002 exists but has no lessons — re-run seed-courses.sql.';
  END IF;

  IF slides_l1 IS NULL THEN
    RAISE EXCEPTION
      E'\n\nSEED FAILED: Slides lessons not found.\n'
      'Course c0dec003 exists but has no lessons — re-run seed-courses.sql.';
  END IF;

  RAISE NOTICE 'Preflight passed.';
  RAISE NOTICE '  word   l1=% l2=% l3=%', word_l1, word_l2, word_l3;
  RAISE NOTICE '  excel  l1=% l2=% l3=%', excel_l1, excel_l2, excel_l3;
  RAISE NOTICE '  slides l1=% l2=% l3=%', slides_l1, slides_l2, slides_l3;
  RAISE NOTICE '  career l1=% l2=%', career_l1, career_l2;

  -- ── Step 5: Instructor, cohort, assignments ───────────────

  SELECT id INTO instr_id FROM public.profiles WHERE email = 'instructor@springup.org' LIMIT 1;

  -- Fallback: if the specific email is not found, try any instructor
  IF instr_id IS NULL THEN
    SELECT id INTO instr_id FROM public.profiles WHERE role = 'instructor' LIMIT 1;
  END IF;

  IF instr_id IS NULL THEN
    RAISE NOTICE 'No instructor found — skipping cohort and assignments.';
    RAISE NOTICE 'Make sure instructor@springup.org exists with role=instructor then re-run.';
  ELSE
    RAISE NOTICE 'Assigning instructor id=% to cohort and all 8 students.', instr_id;

    INSERT INTO public.cohorts (instructor_id, name, description)
    VALUES (instr_id, 'Spring Up Cohort 2025-A', 'Main pilot cohort — Digital Literacy and Career Readiness track')
    RETURNING id INTO cohort_id;

    INSERT INTO public.cohort_students (cohort_id, student_id) VALUES
      (cohort_id, kai_id), (cohort_id, amara_id), (cohort_id, emmanuel_id),
      (cohort_id, nana_id), (cohort_id, fatima_id), (cohort_id, kwame_id),
      (cohort_id, ama_id),  (cohort_id, abena_id);

    INSERT INTO public.instructor_student_assignments (instructor_id, student_id) VALUES
      (instr_id, kai_id),      (instr_id, amara_id),
      (instr_id, emmanuel_id), (instr_id, nana_id),
      (instr_id, fatima_id),   (instr_id, kwame_id),
      (instr_id, ama_id),      (instr_id, abena_id)
    ON CONFLICT (instructor_id, student_id) DO NOTHING;
  END IF;

  -- ── Step 6: Lesson progress (video watched) ───────────────

  INSERT INTO public.lesson_progress (student_id, lesson_id, video_watched_at, updated_at) VALUES
    -- KAI: Word 1-5, Excel 1-3, Slides 1-2
    (kai_id, word_l1,   NOW()-INTERVAL '88 days', NOW()-INTERVAL '88 days'),
    (kai_id, word_l2,   NOW()-INTERVAL '82 days', NOW()-INTERVAL '82 days'),
    (kai_id, word_l3,   NOW()-INTERVAL '76 days', NOW()-INTERVAL '76 days'),
    (kai_id, word_l4,   NOW()-INTERVAL '70 days', NOW()-INTERVAL '70 days'),
    (kai_id, word_l5,   NOW()-INTERVAL '64 days', NOW()-INTERVAL '64 days'),
    (kai_id, excel_l1,  NOW()-INTERVAL '58 days', NOW()-INTERVAL '58 days'),
    (kai_id, excel_l2,  NOW()-INTERVAL '52 days', NOW()-INTERVAL '52 days'),
    (kai_id, excel_l3,  NOW()-INTERVAL '46 days', NOW()-INTERVAL '46 days'),
    (kai_id, slides_l1, NOW()-INTERVAL '20 days', NOW()-INTERVAL '20 days'),
    (kai_id, slides_l2, NOW()-INTERVAL '14 days', NOW()-INTERVAL '14 days'),

    -- AMARA: Word 1-4, Excel 1-2, Slides 1
    (amara_id, word_l1,   NOW()-INTERVAL '83 days', NOW()-INTERVAL '83 days'),
    (amara_id, word_l2,   NOW()-INTERVAL '77 days', NOW()-INTERVAL '77 days'),
    (amara_id, word_l3,   NOW()-INTERVAL '71 days', NOW()-INTERVAL '71 days'),
    (amara_id, word_l4,   NOW()-INTERVAL '62 days', NOW()-INTERVAL '62 days'),
    (amara_id, excel_l1,  NOW()-INTERVAL '45 days', NOW()-INTERVAL '45 days'),
    (amara_id, excel_l2,  NOW()-INTERVAL '38 days', NOW()-INTERVAL '38 days'),
    (amara_id, slides_l1, NOW()-INTERVAL '18 days', NOW()-INTERVAL '18 days'),

    -- EMMANUEL: Word 1-4, Excel 1-3, Slides 1-3
    (emmanuel_id, word_l1,   NOW()-INTERVAL '78 days', NOW()-INTERVAL '78 days'),
    (emmanuel_id, word_l2,   NOW()-INTERVAL '72 days', NOW()-INTERVAL '72 days'),
    (emmanuel_id, word_l3,   NOW()-INTERVAL '66 days', NOW()-INTERVAL '66 days'),
    (emmanuel_id, word_l4,   NOW()-INTERVAL '60 days', NOW()-INTERVAL '60 days'),
    (emmanuel_id, excel_l1,  NOW()-INTERVAL '50 days', NOW()-INTERVAL '50 days'),
    (emmanuel_id, excel_l2,  NOW()-INTERVAL '44 days', NOW()-INTERVAL '44 days'),
    (emmanuel_id, excel_l3,  NOW()-INTERVAL '38 days', NOW()-INTERVAL '38 days'),
    (emmanuel_id, slides_l1, NOW()-INTERVAL '25 days', NOW()-INTERVAL '25 days'),
    (emmanuel_id, slides_l2, NOW()-INTERVAL '19 days', NOW()-INTERVAL '19 days'),
    (emmanuel_id, slides_l3, NOW()-INTERVAL '13 days', NOW()-INTERVAL '13 days'),

    -- NANA: Word 1-3, Excel 1, Slides 1
    (nana_id, word_l1,   NOW()-INTERVAL '73 days', NOW()-INTERVAL '73 days'),
    (nana_id, word_l2,   NOW()-INTERVAL '67 days', NOW()-INTERVAL '67 days'),
    (nana_id, word_l3,   NOW()-INTERVAL '55 days', NOW()-INTERVAL '55 days'),
    (nana_id, excel_l1,  NOW()-INTERVAL '35 days', NOW()-INTERVAL '35 days'),
    (nana_id, slides_l1, NOW()-INTERVAL '15 days', NOW()-INTERVAL '15 days'),

    -- FATIMA: Word 1-2
    (fatima_id, word_l1, NOW()-INTERVAL '68 days', NOW()-INTERVAL '68 days'),
    (fatima_id, word_l2, NOW()-INTERVAL '56 days', NOW()-INTERVAL '56 days'),

    -- KWAME: Word 1
    (kwame_id, word_l1, NOW()-INTERVAL '28 days', NOW()-INTERVAL '28 days'),

    -- AMA: Word 1
    (ama_id, word_l1, NOW()-INTERVAL '8 days', NOW()-INTERVAL '8 days')

    -- ABENA: no video progress yet

  ON CONFLICT (student_id, lesson_id) DO NOTHING;

  -- ── Step 7: Submissions ───────────────────────────────────
  -- status: 'reviewed' = graded, 'pending' = awaiting review

  INSERT INTO public.submissions (student_id, lesson_id, file_url, status, grade, feedback, created_at) VALUES

    -- KAI — strong performer
    (kai_id, word_l1, 'https://example.com/kai-word1.docx',   'reviewed', 88,
     'Great structure and clear headings. Next time aim for tighter paragraph breaks.',
     NOW()-INTERVAL '87 days'),
    (kai_id, word_l2, 'https://example.com/kai-word2.docx',   'reviewed', 91,
     'Excellent formatting. Consistent heading hierarchy throughout.',
     NOW()-INTERVAL '80 days'),
    (kai_id, word_l3, 'https://example.com/kai-word3.docx',   'reviewed', 85,
     'Good table structure. Column widths could be more consistent.',
     NOW()-INTERVAL '74 days'),
    (kai_id, excel_l1, 'https://example.com/kai-excel1.xlsx', 'reviewed', 92,
     'Roster is well-organised. Conditional formatting applied correctly.',
     NOW()-INTERVAL '56 days'),
    (kai_id, excel_l2, 'https://example.com/kai-excel2.xlsx', 'reviewed', 87,
     'Date formulas are accurate. Sorting logic is clean.',
     NOW()-INTERVAL '50 days'),
    (kai_id, slides_l1, 'https://example.com/kai-slides1.pdf', 'pending', NULL, '',
     NOW()-INTERVAL '19 days'),

    -- AMARA — consistent mid-high
    (amara_id, word_l1, 'https://example.com/amara-word1.docx',   'reviewed', 80,
     'Solid start. Formatting is clear but spacing needs attention.',
     NOW()-INTERVAL '82 days'),
    (amara_id, word_l2, 'https://example.com/amara-word2.docx',   'reviewed', 78,
     'Content is good. Apply Heading styles consistently.',
     NOW()-INTERVAL '75 days'),
    (amara_id, word_l3, 'https://example.com/amara-word3.docx',   'reviewed', 83,
     'Tables are well-formed. Nice use of borders.',
     NOW()-INTERVAL '69 days'),
    (amara_id, excel_l1, 'https://example.com/amara-excel1.xlsx', 'reviewed', 75,
     'Roster complete. Some Data Validation dropdowns are missing.',
     NOW()-INTERVAL '43 days'),
    (amara_id, slides_l1, 'https://example.com/amara-slides1.pdf', 'pending', NULL, '',
     NOW()-INTERVAL '17 days'),

    -- EMMANUEL — high achiever
    (emmanuel_id, word_l1, 'https://example.com/emm-word1.docx',    'reviewed', 95,
     'Outstanding first submission. Document is clean and professional.',
     NOW()-INTERVAL '77 days'),
    (emmanuel_id, word_l2, 'https://example.com/emm-word2.docx',    'reviewed', 93,
     'Excellent use of styles. Letter format is perfect.',
     NOW()-INTERVAL '71 days'),
    (emmanuel_id, excel_l1, 'https://example.com/emm-excel1.xlsx',  'reviewed', 90,
     'Strong roster. Conditional formatting stands out.',
     NOW()-INTERVAL '49 days'),
    (emmanuel_id, excel_l2, 'https://example.com/emm-excel2.xlsx',  'reviewed', 88,
     'Date math is accurate. Priority column logic is well-structured.',
     NOW()-INTERVAL '43 days'),
    (emmanuel_id, excel_l3, 'https://example.com/emm-excel3.xlsx',  'reviewed', 94,
     'Dashboard is clear and officer-ready. Well done.',
     NOW()-INTERVAL '37 days'),
    (emmanuel_id, slides_l1, 'https://example.com/emm-slides1.pdf', 'reviewed', 89,
     'Slides are clean and well-structured. Good use of visuals.',
     NOW()-INTERVAL '24 days'),
    (emmanuel_id, slides_l2, 'https://example.com/emm-slides2.pdf', 'pending', NULL, '',
     NOW()-INTERVAL '18 days'),

    -- NANA — progressing steadily
    (nana_id, word_l1, 'https://example.com/nana-word1.docx',   'reviewed', 72,
     'Good effort. Work on consistent line spacing.',
     NOW()-INTERVAL '72 days'),
    (nana_id, word_l2, 'https://example.com/nana-word2.docx',   'reviewed', 70,
     'Formatting is improving. Keep practising heading styles.',
     NOW()-INTERVAL '66 days'),
    (nana_id, excel_l1, 'https://example.com/nana-excel1.xlsx', 'pending', NULL, '',
     NOW()-INTERVAL '34 days'),

    -- FATIMA — early stage
    (fatima_id, word_l1, 'https://example.com/fatima-word1.docx', 'reviewed', 65,
     'Good start. Focus on document structure in the next lesson.',
     NOW()-INTERVAL '67 days'),
    (fatima_id, word_l2, 'https://example.com/fatima-word2.docx', 'pending', NULL, '',
     NOW()-INTERVAL '55 days'),

    -- KWAME — just started
    (kwame_id, word_l1, 'https://example.com/kwame-word1.docx', 'pending', NULL, '',
     NOW()-INTERVAL '27 days'),

    -- AMA — brand new
    (ama_id, word_l1, 'https://example.com/ama-word1.docx', 'pending', NULL, '',
     NOW()-INTERVAL '7 days')

    -- ABENA: no submissions yet

  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Seed complete. 8 students, lesson progress, and submissions inserted.';

END $$;

-- ── Quick verify ─────────────────────────────────────────────
SELECT role, count(*) FROM public.profiles GROUP BY role;
SELECT count(*) AS lesson_progress_rows FROM public.lesson_progress;
SELECT status, count(*) FROM public.submissions GROUP BY status;

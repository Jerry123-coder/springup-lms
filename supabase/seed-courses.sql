-- ============================================================
-- Seed: Sample courses and lessons for testing
-- Run in Supabase SQL Editor AFTER schema.sql and storage.sql
-- ============================================================

-- ── Digital Literacy ────────────────────────────────────────
INSERT INTO public.courses (id, title, pillar, description) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'Microsoft Word Proficiency', 'Digital Literacy', 'Master document creation, formatting, tables, and collaboration in Microsoft Word.'),
  ('d1000000-0000-0000-0000-000000000002', 'Microsoft Excel Fundamentals', 'Digital Literacy', 'Learn spreadsheets, formulas, charts, and data organisation in Excel.');

INSERT INTO public.lessons (course_id, title, content, order_index) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'Introduction to Word', '# Introduction to Word

Welcome to your first lesson on Microsoft Word.

## What You Will Learn
- How to open and create a new document
- The Ribbon interface and key tabs
- Basic typing, selecting, and deleting text

## Task
> Open Microsoft Word and create a blank document. Type your full name and save the file as "my-first-document.docx".', 1),

  ('d1000000-0000-0000-0000-000000000001', 'Formatting Text', '# Formatting Text

Learn how to make your documents look professional.

## Key Skills
- Bold, Italic, Underline
- Font size and font family
- Text alignment (left, centre, right, justify)
- Headings and paragraph spacing

## Task
> Create a one-page document with a heading, two paragraphs, and at least three different formatting styles. Save and submit.', 2),

  ('d1000000-0000-0000-0000-000000000001', 'Tables and Lists', '# Tables and Lists

Organise information clearly using tables and lists.

## What You Will Learn
- Creating bulleted and numbered lists
- Inserting and formatting tables
- Merging cells and adjusting column widths

## Task
> Create a document with a numbered list of 5 goals and a table showing your weekly schedule. Submit the file.', 3),

  ('d1000000-0000-0000-0000-000000000002', 'Getting Started with Excel', '# Getting Started with Excel

Understand the spreadsheet interface and basic navigation.

## Key Concepts
- Cells, rows, and columns
- Entering data and navigating with keyboard
- Saving and naming workbooks

## Task
> Open Excel, enter your name in cell A1, and the numbers 1 through 10 in cells B1 to B10. Save and submit.', 1),

  ('d1000000-0000-0000-0000-000000000002', 'Formulas and Functions', '# Formulas and Functions

Learn to let Excel do the maths for you.

## Key Skills
- SUM, AVERAGE, COUNT, MAX, MIN
- Cell references (relative vs absolute)
- Writing basic formulas

## Task
> Create a spreadsheet with 10 numbers. Use SUM, AVERAGE, and MAX to calculate totals. Submit the file.', 2);

-- ── Career Readiness ────────────────────────────────────────
INSERT INTO public.courses (id, title, pillar, description) VALUES
  ('c2000000-0000-0000-0000-000000000001', 'Presentation Design', 'Career Readiness', 'Create compelling presentations using slides, visual hierarchy, and storytelling techniques.');

INSERT INTO public.lessons (course_id, title, content, order_index) VALUES
  ('c2000000-0000-0000-0000-000000000001', 'Slide Design Principles', '# Slide Design Principles

Great presentations are simple, visual, and memorable.

## The Rules
- One idea per slide
- Use large text (minimum 24pt)
- Images over bullet points
- Consistent colour scheme

## Task
> Design a 5-slide presentation introducing yourself. Include your name, background, goals, skills, and a closing slide. Submit as PDF.', 1),

  ('c2000000-0000-0000-0000-000000000001', 'Prompt Engineering Basics', '# Prompt Engineering Basics

Learn how to communicate effectively with AI tools.

## Key Concepts
- What is a prompt?
- Being specific vs being vague
- Giving context and constraints
- Iterating on your prompts

## Task
> Write 5 different prompts that ask an AI to help you write a professional email. Show how each prompt improves. Submit as a document.', 2);

-- ── Life Skills & Values ────────────────────────────────────
INSERT INTO public.courses (id, title, pillar, description) VALUES
  ('a3000000-0000-0000-0000-000000000001', 'Professional Etiquette', 'Life Skills', 'Build the soft skills that employers value — communication, punctuality, respect, and teamwork.');

INSERT INTO public.lessons (course_id, title, content, order_index) VALUES
  ('a3000000-0000-0000-0000-000000000001', 'Communication Skills', '# Communication Skills

How you speak and listen defines how others perceive you.

## Key Principles
- Listen before you speak
- Eye contact and body language
- Clear and concise language
- Asking questions shows intelligence, not weakness

## Task
> Write a short essay (200 words) on why good communication matters in the workplace. Submit.', 1),

  ('a3000000-0000-0000-0000-000000000001', 'Workplace Ethics', '# Workplace Ethics

Integrity is doing the right thing even when no one is watching.

## Topics
- Honesty and transparency
- Respecting others' time and property
- Taking responsibility for mistakes
- The value of consistency

## Task
> Describe a situation (real or imagined) where someone faced an ethical dilemma at work. How should they have handled it? (200 words). Submit.', 2);

-- ── Cultural Identity ───────────────────────────────────────
INSERT INTO public.courses (id, title, pillar, description) VALUES
  ('b4000000-0000-0000-0000-000000000001', 'African Literature & Heritage', 'Cultural Identity', 'Explore the richness of African storytelling, proverbs, and literature that shapes our identity.');

INSERT INTO public.lessons (course_id, title, content, order_index) VALUES
  ('b4000000-0000-0000-0000-000000000001', 'The Power of Proverbs', '# The Power of Proverbs

African proverbs carry centuries of wisdom in a single sentence.

## Examples
- "It takes a village to raise a child." — Igbo proverb
- "However long the night, the dawn will break." — African proverb
- "If you want to go fast, go alone. If you want to go far, go together." — African proverb

## Task
> Find 5 African proverbs. For each, explain what it means and how it applies to your life. Submit as a document.', 1),

  ('b4000000-0000-0000-0000-000000000001', 'Storytelling as Identity', '# Storytelling as Identity

Our stories define who we are, where we come from, and where we are going.

## Discussion
- Why do communities tell stories?
- How does oral tradition differ from written history?
- What stories from your own life shape who you are?

## Task
> Write a 300-word personal narrative about a moment that changed how you see yourself. Submit.', 2);

-- ── Verify ──────────────────────────────────────────────────
SELECT pillar, count(*) AS courses FROM public.courses GROUP BY pillar;
SELECT count(*) AS total_lessons FROM public.lessons;

-- ============================================================
-- Seed: Sample courses and lessons for testing
-- Run in Supabase SQL Editor AFTER schema.sql and storage.sql
-- ============================================================

-- ── Digital Literacy ────────────────────────────────────────
INSERT INTO public.courses (id, title, pillar, category, description) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'Microsoft Word Proficiency', 'Digital Literacy', 'Word', 'Master document creation, formatting, tables, and collaboration in Microsoft Word.'),
  ('d1000000-0000-0000-0000-000000000002', 'Microsoft Excel Fundamentals', 'Digital Literacy', 'Excel', 'Learn spreadsheets, formulas, charts, and data organisation in Excel.'),
  ('d1000000-0000-0000-0000-000000000003', 'Slides Foundations (PowerPoint / Google Slides)', 'Digital Literacy', 'Slides', 'Create clear, beautiful slides: layout, typography, visuals, and storytelling.');

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

-- Extra curriculum for Word / Excel / Slides (refreshing + structured)
INSERT INTO public.lessons (course_id, title, content, order_index) VALUES
  -- WORD (continue)
  ('d1000000-0000-0000-0000-000000000001', 'Editing & Shortcuts (Speed Up Your Work)', '# Editing & Shortcuts (Speed Up Your Work)

## Outcome
Edit text quickly and cleanly using shortcuts.

## Skills
- Copy/Cut/Paste
- Undo/Redo
- Find/Replace
- Line breaks vs paragraph breaks

## Task (Submit)
1. Type a 150–200 word paragraph about your goals.
2. Use **Find/Replace** to fix repeated words or spacing.
3. Add a heading at the top.
Save as: `word-shortcuts.docx`', 4),

  ('d1000000-0000-0000-0000-000000000001', 'Real Document: A Simple Professional Letter', '# Real Document: A Simple Professional Letter

## Outcome
Create a properly formatted letter (real-world skill).

## Structure
1. Sender details
2. Date
3. Recipient details
4. Subject line
5. Body (3 short paragraphs)
6. Signature

## Task (Submit)
Write a letter requesting an opportunity to learn/volunteer.
Save as: `word-letter.docx`', 5),

  -- EXCEL (continue)
  ('d1000000-0000-0000-0000-000000000002', 'Formatting & Tables (Make Data Readable)', '# Formatting & Tables (Make Data Readable)

## Outcome
Make a sheet that anyone can read and trust.

## Task (Submit)
Create an "Expenses" sheet with columns:
- Item
- Amount
- Notes

Add 6 rows. Then:
1. Bold headers
2. Add borders
3. Format Amount as number
4. Add a Total row using `SUM`

Save as: `excel-formatting.xlsx`', 3),

  ('d1000000-0000-0000-0000-000000000002', 'Charts (Tell a Story with Data)', '# Charts (Tell a Story with Data)

## Outcome
Turn numbers into a simple visual.

## Task (Submit)
Using your Expenses table, create a column chart titled **Weekly Expenses**.
Save as: `excel-charts.xlsx`', 4),

  ('d1000000-0000-0000-0000-000000000002', 'Real Spreadsheet: Weekly Budget', '# Real Spreadsheet: Weekly Budget

## Outcome
Build a simple budget you can reuse.

## Task (Submit)
Create a sheet with columns:
- Category
- Planned
- Actual
- Difference

Add at least 6 categories and use formulas to compute Difference.
Save as: `excel-budget.xlsx`', 5),

  -- SLIDES (full course)
  ('d1000000-0000-0000-0000-000000000003', 'Welcome: Slides Workspace & Saving', '# Welcome: Slides Workspace & Saving

## Outcome
Create a new presentation and understand slide basics.

## Task
Create a presentation with a title slide:
- Title: **Project Spring Up**
- Subtitle: your name + date

Export to PDF and submit.', 1),

  ('d1000000-0000-0000-0000-000000000003', 'Design Rules: Layout, Contrast, Alignment', '# Design Rules: Layout, Contrast, Alignment

## Outcome
Make slides that look professional (not crowded).

## Rules
- One idea per slide
- Big text (24pt+)
- Align everything
- Keep colours consistent

## Task (Submit)
Create 5 slides:
1. Title
2. Who I am
3. My skills
4. My goals
5. Thank you

Export to PDF and submit.', 2),

  ('d1000000-0000-0000-0000-000000000003', 'Images & Icons (Clean Visuals)', '# Images & Icons (Clean Visuals)

## Outcome
Use visuals without making a mess.

## Task (Submit)
Improve your 5-slide deck:
- Add 1 relevant image (not stretched)
- Add 2 icons (consistent style)
- Keep spacing consistent

Export to PDF and submit.', 3),

  ('d1000000-0000-0000-0000-000000000003', 'Storytelling: Present a Clear Message', '# Storytelling: Present a Clear Message

## Outcome
Turn slides into a story, not just text.

## Task (Submit)
Create a 6-slide presentation titled **My Second Chance**:
- Past
- Turning point
- Skills
- Future plan
- Values
- Closing

Export to PDF and submit.', 4),

  ('d1000000-0000-0000-0000-000000000003', 'Final Project: 3-Minute Talk Deck', '# Final Project: 3-Minute Talk Deck

## Outcome
Deliver a clear talk with simple slides.

## Task (Submit)
Prepare an 8-slide deck for a 3-minute talk:
- Less text, more clarity
- One message per slide
- Consistent fonts and colours

Export to PDF and submit.', 5);

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

-- ── Learning Path (DB-driven) ───────────────────────────────
INSERT INTO public.learning_paths (id, title, description) VALUES
  ('f5000000-0000-0000-0000-000000000001', 'Spring Up — Digital Foundations Path', 'A guided learning flow for the core digital tools: documents → spreadsheets → presentations.');

INSERT INTO public.learning_blocks (id, path_id, title, subtitle, order_index) VALUES
  ('f5000000-0000-0000-0000-000000000011', 'f5000000-0000-0000-0000-000000000001', 'Block 1 — Documents (Word)', 'Write, format, and structure professional documents.', 1),
  ('f5000000-0000-0000-0000-000000000012', 'f5000000-0000-0000-0000-000000000001', 'Block 2 — Spreadsheets (Excel)', 'Organise data and calculate with confidence.', 2),
  ('f5000000-0000-0000-0000-000000000013', 'f5000000-0000-0000-0000-000000000001', 'Block 3 — Presentations (Slides)', 'Communicate ideas clearly with clean slides.', 3);

INSERT INTO public.learning_block_courses (block_id, course_id, order_index) VALUES
  ('f5000000-0000-0000-0000-000000000011', 'd1000000-0000-0000-0000-000000000001', 1),
  ('f5000000-0000-0000-0000-000000000012', 'd1000000-0000-0000-0000-000000000002', 1),
  ('f5000000-0000-0000-0000-000000000013', 'd1000000-0000-0000-0000-000000000003', 1);

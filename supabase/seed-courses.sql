-- ============================================================
-- Seed: Spring Up LMS — Full Curriculum
-- Practical & contextual for the Senior Correctional Centre
-- Run in Supabase SQL Editor AFTER schema.sql and storage.sql
-- ============================================================

-- ── Preflight: ensure course_category enum + column exist ────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'course_category' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.course_category AS ENUM ('Word', 'Excel', 'Slides', 'Other');
    RAISE NOTICE 'Created enum public.course_category';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'courses'
      AND column_name  = 'category'
  ) THEN
    ALTER TABLE public.courses
      ADD COLUMN category public.course_category NOT NULL DEFAULT 'Other';
    RAISE NOTICE 'Added column courses.category';
  END IF;
END $$;

-- Extend enum safely for new categories
ALTER TYPE public.course_category ADD VALUE IF NOT EXISTS 'Canva';
ALTER TYPE public.course_category ADD VALUE IF NOT EXISTS 'Prompt';

-- ── Cleanup: wipe lessons for all seeded courses ─────────────
DELETE FROM public.lessons WHERE course_id IN (
  'c0dec001-face-4ade-babe-deadbeef0001',
  'c0dec002-face-4ade-babe-deadbeef0002',
  'c0dec003-face-4ade-babe-deadbeef0003',
  'c0dec201-cafe-4ade-babe-deadbeef0201',
  'c0dec202-cafe-4ade-babe-deadbeef0202',
  'c0dec203-cafe-4ade-babe-deadbeef0203',
  'c0dec301-cafe-4ade-babe-deadbeef0301',
  'c0dec401-cafe-4ade-babe-deadbeef0401'
);

-- ══════════════════════════════════════════════════════════════
-- DIGITAL LITERACY
-- ══════════════════════════════════════════════════════════════
INSERT INTO public.courses (id, title, pillar, category, description) VALUES
  ('c0dec001-face-4ade-babe-deadbeef0001',
   'Microsoft Word Proficiency',
   'Digital Literacy', 'Word',
   'Create professional documents — letters, CVs, reports and personal statements — using Microsoft Word.'),
  ('c0dec002-face-4ade-babe-deadbeef0002',
   'Microsoft Excel Fundamentals',
   'Digital Literacy', 'Excel',
   'Build real spreadsheets: rosters, budgets, security dashboards and data reports.'),
  ('c0dec003-face-4ade-babe-deadbeef0003',
   'Presentation Slides (PowerPoint & Google Slides)',
   'Digital Literacy', 'Slides',
   'Design clear, confident slide decks that tell your story and communicate your ideas.')
ON CONFLICT (id) DO UPDATE
  SET title       = EXCLUDED.title,
      description = EXCLUDED.description;

-- ── Microsoft Word (5 lessons) ───────────────────────────────
INSERT INTO public.lessons (course_id, title, content, order_index) VALUES

('c0dec001-face-4ade-babe-deadbeef0001',
 'Getting Started with Microsoft Word',
'# Getting Started with Microsoft Word

@youtube:S-nHYzK-BVg

Welcome. Word is the most widely used document tool in every office, school and government department in Ghana. Knowing it opens doors.

## What You Will Learn
- Opening Word and creating a blank document
- The Ribbon: Home, Insert, Layout tabs
- Typing, selecting, copying and deleting text
- Saving your file with a clear name

## Key Habits from Day 1
- **Save often** — Ctrl + S every few minutes
- **Name files clearly** — `John-Word-Lesson1.docx` not `Document1`
- **One document, one purpose** — do not mix personal and formal writing

## Quick Practice (10 minutes)
1. Open Word and create a new blank document
2. Type your full name, date of birth, and home region
3. Save it as `my-profile.docx` in your Spring Up folder

## Task (Submit)
> Open Microsoft Word. Create a document with:
> - Your full name as a heading
> - Three sentences about yourself
> - Today''s date at the bottom
>
> Save as `word-lesson1.docx` and upload.', 1),

('c0dec001-face-4ade-babe-deadbeef0001',
 'Formatting: Making Documents Look Professional',
'# Formatting: Making Documents Look Professional

## Why Formatting Matters
A well-formatted document says: *this person is serious.* An employer, an officer, or a community leader will read your document more carefully if it looks clean.

## Key Skills
- **Bold, Italic, Underline** — emphasis tools, not decoration
- **Font size** — 11pt or 12pt for body; 14–16pt for headings
- **Line spacing** — 1.15 or 1.5 for readability
- **Alignment** — justify body text, centre titles only
- **Heading Styles** — use Heading 1 and Heading 2 instead of manually changing fonts

## The Golden Rules
1. No more than **2 fonts** in one document
2. Keep colours **black or dark grey** for body text
3. Consistent spacing throughout — do not mix random gaps

## Guided Practice (15 minutes)
1. Open your `my-profile.docx` from Lesson 1
2. Apply **Heading 1** style to your name
3. Set body text to 12pt, 1.5 spacing, justify alignment
4. Add a footer with your name (Insert → Footer)

## Task (Submit)
> Create a one-page document titled **"Who I Am"**.
> Write 3 paragraphs:
> 1. Where I am from and my background
> 2. Something I am proud of
> 3. What I want to achieve in the next 12 months
>
> Apply: Heading 1 title · 12pt body · 1.5 spacing · justified text
>
> Save as `word-formatting.docx` and upload.', 2),

('c0dec001-face-4ade-babe-deadbeef0001',
 'Writing Your Personal Statement',
'# Writing Your Personal Statement

## What is a Personal Statement?
A personal statement is a short, honest account of who you are — your background, your growth, and your goals. It is used in job applications, further education, volunteer programmes and community roles.

## Structure (1 page)
1. **Introduction** — Who you are and where you come from
2. **Your journey** — What experiences have shaped you (be honest, be positive)
3. **Skills and strengths** — What you are good at or have learned
4. **Your goal** — What you want to do after Spring Up / after your time here

## Tips for Writing Well
- Write in the **first person** ("I am..." not "He is...")
- Avoid excuses — focus on growth and responsibility
- Be specific — "I completed Microsoft Word training" is stronger than "I studied IT"
- Keep it **under 350 words**

## Word Skills You Will Use
- Paragraph spacing and margins (Layout tab)
- Spell Check (Review → Spelling & Grammar)
- Word Count (Review → Word Count)
- Headers/footers for your name

## Task (Submit)
> Write your personal statement (250–350 words) in Word.
>
> Include all four sections: Introduction · Your Journey · Skills · Goal
>
> Run spell check before submitting.
> Save as `personal-statement.docx` and upload.', 3),

('c0dec001-face-4ade-babe-deadbeef0001',
 'Writing a Professional Letter',
'# Writing a Professional Letter

## When You Will Use This
- Applying for a job, apprenticeship, or training programme
- Requesting a reference or recommendation
- Writing to a community organisation, employer, or institution
- Any formal communication where email is not appropriate

## Standard Letter Format
```
Your Name
Your Address / Programme Name
Date

Recipient Name
Organisation
Address

Subject: [One clear line]

Dear Mr/Ms [Last Name],

Paragraph 1 — Why you are writing
Paragraph 2 — Your background/what you offer
Paragraph 3 — What you are requesting / next steps

Yours sincerely,
[Your Name]
```

## Common Mistakes to Avoid
- Starting with "To Whom It May Concern" when you know the name
- Writing more than 1 page
- Using casual language ("gonna", "wanna", abbreviations)
- Forgetting a clear subject line

## Guided Practice
Write a letter to a fictional employer requesting a job shadow opportunity at their company.

## Task (Submit)
> Write a formal letter (max 1 page) to:
> **The Manager, Springup Digital Ventures, Accra**
>
> Request an opportunity to join their team as an intern or junior assistant.
> Mention two digital skills you have learned at Spring Up.
>
> Format correctly. Save as `professional-letter.docx` and upload.', 4),

('c0dec001-face-4ade-babe-deadbeef0001',
 'Building Your CV',
'# Building Your CV

## What is a CV?
A CV (Curriculum Vitae) is a document that lists your skills, education, experience and personal details. Every job application needs one. A strong CV gives you a real advantage.

## CV Sections (One Page for Starters)
1. **Personal Details** — Name, phone, email, city
2. **Personal Statement** — 3–4 lines (use what you wrote in Lesson 3)
3. **Education** — School name, years attended, certificate or qualification
4. **Skills** — List 5–8 specific skills (include digital skills from Spring Up)
5. **Experience / Activities** — Any work, volunteering, or notable activities
6. **References** — "Available on request"

## Word Skills You Will Use
- Tables (to create a clean two-column layout)
- Borders (to separate sections)
- Consistent Heading Styles
- Margins: set to 1.5cm on each side for more space

## A CV Is a Living Document
Update it every 3–6 months. Add new skills, training, and experiences as they happen.

## Task (Submit)
> Build your first complete CV in Word.
>
> Must include: Personal Details · Personal Statement · Education · Skills (min 5) · References line
>
> Aim for one clean, formatted page.
> Save as `my-cv.docx` and upload.
>
> This is one of the most important documents you will ever create — take it seriously.', 5);


-- ── Microsoft Excel (5 lessons) ──────────────────────────────
INSERT INTO public.lessons (course_id, title, content, order_index) VALUES

('c0dec002-face-4ade-babe-deadbeef0002',
 'Dormitory Roster Setup (Assignment 1)',
'# Dormitory Roster Setup (Assignment 1)

Build a 103-inmate dorm roster that an officer can review quickly.

@youtube:G93P4DxryVE

## Key Concepts
- Sheet anatomy: tabs, rows, columns, and cells
- Freeze Panes so headers stay visible when you scroll
- Master titles using merged cells
- Enable filters so officers can sort quickly (Data > Filter)
- Consistent formatting: borders, colours, alignment, and readable font sizes
- Use Data Validation dropdowns so `Dorm` and `Offence` values stay consistent
- Whole-row visibility for high-risk offences (e.g. Assault)

## Required Workbook Structure
- Sheet name 1: `Master Roster`
- Create lookup tabs:
  - `Dorm Lookup`
  - `Offence Lookup`

## Task
> Create the `Master Roster` sheet for 103 inmates.
>
> Checklist:
> 1. **Workbook setup** — Name file `Assignment1_MasterRoster.xlsx`
> 2. **Required columns** (row 1 as headers): Inmate ID · Full Name · Dorm · Offence · Intake Date · Discharge Date · Notes
> 3. **Fill 103 rows** — each inmate has a valid Dorm (Dorm 1–8) and Offence value
> 4. **Freeze Panes** — freeze row 1 and column 1
> 5. **Master title** — merge cells above headers: `Senior Correction Centre — Master Roster`
> 6. **Visual clarity** — borders on all data cells; alternate dorm groups with light grey fills
> 7. **Assault highlight** — entire row highlighted red when Offence = Assault
> 8. **Capacity check** — COUNTIF per dorm, confirm no dorm exceeds 18
>
> Save and upload `Assignment1_MasterRoster.xlsx`', 1),

('c0dec002-face-4ade-babe-deadbeef0002',
 'Security Audit & Days to Release (Assignment 2)',
'# Security Audit & Days to Release (Assignment 2)

Update the roster so officers can identify who needs action first.

@youtube:G93P4DxryVE

## Key Concepts
- Date formulas using `TODAY()`
- Calculated helper column: Days to Release
- Priority labels using `IF` / `IFS` logic
- Conditional formatting for urgent and overdue cases

## Task
> Start with your Assignment 1 workbook.
>
> 1. **Add `Days to Release` column** — formula: `= Discharge Date − TODAY()`
> 2. **Add `Priority` column** using IFS:
>    - `Overdue` if Days to Release < 0
>    - `Urgent` if Days to Release ≤ 30
>    - `Normal` otherwise
> 3. **Conditional formatting**:
>    - Red fill for Overdue rows
>    - Orange fill for Urgent rows
> 4. **Dorm Capacity helper table** — COUNTIF per dorm, flag any dorm above 18
> 5. **Top 5 Release table** — smallest Days to Release: Inmate ID · Name · Dorm · Days to Release · Discharge Date
>
> Save as `Assignment2_SecurityAudit.xlsx` and upload.
>
> Grading: correct TODAY() formula · conditional formatting visible · Top 5 matches sorted order', 2),

('c0dec002-face-4ade-babe-deadbeef0002',
 'Visual Reporting Dashboard (Assignment 3)',
'# Visual Reporting Dashboard (Assignment 3)

Create charts and a dashboard that summarises the dorm at a glance.

@youtube:G93P4DxryVE

## Key Concepts
- COUNTIF to build summary tables from raw data
- Bar and pie charts with clear labels
- An officer-facing KPI dashboard
- Using cell references to pull live values into a dashboard

## Task
> Start from Assignment 2.
>
> 1. **Dorm Summary tab** — table: Dorm · Inmate Count (using COUNTIF)
> 2. **Chart** — bar or pie chart titled `Inmate Distribution by Dorm` with readable labels
> 3. **Officer Dashboard tab** — KPI boxes showing:
>    - Total inmates
>    - Urgent cases (Priority = Urgent)
>    - Overdue cases (Priority = Overdue)
>    - Overcrowding flag (any dorm > 18?)
> 4. **Presenter note** — 1 paragraph explaining what the dashboard shows and what action to take first
>
> Save as `Assignment3_VisualReporting.xlsx` and upload.
> Optional: export dashboard as `Assignment3_Dashboard.pdf`', 3),

('c0dec002-face-4ade-babe-deadbeef0002',
 'Personal Finance Tracker',
'# Personal Finance Tracker

## Why This Matters
When you leave the programme, managing money well is one of the most important practical skills you will have. Many people struggle financially not because they earn too little — but because they do not track what they spend.

## What You Will Build
A personal monthly budget tracker with:
- Income sources
- Fixed expenses (rent, transport, phone)
- Variable expenses (food, clothing, social)
- Savings target
- Auto-calculated balance

## Key Excel Skills
- SUM formulas
- Subtraction formulas (Income − Expenses = Balance)
- Conditional formatting to highlight negative balance in red
- Simple bar chart for "Where My Money Goes"

## Template Structure
| Category | Planned (GHS) | Actual (GHS) | Difference |
|---|---|---|---|
| Income |  |  |  |
| Rent |  |  |  |
| Transport |  |  |  |
| Food |  |  |  |
| Phone data |  |  |  |
| Savings goal |  |  |  |

## Task (Submit)
> Build a monthly budget tracker for 6 months after release (estimate realistic figures).
>
> Include: at least 6 expense categories · SUM formula for totals · Difference column (Planned − Actual) · Red highlight for negative balance
>
> Add a bar chart: `My Monthly Budget Plan`
>
> Save as `finance-tracker.xlsx` and upload.', 4),

('c0dec002-face-4ade-babe-deadbeef0002',
 'Job Search Planner',
'# Job Search Planner

## The Reality of Job Searching
Finding a job takes time and organisation. People who track their applications and follow up consistently are far more likely to succeed than those who apply randomly.

## What You Will Build
A job search tracker spreadsheet:
- Companies you want to apply to
- Application status (Not Applied / Sent / Interview / Rejected / Offer)
- Contact name and contact date
- Follow-up reminders
- Notes column

## Key Excel Skills
- Data Validation dropdown for Status column
- Colour-coding by status (conditional formatting)
- COUNTIF to track how many applications are in each status
- Auto-sort by date

## Task (Submit)
> Build a job search tracker for 15 target employers in Ghana.
>
> Include: Company · Role · Contact Person · Date Applied · Status (dropdown) · Follow-up Date · Notes
>
> Use conditional formatting:
> - Green for Offer
> - Orange for Interview
> - Grey for Rejected
>
> Add a summary COUNTIF table showing totals per status.
>
> Save as `job-search-tracker.xlsx` and upload.', 5);


-- ── Presentation Slides (5 lessons) ─────────────────────────
INSERT INTO public.lessons (course_id, title, content, order_index) VALUES

('c0dec003-face-4ade-babe-deadbeef0003',
 'Your First Presentation',
'# Your First Presentation

## Outcome
Create a new presentation, understand slide basics, and save your work.

## PowerPoint vs Google Slides
- **PowerPoint** — installed on your computer, works offline
- **Google Slides** — in your browser, auto-saves to Google Drive

Both use the same design principles. Choose the one available to you.

## Key Terms
- Slide, thumbnail, layout, placeholder, notes panel
- Normal view vs Slide Show view

## Task (Submit)
> Create a title slide presentation:
> - Title: **Project Spring Up**
> - Subtitle: Your name · Today''s date · Cohort name
>
> Export to PDF. Upload the PDF file.', 1),

('c0dec003-face-4ade-babe-deadbeef0003',
 'Design Rules That Actually Work',
'# Design Rules That Actually Work

## The Problem with Most Slides
Most people put too much text on slides and then read the text aloud. This is not a presentation — it is a reading exercise. Your slides support your voice; they are not your script.

## The Core Rules
1. **One idea per slide** — if you have 3 points, use 3 slides
2. **Max 6 words per bullet** — your audience will read it and stop listening
3. **Big text** — minimum 24pt; anything smaller gets ignored
4. **White space is your friend** — empty space makes content stand out
5. **Consistent colour scheme** — pick 2–3 colours and stick to them
6. **Fonts** — max 2 fonts; one for headings, one for body

## Colour and Contrast
- Dark background + light text = powerful for talks
- Light background + dark text = cleaner for reading/printing
- Never use red text on green background (hard to read)

## Task (Submit)
> Create a 5-slide presentation about yourself:
> 1. Title slide: your name and a tagline
> 2. Where I am from
> 3. What I have learned at Spring Up
> 4. My goal for the next year
> 5. Thank you / closing
>
> Apply the design rules: max 6 words per bullet · consistent colours · 24pt+ text
>
> Export to PDF and upload.', 2),

('c0dec003-face-4ade-babe-deadbeef0003',
 'Using Images and Icons Cleanly',
'# Using Images and Icons Cleanly

## Images Make Slides Human
A slide with one strong image and five words is more memorable than a slide with fifteen bullet points.

## Where to Get Free Images
- **Unsplash.com** — high-quality photos, free to use
- **Pexels.com** — similar to Unsplash
- **Flaticon.com** — icons in consistent styles
- PowerPoint / Google Slides have built-in image search (Insert → Image)

## Rules for Images
- Never stretch an image out of proportion (hold Shift when resizing)
- Crop to fit; do not leave white edges
- Use images that relate to your message
- One image per slide is usually enough

## Icons
- Use icons from a single pack — they should all match in style
- Icons work best as bullet replacements (icon + short label)

## Task (Submit)
> Update your 5-slide personal deck from Lesson 2:
> - Add at least 1 relevant image (not stretched)
> - Replace at least 2 bullet points with icons + short labels
> - Ensure all images are properly cropped and aligned
>
> Export to PDF and upload.', 3),

('c0dec003-face-4ade-babe-deadbeef0003',
 'My Second Chance — A Storytelling Deck',
'# My Second Chance — A Storytelling Deck

## Why Storytelling Matters
Facts tell. Stories sell. The most powerful presentations connect emotionally before they present any data or argument. Your personal story is your greatest asset.

## The Story Arc
Great stories follow this pattern:
1. **Context** — who I was, where I was
2. **Challenge** — what happened / what went wrong
3. **Turning point** — the moment something shifted
4. **Growth** — what I learned, what I did differently
5. **Vision** — who I am becoming

This is true for heroes in films. It is also true for the most compelling job interviews, community speeches, and personal statements.

## Task (Submit)
> Create a 6-slide presentation titled **"My Second Chance"**:
>
> Slide 1: Title — Your name and a strong opening image
> Slide 2: Where I started — background and context
> Slide 3: The turning point — an honest, reflective moment
> Slide 4: What I have built — skills, growth, progress at Spring Up
> Slide 5: My plan — specific, realistic next steps
> Slide 6: Closing — a single powerful line about who you are becoming
>
> This is your story. Be honest. Be proud. Be specific.
>
> Export to PDF and upload.', 4),

('c0dec003-face-4ade-babe-deadbeef0003',
 'Final Project: 3-Minute Talk',
'# Final Project: 3-Minute Talk

## The Challenge
You have 3 minutes. 8 slides maximum. One clear message. Present confidently.

## Preparation Tips
- **Know your slides** — do not read from them; the slide reminds you, your voice explains
- **Practise out loud** at least 3 times
- **Time yourself** — 3 minutes is tighter than you think
- **Start strong** — your first 15 seconds decide whether the audience pays attention
- **End clearly** — "Thank you. My name is [name]. I am ready for what is next."

## Slide Checklist
- [ ] Title slide with your name
- [ ] Clear structure (beginning / middle / end)
- [ ] Max 6 words per bullet
- [ ] Consistent colours and fonts
- [ ] At least 2 relevant images or icons
- [ ] No spelling errors (run spell check)

## Task (Submit)
> Create your final 3-minute talk deck (6–8 slides) on any of these topics:
> - What I have learned at Spring Up
> - My plan for the first 12 months after release
> - Why digital skills matter for young Ghanaians
>
> Export to PDF and upload.
>
> Bonus: record a voice-over or present live to your instructor.', 5);


-- ══════════════════════════════════════════════════════════════
-- CAREER READINESS
-- ══════════════════════════════════════════════════════════════
INSERT INTO public.courses (id, title, pillar, description) VALUES
  ('c0dec201-cafe-4ade-babe-deadbeef0201',
   'Presentation & Communication Skills',
   'Career Readiness',
   'Learn to present yourself, your ideas and your story with clarity and confidence in any professional setting.'),
  ('c0dec202-cafe-4ade-babe-deadbeef0202',
   'Prompt Engineering with AI',
   'Career Readiness',
   'Learn to use AI tools like ChatGPT to write letters, plan your career, do research and work smarter.'),
  ('c0dec203-cafe-4ade-babe-deadbeef0203',
   'Graphic Design with Canva',
   'Career Readiness',
   'Create professional graphics, CVs, posters and social media content using Canva — no prior design experience needed.')
ON CONFLICT (id) DO UPDATE
  SET title       = EXCLUDED.title,
      description = EXCLUDED.description;

-- Update categories for new courses
UPDATE public.courses SET category = 'Prompt' WHERE id = 'c0dec202-cafe-4ade-babe-deadbeef0202';
UPDATE public.courses SET category = 'Canva'  WHERE id = 'c0dec203-cafe-4ade-babe-deadbeef0203';

-- ── Presentation & Communication Skills (4 lessons) ──────────
INSERT INTO public.lessons (course_id, title, content, order_index) VALUES

('c0dec201-cafe-4ade-babe-deadbeef0201',
 'How to Present Yourself',
'# How to Present Yourself

## First Impressions Are Earned, Not Given
In a job interview, community meeting, or professional introduction, you have less than 30 seconds to make an impression. That impression is built through: how you look, how you stand, and what you say first.

## The 3-Part Introduction (The Elevator Pitch)
A strong personal introduction has three parts:
1. **Who I am** — name, background, current programme
2. **What I have done** — one or two relevant skills or achievements
3. **What I want** — what you are looking for next

## Example
> "My name is Kofi Mensah. I am completing the Spring Up Digital Skills Programme at the Senior Correctional Centre in Accra. I have trained in Microsoft Office, presentation design, and prompt engineering. I am looking for an opportunity to contribute to a team where I can grow professionally."

Practise until it sounds natural, not rehearsed.

## Body Language Rules
- Stand straight — do not slouch
- Make eye contact — look at the person, not the floor
- Firm handshake — one pump, confident
- Smile — it signals confidence, not weakness

## Task (Submit)
> Write your own 3-part personal introduction (50–80 words).
>
> Read it out loud 5 times. If possible, record yourself and listen back.
> Submit your written introduction as a Word document.', 1),

('c0dec201-cafe-4ade-babe-deadbeef0201',
 'Active Listening and Professional Conversation',
'# Active Listening and Professional Conversation

## The Most Underrated Skill
Most people think communication is about speaking well. The truth is that the best communicators are the best *listeners*.

## What Active Listening Looks Like
- You are not planning your reply while the other person is still talking
- You make eye contact and nod to show you are following
- You ask a clarifying question before you respond
- You summarise what you heard before adding your own point: "So what I understand is..."

## Professional Conversation Rules
- Do not interrupt
- Avoid filler words: "erm", "like", "you know"
- Be concise — make your point clearly in fewer words
- If you do not know something, say "I do not know, but I will find out"

## Giving and Receiving Feedback
- Feedback is a gift, even when it is uncomfortable
- When receiving: listen fully, say "thank you", do not argue immediately
- When giving: focus on behaviour, not personality — "The report was late" not "You are lazy"

## Task (Submit)
> Write a 200-word reflection:
> Describe a real conversation (or a realistic imagined one) where better listening would have changed the outcome.
>
> What would you do differently now?
> Submit as a Word document.', 2),

('c0dec201-cafe-4ade-babe-deadbeef0201',
 'Job Interview Skills',
'# Job Interview Skills

## Preparation Is Everything
Interviews feel random, but they follow predictable patterns. If you prepare for the common questions, you will perform significantly better than someone who does not.

## The Most Common Questions and How to Answer Them

**"Tell me about yourself."**
→ Use your 3-part introduction from Lesson 1. Keep it under 90 seconds.

**"What are your strengths?"**
→ Pick 2–3 real strengths. Give a brief example for each. "I am reliable — during my Spring Up training I submitted every assignment on time."

**"What is your weakness?"**
→ Be honest but forward-looking. "I used to struggle with time management, but I have been using a planner and it has made a big difference."

**"Why do you want this job?"**
→ Show you know the company. "I researched your company and I admire that you..." Keep it genuine.

**"Do you have any questions for us?"**
→ Always have 2 questions. "What does a typical day look like in this role?" / "What do successful people in this team have in common?"

## What Not to Do
- Do not lie about your background — the truth will come out
- Do not speak negatively about past employers
- Do not check your phone

## Task (Submit)
> Write out your full answers to all 5 questions above (in your own voice and situation).
>
> Then: ask a classmate, instructor, or family member to do a 5-minute mock interview with you.
> Submit your written answers as a Word document.', 3),

('c0dec201-cafe-4ade-babe-deadbeef0201',
 'Networking and Building Professional Relationships',
'# Networking and Building Professional Relationships

## What Networking Actually Is
Networking is not "using people". It is building genuine relationships over time so that when opportunities arise, people think of you — and you think of them.

## The Reality for Spring Up Students
Many of the best opportunities will not be advertised. They come through people who know you, trust you, and want to help you succeed. This makes relationships the most valuable career asset you can build.

## How to Start Networking (Even from Here)
1. **Stay connected with every instructor and facilitator** — these are your first professional references
2. **Be curious about others** — ask what they do, what they enjoy, what challenges they face
3. **Follow up** — if someone gives you advice or their contact, follow up within 48 hours
4. **LinkedIn** — create a profile when you have phone or laptop access. It is the professional world''s social platform
5. **Add value** — share interesting articles, congratulate people, offer help without expecting anything back

## A Note on Reputation
Your reputation is built by what you do consistently — not in one conversation. People remember:
- Did you show up on time?
- Did you keep your promises?
- Were you respectful even when things were hard?

## Task (Submit)
> Write a list of 10 people you want to stay in contact with after completing Spring Up (instructors, facilitators, classmates, community members).
>
> For each person: write their name, why the relationship matters, and one way you will stay in touch.
>
> Submit as a Word or Excel document.', 4);


-- ── Prompt Engineering with AI (5 lessons) ───────────────────
INSERT INTO public.lessons (course_id, title, content, order_index) VALUES

('c0dec202-cafe-4ade-babe-deadbeef0202',
 'What Is AI? Understanding ChatGPT and AI Tools',
'# What Is AI? Understanding ChatGPT and AI Tools

## Artificial Intelligence Is Already Everywhere
When your phone autocompletes a sentence, that is AI. When a bank flags a suspicious transaction, that is AI. When you type a question into Google and it gives you a direct answer, that is AI. The world is changing fast — and understanding these tools gives you a real advantage.

## What Is ChatGPT?
ChatGPT is an AI assistant made by a company called OpenAI. You type a message (called a **prompt**), and it gives you a written response. It can:
- Write letters, essays, and documents
- Explain difficult topics in simple language
- Help you brainstorm ideas
- Answer questions like a knowledgeable assistant

## Other AI Tools You Should Know
| Tool | What It Does |
|---|---|
| ChatGPT (OpenAI) | General text, writing, research |
| Google Gemini | Integrated with Google apps |
| Canva AI | Design assistance |
| Grammarly | Grammar and writing improvement |
| Microsoft Copilot | Built into Word, Excel, PowerPoint |

## What AI Cannot Do
- It cannot replace your judgment and experience
- It can make mistakes — always verify important facts
- It does not know what happened recently (unless it has web access)
- It cannot feel, empathise, or make ethical decisions for you

## Task (Submit)
> Write a 150-word reflection answering:
> 1. What is one thing AI could help you do that would save you time?
> 2. What is one thing AI should NOT decide for you, and why?
>
> Submit as a Word document.', 1),

('c0dec202-cafe-4ade-babe-deadbeef0202',
 'Writing Effective Prompts — The Basics',
'# Writing Effective Prompts — The Basics

## What Is a Prompt?
A prompt is the instruction or question you give to an AI. The quality of what you get back depends almost entirely on the quality of what you put in.

## The Problem with Weak Prompts
**Weak prompt:** "Write me a letter"
**Result:** A generic, useless letter

**Strong prompt:** "Write a formal job application letter from Kofi Mensah, a 24-year-old completing a digital skills programme in Accra, applying for a junior data entry role at ABC Logistics. The tone should be professional and confident. The letter should be one page."
**Result:** A useful, specific, ready-to-edit letter

## The 4-Part Prompt Formula
1. **Role** — tell the AI who it is: "You are a professional career advisor..."
2. **Task** — what exactly you want: "Write a formal letter that..."
3. **Context** — background information: "The applicant is... The company is..."
4. **Format** — how you want the output: "One page, formal letter format, no bullet points"

## Prompt Examples for SCC Students
- "Write a 3-paragraph personal statement for a young man completing a digital skills programme and applying for his first job. Tone: honest, forward-looking, professional."
- "Explain what Microsoft Excel COUNTIF formula does. Use simple language and one practical example."
- "Give me 5 tips for preparing for a job interview as a first-time job seeker in Accra, Ghana."

## Task (Submit)
> Write 5 prompts using the 4-part formula for the following tasks:
> 1. A formal letter requesting a job shadow
> 2. An explanation of what prompt engineering is (for someone who has never heard of it)
> 3. A personal introduction for a LinkedIn profile
> 4. Advice on managing money for the first time
> 5. A motivational message for a friend starting a new job
>
> Submit as a Word document.', 2),

('c0dec202-cafe-4ade-babe-deadbeef0202',
 'Using AI to Write Professional Letters and Emails',
'# Using AI to Write Professional Letters and Emails

## AI as Your Writing Partner
Writing formal letters and emails is a skill many people struggle with. AI can help you produce a strong first draft quickly — and then you edit and personalise it. This is called **human + AI collaboration** and it is how the best professionals work.

## The Process
1. Write your prompt (using the 4-part formula)
2. Review the AI output — does it say what you need?
3. Edit for accuracy — add your real name, real details, real dates
4. Check the tone — is it too formal? Too casual?
5. Proofread — AI makes spelling and grammar errors too

## Common Letters and Emails You Can Draft with AI
- Job application letters
- Follow-up emails after an interview
- Request for a reference or recommendation
- Thank-you notes after being helped
- Complaint or concern letters (professional, not aggressive)
- Email to an employer asking about an opportunity

## Important Warning
Never submit an AI letter without reading every word and making it your own.
Employers and organisations can often tell when a letter is generic. Add your specific story, specific skills, and specific reasons.

## Task (Submit)
> Use AI (ChatGPT, Gemini, or Copilot) to draft the following two letters:
>
> **Letter 1:** A job application letter for a junior ICT assistant role at a company in Accra
> **Letter 2:** A thank-you email to your Spring Up instructor at the end of the programme
>
> For each letter:
> - Show the prompt you used
> - Show the AI output (copy and paste)
> - Show your edited final version
>
> Submit all three versions per letter as a Word document.', 3),

('c0dec202-cafe-4ade-babe-deadbeef0202',
 'Using AI to Plan Your Career and Set Goals',
'# Using AI to Plan Your Career and Set Goals

## AI as a Career Advisor
One of the most useful things you can do with AI is have a planning conversation. You can tell it your skills, your situation, and your goals — and ask it to help you think through your options.

## What You Can Ask AI to Help With
- "What jobs can I apply for with Microsoft Office skills in Ghana?"
- "What are the steps to become a data entry specialist?"
- "Give me a 3-month action plan for someone leaving the Spring Up programme and looking for their first job."
- "What additional skills should I learn after mastering Microsoft Word and Excel?"
- "What are 5 small businesses a young person can start with digital skills in Ghana?"

## SMART Goals Framework
AI can help you write SMART goals:
- **S**pecific — clear and defined
- **M**easurable — you know when you have achieved it
- **A**chievable — realistic given your situation
- **R**elevant — it actually matters to your future
- **T**ime-bound — has a deadline

**Example:** "Get a junior data entry job at a company in Accra within 4 months of completing Spring Up" is a SMART goal. "Get a good job" is not.

## Task (Submit)
> Use AI to help you write a **12-Month Career Plan** with the following sections:
> 1. My skills today (list 5–8 real skills from Spring Up)
> 2. My target role/career path (be specific)
> 3. Skills I need to develop (ask AI what gaps exist)
> 4. 3 SMART goals for the next 12 months
> 5. Action steps for the first 30 days after completing Spring Up
>
> Show the prompts you used. Submit the final plan as a Word document (1–2 pages).', 4),

('c0dec202-cafe-4ade-babe-deadbeef0202',
 'Responsible AI — Ethics, Accuracy and Caution',
'# Responsible AI — Ethics, Accuracy and Caution

## AI Is a Tool, Not the Truth
AI generates text based on patterns in data it was trained on. It does not know the truth. It does not check facts. It does not feel responsible for getting things wrong. You do.

## When AI Gets Things Wrong (Hallucinations)
AI tools sometimes confidently state false information. This is called a **hallucination**. Examples:
- Inventing a company that does not exist
- Quoting a statistic that is not real
- Giving advice that is factually wrong

**Rule:** If the information matters — a fact, a law, a medical or legal question — always verify from a reliable source.

## Ethical Use of AI
- **Do not plagiarise** — submitting AI-written work as entirely your own in school or formal exams is dishonest. In the workplace, transparent AI collaboration is fine.
- **Privacy** — do not paste personal information about others into AI tools
- **Bias** — AI reflects the biases of its training data; question outputs that generalise about groups of people
- **Dependence** — use AI to grow your skills, not to avoid developing them

## AI and Fairness
Some employers, courts, and institutions now use AI in decisions about hiring, lending and justice. Understanding this technology gives you the awareness to challenge unfair decisions and advocate for yourself.

## Task (Submit)
> Write a 200-word reflection on:
> 1. One way you plan to use AI responsibly in your career
> 2. One situation where you would NOT trust AI''s output and would verify it manually
> 3. One risk of AI that you think young people in Ghana should know about
>
> Be honest and specific. Submit as a Word document.', 5);


-- ── Graphic Design with Canva (5 lessons) ────────────────────
INSERT INTO public.lessons (course_id, title, content, order_index) VALUES

('c0dec203-cafe-4ade-babe-deadbeef0203',
 'Introduction to Canva — Your Design Workspace',
'# Introduction to Canva — Your Design Workspace

## What Is Canva?
Canva is a free, web-based design tool used by millions of people around the world. You do not need to install anything. You do not need design experience. You access it at **canva.com** — on any computer with internet access.

Canva is used by:
- Small businesses making flyers and social media posts
- Job seekers designing standout CVs
- Teachers and community organisations creating posters
- Professionals making presentations and reports

Knowing Canva is a marketable skill.

## Setting Up Your Free Account
1. Go to **canva.com**
2. Click "Sign up" — use a Gmail or email address
3. Choose "Personal" for a free account
4. Explore the template library

## The Canva Interface
- **Templates** — thousands of ready-made designs you can customise
- **Elements** — shapes, icons, lines, and graphics
- **Text** — add and style your own text
- **Uploads** — use your own photos
- **Background** — colours, gradients, images

## Document Types to Know
- **A4 Presentation** — posters, CVs, reports
- **Instagram Post (1080 × 1080)** — square social media graphics
- **Business Card** — personal brand cards
- **LinkedIn Banner** — professional profile header

## Task (Submit)
> Create a free Canva account.
> Find the "Business Card" template.
> Customise it with: your name · "Spring Up Digital Programme" · your city
>
> Download as PNG or PDF. Upload the file.', 1),

('c0dec203-cafe-4ade-babe-deadbeef0203',
 'Design Foundations — Colour, Typography and Layout',
'# Design Foundations — Colour, Typography and Layout

## Why Design Principles Matter
Bad design does not just look unprofessional — it loses people''s attention before they even read your message. These principles take 20 minutes to learn and will make everything you create look significantly better.

## Colour Theory (Simplified)
- **Contrast is king** — dark text on light background (or light on dark). Never dark on dark.
- **Stick to 2–3 colours** — more than that feels chaotic
- **Colour conveys emotion** — green = growth/nature; blue = trust/calm; orange = energy; black = professional/serious
- **Use a free tool:** paletton.com or coolors.co to pick colour combinations

## Typography Rules
- **Max 2 fonts** per design — one for headings, one for body
- **Hierarchy** — headings bigger; body text smaller; labels smallest
- **Sans-serif fonts** (like Poppins, Lato, Montserrat) are clean and modern
- **Avoid decorative or handwriting fonts** for professional documents

## Layout Principles
- **Alignment** — everything should align to a grid; random placement looks messy
- **White space** — breathing room between elements; do not fill every gap
- **Proximity** — group related elements close together
- **Repetition** — use the same style (font, colour, icon size) throughout

## Task (Submit)
> Design a simple A4 poster in Canva for Spring Up Digital Programme.
>
> Include: programme name · tagline · 3 key facts (e.g. "120+ students trained") · at least 1 icon
>
> Apply: clear colour contrast · max 2 fonts · consistent alignment · white space
>
> Download as PDF. Upload the file.', 2),

('c0dec203-cafe-4ade-babe-deadbeef0203',
 'Build Your CV in Canva',
'# Build Your CV in Canva

## Why a Canva CV Stands Out
A well-designed CV in Canva does not just list your information — it communicates that you understand presentation, you are detail-oriented, and you take your career seriously. In a stack of plain Word CVs, a clean Canva design gets noticed.

## Finding the Right Template
1. In Canva, search: **CV** or **Resume**
2. Choose a clean, professional template — avoid very colourful or ornate designs for formal job applications
3. One column is simpler; two-column layouts look modern

## What Your CV Must Include
- **Photo** (optional but common in Ghana)
- **Name + contact details** (phone, email, city)
- **Personal statement** (3–4 lines — use what you wrote in Word Lesson 3)
- **Education** (school, year, certificate)
- **Skills** (list your Spring Up digital skills + soft skills)
- **Experience / Activities** (any work, volunteering, programme participation)
- **References** — "Available on request"

## Design Tips for a Professional CV
- Use a header section in your primary colour for your name
- Keep font sizes: Name (22–28pt), Section headings (12–14pt), Body (10–11pt)
- Never go to page 2 unless you have 5+ years experience
- Download as PDF — it preserves the layout across all devices

## Task (Submit)
> Build your complete CV in Canva using a professional template.
>
> Must include all 7 sections listed above.
> Apply clean typography, consistent colours, and correct spacing.
>
> Download as PDF. Upload the file.
>
> This CV can go directly into a real job application — make it count.', 3),

('c0dec203-cafe-4ade-babe-deadbeef0203',
 'Creating Posters, Flyers and Social Media Graphics',
'# Creating Posters, Flyers and Social Media Graphics

## Visual Communication Is a Skill Employers Want
Companies, community organisations, churches, schools, market vendors and NGOs all need people who can make clear, attractive visual content quickly. This is a real, marketable skill in Ghana''s growing digital economy.

## Types of Graphics You Will Learn to Make
- **Event poster** (A4 or A3)
- **Information flyer** (A5 — half of A4)
- **Social media post** (Instagram 1080×1080 square)
- **WhatsApp group banner**

## The Poster Design Process
1. **Define the purpose** — what action do you want people to take?
2. **Choose a template** or start from scratch
3. **Add your headline** — large, clear, one idea
4. **Add essential details** — date, time, place, contact
5. **Use a strong image or graphic**
6. **Check contrast** — can it be read from across a room?
7. **Download and share**

## Common Mistakes
- Too much text — if someone needs 30 seconds to read it, they will not read it
- Low-contrast colour combinations
- Stretched or blurry images
- Missing key information (date? contact? location?)

## Task (Submit)
> Design TWO pieces of content in Canva:
>
> **1. Event poster** (A4):
> Create a poster for a fictional Spring Up graduation ceremony — include: date, venue, programme name, key message
>
> **2. Social media post** (1080×1080):
> Create an Instagram-style post promoting one skill you learned at Spring Up
>
> Download both as PNG or PDF. Upload both files.', 4),

('c0dec203-cafe-4ade-babe-deadbeef0203',
 'Final Project — Your Personal Brand Card',
'# Final Project — Your Personal Brand Card

## What Is Personal Branding?
Your personal brand is how you present yourself to the world professionally — your name, your skills, your values, and how you want to be known. In a competitive job market, people who manage their brand clearly stand out.

## What You Will Create Today
A **Personal Brand Card** — a polished, professional one-page document in Canva that represents you. Think of it as a digital business card + introduction page combined.

## What the Card Should Include
- Your **name** (large, prominent)
- A short **tagline** — one line that captures what you bring: e.g. *"Digital Skills Graduate | Reliable | Ready to Contribute"*
- Your **top 5 skills** (from Spring Up and beyond)
- A **photo** (if available — keep it professional)
- Contact details (phone / email)
- A brief **statement** (2–3 lines from your personal statement)
- The **Spring Up logo** or programme name (as a credential)

## Design Requirements
- Use Canva''s Business Card or A4 Portrait template
- Consistent 2–3 colour brand
- Max 2 fonts
- Clean layout with clear hierarchy
- No spelling errors

## Task (Submit)
> Build your complete Personal Brand Card in Canva.
>
> This is your final project for this course — treat it as a real professional document.
> Download as PDF or PNG. Upload the file.
>
> Congratulations on completing Graphic Design with Canva. You now have skills that most people around you do not have. Use them.', 5);


-- ══════════════════════════════════════════════════════════════
-- LIFE SKILLS & VALUES
-- ══════════════════════════════════════════════════════════════
INSERT INTO public.courses (id, title, pillar, description) VALUES
  ('c0dec301-cafe-4ade-babe-deadbeef0301',
   'Life Skills for Reintegration',
   'Life Skills',
   'Practical life skills for independence: managing money, understanding your rights, setting goals, and building a stable, dignified future.')
ON CONFLICT (id) DO UPDATE
  SET title       = EXCLUDED.title,
      description = EXCLUDED.description;

INSERT INTO public.lessons (course_id, title, content, order_index) VALUES

('c0dec301-cafe-4ade-babe-deadbeef0301',
 'Goal Setting and Personal Planning',
'# Goal Setting and Personal Planning

## Why Planning Matters
People who write down their goals are significantly more likely to achieve them than those who keep them in their heads. Planning is not about being rigid — it is about being intentional.

## The Difference Between a Wish and a Goal
- **Wish:** "I want to be successful"
- **Goal:** "I will secure a junior data entry job in Accra within 4 months of completing Spring Up by applying to 3 companies per week and following up on every application"

## 90-Day Action Plan
After any major transition (finishing a programme, leaving a role, starting fresh), a 90-day plan helps you stay focused:

**Days 1–30: Settle and establish**
- Update CV and personal statement
- Reconnect with key contacts
- Set up basic tools (email, LinkedIn, phone)

**Days 31–60: Build momentum**
- Apply actively for opportunities
- Attend networking events or community meetings
- Continue learning a new skill

**Days 61–90: Review and adjust**
- What is working? What is not?
- Adjust your approach based on results
- Set your next 90-day plan

## Task (Submit)
> Write your personal 90-Day Plan for after completing Spring Up.
>
> Include concrete actions for each 30-day block.
> Be specific: numbers, names, dates.
>
> Submit as a Word document (1 page).', 1),

('c0dec301-cafe-4ade-babe-deadbeef0301',
 'Financial Literacy — Managing Money Wisely',
'# Financial Literacy — Managing Money Wisely

## The Truth About Money Management
Most people in financial difficulty are not there because they earn too little — they are there because they do not have a plan for their money. A budget is not a restriction. It is a map.

## Income vs Expenses
**Income:** Money that comes in (salary, freelance work, business)
**Expenses:** Money that goes out (rent, food, transport, phone, loans)
**Savings:** The gap between income and expenses — this is wealth

The simple rule: **spend less than you earn, and save the difference.**

## The 50/30/20 Rule
A simple framework for managing any income:
- **50%** — Needs (rent, food, transport, utilities)
- **30%** — Wants (clothing, entertainment, socialising)
- **20%** — Savings and debt repayment

## Practical Tips
- Open a savings account the day you have regular income
- Avoid borrowing money for wants (food is a need; new shoes are a want)
- Mobile money (MTN MoMo, AirtelTigo) is useful — but track every transaction
- Small daily expenses add up fast — track them for one week and you will be surprised

## Understanding Mobile Money in Ghana
- MTN Mobile Money (MoMo) and AirtelTigo Money are widely used
- You can receive salary payments, pay bills, and send money
- Always keep your PIN private and do not share your account details

## Task (Submit)
> Using the Excel finance tracker from the Digital Literacy course, or a simple Word table, create a realistic monthly budget for your first 3 months after completing Spring Up.
>
> Apply the 50/30/20 rule. Identify one area where you can reduce spending and increase savings.
>
> Submit as a Word or Excel document.', 2),

('c0dec301-cafe-4ade-babe-deadbeef0301',
 'Understanding Your Rights and Responsibilities',
'# Understanding Your Rights and Responsibilities

## Why This Matters
Knowing your rights as a worker, citizen and community member protects you. Many people are taken advantage of simply because they do not know what they are entitled to.

## Employment Rights in Ghana
Under Ghana''s Labour Act (Act 651, 2003):
- Every worker has the right to a **written contract** of employment
- You are entitled to a **minimum wage** — check the current figure from the National Labour Commission
- You are entitled to **annual leave** (a minimum of 15 working days per year)
- **Discrimination** at work based on background, religion or ethnicity is illegal
- If you are dismissed unfairly, you have the right to **lodge a complaint**

## The Right to Dignity
Every person — regardless of their past — has the right to be treated with dignity. If an employer, officer, or institution treats you disrespectfully or illegally, you have the right to:
- Ask for the behaviour to stop
- Document what happened (dates, names, what was said)
- Seek advice from a community legal aid organisation or the National Labour Commission

## Your Responsibilities as a Worker
Rights come with responsibilities:
- Complete your work honestly and on time
- Respect workplace rules and colleagues
- Communicate proactively if you have a problem
- Do not steal, lie, or damage property

## Task (Submit)
> Write a 200-word reflection:
> 1. One right you did not know you had before this lesson
> 2. One responsibility you commit to taking seriously in your next role
>
> Submit as a Word document.', 3),

('c0dec301-cafe-4ade-babe-deadbeef0301',
 'Emotional Resilience and Handling Setbacks',
'# Emotional Resilience and Handling Setbacks

## Setbacks Are Normal — Failure to Learn from Them Is Not
Every person who has built something meaningful has experienced rejection, failure, and disappointment. What separates people who succeed from people who do not is not talent — it is how they respond to setbacks.

## What Is Resilience?
Resilience is the ability to recover from difficulty, adapt to change, and keep moving forward. It is not about being emotionless or pretending things do not hurt. It is about choosing your response.

## The ABCDE Model for Setbacks
- **A — Adversity:** What actually happened (be factual)
- **B — Belief:** What you told yourself about it
- **C — Consequence:** How that belief made you feel and act
- **D — Disputation:** Challenge that belief — is it actually true?
- **E — Energisation:** A more balanced, empowering response

**Example:**
- A: I applied for 5 jobs and heard nothing back
- B: "No one will hire someone with my background"
- C: I stopped applying
- D: Is that actually true? Or have I simply not found the right approach yet?
- E: I will improve my CV, ask for feedback, and apply 5 more times

## Building Your Support System
You do not have to navigate life alone. Build a circle of:
- At least one person who will tell you the truth
- At least one person who will encourage you when you are down
- At least one person who has achieved what you want to achieve

## Task (Submit)
> Write a 250-word personal reflection:
> Describe a setback you have faced (it can be recent or from the past).
> Apply the ABCDE model to it.
> What is the more empowering belief you can hold about that situation going forward?
>
> Submit as a Word document.', 4);


-- ══════════════════════════════════════════════════════════════
-- CULTURAL IDENTITY
-- ══════════════════════════════════════════════════════════════
INSERT INTO public.courses (id, title, pillar, description) VALUES
  ('c0dec401-cafe-4ade-babe-deadbeef0401',
   'African Heritage & Cultural Identity',
   'Cultural Identity',
   'Reconnect with Ghanaian and African history, literature, proverbs and values — because a strong cultural identity is the foundation of personal dignity and community.')
ON CONFLICT (id) DO UPDATE
  SET title       = EXCLUDED.title,
      description = EXCLUDED.description;

INSERT INTO public.lessons (course_id, title, content, order_index) VALUES

('c0dec401-cafe-4ade-babe-deadbeef0401',
 'The Wisdom in African Proverbs',
'# The Wisdom in African Proverbs

## Why Proverbs Matter
Before books, before the internet, before schools — African communities preserved wisdom, ethics, and social values through proverbs. A single proverb can hold the lesson of an entire lifetime.

## Ghanaian and West African Proverbs — With Meaning

| Proverb | Origin | Meaning |
|---|---|---|
| "Onipa na ohia onipa" | Akan (Ghana) | "A person needs a person" — we need each other; no one succeeds alone |
| "Obi nkyere onipa soro" | Akan | "No one shows a person the sky" — some truths you must discover yourself |
| "Animguase mfata Okanniba" | Akan | "Disgrace does not befit a free person" — live with dignity |
| "If you want to go fast, go alone. If you want to go far, go together." | Pan-African | Collective progress is more powerful than individual speed |
| "However long the night, the dawn will break." | Pan-African | Hardship is temporary; keep going |
| "Rain does not fall on one roof alone." | Akan | Difficulty and blessing are shared — community matters |

## Discussion Questions
- Which proverb means the most to you, and why?
- Is there a proverb from your own family or community that guides you?
- How can ancient wisdom apply to modern challenges?

## Task (Submit)
> Choose 5 Ghanaian or African proverbs (you can research others beyond this list).
> For each: write the proverb, its origin, and a 2–3 sentence explanation of how it applies to your life right now.
>
> Submit as a Word document.', 1),

('c0dec401-cafe-4ade-babe-deadbeef0401',
 'Ghana — Our History, Our Heritage',
'# Ghana — Our History, Our Heritage

## Ghana: Africa''s Symbol of Independence
On 6 March 1957, Ghana became the first sub-Saharan African country to gain independence from colonial rule. Under Osagyefo Dr Kwame Nkrumah, Ghana demonstrated to the world that African nations could govern themselves with dignity and vision.

This matters because it is *your* heritage. You come from a nation that led Africa.

## Key Figures in Ghana''s Story
- **Kwame Nkrumah** — first Prime Minister and President; pan-Africanist; architect of Ghanaian independence
- **J.B. Danquah** — lawyer, statesman, and intellectual who championed constitutional nationalism
- **Yaa Asantewaa** — Ashanti queen mother who led the 1900 resistance against British occupation
- **Kofi Annan** — Ghanaian diplomat, 7th Secretary-General of the United Nations, Nobel Peace Prize laureate

## Ghana''s Cultural Richness
Ghana is home to over 100 ethnic groups and languages including:
- Akan (Twi, Fante, Asante)
- Ewe
- Ga-Dangme
- Dagbani (Dagomba)
- Hausa

Each group brings distinct music, food, festivals, and oral traditions that together form a national culture of extraordinary depth.

## The Adinkra Symbols
Adinkra symbols from the Akan people encode values and wisdom in visual form. For example:
- **Gye Nyame** — "Except God" — symbol of the supremacy of God
- **Sankofa** — "Go back and fetch it" — learning from the past to build the future
- **Dwennimmen** — "Ram''s horns" — strength with humility

## Task (Submit)
> Write a 200-word essay:
> "What does it mean to me to be Ghanaian?"
>
> Reference at least one historical figure and one cultural element from your own background.
> Submit as a Word document.', 2),

('c0dec401-cafe-4ade-babe-deadbeef0401',
 'Your Story Is Your Strength',
'# Your Story Is Your Strength

## Every Life Has a Narrative
The stories we tell about ourselves — and the stories we believe — shape our identity, our confidence, and our choices. Many people who have experienced hardship tell themselves a limiting story: "I am defined by my worst moment." This is a lie.

## Reframing Your Story
**Old story:** "I ended up here because I made terrible choices."
**Reframed story:** "I made choices I am not proud of. I also chose to learn, grow, and build something different. My past does not own my future."

Both statements may be factually true. Only one empowers you.

## The African Concept of Ubuntu
"Ubuntu" — from the Zulu/Xhosa traditions of Southern Africa — is often translated as:
*"I am because we are."*

It means: your identity and dignity are not just individual — they are bound up in your community, your family, your people. Who you become affects those around you. This is both a responsibility and a source of strength.

## Oral Tradition and Storytelling
In many African cultures, the griot (historian-storyteller) is the keeper of community memory. Your story — honestly told — has the power to:
- Help someone else who is going through what you went through
- Show a younger person what is possible
- Change how people see you

## Task (Submit)
> Write a 300-word personal narrative titled: **"Who I Am Becoming"**
>
> Address:
> 1. Where you started from
> 2. A moment that shifted your perspective
> 3. Who you are choosing to be going forward
>
> This is not about your worst moment. It is about your growth.
> Submit as a Word document.', 3),

('c0dec401-cafe-4ade-babe-deadbeef0401',
 'Passing Wisdom Forward — Community and Legacy',
'# Passing Wisdom Forward — Community and Legacy

## What Is Legacy?
Legacy is not just what wealthy or famous people leave behind. Every person builds a legacy through their daily choices, relationships, and contributions to the people around them.

The question is not *if* you will leave a legacy — it is *what kind*.

## The Role of Community in African Cultures
In Ghanaian and broader African tradition, community is not just where you live — it is who you are. Families, clans, neighbourhoods and towns are webs of mutual obligation and mutual care.

This means:
- Your success is your community''s success
- Your struggles are not yours to carry alone
- Giving back is not charity — it is reciprocity

## After Spring Up: Ways to Give Back
You do not need to wait until you are wealthy or famous to give back. Examples:
- Teaching someone else a skill you learned here
- Mentoring a younger person in your neighbourhood
- Using your digital skills to help a local organisation, church, or business
- Sharing honest advice with someone who is heading down a difficult road

## The Long View
Many of Ghana''s greatest leaders were ordinary people who made consistent, disciplined choices over a long period. Nkrumah studied for years before independence. Kofi Annan built his career quietly over decades.

You are not behind. You are building.

## Final Task (Submit)
> Write a 300-word reflection titled: **"What I Want to Pass Forward"**
>
> Address:
> 1. One piece of wisdom or experience from your life that could help someone else
> 2. One specific way you plan to contribute to your community in the next 2 years
> 3. The kind of person you want to be known as in 10 years
>
> This is your final piece of writing for the Cultural Identity course.
> Make it honest, thoughtful, and real.
> Submit as a Word document.', 4);


-- ══════════════════════════════════════════════════════════════
-- VERIFY
-- ══════════════════════════════════════════════════════════════
SELECT pillar, count(*) AS courses FROM public.courses GROUP BY pillar ORDER BY pillar;
SELECT c.title, count(l.id) AS lessons
  FROM public.courses c
  LEFT JOIN public.lessons l ON l.course_id = c.id
  GROUP BY c.title
  ORDER BY c.title;


-- ══════════════════════════════════════════════════════════════
-- LEARNING PATHS
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.learning_paths (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.learning_blocks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id     UUID NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  subtitle    TEXT NOT NULL DEFAULT '',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.learning_block_courses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id    UUID NOT NULL REFERENCES public.learning_blocks(id) ON DELETE CASCADE,
  course_id   UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (block_id, course_id)
);

-- ── Path 1: Digital Foundations ──────────────────────────────
INSERT INTO public.learning_paths (id, title, description) VALUES
  ('fade1ace-cafe-4bae-beef-c0de00000001',
   'Digital Foundations Path',
   'The core digital literacy journey: documents → spreadsheets → presentations. Complete this path to be office-ready.')
ON CONFLICT (id) DO NOTHING;

DELETE FROM public.learning_block_courses
  WHERE block_id IN (
    'b10c0001-fade-4ace-beef-c0de00000001',
    'b10c0002-fade-4ace-beef-c0de00000002',
    'b10c0003-fade-4ace-beef-c0de00000003'
  );

DELETE FROM public.learning_blocks
  WHERE id IN (
    'b10c0001-fade-4ace-beef-c0de00000001',
    'b10c0002-fade-4ace-beef-c0de00000002',
    'b10c0003-fade-4ace-beef-c0de00000003'
  );

INSERT INTO public.learning_blocks (id, path_id, title, subtitle, order_index) VALUES
  ('b10c0001-fade-4ace-beef-c0de00000001', 'fade1ace-cafe-4bae-beef-c0de00000001',
   'Word Processing',         'Create CVs, letters and professional documents.',   1),
  ('b10c0002-fade-4ace-beef-c0de00000002', 'fade1ace-cafe-4bae-beef-c0de00000001',
   'Spreadsheets',            'Organise data, build dashboards, track anything.',   2),
  ('b10c0003-fade-4ace-beef-c0de00000003', 'fade1ace-cafe-4bae-beef-c0de00000001',
   'Presentations',           'Design clear slides and speak with confidence.',      3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.learning_block_courses (block_id, course_id, order_index) VALUES
  ('b10c0001-fade-4ace-beef-c0de00000001', 'c0dec001-face-4ade-babe-deadbeef0001', 1),
  ('b10c0002-fade-4ace-beef-c0de00000002', 'c0dec002-face-4ade-babe-deadbeef0002', 1),
  ('b10c0003-fade-4ace-beef-c0de00000003', 'c0dec003-face-4ade-babe-deadbeef0003', 1)
ON CONFLICT (block_id, course_id) DO NOTHING;

-- ── Path 2: Career Launch ─────────────────────────────────────
INSERT INTO public.learning_paths (id, title, description) VALUES
  ('fade2ace-cafe-4bae-beef-c0de00000002',
   'Career Launch Path',
   'Build the professional skills to find and keep a job: communication, AI tools, and visual design.')
ON CONFLICT (id) DO NOTHING;

DELETE FROM public.learning_block_courses
  WHERE block_id IN (
    'b20c0001-fade-4ace-beef-c0de00000001',
    'b20c0002-fade-4ace-beef-c0de00000002',
    'b20c0003-fade-4ace-beef-c0de00000003'
  );

DELETE FROM public.learning_blocks
  WHERE id IN (
    'b20c0001-fade-4ace-beef-c0de00000001',
    'b20c0002-fade-4ace-beef-c0de00000002',
    'b20c0003-fade-4ace-beef-c0de00000003'
  );

INSERT INTO public.learning_blocks (id, path_id, title, subtitle, order_index) VALUES
  ('b20c0001-fade-4ace-beef-c0de00000001', 'fade2ace-cafe-4bae-beef-c0de00000002',
   'Communication & Presentation', 'Present yourself, interview well, build relationships.', 1),
  ('b20c0002-fade-4ace-beef-c0de00000002', 'fade2ace-cafe-4bae-beef-c0de00000002',
   'AI & Prompt Engineering',       'Use AI tools to work smarter and faster.',              2),
  ('b20c0003-fade-4ace-beef-c0de00000003', 'fade2ace-cafe-4bae-beef-c0de00000002',
   'Graphic Design with Canva',      'Create a standout CV, poster, and personal brand.',    3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.learning_block_courses (block_id, course_id, order_index) VALUES
  ('b20c0001-fade-4ace-beef-c0de00000001', 'c0dec201-cafe-4ade-babe-deadbeef0201', 1),
  ('b20c0002-fade-4ace-beef-c0de00000002', 'c0dec202-cafe-4ade-babe-deadbeef0202', 1),
  ('b20c0003-fade-4ace-beef-c0de00000003', 'c0dec203-cafe-4ade-babe-deadbeef0203', 1)
ON CONFLICT (block_id, course_id) DO NOTHING;

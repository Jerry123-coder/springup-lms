PROJECT BLUEPRINT: SPRING UP LMS
1. MISSION & CONTEXT
Project Name: Spring Up

Target Audience: Juveniles at the Senior Correctional Centre (SCC), Roman Ridge, Ghana.

Objective: Provide a secure, role-based Learning Management System (LMS) to facilitate reintegration through digital literacy, professional skills, and ethical values.

2. TECHNICAL STACK
Framework: Next.js 15 (App Router)

Language: TypeScript

Database & Auth: Supabase (PostgreSQL + GoTrue)

Styling: Tailwind CSS + shadcn/ui

Icons: Lucide React

State Management: Server Actions & URL State

Deployment: Vercel

3. DATABASE SCHEMA (POSTGRESQL)
Tables
profiles

id: UUID (Primary Key, matches auth.users)

email: Text

full_name: Text

role: Enum (admin, instructor, student)

created_at: Timestamptz

courses

id: UUID

title: Text (e.g., "Microsoft Word Proficiency")

pillar: Enum (Digital Literacy, Career Readiness, Life Skills, Cultural Identity)

description: Text

lessons

id: UUID

course_id: References courses.id

title: Text

content: Text (Markdown format)

order_index: Integer

submissions

id: UUID

student_id: References profiles.id

lesson_id: References lessons.id

file_url: Text (Storage Link)

status: Enum (pending, reviewed)

grade: Integer (0-100)

feedback: Text

4. ARCHITECTURAL LOGIC & USER FLOWS
A. Role-Based Access Control (RBAC)
Middleware Logic:

/ → Accessible to everyone.

/dashboard/admin → Restricted to role: admin.

/dashboard/instructor → Restricted to role: instructor.

/dashboard/classroom → Restricted to role: student.

B. Security (RLS Policies)
Submissions: Students can only INSERT and SELECT their own submissions. Instructors can SELECT and UPDATE all submissions.

Profiles: Users can only view their own profile data, except Admins who can view all.

5. UI & CONTENT SPECIFICATIONS
Landing Page (The Public Face)
Hero Headline: "Shaping Destinies through Digital Literacy."

Sub-headline: "Empowering the youth of the Senior Correctional Centre with tools for a resolute future."

The 4 Pillars (Bento Grid):

Digital Literacy: Essential ICT skills (Word, Excel, basic OS).

Career Readiness: Slides, Prompt Engineering, Graphic Design.

Life Skills & Values: Ethical discipline and professional etiquette.

Cultural Identity: African Literature and heritage building.

Donation Drawer: Triggered by "Support Us" button.

Bank: CBG

Account Name: Phoebe France

Account Number: 2401371600001

Cash/Mobile: 0205905240

Dashboard Design (The Workspaces)
Student: Minimalist lesson sidebar on the left, content reader in center, upload zone at the bottom.

Instructor: A table view of all "Pending Reviews" with a split-screen interface (File View on Left / Feedback Form on Right).

Admin: Simple cards for total students, total completions, and a user-role management table.

6. IMPLEMENTATION STEPS (FOR AI AGENT)
Phase 1: Setup Next.js 15, shadcn/ui, and Supabase Auth.

Phase 2: Create the PostgreSQL schema, Enums, and RLS policies.

Phase 3: Build the Landing Page with the Donation Drawer.

Phase 4: Build the middleware.ts for role-based redirection.

Phase 5: Build the Student Classroom and Instructor Grading Hub.

How to use this with Cursor:
Keep this file open.

Open Composer (Cmd + I).

Type: "Follow @BLUEPRINT.md to implement Phase 1. Start by scaffolding the route groups and installing shadcn/ui."
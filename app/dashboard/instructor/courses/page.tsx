import Link from "next/link";
import {
  BookOpen,
  ChevronRight,
  Edit3,
  GraduationCap,
  Layers,
  Plus,
  Users,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

// ── Types ──────────────────────────────────────────────────
const PILLAR_STYLE: Record<string, { dot: string; badge: string; label: string }> = {
  "Digital Literacy":  { dot: "bg-sky-500",     badge: "bg-sky-500/15 text-sky-700 dark:text-sky-300",      label: "Digital" },
  "Career Readiness":  { dot: "bg-violet-500",  badge: "bg-violet-500/15 text-violet-700 dark:text-violet-300", label: "Career" },
  "Life Skills":       { dot: "bg-amber-500",   badge: "bg-amber-500/15 text-amber-700 dark:text-amber-300", label: "Life Skills" },
  "Cultural Identity": { dot: "bg-rose-500",    badge: "bg-rose-500/15 text-rose-700 dark:text-rose-300",    label: "Cultural" },
};

// ── Page ───────────────────────────────────────────────────
export default async function InstructorCoursesPage() {
  const supabase = await createClient();

  // Courses + their lessons (count via embed)
  const { data: coursesData } = await supabase
    .from("courses")
    .select("id, title, pillar, category, description, lessons(id)")
    .order("pillar");

  type CourseRow = {
    id: string;
    title: string;
    pillar: string;
    category: string;
    description: string;
    lessons: { id: string }[];
  };
  const courses = (coursesData ?? []) as CourseRow[];

  // Student engagement: count distinct students who submitted per course
  const { data: subsData } = await supabase
    .from("submissions")
    .select("student_id, lesson_id, lessons!inner(course_id)");

  type SubRow = { student_id: string; lesson_id: string; lessons: { course_id: string } };
  const subs = (subsData ?? []) as unknown as SubRow[];

  // Build per-course student set
  const studentsByCourse = new Map<string, Set<string>>();
  for (const s of subs) {
    const cid = s.lessons?.course_id;
    if (!cid) continue;
    if (!studentsByCourse.has(cid)) studentsByCourse.set(cid, new Set());
    studentsByCourse.get(cid)!.add(s.student_id);
  }

  const totalCourses  = courses.length;
  const totalLessons  = courses.reduce((n, c) => n + c.lessons.length, 0);
  const totalStudents = new Set(subs.map((s) => s.student_id)).size;

  // Group by pillar
  const byPillar = new Map<string, CourseRow[]>();
  for (const c of courses) {
    const arr = byPillar.get(c.pillar) ?? [];
    arr.push(c);
    byPillar.set(c.pillar, arr);
  }

  return (
    <>
      <DashboardHeader heading="Course Management" />
      <div className="mx-auto w-full max-w-7xl flex-1 space-y-8 p-6">

        {/* ── Hero row ─────────────────────────────────── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
              Instructor Portal
            </p>
            <h2 className="mt-0.5 font-display text-2xl font-semibold tracking-tight">
              Course Management Hub
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Review your curriculum, update lesson content, and track student engagement across all modules.
            </p>
          </div>
          <Link
            href="/dashboard/instructor/courses/new"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-[#f0f7f5] hover:opacity-90 shrink-0"
          >
            <Plus className="h-4 w-4" />
            Create New Course
          </Link>
        </div>

        {/* ── Stats row ────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Active Courses",  value: totalCourses,  icon: BookOpen,      color: "text-primary" },
            { label: "Total Lessons",   value: totalLessons,  icon: Layers,        color: "text-violet-600 dark:text-violet-400" },
            { label: "Active Students", value: totalStudents, icon: GraduationCap, color: "text-amber-600 dark:text-amber-400" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-2xl bg-card p-5 shadow-ambient">
              <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-muted ${color}`}>
                <Icon className="h-4.5 w-4.5" />
              </div>
              <p className="font-display text-3xl font-bold">{value}</p>
              <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Courses by pillar ────────────────────────── */}
        {byPillar.size === 0 ? (
          <div className="flex flex-col items-center rounded-[1.75rem] bg-muted/40 px-8 py-20 text-center shadow-ambient">
            <BookOpen className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <h3 className="font-display text-lg font-semibold">No courses yet</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Create your first course to start building your curriculum.
            </p>
          </div>
        ) : (
          Array.from(byPillar.entries()).map(([pillar, pillarCourses]) => {
            const style = PILLAR_STYLE[pillar] ?? { dot: "bg-slate-400", badge: "bg-muted text-foreground", label: pillar };
            return (
              <section key={pillar}>
                {/* Pillar heading */}
                <div className="mb-4 flex items-center gap-2.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
                  <h3 className="font-display text-base font-semibold tracking-tight">{pillar}</h3>
                  <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                    {pillarCourses.length} course{pillarCourses.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {pillarCourses.map((course) => {
                    const lessonCount  = course.lessons.length;
                    const studentCount = studentsByCourse.get(course.id)?.size ?? 0;

                    return (
                      <div
                        key={course.id}
                        className="group relative flex flex-col rounded-2xl bg-card p-5 shadow-ambient transition-all hover:-translate-y-0.5 hover:shadow-md"
                      >
                        {/* Top: pillar badge + actions */}
                        <div className="mb-4 flex items-start justify-between gap-2">
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${style.badge}`}>
                            {style.label}
                          </span>
                          <div className="flex items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                            <Link
                              href={`/dashboard/instructor/courses/${course.id}`}
                              className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-muted-foreground hover:bg-secondary hover:text-primary"
                              title="Edit syllabus"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                        </div>

                        {/* Title + description */}
                        <h4 className="font-display text-base font-semibold leading-snug">
                          {course.title}
                        </h4>
                        <p className="mt-1.5 line-clamp-2 flex-1 text-xs text-muted-foreground">
                          {course.description || "No description yet."}
                        </p>

                        {/* Stats row */}
                        <div className="mt-4 flex items-center gap-4 border-t border-border/40 pt-4">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Layers className="h-3.5 w-3.5 text-primary/60" />
                            <span className="font-semibold text-foreground">{lessonCount}</span>
                            <span>lesson{lessonCount !== 1 ? "s" : ""}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Users className="h-3.5 w-3.5 text-primary/60" />
                            <span className="font-semibold text-foreground">{studentCount}</span>
                            <span>student{studentCount !== 1 ? "s" : ""}</span>
                          </div>
                        </div>

                        {/* Footer actions */}
                        <div className="mt-3 flex items-center gap-2">
                          <Link
                            href={`/dashboard/instructor/courses/${course.id}`}
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-secondary px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-[#f0f7f5]"
                          >
                            Edit Syllabus
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Link>
                          <Link
                            href={`/dashboard/instructor/courses/${course.id}?tab=add`}
                            className="flex items-center justify-center gap-1.5 rounded-xl bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
                            title="Add material"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add Lesson
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })
        )}
      </div>
    </>
  );
}

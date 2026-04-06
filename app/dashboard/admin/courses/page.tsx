import { Suspense } from "react";
import Link from "next/link";
import { BookOpen, ClipboardCheck, Plus, Users } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { AdminPillarEditor } from "@/components/dashboard/admin-pillar-editor";
import { AdminCourseGrid } from "@/components/dashboard/admin-course-grid";
import { Skeleton } from "@/components/ui/skeleton";
import type { Course, Lesson } from "@/lib/types/database";

type PillarSetting = { slug: string; description: string; subtitle: string };

const PILLAR_SLUGS = [
  "Digital Literacy",
  "Career Readiness",
  "Life Skills",
  "Cultural Identity",
] as const;

async function CoursesPageContent({ tab }: { tab: string }) {
  const supabase = await createClient();

  const [coursesRes, lessonsRes, subsRes, pillarsRes] = await Promise.all([
    supabase.from("courses").select("*").order("pillar").order("title"),
    supabase.from("lessons").select("id, course_id, title, order_index").order("order_index"),
    supabase.from("submissions").select("student_id, lesson_id, status"),
    supabase.from("pillar_settings" as never).select("slug, description, subtitle"),
  ]);

  const courses = (coursesRes.data ?? []) as Course[];
  const lessons = (lessonsRes.data ?? []) as Pick<Lesson, "id" | "course_id" | "title" | "order_index">[];
  type SubRow = { student_id: string; lesson_id: string; status: string };
  const subs = (subsRes.data ?? []) as SubRow[];
  const rawPillars = (pillarsRes.data ?? []) as PillarSetting[];

  // Build pillar settings with fallback defaults if table is empty
  const DEFAULTS: Record<string, PillarSetting> = {
    "Digital Literacy":  { slug: "Digital Literacy",  description: "", subtitle: "Microsoft Office & Workplace Tech" },
    "Career Readiness":  { slug: "Career Readiness",  description: "", subtitle: "Professional Development" },
    "Life Skills":       { slug: "Life Skills",        description: "", subtitle: "Personal Effectiveness" },
    "Cultural Identity": { slug: "Cultural Identity",  description: "", subtitle: "Heritage & Values" },
  };
  const pillarMap = new Map(rawPillars.map((p) => [p.slug, p]));
  const pillars = PILLAR_SLUGS.map((slug) => pillarMap.get(slug) ?? DEFAULTS[slug]);

  // ── aggregations ──────────────────────────────────────────────
  const courseByLesson = new Map<string, string>();
  for (const l of lessons) courseByLesson.set(l.id, l.course_id);

  const studentsByCourse = new Map<string, Set<string>>();
  const pendingByCourse  = new Map<string, number>();
  for (const s of subs) {
    const cid = courseByLesson.get(s.lesson_id);
    if (!cid) continue;
    const set = studentsByCourse.get(cid) ?? new Set<string>();
    set.add(s.student_id);
    studentsByCourse.set(cid, set);
    if (s.status === "pending")
      pendingByCourse.set(cid, (pendingByCourse.get(cid) ?? 0) + 1);
  }

  const lessonsByCourse = new Map<string, number>();
  for (const l of lessons)
    lessonsByCourse.set(l.course_id, (lessonsByCourse.get(l.course_id) ?? 0) + 1);

  const enriched = courses.map((c) => ({
    ...c,
    lessonCount:  lessonsByCourse.get(c.id) ?? 0,
    studentCount: studentsByCourse.get(c.id)?.size ?? 0,
    pendingCount: pendingByCourse.get(c.id) ?? 0,
  }));

  // Summary stats
  const totalCourses  = courses.length;
  const totalLessons  = lessons.length;
  const totalStudents = new Set(subs.map((s) => s.student_id)).size;
  const totalPending  = subs.filter((s) => s.status === "pending").length;

  // Pillar stats for the editor cards
  const pillarStats = Object.fromEntries(
    PILLAR_SLUGS.map((slug) => {
      const c = courses.filter((co) => co.pillar === slug);
      return [
        slug,
        {
          courseCount:  c.length,
          lessonCount:  c.reduce((sum, co) => sum + (lessonsByCourse.get(co.id) ?? 0), 0),
          studentCount: c.reduce((sum, co) => sum + (studentsByCourse.get(co.id)?.size ?? 0), 0),
        },
      ];
    })
  );

  return (
    <div className="space-y-6">
      {/* Stat strip */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Courses",          value: totalCourses,  icon: BookOpen },
          { label: "Lessons",          value: totalLessons,  icon: BookOpen },
          { label: "Active Students",  value: totalStudents, icon: Users },
          { label: "Pending Reviews",  value: totalPending,  icon: ClipboardCheck },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-ambient">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-display text-xl font-bold tabular-nums text-foreground">{value}</p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <CourseTabs tab={tab} courses={enriched as CourseRow[]} pillars={pillars} pillarStats={pillarStats} />
    </div>
  );
}

// ── Tab renderer — uses search param ────────────────────────────
function CourseTabs({
  tab,
  courses,
  pillars,
  pillarStats,
}: {
  tab: string;
  courses: CourseRow[];
  pillars: PillarSetting[];
  pillarStats: Record<string, { courseCount: number; lessonCount: number; studentCount: number }>;
}) {
  const active = tab === "pillars" ? "pillars" : "courses";

  return (
    <div className="space-y-4">
      {/* Tab strip */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 rounded-2xl bg-muted/40 p-1">
          {(["courses", "pillars"] as const).map((t) => (
            <Link
              key={t}
              href={`/dashboard/admin/courses${t === "pillars" ? "?tab=pillars" : ""}`}
              className={`rounded-xl px-5 py-2 text-xs font-semibold capitalize transition-colors ${
                active === t
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "courses" ? "All Courses" : "Pillar Settings"}
            </Link>
          ))}
        </div>
        {active === "courses" && (
          <Link
            href="/dashboard/admin/courses/new"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-[#f0f7f5] transition-opacity hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" />
            New Course
          </Link>
        )}
      </div>

      {/* Panel */}
      {active === "courses" ? (
        <AdminCourseGrid courses={courses as CourseRow[]} />
      ) : (
        <AdminPillarEditor pillars={pillars} stats={pillarStats} />
      )}
    </div>
  );
}

// ── Types shared with grid ────────────────────────────────────────
export type CourseRow = Course & {
  lessonCount: number;
  studentCount: number;
  pendingCount: number;
};

// ── Skeleton ─────────────────────────────────────────────────────
function CoursesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl bg-card p-4 shadow-ambient flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
            <div className="space-y-1">
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-2.5 w-24" />
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-52 rounded-2xl" />
          <Skeleton className="h-8 w-28 rounded-xl" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="rounded-2xl bg-card p-5 shadow-ambient space-y-3">
              <div className="flex items-start justify-between">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <div className="flex gap-3 pt-1">
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-3.5 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────
export default async function AdminCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = "courses" } = await searchParams;

  return (
    <>
      <DashboardHeader heading="Course Management" />
      <div className="flex-1 space-y-6 p-6">
        {/* Banner */}
        <div
          className="relative overflow-hidden rounded-[1.75rem] p-6 shadow-ambient sm:p-8"
          style={{ background: "linear-gradient(135deg, #001a16 0%, #00342b 40%, #005a4d 80%, #0a7a6a 100%)" }}
        >
          <div
            className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full opacity-20 blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(255,204,170,0.9) 0%, transparent 70%)" }}
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)", backgroundSize: "18px 18px" }}
          />
          <div className="relative flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#94d3c1]/20">
              <BookOpen className="h-6 w-6 text-[#94d3c1]" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-[#f0f7f5]">Course Management</h2>
              <p className="mt-1 text-sm text-[#c8ebe2]/70">
                Build full courses, manage lessons, edit pillar descriptions, and control all curriculum content.
              </p>
            </div>
          </div>
        </div>

        <Suspense fallback={<CoursesSkeleton />}>
          <CoursesPageContent tab={tab} />
        </Suspense>
      </div>
    </>
  );
}

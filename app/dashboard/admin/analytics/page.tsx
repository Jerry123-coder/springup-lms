import { Suspense } from "react";
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  Star,
  TrendingUp,
  Users,
  Users2,
  Zap,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Skeleton } from "@/components/ui/skeleton";

// ── Types ─────────────────────────────────────────────────────────
type ProfileRow  = { id: string; full_name: string; email: string; role: string };
type LessonRow   = { id: string; course_id: string };
type SubRow      = { lesson_id: string; student_id: string; grade: number | null; status: string };
type ProgRow     = { student_id: string; updated_at: string };
type CourseRow   = { id: string; title: string; pillar: string };
type CohortRow   = { id: string; name: string; instructor_id: string };
type CohortStudentRow = { cohort_id: string; student_id: string };

// ── Helpers ───────────────────────────────────────────────────────
function ProgressBar({ pct, className = "" }: { pct: number; className?: string }) {
  return (
    <div className={`h-2 overflow-hidden rounded-full bg-muted ${className}`}>
      <div
        className="h-full rounded-full bg-primary transition-[width] duration-700"
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  );
}

function KpiCard({
  title,
  value,
  sub,
  icon: Icon,
  accent = false,
}: {
  title: string;
  value: string | number;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-5 shadow-ambient ${
        accent ? "bg-gradient-primary text-[#f0f7f5]" : "bg-card"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-[11px] font-bold uppercase tracking-wider ${accent ? "text-[#94d3c1]/70" : "text-muted-foreground"}`}>
            {title}
          </p>
          <p className={`mt-2 font-display text-3xl font-bold tabular-nums ${accent ? "text-[#f0f7f5]" : "text-foreground"}`}>
            {value}
          </p>
          {sub && <p className={`mt-1 text-xs ${accent ? "text-[#94d3c1]/60" : "text-muted-foreground"}`}>{sub}</p>}
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${accent ? "bg-white/15" : "bg-secondary text-primary"}`}>
          <Icon className={`h-5 w-5 ${accent ? "text-[#94d3c1]" : ""}`} />
        </div>
      </div>
    </div>
  );
}

// ── Main async analytics component ───────────────────────────────
async function AnalyticsContent() {
  const supabase = await createClient();

  const [profilesRes, lessonsRes, subsRes, progressRes, coursesRes, cohortsRes, cohortStudentsRes] =
    await Promise.all([
      supabase.from("profiles").select("id, full_name, email, role"),
      supabase.from("lessons").select("id, course_id"),
      supabase.from("submissions").select("lesson_id, student_id, grade, status"),
      supabase.from("lesson_progress").select("student_id, updated_at"),
      supabase.from("courses").select("id, title, pillar"),
      supabase.from("cohorts").select("id, name, instructor_id"),
      supabase.from("cohort_students").select("cohort_id, student_id"),
    ]);

  const profiles      = (profilesRes.data ?? []) as ProfileRow[];
  const lessons       = (lessonsRes.data ?? []) as LessonRow[];
  const subs          = (subsRes.data ?? []) as SubRow[];
  const progress      = (progressRes.data ?? []) as ProgRow[];
  const courses       = (coursesRes.data ?? []) as CourseRow[];
  const cohorts       = (cohortsRes.data ?? []) as CohortRow[];
  const cohortStudents = (cohortStudentsRes.data ?? []) as CohortStudentRow[];

  const students    = profiles.filter((p) => p.role === "student");
  const instructors = profiles.filter((p) => p.role === "instructor");
  const totalLessons = lessons.length;

  // ── KPIs ─────────────────────────────────────────────────────
  const submittedByStudent = new Map<string, Set<string>>();
  for (const s of subs) {
    const set = submittedByStudent.get(s.student_id) ?? new Set();
    set.add(s.lesson_id);
    submittedByStudent.set(s.student_id, set);
  }

  const gradedSubs = subs.filter((s) => s.status === "reviewed" && s.grade !== null);
  const avgGrade = gradedSubs.length > 0
    ? Math.round(gradedSubs.reduce((sum, s) => sum + (s.grade ?? 0), 0) / gradedSubs.length)
    : null;

  // Overall completion % across all students
  const totalSubmitted = subs.length;
  const maxPossible = students.length * totalLessons;
  const overallPct = maxPossible > 0 ? Math.round((totalSubmitted / maxPossible) * 100) : 0;

  // Active this week (lesson_progress updated in last 7 days)
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const activeStudents = new Set(progress.filter((p) => p.updated_at >= oneWeekAgo).map((p) => p.student_id));

  // Pending reviews
  const pendingCount = subs.filter((s) => s.status === "pending").length;

  // ── Per-pillar completion ─────────────────────────────────────
  const pillars = ["Digital Literacy", "Career Readiness", "Life Skills", "Cultural Identity"] as const;
  const lessonsByCourse = new Map<string, string[]>();
  for (const l of lessons) {
    const arr = lessonsByCourse.get(l.course_id) ?? [];
    arr.push(l.id);
    lessonsByCourse.set(l.course_id, arr);
  }
  const submittedIds = new Set(subs.map((s) => s.lesson_id));

  const pillarStats = pillars.map((pillar) => {
    const pillarCourses = courses.filter((c) => c.pillar === pillar);
    const pillarLessonIds = pillarCourses.flatMap((c) => lessonsByCourse.get(c.id) ?? []);
    const totalPL = pillarLessonIds.length;
    const donePL = pillarLessonIds.filter((id) => submittedIds.has(id)).length;
    const pct = totalPL > 0 ? Math.round((donePL / totalPL) * 100) : 0;
    return { pillar, courseCount: pillarCourses.length, totalLessons: totalPL, done: donePL, pct };
  });

  // ── Top students ──────────────────────────────────────────────
  const topStudents = students
    .map((s) => {
      const done = submittedByStudent.get(s.id)?.size ?? 0;
      const pct = totalLessons > 0 ? Math.round((done / totalLessons) * 100) : 0;
      return { ...s, done, pct };
    })
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 8);

  // ── Cohort performance ────────────────────────────────────────
  const studentsByCohort = new Map<string, string[]>();
  for (const cs of cohortStudents) {
    const arr = studentsByCohort.get(cs.cohort_id) ?? [];
    arr.push(cs.student_id);
    studentsByCohort.set(cs.cohort_id, arr);
  }
  const instructorById = new Map(instructors.map((i) => [i.id, i]));

  const cohortStats = cohorts.map((c) => {
    const memberIds = studentsByCohort.get(c.id) ?? [];
    const memberCount = memberIds.length;
    const avgPct = memberCount > 0 && totalLessons > 0
      ? Math.round(
          memberIds.reduce((sum, sid) => sum + (submittedByStudent.get(sid)?.size ?? 0), 0) /
          (memberCount * totalLessons) * 100
        )
      : 0;
    const instr = instructorById.get(c.instructor_id);
    return { ...c, memberCount, avgPct, instructorName: instr?.full_name || instr?.email || "—" };
  }).sort((a, b) => b.avgPct - a.avgPct);

  // ── Instructor grading throughput ─────────────────────────────
  const reviewedCount = subs.filter((s) => s.status === "reviewed").length;
  const instructorStats = instructors.map((inst) => {
    // We can't directly attribute reviews to instructors without a reviewer_id;
    // show their assigned student count and pending reviews via assignments
    return { ...inst };
  });

  function letterGrade(g: number) {
    if (g >= 90) return "A";
    if (g >= 80) return "B";
    if (g >= 70) return "C";
    if (g >= 60) return "D";
    return "F";
  }

  const PILLAR_COLORS: Record<string, string> = {
    "Digital Literacy":  "bg-sky-500",
    "Career Readiness":  "bg-amber-500",
    "Life Skills":       "bg-emerald-500",
    "Cultural Identity": "bg-violet-500",
  };

  return (
    <div className="space-y-8">
      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Overall Completion" value={`${overallPct}%`} sub="Across all students" icon={TrendingUp} accent />
        <KpiCard title="Avg Grade" value={avgGrade !== null ? `${avgGrade} (${letterGrade(avgGrade)})` : "—"} sub={`${gradedSubs.length} graded submissions`} icon={Star} />
        <KpiCard title="Active This Week" value={activeStudents.size} sub={`of ${students.length} students`} icon={Zap} />
        <KpiCard title="Pending Reviews" value={pendingCount} sub="Awaiting instructor grading" icon={CheckCircle2} />
      </div>

      {/* Middle grid: pillars + top students */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Per-pillar completion */}
        <div className="rounded-2xl bg-card p-6 shadow-ambient">
          <div className="mb-5 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[#ffdcc2]" />
            <h3 className="font-display text-sm font-semibold">Completion by Pillar</h3>
          </div>
          <div className="space-y-4">
            {pillarStats.map(({ pillar, pct, done, totalLessons: tl, courseCount }) => (
              <div key={pillar}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${PILLAR_COLORS[pillar] ?? "bg-primary"}`} />
                    <span className="font-medium text-foreground">{pillar}</span>
                    <span className="text-muted-foreground">({courseCount} course{courseCount !== 1 ? "s" : ""})</span>
                  </div>
                  <span className="font-bold tabular-nums text-foreground">
                    {pct}% <span className="font-normal text-muted-foreground">({done}/{tl})</span>
                  </span>
                </div>
                <ProgressBar pct={pct} />
              </div>
            ))}
          </div>
        </div>

        {/* Top students */}
        <div className="rounded-2xl bg-card p-6 shadow-ambient">
          <div className="mb-5 flex items-center gap-2">
            <Users className="h-5 w-5 text-[#ffdcc2]" />
            <h3 className="font-display text-sm font-semibold">Top Students</h3>
          </div>
          <div className="space-y-3">
            {topStudents.length === 0 ? (
              <p className="text-xs text-muted-foreground">No student progress yet.</p>
            ) : (
              topStudents.map((s, idx) => (
                <div key={s.id} className="flex items-center gap-3">
                  <span className="w-5 shrink-0 text-center text-xs font-bold tabular-nums text-muted-foreground">
                    {idx + 1}
                  </span>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-primary">
                    {s.full_name.split(" ").slice(0,2).map(p=>p[0]).join("").toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-foreground">{s.full_name || s.email}</p>
                    <ProgressBar pct={s.pct} className="mt-1" />
                  </div>
                  <span className="shrink-0 text-xs font-bold tabular-nums text-primary">{s.pct}%</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Cohort performance */}
      <div className="rounded-2xl bg-card p-6 shadow-ambient">
        <div className="mb-5 flex items-center gap-2">
          <Users2 className="h-5 w-5 text-[#ffdcc2]" />
          <h3 className="font-display text-sm font-semibold">Cohort Performance Comparison</h3>
        </div>
        {cohortStats.length === 0 ? (
          <p className="text-sm text-muted-foreground">No cohorts have been created yet.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border">
            <div className="hidden grid-cols-[2fr_1fr_1fr_2fr_1fr] gap-4 border-b bg-muted/50 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground sm:grid">
              <span>Cohort</span>
              <span>Instructor</span>
              <span>Students</span>
              <span>Avg Completion</span>
              <span>Status</span>
            </div>
            <div className="divide-y">
              {cohortStats.map((c) => (
                <div key={c.id} className="grid grid-cols-1 gap-2 px-4 py-3 sm:grid-cols-[2fr_1fr_1fr_2fr_1fr] sm:items-center sm:gap-4">
                  <p className="font-display text-sm font-semibold text-foreground">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.instructorName}</p>
                  <p className="text-xs font-semibold text-foreground">{c.memberCount}</p>
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-foreground">{c.avgPct}%</span>
                    </div>
                    <ProgressBar pct={c.avgPct} />
                  </div>
                  <span className={`inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    c.avgPct >= 75 ? "bg-primary/10 text-primary"
                    : c.avgPct >= 40 ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                    : "bg-muted text-muted-foreground"
                  }`}>
                    {c.avgPct >= 75 ? "On Track" : c.avgPct >= 40 ? "In Progress" : "Starting"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Platform summary bottom row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-card p-5 shadow-ambient">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Total Submissions</p>
          <p className="mt-2 font-display text-3xl font-bold tabular-nums">{subs.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">{reviewedCount} reviewed · {pendingCount} pending</p>
        </div>
        <div className="rounded-2xl bg-card p-5 shadow-ambient">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Active Instructors</p>
          <p className="mt-2 font-display text-3xl font-bold tabular-nums">{instructors.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">Managing {cohorts.length} cohorts</p>
        </div>
        <div className="rounded-2xl bg-card p-5 shadow-ambient">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Total Content</p>
          <p className="mt-2 font-display text-3xl font-bold tabular-nums">{lessons.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">{courses.length} courses across 4 pillars</p>
        </div>
      </div>
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0,1,2,3].map(i=><div key={i} className="rounded-2xl bg-card p-5 shadow-ambient"><Skeleton className="h-4 w-24"/><Skeleton className="mt-2 h-9 w-16"/><Skeleton className="mt-1 h-3 w-32"/></div>)}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {[0,1].map(i=><div key={i} className="rounded-2xl bg-card p-6 shadow-ambient space-y-4"><Skeleton className="h-5 w-48"/>{[0,1,2,3].map(j=><div key={j} className="space-y-1.5"><Skeleton className="h-3 w-full"/><Skeleton className="h-2 w-full rounded-full"/></div>)}</div>)}
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  return (
    <>
      <DashboardHeader heading="Analytics" />
      <div className="flex-1 space-y-6 p-6">
        {/* Header */}
        <div
          className="relative overflow-hidden rounded-[1.75rem] p-6 shadow-ambient sm:p-8"
          style={{ background: "linear-gradient(135deg, #001a16 0%, #00342b 40%, #005a4d 80%, #0a7a6a 100%)" }}
        >
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, rgba(255,204,170,0.9) 0%, transparent 70%)" }} />
          <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
          <div className="relative flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#94d3c1]/20">
              <BarChart3 className="h-6 w-6 text-[#94d3c1]" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-[#f0f7f5]">Platform Analytics</h2>
              <p className="mt-1 text-sm text-[#c8ebe2]/70">
                Track learner engagement, course completion, cohort performance and grading throughput.
              </p>
            </div>
          </div>
        </div>

        <Suspense fallback={<AnalyticsSkeleton />}>
          <AnalyticsContent />
        </Suspense>
      </div>
    </>
  );
}

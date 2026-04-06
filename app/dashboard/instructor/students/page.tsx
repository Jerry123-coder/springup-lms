import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Eye,
  Users,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

// ── Types ─────────────────────────────────────────────────────────
type CoursePillar = "Digital Literacy" | "Career Readiness" | "Life Skills" | "Cultural Identity";

interface StudentRow {
  id: string;
  full_name: string;
  email: string;
}

interface PageProps {
  searchParams: Promise<{ pillar?: string; sort?: string }>;
}

// ── Helpers ───────────────────────────────────────────────────────
function toLetterGrade(s: number): string {
  if (s >= 90) return "A";
  if (s >= 80) return "B";
  if (s >= 70) return "C";
  if (s >= 60) return "D";
  return "F";
}

function timeAgo(ts: string): string {
  const d = Math.floor((Date.now() - new Date(ts).getTime()) / 86_400_000);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d}d ago`;
  return `${Math.floor(d / 7)}w ago`;
}

function initials(name: string): string {
  return name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

const AVATAR_COLORS = [
  "bg-sky-500/20 text-sky-700 dark:text-sky-300",
  "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
  "bg-violet-500/20 text-violet-700 dark:text-violet-300",
  "bg-amber-500/20 text-amber-700 dark:text-amber-300",
  "bg-primary/15 text-primary",
  "bg-rose-500/20 text-rose-700 dark:text-rose-300",
];

const PILLAR_BADGE: Record<string, string> = {
  "Digital Literacy": "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  "Career Readiness": "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  "Life Skills": "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  "Cultural Identity": "bg-rose-500/15 text-rose-700 dark:text-rose-300",
};

const PILLAR_TABS: CoursePillar[] = ["Digital Literacy", "Career Readiness", "Life Skills", "Cultural Identity"];

// ── Page ──────────────────────────────────────────────────────────
export default async function InstructorStudentsPage({ searchParams }: PageProps) {
  const { pillar: pillarFilter, sort = "completion" } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Step 1: direct instructor_student_assignments
  const { data: assignments } = await supabase
    .from("instructor_student_assignments")
    .select("student_id")
    .eq("instructor_id", user.id);

  let assignedIds = ((assignments ?? []) as { student_id: string }[]).map((a) => a.student_id);

  // Step 2: also collect students from this instructor's cohorts (fallback / union)
  const { data: instructorCohorts } = await supabase
    .from("cohorts")
    .select("id")
    .eq("instructor_id", user.id);

  const cohortIds = ((instructorCohorts ?? []) as { id: string }[]).map((c) => c.id);

  if (cohortIds.length > 0) {
    const { data: cohortStudentsData } = await supabase
      .from("cohort_students")
      .select("student_id")
      .in("cohort_id", cohortIds);

    const cohortStudentIds = ((cohortStudentsData ?? []) as { student_id: string }[]).map((r) => r.student_id);
    assignedIds = [...new Set([...assignedIds, ...cohortStudentIds])];
  }

  // Step 3: fetch profiles — scoped to assigned IDs when we have them
  let studentsQuery = supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "student")
    .order("full_name");

  if (assignedIds.length > 0) {
    studentsQuery = studentsQuery.in("id", assignedIds);
  }

  const { data: studentsData } = await studentsQuery;
  const students = (studentsData ?? []) as StudentRow[];

  if (students.length === 0) {
    return (
      <>
        <DashboardHeader heading="My Students" />
        <div className="mx-auto w-full max-w-7xl flex-1 p-6">
          <div className="flex flex-col items-center rounded-[1.75rem] bg-muted/40 px-8 py-20 text-center shadow-ambient">
            <Users className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <h3 className="font-display text-lg font-semibold">No students yet</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Ask your admin to assign students to you, or create a class and add students.
            </p>
            <Link href="/dashboard/instructor/cohorts" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-[#f0f7f5]">
              Create a Class <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </>
    );
  }

  const studentIds = students.map((s) => s.id);

  // Fetch all lessons (for denominator)
  const { data: allLessonsData } = await supabase
    .from("lessons")
    .select("id, course_id, title, order_index, courses!inner(id, title, pillar)")
    .order("order_index");

  type LessonRow = { id: string; course_id: string; title: string; order_index: number; courses: { id: string; title: string; pillar: string } | null };
  const allLessons = (allLessonsData ?? []) as unknown as LessonRow[];
  const totalLessons = allLessons.length;

  // Submissions
  type SubRow = { student_id: string; lesson_id: string; grade: number | null; status: string; created_at: string };
  const { data: subsData } = await supabase
    .from("submissions")
    .select("student_id, lesson_id, grade, status, created_at")
    .in("student_id", studentIds);
  const subs = (subsData ?? []) as SubRow[];

  // Last lesson_progress per student
  type LpRow = { student_id: string; updated_at: string };
  const { data: lpData } = await supabase
    .from("lesson_progress")
    .select("student_id, updated_at")
    .in("student_id", studentIds)
    .order("updated_at", { ascending: false });
  const lpRows = (lpData ?? []) as LpRow[];

  const lastLpByStudent = new Map<string, string>();
  for (const lp of lpRows) {
    if (!lastLpByStudent.has(lp.student_id)) lastLpByStudent.set(lp.student_id, lp.updated_at);
  }

  // Submitted lesson IDs per student
  const subsByStudent = new Map<string, SubRow[]>();
  for (const s of subs) {
    const arr = subsByStudent.get(s.student_id) ?? [];
    arr.push(s);
    subsByStudent.set(s.student_id, arr);
  }

  const now = Date.now();
  const sevenDays = 7 * 86_400_000;

  const studentStats = students.map((student, idx) => {
    const studentSubs = subsByStudent.get(student.id) ?? [];
    const submittedIds = new Set(studentSubs.map((s) => s.lesson_id));
    const pct = totalLessons > 0 ? Math.round((submittedIds.size / totalLessons) * 100) : 0;

    const grades = studentSubs.filter((s) => s.status === "reviewed" && s.grade !== null).map((s) => s.grade as number);
    const avgGrade = grades.length > 0 ? Math.round(grades.reduce((a, b) => a + b, 0) / grades.length) : null;

    const lastSub = studentSubs.length > 0 ? studentSubs.reduce((max, s) => s.created_at > max ? s.created_at : max, studentSubs[0].created_at) : null;
    const lastVideo = lastLpByStudent.get(student.id) ?? null;
    const lastActive = lastSub && lastVideo ? (lastSub > lastVideo ? lastSub : lastVideo) : lastSub ?? lastVideo;
    const isActive = !!lastActive && now - new Date(lastActive).getTime() < sevenDays;
    const needsSupport = pct < 30 && !isActive;

    // Current module: first unsubmitted lesson's course
    const nextLesson = allLessons.find((l) => !submittedIds.has(l.id));
    const currentModule = nextLesson?.courses?.title ?? (pct === 100 ? "All done!" : "—");
    const currentPillar = nextLesson?.courses?.pillar ?? "";

    return { student, pct, avgGrade, lastActive, isActive, needsSupport, colorIdx: idx % AVATAR_COLORS.length, currentModule, currentPillar };
  });

  // Filter by pillar
  const filtered = pillarFilter
    ? studentStats.filter((s) => s.currentPillar === pillarFilter || s.currentModule === "All done!")
    : studentStats;

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "name") return a.student.full_name.localeCompare(b.student.full_name);
    if (sort === "grade") return (b.avgGrade ?? 0) - (a.avgGrade ?? 0);
    if (sort === "active") return (b.lastActive ?? "").localeCompare(a.lastActive ?? "");
    return b.pct - a.pct; // default: completion
  });

  // Summary stats
  const avgPct = studentStats.length > 0 ? Math.round(studentStats.reduce((s, x) => s + x.pct, 0) / studentStats.length) : 0;
  const activeCount = studentStats.filter((s) => s.isActive).length;
  const needsSupportCount = studentStats.filter((s) => s.needsSupport).length;

  // Cohort info
  const { data: cohortData } = await supabase
    .from("cohorts")
    .select("name")
    .eq("instructor_id", user.id)
    .order("created_at")
    .limit(1)
    .maybeSingle();
  const cohortName = (cohortData as { name?: string } | null)?.name ?? null;

  return (
    <>
      <DashboardHeader heading="My Students" />
      <div className="mx-auto w-full max-w-7xl flex-1 space-y-5 p-6">

        {/* Header row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {cohortName && (
              <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
                Cohort: {cohortName}
              </p>
            )}
            <h2 className="font-display text-2xl font-semibold tracking-tight">Student Progress Tracker</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Monitor academic performance and engagement across your assigned students.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`mailto:${students.map((s) => s.email).join(",")}`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-primary px-3 py-2 text-xs font-semibold text-[#f0f7f5] hover:opacity-90"
            >
              Message All
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl bg-card p-4 shadow-ambient">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Total Students</p>
            <p className="mt-1.5 font-display text-3xl font-bold">{students.length}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{assignedIds.length > 0 ? "assigned to you" : "platform total"}</p>
          </div>
          <div className="rounded-2xl bg-card p-4 shadow-ambient">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Avg Completion</p>
            <div className="mt-1.5 flex items-end gap-2">
              <p className="font-display text-3xl font-bold">{avgPct}%</p>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-gradient-primary" style={{ width: `${avgPct}%` }} />
            </div>
          </div>
          <div className="rounded-2xl bg-card p-4 shadow-ambient">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Active Now</p>
            <p className="mt-1.5 font-display text-3xl font-bold">{activeCount}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Activity this week</p>
          </div>
          <div className="rounded-2xl bg-card p-4 shadow-ambient">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Needs Support</p>
            <p className={`mt-1.5 font-display text-3xl font-bold ${needsSupportCount > 0 ? "text-destructive" : "text-foreground"}`}>
              {needsSupportCount}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Low progress + inactive</p>
          </div>
        </div>

        {/* Filter + Sort bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Pillar filter tabs */}
          <div className="flex items-center gap-1 rounded-xl bg-muted/50 p-1">
            <Link
              href={`?sort=${sort}`}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${!pillarFilter ? "bg-card text-foreground shadow-ambient" : "text-muted-foreground hover:text-foreground"}`}
            >
              All Students
            </Link>
            {PILLAR_TABS.map((p) => (
              <Link
                key={p}
                href={`?pillar=${encodeURIComponent(p)}&sort=${sort}`}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${pillarFilter === p ? "bg-card text-foreground shadow-ambient" : "text-muted-foreground hover:text-foreground"}`}
              >
                {p.split(" ")[0]}
              </Link>
            ))}
          </div>

          {/* Sort */}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground">Sort by</span>
            <div className="flex items-center gap-1 rounded-xl bg-muted/50 p-1">
              {(["completion", "grade", "active", "name"] as const).map((s) => (
                <Link
                  key={s}
                  href={`?${pillarFilter ? `pillar=${encodeURIComponent(pillarFilter)}&` : ""}sort=${s}`}
                  className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold capitalize transition-colors ${sort === s ? "bg-card text-foreground shadow-ambient" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {s === "completion" ? "Progress" : s === "active" ? "Last Active" : s.charAt(0).toUpperCase() + s.slice(1)}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-[1.75rem] bg-muted/40 shadow-ambient">
          <div className="overflow-x-auto">
            <table className="w-full min-w-180">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Student</th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Current Module</th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Track</th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Progress (%)</th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Grade</th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Last Active</th>
                  <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {sorted.map((s) => (
                  <tr key={s.student.id} className="group bg-card/50 transition-colors hover:bg-card">
                    {/* Student */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${AVATAR_COLORS[s.colorIdx]}`}>
                          {initials(s.student.full_name || s.student.email)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-foreground">{s.student.full_name || "—"}</p>
                          <p className="truncate text-[10px] text-muted-foreground">{s.student.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Current Module */}
                    <td className="px-4 py-3.5">
                      <p className="max-w-35 truncate text-xs font-medium text-foreground/80">{s.currentModule}</p>
                    </td>

                    {/* Track */}
                    <td className="px-4 py-3.5">
                      {s.currentPillar ? (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${PILLAR_BADGE[s.currentPillar] ?? "bg-secondary text-primary"}`}>
                          {s.currentPillar.split(" ")[0]}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>

                    {/* Progress */}
                    <td className="px-4 py-3.5">
                      <div className="min-w-30">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold tabular-nums">{s.pct}%</span>
                        </div>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-gradient-primary" style={{ width: `${s.pct}%` }} />
                        </div>
                      </div>
                    </td>

                    {/* Grade */}
                    <td className="px-4 py-3.5">
                      {s.avgGrade !== null ? (
                        <span className={`inline-flex h-7 min-w-7 items-center justify-center rounded-lg px-2 text-xs font-bold ${s.avgGrade >= 80 ? "bg-gradient-primary text-[#f0f7f5]" : s.avgGrade >= 60 ? "bg-secondary text-primary" : "bg-destructive/10 text-destructive"}`}>
                          {toLetterGrade(s.avgGrade)}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      {s.needsSupport ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-1 text-[10px] font-bold text-destructive">
                          <AlertTriangle className="h-3 w-3" /> Needs Help
                        </span>
                      ) : s.isActive ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                          On Track
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">
                          <Clock className="h-3 w-3" /> Inactive
                        </span>
                      )}
                    </td>

                    {/* Last Active */}
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-muted-foreground">{s.lastActive ? timeAgo(s.lastActive) : "Never"}</span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/dashboard/instructor/students/${s.student.id}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-secondary px-2.5 py-1.5 text-[11px] font-semibold text-primary transition-colors hover:bg-primary hover:text-[#f0f7f5]"
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </Link>
                        <Link
                          href={`/dashboard/instructor/grading?student=${s.student.id}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
                          title="Review submissions"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                        </Link>
                        <a
                          href={`mailto:${s.student.email}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
                          title="Send email"
                        >
                          @
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-border/40 px-5 py-3">
            <p className="text-[11px] text-muted-foreground">
              Showing {sorted.length} of {students.length} student{students.length !== 1 ? "s" : ""}.
              {needsSupportCount > 0 && (
                <span className="ml-1 font-semibold text-destructive">
                  {needsSupportCount} need{needsSupportCount !== 1 ? "" : "s"} attention.
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

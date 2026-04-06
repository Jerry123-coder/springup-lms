import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  GraduationCap,
  Star,
  TrendingUp,
  Users,
  Users2,
  Zap,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { cn } from "@/lib/utils";

interface SubmissionRow {
  id: string;
  status: string;
  created_at: string;
  grade: number | null;
  profiles: { full_name: string; email: string } | null;
  lessons: { title: string; courses: { title: string; pillar: string } | null } | null;
}

function timeAgo(ts: string): string {
  const ms = Date.now() - new Date(ts).getTime();
  const m = Math.floor(ms / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const PILLAR_PILL: Record<string, string> = {
  "Digital Literacy": "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  "Career Readiness": "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  "Life Skills": "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  "Cultural Identity": "bg-rose-500/15 text-rose-700 dark:text-rose-300",
};

// Coloured type label for the activity feed
function ActivityBadge({ type }: { type: "submission" | "video" | "enrolled" }) {
  if (type === "enrolled")
    return (
      <span className="shrink-0 rounded-full bg-sky-500/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-300">
        New Student
      </span>
    );
  if (type === "submission")
    return (
      <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
        Submitted
      </span>
    );
  return (
    <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-300">
      Completed
    </span>
  );
}

export default async function InstructorOverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const instructorName =
    (profile as { full_name?: string } | null)?.full_name?.split(" ")[0] ?? "Instructor";

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Assigned students
  const { data: assignments } = await supabase
    .from("instructor_student_assignments")
    .select("student_id")
    .eq("instructor_id", user.id);

  const assignedIds = ((assignments ?? []) as { student_id: string }[]).map((a) => a.student_id);

  const { count: totalStudentCount } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "student");

  const studentCount = assignedIds.length > 0 ? assignedIds.length : (totalStudentCount ?? 0);

  // Cohorts
  const { count: cohortCount } = await supabase
    .from("cohorts")
    .select("id", { count: "exact", head: true })
    .eq("instructor_id", user.id);

  // Submissions
  const { data: allSubsData } = await supabase
    .from("submissions")
    .select(
      "id, status, created_at, grade, profiles!inner(full_name, email), lessons!inner(title, courses!inner(title, pillar))"
    )
    .order("created_at", { ascending: false });

  const allSubs = (allSubsData ?? []) as unknown as SubmissionRow[];
  const pending = allSubs.filter((s) => s.status === "pending");
  const reviewed = allSubs.filter((s) => s.status === "reviewed");

  // Completion rate
  const completionPct =
    allSubs.length > 0 ? Math.round((reviewed.length / allSubs.length) * 100) : 0;

  // Avg grade (engagement proxy)
  const gradedSubs = reviewed.filter((s) => s.grade !== null);
  const avgGrade =
    gradedSubs.length > 0
      ? Math.round(gradedSubs.reduce((sum, s) => sum + (s.grade ?? 0), 0) / gradedSubs.length)
      : null;

  // Recent activity feed
  type LpRow = {
    student_id: string;
    video_watched_at: string;
    lessons: { title: string; courses: { title: string } | null } | null;
  };
  const { data: recentLp } = await supabase
    .from("lesson_progress")
    .select("student_id, video_watched_at, lessons!inner(title, courses!inner(title))")
    .not("video_watched_at", "is", null)
    .order("video_watched_at", { ascending: false })
    .limit(8);
  const lpRows = (recentLp ?? []) as unknown as LpRow[];

  const lpStudentIds = [...new Set(lpRows.map((r) => r.student_id))];
  let lpNames = new Map<string, string>();
  if (lpStudentIds.length > 0) {
    const { data: lpProfs } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", lpStudentIds);
    lpNames = new Map(
      ((lpProfs ?? []) as { id: string; full_name: string; email: string }[]).map((p) => [
        p.id,
        p.full_name || p.email,
      ])
    );
  }

  type ActivityItem = {
    id: string;
    type: "submission" | "video" | "enrolled";
    name: string;
    detail: string;
    course: string;
    ts: string;
    subId?: string;
  };

  const activity: ActivityItem[] = [
    ...allSubs.slice(0, 6).map((s) => ({
      id: `sub-${s.id}`,
      type: "submission" as const,
      name: s.profiles?.full_name || s.profiles?.email || "Student",
      detail: s.lessons?.title ?? "lesson",
      course: s.lessons?.courses?.title ?? "",
      ts: s.created_at,
      subId: s.id,
    })),
    ...lpRows.slice(0, 4).map((r) => ({
      id: `lp-${r.student_id}-${r.video_watched_at}`,
      type: "video" as const,
      name: lpNames.get(r.student_id) ?? "Student",
      detail: r.lessons?.title ?? "lesson",
      course: r.lessons?.courses?.title ?? "",
      ts: r.video_watched_at,
    })),
  ]
    .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
    .slice(0, 7);

  return (
    <>
      <DashboardHeader heading="Overview" />
      <div className="mx-auto w-full max-w-7xl flex-1 space-y-5 p-6">

        {/* ── Hero ──────────────────────────────────────── */}
        <section
          className="relative overflow-hidden rounded-[1.75rem] shadow-ambient"
          style={{
            background:
              "linear-gradient(128deg, #001a16 0%, #00342b 28%, #005a4d 55%, #087a6a 78%, #0a5c52 100%)",
          }}
        >
          <div className="pointer-events-none absolute -right-16 -top-24 h-80 w-80 rounded-full opacity-30 blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(255,204,170,0.6) 0%, transparent 65%)" }} />
          <div className="pointer-events-none absolute inset-0 opacity-[0.08]"
            style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
          <div className="pointer-events-none absolute bottom-0 right-6 top-1/2 -translate-y-1/2 md:right-12">
            <GraduationCap className="h-48 w-48 text-white/8" strokeWidth={1} />
          </div>

          <div className="relative z-10 flex flex-col gap-5 px-7 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:py-10">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#94d3c1]">
                Instructor Portal
              </p>
              <h2 className="mt-1.5 font-display text-3xl font-bold text-[#f0f7f5] sm:text-4xl">
                {greeting}, {instructorName}.
              </h2>
              <p className="mt-2 text-sm text-[#c8ebe2]/70">
                Your active cohorts are showing engagement this week.{" "}
                You have{" "}
                <span className="font-bold text-[#f0f7f5]">{studentCount}</span> active students
                across{" "}
                <span className="font-bold text-[#ffdcc2]">{cohortCount ?? 0}</span> cohort
                {(cohortCount ?? 0) !== 1 ? "s" : ""}.
              </p>
              {/* Inline mini stats */}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2">
                  <Users className="h-4 w-4 text-[#94d3c1]" />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#94d3c1]/70">
                      Active Students
                    </p>
                    <p className="font-display text-lg font-bold text-[#f0f7f5]">{studentCount}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2">
                  <Users2 className="h-4 w-4 text-[#ffdcc2]" />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#94d3c1]/70">
                      Active Cohorts
                    </p>
                    <p className="font-display text-lg font-bold text-[#f0f7f5]">
                      {String(cohortCount ?? 0).padStart(2, "0")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-2 sm:items-end">
              <Link
                href="/dashboard/instructor/grading"
                className="inline-flex items-center gap-2 rounded-xl bg-[#94d3c1] px-5 py-2.5 text-sm font-bold text-[#001a16] transition-opacity hover:opacity-90"
              >
                <ClipboardCheck className="h-4 w-4" />
                Grading Queue
                {pending.length > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#001a16]/20 px-1 text-[10px] font-bold">
                    {pending.length}
                  </span>
                )}
              </Link>
              <Link
                href="/dashboard/instructor/students"
                className="inline-flex items-center gap-2 rounded-xl bg-white/12 px-5 py-2.5 text-sm font-semibold text-[#f0f7f5] transition-colors hover:bg-white/20"
              >
                <Users className="h-4 w-4" />
                View Students
              </Link>
            </div>
          </div>
        </section>

        {/* ── Stat Cards ────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4">
          {/* Completion Rate */}
          <div className="rounded-2xl bg-card p-5 shadow-ambient">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Average Completion Rate
                </p>
                <p className="mt-2 font-display text-4xl font-bold tabular-nums tracking-tight">
                  {completionPct}%
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary">
                  <TrendingUp className="h-4 w-4 text-[#f0f7f5]" />
                </div>
                <span className="text-[10px] font-semibold text-primary">
                  {reviewed.length}/{allSubs.length} reviewed
                </span>
              </div>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-primary transition-[width] duration-700"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>

          {/* Student Engagement */}
          <div className="rounded-2xl bg-card p-5 shadow-ambient">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Student Engagement
                </p>
                <p className="mt-2 font-display text-4xl font-bold tabular-nums tracking-tight">
                  {avgGrade !== null ? `${avgGrade}` : "—"}
                  <span className="text-xl text-muted-foreground">/100</span>
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary">
                  <Star className="h-4 w-4 text-primary" />
                </div>
                <span className={cn(
                  "text-[10px] font-bold",
                  avgGrade !== null && avgGrade >= 75 ? "text-primary" : "text-muted-foreground"
                )}>
                  {avgGrade !== null
                    ? avgGrade >= 80 ? "High" : avgGrade >= 65 ? "Good" : "Needs Focus"
                    : "No data yet"}
                </span>
              </div>
            </div>
            {avgGrade !== null && (
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-primary"
                  style={{ width: `${avgGrade}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* ── Two-column: Activity + Queue ──────────────── */}
        <div className="grid gap-5 lg:grid-cols-[1fr_340px]">

          {/* Recent Activity */}
          <section className="rounded-[1.75rem] bg-muted/40 p-6 shadow-ambient">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-[#ffdcc2]" />
                <h3 className="font-display text-sm font-semibold">Recent Platform Activity</h3>
              </div>
              <Link href="/dashboard/instructor/students" className="text-xs font-semibold text-primary hover:underline">
                View All →
              </Link>
            </div>

            {activity.length === 0 ? (
              <div className="rounded-2xl bg-card/70 px-6 py-10 text-center">
                <BookOpen className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No activity yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {activity.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-xl bg-card/80 px-4 py-3 shadow-ambient"
                  >
                    {/* Avatar */}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-bold text-primary">
                      {item.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-semibold text-foreground">{item.name}</span>
                        <ActivityBadge type={item.type} />
                      </div>
                      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                        {item.type === "submission" ? "submitted" : "watched"}{" "}
                        <span className="font-medium text-foreground/80">{item.detail}</span>
                        {item.course && ` in ${item.course}`}
                      </p>
                    </div>

                    {/* Time + action */}
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="text-[10px] text-muted-foreground">{timeAgo(item.ts)}</span>
                      {item.subId && (
                        <Link
                          href={`/dashboard/instructor/reviews/${item.subId}`}
                          className="text-[10px] font-semibold text-primary hover:underline"
                        >
                          Grade Now →
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Create New Cohort CTA */}
            <Link
              href="/dashboard/instructor/cohorts"
              className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border/60 px-4 py-3 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              + Create New Cohort
            </Link>
          </section>

          {/* Grading Queue */}
          <section className="rounded-[1.75rem] bg-muted/40 p-5 shadow-ambient">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-primary" />
                <h3 className="font-display text-sm font-semibold">Grading Queue</h3>
              </div>
              <span className={cn(
                "flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-[10px] font-bold",
                pending.length > 0 ? "bg-accent/60 text-accent-foreground" : "bg-secondary text-primary"
              )}>
                {pending.length > 0 ? `${pending.length} Pending` : "All done"}
              </span>
            </div>

            {pending.length === 0 ? (
              <div className="flex flex-col items-center rounded-2xl bg-card/70 px-4 py-8 text-center">
                <CheckCircle2 className="mb-2 h-8 w-8 text-primary/40" />
                <p className="text-sm font-semibold">Queue clear!</p>
                <p className="mt-1 text-xs text-muted-foreground">No submissions waiting.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pending.slice(0, 5).map((sub) => {
                  const pillar = sub.lessons?.courses?.pillar ?? "";
                  const pillClass = PILLAR_PILL[pillar] ?? "bg-secondary text-primary";
                  return (
                    <div key={sub.id} className="rounded-xl border-l-[3px] border-l-accent bg-card shadow-ambient">
                      {/* Category header */}
                      <div className="border-b border-border/30 px-3 py-1.5">
                        <span className={cn("text-[9px] font-bold uppercase tracking-wider", pillClass.split(" ")[1])}>
                          {pillar || "Assignment"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-foreground">
                            {sub.lessons?.title ?? "Lesson"}
                          </p>
                          <p className="mt-0.5 text-[10px] text-muted-foreground">
                            {sub.profiles?.full_name || sub.profiles?.email || "Student"}
                            {" · "}{timeAgo(sub.created_at)}
                          </p>
                        </div>
                        <Link
                          href={`/dashboard/instructor/reviews/${sub.id}`}
                          className="shrink-0 rounded-lg bg-gradient-primary px-2.5 py-1.5 text-[10px] font-bold text-[#f0f7f5] hover:opacity-90"
                        >
                          Grade Now
                        </Link>
                      </div>
                    </div>
                  );
                })}
                {pending.length > 5 && (
                  <p className="pt-1 text-center text-[11px] text-muted-foreground">
                    +{pending.length - 5} more
                  </p>
                )}
              </div>
            )}

            <Link
              href="/dashboard/instructor/grading"
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-muted/60 px-4 py-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
            >
              Open Grading Dashboard
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </section>
        </div>
      </div>
    </>
  );
}

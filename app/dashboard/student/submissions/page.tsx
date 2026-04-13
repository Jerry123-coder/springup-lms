import Link from "next/link";
import {
  ClipboardCheck,
  FileText,
  CheckCircle2,
  Clock,
  Star,
  TrendingUp,
  ArrowRight,
  Trophy,
  ExternalLink,
  BookOpen,
  GraduationCap,
  Zap,
  MessageSquare,
  ChevronRight,
  ListTodo,
  Award,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

// ── Types ────────────────────────────────────────────────────────
interface SubRow {
  id: string;
  status: string;
  grade: number | null;
  feedback: string | null;
  created_at: string;
  file_url: string | null;
  lessons: {
    id: string;
    title: string;
    course_id: string;
    courses: { id: string; title: string } | null;
  } | null;
}

interface CertRow {
  id: string;
  course_id: string;
  certificate_number: string;
  issued_at: string;
  courses?: { title: string } | null;
}

interface UpcomingRow {
  id: string;
  title: string;
  course_id: string;
  order_index: number;
  courses: { id: string; title: string; pillar: string } | null;
}

// ── Helpers ──────────────────────────────────────────────────────
function toLetterGrade(score: number): string {
  if (score >= 95) return "A+";
  if (score >= 90) return "A";
  if (score >= 87) return "A-";
  if (score >= 83) return "B+";
  if (score >= 80) return "B";
  if (score >= 77) return "B-";
  if (score >= 73) return "C+";
  if (score >= 70) return "C";
  if (score >= 67) return "C-";
  if (score >= 60) return "D";
  return "F";
}

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return "Last week";
  return `${Math.floor(diffDays / 7)} weeks ago`;
}

function waitLabel(dateStr: string): { text: string; cls: string } {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0)
    return { text: "TODAY", cls: "bg-secondary text-primary" };
  if (diffDays <= 2)
    return { text: `${diffDays}D AGO`, cls: "bg-accent/50 text-accent-foreground" };
  return { text: `${diffDays}D AGO`, cls: "bg-destructive/10 text-destructive" };
}

const PILLAR_COLORS: Record<string, string> = {
  "Digital Literacy": "bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300",
  "Career Readiness": "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
  "Life Skills": "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
  "Cultural Identity": "bg-violet-100 text-violet-800 dark:bg-violet-950/40 dark:text-violet-300",
};

// ── Stat card ────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
  pct,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: boolean;
  pct?: number;
}) {
  return (
    <div className="rounded-2xl bg-card p-5 shadow-ambient">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${accent ? "bg-gradient-primary" : "bg-secondary"}`}
        >
          <Icon className={`h-4 w-4 ${accent ? "text-[#f0f7f5]" : "text-primary"}`} />
        </div>
      </div>
      <p className="mt-3 font-display text-3xl font-semibold tabular-nums tracking-tight text-foreground">
        {value}
      </p>
      {pct !== undefined && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-primary transition-[width]"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      {sub && (
        <p className="mt-1.5 text-xs text-muted-foreground">{sub}</p>
      )}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────
export default async function AssignmentCenterPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = "submitted" } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch everything in parallel
  const [subsRes, certsRes, lessonsCountRes, blockCoursesRes] = await Promise.all([
    supabase
    .from("submissions")
    .select(
        "id, status, grade, feedback, created_at, file_url, lessons!inner(id, title, course_id, courses!inner(id, title))"
    )
    .eq("student_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("certificates")
      .select("id, course_id, certificate_number, issued_at, courses(title)")
      .eq("student_id", user.id)
      .order("issued_at", { ascending: false }),
    supabase.from("lessons").select("id", { count: "exact", head: true }),
    supabase.from("learning_block_courses").select("course_id"),
  ]);

  const allSubs = (subsRes.data ?? []) as unknown as SubRow[];
  const allCerts = (certsRes.data ?? []) as unknown as CertRow[];
  const totalLessons = lessonsCountRes.count ?? 0;
  const pathCourseIds = [
    ...new Set(
      ((blockCoursesRes.data ?? []) as { course_id: string }[]).map(
        (bc) => bc.course_id
      )
    ),
  ];

  // Compute stats
  const pendingSubs = allSubs.filter((s) => s.status === "pending");
  const reviewedSubs = allSubs.filter((s) => s.status === "reviewed");
  const grades = reviewedSubs
    .filter((s) => s.grade !== null)
    .map((s) => s.grade as number);
  const avgGrade =
    grades.length > 0
      ? Math.round(grades.reduce((a, b) => a + b, 0) / grades.length)
      : null;
  const avgLetter = avgGrade !== null ? toLetterGrade(avgGrade) : "—";
  const submissionRate =
    totalLessons > 0
      ? Math.min(100, Math.round((allSubs.length / totalLessons) * 100))
      : 0;

  // Upcoming: learning path lessons without submissions
  const submittedLessonIds = new Set(
    allSubs.map((s) => s.lessons?.id).filter(Boolean) as string[]
  );

  let upcomingLessons: UpcomingRow[] = [];
  if (pathCourseIds.length > 0) {
    const { data: pathLessons } = await supabase
      .from("lessons")
      .select("id, title, course_id, order_index, courses!inner(id, title, pillar)")
      .in("course_id", pathCourseIds)
      .order("order_index", { ascending: true });

    upcomingLessons = ((pathLessons ?? []) as unknown as UpcomingRow[]).filter(
      (l) => !submittedLessonIds.has(l.id)
    );
  }

  // Group upcoming by course for display
  const upcomingByCourse = new Map<
    string,
    { courseTitle: string; pillar: string; lessons: UpcomingRow[] }
  >();
  for (const l of upcomingLessons) {
    const cid = l.course_id;
    if (!upcomingByCourse.has(cid)) {
      upcomingByCourse.set(cid, {
        courseTitle: l.courses?.title ?? "Course",
        pillar: l.courses?.pillar ?? "",
        lessons: [],
      });
    }
    upcomingByCourse.get(cid)!.lessons.push(l);
  }

  return (
    <>
      <DashboardHeader heading="Assignment Center" />
      <div className="mx-auto w-full max-w-7xl flex-1 space-y-6 p-6">

        {/* ── Hero / Page Title ─────────────────────────────────── */}
        <div className="rounded-[1.75rem] bg-muted/50 px-8 py-8 shadow-ambient sm:px-10">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Student Portal
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight md:text-3xl">
                Assignment Center
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Curating your path to academic excellence.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2 sm:mt-0">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-primary">
                <ClipboardCheck className="h-3.5 w-3.5" />
                {allSubs.length} total submission{allSubs.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* ── Stats row ──────────────────────────────────────── */}
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Submission Rate"
              value={`${submissionRate}%`}
              sub="Lessons with submissions"
              icon={TrendingUp}
              pct={submissionRate}
            />
            <StatCard
              label="Lessons Submitted"
              value={String(allSubs.length)}
              sub={`of ${totalLessons} total lessons`}
              icon={BookOpen}
            />
            <StatCard
              label="Pending Review"
              value={String(pendingSubs.length).padStart(2, "0")}
              sub={pendingSubs.length > 0 ? "Awaiting instructor" : "All reviewed!"}
              icon={Clock}
              accent={pendingSubs.length > 0}
            />
            <StatCard
              label="Avg. Grade"
              value={avgLetter}
              sub={avgGrade !== null ? `${avgGrade}/100 numeric avg` : "No grades yet"}
              icon={Star}
            />
          </div>
        </div>

        {/* ── Tab Navigation ─────────────────────────────────────── */}
        <div className="flex items-center gap-1 rounded-2xl bg-muted/40 p-1.5 shadow-ambient">
          <Link
            href="?tab=submitted"
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              tab !== "upcoming"
                ? "bg-card text-foreground shadow-ambient"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ClipboardCheck className="h-4 w-4" />
            Submitted Work
            <span
              className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                tab !== "upcoming" ? "bg-secondary text-primary" : "bg-muted text-muted-foreground"
              }`}
            >
              {allSubs.length}
            </span>
          </Link>
          <Link
            href="?tab=upcoming"
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              tab === "upcoming"
                ? "bg-card text-foreground shadow-ambient"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ListTodo className="h-4 w-4" />
            Upcoming Assignments
            <span
              className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                tab === "upcoming"
                  ? "bg-accent/50 text-accent-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {upcomingLessons.length}
            </span>
          </Link>
        </div>

        {tab === "upcoming" ? (
          /* ── UPCOMING ASSIGNMENTS ──────────────────────────────── */
          <div className="grid gap-6 xl:grid-cols-[1fr_304px]">
            <div className="space-y-6">
              {upcomingLessons.length === 0 ? (
                <div className="flex flex-col items-center rounded-[1.75rem] bg-muted/40 px-8 py-16 text-center shadow-ambient">
                  <Trophy className="mb-4 h-12 w-12 text-primary/40" />
                  <h3 className="font-display text-lg font-semibold">
                    All assignments done!
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    You have submitted work for every lesson in your learning path.
                  </p>
                </div>
              ) : (
                Array.from(upcomingByCourse.entries()).map(
                  ([courseId, { courseTitle, pillar, lessons: courseLessons }]) => (
                    <section
                      key={courseId}
                      className="rounded-[1.75rem] bg-muted/40 p-6 shadow-ambient sm:p-8"
                    >
                      <div className="mb-4 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            PILLAR_COLORS[pillar] ?? "bg-secondary text-primary"
                          }`}
                        >
                          {pillar}
                        </span>
                        <h3 className="font-display text-base font-semibold text-foreground">
                          {courseTitle}
                        </h3>
                        <span className="ml-auto rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-primary">
                          {courseLessons.length} remaining
                        </span>
                      </div>

                      <div className="space-y-2">
                        {courseLessons.map((lesson, idx) => (
                          <div
                            key={lesson.id}
                            className="group flex items-center gap-4 rounded-2xl bg-card p-4 shadow-ambient transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-5"
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-sm font-bold text-muted-foreground">
                              {lesson.order_index > 0 ? lesson.order_index : idx + 1}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-display text-sm font-semibold text-foreground">
                                {lesson.title}
                              </p>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                Assignment not yet submitted
                              </p>
                            </div>
                            <Link
                              href={`/dashboard/student/courses/${lesson.course_id}/lessons/${lesson.id}`}
                              className="flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-primary px-3 py-2 text-xs font-semibold text-[#f0f7f5] opacity-90 transition-opacity hover:opacity-100"
                            >
                              Open
                              <ArrowRight className="h-3 w-3" />
                            </Link>
                          </div>
                        ))}
                      </div>
                    </section>
                  )
                )
              )}
            </div>

            {/* Sidebar (reused) */}
            <aside className="space-y-4">
              <div className="rounded-2xl bg-card p-5 shadow-ambient">
                <div className="mb-3 flex items-center gap-2">
                  <ListTodo className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-sm font-semibold">Progress Overview</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Submitted</span>
                      <span className="font-semibold text-foreground">{allSubs.length}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-gradient-primary"
                        style={{ width: `${submissionRate}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Upcoming</span>
                      <span className="font-semibold text-foreground">{upcomingLessons.length}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-accent/70"
                        style={{
                          width: `${
                            totalLessons > 0
                              ? Math.round((upcomingLessons.length / totalLessons) * 100)
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="relative overflow-hidden rounded-2xl p-5"
                style={{
                  background:
                    "linear-gradient(135deg, #001a16 0%, #00342b 45%, #005a4d 100%)",
                }}
              >
                <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-30 blur-2xl"
                  style={{ background: "radial-gradient(circle at center, rgba(255,204,170,0.6) 0%, transparent 65%)" }}
                />
                <div className="relative">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                    <Zap className="h-4 w-4 text-[#ffdcc2]" />
                  </div>
                  <p className="font-display text-sm font-semibold text-[#f0f7f5]">
                    Keep the momentum
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-[#c8ebe2]/75">
                    Open your next lesson and keep progressing through the learning path.
                  </p>
                  <Link
                    href="/dashboard/student/catalog"
                    className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-white/15 py-2.5 text-xs font-semibold text-[#f0f7f5] transition-colors hover:bg-white/25"
                  >
                    Go to Catalog
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        ) : (
          /* ── SUBMITTED WORK ────────────────────────────────────── */
          <div className="grid gap-6 xl:grid-cols-[1fr_304px]">
            <div className="min-w-0 space-y-6">

              {/* Pending Review */}
              <section className="rounded-[1.75rem] bg-muted/40 p-6 shadow-ambient sm:p-8">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/50 text-accent-foreground">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-display text-base font-semibold">Pending Review</h3>
                      <p className="text-xs text-muted-foreground">
                        {pendingSubs.length} awaiting instructor feedback
                      </p>
                    </div>
                  </div>
                  <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-accent/50 px-2.5 text-xs font-bold text-accent-foreground">
                    {pendingSubs.length}
                  </span>
          </div>

                {pendingSubs.length === 0 ? (
                  <div className="flex flex-col items-center rounded-2xl bg-card/70 px-6 py-10 text-center shadow-ambient">
                    <CheckCircle2 className="mb-3 h-10 w-10 text-primary/40" />
                    <p className="font-display text-sm font-semibold">All caught up!</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      No submissions waiting for review right now.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingSubs.map((sub) => {
                      const { text: waitText, cls: waitCls } = waitLabel(sub.created_at);
                      const courseId = sub.lessons?.course_id;
                      const lessonId = sub.lessons?.id;
                      return (
                        <div
                          key={sub.id}
                          className="group flex items-center gap-4 rounded-2xl border-l-4 border-l-accent bg-card p-4 shadow-ambient transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-5"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/30 text-accent-foreground">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-display text-sm font-semibold leading-snug text-foreground">
                              {sub.lessons?.title ?? "Lesson"}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-muted-foreground">
                              {sub.lessons?.courses?.title ?? "Course"} &bull; Submitted{" "}
                              {timeAgo(sub.created_at)}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${waitCls}`}>
                              {waitText}
                </span>
                            {courseId && lessonId && (
                              <Link
                                href={`/dashboard/student/courses/${courseId}/lessons/${lessonId}`}
                                className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Completed Work */}
              <section className="rounded-[1.75rem] bg-muted/40 p-6 shadow-ambient sm:p-8">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-primary">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-display text-base font-semibold">Completed Work</h3>
                      <p className="text-xs text-muted-foreground">
                        {reviewedSubs.length} submission{reviewedSubs.length !== 1 ? "s" : ""} reviewed
                      </p>
                    </div>
                  </div>
                  <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-secondary px-2.5 text-xs font-bold text-primary">
                    {reviewedSubs.length}
              </span>
                </div>

                {reviewedSubs.length === 0 ? (
                  <div className="flex flex-col items-center rounded-2xl bg-card/70 px-6 py-10 text-center shadow-ambient">
                    <GraduationCap className="mb-3 h-10 w-10 text-muted-foreground/40" />
                    <p className="font-display text-sm font-semibold">No reviewed work yet</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Reviewed submissions with grades will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reviewedSubs.map((sub) => {
                      const courseId = sub.lessons?.course_id;
                      const lessonId = sub.lessons?.id;
                      const grade = sub.grade;
                      const letter = grade !== null ? toLetterGrade(grade) : null;
                      const gradeColor =
                        grade !== null && grade >= 80
                          ? "bg-gradient-primary text-[#f0f7f5]"
                          : grade !== null && grade >= 60
                          ? "bg-accent/50 text-accent-foreground"
                          : "bg-destructive/10 text-destructive";

                      return (
                        <div key={sub.id} className="rounded-2xl border-l-4 border-l-primary/40 bg-card p-4 shadow-ambient sm:p-5">
                          <div className="flex items-start gap-4">
                            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                              <CheckCircle2 className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="font-display text-sm font-semibold leading-snug text-foreground">
                                    {sub.lessons?.title ?? "Lesson"}
                                  </p>
                                  <p className="mt-0.5 text-xs text-muted-foreground">
                                    {sub.lessons?.courses?.title ?? "Course"}
                                  </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${gradeColor}`}>
                                    {grade !== null ? `${grade}/100` : "—"}
                                  </span>
                                  {letter && (
                                    <span className="hidden rounded-full bg-muted px-2 py-1 text-xs font-bold text-foreground sm:inline">
                                      {letter}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {sub.feedback && (
                                <p className="mt-2 line-clamp-2 rounded-xl bg-muted/50 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                                  <MessageSquare className="mr-1.5 inline h-3 w-3" />
                                  {sub.feedback}
                                </p>
                              )}
                              <div className="mt-3 flex flex-wrap items-center gap-2">
                                {courseId && lessonId && (
                                  <Link
                                    href={`/dashboard/student/courses/${courseId}/lessons/${lessonId}`}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-[#f0f7f5]"
                                  >
                                    Review Submission
                                    <ArrowRight className="h-3 w-3" />
                                  </Link>
                                )}
                                {sub.file_url && (
              <Link
                                    href={sub.file_url}
                target="_blank"
                rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                                    View file
                                    <ExternalLink className="h-3 w-3" />
              </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
          </div>
                )}
              </section>
            </div>

            {/* Right sidebar */}
            <aside className="space-y-4">
              <div className="rounded-2xl bg-card p-5 shadow-ambient">
                <div className="mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5 text-[#ffdcc2]" />
                  <h3 className="font-display text-sm font-semibold">Grades &amp; Feedback</h3>
                </div>
                {reviewedSubs.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Grades appear here once an instructor reviews your work.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {reviewedSubs.slice(0, 3).map((sub) => {
                      const grade = sub.grade;
                      const letter = grade !== null ? toLetterGrade(grade) : "—";
                      const isHigh = grade !== null && grade >= 80;
                      return (
                        <div key={sub.id} className="rounded-xl bg-muted/50 p-3">
                          <div className="flex items-start gap-2.5">
                            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${isHigh ? "bg-gradient-primary text-[#f0f7f5]" : "bg-secondary text-primary"}`}>
                              {letter}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-xs font-semibold text-foreground">
                                {sub.lessons?.title ?? "Lesson"}
                              </p>
                              <p className="truncate text-[10px] text-muted-foreground">
                                {sub.lessons?.courses?.title ?? "Course"}
                              </p>
                              {sub.feedback && (
                                <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-muted-foreground">
                                  {sub.feedback}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {reviewedSubs.length > 0 && (
                  <Link
                    href="/dashboard/student/progress"
                    className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-muted/60 py-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
                  >
                    View Full Report
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </div>

              <div className="rounded-2xl bg-card p-5 shadow-ambient">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-[#ffdcc2]" />
                    <h3 className="font-display text-sm font-semibold">Scholar Milestones</h3>
                  </div>
                  <Link href="/dashboard/student/certificates" className="text-[10px] font-semibold text-primary hover:underline">
                    View All
                  </Link>
                </div>
                {allCerts.length === 0 ? (
                  <div className="flex flex-col items-center py-4 text-center">
                    <div className="mb-3 flex gap-2">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground/30">
                          <Award className="h-5 w-5" />
        </div>
      ))}
    </div>
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      Complete a course to earn your first certificate milestone.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {allCerts.slice(0, 4).map((cert) => (
                      <div key={cert.id} className="flex items-center gap-3 rounded-xl bg-muted/50 px-3 py-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-primary shadow-sm">
                          <Trophy className="h-4 w-4 text-[#ffdcc2]" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[11px] font-semibold text-foreground">
                            {cert.courses?.title ?? "Course Complete"}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            #{cert.certificate_number} &bull;{" "}
                            {new Date(cert.issued_at).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                            })}
          </p>
        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div
                className="relative overflow-hidden rounded-2xl p-5"
                style={{ background: "linear-gradient(135deg, #001a16 0%, #00342b 45%, #005a4d 100%)" }}
              >
                <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-30 blur-2xl"
                  style={{ background: "radial-gradient(circle at center, rgba(255,204,170,0.6) 0%, transparent 65%)" }}
                />
                <div className="relative">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                    <Zap className="h-4 w-4 text-[#ffdcc2]" />
                  </div>
                  <p className="font-display text-sm font-semibold text-[#f0f7f5]">Continue Learning</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-[#c8ebe2]/75">
                    Keep the momentum — open your next lesson and stay on track.
                  </p>
                  <Link
                    href="/dashboard/student/catalog"
                    className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-white/15 py-2.5 text-xs font-semibold text-[#f0f7f5] transition-colors hover:bg-white/25"
                  >
                    Go to Catalog
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}

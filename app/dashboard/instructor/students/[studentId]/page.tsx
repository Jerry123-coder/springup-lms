import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle2,
  Circle,
  Clock,
  Eye,
  Mail,
  TrendingUp,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

interface PageProps {
  params: Promise<{ studentId: string }>;
}

function toLetterGrade(n: number) {
  if (n >= 90) return "A";
  if (n >= 80) return "B";
  if (n >= 70) return "C";
  if (n >= 60) return "D";
  return "F";
}
function timeAgo(ts: string) {
  const d = Math.floor((Date.now() - new Date(ts).getTime()) / 86_400_000);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d}d ago`;
  return `${Math.floor(d / 7)}w ago`;
}
function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

const PILLAR_PILL: Record<string, string> = {
  "Digital Literacy": "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  "Career Readiness": "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  "Life Skills": "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  "Cultural Identity": "bg-rose-500/15 text-rose-700 dark:text-rose-300",
};

export default async function StudentDetailPage({ params }: PageProps) {
  const { studentId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: sp } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, created_at")
    .eq("id", studentId)
    .eq("role", "student")
    .single();

  if (!sp) notFound();
  type Profile = { id: string; full_name: string; email: string; created_at: string };
  const student = sp as Profile;

  const [subsRes, progressRes, coursesRes, certsRes] = await Promise.all([
    supabase
      .from("submissions")
      .select("id, lesson_id, status, grade, feedback, created_at, lessons!inner(id, title, order_index, course_id, courses!inner(id, title, pillar))")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false }),
    supabase.from("lesson_progress").select("lesson_id, video_watched_at, updated_at").eq("student_id", studentId),
    supabase.from("courses").select("id, title, pillar, description"),
    supabase.from("certificates").select("id, course_id").eq("student_id", studentId),
  ]);

  type SubRow = {
    id: string; lesson_id: string; status: string; grade: number | null; feedback: string; created_at: string;
    lessons: { id: string; title: string; order_index: number; course_id: string; courses: { id: string; title: string; pillar: string } | null } | null;
  };

  const subs = (subsRes.data ?? []) as unknown as SubRow[];
  const progress = (progressRes.data ?? []) as { lesson_id: string; video_watched_at: string | null; updated_at: string }[];
  const courses = (coursesRes.data ?? []) as { id: string; title: string; pillar: string }[];
  const certs = (certsRes.data ?? []) as { id: string; course_id: string }[];
  const certCourseIds = new Set(certs.map((c) => c.course_id));

  // Per-course stats
  const subsByCourse = new Map<string, SubRow[]>();
  for (const s of subs) {
    const cid = s.lessons?.courses?.id; if (!cid) continue;
    const arr = subsByCourse.get(cid) ?? []; arr.push(s); subsByCourse.set(cid, arr);
  }

  const lessonCountByCourse = new Map<string, number>();
  for (const c of courses) {
    const { count } = await supabase.from("lessons").select("id", { count: "exact", head: true }).eq("course_id", c.id);
    lessonCountByCourse.set(c.id, count ?? 0);
  }

  const totalLessons = Array.from(lessonCountByCourse.values()).reduce((a, b) => a + b, 0);
  const submittedCount = new Set(subs.map((s) => s.lesson_id)).size;
  const pct = totalLessons > 0 ? Math.round((submittedCount / totalLessons) * 100) : 0;

  const gradedSubs = subs.filter((s) => s.status === "reviewed" && s.grade !== null);
  const avgGrade = gradedSubs.length > 0 ? Math.round(gradedSubs.reduce((s, x) => s + (x.grade ?? 0), 0) / gradedSubs.length) : null;

  const lastSub = subs.length > 0 ? subs[0].created_at : null;
  const lastLp = progress.length > 0 ? progress.sort((a, b) => b.updated_at.localeCompare(a.updated_at))[0].updated_at : null;
  const lastActive = lastSub && lastLp ? (lastSub > lastLp ? lastSub : lastLp) : lastSub ?? lastLp;
  const isActive = !!lastActive && Date.now() - new Date(lastActive).getTime() < 7 * 86_400_000;
  const needsSupport = pct < 30 && !isActive;

  return (
    <>
      <DashboardHeader heading="Student Profile" />
      <div className="mx-auto w-full max-w-6xl flex-1 space-y-6 p-6">

        <Link href="/dashboard/instructor/students" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Students
        </Link>

        {/* ── Student header ────────────────────────── */}
        <div className="flex flex-col gap-5 rounded-[1.75rem] bg-card p-6 shadow-ambient sm:flex-row sm:items-center sm:p-8">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-primary text-xl font-bold text-[#f0f7f5]">
            {initials(student.full_name || student.email)}
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-2xl font-bold">{student.full_name || "—"}</h2>
              {needsSupport ? (
                <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-bold text-destructive">Needs Support</span>
              ) : isActive ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" /> On Track
                </span>
              ) : (
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">Inactive</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{student.email}</p>
            <p className="text-xs text-muted-foreground">
              Enrolled {new Date(student.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={`mailto:${student.email}`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-muted px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-primary">
              <Mail className="h-4 w-4" /> Message
            </a>
            <Link href={`/dashboard/instructor/grading?student=${studentId}`}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-[#f0f7f5] hover:opacity-90">
              <Eye className="h-4 w-4" /> Review Work
            </Link>
          </div>
        </div>

        {/* ── Stats ─────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl bg-card p-5 shadow-ambient">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Completion</p>
            <p className="mt-2 font-display text-3xl font-bold">{pct}%</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-gradient-primary" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <div className="rounded-2xl bg-card p-5 shadow-ambient">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Avg Grade</p>
            {avgGrade !== null ? (
              <div className="mt-2 flex items-baseline gap-2">
                <span className={`font-display text-3xl font-bold ${avgGrade >= 80 ? "text-primary" : avgGrade >= 60 ? "text-[#c9844a]" : "text-destructive"}`}>
                  {toLetterGrade(avgGrade)}
                </span>
                <span className="text-sm text-muted-foreground">{avgGrade}/100</span>
              </div>
            ) : (
              <p className="mt-2 font-display text-3xl font-bold text-muted-foreground">—</p>
            )}
          </div>
          <div className="rounded-2xl bg-card p-5 shadow-ambient">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Submissions</p>
            <p className="mt-2 font-display text-3xl font-bold">{subs.length}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {subs.filter((s) => s.status === "pending").length} pending review
            </p>
          </div>
          <div className="rounded-2xl bg-card p-5 shadow-ambient">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Last Active</p>
            <p className="mt-2 font-display text-xl font-semibold">{lastActive ? timeAgo(lastActive) : "Never"}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {lastActive ? new Date(lastActive).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "No activity"}
            </p>
          </div>
        </div>

        {/* ── Two-col: courses + submissions ─────────── */}
        <div className="grid gap-6 xl:grid-cols-[1fr_340px]">

          {/* Course progress */}
          <section className="rounded-[1.75rem] bg-muted/40 p-6 shadow-ambient">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="font-display text-base font-semibold">Course Progress</h3>
            </div>
            <div className="space-y-3">
              {courses.map((course) => {
                const courseSubs = subsByCourse.get(course.id) ?? [];
                const total = lessonCountByCourse.get(course.id) ?? 0;
                const submitted = courseSubs.length;
                const cpct = total > 0 ? Math.round((submitted / total) * 100) : 0;
                const reviewed = courseSubs.filter((s) => s.status === "reviewed" && s.grade !== null);
                const cAvg = reviewed.length > 0 ? Math.round(reviewed.reduce((a, s) => a + (s.grade ?? 0), 0) / reviewed.length) : null;
                const pillClass = PILLAR_PILL[course.pillar] ?? "bg-secondary text-primary";
                const hasCert = certCourseIds.has(course.id);
                const pending = courseSubs.filter((s) => s.status === "pending");

                return (
                  <div key={course.id} className={`rounded-2xl p-4 shadow-ambient ${cpct === 100 ? "border-l-4 border-l-primary bg-secondary/30" : submitted > 0 ? "border-l-4 border-l-[#ffdcc2] bg-card" : "bg-card/60"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${pillClass}`}>{course.pillar}</span>
                          {hasCert && (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                              <Award className="h-3 w-3" /> Certified
                            </span>
                          )}
                          {pending.length > 0 && (
                            <span className="rounded-full bg-accent/40 px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
                              {pending.length} pending
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-foreground">{course.title}</p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {submitted}/{total} submitted{cAvg !== null && ` · Avg ${cAvg}/100 (${toLetterGrade(cAvg)})`}
                        </p>
                      </div>
                      <span className={`font-display text-2xl font-bold shrink-0 ${cpct === 100 ? "text-primary" : submitted > 0 ? "text-foreground" : "text-muted-foreground/30"}`}>{cpct}%</span>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-gradient-primary" style={{ width: `${cpct}%` }} />
                    </div>
                    {/* Lesson dot indicators */}
                    {submitted > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1">
                        {courseSubs.map((sub, i) => (
                          <Link key={sub.id} href={`/dashboard/instructor/reviews/${sub.id}`}
                            className={`flex h-6 w-6 items-center justify-center rounded-lg text-[9px] font-bold transition-colors hover:scale-110 ${sub.status === "reviewed" ? "bg-primary/15 text-primary" : "bg-accent/40 text-accent-foreground"}`}
                            title={`${sub.lessons?.title ?? `Lesson ${i + 1}`}${sub.grade != null ? ` — ${sub.grade}/100` : " — Pending"}`}
                          >
                            {sub.status === "reviewed" ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                          </Link>
                        ))}
                        {/* Remaining unsubmitted */}
                        {Array.from({ length: total - submitted }, (_, i) => (
                          <div key={`empty-${i}`} className="flex h-6 w-6 items-center justify-center rounded-lg border border-border/40 bg-transparent">
                            <Circle className="h-3 w-3 text-muted-foreground/30" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Submissions sidebar */}
          <div className="space-y-4">
            <section className="rounded-[1.75rem] bg-muted/40 p-5 shadow-ambient">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <h3 className="font-display text-sm font-semibold">Submissions</h3>
                </div>
                <span className="text-xs text-muted-foreground">{subs.length} total</span>
              </div>

              {subs.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted-foreground">No submissions yet.</p>
              ) : (
                <div className="space-y-1.5">
                  {subs.slice(0, 10).map((sub) => (
                    <Link key={sub.id} href={`/dashboard/instructor/reviews/${sub.id}`}
                      className="flex items-center gap-3 rounded-xl bg-card px-3 py-2.5 shadow-ambient transition-all hover:-translate-y-0.5 hover:shadow-md">
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${sub.status === "reviewed" ? "bg-secondary text-primary" : "bg-accent/30 text-accent-foreground"}`}>
                        {sub.status === "reviewed" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-semibold text-foreground">{sub.lessons?.title ?? "Lesson"}</p>
                        <p className="truncate text-[10px] text-muted-foreground">{sub.lessons?.courses?.title ?? "Course"} · {timeAgo(sub.created_at)}</p>
                      </div>
                      {sub.grade !== null ? (
                        <span className={`shrink-0 rounded-lg px-2 py-0.5 text-[11px] font-bold ${sub.grade >= 80 ? "bg-gradient-primary text-[#f0f7f5]" : sub.grade >= 60 ? "bg-secondary text-primary" : "bg-destructive/10 text-destructive"}`}>
                          {sub.grade}
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-full bg-accent/30 px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">Pending</span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Pending review CTA */}
            {subs.filter((s) => s.status === "pending").length > 0 && (
              <Link href={`/dashboard/instructor/grading?student=${studentId}`}
                className="flex items-center gap-3 rounded-2xl bg-gradient-primary px-5 py-4 shadow-ambient hover:opacity-90">
                <Eye className="h-5 w-5 text-[#f0f7f5]" />
                <div>
                  <p className="text-sm font-bold text-[#f0f7f5]">Grade Pending Submissions</p>
                  <p className="text-xs text-[#c8ebe2]/80">
                    {subs.filter((s) => s.status === "pending").length} awaiting your review
                  </p>
                </div>
                <ArrowLeft className="ml-auto h-4 w-4 rotate-180 text-[#f0f7f5]/60" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

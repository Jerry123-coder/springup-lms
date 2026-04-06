import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Mail,
  MapPin,
  Star,
  Trophy,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import type { Course } from "@/lib/types/database";

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

const PILLAR_COLORS: Record<
  string,
  { pill: string; badge: string; dot: string }
> = {
  "Digital Literacy": {
    pill: "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-800/40 dark:bg-sky-950/40 dark:text-sky-300",
    badge: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
    dot: "bg-sky-500",
  },
  "Career Readiness": {
    pill: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800/40 dark:bg-amber-950/40 dark:text-amber-300",
    badge: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  "Life Skills": {
    pill: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-300",
    badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  "Cultural Identity": {
    pill: "border-violet-200 bg-violet-50 text-violet-900 dark:border-violet-800/40 dark:bg-violet-950/40 dark:text-violet-300",
    badge: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
    dot: "bg-violet-500",
  },
};

// ── Circular progress SVG ─────────────────────────────────────────
function CircularProgress({ pct }: { pct: number }) {
  const r = 42;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" aria-label={`${pct}% complete`}>
      <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="8" />
      <circle
        cx="60" cy="60" r={r}
        fill="none"
        stroke="#94d3c1"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 60 60)"
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
      <text x="60" y="56" textAnchor="middle" fontSize="22" fontWeight="700" fill="white" fontFamily="inherit">
        {pct}%
      </text>
      <text x="60" y="72" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.55)" fontFamily="inherit" letterSpacing="0.08em">
        COMPLETE
      </text>
    </svg>
  );
}

// ── Module types ─────────────────────────────────────────────────
type LessonRow = { id: string; course_id: string; order_index: number };
type CertRow = { course_id: string; certificate_number: string; issued_at: string };

type ModuleItem = {
  moduleNumber: number;
  course: Course;
  lessons: LessonRow[];
  totalLessons: number;
  completedLessons: number;
  pct: number;
  avgGrade: number | null;
  avgLetter: string | null;
  nextLesson: LessonRow | null;
  cert: CertRow | null;
  status: "completed" | "active" | "upcoming";
};

// ── Completed module card ────────────────────────────────────────
function CompletedCard({ mod }: { mod: ModuleItem }) {
  return (
    <div className="flex-1 rounded-2xl bg-card p-5 shadow-ambient ring-1 ring-border/60 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Module #{mod.moduleNumber}
          </p>
          <h3 className="mt-1 font-display text-base font-semibold text-foreground">
            {mod.course.title}
          </h3>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Completed
        </span>
      </div>
      {mod.course.description && (
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {mod.course.description}
        </p>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <BookOpen className="h-3.5 w-3.5 text-primary" />
          <span className="font-medium text-foreground">{mod.completedLessons}/{mod.totalLessons}</span>{" "}lessons
        </span>
        {mod.avgLetter && (
          <span className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5 text-[#ffdcc2]" />
            Grade: <span className="font-semibold text-foreground">{mod.avgLetter}</span>
          </span>
        )}
        {mod.cert && (
          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-primary px-2.5 py-0.5 font-semibold text-[#f0f7f5]">
            <Trophy className="h-3 w-3" />#{mod.cert.certificate_number}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Active module card ────────────────────────────────────────────
function ActiveCard({ mod }: { mod: ModuleItem }) {
  return (
    <div
      className="relative flex-1 overflow-hidden rounded-2xl p-5 shadow-ambient sm:p-6"
      style={{ background: "linear-gradient(135deg, #001a16 0%, #00342b 40%, #005a4d 80%, #0a7a6a 100%)" }}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-25 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(255,204,170,0.8) 0%, transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)", backgroundSize: "16px 16px" }}
      />
      <div className="relative">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#94d3c1]/70">
              Active Curriculum &bull; Module {String(mod.moduleNumber).padStart(2, "0")}
            </p>
            <h3 className="mt-1 font-display text-xl font-bold text-[#f0f7f5]">{mod.course.title}</h3>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#94d3c1]/70">STATUS</p>
            <p className="font-display text-lg font-bold tabular-nums text-[#94d3c1]">{mod.pct}%</p>
            <p className="text-[9px] uppercase tracking-wider text-[#94d3c1]/60">COMPLETE</p>
          </div>
        </div>
        {mod.course.description && (
          <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-[#c8ebe2]/70">{mod.course.description}</p>
        )}
        <div className="mb-4">
          <div className="mb-1.5 flex items-center justify-between text-[10px]">
            <span className="font-semibold uppercase tracking-wider text-[#94d3c1]/70">Session Progress</span>
            <span className="text-[#94d3c1]/70">{mod.completedLessons}/{mod.totalLessons} lessons</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-[#94d3c1] transition-[width] duration-500" style={{ width: `${mod.pct}%` }} />
          </div>
        </div>
        {mod.nextLesson && (
          <Link
            href={`/dashboard/student/courses/${mod.course.id}/lessons/${mod.nextLesson.id}`}
            className="inline-flex items-center gap-2 rounded-xl bg-[#94d3c1] px-5 py-2.5 text-sm font-bold text-[#001a16] transition-opacity hover:opacity-90"
          >
            Resume Lesson <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}

// ── Upcoming module card ─────────────────────────────────────────
function UpcomingCard({ mod }: { mod: ModuleItem }) {
  return (
    <div className="flex-1 rounded-2xl bg-muted/30 p-5 opacity-60 ring-1 ring-border/40 sm:p-6">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Module #{mod.moduleNumber}</p>
      <h3 className="mt-1 font-display text-base font-semibold text-muted-foreground">{mod.course.title}</h3>
      {mod.course.description && (
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground/60">{mod.course.description}</p>
      )}
      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground/60">
        <BookOpen className="h-3.5 w-3.5" />
        {mod.totalLessons} lesson{mod.totalLessons !== 1 ? "s" : ""}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────
export async function StudentLearningRoadmap() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [blocksRes, blockCoursesRes, coursesRes, lessonsRes, subsRes, certsRes, profileRes] =
    await Promise.all([
      supabase.from("learning_blocks").select("id, order_index, title").order("order_index", { ascending: true }),
      supabase.from("learning_block_courses").select("block_id, course_id, order_index"),
      supabase.from("courses").select("*"),
      supabase.from("lessons").select("id, course_id, order_index").order("order_index", { ascending: true }),
      supabase.from("submissions").select("lesson_id, grade, status").eq("student_id", user.id),
      supabase.from("certificates").select("course_id, certificate_number, issued_at").eq("student_id", user.id),
      supabase.from("profiles").select("full_name").eq("id", user.id).single(),
    ]);

  const blocks          = (blocksRes.data ?? []) as { id: string; order_index: number; title: string }[];
  const blockCourseRows = (blockCoursesRes.data ?? []) as { block_id: string; course_id: string; order_index: number }[];
  const allCourses      = (coursesRes.data ?? []) as Course[];
  const allLessons      = (lessonsRes.data ?? []) as LessonRow[];
  const subs            = (subsRes.data ?? []) as { lesson_id: string; grade: number | null; status: string }[];
  const certs           = (certsRes.data ?? []) as CertRow[];
  const studentName     = (profileRes.data as { full_name?: string } | null)?.full_name ?? "Student";

  const coursesByBlock = new Map<string, { course_id: string; order_index: number }[]>();
  for (const bc of blockCourseRows) {
    const arr = coursesByBlock.get(bc.block_id) ?? [];
    arr.push({ course_id: bc.course_id, order_index: bc.order_index });
    coursesByBlock.set(bc.block_id, arr);
  }

  const orderedCourseIds: string[] = [];
  for (const block of blocks) {
    const coursesInBlock = (coursesByBlock.get(block.id) ?? []).sort((a, b) => a.order_index - b.order_index);
    for (const bc of coursesInBlock) orderedCourseIds.push(bc.course_id);
  }

  const courseIdList = orderedCourseIds.length > 0 ? orderedCourseIds : allCourses.map((c) => c.id);
  const courseById   = new Map(allCourses.map((c) => [c.id, c]));

  const lessonsByCourse = new Map<string, LessonRow[]>();
  for (const l of allLessons) {
    const arr = lessonsByCourse.get(l.course_id) ?? [];
    arr.push(l);
    lessonsByCourse.set(l.course_id, arr);
  }

  const submittedLessonIds = new Set(subs.map((s) => s.lesson_id));
  const gradedByLesson     = new Map<string, number>(
    subs.filter((s) => s.status === "reviewed" && s.grade !== null).map((s) => [s.lesson_id, s.grade as number])
  );
  const certByCourse = new Map(certs.map((c) => [c.course_id, c]));

  const rawModules = courseIdList
    .filter((cid) => courseById.has(cid))
    .map((cid, idx) => {
      const course    = courseById.get(cid)!;
      const lessons   = (lessonsByCourse.get(cid) ?? []).sort((a, b) => a.order_index - b.order_index);
      const total     = lessons.length;
      const completed = lessons.filter((l) => submittedLessonIds.has(l.id)).length;
      const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;
      const grades    = lessons.filter((l) => gradedByLesson.has(l.id)).map((l) => gradedByLesson.get(l.id)!);
      const avgGrade  = grades.length > 0 ? Math.round(grades.reduce((a, b) => a + b, 0) / grades.length) : null;
      const nextLesson = lessons.find((l) => !submittedLessonIds.has(l.id)) ?? null;
      const cert       = certByCourse.get(cid) ?? null;
      return { moduleNumber: idx + 1, course, lessons, totalLessons: total, completedLessons: completed, pct, avgGrade, avgLetter: avgGrade !== null ? toLetterGrade(avgGrade) : null, nextLesson, cert };
    });

  let foundActive = false;
  const modules: ModuleItem[] = rawModules.map((m) => {
    let status: ModuleItem["status"];
    if (m.pct === 100)     { status = "completed"; }
    else if (!foundActive) { status = "active"; foundActive = true; }
    else                   { status = "upcoming"; }
    return { ...m, status };
  });

  const totalLessons   = modules.reduce((s, m) => s + m.totalLessons, 0);
  const doneLessons    = modules.reduce((s, m) => s + m.completedLessons, 0);
  const overallPct     = totalLessons > 0 ? Math.round((doneLessons / totalLessons) * 100) : 0;
  const completedModules = modules.filter((m) => m.status === "completed");
  const activeModule   = modules.find((m) => m.status === "active");
  const earnedCertCount = certs.length;

  if (modules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[1.75rem] bg-muted/40 px-6 py-20 text-center shadow-ambient">
        <GraduationCap className="mb-4 h-12 w-12 text-muted-foreground/40" />
        <h3 className="font-display text-lg font-semibold">Learning path not set up yet</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Your programme&apos;s courses will appear here once your admin configures the learning path sequence.
        </p>
        <Link href="/dashboard/student/catalog" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-[#f0f7f5]">
          Browse Catalog <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_288px]">
      {/* ── LEFT: Hero + Timeline ─────────────────────────────── */}
      <div className="space-y-6">
        {/* Hero banner */}
        <div
          className="relative overflow-hidden rounded-[1.75rem] p-6 shadow-ambient sm:p-8"
          style={{ background: "linear-gradient(148deg, #001a16 0%, #00342b 35%, #005a4d 65%, #0a7a6a 100%)" }}
        >
          <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, rgba(255,204,170,0.9) 0%, transparent 70%)" }} />
          <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#94d3c1]/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#94d3c1]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#94d3c1]" />
                  Enrollment Active
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/60">
                  Learning Roadmap
                </span>
              </div>
              <h2 className="font-display text-2xl font-bold leading-snug tracking-tight text-[#f0f7f5] sm:text-3xl">
                Your ICT Certification Journey
              </h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-[#c8ebe2]/70">
                Mapping your progress through essential modern workforce technologies. Complete the sequence to earn your professional certification.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-5">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#94d3c1]/60">Modules</p>
                  <p className="font-display text-xl font-bold text-[#f0f7f5]">
                    {completedModules.length}<span className="text-sm font-normal text-[#94d3c1]/60">/{modules.length}</span>
                  </p>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#94d3c1]/60">Lessons Done</p>
                  <p className="font-display text-xl font-bold text-[#f0f7f5]">
                    {doneLessons}<span className="text-sm font-normal text-[#94d3c1]/60">/{totalLessons}</span>
                  </p>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#94d3c1]/60">Credentials</p>
                  <p className="font-display text-xl font-bold text-[#f0f7f5]">
                    {earnedCertCount}<span className="text-sm font-normal text-[#94d3c1]/60">/{modules.length}</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="shrink-0 self-center sm:self-auto">
              <CircularProgress pct={overallPct} />
            </div>
          </div>
        </div>

        {/* ── Timeline ─────────────────────────────────────────── */}
        <div className="relative">
          <div className="absolute bottom-4 left-[1.2rem] top-3 w-px bg-border/50" />
          <div className="space-y-4">
            {modules.map((mod) => (
              <div key={mod.course.id} className="flex items-start gap-4">
                <div className="relative z-10 mt-1 shrink-0">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ring-4 ring-background transition-all ${
                    mod.status === "completed" ? "bg-primary text-[#f0f7f5]"
                    : mod.status === "active"  ? "bg-[#ffdcc2] text-[#001a16]"
                    : "bg-muted text-muted-foreground"
                  }`}>
                    {mod.status === "completed" ? <CheckCircle2 className="h-5 w-5" /> : String(mod.moduleNumber)}
                  </div>
                </div>
                {mod.status === "completed" ? <CompletedCard mod={mod} />
                  : mod.status === "active"  ? <ActiveCard mod={mod} />
                  : <UpcomingCard mod={mod} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT: Sidebar ───────────────────────────────────── */}
      <aside className="space-y-4">
        {/* Upcoming Milestones */}
        <div className="rounded-2xl bg-card p-5 shadow-ambient">
          <div className="mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[#ffdcc2]" />
            <h3 className="font-display text-sm font-semibold">Upcoming Milestones</h3>
          </div>
          {modules.filter((m) => m.status !== "completed").length === 0 ? (
            <div className="flex flex-col items-center py-4 text-center">
              <Trophy className="mb-2 h-8 w-8 text-primary/40" />
              <p className="text-xs text-muted-foreground">All milestones complete!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {modules.filter((m) => m.status !== "completed").slice(0, 3).map((m) => {
                const colors = PILLAR_COLORS[m.course.pillar] ?? PILLAR_COLORS["Digital Literacy"];
                return (
                  <div key={m.course.id} className="flex items-start gap-3 rounded-xl bg-muted/50 p-3">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${colors.badge}`}>
                      {m.moduleNumber}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-foreground">{m.course.title}</p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {m.status === "active"
                          ? `${m.pct}% — ${m.totalLessons - m.completedLessons} lesson${m.totalLessons - m.completedLessons !== 1 ? "s" : ""} remaining`
                          : `${m.totalLessons} lesson${m.totalLessons !== 1 ? "s" : ""} to start`}
                      </p>
                    </div>
                    {m.status === "active" && m.nextLesson && (
                      <Link
                        href={`/dashboard/student/courses/${m.course.id}/lessons/${m.nextLesson.id}`}
                        className="shrink-0 rounded-lg bg-primary/10 p-1.5 text-primary transition-colors hover:bg-primary hover:text-[#f0f7f5]"
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <Link href="/dashboard/student/certificates" className="mt-4 flex w-full items-center justify-center gap-1 rounded-xl bg-muted/50 py-2.5 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-primary">
            View Certificates <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Earned Credentials */}
        <div className="rounded-2xl bg-card p-5 shadow-ambient">
          <div className="mb-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-[#ffdcc2]" />
              <h3 className="font-display text-sm font-semibold">Earned Credentials</h3>
            </div>
            <span className="text-[10px] font-bold text-muted-foreground">{earnedCertCount}/{modules.length}</span>
          </div>
          <p className="mb-4 text-[10px] text-muted-foreground">Certificates issued for completed courses</p>
          <div className="grid grid-cols-4 gap-2">
            {modules.map((mod) => {
              const earned = !!mod.cert;
              return (
                <div key={mod.course.id} className="flex flex-col items-center gap-1.5" title={mod.course.title}>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all ${earned ? "bg-gradient-primary shadow-sm" : "bg-muted opacity-40"}`}>
                    {earned ? <Trophy className="h-5 w-5 text-[#ffdcc2]" /> : <GraduationCap className="h-5 w-5 text-muted-foreground" />}
                  </div>
                  <p className="text-center text-[9px] font-semibold leading-tight text-muted-foreground">M{mod.moduleNumber}</p>
                </div>
              );
            })}
          </div>
          {earnedCertCount > 0 && (
            <Link href="/dashboard/student/certificates" className="mt-4 flex w-full items-center justify-center gap-1 rounded-xl bg-secondary py-2.5 text-[11px] font-semibold text-primary transition-colors hover:bg-primary hover:text-[#f0f7f5]">
              View All Certificates <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>

        {/* Mentor Card */}
        <div
          className="relative overflow-hidden rounded-2xl p-5 shadow-ambient"
          style={{ background: "linear-gradient(135deg, #001a16 0%, #00342b 50%, #005a4d 100%)" }}
        >
          <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-25 blur-2xl" style={{ background: "radial-gradient(circle, rgba(255,204,170,0.8) 0%, transparent 70%)" }} />
          <div className="relative">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-primary shadow-sm ring-2 ring-[#94d3c1]/30">
                <GraduationCap className="h-5 w-5 text-[#f0f7f5]" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#94d3c1]/60">Your Mentor</p>
                <p className="font-display text-sm font-semibold text-[#f0f7f5]">Spring Up Team</p>
                <p className="text-[10px] text-[#94d3c1]/60">Academic Support</p>
              </div>
            </div>
            <p className="mb-4 text-[11px] leading-relaxed text-[#c8ebe2]/65">
              Reach out anytime with questions about your learning path, assignments, or career goals.
            </p>
            <a
              href="mailto:hello@springup.co.ke"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/15 py-2.5 text-xs font-semibold text-[#f0f7f5] transition-colors hover:bg-white/25"
            >
              <Mail className="h-3.5 w-3.5" />
              Message Mentor
            </a>
          </div>
        </div>
      </aside>
    </div>
  );
}

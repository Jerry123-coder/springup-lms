import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  ClipboardCheck,
  Clock,
  GraduationCap,
  Sparkles,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";

function firstName(fullName: string | null | undefined, email: string | null | undefined) {
  if (fullName?.trim()) {
    return fullName.trim().split(/\s+/)[0] ?? "there";
  }
  if (email?.includes("@")) {
    return email.split("@")[0] ?? "there";
  }
  return "there";
}

type ContinueTarget = {
  courseId: string;
  courseTitle: string;
  lessonId: string;
  lessonTitle: string;
  hint: "progress" | "submission" | "none";
};

export async function StudentLearningHub() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single();

  const p = profile as { full_name: string | null; email: string | null } | null;
  const greeting = firstName(p?.full_name, p?.email);

  const [
    lastProgressRes,
    lastSubmissionRes,
    pendingCountRes,
    reviewedCountRes,
    certCountRes,
    progressCoursesRes,
  ] = await Promise.all([
    supabase
      .from("lesson_progress")
      .select(
        `
        updated_at,
        lessons!inner (
          id,
          title,
          course_id,
          courses!inner ( id, title )
        )
      `
      )
      .eq("student_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("submissions")
      .select(
        `
        created_at,
        lessons!inner (
          id,
          title,
          course_id,
          courses!inner ( id, title )
        )
      `
      )
      .eq("student_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("submissions")
      .select("*", { count: "exact", head: true })
      .eq("student_id", user.id)
      .eq("status", "pending"),
    supabase
      .from("submissions")
      .select("*", { count: "exact", head: true })
      .eq("student_id", user.id)
      .eq("status", "reviewed"),
    supabase
      .from("certificates")
      .select("*", { count: "exact", head: true })
      .eq("student_id", user.id),
    supabase
      .from("lesson_progress")
      .select("lessons!inner(course_id)")
      .eq("student_id", user.id),
  ]);

  let continueTarget: ContinueTarget | null = null;

  const progressRow = lastProgressRes.data as unknown as {
    updated_at: string;
    lessons: {
      id: string;
      title: string;
      course_id: string;
      courses: { id: string; title: string };
    };
  } | null;

  const subRow = lastSubmissionRes.data as unknown as {
    created_at: string;
    lessons: {
      id: string;
      title: string;
      course_id: string;
      courses: { id: string; title: string };
    };
  } | null;

  const progressMs = progressRow?.updated_at
    ? new Date(progressRow.updated_at).getTime()
    : 0;
  const subMs = subRow?.created_at ? new Date(subRow.created_at).getTime() : 0;
  const preferProgress =
    progressRow?.lessons && (progressMs >= subMs || !subRow?.lessons);

  if (preferProgress && progressRow?.lessons) {
    const L = progressRow.lessons;
    continueTarget = {
      courseId: L.courses.id,
      courseTitle: L.courses.title,
      lessonId: L.id,
      lessonTitle: L.title,
      hint: "progress",
    };
  } else if (subRow?.lessons) {
    const L = subRow.lessons;
    continueTarget = {
      courseId: L.courses.id,
      courseTitle: L.courses.title,
      lessonId: L.id,
      lessonTitle: L.title,
      hint: "submission",
    };
  }

  const progressCourseRows = progressCoursesRes.data as unknown as
    | { lessons: { course_id: string } }[]
    | null;
  const coursesInProgress = new Set(
    (progressCourseRows ?? []).map((r) => r.lessons?.course_id).filter(Boolean)
  ).size;

  const pendingReviews = pendingCountRes.count ?? 0;
  const gradedCount = reviewedCountRes.count ?? 0;
  const totalSubs = pendingReviews + gradedCount;
  const certificatesEarned = certCountRes.count ?? 0;

  const stats = [
    {
      label: "Courses in progress",
      value: String(coursesInProgress),
      icon: BookOpen,
      caption: "With saved lesson activity",
    },
    {
      label: "Assignments",
      value: String(totalSubs),
      icon: ClipboardCheck,
      caption:
        totalSubs === 0
          ? "Submit work from any lesson"
          : pendingReviews > 0
            ? `${pendingReviews} awaiting feedback`
            : "All caught up",
    },
    {
      label: "Graded",
      value: String(gradedCount),
      icon: Sparkles,
      caption: "With instructor feedback",
    },
    {
      label: "Certificates",
      value: String(certificatesEarned),
      icon: Award,
      caption: "Programme milestones",
    },
  ];

  return (
    <div className="space-y-10 md:space-y-12">
      {/* stitch: main_dashboard — solid gradient hero + texture + watermark icon */}
      <section
        className="relative overflow-hidden rounded-[1.75rem] shadow-ambient"
        style={{
          background:
            "linear-gradient(128deg, #001a16 0%, #00342b 28%, #005a4d 55%, #087a6a 78%, #0a5c52 100%)",
        }}
      >
        {/* Warm accent glow (tertiary) */}
        <div
          className="pointer-events-none absolute -right-20 -top-32 h-[28rem] w-[28rem] rounded-full opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(circle at center, rgba(255, 204, 170, 0.45) 0%, transparent 62%)",
          }}
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full opacity-35 blur-3xl"
          style={{
            background:
              "radial-gradient(circle at center, rgba(148, 211, 193, 0.5) 0%, transparent 65%)",
          }}
        />
        {/* Fine dot grid — depth / paper texture */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-[0.14]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.55) 1.2px, transparent 1.2px)",
            backgroundSize: "18px 18px",
          }}
        />
        {/* SVG grain */}
        <div className="pointer-events-none absolute inset-0 rounded-[inherit] scholar-hero-grain" />
        {/* Inner highlight rim */}
        <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]" />

        {/* Large watermark icon */}
        <div className="pointer-events-none absolute -bottom-8 right-0 sm:bottom-auto sm:right-4 sm:top-1/2 sm:-translate-y-1/2 md:right-8">
          <GraduationCap
            className="h-40 w-40 text-white/[0.09] sm:h-48 sm:w-48 md:h-56 md:w-56"
            strokeWidth={1}
            aria-hidden
          />
        </div>

        <div className="relative z-10 max-w-3xl px-6 py-11 pl-8 sm:px-12 sm:py-14 sm:pl-14 md:py-16 md:pl-16">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#94d3c1]">
            Welcome back
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-[1.1] tracking-tight text-[#f0f7f5] drop-shadow-sm sm:text-4xl md:text-5xl md:leading-[1.08]">
            Hello, {greeting}
          </h2>
          <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-[#c8ebe2]/95 sm:text-lg">
            Your dashboard is the calm centre of your programme—resume a lesson, check
            assignments, or step into the{" "}
            <Link
              href="/dashboard/student/catalog"
              className="font-semibold text-[#ffdcc2] underline decoration-[#ffdcc2]/50 underline-offset-[5px] transition-colors hover:text-white hover:decoration-white/60"
            >
              full course catalog
            </Link>{" "}
            whenever you&apos;re ready.
          </p>
        </div>
      </section>

      {/* Bento stats — surface-container-low holding cards (DESIGN.md) */}
      <div className="rounded-[1.75rem] bg-muted/50 p-6 shadow-ambient sm:p-8 md:p-10">
        <p className="font-display text-sm font-medium text-muted-foreground">
          At a glance
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl bg-gradient-to-br from-card via-card to-secondary/45 p-6 shadow-ambient transition-transform duration-200 hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {s.label}
                  </p>
                  <p className="mt-3 font-display text-4xl font-semibold tabular-nums tracking-tight text-foreground">
                    {s.value}
                  </p>
                  <p className="mt-2 text-xs leading-snug text-muted-foreground">
                    {s.caption}
                  </p>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary">
                  <s.icon className="h-5 w-5" aria-hidden />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Continue — secondary-container glow (warm encouragement) */}
      <section className="rounded-[1.75rem] bg-secondary/70 p-6 shadow-ambient sm:p-8 md:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-xl font-semibold tracking-tight md:text-2xl">
                Continue learning
              </h3>
              {continueTarget ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {continueTarget.hint === "progress"
                    ? "Last lesson"
                    : "Recent activity"}
                </span>
              ) : null}
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-secondary-foreground/90 md:text-base">
              {continueTarget
                ? "Pick up exactly where you stopped—your place is saved."
                : "Start from the catalog: choose a course and open your first lesson."}
            </p>
          </div>
          {continueTarget ? (
            <Link
              href={`/dashboard/student/courses/${continueTarget.courseId}/lessons/${continueTarget.lessonId}`}
              className={cn(
                buttonVariants({ size: "lg", variant: "ghost" }),
                "inline-flex min-h-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-primary px-8 text-primary-foreground shadow-sm hover:bg-gradient-primary hover:opacity-90"
              )}
            >
              Resume
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          ) : null}
        </div>

        {continueTarget ? (
          <div className="mt-8 rounded-2xl bg-card/90 px-5 py-5 shadow-ambient sm:px-6 sm:py-6">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {continueTarget.courseTitle}
            </p>
            <p className="mt-2 font-display text-lg font-semibold text-foreground">
              {continueTarget.lessonTitle}
            </p>
          </div>
        ) : (
          <div className="mt-8 flex flex-col gap-4 rounded-2xl bg-card/60 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Your next lesson will appear here after you begin a course.
            </p>
            <Button
              asChild
              variant="ghost"
              className="min-h-12 rounded-2xl bg-card text-foreground shadow-sm hover:bg-card/90"
            >
              <Link href="/dashboard/student/catalog">Open course catalog</Link>
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}

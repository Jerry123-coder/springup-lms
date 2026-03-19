import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  ExternalLink,
  Keyboard,
  Layers,
} from "lucide-react";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { LessonSidebarList } from "@/components/dashboard/lesson-sidebar-list";
import { LessonNavigation } from "@/components/dashboard/lesson-navigation";
import { UploadForm } from "@/components/dashboard/upload-form";
import { CourseSidebarAutoCollapse } from "@/components/dashboard/course-sidebar-autocollapse";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type {
  Course,
  CoursePillar,
  Lesson,
  Submission,
} from "@/lib/types/database";

const pillarTheme: Record<
  CoursePillar,
  {
    bar: string;
    pill: string;
    icon: string;
    quote: { border: string; bg: string };
    lessonHoverBg: string;
    lessonHoverText: string;
  }
> = {
  "Digital Literacy": {
    bar: "from-sky-500/70 via-sky-400/20 to-transparent",
    pill:
      "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900/40 dark:bg-sky-950/40 dark:text-sky-300",
    icon: "text-sky-700 dark:text-sky-300",
    quote: {
      border: "border-sky-500/60 dark:border-sky-400/60",
      bg: "bg-sky-50/60 dark:bg-sky-950/30",
    },
    lessonHoverBg: "hover:bg-sky-100 dark:hover:bg-sky-400/15",
    lessonHoverText: "hover:text-sky-900 dark:hover:text-sky-200",
  },
  "Career Readiness": {
    bar: "from-amber-500/70 via-orange-400/20 to-transparent",
    pill:
      "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-300",
    icon: "text-amber-900 dark:text-amber-300",
    quote: {
      border: "border-amber-500/60 dark:border-amber-400/60",
      bg: "bg-amber-50/60 dark:bg-amber-950/30",
    },
    lessonHoverBg: "hover:bg-amber-100 dark:hover:bg-amber-400/15",
    lessonHoverText: "hover:text-amber-950 dark:hover:text-amber-200",
  },
  "Life Skills": {
    bar: "from-emerald-500/70 via-emerald-400/20 to-transparent",
    pill:
      "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300",
    icon: "text-emerald-900 dark:text-emerald-300",
    quote: {
      border: "border-emerald-500/60 dark:border-emerald-400/60",
      bg: "bg-emerald-50/60 dark:bg-emerald-950/30",
    },
    lessonHoverBg: "hover:bg-emerald-100 dark:hover:bg-emerald-400/15",
    lessonHoverText: "hover:text-emerald-950 dark:hover:text-emerald-200",
  },
  "Cultural Identity": {
    bar: "from-violet-500/70 via-violet-400/20 to-transparent",
    pill:
      "border-violet-200 bg-violet-50 text-violet-900 dark:border-violet-900/40 dark:bg-violet-950/40 dark:text-violet-300",
    icon: "text-violet-900 dark:text-violet-300",
    quote: {
      border: "border-violet-500/60 dark:border-violet-400/60",
      bg: "bg-violet-50/60 dark:bg-violet-950/30",
    },
    lessonHoverBg: "hover:bg-violet-100 dark:hover:bg-violet-400/15",
    lessonHoverText: "hover:text-violet-950 dark:hover:text-violet-200",
  },
};

const courseVideoById: Record<string, string> = {
  // Microsoft Word Proficiency
  "d1000000-0000-0000-0000-000000000001": "S-nHYzK-BVg",
  // Slides Foundations (PowerPoint / Google Slides)
  "d1000000-0000-0000-0000-000000000003": "ChEan-3U7B4",
};

function renderLessonLine(
  line: string,
  i: number,
  theme: (typeof pillarTheme)[CoursePillar]
) {
  if (line.startsWith("@youtube:")) {
    const id = line.slice("@youtube:".length).trim();
    if (!id) return null;
    return (
      <div
        key={`yt-${i}`}
        className="my-5 overflow-hidden rounded-xl border bg-muted/20"
      >
        <div className="aspect-video w-full bg-black/5">
          <iframe
            className="h-full w-full"
            src={`https://www.youtube.com/embed/${id}?rel=0`}
            title="Video tutorial"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }
  if (line.startsWith("### ")) {
    return (
      <h3 key={i} className="mt-4 mb-1 text-base font-semibold">
        {line.slice(4)}
      </h3>
    );
  }
  if (line.startsWith("# ")) {
    return (
      <h1 key={i} className="first:mt-0 mt-6 mb-2 text-xl font-bold">
        {line.slice(2)}
      </h1>
    );
  }
  if (line.startsWith("## ")) {
    return (
      <h2 key={i} className="mt-4 mb-1 text-lg font-semibold">
        {line.slice(3)}
      </h2>
    );
  }
  if (line.startsWith("- ")) {
    return (
      <li key={i} className="ml-4 list-disc">
        {line.slice(2)}
      </li>
    );
  }
  if (line.startsWith("> ")) {
    return (
      <blockquote
        key={i}
        className={`my-3 rounded-md border-l-2 ${theme.quote.border} ${theme.quote.bg} px-4 py-3 italic text-muted-foreground`}
      >
        {line.slice(2)}
      </blockquote>
    );
  }
  if (line.trim() === "") return <br key={i} />;
  return (
    <p key={i} className="leading-relaxed">
      {line}
    </p>
  );
}

export async function CourseClassroom({
  courseId,
  lessonId,
}: {
  courseId: string;
  lessonId?: string;
}) {
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .single();

  if (!course) notFound();

  const { data: lessons } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", courseId)
    .order("order_index", { ascending: true });

  const lessonList = (lessons ?? []) as Lesson[];
  const typedCourse = course as Course;
  const theme =
    pillarTheme[typedCourse.pillar] ?? pillarTheme["Digital Literacy"];

  const activeLesson = lessonId
    ? lessonList.find((l) => l.id === lessonId)
    : lessonList[0];
  const previewCount = Math.min(3, lessonList.length);
  const activeLessonNumber = activeLesson
    ? Math.max(lessonList.findIndex((l) => l.id === activeLesson.id), 0) + 1
    : 1;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Course progress: number of lessons with at least one submission
  const lessonIds = lessonList.map((l) => l.id);
  const completedLessonIds = new Set<string>();
  if (user && lessonIds.length > 0) {
    const { data: subs } = await supabase
      .from("submissions")
      .select("lesson_id")
      .eq("student_id", user.id)
      .in("lesson_id", lessonIds);
    (subs ?? []).forEach((s) => completedLessonIds.add((s as { lesson_id: string }).lesson_id));
  }

  const completedCount = completedLessonIds.size;
  const totalCount = lessonIds.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Fetch existing submissions for the active lesson
  let existingSubmission: Submission | null = null;
  if (activeLesson) {
    if (user) {
      const { data } = await supabase
        .from("submissions")
        .select("*")
        .eq("student_id", user.id)
        .eq("lesson_id", activeLesson.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      existingSubmission = data as Submission | null;
    }
  }

  return (
    <div className="flex h-full flex-col gap-2 overflow-hidden md:flex-row md:gap-0">
      <CourseSidebarAutoCollapse />
      {/* Lesson sidebar */}
      <aside
        className={`relative w-full shrink-0 overflow-hidden border shadow-sm md:sticky md:top-4 md:h-[calc(100svh-2rem)] md:w-72 md:self-start ${theme.quote.border}`}
      >
        {/* Deep theme background */}
        <div
          className={`pointer-events-none absolute inset-0 ${theme.quote.bg} opacity-70 md:opacity-90`}
        />

        {/* Desktop: full sidebar */}
        <div className="relative z-10 hidden h-full flex-col md:flex">
          <div className="relative flex-none overflow-hidden border-b p-4">
            <Button
              variant="ghost"
              size="sm"
              className="mb-3 -ml-2 gap-1.5 text-muted-foreground hover:text-foreground hover:bg-transparent"
              asChild
            >
              <Link href="/dashboard/student" className="group">
                <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                Back to Courses
              </Link>
            </Button>
            <h2 className="text-lg font-semibold leading-snug tracking-tight">
              {typedCourse.title}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${theme.pill}`}
              >
                {typedCourse.pillar}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Layers className={`h-3.5 w-3.5 ${theme.icon}`} />
                {lessonList.length} lessons
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className={`h-3.5 w-3.5 ${theme.icon}`} />
                Est. {Math.max(lessonList.length * 20, 30)}–{lessonList.length * 30} min
              </span>
            </div>
            {typedCourse.description && (
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                {typedCourse.description}
              </p>
            )}
          </div>

          {/* Lessons (scroll) */}
          <div className="flex-1 overflow-y-auto p-3">
            {lessonList.length > 0 ? (
              <LessonSidebarList
                lessons={lessonList}
                courseId={courseId}
                activePillClassName={theme.pill}
                lessonHoverBgClassName={theme.lessonHoverBg}
                lessonHoverTextClassName={theme.lessonHoverText}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                No lessons added yet.
              </p>
            )}
          </div>

          {/* Resources (pinned bottom) */}
          <div className="flex-none border-t p-3">
            <div className="rounded-lg border bg-card/30 p-3">
              <p className="text-xs font-semibold">Resources</p>
              <div className="mt-2 space-y-2 text-xs">
                <a
                  className="flex items-center justify-between gap-2 rounded-md px-2 py-1 text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
                  href="https://support.microsoft.com/word"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="inline-flex items-center gap-2">
                    <ExternalLink className={`h-3.5 w-3.5 ${theme.icon}`} />
                    Microsoft Word support
                  </span>
                  <span className="text-[10px] uppercase tracking-wide opacity-70">
                    Opens
                  </span>
                </a>
                <a
                  className="flex items-center justify-between gap-2 rounded-md px-2 py-1 text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
                  href="https://support.microsoft.com/office/keyboard-shortcuts-in-microsoft-word-95ef89dd-7142-4b50-afb2-f762f663ceb2"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="inline-flex items-center gap-2">
                    <Keyboard className={`h-3.5 w-3.5 ${theme.icon}`} />
                    Word keyboard shortcuts
                  </span>
                  <span className="text-[10px] uppercase tracking-wide opacity-70">
                    Opens
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: compact summary + lessons/resources in a sheet */}
        <div className="relative z-10 p-3 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                className="w-full rounded-xl border bg-card/60 px-3 py-2 text-left shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {typedCourse.title}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${theme.pill}`}
                      >
                        {typedCourse.pillar}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Layers className={`h-3.5 w-3.5 ${theme.icon}`} />
                        {previewCount} lessons
                      </span>
                    </div>

                    {activeLesson && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-background/60 text-xs font-semibold text-foreground">
                          {activeLessonNumber}
                        </span>
                        <p className="min-w-0 truncate text-xs text-muted-foreground">
                          Now taking: {activeLesson.title}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      asChild
                    >
                      <Link href="/dashboard/student" aria-label="Back to courses">
                        <ArrowLeft className="h-4 w-4" />
                      </Link>
                    </Button>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      View more
                    </span>
                  </div>
                </div>
              </button>
            </SheetTrigger>

            <SheetContent
              side="top"
              className="rounded-b-2xl border-x-0 border-b-0 p-0"
            >
              <div className="max-h-[85svh] overflow-hidden">
                <div className="relative overflow-hidden border-b p-4">
                  <div className={`pointer-events-none absolute inset-0 ${theme.quote.bg} opacity-70`} />
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mb-3 -ml-2 gap-1.5 text-muted-foreground hover:text-foreground"
                      asChild
                    >
                      <Link href="/dashboard/student" className="group">
                        <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                        Back to Courses
                      </Link>
                    </Button>
                    <h2 className="text-lg font-semibold leading-snug tracking-tight">
                      {typedCourse.title}
                    </h2>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${theme.pill}`}
                      >
                        {typedCourse.pillar}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Layers className={`h-3.5 w-3.5 ${theme.icon}`} />
                        {lessonList.length} lessons
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className={`h-3.5 w-3.5 ${theme.icon}`} />
                        Est. {Math.max(lessonList.length * 20, 30)}–{lessonList.length * 30} min
                      </span>
                    </div>
                    {typedCourse.description && (
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {typedCourse.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex max-h-[85svh] flex-col">
                  <div className="flex-1 overflow-y-auto p-3">
                    {lessonList.length > 0 ? (
                      <LessonSidebarList
                        lessons={lessonList}
                        courseId={courseId}
                        activePillClassName={theme.pill}
                        lessonHoverBgClassName={theme.lessonHoverBg}
                        lessonHoverTextClassName={theme.lessonHoverText}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No lessons added yet.
                      </p>
                    )}
                  </div>

                  <div className="flex-none border-t p-3">
                    <div className="rounded-lg border bg-card/30 p-3">
                      <p className="text-xs font-semibold">Resources</p>
                      <div className="mt-2 space-y-2 text-xs">
                        <a
                          className="flex items-center justify-between gap-2 rounded-md px-2 py-1 text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
                          href="https://support.microsoft.com/word"
                          target="_blank"
                          rel="noreferrer"
                        >
                          <span className="inline-flex items-center gap-2">
                            <ExternalLink
                              className={`h-3.5 w-3.5 ${theme.icon}`}
                            />
                            Microsoft Word support
                          </span>
                          <span className="text-[10px] uppercase tracking-wide opacity-70">
                            Opens
                          </span>
                        </a>
                        <a
                          className="flex items-center justify-between gap-2 rounded-md px-2 py-1 text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
                          href="https://support.microsoft.com/office/keyboard-shortcuts-in-microsoft-word-95ef89dd-7142-4b50-afb2-f762f663ceb2"
                          target="_blank"
                          rel="noreferrer"
                        >
                          <span className="inline-flex items-center gap-2">
                            <Keyboard className={`h-3.5 w-3.5 ${theme.icon}`} />
                            Word keyboard shortcuts
                          </span>
                          <span className="text-[10px] uppercase tracking-wide opacity-70">
                            Opens
                          </span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {activeLesson ? (
          <div className="flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="relative overflow-hidden border-b px-4 py-4 sm:px-6 sm:py-5">
              <div
                className={`pointer-events-none absolute inset-0 ${theme.quote.bg} opacity-55`}
              />
              <div className="relative z-10">
                <h1 className="text-lg font-bold tracking-tight sm:text-xl md:text-3xl">
                  {activeLesson.title}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground/80">
                    Lesson{" "}
                    {lessonList.findIndex((l) => l.id === activeLesson.id) + 1} /{" "}
                    {lessonList.length}
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className={`h-3.5 w-3.5 ${theme.icon}`} />
                    20–30 min
                  </span>
                </div>

                {/* Progress bar at top */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="font-medium text-foreground/80">
                      Progress
                    </span>
                    <span>
                      {completedCount}/{totalCount} ({progressPct}%)
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-background/60">
                    <div
                      className="h-full rounded-full bg-primary transition-[width] duration-300"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
              <div className="grid gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
                <div>
                  <div className="prose prose-slate dark:prose-invert max-w-none text-foreground [&_p]:leading-relaxed [&_h1]:mb-2 [&_h1]:mt-7 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mb-1 [&_h2]:mt-5 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mb-1 [&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-semibold [&_li]:ml-5">
                    {activeLesson.content.split("\n").map((line, i) =>
                      renderLessonLine(line, i, theme)
                    )}
                  </div>

                  {/* Prev/Next navigation */}
                  {lessonList.length > 1 && (
                    <LessonNavigation
                      lessons={lessonList}
                      currentLessonId={activeLesson.id}
                      courseId={courseId}
                    />
                  )}

                  <Separator className="my-8" />

                  {/* Submission status */}
                  {existingSubmission && (
                    <div className="mb-6 rounded-lg border bg-muted/50 p-4 transition-colors hover:bg-muted/60">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Previous Submission</p>
                        <Badge
                          variant={
                            existingSubmission.status === "reviewed"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {existingSubmission.status}
                        </Badge>
                      </div>
                      {existingSubmission.grade !== null && (
                        <p className="mt-1 text-sm">
                          Grade:{" "}
                          <span className="font-semibold">
                            {existingSubmission.grade}/100
                          </span>
                        </p>
                      )}
                      {existingSubmission.feedback && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          Feedback: {existingSubmission.feedback}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Upload zone */}
                  <div className="rounded-lg border bg-muted/30 p-5 transition-colors hover:bg-muted/40">
                    <h3 className="mb-3 text-sm font-semibold">
                      Submit Assignment
                    </h3>
                    <UploadForm lessonId={activeLesson.id} />
                  </div>
                </div>

                {/* Course video tutorial (right panel) */}
                {courseVideoById[typedCourse.id] && (
                  <div className="lg:sticky lg:top-4">
                    <div className="overflow-hidden rounded-xl border bg-muted/10">
                      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
                        <p className="text-sm font-semibold">Course video</p>
                        <a
                          className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                          href={`https://www.youtube.com/watch?v=${courseVideoById[typedCourse.id]}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open on YouTube
                        </a>
                      </div>
                      <div className="relative aspect-video w-full bg-black/5">
                        <iframe
                          className="h-full w-full"
                          src={`https://www.youtube.com/embed/${courseVideoById[typedCourse.id]}?rel=0`}
                          title="Course video tutorial"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                        <div className="pointer-events-none absolute inset-0 bg-black/25" />
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.25)_0%,transparent_65%)]" />
                      </div>
                      <div className="border-t px-4 py-3">
                        <p className="text-xs text-muted-foreground">
                          Tip: watch once, then do the task immediately.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center rounded-xl border bg-card py-20 text-center">
            <div>
              <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No lessons available</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Lessons will appear here once an instructor adds them.
              </p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/dashboard/student">Back to Courses</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


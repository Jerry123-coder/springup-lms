import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock,
  ClipboardCheck,
  Download,
  ExternalLink,
  FileText,
  Layers,
  MessageSquare,
  PlayCircle,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { parseLessonContent } from "@/lib/lesson-content";
import { LessonVideoPlayer } from "@/components/dashboard/lesson-video-player";
import { MaterialVideoCard } from "@/components/dashboard/material-video-card";
import { LessonSidebarList } from "@/components/dashboard/lesson-sidebar-list";
import { LessonNavigation } from "@/components/dashboard/lesson-navigation";
import { UploadForm } from "@/components/dashboard/upload-form";
import { MarkCompleteBtn } from "@/components/dashboard/mark-complete-btn";
import { CourseSidebarAutoCollapse } from "@/components/dashboard/course-sidebar-autocollapse";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button, LoadingLink } from "@/components/ui/button";
import type {
  Course,
  CoursePillar,
  Lesson,
  LessonMaterial,
  Submission,
} from "@/lib/types/database";

// ── Pillar theming ────────────────────────────────────────────────
const pillarTheme: Record<
  CoursePillar,
  {
    bar: string;
    pill: string;
    icon: string;
    quote: { border: string; bg: string };
  }
> = {
  "Digital Literacy": {
    bar: "from-sky-500/70 via-sky-400/20 to-transparent",
    pill: "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900/40 dark:bg-sky-950/40 dark:text-sky-300",
    icon: "text-sky-600 dark:text-sky-400",
    quote: { border: "border-sky-500/40", bg: "bg-sky-50/60 dark:bg-sky-950/20" },
  },
  "Career Readiness": {
    bar: "from-amber-500/70 via-orange-400/20 to-transparent",
    pill: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-300",
    icon: "text-amber-700 dark:text-amber-400",
    quote: { border: "border-amber-500/40", bg: "bg-amber-50/60 dark:bg-amber-950/20" },
  },
  "Life Skills": {
    bar: "from-emerald-500/70 via-emerald-400/20 to-transparent",
    pill: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300",
    icon: "text-emerald-700 dark:text-emerald-400",
    quote: { border: "border-emerald-500/40", bg: "bg-emerald-50/60 dark:bg-emerald-950/20" },
  },
  "Cultural Identity": {
    bar: "from-violet-500/70 via-violet-400/20 to-transparent",
    pill: "border-violet-200 bg-violet-50 text-violet-900 dark:border-violet-900/40 dark:bg-violet-950/40 dark:text-violet-300",
    icon: "text-violet-700 dark:text-violet-400",
    quote: { border: "border-violet-500/40", bg: "bg-violet-50/60 dark:bg-violet-950/20" },
  },
};

// ── Static course video map ───────────────────────────────────────
const courseVideoById: Record<string, string> = {
  "d1000000-0000-0000-0000-000000000001": "S-nHYzK-BVg",
  "d1000000-0000-0000-0000-000000000002": "G93P4DxryVE",
  "d1000000-0000-0000-0000-000000000003": "ChEan-3U7B4",
};

// ── Static lesson materials per pillar ───────────────────────────
const PILLAR_MATERIALS: Record<
  string,
  { name: string; type: string; url: string }[]
> = {
  "Digital Literacy": [
    {
      name: "Microsoft Word Support",
      type: "WEB",
      url: "https://support.microsoft.com/word",
    },
    {
      name: "Keyboard Shortcuts Guide",
      type: "WEB",
      url: "https://support.microsoft.com/office/keyboard-shortcuts-in-microsoft-word-95ef89dd-7142-4b50-afb2-f762f663ceb2",
    },
    {
      name: "Excel Function Reference",
      type: "WEB",
      url: "https://support.microsoft.com/excel",
    },
  ],
  "Career Readiness": [
    {
      name: "Professional Writing Guide",
      type: "WEB",
      url: "https://www.grammarly.com/blog/professional-email/",
    },
    {
      name: "LinkedIn Profile Tips",
      type: "WEB",
      url: "https://www.linkedin.com/help/linkedin/answer/a554351",
    },
    {
      name: "PowerPoint Help & Training",
      type: "WEB",
      url: "https://support.microsoft.com/powerpoint",
    },
    {
      name: "Google Slides Help",
      type: "WEB",
      url: "https://support.google.com/docs/topic/9054603",
    },
  ],
  "Life Skills": [
    {
      name: "Financial Literacy Toolkit",
      type: "WEB",
      url: "https://www.consumer.gov/",
    },
    {
      name: "Time Management Templates",
      type: "WEB",
      url: "https://www.notion.so/templates",
    },
  ],
  "Cultural Identity": [
    {
      name: "Research Writing Guide",
      type: "WEB",
      url: "https://owl.purdue.edu/owl/research_and_citation/",
    },
  ],
};

// ── Content renderer ─────────────────────────────────────────────
function renderLessonLine(
  line: string,
  i: number,
  quoteStyle: { border: string; bg: string }
) {
  if (line.startsWith("@youtube:")) return null;
  if (line.startsWith("### "))
    return (
      <h3 key={i} className="mb-1 mt-4 text-base font-semibold">
        {line.slice(4)}
      </h3>
    );
  if (line.startsWith("## "))
    return (
      <h2 key={i} className="mb-1 mt-4 text-lg font-semibold">
        {line.slice(3)}
      </h2>
    );
  if (line.startsWith("# "))
    return (
      <h1 key={i} className="mb-2 mt-6 text-xl font-bold first:mt-0">
        {line.slice(2)}
      </h1>
    );
  if (line.startsWith("- "))
    return (
      <li key={i} className="ml-4 list-disc">
        {line.slice(2)}
      </li>
    );
  if (line.startsWith("> "))
    return (
      <blockquote
        key={i}
        className={`my-3 rounded-md border-l-2 ${quoteStyle.border} ${quoteStyle.bg} px-4 py-3 italic text-muted-foreground`}
      >
        {line.slice(2)}
      </blockquote>
    );
  if (line.trim() === "") return <br key={i} />;
  return (
    <p key={i} className="leading-relaxed">
      {line}
    </p>
  );
}

// ── Main component ────────────────────────────────────────────────
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

  const { data: matsData } =
    lessonList.length > 0
      ? await supabase
          .from("lesson_materials")
          .select("*")
          .in(
            "lesson_id",
            lessonList.map((l) => l.id)
          )
          .order("order_index", { ascending: true })
      : { data: [] as LessonMaterial[] };

  const allLessonMaterials = (matsData ?? []) as LessonMaterial[];
  const dbMaterialsForActive = activeLesson
    ? allLessonMaterials.filter((m) => m.lesson_id === activeLesson.id)
    : [];

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Progress tracking
  const lessonIds = lessonList.map((l) => l.id);
  const completedLessonIds = new Set<string>();
  const videoWatchedAtByLesson: Record<string, string | null> = {};

  if (user && lessonIds.length > 0) {
    const [subsRes, lpRes] = await Promise.all([
      supabase
        .from("submissions")
        .select("lesson_id")
        .eq("student_id", user.id)
        .in("lesson_id", lessonIds),
      supabase
        .from("lesson_progress")
        .select("lesson_id, video_watched_at")
        .eq("student_id", user.id)
        .in("lesson_id", lessonIds),
    ]);
    (subsRes.data ?? []).forEach((s) =>
      completedLessonIds.add((s as { lesson_id: string }).lesson_id)
    );
    (lpRes.data ?? []).forEach((r) => {
      const row = r as { lesson_id: string; video_watched_at: string | null };
      videoWatchedAtByLesson[row.lesson_id] = row.video_watched_at;
    });
  }

  const completedCount = completedLessonIds.size;
  const totalCount = lessonIds.length;
  const progressPct =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isCourseComplete = totalCount > 0 && completedCount === totalCount;

  // Build lesson status record
  const lessonStatusRecord: Record<
    string,
    { videoDone: boolean; hasSubmission: boolean }
  > = {};
  for (const l of lessonList) {
    lessonStatusRecord[l.id] = {
      videoDone: !!videoWatchedAtByLesson[l.id],
      hasSubmission: completedLessonIds.has(l.id),
    };
  }

  // Next un-submitted lesson
  const nextLesson = lessonList.find((l) => !completedLessonIds.has(l.id)) ?? null;
  const currentIdx = activeLesson
    ? lessonList.findIndex((l) => l.id === activeLesson.id)
    : -1;
  const nextAdjacentLesson =
    currentIdx >= 0 && currentIdx < lessonList.length - 1
      ? lessonList[currentIdx + 1]
      : null;

  // Learning path guide card
  let guideTitle: string | null = null;
  let guideSubtitle: string | null = null;
  let guideHref: string | null = null;

  if (nextLesson) {
    guideTitle = "Next up in your learning path";
    guideSubtitle = nextLesson.title;
    guideHref = `/dashboard/student/courses/${courseId}/lessons/${nextLesson.id}`;
  } else if (isCourseComplete) {
    const { data: blocks } = await supabase
      .from("learning_blocks")
      .select("id, order_index")
      .order("order_index", { ascending: true });

    const blockRows = (blocks ?? []) as { id: string; order_index: number }[];
    const blockIds = blockRows.map((b) => b.id);

    if (blockIds.length > 0) {
      const { data: blockCourses } = await supabase
        .from("learning_block_courses")
        .select("block_id, course_id, order_index")
        .in("block_id", blockIds);

      const rows = (blockCourses ?? []) as {
        block_id: string;
        course_id: string;
        order_index: number;
      }[];

      const coursesByBlock = new Map<
        string,
        { course_id: string; order_index: number }[]
      >();
      for (const r of rows) {
        const arr = coursesByBlock.get(r.block_id) ?? [];
        arr.push({ course_id: r.course_id, order_index: r.order_index });
        coursesByBlock.set(r.block_id, arr);
      }

      const orderedCourseIds: string[] = [];
      for (const b of blockRows) {
        const list = (coursesByBlock.get(b.id) ?? []).sort(
          (a, b2) => a.order_index - b2.order_index
        );
        for (const x of list) orderedCourseIds.push(x.course_id);
      }

      const currentCourseIdx = orderedCourseIds.findIndex(
        (id) => id === typedCourse.id
      );
      const nextCourseId =
        currentCourseIdx >= 0
          ? orderedCourseIds[currentCourseIdx + 1]
          : null;

      if (nextCourseId) {
        const { data: nextCourseLessons } = await supabase
          .from("lessons")
          .select("id")
          .eq("course_id", nextCourseId)
          .order("order_index", { ascending: true })
          .limit(1);

        const firstLesson = (nextCourseLessons ?? []) as { id: string }[];
        if (firstLesson[0]?.id) {
          guideTitle = "Course complete — next course starts now";
          guideSubtitle = "Continue your learning path";
          guideHref = `/dashboard/student/courses/${nextCourseId}/lessons/${firstLesson[0].id}`;
        }
      } else {
        guideTitle = "You finished the learning path";
        guideSubtitle = "Great work — check your certificates";
        guideHref = "/dashboard/student/certificates";
      }
    }
  }

  // Existing submission for active lesson
  let existingSubmission: Submission | null = null;
  if (activeLesson && user) {
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

  const parsed = activeLesson ? parseLessonContent(activeLesson.content) : null;
  const resolvedVideoId =
    (parsed?.inlineYoutubeIds[0] ?? courseVideoById[typedCourse.id]) || null;
  const currentVideoWatchedAt = activeLesson
    ? videoWatchedAtByLesson[activeLesson.id] ?? null
    : null;

  const materials =
    dbMaterialsForActive.length > 0
      ? dbMaterialsForActive.map((m) => ({
          id: m.id,
          name: m.title,
          type: m.kind.toUpperCase(),
          url: m.url,
          kind: m.kind,
          thumbnailUrl: m.thumbnail_url,
        }))
      : (PILLAR_MATERIALS[typedCourse.pillar] ??
          PILLAR_MATERIALS["Digital Literacy"] ??
          []
        ).map((x, i) => ({
          id: `pillar-${typedCourse.pillar}-${i}`,
          name: x.name,
          type: x.type,
          url: x.url,
          kind: "link" as const,
          thumbnailUrl: null as string | null,
        }));

  const activeLessonNumber = activeLesson
    ? lessonList.findIndex((l) => l.id === activeLesson.id) + 1
    : 1;

  // ── Sidebar panel (shared between desktop aside and mobile sheet) ──
  const SidebarContent = (
    <>
      {/* Course header */}
      <div className="flex-none border-b px-4 py-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Course Content
          </p>
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
              progressPct === 100
                ? "bg-gradient-primary text-[#f0f7f5]"
                : "bg-secondary text-primary"
            }`}
          >
            {progressPct}% COMPLETE
          </span>
        </div>
        <h3 className="font-display text-sm font-semibold leading-snug text-foreground">
          {typedCourse.title}
        </h3>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${theme.pill}`}
          >
            {typedCourse.pillar}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
            <Layers className="h-3 w-3" />
            {lessonList.length} lessons
          </span>
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-primary transition-[width] duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="mt-1.5 text-[10px] text-muted-foreground">
          {completedCount} of {totalCount} lessons completed
        </p>
      </div>

      {/* Back to catalog */}
      <div className="flex-none border-b px-4 py-2">
        <Link
          href="/dashboard/student/catalog"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to catalog
        </Link>
      </div>

      {/* Lesson list */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {lessonList.length > 0 ? (
          <LessonSidebarList
            lessons={lessonList}
            courseId={courseId}
            activeLessonId={lessonId ?? lessonList[0]?.id ?? null}
            lessonStatus={lessonStatusRecord}
          />
        ) : (
          <p className="px-2 py-6 text-center text-xs text-muted-foreground">
            No lessons yet.
          </p>
        )}
      </div>

      {/* Ask Mentor footer */}
      <div className="flex-none border-t p-3">
        <a
          href="mailto:mentor@springup.co.ke"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary px-3 py-3 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-[#f0f7f5]"
        >
          <MessageSquare className="h-4 w-4" />
          Ask Mentor a Question
        </a>
      </div>
    </>
  );

  return (
    <div className="flex flex-1 overflow-hidden">
      <CourseSidebarAutoCollapse />

      {/* ── Main scrollable content ──────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

        {/* Sticky breadcrumb / top bar */}
        <div className="sticky top-0 z-10 flex shrink-0 items-center gap-2 border-b bg-background/90 px-4 py-2.5 backdrop-blur-sm">
          <Link
            href="/dashboard/student/catalog"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
          <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
            <span className="hidden truncate sm:inline">{typedCourse.title}</span>
            {activeLesson && (
              <>
                <ChevronRight className="h-3 w-3 shrink-0 opacity-50" />
                <span className="truncate font-medium text-foreground">
                  {activeLesson.title}
                </span>
              </>
            )}
          </div>
          {/* Mobile: Course Content sheet trigger */}
          <div className="ml-auto lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold text-primary"
                >
                  <Layers className="h-3.5 w-3.5" />
                  {progressPct}%
                </button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="flex w-80 flex-col p-0"
              >
                <SheetHeader className="sr-only">
                  <SheetTitle>Course Content</SheetTitle>
                </SheetHeader>
                {SidebarContent}
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {activeLesson ? (
            <div className="mx-auto w-full max-w-3xl space-y-6 p-4 sm:p-6 lg:p-8">

              {/* ── Video player ───────────────────────────── */}
              {resolvedVideoId ? (
                <LessonVideoPlayer videoId={resolvedVideoId} />
              ) : null}

              {/* ── Lesson header ───────────────────────────── */}
              <div className="space-y-4">
                <div>
                  {/* Lesson counter + pillar */}
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${theme.pill}`}
                    >
                      {typedCourse.pillar}
                    </span>
                    <span className="font-medium text-muted-foreground">
                      Lesson {activeLessonNumber} / {totalCount}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className={`h-3.5 w-3.5 ${theme.icon}`} />
                      20–30 min
                    </span>
                    {existingSubmission && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="h-3 w-3" />
                        Academic Credit
                      </span>
                    )}
                  </div>

                  <h1 className="font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
                    {activeLesson.title}
                  </h1>

                  {parsed?.tagline && (
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {parsed.tagline}
                    </p>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  {resolvedVideoId && (
                    <MarkCompleteBtn
                      lessonId={activeLesson.id}
                      courseId={courseId}
                      watchedAt={currentVideoWatchedAt}
                    />
                  )}
                  {nextAdjacentLesson && (
                    <LoadingLink
                      href={`/dashboard/student/courses/${courseId}/lessons/${nextAdjacentLesson.id}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-[#f0f7f5] transition-opacity hover:opacity-90"
                    >
                      Next Lesson
                      <ArrowRight className="h-4 w-4" />
                    </LoadingLink>
                  )}
                  {resolvedVideoId && (
                    <a
                      href={`https://www.youtube.com/watch?v=${resolvedVideoId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground underline-offset-2 hover:underline"
                    >
                      <PlayCircle className="h-3.5 w-3.5" />
                      Open on YouTube
                    </a>
                  )}
                </div>

                {/* Course progress bar */}
                <div className="rounded-2xl bg-secondary/40 px-5 py-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-foreground/80">
                      <CheckCircle2 className={`h-3.5 w-3.5 ${theme.icon}`} />
                      Course progress
                    </span>
                    <span className="tabular-nums text-muted-foreground">
                      {completedCount}/{totalCount} ({progressPct}%)
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted/80">
                    <div
                      className="h-full rounded-full bg-gradient-primary transition-[width] duration-300"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* ── Lesson content ──────────────────────────── */}
              {parsed?.mainBody?.trim() ? (
                <div className="prose prose-sm prose-slate dark:prose-invert max-w-none text-foreground [&_p]:leading-relaxed">
                  {parsed.mainBody.split("\n").map((line, i) =>
                    renderLessonLine(line, i, theme.quote)
                  )}
                </div>
              ) : null}

              {/* ── Lesson navigation ───────────────────────── */}
              {lessonList.length > 1 && (
                <LessonNavigation
                  lessons={lessonList}
                  currentLessonId={activeLesson.id}
                  courseId={courseId}
                />
              )}

              {/* ── Assignment section ──────────────────────── */}
              <section id="assignment" className="space-y-5">

                {/* Checklist */}
                <div className="rounded-2xl bg-secondary/50 p-4 ring-1 ring-border/60 sm:p-5">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    This lesson checklist
                  </p>
                  <ul className="space-y-2.5">
                    {resolvedVideoId && (
                      <li className="flex items-start gap-2.5 text-sm">
                        {currentVideoWatchedAt ? (
                          <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${theme.icon}`} />
                        ) : (
                          <PlayCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        )}
                        <span>
                          <span className="font-medium text-foreground">Watch the lesson video</span>
                          <span className="block text-xs text-muted-foreground">
                            {currentVideoWatchedAt
                              ? "Marked as watched — great focus."
                              : "Watch then click \u201cMark as Complete\u201d above."}
                          </span>
                        </span>
                      </li>
                    )}
                    <li className="flex items-start gap-2.5 text-sm">
                      {existingSubmission ? (
                        <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${theme.icon}`} />
                      ) : (
                        <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                      <span>
                        <span className="font-medium text-foreground">Submit your assignment</span>
                        <span className="block text-xs text-muted-foreground">
                          {existingSubmission
                            ? "Your file is in — you can upload a newer version anytime."
                            : "One file per lesson; supported formats listed in the workspace."}
                        </span>
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Practical Assignment (top) + Submit Your Work (below) */}
                <div className="flex flex-col gap-4">
                  {/* Practical Assignment */}
                  <div className="flex w-full flex-col rounded-2xl bg-card p-5 ring-1 ring-border/70 shadow-ambient">
                    <div className="mb-3 flex items-center gap-2">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary`}>
                        <FileText className={`h-4 w-4 ${theme.icon}`} />
                      </div>
                      <div>
                        <p className="font-display text-sm font-semibold leading-snug">
                          Practical Assignment
                        </p>
                        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                          Required for completion
                        </p>
                      </div>
                    </div>

                    {parsed?.taskBody ? (
                      <div className="prose prose-sm prose-slate dark:prose-invert flex-1 max-w-none text-foreground [&_p]:leading-relaxed [&_li]:ml-3">
                        {parsed.taskBody.split("\n").map((line, i) =>
                          renderLessonLine(line, i, theme.quote)
                        )}
                      </div>
                    ) : (
                      <div className="flex-1 space-y-3">
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          Upload your completed work using the workspace. Follow any
                          instructions your instructor added in the lesson content.
                        </p>
                        <ul className="space-y-1.5 text-sm text-muted-foreground">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${theme.icon}`} />
                            Apply concepts from this lesson
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${theme.icon}`} />
                            Submit your best work for feedback
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Submit Your Work */}
                  <div className="flex w-full flex-col rounded-2xl bg-card p-5 ring-1 ring-border/70 shadow-ambient">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary">
                        <UploadCloud className={`h-4 w-4 ${theme.icon}`} />
                      </div>
                      <div>
                        <p className="font-display text-sm font-semibold">Submit Your Work</p>
                        <p className="text-[10px] text-muted-foreground">
                          Drop your .docx or .pdf here
                        </p>
                      </div>
                    </div>
                    <div className="flex-1">
                      <UploadForm
                        lessonId={activeLesson.id}
                        courseId={courseId}
                        hasExistingSubmission={!!existingSubmission}
                      />
                    </div>
                  </div>
                </div>

                {/* Latest submission */}
                {existingSubmission && (
                  <div className="rounded-2xl bg-muted/50 p-5 ring-1 ring-border/60 transition-colors hover:bg-muted/60">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="flex items-center gap-2 text-sm font-medium">
                          <ClipboardCheck className={`h-4 w-4 ${theme.icon}`} />
                          Latest submission
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Sent{" "}
                          {new Date(existingSubmission.created_at).toLocaleString(
                            undefined,
                            { dateStyle: "medium", timeStyle: "short" }
                          )}
                        </p>
                      </div>
                      <Badge
                        variant={
                          existingSubmission.status === "reviewed"
                            ? "default"
                            : "secondary"
                        }
                        className="shrink-0 capitalize"
                      >
                        {existingSubmission.status}
                      </Badge>
                    </div>
                    {existingSubmission.file_url ? (
                      <p className="mt-3 text-sm">
                        <a
                          href={existingSubmission.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-primary underline decoration-primary/30 underline-offset-2 hover:opacity-90"
                        >
                          Open submitted file
                        </a>
                      </p>
                    ) : null}
                    {existingSubmission.grade !== null && (
                      <p className="mt-2 text-sm">
                        Grade:{" "}
                        <span className="font-semibold">
                          {existingSubmission.grade}/100
                        </span>
                      </p>
                    )}
                    {existingSubmission.feedback ? (
                      <p className="mt-2 rounded-xl bg-background/60 p-3 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Feedback: </span>
                        {existingSubmission.feedback}
                      </p>
                    ) : null}
                  </div>
                )}

                {/* Learning path guide card */}
                {guideHref && guideTitle && (
                  <div
                    className={`rounded-2xl bg-card/80 p-4 ring-1 ring-border/80 shadow-ambient ${theme.quote.bg}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Sparkles className={`h-4 w-4 ${theme.icon}`} />
                          <p className="truncate text-sm font-semibold">
                            {guideTitle}
                          </p>
                        </div>
                        {guideSubtitle && (
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                            {guideSubtitle}
                          </p>
                        )}
                      </div>
                      <LoadingLink href={guideHref} size="sm" className="shrink-0">
                        Go next
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </LoadingLink>
                    </div>
                  </div>
                )}
              </section>

              {/* ── Lesson Materials ───────────────────────── */}
              {materials.length > 0 && (
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className={`h-4 w-4 ${theme.icon}`} />
                      <h4 className="font-display text-sm font-semibold">
                        Lesson Materials
                      </h4>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {materials.length} resource{materials.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="rounded-2xl bg-muted/40 p-3">
                    <div className="space-y-2">
                      {materials.map((mat) =>
                        mat.kind === "video" ? (
                          <MaterialVideoCard
                            key={mat.id}
                            title={mat.name}
                            url={mat.url}
                            thumbnailUrl={mat.thumbnailUrl}
                          />
                        ) : (
                          <a
                            key={mat.id}
                            href={mat.url}
                            target="_blank"
                            rel="noreferrer"
                            className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-card"
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-card text-muted-foreground ring-1 ring-border/60 transition-colors group-hover:text-primary">
                              <FileText className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-semibold text-foreground group-hover:text-primary">
                                {mat.name}
                              </p>
                              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                {mat.type}
                              </p>
                            </div>
                            <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60 transition-colors group-hover:text-primary" />
                          </a>
                        )
                      )}
                    </div>
                  </div>
                </section>
              )}

              <div className="h-8" aria-hidden />
            </div>
          ) : (
            /* Empty state */
            <div className="flex flex-1 items-center justify-center px-6 py-20 text-center">
              <div>
                <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
                <h3 className="font-display text-lg font-semibold">
                  No lessons available
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Lessons will appear once an instructor adds them.
                </p>
                <LoadingLink
                  href="/dashboard/student/catalog"
                  variant="outline"
                  className="mt-4 rounded-xl"
                >
                  Back to catalog
                </LoadingLink>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Right sidebar (desktop only) ─────────────────────── */}
      <aside className="sticky top-0 hidden h-svh w-88 shrink-0 flex-col overflow-hidden border-l bg-card/60 lg:flex">
        {SidebarContent}
      </aside>
    </div>
  );
}

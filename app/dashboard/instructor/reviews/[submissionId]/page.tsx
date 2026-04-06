import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  ExternalLink,
  FileText,
  PlayCircle,
  Users,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { GradingForm } from "@/components/dashboard/grading-form";
import { Skeleton } from "@/components/ui/skeleton";

interface PageProps {
  params: Promise<{ submissionId: string }>;
}

interface SubmissionDetail {
  id: string;
  student_id: string;
  lesson_id: string;
  status: string;
  file_url: string;
  grade: number | null;
  feedback: string;
  created_at: string;
  profiles: { full_name: string; email: string } | null;
  lessons: {
    title: string;
    content: string;
    courses: { title: string; pillar: string } | null;
  } | null;
}

const RUBRIC_ITEMS = [
  "Assignment Completeness",
  "Accuracy & Understanding",
  "Presentation & Clarity",
  "Following Instructions",
];

const PILLAR_PILL: Record<string, string> = {
  "Digital Literacy": "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  "Career Readiness": "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  "Life Skills": "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  "Cultural Identity": "bg-rose-500/15 text-rose-700 dark:text-rose-300",
};

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

async function ReviewContent({ submissionId }: { submissionId: string }) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("submissions")
    .select(
      "id, student_id, lesson_id, status, file_url, grade, feedback, created_at, profiles!inner(full_name, email), lessons!inner(title, content, courses!inner(title, pillar))"
    )
    .eq("id", submissionId)
    .single();

  if (error || !data) notFound();

  const sub = data as unknown as SubmissionDetail;
  const isReviewed = sub.status === "reviewed";
  const studentName =
    sub.profiles?.full_name || sub.profiles?.email || "Student";
  const courseName = sub.lessons?.courses?.title ?? "—";
  const lessonName = sub.lessons?.title ?? "—";
  const pillar = sub.lessons?.courses?.pillar ?? "";
  const pillClass = PILLAR_PILL[pillar] ?? "bg-secondary text-primary";

  // Check video progress
  const { data: progressRow } = await supabase
    .from("lesson_progress")
    .select("video_watched_at")
    .eq("student_id", sub.student_id)
    .eq("lesson_id", sub.lesson_id)
    .maybeSingle();

  const videoWatched = Boolean(
    (progressRow as { video_watched_at: string | null } | null)?.video_watched_at
  );

  // Fetch previous submissions by same student
  const { data: prevSubs } = await supabase
    .from("submissions")
    .select(
      "id, grade, status, created_at, lessons!inner(title, courses!inner(title))"
    )
    .eq("student_id", sub.student_id)
    .neq("id", sub.id)
    .eq("status", "reviewed")
    .order("created_at", { ascending: false })
    .limit(3);

  type PrevSub = {
    id: string;
    grade: number | null;
    created_at: string;
    lessons: { title: string; courses: { title: string } | null } | null;
  };
  const previousSubs = (prevSubs ?? []) as unknown as PrevSub[];

  const prevAvg =
    previousSubs.filter((s) => s.grade !== null).length > 0
      ? Math.round(
          previousSubs
            .filter((s) => s.grade !== null)
            .reduce((sum, s) => sum + (s.grade ?? 0), 0) /
            previousSubs.filter((s) => s.grade !== null).length
        )
      : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* Tabs bar */}
      <div className="flex items-center gap-1 border-b bg-background/80 px-6 py-2 backdrop-blur-sm">
        <Link
          href="/dashboard/instructor/grading"
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All Submissions
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <span className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
          Active Grading
        </span>
        <span className="text-muted-foreground/40">/</span>
        <span className="truncate text-xs text-muted-foreground">
          {studentName}
        </span>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* ── Left: Submission view ──────────────────────────── */}
        <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
          <div className="p-6 lg:p-8">
            {/* Student header */}
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-base font-bold text-[#f0f7f5]">
                {initials(studentName)}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-lg font-semibold">
                    {studentName}
                  </h2>
                  {isReviewed ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-bold text-primary">
                      <CheckCircle2 className="h-3 w-3" />
                      Graded
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent/50 px-2.5 py-0.5 text-[10px] font-bold text-accent-foreground">
                      Pending Review
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  <span className={`mr-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${pillClass}`}>
                    {pillar}
                  </span>
                  {courseName} — {lessonName}
                </p>
              </div>
              {isReviewed && sub.grade !== null && (
                <div className="ml-auto shrink-0 text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Grade
                  </p>
                  <p className="font-display text-3xl font-bold text-foreground">
                    {sub.grade}
                    <span className="text-base text-muted-foreground">/100</span>
                  </p>
                </div>
              )}
            </div>

            {/* Progress indicators */}
            <div className="mb-6 flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5 rounded-xl bg-card px-3 py-2 shadow-ambient">
                <PlayCircle
                  className={`h-4 w-4 ${videoWatched ? "text-primary" : "text-muted-foreground"}`}
                />
                <span className="text-xs font-medium">
                  Video{" "}
                  <span
                    className={videoWatched ? "text-primary" : "text-muted-foreground"}
                  >
                    {videoWatched ? "Watched" : "Not watched"}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl bg-card px-3 py-2 shadow-ambient">
                <FileText className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium">
                  Assignment{" "}
                  <span className="text-primary">
                    {isReviewed ? "Graded" : "Submitted"}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl bg-card px-3 py-2 shadow-ambient">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">
                  Submitted{" "}
                  {new Date(sub.created_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* File preview */}
            <div className="rounded-2xl bg-card shadow-ambient">
              <div className="flex items-center justify-between border-b border-border/50 px-5 py-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <FileText className="h-4 w-4 text-primary" />
                  Submitted File
                </div>
                {sub.file_url && (
                  <a
                    href={sub.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-2 hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Open
                  </a>
                )}
              </div>
              <div className="p-5">
                {sub.file_url ? (
                  sub.file_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={sub.file_url}
                      alt="Submission"
                      className="max-h-120 w-full rounded-xl object-contain"
                    />
                  ) : sub.file_url.match(/\.pdf$/i) ? (
                    <iframe
                      src={sub.file_url}
                      title="Submission PDF"
                      className="h-125 w-full rounded-xl border"
                    />
                  ) : (
                    <a
                      href={sub.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 rounded-xl border bg-muted/40 p-5 transition-colors hover:bg-secondary/50"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-medium">Attached File</p>
                        <p className="text-xs text-muted-foreground">
                          Click to open in a new tab
                        </p>
                      </div>
                      <ExternalLink className="ml-auto h-4 w-4 text-muted-foreground" />
                    </a>
                  )
                ) : (
                  <div className="flex flex-col items-center py-12 text-center">
                    <FileText className="mb-3 h-10 w-10 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">
                      No file attached to this submission.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Previous submissions */}
            {previousSubs.length > 0 && (
              <div className="mt-6">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Previous Submissions by {studentName.split(" ")[0]}
                  {prevAvg !== null && (
                    <span className="ml-2 font-bold text-primary">
                      · Avg {prevAvg}/100
                    </span>
                  )}
                </p>
                <div className="space-y-2">
                  {previousSubs.map((ps) => (
                    <Link
                      key={ps.id}
                      href={`/dashboard/instructor/reviews/${ps.id}`}
                      className="flex items-center justify-between rounded-xl bg-card px-4 py-3 shadow-ambient transition-colors hover:bg-secondary/40"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-foreground">
                          {ps.lessons?.courses?.title ?? "—"} —{" "}
                          {ps.lessons?.title ?? "—"}
                        </p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          {new Date(ps.created_at).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      {ps.grade !== null && (
                        <span className="ml-4 shrink-0 rounded-lg bg-secondary px-2.5 py-1 text-xs font-bold text-primary">
                          {ps.grade}/100
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Feedback Panel ──────────────────────────── */}
        <aside className="flex w-75 shrink-0 flex-col overflow-y-auto border-l bg-card/60 xl:w-80">
          <div className="flex-1 space-y-5 p-5">
            {/* Feedback Panel header */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Feedback Panel
              </p>
              <div className="mt-3 h-px bg-border/50" />
            </div>

            {/* Rubric */}
            <div>
              <p className="mb-3 text-xs font-semibold text-muted-foreground">
                Rubric Checklist
              </p>
              <div className="space-y-2">
                {RUBRIC_ITEMS.map((item) => (
                  <label
                    key={item}
                    className="flex cursor-pointer items-center gap-2.5 rounded-lg p-2 text-xs transition-colors hover:bg-muted/50"
                  >
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-border bg-background">
                      <Circle className="h-2.5 w-2.5 text-muted-foreground/40" />
                    </span>
                    <span className="text-foreground">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="h-px bg-border/50" />

            {/* Grade form */}
            <div>
              <p className="mb-3 text-xs font-semibold text-muted-foreground">
                {isReviewed ? "Update Grade & Feedback" : "Grade & Feedback"}
              </p>
              {isReviewed && (
                <div className="mb-4 rounded-xl bg-secondary/60 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                    Current grade
                  </p>
                  <p className="mt-0.5 font-display text-2xl font-bold text-foreground">
                    {sub.grade ?? "—"}
                    <span className="text-sm font-normal text-muted-foreground">
                      /100
                    </span>
                  </p>
                  {sub.feedback && (
                    <>
                      <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-primary">
                        Current feedback
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-foreground/80">
                        {sub.feedback}
                      </p>
                    </>
                  )}
                </div>
              )}
              <GradingForm submissionId={sub.id} initialGrade={sub.grade} initialFeedback={sub.feedback} />
            </div>
          </div>

          {/* Bottom nav */}
          <div className="border-t border-border/50 p-4">
            <Link
              href="/dashboard/instructor/grading"
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-muted px-3 py-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Grading Queue
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ReviewSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6 lg:flex-row">
      <div className="flex-1 space-y-4">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
      <div className="w-80 space-y-4">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    </div>
  );
}

export default async function ReviewPage({ params }: PageProps) {
  const { submissionId } = await params;

  return (
    <>
      <DashboardHeader heading="Grading Workspace" />
      <Suspense fallback={<ReviewSkeleton />}>
        <ReviewContent submissionId={submissionId} />
      </Suspense>
    </>
  );
}

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Eye,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { cn } from "@/lib/utils";

interface SubmissionRow {
  id: string;
  student_id: string;
  status: string;
  created_at: string;
  grade: number | null;
  profiles: { full_name: string; email: string } | null;
  lessons: { title: string; courses: { title: string; pillar: string } | null } | null;
}

function timeAgo(ts: string): string {
  const diffMs = Date.now() - new Date(ts).getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return `${Math.floor(diffHrs / 24)}d ago`;
}

const PILLAR_PILL: Record<string, string> = {
  "Digital Literacy": "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  "Career Readiness": "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  "Life Skills": "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  "Cultural Identity": "bg-rose-500/15 text-rose-700 dark:text-rose-300",
};

export default async function InstructorGradingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: allSubs } = await supabase
    .from("submissions")
    .select(
      "id, student_id, status, created_at, grade, profiles!inner(full_name, email), lessons!inner(title, courses!inner(title, pillar))"
    )
    .order("created_at", { ascending: false });

  const submissions = (allSubs ?? []) as unknown as SubmissionRow[];
  const pending = submissions.filter((s) => s.status === "pending");
  const reviewed = submissions.filter((s) => s.status === "reviewed");

  const totalGraded = reviewed.length;
  const avgGrade =
    reviewed.filter((s) => s.grade !== null).length > 0
      ? Math.round(
          reviewed
            .filter((s) => s.grade !== null)
            .reduce((sum, s) => sum + (s.grade ?? 0), 0) /
            reviewed.filter((s) => s.grade !== null).length
        )
      : null;

  return (
    <>
      <DashboardHeader heading="Grading" />
      <div className="mx-auto w-full max-w-7xl flex-1 space-y-6 p-6">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Grading Dashboard
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
              Grading Queue
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Review and grade student assignment submissions.
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-2xl bg-card p-5 shadow-ambient">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Pending
            </p>
            <p
              className={`mt-2 font-display text-3xl font-semibold tabular-nums ${pending.length > 0 ? "text-[#ffdcc2]" : "text-foreground"}`}
            >
              {String(pending.length).padStart(2, "0")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Awaiting review</p>
          </div>
          <div className="rounded-2xl bg-card p-5 shadow-ambient">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Graded
            </p>
            <p className="mt-2 font-display text-3xl font-semibold tabular-nums">
              {totalGraded}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Total reviewed</p>
          </div>
          <div className="rounded-2xl bg-card p-5 shadow-ambient">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Avg. Score
            </p>
            <p className="mt-2 font-display text-3xl font-semibold tabular-nums">
              {avgGrade !== null ? `${avgGrade}` : "—"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {avgGrade !== null ? "Points average" : "No graded work yet"}
            </p>
          </div>
        </div>

        {/* Pending */}
        <section className="rounded-[1.75rem] bg-muted/40 p-6 shadow-ambient sm:p-8">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-accent/50 px-2 text-xs font-bold text-accent-foreground">
              {pending.length}
            </span>
            <h3 className="font-display text-base font-semibold">
              Awaiting Review
            </h3>
          </div>

          {pending.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl bg-card/70 px-6 py-12 text-center shadow-ambient">
              <CheckCircle2 className="mb-3 h-10 w-10 text-primary/40" />
              <p className="font-display text-base font-semibold">All caught up!</p>
              <p className="mt-1 text-sm text-muted-foreground">
                No submissions awaiting review.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map((sub) => (
                <SubmissionCard key={sub.id} sub={sub} type="pending" />
              ))}
            </div>
          )}
        </section>

        {/* Reviewed */}
        {reviewed.length > 0 && (
          <section className="rounded-[1.75rem] bg-muted/40 p-6 shadow-ambient sm:p-8">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-secondary px-2 text-xs font-bold text-primary">
                {reviewed.length}
              </span>
              <h3 className="font-display text-base font-semibold">
                Reviewed Work
              </h3>
            </div>
            <div className="space-y-3">
              {reviewed.slice(0, 20).map((sub) => (
                <SubmissionCard key={sub.id} sub={sub} type="reviewed" />
              ))}
              {reviewed.length > 20 && (
                <p className="pt-2 text-center text-xs text-muted-foreground">
                  Showing 20 of {reviewed.length} reviewed submissions
                </p>
              )}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

function SubmissionCard({
  sub,
  type,
}: {
  sub: SubmissionRow;
  type: "pending" | "reviewed";
}) {
  const studentName = sub.profiles?.full_name || sub.profiles?.email || "—";
  const courseName = sub.lessons?.courses?.title ?? "—";
  const lessonName = sub.lessons?.title ?? "—";
  const pillar = sub.lessons?.courses?.pillar ?? "";
  const pillClass = PILLAR_PILL[pillar] ?? "bg-secondary text-primary";

  return (
    <div
      className={cn(
        "group flex items-center gap-4 rounded-2xl p-4 shadow-ambient transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-5",
        type === "pending"
          ? "border-l-4 border-l-accent bg-card"
          : "border-l-4 border-l-primary/40 bg-card/80"
      )}
    >
      {/* Status icon */}
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          type === "pending"
            ? "bg-accent/20 text-accent-foreground"
            : "bg-secondary text-primary"
        )}
      >
        {type === "pending" ? (
          <Clock className="h-4.5 w-4.5" />
        ) : (
          <CheckCircle2 className="h-4.5 w-4.5" />
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-display text-sm font-semibold text-foreground">
            {studentName}
          </p>
          {pillar && (
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${pillClass}`}>
              {pillar}
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          <span className="font-medium text-foreground/80">{courseName}</span>
          {" — "}
          {lessonName}
        </p>
        <p className="mt-0.5 text-[10px] text-muted-foreground">
          Submitted {timeAgo(sub.created_at)}
        </p>
      </div>

      {/* Grade */}
      {type === "reviewed" && sub.grade !== null && (
        <span
          className={cn(
            "shrink-0 rounded-xl px-3 py-1 text-sm font-bold tabular-nums",
            sub.grade >= 80
              ? "bg-gradient-primary text-[#f0f7f5]"
              : sub.grade >= 60
              ? "bg-secondary text-primary"
              : "bg-destructive/10 text-destructive"
          )}
        >
          {sub.grade}/100
        </span>
      )}

      {/* Action */}
      <Link
        href={`/dashboard/instructor/reviews/${sub.id}`}
        className={cn(
          "shrink-0 inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-opacity hover:opacity-80",
          type === "pending"
            ? "bg-gradient-primary text-[#f0f7f5]"
            : "bg-secondary text-primary"
        )}
      >
        <Eye className="h-3.5 w-3.5" />
        {type === "pending" ? "Review" : "View"}
      </Link>
    </div>
  );
}

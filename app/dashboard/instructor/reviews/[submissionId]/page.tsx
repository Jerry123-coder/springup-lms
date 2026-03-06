import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, FileText, CheckCircle2 } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { GradingForm } from "@/components/dashboard/grading-form";
import { GradingDetailSkeleton } from "@/components/dashboard/grading-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface PageProps {
  params: Promise<{ submissionId: string }>;
}

interface SubmissionDetail {
  id: string;
  status: string;
  file_url: string;
  grade: number | null;
  feedback: string;
  created_at: string;
  profiles: { full_name: string; email: string } | null;
  lessons: { title: string; courses: { title: string } | null } | null;
}

async function ReviewContent({
  submissionId,
}: {
  submissionId: string;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("submissions")
    .select(
      "id, status, file_url, grade, feedback, created_at, profiles!inner(full_name, email), lessons!inner(title, courses!inner(title))"
    )
    .eq("id", submissionId)
    .single();

  if (error || !data) notFound();

  const sub = data as unknown as SubmissionDetail;
  const isReviewed = sub.status === "reviewed";

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 lg:flex-row">
      {/* Left: Submission details + file */}
      <div className="flex-1 space-y-4 rounded-xl border bg-card p-6">
        <div>
          <Button variant="ghost" size="sm" className="mb-3 gap-1.5" asChild>
            <Link href="/dashboard/instructor">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Queue
            </Link>
          </Button>

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Submission Review</h2>
            <Badge variant={isReviewed ? "default" : "secondary"}>
              {sub.status}
            </Badge>
          </div>
        </div>

        <Separator />

        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground">Student</p>
            <p className="font-medium">
              {sub.profiles?.full_name || sub.profiles?.email || "—"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Course</p>
            <p className="font-medium">
              {sub.lessons?.courses?.title ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Lesson</p>
            <p className="font-medium">{sub.lessons?.title ?? "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Submitted</p>
            <p className="font-medium">
              {new Date(sub.created_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        <Separator />

        {/* File preview */}
        <div>
          <h3 className="mb-3 flex items-center gap-2 font-semibold">
            <FileText className="h-4 w-4" />
            Submitted File
          </h3>

          {sub.file_url ? (
            <div className="space-y-3">
              {sub.file_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <img
                  src={sub.file_url}
                  alt="Submission"
                  className="max-h-96 rounded-lg border object-contain"
                />
              ) : sub.file_url.match(/\.pdf$/i) ? (
                <iframe
                  src={sub.file_url}
                  title="Submission PDF"
                  className="h-96 w-full rounded-lg border"
                />
              ) : (
                <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Attached File</p>
                    <p className="text-xs text-muted-foreground">
                      Click below to open
                    </p>
                  </div>
                </div>
              )}
              <Button variant="outline" size="sm" className="gap-1.5" asChild>
                <a
                  href={sub.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open File
                </a>
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No file attached.
            </p>
          )}
        </div>
      </div>

      {/* Right: Grading panel */}
      <div className="w-full shrink-0 rounded-xl border bg-card p-6 lg:w-80">
        {isReviewed ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold">Already Graded</h3>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground">Grade</p>
              <p className="text-3xl font-bold">{sub.grade}/100</p>
            </div>
            {sub.feedback && (
              <div>
                <p className="text-sm text-muted-foreground">Feedback</p>
                <p className="mt-1 text-sm">{sub.feedback}</p>
              </div>
            )}
            <Separator />
            <p className="text-xs text-muted-foreground">
              You can re-grade by submitting the form below.
            </p>
            <GradingForm submissionId={sub.id} />
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="font-semibold">Grade Submission</h3>
            <Separator />
            <GradingForm submissionId={sub.id} />
          </div>
        )}
      </div>
    </div>
  );
}

export default async function ReviewPage({ params }: PageProps) {
  const { submissionId } = await params;

  return (
    <>
      <DashboardHeader heading="Review Submission" />
      <Suspense fallback={<GradingDetailSkeleton />}>
        <ReviewContent submissionId={submissionId} />
      </Suspense>
    </>
  );
}

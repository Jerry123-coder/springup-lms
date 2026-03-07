import { Suspense } from "react";
import Link from "next/link";
import { ClipboardCheck, Eye } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { GradingQueueSkeleton } from "@/components/dashboard/grading-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SubmissionRow {
  id: string;
  status: string;
  created_at: string;
  file_url: string;
  grade: number | null;
  profiles: { full_name: string; email: string } | null;
  lessons: { title: string; courses: { title: string } | null } | null;
}

async function GradingQueue() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("submissions")
    .select(
      "id, status, created_at, file_url, grade, profiles!inner(full_name, email), lessons!inner(title, courses!inner(title))"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="rounded-xl border bg-card p-6 text-center">
        <p className="text-sm text-destructive">
          Error loading submissions: {error.message}
        </p>
      </div>
    );
  }

  const submissions = (data ?? []) as unknown as SubmissionRow[];
  const pending = submissions.filter((s) => s.status === "pending");
  const reviewed = submissions.filter((s) => s.status === "reviewed");

  if (submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-16 text-center">
        <ClipboardCheck className="mb-3 h-10 w-10 text-muted-foreground" />
        <h3 className="text-lg font-semibold">No submissions yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Student submissions will appear here for review.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-yellow-100 text-xs font-bold text-yellow-800">
            {pending.length}
          </span>
          Pending Review
        </h3>
        {pending.length === 0 ? (
          <p className="rounded-lg border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
            All caught up! No pending submissions.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Student</th>
                  <th className="hidden px-4 py-3 text-left font-medium sm:table-cell">
                    Course / Lesson
                  </th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((sub) => (
                  <tr key={sub.id} className="border-b last:border-b-0 even:bg-muted/40 transition-colors hover:bg-muted/60">
                    <td className="px-4 py-3">
                      <p className="font-medium">
                        {sub.profiles?.full_name || sub.profiles?.email || "—"}
                      </p>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <p className="text-muted-foreground">
                        {sub.lessons?.courses?.title} — {sub.lessons?.title}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">Pending</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="outline" className="gap-1.5" asChild>
                        <Link href={`/dashboard/instructor/reviews/${sub.id}`}>
                          <Eye className="h-3.5 w-3.5" />
                          Review
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reviewed */}
      {reviewed.length > 0 && (
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-800">
              {reviewed.length}
            </span>
            Reviewed
          </h3>
          <div className="overflow-hidden rounded-xl border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Student</th>
                  <th className="hidden px-4 py-3 text-left font-medium sm:table-cell">
                    Course / Lesson
                  </th>
                  <th className="px-4 py-3 text-left font-medium">Grade</th>
                  <th className="px-4 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {reviewed.map((sub) => (
                  <tr key={sub.id} className="border-b last:border-b-0 even:bg-muted/40 transition-colors hover:bg-muted/60">
                    <td className="px-4 py-3">
                      <p className="font-medium">
                        {sub.profiles?.full_name || sub.profiles?.email || "—"}
                      </p>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <p className="text-muted-foreground">
                        {sub.lessons?.courses?.title} — {sub.lessons?.title}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge>{sub.grade ?? "—"}/100</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="ghost" className="gap-1.5" asChild>
                        <Link href={`/dashboard/instructor/reviews/${sub.id}`}>
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InstructorDashboardPage() {
  return (
    <>
      <DashboardHeader heading="Grading Queue" />
      <div className="flex-1 space-y-6 p-6">
        <Suspense fallback={<GradingQueueSkeleton />}>
          <GradingQueue />
        </Suspense>
      </div>
    </>
  );
}

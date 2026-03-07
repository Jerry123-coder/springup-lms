import { Suspense } from "react";
import { ClipboardCheck } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface SubmissionRow {
  id: string;
  status: string;
  grade: number | null;
  feedback: string;
  created_at: string;
  file_url: string;
  lessons: { title: string; courses: { title: string } | null } | null;
}

async function SubmissionsTable() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("submissions")
    .select("id, status, grade, feedback, created_at, file_url, lessons!inner(title, courses!inner(title))")
    .eq("student_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <p className="text-sm text-destructive">
        Error loading submissions: {error.message}
      </p>
    );
  }

  const submissions = (data ?? []) as unknown as SubmissionRow[];

  if (submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-16 text-center">
        <ClipboardCheck className="mb-3 h-10 w-10 text-muted-foreground" />
        <h3 className="text-lg font-semibold">No submissions yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Your submitted assignments will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium">
              Course / Lesson
            </th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            <th className="hidden px-4 py-3 text-left font-medium sm:table-cell">
              Grade
            </th>
            <th className="hidden px-4 py-3 text-left font-medium md:table-cell">
              Feedback
            </th>
            <th className="hidden px-4 py-3 text-left font-medium lg:table-cell">
              Date
            </th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((s) => (
            <tr key={s.id} className="border-b last:border-b-0 even:bg-muted/60 transition-colors hover:bg-muted/80">
              <td className="px-4 py-3">
                <p className="font-medium">
                  {s.lessons?.courses?.title ?? "—"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {s.lessons?.title ?? "—"}
                </p>
              </td>
              <td className="px-4 py-3">
                <Badge
                  variant={s.status === "reviewed" ? "default" : "secondary"}
                >
                  {s.status}
                </Badge>
              </td>
              <td className="hidden px-4 py-3 sm:table-cell">
                {s.grade !== null ? (
                  <span className="font-semibold">{s.grade}/100</span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className="hidden max-w-xs truncate px-4 py-3 text-muted-foreground md:table-cell">
                {s.feedback || "—"}
              </td>
              <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                {new Date(s.created_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-4 border-b px-4 py-3 last:border-b-0">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="hidden h-4 w-16 sm:block" />
        </div>
      ))}
    </div>
  );
}

export default function StudentSubmissionsPage() {
  return (
    <>
      <DashboardHeader heading="My Submissions" />
      <div className="flex-1 space-y-6 p-6">
        <div>
          <h2 className="text-lg font-semibold">Submission History</h2>
          <p className="text-sm text-muted-foreground">
            Track the status and feedback on all your submitted assignments.
          </p>
        </div>
        <Suspense fallback={<TableSkeleton />}>
          <SubmissionsTable />
        </Suspense>
      </div>
    </>
  );
}

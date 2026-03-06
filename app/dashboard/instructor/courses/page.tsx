import { Suspense } from "react";
import { BookOpen } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Course } from "@/lib/types/database";

async function CoursesTable() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("pillar", { ascending: true });

  if (error) {
    return (
      <p className="text-sm text-destructive">
        Error loading courses: {error.message}
      </p>
    );
  }

  const courses = (data ?? []) as Course[];

  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-16 text-center">
        <BookOpen className="mb-3 h-10 w-10 text-muted-foreground" />
        <h3 className="text-lg font-semibold">No courses yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Courses will appear here once an admin adds them.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium">Title</th>
            <th className="px-4 py-3 text-left font-medium">Pillar</th>
            <th className="hidden px-4 py-3 text-left font-medium md:table-cell">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {courses.map((c) => (
            <tr key={c.id} className="border-b last:border-b-0">
              <td className="px-4 py-3 font-medium">{c.title}</td>
              <td className="px-4 py-3">
                <Badge variant="secondary">{c.pillar}</Badge>
              </td>
              <td className="hidden max-w-xs truncate px-4 py-3 text-muted-foreground md:table-cell">
                {c.description}
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
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4 border-b px-4 py-3 last:border-b-0">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-5 w-28 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export default function InstructorCoursesPage() {
  return (
    <>
      <DashboardHeader heading="Courses" />
      <div className="flex-1 space-y-6 p-6">
        <div>
          <h2 className="text-lg font-semibold">Course Catalogue</h2>
          <p className="text-sm text-muted-foreground">
            All courses currently available on the platform.
          </p>
        </div>
        <Suspense fallback={<TableSkeleton />}>
          <CoursesTable />
        </Suspense>
      </div>
    </>
  );
}

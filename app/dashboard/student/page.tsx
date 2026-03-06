import { Suspense } from "react";
import { BookOpen } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { CourseCard } from "@/components/dashboard/course-card";
import { CourseGridSkeleton } from "@/components/dashboard/classroom-skeleton";
import type { Course } from "@/lib/types/database";

async function CourseGrid() {
  const supabase = await createClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: true });

  if (!courses || courses.length === 0) {
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
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {(courses as Course[]).map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}

export default function StudentClassroomPage() {
  return (
    <>
      <DashboardHeader heading="My Classroom" />
      <div className="flex-1 space-y-6 p-6">
        <div>
          <h2 className="text-lg font-semibold">Your Courses</h2>
          <p className="text-sm text-muted-foreground">
            Select a course to view its lessons and submit assignments.
          </p>
        </div>
        <Suspense fallback={<CourseGridSkeleton />}>
          <CourseGrid />
        </Suspense>
      </div>
    </>
  );
}

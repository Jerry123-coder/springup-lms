import { Suspense } from "react";
import { BookOpen } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { CourseGridSkeleton } from "@/components/dashboard/classroom-skeleton";
import { StudentCourseBrowser } from "@/components/dashboard/student-course-browser";
import type { Course, LearningBlock, LearningBlockCourse } from "@/lib/types/database";

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

  const { data: blocksData } = await supabase
    .from("learning_blocks")
    .select("*")
    .order("order_index", { ascending: true });

  const { data: blockCoursesData } = await supabase
    .from("learning_block_courses")
    .select("*")
    .order("order_index", { ascending: true });

  const courseById = new Map<string, Course>();
  for (const c of courses as Course[]) courseById.set(c.id, c);

  const blocks = (blocksData ?? []) as LearningBlock[];
  const blockCourses = (blockCoursesData ?? []) as LearningBlockCourse[];

  const coursesByBlock = new Map<string, Course[]>();
  for (const bc of blockCourses) {
    const c = courseById.get(bc.course_id);
    if (!c) continue;
    const existing = coursesByBlock.get(bc.block_id) ?? [];
    existing.push(c);
    coursesByBlock.set(bc.block_id, existing);
  }

  const learningPath = blocks
    .map((b) => ({
      id: b.id,
      title: b.title,
      subtitle: b.subtitle,
      courses: coursesByBlock.get(b.id) ?? [],
    }))
    .filter((b) => b.courses.length > 0);

  return (
    <StudentCourseBrowser courses={courses as Course[]} learningPath={learningPath} />
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
            Follow the recommended learning path or explore any course.
          </p>
        </div>
        <Suspense fallback={<CourseGridSkeleton />}>
          <CourseGrid />
        </Suspense>
      </div>
    </>
  );
}

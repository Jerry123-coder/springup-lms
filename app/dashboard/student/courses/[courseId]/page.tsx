import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { LessonSidebarList } from "@/components/dashboard/lesson-sidebar-list";
import { UploadForm } from "@/components/dashboard/upload-form";
import {
  LessonSidebarSkeleton,
  LessonContentSkeleton,
} from "@/components/dashboard/classroom-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Course, Lesson, Submission } from "@/lib/types/database";

interface PageProps {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ lesson?: string }>;
}

async function CourseContent({
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

  const activeLesson = lessonId
    ? lessonList.find((l) => l.id === lessonId)
    : lessonList[0];

  // Fetch existing submissions for the active lesson
  let existingSubmission: Submission | null = null;
  if (activeLesson) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

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
    <div className="flex flex-1 flex-col md:flex-row">
      {/* Lesson sidebar */}
      <aside className="w-full border-b bg-muted/30 p-4 md:w-64 md:shrink-0 md:border-b-0 md:border-r">
        <div className="mb-4">
          <Button variant="ghost" size="sm" className="mb-2 gap-1.5" asChild>
            <Link href="/dashboard/student">
              <ArrowLeft className="h-3.5 w-3.5" />
              All Courses
            </Link>
          </Button>
          <h2 className="font-semibold">{typedCourse.title}</h2>
          <Badge variant="secondary" className="mt-1 text-xs">
            {typedCourse.pillar}
          </Badge>
        </div>

        {lessonList.length > 0 ? (
          <LessonSidebarList lessons={lessonList} courseId={courseId} />
        ) : (
          <p className="text-sm text-muted-foreground">
            No lessons added yet.
          </p>
        )}
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col p-6">
        {activeLesson ? (
          <>
            <h1 className="text-2xl font-bold">{activeLesson.title}</h1>
            <Separator className="my-4" />

            <div className="prose prose-sm max-w-none flex-1 text-foreground">
              {activeLesson.content.split("\n").map((line, i) => {
                if (line.startsWith("# "))
                  return (
                    <h1 key={i} className="text-xl font-bold mt-4 mb-2">
                      {line.slice(2)}
                    </h1>
                  );
                if (line.startsWith("## "))
                  return (
                    <h2 key={i} className="text-lg font-semibold mt-3 mb-1">
                      {line.slice(3)}
                    </h2>
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
                      className="border-l-2 border-primary pl-3 italic text-muted-foreground"
                    >
                      {line.slice(2)}
                    </blockquote>
                  );
                if (line.trim() === "") return <br key={i} />;
                return <p key={i}>{line}</p>;
              })}
            </div>

            <Separator className="my-6" />

            {/* Submission status */}
            {existingSubmission && (
              <div className="mb-4 rounded-lg border bg-muted/50 p-4">
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
            <div className="rounded-lg border bg-card p-4">
              <h3 className="mb-2 text-sm font-semibold">
                Submit Assignment
              </h3>
              <UploadForm lessonId={activeLesson.id} />
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-center">
            <div>
              <BookOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No lessons available</h3>
              <p className="text-sm text-muted-foreground">
                Lessons will appear here once an instructor adds them.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default async function CourseDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { courseId } = await params;
  const { lesson } = await searchParams;

  return (
    <>
      <DashboardHeader heading="Course" />
      <Suspense
        fallback={
          <div className="flex flex-1 flex-col md:flex-row">
            <aside className="w-full border-b bg-muted/30 p-4 md:w-64 md:shrink-0 md:border-b-0 md:border-r">
              <LessonSidebarSkeleton />
            </aside>
            <div className="flex-1 p-6">
              <LessonContentSkeleton />
            </div>
          </div>
        }
      >
        <CourseContent courseId={courseId} lessonId={lesson} />
      </Suspense>
    </>
  );
}

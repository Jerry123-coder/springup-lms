import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { LessonSidebarList } from "@/components/dashboard/lesson-sidebar-list";
import { LessonNavigation } from "@/components/dashboard/lesson-navigation";
import { UploadForm } from "@/components/dashboard/upload-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Course, Lesson, Submission } from "@/lib/types/database";

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
    <div className="flex flex-1 flex-col gap-4 md:flex-row md:gap-0">
      {/* Lesson sidebar */}
      <aside className="w-full shrink-0 rounded-xl border bg-card shadow-sm md:sticky md:top-4 md:w-72 md:self-start">
        <div className="border-b p-4">
          <Button
            variant="ghost"
            size="sm"
            className="mb-3 -ml-2 gap-1.5 text-muted-foreground hover:text-foreground"
            asChild
          >
            <Link href="/dashboard/student" className="group">
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
              Back to Courses
            </Link>
          </Button>
          <h2 className="text-lg font-semibold">{typedCourse.title}</h2>
          <Badge variant="secondary" className="mt-2 text-xs">
            {typedCourse.pillar}
          </Badge>
        </div>
        <div className="max-h-[calc(100vh-12rem)] overflow-y-auto p-3">
          {lessonList.length > 0 ? (
            <LessonSidebarList lessons={lessonList} courseId={courseId} />
          ) : (
            <p className="text-sm text-muted-foreground">No lessons added yet.</p>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {activeLesson ? (
          <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="border-b bg-muted/30 px-6 py-5">
              <h1 className="text-2xl font-bold tracking-tight">
                {activeLesson.title}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Lesson{" "}
                {lessonList.findIndex((l) => l.id === activeLesson.id) + 1} of{" "}
                {lessonList.length}
              </p>
            </div>

            <div className="p-6 md:p-8">
              <div className="prose prose-sm prose-slate dark:prose-invert max-w-none text-foreground [&_h1]:mb-2 [&_h1]:mt-6 [&_h1]:text-xl [&_h1]:font-bold [&_h2]:mb-1 [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-semibold [&_li]:ml-4 [&_blockquote]:border-l-2 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground">
                {activeLesson.content.split("\n").map((line, i) => {
                  if (line.startsWith("# "))
                    return (
                      <h1
                        key={i}
                        className="first:mt-0 mt-6 mb-2 text-xl font-bold"
                      >
                        {line.slice(2)}
                      </h1>
                    );
                  if (line.startsWith("## "))
                    return (
                      <h2 key={i} className="mt-4 mb-1 text-lg font-semibold">
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
                        className="my-2 border-l-2 border-primary pl-4 italic text-muted-foreground"
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
                })}
              </div>

              {/* Prev/Next navigation */}
              {lessonList.length > 1 && (
                <LessonNavigation
                  lessons={lessonList}
                  currentLessonId={activeLesson.id}
                  courseId={courseId}
                />
              )}

              <Separator className="my-8" />

              {/* Submission status */}
              {existingSubmission && (
                <div className="mb-6 rounded-lg border bg-muted/50 p-4 transition-colors hover:bg-muted/60">
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
              <div className="rounded-lg border bg-muted/30 p-5 transition-colors hover:bg-muted/40">
                <h3 className="mb-3 text-sm font-semibold">
                  Submit Assignment
                </h3>
                <UploadForm lessonId={activeLesson.id} />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center rounded-xl border bg-card py-20 text-center">
            <div>
              <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No lessons available</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Lessons will appear here once an instructor adds them.
              </p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/dashboard/student">Back to Courses</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


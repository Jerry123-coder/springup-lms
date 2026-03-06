"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Pencil, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CourseForm } from "@/components/dashboard/course-form";
import { LessonForm } from "@/components/dashboard/lesson-form";
import { DeleteButton } from "@/components/dashboard/delete-button";
import { deleteCourse, deleteLesson } from "@/lib/actions/admin";
import type { Course, Lesson } from "@/lib/types/database";

interface CourseWithLessons extends Course {
  lessons: Lesson[];
}

export function CourseManager({
  courses,
}: {
  courses: CourseWithLessons[];
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editingCourse, setEditingCourse] = useState<string | null>(null);
  const [addingLesson, setAddingLesson] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<string | null>(null);
  const [showAddCourse, setShowAddCourse] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">All Courses</h2>
          <p className="text-sm text-muted-foreground">
            Manage courses and lessons across the 4 pillars.
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => setShowAddCourse((prev) => !prev)}
        >
          <Plus className="h-3.5 w-3.5" />
          Add Course
        </Button>
      </div>

      {showAddCourse && (
        <div className="rounded-xl border bg-card p-4">
          <h3 className="mb-3 text-sm font-medium">New Course</h3>
          <CourseForm onDone={() => setShowAddCourse(false)} />
        </div>
      )}

      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-16 text-center">
          <h3 className="text-lg font-semibold">No courses yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Click &ldquo;Add Course&rdquo; to create your first course.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {courses.map((course) => {
            const isExpanded = expanded === course.id;
            const isEditing = editingCourse === course.id;

            return (
              <div
                key={course.id}
                className="overflow-hidden rounded-xl border bg-card"
              >
                <div className="flex items-center gap-2 p-4">
                  <button
                    onClick={() =>
                      setExpanded(isExpanded ? null : course.id)
                    }
                    className="flex h-6 w-6 items-center justify-center rounded hover:bg-muted"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium">
                        {course.title}
                      </span>
                      <Badge variant="secondary" className="shrink-0 text-xs">
                        {course.pillar}
                      </Badge>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {course.lessons.length} lesson
                        {course.lessons.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    {course.description && (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {course.description}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() =>
                        setEditingCourse(isEditing ? null : course.id)
                      }
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <DeleteButton
                      action={deleteCourse}
                      hiddenFields={{ course_id: course.id }}
                      label="Course"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="border-t bg-muted/30 p-4">
                    <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Edit Course
                    </h4>
                    <CourseForm
                      course={course}
                      onDone={() => setEditingCourse(null)}
                    />
                  </div>
                )}

                {isExpanded && (
                  <div className="border-t">
                    {course.lessons.length === 0 ? (
                      <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                        No lessons yet.
                      </p>
                    ) : (
                      <div className="divide-y">
                        {course.lessons.map((lesson) => (
                          <div key={lesson.id}>
                            <div className="flex items-center gap-3 px-4 py-3 pl-12">
                              <span className="flex h-5 w-5 items-center justify-center rounded bg-muted text-[10px] font-bold">
                                {lesson.order_index}
                              </span>
                              <span className="flex-1 truncate text-sm">
                                {lesson.title}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() =>
                                  setEditingLesson(
                                    editingLesson === lesson.id
                                      ? null
                                      : lesson.id
                                  )
                                }
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <DeleteButton
                                action={deleteLesson}
                                hiddenFields={{ lesson_id: lesson.id }}
                                label="Lesson"
                              />
                            </div>
                            {editingLesson === lesson.id && (
                              <div className="bg-muted/30 px-4 py-3 pl-12">
                                <LessonForm
                                  courseId={course.id}
                                  lesson={lesson}
                                  onDone={() => setEditingLesson(null)}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="border-t bg-muted/20 p-3 pl-12">
                      {addingLesson === course.id ? (
                        <div className="space-y-2">
                          <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            New Lesson
                          </h4>
                          <LessonForm
                            courseId={course.id}
                            onDone={() => setAddingLesson(null)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setAddingLesson(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 text-xs"
                          onClick={() => setAddingLesson(course.id)}
                        >
                          <Plus className="h-3 w-3" />
                          Add Lesson
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

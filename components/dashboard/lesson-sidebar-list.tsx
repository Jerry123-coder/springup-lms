"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FileText } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Lesson } from "@/lib/types/database";

export function LessonSidebarList({
  lessons,
  courseId,
}: {
  lessons: Lesson[];
  courseId: string;
}) {
  const searchParams = useSearchParams();
  const activeLessonId = searchParams.get("lesson");

  return (
    <nav className="space-y-1">
      {lessons.map((lesson, idx) => {
        const isActive = activeLessonId === lesson.id;
        return (
          <Button
            key={lesson.id}
            variant={isActive ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start gap-2 text-left",
              isActive && "bg-secondary font-medium"
            )}
            asChild
          >
            <Link
              href={`/dashboard/student/courses/${courseId}?lesson=${lesson.id}`}
            >
              <FileText className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {idx + 1}. {lesson.title}
              </span>
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}

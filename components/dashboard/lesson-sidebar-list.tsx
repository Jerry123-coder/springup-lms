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
              "w-full justify-start gap-2.5 text-left transition-all",
              isActive && "bg-secondary font-medium shadow-sm",
              !isActive && "hover:bg-muted/70"
            )}
            asChild
          >
            <Link
              href={`/dashboard/student/courses/${courseId}?lesson=${lesson.id}`}
              className="flex items-center gap-2.5"
            >
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {idx + 1}
              </span>
              <FileText className="h-4 w-4 shrink-0 opacity-70" />
              <span className="truncate flex-1">
                {lesson.title}
              </span>
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}

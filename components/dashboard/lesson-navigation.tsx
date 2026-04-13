"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Lesson } from "@/lib/types/database";

export function LessonNavigation({
  lessons,
  currentLessonId,
  courseId,
}: {
  lessons: Lesson[];
  currentLessonId: string;
  courseId: string;
}) {
  const idx = lessons.findIndex((l) => l.id === currentLessonId);
  const prev = idx > 0 ? lessons[idx - 1] : null;
  const next = idx >= 0 && idx < lessons.length - 1 ? lessons[idx + 1] : null;

  const navClass = cn(
    buttonVariants({ variant: "outline", size: "sm" }),
    "group gap-1.5"
  );

  return (
    <nav className="flex items-center justify-between gap-4 border-t pt-6">
      {prev ? (
        <Link
          href={`/dashboard/student/courses/${courseId}/lessons/${prev.id}`}
          className={navClass}
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Previous: {prev.title}
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={`/dashboard/student/courses/${courseId}/lessons/${next.id}`}
          className={navClass}
        >
          Next: {next.title}
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}

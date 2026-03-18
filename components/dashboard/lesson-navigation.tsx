"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
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

  return (
    <nav className="flex items-center justify-between gap-4 border-t pt-6">
      {prev ? (
        <Button variant="outline" size="sm" className="gap-1.5" asChild>
          <Link
            href={`/dashboard/student/courses/${courseId}/lessons/${prev.id}`}
            className="group"
          >
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Previous: {prev.title}
          </Link>
        </Button>
      ) : (
        <div />
      )}
      {next ? (
        <Button variant="outline" size="sm" className="gap-1.5" asChild>
          <Link
            href={`/dashboard/student/courses/${courseId}/lessons/${next.id}`}
            className="group"
          >
            Next: {next.title}
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Button>
      ) : (
        <div />
      )}
    </nav>
  );
}

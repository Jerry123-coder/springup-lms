
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Monitor,
  Briefcase,
  HeartHandshake,
  BookOpen,
  ChevronRight,
  Loader2,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Course, CoursePillar } from "@/lib/types/database";

const pillarIcons: Record<CoursePillar, React.ComponentType<{ className?: string }>> = {
  "Digital Literacy": Monitor,
  "Career Readiness": Briefcase,
  "Life Skills": HeartHandshake,
  "Cultural Identity": BookOpen,
};

const pillarStyles: Record<
  CoursePillar,
  { bar: string; iconWrap: string; hoverBg: string; pill: string }
> = {
  "Digital Literacy": {
    bar: "from-sky-500/70 via-sky-400/30 to-transparent",
    iconWrap: "bg-sky-500/12 text-sky-700 dark:text-sky-300",
    hoverBg: "group-hover:bg-sky-500/5 dark:group-hover:bg-sky-400/7",
    pill:
      "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/40 dark:bg-sky-950/40 dark:text-sky-300",
  },
  "Career Readiness": {
    bar: "from-amber-500/70 via-orange-400/30 to-transparent",
    iconWrap: "bg-amber-500/12 text-amber-800 dark:text-amber-300",
    hoverBg: "group-hover:bg-amber-500/5 dark:group-hover:bg-amber-400/7",
    pill:
      "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-300",
  },
  "Life Skills": {
    bar: "from-emerald-500/70 via-emerald-400/30 to-transparent",
    iconWrap: "bg-emerald-500/12 text-emerald-800 dark:text-emerald-300",
    hoverBg: "group-hover:bg-emerald-500/5 dark:group-hover:bg-emerald-400/7",
    pill:
      "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  "Cultural Identity": {
    bar: "from-violet-500/70 via-violet-400/30 to-transparent",
    iconWrap: "bg-violet-500/12 text-violet-800 dark:text-violet-300",
    hoverBg: "group-hover:bg-violet-500/5 dark:group-hover:bg-violet-400/7",
    pill:
      "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900/40 dark:bg-violet-950/40 dark:text-violet-300",
  },
};

export function CourseCard({ course }: { course: Course }) {
  const Icon = pillarIcons[course.pillar] ?? BookOpen;
  const styles = pillarStyles[course.pillar] ?? pillarStyles["Digital Literacy"];
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function goToCourse() {
    startTransition(() => {
      router.push(`/dashboard/student/courses/${course.id}`);
    });
  }

  return (
    <button
      type="button"
      onClick={goToCourse}
      className="group block w-full text-left cursor-pointer rounded-xl transition-transform duration-100 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2"
      aria-label={`Open course: ${course.title}`}
    >
      <Card className={`relative h-full overflow-hidden transition-all duration-200 group-hover:-translate-y-1 group-hover:border-primary/30 group-hover:shadow-lg ${styles.hoverBg}`}>
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-linear-to-r ${styles.bar}`}
        />
        {isPending && (
          <div className="absolute inset-0 z-10 grid place-items-center bg-background/60 backdrop-blur-[2px]">
            <div className="flex items-center gap-2 rounded-full border bg-background/80 px-3 py-2 text-sm font-medium shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading course…
            </div>
          </div>
        )}
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${styles.iconWrap}`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-[15px] leading-snug group-hover:text-primary/90">
                  {course.title}
                </CardTitle>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${styles.pill}`}>
                    {course.pillar}
                  </span>
                </div>
              </div>
          </div>
            <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0.5" />
          </div>

          <CardDescription className="mt-3 line-clamp-2 text-xs leading-relaxed">
            {course.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between pt-0">
          <p className="text-xs text-muted-foreground">
            Open course and continue learning
          </p>
        </CardContent>
      </Card>
    </button>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Route, Search, Sparkles } from "lucide-react";

import type { Course, CoursePillar } from "@/lib/types/database";
import { CourseCard } from "@/components/dashboard/course-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export type LearningPathBlock = {
  id: string;
  title: string;
  subtitle: string;
  courses: Course[];
};

const pillarOrder: CoursePillar[] = [
  "Digital Literacy",
  "Career Readiness",
  "Life Skills",
  "Cultural Identity",
];

export function StudentCourseBrowser({
  courses,
  learningPath,
}: {
  courses: Course[];
  learningPath: LearningPathBlock[];
}) {
  const [pillar, setPillar] = useState<CoursePillar | "All">("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses.filter((c) => {
      if (pillar !== "All" && c.pillar !== pillar) return false;
      if (!q) return true;
      return (
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.pillar.toLowerCase().includes(q)
      );
    });
  }, [courses, pillar, query]);

  const groupedByPillar = useMemo(() => {
    const map = new Map<CoursePillar, Course[]>();
    for (const p of pillarOrder) map.set(p, []);
    for (const c of filtered) map.get(c.pillar)?.push(c);
    return map;
  }, [filtered]);

  return (
    <div className="space-y-6">
      {learningPath.length > 0 && (
        <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-300">
                  <Route className="h-4 w-4" />
                </div>
                <h3 className="text-base font-semibold">Learning Path</h3>
                <Badge variant="secondary" className="gap-1.5 text-xs">
                  <Sparkles className="h-3.5 w-3.5" />
                  Recommended
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                A guided flow for the full programme. You can still explore any course anytime.
              </p>
            </div>
          </div>

          {/* Mobile: swipeable blocks */}
          <div className="mt-4 sm:hidden">
            <div className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory">
              {learningPath.map((block) => (
                <div
                  key={block.id}
                  className="snap-start w-[88%] shrink-0 rounded-2xl border bg-muted/10 p-4"
                >
                  <p className="text-sm font-semibold">{block.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {block.subtitle}
                  </p>
                  <div className="mt-4 space-y-3">
                    {block.courses.slice(0, 2).map((c) => (
                      <CourseCard key={c.id} course={c} />
                    ))}
                  </div>
                  {block.courses.length > 2 && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      +{block.courses.length - 2} more course(s)
                    </p>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Swipe to view the next block.
            </p>
          </div>

          {/* Desktop/tablet: full list */}
          <div className="mt-5 hidden space-y-6 sm:block">
            {learningPath.map((block, idx) => (
              <div key={block.id}>
                {idx > 0 && <Separator className="mb-6 bg-border/60" />}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{block.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{block.subtitle}</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {block.courses.map((c) => (
                    <CourseCard key={c.id} course={c} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h3 className="text-base font-semibold">Explore Courses</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Filter by pillar, or search by keyword.
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses..."
              className="pl-9"
            />
          </div>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Button
            type="button"
            variant={pillar === "All" ? "default" : "outline"}
            size="sm"
            onClick={() => setPillar("All")}
            className="shrink-0"
          >
            All pillars
          </Button>
          {pillarOrder.map((p) => (
            <Button
              key={p}
              type="button"
              variant={pillar === p ? "default" : "outline"}
              size="sm"
              onClick={() => setPillar(p)}
              className="shrink-0"
            >
              {p}
            </Button>
          ))}
        </div>

        <div className="mt-6 space-y-8">
          {pillar === "All" ? (
            pillarOrder.map((p) => {
              const list = groupedByPillar.get(p) ?? [];
              if (list.length === 0) return null;
              return (
                <div key={p}>
                  <div className="mb-3 flex items-end justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-semibold">{p}</h4>
                      <p className="text-xs text-muted-foreground">{list.length} course(s)</p>
                    </div>
                  </div>
                  <Separator className="mb-4 bg-border/60" />
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {list.map((course) => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}

          {filtered.length === 0 && (
            <div className="rounded-xl border bg-muted/20 p-10 text-center">
              <p className="text-sm font-medium">No matching courses</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try clearing filters or searching for a different keyword.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}


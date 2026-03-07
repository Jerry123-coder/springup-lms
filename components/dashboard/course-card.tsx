"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Monitor, Briefcase, HeartHandshake, BookOpen, ChevronRight } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Course, CoursePillar } from "@/lib/types/database";

const pillarIcons: Record<CoursePillar, React.ComponentType<{ className?: string }>> = {
  "Digital Literacy": Monitor,
  "Career Readiness": Briefcase,
  "Life Skills": HeartHandshake,
  "Cultural Identity": BookOpen,
};

export function CourseCard({ course, index = 0 }: { course: Course; index?: number }) {
  const Icon = pillarIcons[course.pillar] ?? BookOpen;
  const ref = useRef<HTMLAnchorElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => e.isIntersecting && setInView(true),
      { threshold: 0.1, rootMargin: "40px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <Link
      ref={ref}
      href={`/dashboard/student/courses/${course.id}`}
      className="group block cursor-pointer rounded-xl transition-transform duration-100 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2"
    >
      <Card
        className="h-full transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:border-primary/30"
        style={
          inView
            ? {
                animation: "fade-in-up 0.5s ease-out forwards",
                animationDelay: `${index * 0.08}s`,
                animationFillMode: "forwards",
              }
            : { opacity: 0 }
        }
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
              <Icon className="h-4 w-4" />
            </div>
            <Badge variant="secondary" className="text-xs">
              {course.pillar}
            </Badge>
          </div>
          <CardTitle className="mt-3 text-base group-hover:text-primary/90">
            {course.title}
          </CardTitle>
          <CardDescription className="line-clamp-2 text-xs">
            {course.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">View lessons</p>
          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-all duration-200 group-hover:opacity-100" />
        </CardContent>
      </Card>
    </Link>
  );
}

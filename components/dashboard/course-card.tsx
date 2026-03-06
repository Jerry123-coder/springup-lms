import Link from "next/link";
import { Monitor, Briefcase, HeartHandshake, BookOpen } from "lucide-react";

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

export function CourseCard({ course }: { course: Course }) {
  const Icon = pillarIcons[course.pillar] ?? BookOpen;

  return (
    <Link href={`/dashboard/student/courses/${course.id}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </div>
            <Badge variant="secondary" className="text-xs">
              {course.pillar}
            </Badge>
          </div>
          <CardTitle className="mt-3 text-base">{course.title}</CardTitle>
          <CardDescription className="line-clamp-2 text-xs">
            {course.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">Click to view lessons</p>
        </CardContent>
      </Card>
    </Link>
  );
}

"use client";

import { useRef, useTransition } from "react";
import { Loader2, Plus, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createCourse, updateCourse } from "@/lib/actions/admin";
import type { Course, CoursePillar } from "@/lib/types/database";

const pillars: CoursePillar[] = [
  "Digital Literacy",
  "Career Readiness",
  "Life Skills",
  "Cultural Identity",
];

export function CourseForm({
  course,
  onDone,
}: {
  course?: Course;
  onDone?: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const isEdit = !!course;

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = isEdit
        ? await updateCourse(formData)
        : await createCourse(formData);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(isEdit ? "Course updated" : "Course created");
        formRef.current?.reset();
        onDone?.();
      }
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-3">
      {isEdit && <input type="hidden" name="course_id" value={course.id} />}
      <Input
        name="title"
        placeholder="Course title"
        defaultValue={course?.title ?? ""}
        required
        disabled={isPending}
      />
      <select
        name="pillar"
        defaultValue={course?.pillar ?? ""}
        required
        disabled={isPending}
        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
      >
        <option value="" disabled>
          Select pillar...
        </option>
        {pillars.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
      <textarea
        name="description"
        placeholder="Course description"
        defaultValue={course?.description ?? ""}
        rows={2}
        disabled={isPending}
        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
      />
      <Button type="submit" disabled={isPending} size="sm" className="gap-1.5">
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : isEdit ? (
          <Save className="h-3.5 w-3.5" />
        ) : (
          <Plus className="h-3.5 w-3.5" />
        )}
        {isEdit ? "Save Changes" : "Add Course"}
      </Button>
    </form>
  );
}

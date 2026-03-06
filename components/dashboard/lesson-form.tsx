"use client";

import { useRef, useTransition } from "react";
import { Loader2, Plus, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createLesson, updateLesson } from "@/lib/actions/admin";
import type { Lesson } from "@/lib/types/database";

export function LessonForm({
  courseId,
  lesson,
  onDone,
}: {
  courseId: string;
  lesson?: Lesson;
  onDone?: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const isEdit = !!lesson;

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = isEdit
        ? await updateLesson(formData)
        : await createLesson(formData);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(isEdit ? "Lesson updated" : "Lesson created");
        formRef.current?.reset();
        onDone?.();
      }
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-3">
      <input type="hidden" name="course_id" value={courseId} />
      {isEdit && <input type="hidden" name="lesson_id" value={lesson.id} />}
      <div className="flex gap-2">
        <Input
          name="title"
          placeholder="Lesson title"
          defaultValue={lesson?.title ?? ""}
          required
          disabled={isPending}
          className="flex-1"
        />
        <Input
          name="order_index"
          type="number"
          placeholder="#"
          defaultValue={lesson?.order_index ?? 0}
          disabled={isPending}
          className="w-16"
        />
      </div>
      <textarea
        name="content"
        placeholder="Lesson content (Markdown)"
        defaultValue={lesson?.content ?? ""}
        rows={6}
        disabled={isPending}
        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
      />
      <Button type="submit" disabled={isPending} size="sm" className="gap-1.5">
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : isEdit ? (
          <Save className="h-3.5 w-3.5" />
        ) : (
          <Plus className="h-3.5 w-3.5" />
        )}
        {isEdit ? "Save Lesson" : "Add Lesson"}
      </Button>
    </form>
  );
}

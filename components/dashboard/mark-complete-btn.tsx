"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { markLessonVideoWatched } from "@/lib/actions/student";

export function MarkCompleteBtn({
  lessonId,
  courseId,
  watchedAt,
}: {
  lessonId: string;
  courseId: string;
  watchedAt: string | null;
}) {
  const [watched, setWatched] = useState(!!watchedAt);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setWatched(!!watchedAt);
  }, [watchedAt]);

  async function handleClick() {
    if (watched || pending) return;
    setPending(true);
    const result = await markLessonVideoWatched(lessonId, courseId);
    setPending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setWatched(true);
    toast.success("Lesson marked as complete");
  }

  return (
    <button
      type="button"
      disabled={watched || pending}
      onClick={() => void handleClick()}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-200",
        watched
          ? "border-primary/20 bg-secondary text-primary cursor-default"
          : "border-border bg-card text-foreground hover:border-primary/30 hover:bg-secondary hover:text-primary",
        pending && "pointer-events-none opacity-60"
      )}
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
      ) : watched ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
      ) : (
        <Circle className="h-4 w-4 shrink-0" />
      )}
      {watched ? "Completed" : pending ? "Saving…" : "Mark as Complete"}
    </button>
  );
}

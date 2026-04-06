"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, PlayCircle } from "lucide-react";
import { toast } from "sonner";

import { markLessonVideoWatched } from "@/lib/actions/student";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LessonVideoPlayer({
  videoId,
  lessonId,
  courseId,
  watchedAt,
  iconClassName,
}: {
  videoId: string;
  lessonId: string;
  courseId: string;
  watchedAt: string | null;
  iconClassName?: string;
}) {
  const [watched, setWatched] = useState(!!watchedAt);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setWatched(!!watchedAt);
  }, [watchedAt]);

  async function markWatched() {
    setPending(true);
    const result = await markLessonVideoWatched(lessonId, courseId);
    setPending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setWatched(true);
    toast.success("Video marked as watched");
  }

  return (
    <div className="mb-6 overflow-hidden rounded-xl border bg-muted/10">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <PlayCircle className={cn("h-4 w-4", iconClassName)} />
          <p className="text-sm font-semibold">Lesson video</p>
          {watched ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Watched
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">Not watched yet</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending || watched}
            onClick={() => void markWatched()}
          >
            {watched ? "Completed" : pending ? "Saving…" : "Mark as watched"}
          </Button>
          <a
            className="text-xs text-muted-foreground underline-offset-4 hover:underline"
            href={`https://www.youtube.com/watch?v=${videoId}`}
            target="_blank"
            rel="noreferrer"
          >
            Open on YouTube
          </a>
        </div>
      </div>
      <div className="relative aspect-video w-full bg-black/5">
        <iframe
          className="h-full w-full"
          src={`https://www.youtube.com/embed/${videoId}?rel=0`}
          title="Lesson video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <div className="border-t px-4 py-3">
        <p className="text-xs text-muted-foreground">
          When you have finished watching, click &quot;Mark as watched&quot; so your
          instructor can see your progress.
        </p>
      </div>
    </div>
  );
}

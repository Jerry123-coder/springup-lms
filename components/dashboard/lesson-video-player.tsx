"use client";

import { useState } from "react";
import { Play } from "lucide-react";

import { youtubeThumbnailUrls } from "@/lib/youtube";
import { cn } from "@/lib/utils";

/**
 * YouTube lesson video: shows a clean thumbnail + play; loads the iframe only after play.
 * Optional `thumbnailUrl` overrides the default YouTube poster image.
 */
export function LessonVideoPlayer({
  videoId,
  thumbnailUrl,
  className,
}: {
  videoId: string;
  thumbnailUrl?: string | null;
  className?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const [thumbFallback, setThumbFallback] = useState(0);

  const defaults = youtubeThumbnailUrls(videoId);
  const posterSources = thumbnailUrl?.trim()
    ? [thumbnailUrl.trim(), ...defaults]
    : defaults;

  if (playing) {
    return (
      <div
        className={cn(
          "overflow-hidden rounded-2xl bg-black shadow-ambient ring-1 ring-border/50",
          className
        )}
      >
        <div className="aspect-video w-full">
          <iframe
            className="h-full w-full"
            src={`https://www.youtube.com/embed/${videoId}?rel=0&autoplay=1`}
            title="Lesson video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  const src = posterSources[Math.min(thumbFallback, posterSources.length - 1)];

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className={cn(
        "group relative aspect-video w-full overflow-hidden rounded-2xl bg-black text-left shadow-ambient ring-1 ring-border/50 outline-none transition hover:ring-primary/40 focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      aria-label="Play lesson video"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className="h-full w-full object-cover"
        onError={() => {
          setThumbFallback((i) =>
            i < posterSources.length - 1 ? i + 1 : i
          );
        }}
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-black/30"
        aria-hidden
      />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-primary shadow-lg transition group-hover:scale-105 group-hover:shadow-xl sm:h-[4.5rem] sm:w-[4.5rem]">
          <Play className="ml-1 h-9 w-9 fill-current sm:h-10 sm:w-10" aria-hidden />
        </span>
      </span>
    </button>
  );
}

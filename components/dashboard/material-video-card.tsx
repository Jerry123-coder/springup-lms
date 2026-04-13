"use client";

import { useState } from "react";
import { Play, X } from "lucide-react";

import { extractYoutubeId, youtubeThumbnailUrls } from "@/lib/youtube";
import { cn } from "@/lib/utils";

/** Compact thumbnail + play for a supplemental video resource (lesson materials). */
export function MaterialVideoCard({
  title,
  url,
  thumbnailUrl,
  className,
}: {
  title: string;
  url: string;
  thumbnailUrl?: string | null;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [thumbFallback, setThumbFallback] = useState(0);

  const id = extractYoutubeId(url);
  if (!id) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-primary underline-offset-2 hover:underline",
          className
        )}
      >
        {title}
      </a>
    );
  }

  const defaults = youtubeThumbnailUrls(id);
  const posterSources = thumbnailUrl?.trim()
    ? [thumbnailUrl.trim(), ...defaults]
    : defaults;
  const src = posterSources[Math.min(thumbFallback, posterSources.length - 1)];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "group relative flex w-full overflow-hidden rounded-xl border border-border/60 bg-muted/30 text-left transition hover:bg-muted/50",
          className
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <span className="relative aspect-video w-36 shrink-0 bg-black sm:w-44">
          <img
            src={src}
            alt=""
            className="h-full w-full object-cover"
            onError={() =>
              setThumbFallback((i) =>
                i < posterSources.length - 1 ? i + 1 : i
              )
            }
          />
          <span className="absolute inset-0 flex items-center justify-center bg-black/25">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-primary shadow-md">
              <Play className="ml-0.5 h-5 w-5 fill-current" aria-hidden />
            </span>
          </span>
        </span>
        <span className="flex min-w-0 flex-1 flex-col justify-center px-3 py-2">
          <span className="truncate text-sm font-semibold text-foreground">{title}</span>
          <span className="text-xs text-muted-foreground">Video · tap to play</span>
        </span>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal
          aria-label={title}
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-3xl overflow-hidden rounded-xl bg-black shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-foreground shadow-md hover:bg-background"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="aspect-video w-full">
              <iframe
                className="h-full w-full"
                src={`https://www.youtube.com/embed/${id}?rel=0&autoplay=1`}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

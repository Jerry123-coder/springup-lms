"use client";

import { useState } from "react";
import { Play, Clock, User } from "lucide-react";

interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  instructor: string;
  pillar: string;
  pillarColor: string;
  youtubeId: string;
}

export function VideoCard({ video }: { video: VideoTutorial }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="relative aspect-video bg-muted">
        {playing ? (
          <iframe
            src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <button
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#0f2847] to-[#1e3a5f]"
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 shadow-lg backdrop-blur-sm transition-transform group-hover:scale-110">
                <Play className="ml-0.5 h-6 w-6 text-white" />
              </div>
              <span className="text-xs font-medium text-white/70">
                Click to play
              </span>
            </div>
          </button>
        )}
      </div>

      <div className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <span
            className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${video.pillarColor}`}
          >
            {video.pillar}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {video.duration}
          </span>
        </div>
        <h3 className="mb-1 text-sm font-semibold leading-snug">
          {video.title}
        </h3>
        <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
          {video.description}
        </p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <User className="h-3 w-3" />
          {video.instructor}
        </div>
      </div>
    </div>
  );
}

export type { VideoTutorial };

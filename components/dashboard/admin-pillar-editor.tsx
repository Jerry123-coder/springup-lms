"use client";

import { useState, useTransition, useRef } from "react";
import { ChevronDown, Loader2, Pencil, Save, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updatePillarSettings } from "@/lib/actions/admin";

type PillarMeta = {
  slug: string;
  description: string;
  subtitle: string;
};

type PillarStats = {
  courseCount: number;
  lessonCount: number;
  studentCount: number;
};

const PILLAR_STYLES: Record<string, { dot: string; gradient: string; text: string; border: string }> = {
  "Digital Literacy": {
    dot: "bg-sky-500",
    gradient: "from-sky-500/15 to-sky-600/5",
    text: "text-sky-700 dark:text-sky-300",
    border: "border-sky-500/20",
  },
  "Career Readiness": {
    dot: "bg-amber-500",
    gradient: "from-amber-500/15 to-amber-600/5",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-500/20",
  },
  "Life Skills": {
    dot: "bg-emerald-500",
    gradient: "from-emerald-500/15 to-emerald-600/5",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-500/20",
  },
  "Cultural Identity": {
    dot: "bg-violet-500",
    gradient: "from-violet-500/15 to-violet-600/5",
    text: "text-violet-700 dark:text-violet-300",
    border: "border-violet-500/20",
  },
};

export function AdminPillarEditor({
  pillars,
  stats,
}: {
  pillars: PillarMeta[];
  stats: Record<string, PillarStats>;
}) {
  const [editingSlug, setEditingSlug] = useState<string | null>(null);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {pillars.map((pillar) => (
        <PillarCard
          key={pillar.slug}
          pillar={pillar}
          stats={stats[pillar.slug] ?? { courseCount: 0, lessonCount: 0, studentCount: 0 }}
          isEditing={editingSlug === pillar.slug}
          onEdit={() => setEditingSlug(pillar.slug)}
          onClose={() => setEditingSlug(null)}
        />
      ))}
    </div>
  );
}

function PillarCard({
  pillar,
  stats,
  isEditing,
  onEdit,
  onClose,
}: {
  pillar: PillarMeta;
  stats: PillarStats;
  isEditing: boolean;
  onEdit: () => void;
  onClose: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const style = PILLAR_STYLES[pillar.slug] ?? PILLAR_STYLES["Digital Literacy"];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    fd.set("slug", pillar.slug);

    startTransition(async () => {
      const res = await updatePillarSettings(fd);
      if (res.error) toast.error(res.error);
      else { toast.success(`"${pillar.slug}" updated`); onClose(); }
    });
  }

  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-linear-to-br ${style.gradient} ${style.border} shadow-ambient transition-shadow hover:shadow-lg`}
    >
      {/* Header */}
      <div className="flex items-start justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <div className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
          <span className={`text-xs font-bold uppercase tracking-wider ${style.text}`}>
            {pillar.slug}
          </span>
        </div>
        {!isEditing ? (
          <button
            type="button"
            onClick={onEdit}
            className="flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-background/60 hover:text-foreground"
            title="Edit pillar"
          >
            <Pencil className="h-3 w-3" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-background/60 hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="flex gap-4 px-4 pb-3">
        <div className="text-center">
          <p className="font-display text-lg font-bold tabular-nums leading-none text-foreground">{stats.courseCount}</p>
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Courses</p>
        </div>
        <div className="text-center">
          <p className="font-display text-lg font-bold tabular-nums leading-none text-foreground">{stats.lessonCount}</p>
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Lessons</p>
        </div>
      </div>

      {/* Content: view or edit */}
      {!isEditing ? (
        <div className="border-t border-inherit/50 bg-background/40 px-4 py-3">
          <p className={`text-xs font-semibold ${style.text}`}>{pillar.subtitle || "No subtitle"}</p>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground line-clamp-3">
            {pillar.description || "No description. Click the edit icon to add one."}
          </p>
        </div>
      ) : (
        <form ref={formRef} onSubmit={handleSubmit} className="border-t border-inherit/50 bg-background/40 space-y-3 p-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Subtitle
            </label>
            <Input
              name="subtitle"
              defaultValue={pillar.subtitle}
              placeholder="e.g. Microsoft Office & Workplace Tech"
              disabled={isPending}
              className="rounded-xl text-xs h-8"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Description
            </label>
            <textarea
              name="description"
              defaultValue={pillar.description}
              rows={4}
              disabled={isPending}
              placeholder="Describe what this pillar covers…"
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 resize-none"
            />
          </div>
          <Button type="submit" disabled={isPending} className="h-7 w-full gap-1.5 rounded-xl text-xs">
            {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
            {isPending ? "Saving…" : "Save Changes"}
          </Button>
        </form>
      )}
    </div>
  );
}

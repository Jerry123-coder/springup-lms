"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  FileText,
  Link2,
  Loader2,
  Plus,
  Trash2,
  Video,
} from "lucide-react";
import { toast } from "sonner";

import {
  addLessonMaterial,
  deleteLessonMaterial,
  updateLessonMaterial,
} from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { LessonMaterial, LessonMaterialKind } from "@/lib/types/database";

const KINDS: { value: LessonMaterialKind; label: string }[] = [
  { value: "link", label: "Link" },
  { value: "file", label: "File / download URL" },
  { value: "video", label: "Video (YouTube)" },
];

export function LessonMaterialsEditor({
  lessonId,
  courseId,
  initialMaterials,
}: {
  lessonId: string;
  courseId: string;
  initialMaterials: LessonMaterial[];
}) {
  const router = useRouter();
  const [items, setItems] = useState<LessonMaterial[]>(() =>
    [...initialMaterials].sort((a, b) => a.order_index - b.order_index)
  );
  const [pending, start] = useTransition();

  useEffect(() => {
    setItems([...initialMaterials].sort((a, b) => a.order_index - b.order_index));
  }, [initialMaterials]);

  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<LessonMaterialKind>("link");
  const [url, setUrl] = useState("");
  const [thumb, setThumb] = useState("");

  function submitAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      toast.error("Title and URL are required");
      return;
    }
    const fd = new FormData();
    fd.set("lesson_id", lessonId);
    fd.set("course_id", courseId);
    fd.set("title", title.trim());
    fd.set("kind", kind);
    fd.set("url", url.trim());
    if (kind === "video" && thumb.trim()) fd.set("thumbnail_url", thumb.trim());
    fd.set("order_index", String(items.length));

    start(async () => {
      const res = await addLessonMaterial(fd);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Resource added");
        setTitle("");
        setUrl("");
        setThumb("");
        setKind("link");
        router.refresh();
      }
    });
  }

  function remove(id: string) {
    if (!confirm("Remove this resource?")) return;
    const fd = new FormData();
    fd.set("id", id);
    fd.set("course_id", courseId);
    start(async () => {
      const res = await deleteLessonMaterial(fd);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Removed");
        router.refresh();
      }
    });
  }

  function move(id: string, dir: -1 | 1) {
    const idx = items.findIndex((m) => m.id === id);
    const j = idx + dir;
    if (idx < 0 || j < 0 || j >= items.length) return;
    const reordered = [...items];
    [reordered[idx], reordered[j]] = [reordered[j], reordered[idx]];
    const withOrder = reordered.map((m, i) => ({ ...m, order_index: i }));
    setItems(withOrder);

    const a = withOrder[idx];
    const b = withOrder[j];
    start(async () => {
      const run = async (m: LessonMaterial) => {
        const fd = new FormData();
        fd.set("id", m.id);
        fd.set("course_id", courseId);
        fd.set("title", m.title);
        fd.set("kind", m.kind);
        fd.set("url", m.url);
        if (m.thumbnail_url) fd.set("thumbnail_url", m.thumbnail_url);
        fd.set("order_index", String(m.order_index));
        return updateLessonMaterial(fd);
      };
      const r1 = await run(a);
      const r2 = await run(b);
      if (r1.error || r2.error) {
        toast.error(r1.error ?? r2.error ?? "Reorder failed");
        router.refresh();
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-4 rounded-xl border border-dashed border-border/80 bg-muted/20 p-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Learning resources
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Links, file downloads, or extra YouTube videos. The main lesson video uses the content
          field (paste a YouTube URL or use <code className="rounded bg-muted px-0.5">@youtube:VIDEO_ID</code>
          ).
        </p>
      </div>

      {items.length > 0 ? (
        <ul className="space-y-2">
          {items.map((m, i) => (
            <li
              key={m.id}
              className="flex items-start gap-2 rounded-lg border bg-card px-3 py-2 text-sm"
            >
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  className="rounded p-0.5 text-muted-foreground hover:bg-muted disabled:opacity-30"
                  disabled={i === 0 || pending}
                  onClick={() => move(m.id, -1)}
                  aria-label="Move up"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="rounded p-0.5 text-muted-foreground hover:bg-muted disabled:opacity-30"
                  disabled={i === items.length - 1 || pending}
                  onClick={() => move(m.id, 1)}
                  aria-label="Move down"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{m.title}</p>
                <p className="text-[10px] uppercase text-muted-foreground">{m.kind}</p>
                <p className="truncate text-xs text-muted-foreground">{m.url}</p>
              </div>
              <button
                type="button"
                onClick={() => remove(m.id)}
                disabled={pending}
                className="shrink-0 rounded p-1.5 text-destructive hover:bg-destructive/10"
                aria-label="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground">No resources yet — add below.</p>
      )}

      <form onSubmit={submitAdd} className="space-y-3 border-t pt-3">
        <p className="text-xs font-semibold text-foreground">Add resource</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (e.g. Practice worksheet)"
            className="rounded-lg text-sm"
          />
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as LessonMaterialKind)}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          >
            {KINDS.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
        </div>
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={
            kind === "video"
              ? "https://www.youtube.com/watch?v=… or youtu.be/…"
              : "https://…"
          }
          className="rounded-lg font-mono text-xs"
        />
        {kind === "video" ? (
          <Input
            value={thumb}
            onChange={(e) => setThumb(e.target.value)}
            placeholder="Optional custom thumbnail image URL"
            className="rounded-lg text-xs"
          />
        ) : null}
        <Button type="submit" size="sm" disabled={pending} loading={pending} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Add resource
        </Button>
      </form>
    </div>
  );
}

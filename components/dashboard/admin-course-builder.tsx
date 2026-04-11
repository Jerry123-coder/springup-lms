"use client";

import { useState, useTransition, useRef, useCallback } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Loader2,
  Pencil,
  Plus,
  Save,
  Settings2,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createLesson,
  updateLesson,
  deleteLesson,
  updateCourse,
  reorderLessons,
} from "@/lib/actions/admin";
import { LessonMaterialsEditor } from "@/components/dashboard/lesson-materials-editor";
import type {
  Course,
  CourseCategory,
  CoursePillar,
  Lesson,
  LessonMaterial,
} from "@/lib/types/database";

const PILLARS: CoursePillar[] = [
  "Digital Literacy",
  "Career Readiness",
  "Life Skills",
  "Cultural Identity",
];
const CATEGORIES: CourseCategory[] = ["Word", "Excel", "Slides", "Other"];

const PILLAR_STYLE: Record<string, { dot: string; pill: string }> = {
  "Digital Literacy":  { dot: "bg-sky-500",     pill: "bg-sky-500/10 text-sky-700 dark:text-sky-300" },
  "Career Readiness":  { dot: "bg-amber-500",   pill: "bg-amber-500/10 text-amber-700 dark:text-amber-400" },
  "Life Skills":       { dot: "bg-emerald-500", pill: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
  "Cultural Identity": { dot: "bg-violet-500",  pill: "bg-violet-500/10 text-violet-700 dark:text-violet-300" },
};

type Tab = "curriculum" | "settings";

export function AdminCourseBuilder({
  course,
  lessons: initialLessons,
  materialsByLessonId,
}: {
  course: Course;
  lessons: Lesson[];
  materialsByLessonId: Record<string, LessonMaterial[]>;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("curriculum");
  const [lessons, setLessons] = useState<Lesson[]>(
    [...initialLessons].sort((a, b) => a.order_index - b.order_index)
  );
  const [activeLessonId, setActiveLessonId] = useState<string | null>(
    initialLessons.length > 0 ? initialLessons[0].id : null
  );
  const [addingLesson, setAddingLesson] = useState(false);
  const [reorderPending, startReorderTransition] = useTransition();

  const activeLesson = lessons.find((l) => l.id === activeLessonId) ?? null;

  // Move lesson up / down (optimistic)
  function moveLesson(id: string, direction: "up" | "down") {
    setLessons((prev) => {
      const idx = prev.findIndex((l) => l.id === id);
      if (idx === -1) return prev;
      const newIdx = direction === "up" ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const updated = [...prev];
      [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
      const reindexed = updated.map((l, i) => ({ ...l, order_index: i + 1 }));

      // Persist async
      const fd = new FormData();
      fd.set("course_id", course.id);
      fd.set("ordered_ids", JSON.stringify(reindexed.map((l) => l.id)));
      startReorderTransition(async () => { await reorderLessons(fd); });

      return reindexed;
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      {/* ── LEFT: Lesson list + tabs ─────────────────────────── */}
      <aside className="flex flex-col gap-4">
        {/* Tab switcher */}
        <div className="flex rounded-2xl bg-muted/40 p-1">
          {(["curriculum", "settings"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setActiveTab(t)}
              className={`flex-1 rounded-xl py-2 text-xs font-semibold capitalize transition-colors ${
                activeTab === t
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "curriculum" ? "Lessons" : "Course Info"}
            </button>
          ))}
        </div>

        {activeTab === "curriculum" && (
          <>
            {/* Lesson list */}
            <div className="overflow-hidden rounded-2xl bg-card shadow-ambient">
              <div className="border-b px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Curriculum <span className="ml-1 font-normal">({lessons.length})</span>
                </p>
              </div>
              {lessons.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No lessons yet — add one below.
                </p>
              ) : (
                <div className="divide-y">
                  {lessons.map((lesson, idx) => (
                    <LessonListItem
                      key={lesson.id}
                      lesson={lesson}
                      isActive={activeLessonId === lesson.id}
                      isFirst={idx === 0}
                      isLast={idx === lessons.length - 1}
                      onSelect={() => { setActiveLessonId(lesson.id); setAddingLesson(false); }}
                      onMoveUp={() => moveLesson(lesson.id, "up")}
                      onMoveDown={() => moveLesson(lesson.id, "down")}
                    />
                  ))}
                </div>
              )}
              {/* Add lesson button */}
              <div className="border-t p-3">
                <button
                  type="button"
                  onClick={() => { setAddingLesson(true); setActiveLessonId(null); }}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition-colors ${
                    addingLesson
                      ? "bg-primary text-[#f0f7f5]"
                      : "bg-secondary text-primary hover:bg-primary hover:text-[#f0f7f5]"
                  }`}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Lesson
                </button>
              </div>
            </div>

            {/* Pillar info */}
            <div className="rounded-2xl bg-card p-4 shadow-ambient">
              <div className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${PILLAR_STYLE[course.pillar]?.dot ?? "bg-primary"}`} />
                <p className="text-xs font-semibold text-foreground">{course.pillar}</p>
              </div>
              {course.category && course.category !== "Other" && (
                <p className="mt-1 text-xs text-muted-foreground">Category: {course.category}</p>
              )}
              {course.description && (
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-4">
                  {course.description}
                </p>
              )}
            </div>
          </>
        )}

        {activeTab === "settings" && (
          <CourseSettingsPanel course={course} />
        )}
      </aside>

      {/* ── RIGHT: Lesson editor / Add form ─────────────────── */}
      <div>
        {addingLesson ? (
          <AddLessonPanel
            courseId={course.id}
            nextIndex={lessons.length + 1}
            onAdded={(newLesson) => {
              setLessons((prev) => [...prev, newLesson]);
              setActiveLessonId(newLesson.id);
              setAddingLesson(false);
            }}
            onClose={() => setAddingLesson(false)}
          />
        ) : activeLesson ? (
          <LessonEditorPanel
            key={activeLesson.id}
            lesson={activeLesson}
            courseId={course.id}
            materials={materialsByLessonId[activeLesson.id] ?? []}
            onUpdated={(updated) =>
              setLessons((prev) =>
                prev.map((l) => (l.id === updated.id ? updated : l))
              )
            }
            onDeleted={(id) => {
              setLessons((prev) => prev.filter((l) => l.id !== id));
              setActiveLessonId(null);
            }}
          />
        ) : (
          <EmptyEditor lessonsCount={lessons.length} onAddClick={() => setAddingLesson(true)} />
        )}
      </div>
    </div>
  );
}

// ── Lesson list item ─────────────────────────────────────────────
function LessonListItem({
  lesson,
  isActive,
  isFirst,
  isLast,
  onSelect,
  onMoveUp,
  onMoveDown,
}: {
  lesson: Lesson;
  isActive: boolean;
  isFirst: boolean;
  isLast: boolean;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  return (
    <div
      className={`group flex items-center gap-2 px-3 py-2.5 transition-colors cursor-pointer ${
        isActive ? "bg-primary/8" : "hover:bg-muted/40"
      }`}
      onClick={onSelect}
    >
      <GripVertical className="h-3.5 w-3.5 shrink-0 text-muted-foreground/30" />
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-muted text-[10px] font-bold text-muted-foreground">
        {lesson.order_index}
      </div>
      <p className={`flex-1 truncate text-xs font-medium ${isActive ? "text-primary" : "text-foreground"}`}>
        {lesson.title}
      </p>
      <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
          disabled={isFirst}
          className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted disabled:opacity-20"
          title="Move up"
        >
          <ChevronUp className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
          disabled={isLast}
          className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted disabled:opacity-20"
          title="Move down"
        >
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

// ── Lesson editor panel ──────────────────────────────────────────
function LessonEditorPanel({
  lesson,
  courseId,
  materials,
  onUpdated,
  onDeleted,
}: {
  lesson: Lesson;
  courseId: string;
  materials: LessonMaterial[];
  onUpdated: (l: Lesson) => void;
  onDeleted: (id: string) => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [title, setTitle] = useState(lesson.title);
  const [orderIndex, setOrderIndex] = useState(lesson.order_index);
  const [content, setContent] = useState(lesson.content);
  const [previewMode, setPreviewMode] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("lesson_id", lesson.id);
    fd.set("course_id", courseId);
    fd.set("title", title);
    fd.set("order_index", String(orderIndex));
    fd.set("content", content);

    startTransition(async () => {
      const res = await updateLesson(fd);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Lesson saved");
        onUpdated({ ...lesson, title, order_index: orderIndex, content });
      }
    });
  }

  function handleDelete() {
    if (!confirm(`Delete lesson "${lesson.title}"? This cannot be undone.`)) return;
    const fd = new FormData();
    fd.set("lesson_id", lesson.id);
    fd.set("course_id", courseId);
    startDeleteTransition(async () => {
      const res = await deleteLesson(fd);
      if (res.error) toast.error(res.error);
      else { toast.success("Lesson deleted"); onDeleted(lesson.id); }
    });
  }

  // Render a simple content preview (detect YouTube URL)
  function renderPreview(text: string) {
    const ytMatch = text.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    if (ytMatch) {
      return (
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${ytMatch[1]}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      );
    }
    return (
      <div className="prose prose-sm dark:prose-invert max-w-none rounded-xl bg-muted/40 p-5 text-sm leading-relaxed">
        <pre className="whitespace-pre-wrap font-sans text-sm">{text || <em className="text-muted-foreground">No content yet.</em>}</pre>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-card shadow-ambient">
      {/* Editor header */}
      <div className="flex items-center justify-between border-b bg-muted/30 px-5 py-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Lesson Editor</span>
          <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
            #{lesson.order_index}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              previewMode
                ? "bg-primary text-[#f0f7f5]"
                : "bg-muted text-muted-foreground hover:bg-secondary"
            }`}
          >
            {previewMode ? "Edit" : "Preview"}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-destructive/10 text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
            title="Delete lesson"
          >
            {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} ref={formRef} className="p-5 space-y-5">
        {/* Title + order */}
        <div className="grid gap-3 sm:grid-cols-[1fr_100px]">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Lesson Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Introduction to Spreadsheets"
              required
              disabled={isPending || previewMode}
              className="rounded-xl text-base font-semibold"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Order #
            </label>
            <Input
              type="number"
              value={orderIndex}
              onChange={(e) => setOrderIndex(Number(e.target.value))}
              min={1}
              disabled={isPending || previewMode}
              className="rounded-xl"
            />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Content
            </label>
            <span className="text-[10px] text-muted-foreground">
              Supports Markdown • Paste a YouTube URL to embed a video
            </span>
          </div>
          {previewMode ? (
            renderPreview(content)
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Paste a YouTube URL:\nhttps://www.youtube.com/watch?v=...\n\nOr write lesson content in Markdown:\n# Heading\n**Bold**, *italic*, lists, etc.`}
              rows={18}
              disabled={isPending}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 font-mono text-sm leading-relaxed placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50 resize-y"
            />
          )}
        </div>

        {/* Save */}
        {!previewMode && (
          <div className="flex justify-end border-t pt-4">
            <Button type="submit" loading={isPending} disabled={isPending} className="gap-2 rounded-xl px-6">
              {!isPending && <Save className="h-4 w-4" />}
              {isPending ? "Saving…" : "Save Lesson"}
            </Button>
          </div>
        )}
      </form>

      {!previewMode && (
        <div className="border-t px-5 pb-5 pt-4">
          <LessonMaterialsEditor
            lessonId={lesson.id}
            courseId={courseId}
            initialMaterials={materials}
          />
        </div>
      )}
    </div>
  );
}

// ── Add lesson panel ─────────────────────────────────────────────
function AddLessonPanel({
  courseId,
  nextIndex,
  onAdded,
  onClose,
}: {
  courseId: string;
  nextIndex: number;
  onAdded: (lesson: Lesson) => void;
  onClose: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [orderIndex, setOrderIndex] = useState(nextIndex);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const fd = new FormData();
    fd.set("course_id", courseId);
    fd.set("title", title.trim());
    fd.set("content", content);
    fd.set("order_index", String(orderIndex));

    startTransition(async () => {
      const res = await createLesson(fd);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Lesson added");
        // Optimistically construct new lesson object for immediate rendering
        const newLesson: Lesson = {
          id: crypto.randomUUID(),
          course_id: courseId,
          title: title.trim(),
          content,
          order_index: orderIndex,
          created_at: new Date().toISOString(),
        };
        onAdded(newLesson);
      }
    });
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-card shadow-ambient">
      <div className="flex items-center justify-between border-b bg-muted/30 px-5 py-3">
        <div className="flex items-center gap-2">
          <Plus className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">New Lesson</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} ref={formRef} className="space-y-5 p-5">
        <div className="grid gap-3 sm:grid-cols-[1fr_100px]">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Lesson Title *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Introduction to Formatting"
              required
              disabled={isPending}
              className="rounded-xl text-base font-semibold"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Order #
            </label>
            <Input
              type="number"
              value={orderIndex}
              onChange={(e) => setOrderIndex(Number(e.target.value))}
              min={1}
              disabled={isPending}
              className="rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Content
            </label>
            <span className="text-[10px] text-muted-foreground">
              YouTube URL or Markdown
            </span>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`Paste a YouTube URL:\nhttps://www.youtube.com/watch?v=...\n\nOr write content in Markdown.`}
            rows={16}
            disabled={isPending}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 font-mono text-sm leading-relaxed placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50 resize-y"
          />
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button type="button" variant="secondary" onClick={onClose} className="rounded-xl">
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isPending}
            disabled={isPending || !title.trim()}
            className="gap-2 rounded-xl px-6"
          >
            {!isPending && <Plus className="h-4 w-4" />}
            {isPending ? "Adding…" : "Add Lesson"}
          </Button>
        </div>
      </form>
    </div>
  );
}

// ── Course settings panel ────────────────────────────────────────
function CourseSettingsPanel({ course }: { course: Course }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    fd.set("course_id", course.id);

    startTransition(async () => {
      const res = await updateCourse(fd);
      if (res.error) toast.error(res.error);
      else { toast.success("Course settings saved"); setSaved(true); setTimeout(() => setSaved(false), 2000); }
    });
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-card shadow-ambient">
      <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-3">
        <Settings2 className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">Course Settings</span>
      </div>
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 p-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Title</label>
          <Input name="title" defaultValue={course.title} required disabled={isPending} className="rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pillar</label>
          <select
            name="pillar"
            defaultValue={course.pillar}
            required
            disabled={isPending}
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
          >
            {PILLARS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</label>
          <select
            name="category"
            defaultValue={course.category}
            disabled={isPending}
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</label>
          <textarea
            name="description"
            defaultValue={course.description}
            rows={5}
            disabled={isPending}
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 resize-none"
          />
        </div>
        <Button type="submit" loading={isPending} disabled={isPending} className="w-full gap-2 rounded-xl">
          {!isPending && <Save className="h-4 w-4" />}
          {isPending ? "Saving…" : saved ? "Saved!" : "Save Settings"}
        </Button>
      </form>
    </div>
  );
}

// ── Empty state ──────────────────────────────────────────────────
function EmptyEditor({ lessonsCount, onAddClick }: { lessonsCount: number; onAddClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/50 bg-muted/20 px-8 py-20 text-center">
      <BookOpen className="mb-4 h-12 w-12 text-muted-foreground/30" />
      <p className="font-display text-base font-semibold text-foreground">
        {lessonsCount === 0 ? "No lessons yet" : "Select a lesson to edit"}
      </p>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">
        {lessonsCount === 0
          ? 'Click "Add Lesson" to build out your course curriculum.'
          : "Pick any lesson from the list on the left, or add a new one."}
      </p>
      {lessonsCount === 0 && (
        <button
          type="button"
          onClick={onAddClick}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-[#f0f7f5] transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Add First Lesson
        </button>
      )}
    </div>
  );
}

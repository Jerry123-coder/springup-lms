"use client";

import {
  useState,
  useTransition,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Eye,
  FileText,
  Layers,
  Loader2,
  PencilLine,
  Plus,
  Save,
  Search,
  Settings2,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  createLesson,
  updateLesson,
  deleteLesson,
  updateCourse,
  reorderLessons,
} from "@/lib/actions/admin";
import { LessonMaterialsEditor } from "@/components/dashboard/lesson-materials-editor";
import { cn } from "@/lib/utils";
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
  "Digital Literacy": {
    dot: "bg-sky-500",
    pill: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
  "Career Readiness": {
    dot: "bg-amber-500",
    pill: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  "Life Skills": {
    dot: "bg-emerald-500",
    pill: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  "Cultural Identity": {
    dot: "bg-violet-500",
    pill: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  },
};

export function AdminCourseBuilder({
  course,
  lessons: initialLessons,
  materialsByLessonId,
}: {
  course: Course;
  lessons: Lesson[];
  materialsByLessonId: Record<string, LessonMaterial[]>;
}) {
  const [lessons, setLessons] = useState<Lesson[]>(
    [...initialLessons].sort((a, b) => a.order_index - b.order_index)
  );
  const [activeLessonId, setActiveLessonId] = useState<string | null>(
    initialLessons.length > 0 ? initialLessons[0].id : null
  );
  const [addingLesson, setAddingLesson] = useState(false);
  const [lessonQuery, setLessonQuery] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [, startReorderTransition] = useTransition();

  const activeLesson = lessons.find((l) => l.id === activeLessonId) ?? null;

  const filteredLessons = useMemo(() => {
    const q = lessonQuery.trim().toLowerCase();
    if (!q) return lessons;
    return lessons.filter((l) => l.title.toLowerCase().includes(q));
  }, [lessons, lessonQuery]);

  function moveLesson(id: string, direction: "up" | "down") {
    setLessons((prev) => {
      const idx = prev.findIndex((l) => l.id === id);
      if (idx === -1) return prev;
      const newIdx = direction === "up" ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const updated = [...prev];
      [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
      const reindexed = updated.map((l, i) => ({ ...l, order_index: i + 1 }));

      const fd = new FormData();
      fd.set("course_id", course.id);
      fd.set("ordered_ids", JSON.stringify(reindexed.map((l) => l.id)));
      startReorderTransition(async () => {
        await reorderLessons(fd);
      });

      return reindexed;
    });
  }

  const pillarStyle =
    PILLAR_STYLE[course.pillar] ?? PILLAR_STYLE["Digital Literacy"];

  return (
    <div className="flex flex-col gap-6">
      {/* Course summary + settings entry */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border/50 bg-card/60 px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            You are editing
          </p>
          <h2 className="mt-0.5 font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {course.title}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                pillarStyle.pill
              )}
            >
              <span
                className={cn("h-1.5 w-1.5 rounded-full", pillarStyle.dot)}
              />
              {course.pillar}
            </span>
            <span className="text-xs text-muted-foreground">
              {course.category}
            </span>
            <span className="text-xs text-muted-foreground">
              · {lessons.length} lesson{lessons.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          className="shrink-0 gap-2 rounded-xl border-border/80"
          onClick={() => setSettingsOpen(true)}
        >
          <Settings2 className="h-4 w-4" />
          Course details
        </Button>
      </div>

      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SheetContent className="flex w-full flex-col overflow-y-auto sm:max-w-md">
          <SheetHeader className="text-left">
            <SheetTitle>Course details</SheetTitle>
            <SheetDescription>
              How this course appears in the catalog and learning path.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 flex-1">
            <CourseSettingsPanel
              course={course}
              onSaved={() => setSettingsOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main builder: lessons | editor */}
      <div className="grid min-h-[min(70vh,52rem)] gap-6 lg:grid-cols-[minmax(0,17.5rem)_1fr] xl:grid-cols-[minmax(0,19rem)_1fr]">
        <aside className="flex min-h-0 flex-col gap-3 lg:max-h-[calc(100vh-12rem)] lg:overflow-hidden">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
            <div className="shrink-0 border-b border-border/50 px-3 py-3 sm:px-4">
              <p className="text-xs font-semibold text-foreground">Lessons</p>
              <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                Select a lesson to edit. Use arrows to reorder — order is
                saved automatically.
              </p>
              {lessons.length > 4 ? (
                <div className="relative mt-3">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={lessonQuery}
                    onChange={(e) => setLessonQuery(e.target.value)}
                    placeholder="Search lessons…"
                    className="h-9 rounded-lg pl-8 text-sm"
                  />
                </div>
              ) : null}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {lessons.length === 0 ? (
                <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No lessons yet. Add one below.
                </p>
              ) : filteredLessons.length === 0 ? (
                <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No lessons match your search.
                </p>
              ) : (
                <ul className="divide-y divide-border/40 p-2">
                  {filteredLessons.map((lesson) => {
                    const globalIdx = lessons.findIndex(
                      (l) => l.id === lesson.id
                    );
                    const isFirst = globalIdx <= 0;
                    const isLast = globalIdx >= lessons.length - 1;
                    return (
                      <LessonListItem
                        key={lesson.id}
                        lesson={lesson}
                        isActive={
                          activeLessonId === lesson.id && !addingLesson
                        }
                        isFirst={isFirst}
                        isLast={isLast}
                        onSelect={() => {
                          setActiveLessonId(lesson.id);
                          setAddingLesson(false);
                        }}
                        onMoveUp={() => moveLesson(lesson.id, "up")}
                        onMoveDown={() => moveLesson(lesson.id, "down")}
                      />
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="shrink-0 border-t border-border/50 p-2">
              <button
                type="button"
                onClick={() => {
                  setAddingLesson(true);
                  setActiveLessonId(null);
                }}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors",
                  addingLesson
                    ? "bg-primary text-[#f0f7f5]"
                    : "bg-primary/10 text-primary hover:bg-primary hover:text-[#f0f7f5]"
                )}
              >
                <Plus className="h-4 w-4" />
                New lesson
              </button>
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          {addingLesson ? (
            <AddLessonPanel
              courseId={course.id}
              nextIndex={lessons.length + 1}
              onAdded={(newLesson) => {
                setLessons((prev) => [...prev, newLesson]);
                setActiveLessonId(newLesson.id);
                setAddingLesson(false);
                setLessonQuery("");
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
            <EmptyEditor
              lessonsCount={lessons.length}
              onAddClick={() => setAddingLesson(true)}
            />
          )}
        </main>
      </div>
    </div>
  );
}

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
    <li>
      <div
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect();
          }
        }}
        className={cn(
          "flex w-full items-center gap-2 rounded-xl px-2 py-2.5 text-left transition-colors",
          isActive
            ? "bg-primary/12 ring-1 ring-primary/25"
            : "hover:bg-muted/50"
        )}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold tabular-nums text-muted-foreground">
          {lesson.order_index}
        </span>
        <span
          className={cn(
            "min-w-0 flex-1 truncate text-sm font-medium",
            isActive ? "text-primary" : "text-foreground"
          )}
        >
          {lesson.title}
        </span>
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp();
            }}
            disabled={isFirst}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-background hover:text-foreground disabled:pointer-events-none disabled:opacity-25"
            title="Move up"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown();
            }}
            disabled={isLast}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-background hover:text-foreground disabled:pointer-events-none disabled:opacity-25"
            title="Move down"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>
    </li>
  );
}

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
  const [content, setContent] = useState(lesson.content);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    setTitle(lesson.title);
    setContent(lesson.content);
    setPreviewMode(false);
  }, [lesson.id, lesson.title, lesson.content]);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("lesson_id", lesson.id);
    fd.set("course_id", courseId);
    fd.set("title", title);
    fd.set("order_index", String(lesson.order_index));
    fd.set("content", content);

    startTransition(async () => {
      const res = await updateLesson(fd);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Lesson saved");
        onUpdated({
          ...lesson,
          title,
          order_index: lesson.order_index,
          content,
        });
      }
    });
  }

  function handleDelete() {
    if (
      !confirm(
        `Delete lesson "${lesson.title}"? This cannot be undone.`
      )
    )
      return;
    const fd = new FormData();
    fd.set("lesson_id", lesson.id);
    fd.set("course_id", courseId);
    startDeleteTransition(async () => {
      const res = await deleteLesson(fd);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Lesson deleted");
        onDeleted(lesson.id);
      }
    });
  }

  function renderPreview(text: string) {
    const ytMatch = text.match(
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/
    );
    if (ytMatch) {
      return (
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${ytMatch[1]}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
            title="Video preview"
          />
        </div>
      );
    }
    if (!text.trim()) {
      return (
        <div className="rounded-xl border border-dashed border-border/50 bg-muted/20 p-8 text-center text-sm text-muted-foreground">
          No content yet — switch to Write to add a video link or notes.
        </div>
      );
    }
    return (
      <div className="rounded-xl border border-border/50 bg-muted/30 p-4 text-sm leading-relaxed">
        <pre className="whitespace-pre-wrap font-sans text-sm">{text}</pre>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/50 px-4 py-4 sm:px-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-muted-foreground">
            <PencilLine className="h-4 w-4 shrink-0" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Edit lesson
            </span>
          </div>
          <p className="mt-1 truncate font-display text-lg font-bold text-foreground">
            {lesson.title}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg bg-muted/60 p-0.5">
            <button
              type="button"
              onClick={() => setPreviewMode(false)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                !previewMode
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <FileText className="h-3.5 w-3.5" />
              Write
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode(true)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                previewMode
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Eye className="h-3.5 w-3.5" />
              Preview
            </button>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
            title="Delete lesson"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <form
        onSubmit={handleSave}
        ref={formRef}
        className="flex flex-col"
      >
        <div className="space-y-6 px-4 py-5 sm:px-5">
          <div className="space-y-2">
            <label
              htmlFor="lesson-title"
              className="text-sm font-medium text-foreground"
            >
              Lesson title
            </label>
            <Input
              id="lesson-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What students see in the outline"
              required
              disabled={isPending || previewMode}
              className="rounded-xl text-base"
            />
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <label className="text-sm font-medium text-foreground">
                Lesson content
              </label>
              <span className="text-[11px] text-muted-foreground">
                YouTube link embeds · otherwise plain text / notes
              </span>
            </div>
            {previewMode ? (
              renderPreview(content)
            ) : (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`Paste a main video link:\nhttps://www.youtube.com/watch?v=…\n\nAdd notes, steps, or markdown-style headings below.`}
                rows={14}
                disabled={isPending}
                className="w-full resize-y rounded-xl border border-input bg-background px-4 py-3 font-mono text-sm leading-relaxed placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              />
            )}
          </div>
        </div>

        {!previewMode && (
          <div className="sticky bottom-0 z-10 flex justify-end gap-2 border-t border-border/60 bg-card/95 px-4 py-3 backdrop-blur-md supports-backdrop-filter:bg-card/85 sm:px-5">
            <Button
              type="submit"
              loading={isPending}
              disabled={isPending}
              className="gap-2 rounded-xl px-6"
            >
              {!isPending && <Save className="h-4 w-4" />}
              {isPending ? "Saving…" : "Save lesson"}
            </Button>
          </div>
        )}
      </form>

      <div className="border-t border-border/50 px-4 py-5 sm:px-5">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Layers className="h-4 w-4 text-muted-foreground" />
          Extra materials
        </div>
        <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
          Optional links, files, or extra videos for this lesson. Students see
          these below the main content.
        </p>
        <LessonMaterialsEditor
          lessonId={lesson.id}
          courseId={courseId}
          initialMaterials={materials}
        />
      </div>
    </div>
  );
}

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
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const fd = new FormData();
    fd.set("course_id", courseId);
    fd.set("title", title.trim());
    fd.set("content", content);
    fd.set("order_index", String(nextIndex));

    startTransition(async () => {
      const res = await createLesson(fd);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      const row = (res as { lesson?: Lesson }).lesson;
      if (row && typeof row === "object" && "id" in row) {
        toast.success("Lesson added");
        onAdded(row as Lesson);
        return;
      }
      toast.error("Lesson created but response was incomplete. Refresh the page.");
    });
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-4 sm:px-5">
        <div>
          <div className="flex items-center gap-2 text-primary">
            <Plus className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              New lesson
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a title first — you can paste content and materials after.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 px-4 py-5 sm:px-5">
        <div className="space-y-2">
          <label
            htmlFor="new-lesson-title"
            className="text-sm font-medium text-foreground"
          >
            Lesson title <span className="text-destructive">*</span>
          </label>
          <Input
            id="new-lesson-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Formatting your first document"
            required
            disabled={isPending}
            className="rounded-xl text-base"
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Content <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="You can add this later. Paste a YouTube URL or lesson notes."
            rows={12}
            disabled={isPending}
            className="w-full resize-y rounded-xl border border-input bg-background px-4 py-3 font-mono text-sm leading-relaxed placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          />
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-border/50 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isPending}
            disabled={isPending || !title.trim()}
            className="gap-2 rounded-xl px-6"
          >
            {!isPending && <Plus className="h-4 w-4" />}
            {isPending ? "Adding…" : "Create lesson"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function CourseSettingsPanel({
  course,
  onSaved,
}: {
  course: Course;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    fd.set("course_id", course.id);

    startTransition(async () => {
      const res = await updateCourse(fd);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Course saved");
        router.refresh();
        onSaved?.();
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Title</label>
        <Input
          name="title"
          defaultValue={course.title}
          required
          disabled={isPending}
          className="rounded-xl"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Pillar</label>
        <select
          name="pillar"
          defaultValue={course.pillar}
          required
          disabled={isPending}
          className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        >
          {PILLARS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Category</label>
        <select
          name="category"
          defaultValue={course.category}
          disabled={isPending}
          className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Description
        </label>
        <textarea
          name="description"
          defaultValue={course.description}
          rows={5}
          disabled={isPending}
          className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        />
      </div>
      <Button
        type="submit"
        loading={isPending}
        disabled={isPending}
        className="w-full gap-2 rounded-xl"
      >
        {!isPending && <Save className="h-4 w-4" />}
        {isPending ? "Saving…" : "Save course details"}
      </Button>
    </form>
  );
}

function EmptyEditor({
  lessonsCount,
  onAddClick,
}: {
  lessonsCount: number;
  onAddClick: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20 px-8 py-16 text-center">
      <BookOpen className="mb-4 h-11 w-11 text-muted-foreground/40" />
      <p className="font-display text-lg font-semibold text-foreground">
        {lessonsCount === 0 ? "Start with your first lesson" : "Choose a lesson"}
      </p>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {lessonsCount === 0
          ? "Lessons appear in order for students. You can add materials and videos after creating each one."
          : "Pick a lesson from the list on the left, or create a new one."}
      </p>
      {lessonsCount === 0 && (
        <Button
          type="button"
          onClick={onAddClick}
          className="mt-6 gap-2 rounded-xl"
        >
          <Plus className="h-4 w-4" />
          New lesson
        </Button>
      )}
    </div>
  );
}

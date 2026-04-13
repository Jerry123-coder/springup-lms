"use client";

import { useState, useTransition, useRef } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  GripVertical,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createCourse,
  updateCourse,
  deleteCourse,
  createLesson,
  updateLesson,
  deleteLesson,
} from "@/lib/actions/admin";
import type { Course, CourseCategory, CoursePillar, Lesson } from "@/lib/types/database";

// ── Types ────────────────────────────────────────────────────────
export interface CourseWithLessons extends Course {
  lessons: Lesson[];
  studentCount?: number;
  pendingCount?: number;
}

const PILLARS: CoursePillar[] = [
  "Digital Literacy",
  "Career Readiness",
  "Life Skills",
  "Cultural Identity",
];
const CATEGORIES: CourseCategory[] = ["Word", "Excel", "Slides", "Other"];

const PILLAR_STYLE: Record<
  string,
  { dot: string; pill: string; header: string }
> = {
  "Digital Literacy": {
    dot: "bg-sky-500",
    pill: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/40",
    header: "from-sky-950/60 to-sky-900/20",
  },
  "Career Readiness": {
    dot: "bg-amber-500",
    pill: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40",
    header: "from-amber-950/60 to-amber-900/20",
  },
  "Life Skills": {
    dot: "bg-emerald-500",
    pill: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40",
    header: "from-emerald-950/60 to-emerald-900/20",
  },
  "Cultural Identity": {
    dot: "bg-violet-500",
    pill: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/40",
    header: "from-violet-950/60 to-violet-900/20",
  },
};

// ── Main export ───────────────────────────────────────────────────
export function CourseManager({ courses }: { courses: CourseWithLessons[] }) {
  const [showCreate, setShowCreate] = useState(false);
  const [pillarFilter, setPillarFilter] = useState<CoursePillar | "All">("All");

  const grouped = PILLARS.map((p) => ({
    pillar: p,
    courses: courses.filter((c) => c.pillar === p),
  })).filter((g) => pillarFilter === "All" || g.pillar === pillarFilter);

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setPillarFilter("All")}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              pillarFilter === "All"
                ? "bg-primary text-[#f0f7f5]"
                : "bg-muted text-muted-foreground hover:bg-secondary"
            }`}
          >
            All pillars
          </button>
          {PILLARS.map((p) => {
            const s = PILLAR_STYLE[p];
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPillarFilter(p)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  pillarFilter === p
                    ? "bg-primary text-[#f0f7f5]"
                    : "bg-muted text-muted-foreground hover:bg-secondary"
                }`}
              >
                <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${s.dot}`} />
                {p}
              </button>
            );
          })}
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="gap-2 rounded-xl"
          size="sm"
        >
          <Plus className="h-4 w-4" /> New Course
        </Button>
      </div>

      {/* Create course form */}
      {showCreate && (
        <CourseCreateForm onClose={() => setShowCreate(false)} />
      )}

      {/* Pillar groups */}
      {grouped.map(({ pillar, courses: pillarCourses }) => {
        if (pillarCourses.length === 0 && pillarFilter !== "All") return null;
        const style = PILLAR_STYLE[pillar];
        return (
          <section key={pillar}>
            {/* Pillar heading */}
            <div className="mb-3 flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${style.dot}`} />
              <h3 className="font-display text-sm font-semibold text-foreground">{pillar}</h3>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                {pillarCourses.length}
              </span>
            </div>

            {pillarCourses.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-border/50 py-8 text-center text-sm text-muted-foreground">
                No {pillar} courses yet — create one above.
              </div>
            ) : (
              <div className="space-y-3">
                {pillarCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}
          </section>
        );
      })}

      {courses.length === 0 && !showCreate && (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-muted/40 px-6 py-16 text-center">
          <BookOpen className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="font-display text-base font-semibold">No courses yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Click &ldquo;New Course&rdquo; to create your first course.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Course create form ────────────────────────────────────────────
function CourseCreateForm({ onClose }: { onClose: () => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(fd: FormData) {
    startTransition(async () => {
      const res = await createCourse(fd);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Course created");
        formRef.current?.reset();
        onClose();
      }
    });
  }

            return (
    <div className="overflow-hidden rounded-2xl border-2 border-dashed border-primary/40 bg-card shadow-ambient">
      <div className="flex items-center justify-between border-b bg-muted/30 px-5 py-3">
        <div className="flex items-center gap-2">
          <Plus className="h-4 w-4 text-primary" />
          <h3 className="font-display text-sm font-semibold">Create New Course</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <form ref={formRef} action={handleSubmit} className="p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-muted-foreground">Course Title *</label>
            <Input
              name="title"
              placeholder="e.g. Introduction to Microsoft Word"
              required
              disabled={isPending}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Pillar *</label>
            <select
              name="pillar"
              defaultValue=""
              required
              disabled={isPending}
              className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
            >
              <option value="" disabled>Select pillar…</option>
              {PILLARS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Category</label>
            <select
              name="category"
              defaultValue="Other"
              disabled={isPending}
              className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-muted-foreground">Description</label>
            <textarea
              name="description"
              placeholder="What will students learn in this course?"
              rows={3}
              disabled={isPending}
              className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose} className="rounded-xl">
            Cancel
          </Button>
          <Button type="submit" size="sm" loading={isPending} disabled={isPending} className="gap-1.5 rounded-xl">
            {!isPending && <Plus className="h-3.5 w-3.5" />}
            {isPending ? "Creating…" : "Create Course"}
          </Button>
        </div>
      </form>
    </div>
  );
}

// ── Course card ───────────────────────────────────────────────────
function CourseCard({ course }: { course: CourseWithLessons }) {
  const [expanded, setExpanded]   = useState(false);
  const [editing, setEditing]     = useState(false);
  const [addingLesson, setAddingLesson] = useState(false);
  const style = PILLAR_STYLE[course.pillar] ?? PILLAR_STYLE["Digital Literacy"];

  return (
    <div className="overflow-hidden rounded-2xl bg-card shadow-ambient ring-1 ring-border/40 transition-all duration-200 hover:ring-primary/20">
      {/* Course header */}
      <div className="flex items-start gap-3 p-5">
        {/* Expand toggle */}
                  <button
          type="button"
          onClick={() => { setExpanded(!expanded); setEditing(false); }}
          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
        >
          {expanded
            ? <ChevronDown className="h-4 w-4" />
            : <ChevronRight className="h-4 w-4" />}
                  </button>

        {/* Info */}
                  <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-sm font-semibold text-foreground">{course.title}</span>
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${style.pill}`}>
              {course.pillar}
                      </span>
            {course.category && course.category !== "Other" && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                {course.category}
                      </span>
            )}
                    </div>
                    {course.description && (
            <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{course.description}</p>
          )}
          {/* Stats mini row */}
          <div className="mt-2 flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              <strong className="text-foreground">{course.lessons.length}</strong> lesson{course.lessons.length !== 1 ? "s" : ""}
            </span>
            {course.studentCount !== undefined && (
              <span className="inline-flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                <strong className="text-foreground">{course.studentCount}</strong> students
              </span>
            )}
            {course.pendingCount !== undefined && course.pendingCount > 0 && (
              <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <ClipboardCheck className="h-3.5 w-3.5" />
                <strong>{course.pendingCount}</strong> pending
              </span>
                    )}
                  </div>
        </div>

        {/* Action buttons */}
                  <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            title="Edit course"
            onClick={() => { setEditing(!editing); setExpanded(false); }}
            className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${
              editing
                ? "bg-primary text-[#f0f7f5]"
                : "bg-secondary text-primary hover:bg-primary hover:text-[#f0f7f5]"
            }`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
          </button>
          <DeleteCourseButton courseId={course.id} courseTitle={course.title} />
                  </div>
                </div>

      {/* Edit course panel */}
      {editing && (
        <CourseEditPanel course={course} onClose={() => setEditing(false)} />
      )}

      {/* Lessons panel */}
      {expanded && (
        <div className="border-t bg-muted/20">
                    {course.lessons.length === 0 ? (
            <p className="px-5 py-6 text-center text-sm text-muted-foreground">
              No lessons yet — add one below.
                      </p>
                    ) : (
                      <div className="divide-y">
              {course.lessons
                .slice()
                .sort((a, b) => a.order_index - b.order_index)
                .map((lesson) => (
                  <LessonRow key={lesson.id} lesson={lesson} courseId={course.id} />
                        ))}
                      </div>
                    )}

          {/* Add lesson trigger */}
          <div className="border-t bg-muted/10 px-5 py-3">
            {addingLesson ? (
              <LessonCreateForm
                            courseId={course.id}
                nextIndex={course.lessons.length + 1}
                onClose={() => setAddingLesson(false)}
              />
            ) : (
              <button
                type="button"
                onClick={() => setAddingLesson(true)}
                className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-[#f0f7f5]"
              >
                <Plus className="h-3.5 w-3.5" /> Add Lesson
              </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
}

// ── Course edit panel ─────────────────────────────────────────────
function CourseEditPanel({
  course,
  onClose,
}: {
  course: CourseWithLessons;
  onClose: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(fd: FormData) {
    startTransition(async () => {
      const res = await updateCourse(fd);
      if (res.error) toast.error(res.error);
      else { toast.success("Course updated"); onClose(); }
    });
  }

  return (
    <div className="border-t bg-muted/30 px-5 py-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Edit Course</p>
        <button type="button" onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <form ref={formRef} action={handleSubmit}>
        <input type="hidden" name="course_id" value={course.id} />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-muted-foreground">Title</label>
            <Input name="title" defaultValue={course.title} required disabled={isPending} className="rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Pillar</label>
            <select
              name="pillar"
              defaultValue={course.pillar}
              required
              disabled={isPending}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
            >
              {PILLARS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Category</label>
            <select
              name="category"
              defaultValue={course.category}
              disabled={isPending}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-muted-foreground">Description</label>
            <textarea
              name="description"
              defaultValue={course.description}
              rows={2}
              disabled={isPending}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
            />
          </div>
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose} className="rounded-xl">Cancel</Button>
          <Button type="submit" size="sm" loading={isPending} disabled={isPending} className="gap-1.5 rounded-xl">
            {!isPending && <Save className="h-3.5 w-3.5" />}
            {isPending ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}

// ── Delete course button ──────────────────────────────────────────
function DeleteCourseButton({ courseId, courseTitle }: { courseId: string; courseTitle: string }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Delete "${courseTitle}" and all its lessons? This cannot be undone.`)) return;
    const fd = new FormData();
    fd.set("course_id", courseId);
    startTransition(async () => {
      const res = await deleteCourse(fd);
      if (res.error) toast.error(res.error);
      else toast.success("Course deleted");
    });
  }

  return (
    <button
      type="button"
      title="Delete course"
      onClick={handleDelete}
      disabled={isPending}
      className="flex h-8 w-8 items-center justify-center rounded-xl bg-destructive/10 text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
    >
      {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
    </button>
  );
}

// ── Lesson row ────────────────────────────────────────────────────
function LessonRow({ lesson, courseId }: { lesson: Lesson; courseId: string }) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleDelete() {
    if (!confirm(`Delete lesson "${lesson.title}"?`)) return;
    const fd = new FormData();
    fd.set("lesson_id", lesson.id);
    startTransition(async () => {
      const res = await deleteLesson(fd);
      if (res.error) toast.error(res.error);
      else toast.success("Lesson deleted");
    });
  }

  function handleSave(fd: FormData) {
    startTransition(async () => {
      const res = await updateLesson(fd);
      if (res.error) toast.error(res.error);
      else { toast.success("Lesson updated"); setEditing(false); }
    });
  }

  return (
    <div className="group">
      <div className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/30">
        <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/30" />
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-secondary text-[10px] font-bold text-primary">
          {lesson.order_index}
        </div>
        <p className="flex-1 truncate text-sm font-medium text-foreground">{lesson.title}</p>
        {lesson.content && (
          <p className="hidden max-w-50 truncate text-xs text-muted-foreground xl:block">
            {lesson.content.slice(0, 60)}…
          </p>
        )}
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={() => setEditing(!editing)}
            className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
              editing
                ? "bg-primary text-[#f0f7f5]"
                : "bg-secondary text-primary hover:bg-primary hover:text-[#f0f7f5]"
            }`}
          >
            <Pencil className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-destructive/10 text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
          >
            {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {editing && (
        <div className="border-t bg-card/80 px-5 py-4">
          <form ref={formRef} action={handleSave} className="space-y-3">
            <input type="hidden" name="lesson_id" value={lesson.id} />
            <input type="hidden" name="course_id" value={courseId} />
            <div className="grid gap-3 sm:grid-cols-[1fr_80px]">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Lesson Title</label>
                <Input name="title" defaultValue={lesson.title} required disabled={isPending} className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Order #</label>
                <Input
                  name="order_index"
                  type="number"
                  defaultValue={lesson.order_index}
                  disabled={isPending}
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Content (Markdown / YouTube URL)</label>
              <textarea
                name="content"
                defaultValue={lesson.content}
                rows={5}
                disabled={isPending}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setEditing(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button type="submit" size="sm" loading={isPending} disabled={isPending} className="gap-1.5 rounded-xl">
                {!isPending && <Save className="h-3.5 w-3.5" />}
                {isPending ? "Saving…" : "Save Lesson"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// ── Lesson create form ────────────────────────────────────────────
function LessonCreateForm({
  courseId,
  nextIndex,
  onClose,
}: {
  courseId: string;
  nextIndex: number;
  onClose: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(fd: FormData) {
    startTransition(async () => {
      const res = await createLesson(fd);
      if (res.error) toast.error(res.error);
      else { toast.success("Lesson added"); formRef.current?.reset(); onClose(); }
    });
  }

  return (
    <div className="rounded-xl border border-dashed border-primary/30 bg-card p-4">
      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">New Lesson</p>
      <form ref={formRef} action={handleSubmit} className="space-y-3">
        <input type="hidden" name="course_id" value={courseId} />
        <div className="grid gap-3 sm:grid-cols-[1fr_80px]">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Lesson Title *</label>
            <Input name="title" placeholder="e.g. Introduction to Formatting" required disabled={isPending} className="rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Order #</label>
            <Input name="order_index" type="number" defaultValue={nextIndex} disabled={isPending} className="rounded-xl" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Content (Markdown / YouTube URL)</label>
          <textarea
            name="content"
            placeholder="Paste a YouTube URL or write lesson content in Markdown…"
            rows={4}
            disabled={isPending}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 font-mono text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose} className="rounded-xl">Cancel</Button>
          <Button type="submit" size="sm" loading={isPending} disabled={isPending} className="gap-1.5 rounded-xl">
            {!isPending && <Plus className="h-3.5 w-3.5" />}
            {isPending ? "Adding…" : "Add Lesson"}
          </Button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useState, useTransition, useRef } from "react";
import {
  ChevronDown,
  ChevronUp,
  Edit3,
  GripVertical,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";

import {
  updateCourseAction,
  updateLessonAction,
  addLessonAction,
  deleteLessonAction,
} from "@/app/dashboard/instructor/courses/actions";

// ── Types ──────────────────────────────────────────────────
interface Course {
  id: string;
  title: string;
  pillar: string;
  description: string;
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  order_index: number;
}

interface Props {
  course: Course;
  lessons: Lesson[];
  defaultTab?: "curriculum" | "add" | "course";
}

type Tab = "curriculum" | "add" | "course";

// ── Component ──────────────────────────────────────────────
export function CourseEditor({ course, lessons: initial, defaultTab = "curriculum" }: Props) {
  const [tab, setTab]           = useState<Tab>(defaultTab);
  const [lessons, setLessons]   = useState<Lesson[]>(initial);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [editing, setEditing]   = useState<string | null>(null);
  const [isPending, start]      = useTransition();
  const [message, setMessage]   = useState<{ text: string; ok: boolean } | null>(null);

  // Edit lesson state
  const [editTitle,   setEditTitle]   = useState("");
  const [editContent, setEditContent] = useState("");

  // Add lesson state
  const [newTitle,   setNewTitle]   = useState("");
  const [newContent, setNewContent] = useState("");

  // Course edit state
  const [courseTitle, setCourseTitle]   = useState(course.title);
  const [courseDesc,  setCourseDesc]    = useState(course.description);

  const formRef = useRef<HTMLDivElement>(null);

  function flash(text: string, ok: boolean) {
    setMessage({ text, ok });
    setTimeout(() => setMessage(null), 3000);
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function startEdit(lesson: Lesson) {
    setEditing(lesson.id);
    setEditTitle(lesson.title);
    setEditContent(lesson.content);
    if (!expanded.has(lesson.id)) toggleExpand(lesson.id);
  }

  function cancelEdit() {
    setEditing(null);
  }

  // ── Save lesson edit ───────────────────────────────────
  function saveLesson(lesson: Lesson) {
    const fd = new FormData();
    fd.set("id",        lesson.id);
    fd.set("course_id", course.id);
    fd.set("title",     editTitle);
    fd.set("content",   editContent);

    start(async () => {
      const res = await updateLessonAction(fd);
      if (res.error) { flash(res.error, false); return; }
      setLessons((prev) =>
        prev.map((l) =>
          l.id === lesson.id ? { ...l, title: editTitle, content: editContent } : l
        )
      );
      setEditing(null);
      flash("Lesson saved.", true);
    });
  }

  // ── Delete lesson ─────────────────────────────────────
  function deleteLesson(lessonId: string) {
    if (!confirm("Delete this lesson? This cannot be undone.")) return;
    const fd = new FormData();
    fd.set("id",        lessonId);
    fd.set("course_id", course.id);

    start(async () => {
      const res = await deleteLessonAction(fd);
      if (res.error) { flash(res.error, false); return; }
      setLessons((prev) => prev.filter((l) => l.id !== lessonId));
      flash("Lesson deleted.", true);
    });
  }

  // ── Add lesson ────────────────────────────────────────
  function addLesson() {
    if (!newTitle.trim()) { flash("Lesson title is required.", false); return; }
    const fd = new FormData();
    fd.set("course_id", course.id);
    fd.set("title",     newTitle.trim());
    fd.set("content",   newContent.trim());

    start(async () => {
      const res = await addLessonAction(fd);
      if (res.error) { flash(res.error, false); return; }
      // Optimistically append — server will have the real ID after revalidation
      setLessons((prev) => [
        ...prev,
        {
          id:          `temp-${Date.now()}`,
          title:       newTitle.trim(),
          content:     newContent.trim(),
          order_index: (prev[prev.length - 1]?.order_index ?? 0) + 1,
        },
      ]);
      setNewTitle("");
      setNewContent("");
      setTab("curriculum");
      flash("Lesson added.", true);
    });
  }

  // ── Save course details ───────────────────────────────
  function saveCourse() {
    const fd = new FormData();
    fd.set("id",          course.id);
    fd.set("title",       courseTitle);
    fd.set("description", courseDesc);

    start(async () => {
      const res = await updateCourseAction(fd);
      if (res.error) { flash(res.error, false); return; }
      flash("Course details saved.", true);
    });
  }

  // ── Tab bar ───────────────────────────────────────────
  const TABS: { id: Tab; label: string }[] = [
    { id: "curriculum", label: "Curriculum" },
    { id: "add",        label: "Add Lesson" },
    { id: "course",     label: "Course Details" },
  ];

  return (
    <div className="rounded-[1.75rem] bg-card shadow-ambient">
      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-border/50 px-5 pt-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-t-lg px-4 py-2 text-xs font-semibold transition-colors ${
              tab === t.id
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}

        {/* Toast message */}
        {message && (
          <span
            className={`ml-auto rounded-xl px-3 py-1 text-[11px] font-semibold ${
              message.ok
                ? "bg-primary/10 text-primary"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            {message.text}
          </span>
        )}
      </div>

      <div className="p-6">

        {/* ── CURRICULUM TAB ────────────────────────── */}
        {tab === "curriculum" && (
          <div className="space-y-3">
            {lessons.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <p className="text-sm text-muted-foreground">No lessons yet.</p>
                <button
                  onClick={() => setTab("add")}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-gradient-primary px-4 py-2 text-xs font-semibold text-[#f0f7f5] hover:opacity-90"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add First Lesson
                </button>
              </div>
            ) : (
              lessons.map((lesson, idx) => {
                const isOpen   = expanded.has(lesson.id);
                const isEditing = editing === lesson.id;

                return (
                  <div
                    key={lesson.id}
                    className="overflow-hidden rounded-2xl border border-border/50 bg-muted/30 transition-colors hover:bg-muted/50"
                  >
                    {/* Lesson header row */}
                    <div className="flex items-center gap-3 px-4 py-3">
                      {/* Drag handle (visual only) */}
                      <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/40" />

                      {/* Index badge */}
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-secondary text-[10px] font-bold text-primary">
                        {idx + 1}
                      </span>

                      {/* Title */}
                      <div className="min-w-0 flex-1">
                        {isEditing ? (
                          <input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full rounded-lg border bg-card px-3 py-1.5 text-sm font-semibold focus:border-primary focus:outline-none"
                            placeholder="Lesson title"
                          />
                        ) : (
                          <p className="truncate text-sm font-semibold">{lesson.title}</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => saveLesson(lesson)}
                              disabled={isPending}
                              className="flex items-center gap-1 rounded-lg bg-gradient-primary px-2.5 py-1.5 text-[11px] font-semibold text-[#f0f7f5] hover:opacity-90 disabled:opacity-50"
                            >
                              {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-muted-foreground hover:bg-secondary hover:text-primary"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(lesson)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-muted-foreground hover:bg-secondary hover:text-primary"
                              title="Edit lesson"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => deleteLesson(lesson.id)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              title="Delete lesson"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => toggleExpand(lesson.id)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-muted-foreground hover:bg-secondary hover:text-primary"
                            >
                              {isOpen
                                ? <ChevronUp className="h-3.5 w-3.5" />
                                : <ChevronDown className="h-3.5 w-3.5" />}
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Content area (expanded) */}
                    {isOpen && (
                      <div className="border-t border-border/40 px-4 pb-4 pt-3">
                        {isEditing ? (
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={12}
                            className="w-full rounded-xl border bg-card px-4 py-3 font-mono text-xs leading-relaxed text-foreground focus:border-primary focus:outline-none resize-y"
                            placeholder="Lesson content (Markdown supported)..."
                          />
                        ) : (
                          <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-muted-foreground max-h-64 overflow-y-auto">
                            {lesson.content || "No content yet."}
                          </pre>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {lessons.length > 0 && (
              <button
                onClick={() => setTab("add")}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border/50 py-3 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                <Plus className="h-3.5 w-3.5" />
                Add another lesson
              </button>
            )}
          </div>
        )}

        {/* ── ADD LESSON TAB ────────────────────────── */}
        {tab === "add" && (
          <div className="space-y-4" ref={formRef}>
            <div>
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                New Lesson — {course.title}
              </p>

              <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                Lesson Title *
              </label>
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Introduction to Formatting"
                className="w-full rounded-xl border bg-muted/30 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:bg-card"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                Content
                <span className="ml-1.5 font-normal text-muted-foreground/60">(Markdown + @youtube:VIDEO_ID supported)</span>
              </label>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={14}
                placeholder={`# Lesson Title\n\nAdd your lesson content here.\n\n@youtube:VIDEO_ID\n\n## Key Concepts\n- Point one\n- Point two\n\n## Task\n> Describe the assignment here.`}
                className="w-full rounded-xl border bg-muted/30 px-4 py-3 font-mono text-xs leading-relaxed focus:border-primary focus:outline-none focus:bg-card resize-y"
              />
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={addLesson}
                disabled={isPending || !newTitle.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-[#f0f7f5] hover:opacity-90 disabled:opacity-50"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add Lesson
              </button>
              <button
                onClick={() => setTab("curriculum")}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── COURSE DETAILS TAB ───────────────────── */}
        {tab === "course" && (
          <div className="space-y-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Edit Course Details
            </p>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                Course Title *
              </label>
              <input
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                className="w-full rounded-xl border bg-muted/30 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:bg-card"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                Description
              </label>
              <textarea
                value={courseDesc}
                onChange={(e) => setCourseDesc(e.target.value)}
                rows={4}
                className="w-full rounded-xl border bg-muted/30 px-4 py-3 text-sm leading-relaxed focus:border-primary focus:outline-none focus:bg-card resize-y"
                placeholder="Brief description of what students will learn..."
              />
            </div>

            <div className="rounded-xl bg-muted/40 px-4 py-3">
              <p className="text-xs font-semibold text-muted-foreground">Pillar</p>
              <p className="mt-0.5 text-sm font-medium">{course.pillar}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Pillar assignment is managed by the platform admin.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={saveCourse}
                disabled={isPending || !courseTitle.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-[#f0f7f5] hover:opacity-90 disabled:opacity-50"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Plus } from "lucide-react";
import { toast } from "sonner";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button, LoadingLink } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createCourse } from "@/lib/actions/admin";
import type { CoursePillar, CourseCategory } from "@/lib/types/database";

const PILLARS: CoursePillar[] = [
  "Digital Literacy",
  "Career Readiness",
  "Life Skills",
  "Cultural Identity",
];
const CATEGORIES: CourseCategory[] = ["Word", "Excel", "Slides", "Other"];

const PILLAR_STYLES: Record<string, { dot: string; border: string; selected: string }> = {
  "Digital Literacy":  { dot: "bg-sky-500",     border: "border-sky-400/30",   selected: "ring-sky-400 border-sky-400/80 bg-sky-500/10" },
  "Career Readiness":  { dot: "bg-amber-500",   border: "border-amber-400/30", selected: "ring-amber-400 border-amber-400/80 bg-amber-500/10" },
  "Life Skills":       { dot: "bg-emerald-500", border: "border-emerald-400/30", selected: "ring-emerald-400 border-emerald-400/80 bg-emerald-500/10" },
  "Cultural Identity": { dot: "bg-violet-500",  border: "border-violet-400/30", selected: "ring-violet-400 border-violet-400/80 bg-violet-500/10" },
};

export default function NewCoursePage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle]       = useState("");
  const [pillar, setPillar]     = useState<CoursePillar>("Digital Literacy");
  const [category, setCategory] = useState<CourseCategory>("Other");
  const [description, setDescription] = useState("");
  const [addLessons, setAddLessons]   = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const fd = new FormData();
    fd.set("title", title.trim());
    fd.set("pillar", pillar);
    fd.set("category", category);
    fd.set("description", description);

    startTransition(async () => {
      const res = await createCourse(fd);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Course created!");
      if (addLessons && res.id) {
        router.push(`/dashboard/admin/courses/${res.id}`);
      } else {
        router.push("/dashboard/admin/courses");
      }
    });
  }

  return (
    <>
      <DashboardHeader heading="New Course" />
      <div className="flex-1 p-6">
        {/* Breadcrumb */}
        <LoadingLink
          href="/dashboard/admin/courses"
          variant="ghost"
          className="mb-6 inline-flex h-auto items-center gap-1.5 px-0 py-0 text-xs font-semibold text-muted-foreground hover:bg-transparent hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Course Management
        </LoadingLink>

        <div className="mx-auto max-w-2xl">
          {/* Hero */}
          <div
            className="mb-8 overflow-hidden rounded-[1.75rem] p-6 shadow-ambient"
            style={{ background: "linear-gradient(135deg, #001a16 0%, #00342b 50%, #005a4d 100%)" }}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#94d3c1]/20">
                <BookOpen className="h-6 w-6 text-[#94d3c1]" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold text-[#f0f7f5]">Create New Course</h1>
                <p className="mt-0.5 text-sm text-[#c8ebe2]/70">
                  Give the course a name, assign it to a pillar, and start adding lessons.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Course title */}
            <div className="rounded-2xl bg-card p-6 shadow-ambient space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Course Title *
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Introduction to Microsoft Word"
                required
                disabled={isPending}
                className="rounded-xl text-base font-semibold h-12"
                autoFocus
              />
            </div>

            {/* Pillar selector */}
            <div className="rounded-2xl bg-card p-6 shadow-ambient space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Curriculum Pillar *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {PILLARS.map((p) => {
                  const s = PILLAR_STYLES[p];
                  const isSelected = pillar === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPillar(p)}
                      disabled={isPending}
                      className={`flex items-center gap-3 rounded-xl border p-4 text-left text-sm font-semibold transition-all ${
                        isSelected
                          ? `ring-2 ${s.selected}`
                          : `${s.border} bg-muted/30 text-foreground hover:bg-muted/60`
                      }`}
                    >
                      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${s.dot}`} />
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category */}
            <div className="rounded-2xl bg-card p-6 shadow-ambient space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    disabled={isPending}
                    className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
                      category === cat
                        ? "bg-foreground text-background"
                        : "bg-muted/60 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="rounded-2xl bg-card p-6 shadow-ambient space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What will students learn in this course? Describe the objectives, skills covered, and expected outcomes."
                rows={5}
                disabled={isPending}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm leading-relaxed placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50 resize-none"
              />
            </div>

            {/* After-create action */}
            <div className="rounded-2xl bg-card p-5 shadow-ambient">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={addLessons}
                  onChange={(e) => setAddLessons(e.target.checked)}
                  className="mt-0.5 rounded border-input text-primary accent-primary"
                />
                <div>
                  <p className="text-sm font-semibold text-foreground">Open Course Builder after creating</p>
                  <p className="text-xs text-muted-foreground">You&apos;ll be taken directly to the lesson editor.</p>
                </div>
              </label>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3">
              <LoadingLink
                href="/dashboard/admin/courses"
                variant="ghost"
                className="inline-flex h-auto items-center rounded-xl px-5 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-transparent hover:text-foreground"
              >
                Cancel
              </LoadingLink>
              <Button
                type="submit"
                loading={isPending}
                disabled={isPending || !title.trim()}
                className="gap-2 rounded-xl px-8 py-2.5"
              >
                {!isPending && <Plus className="h-4 w-4" />}
                {isPending ? "Creating…" : "Create Course"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

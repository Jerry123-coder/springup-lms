"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import Link from "next/link";

import { createCourseAction } from "@/app/dashboard/instructor/courses/actions";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

const PILLARS = ["Digital Literacy", "Career Readiness", "Life Skills", "Cultural Identity"];

export default function NewCoursePage() {
  const router = useRouter();
  const [isPending, start] = useTransition();
  const [title,   setTitle]   = useState("");
  const [pillar,  setPillar]  = useState(PILLARS[0]);
  const [desc,    setDesc]    = useState("");
  const [error,   setError]   = useState<string | null>(null);

  function handleSubmit() {
    if (!title.trim()) { setError("Course title is required."); return; }
    const fd = new FormData();
    fd.set("title",       title.trim());
    fd.set("pillar",      pillar);
    fd.set("description", desc.trim());

    start(async () => {
      const res = await createCourseAction(fd);
      if (res.error) { setError(res.error); return; }
      if (res.id)    router.push(`/dashboard/instructor/courses/${res.id}?tab=add`);
      else           router.push("/dashboard/instructor/courses");
    });
  }

  return (
    <>
      <DashboardHeader heading="Create New Course" />
      <div className="mx-auto w-full max-w-2xl flex-1 space-y-6 p-6">

        <Link
          href="/dashboard/instructor/courses"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Courses
        </Link>

        <div className="rounded-[1.75rem] bg-card p-7 shadow-ambient">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">New Course</p>
          <h2 className="mt-1 font-display text-xl font-semibold">Course Details</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a title and pillar to get started. You can add lessons after creation.
          </p>

          <div className="mt-6 space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                Course Title *
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Advanced Excel for Reporting"
                className="w-full rounded-xl border bg-muted/30 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:bg-card"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                Curriculum Pillar *
              </label>
              <select
                value={pillar}
                onChange={(e) => setPillar(e.target.value)}
                className="w-full rounded-xl border bg-muted/30 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:bg-card"
              >
                {PILLARS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                Description
              </label>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={4}
                placeholder="What will students learn in this course?"
                className="w-full rounded-xl border bg-muted/30 px-4 py-3 text-sm leading-relaxed focus:border-primary focus:outline-none focus:bg-card resize-y"
              />
            </div>

            {error && (
              <p className="rounded-xl bg-destructive/10 px-4 py-2.5 text-xs font-semibold text-destructive">
                {error}
              </p>
            )}

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={handleSubmit}
                disabled={isPending || !title.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-[#f0f7f5] hover:opacity-90 disabled:opacity-50"
              >
                {isPending
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Plus className="h-4 w-4" />}
                Create Course
              </button>
              <Link
                href="/dashboard/instructor/courses"
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

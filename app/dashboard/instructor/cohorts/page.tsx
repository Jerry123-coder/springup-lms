"use client";

import { useEffect, useState, useTransition } from "react";
import { ArrowRight, Plus, Users2, X } from "lucide-react";
import Link from "next/link";

import { createClient } from "@/lib/supabase/client";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Cohort {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  student_count?: number;
}

interface StudentOption {
  id: string;
  full_name: string;
  email: string;
}

export default function CohortsPage() {
  const supabase = createClient();
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const [primaryRes, coRes, studentsRes] = await Promise.all([
        supabase
          .from("cohorts")
          .select("id, name, description, created_at")
          .eq("instructor_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("cohort_instructors")
          .select("cohort_id")
          .eq("instructor_id", user.id),
        supabase
          .from("profiles")
          .select("id, full_name, email")
          .eq("role", "student")
          .order("full_name", { ascending: true }),
      ]);

      const primary = (primaryRes.data ?? []) as Cohort[];
      const primaryIds = new Set(primary.map((c) => c.id));
      const coRows = coRes.error
        ? []
        : ((coRes.data ?? []) as { cohort_id: string }[]);
      const coCohortIds = [...new Set(coRows.map((r) => r.cohort_id))];
      const onlyCo = coCohortIds.filter((id) => !primaryIds.has(id));
      let extra: Cohort[] = [];
      if (onlyCo.length > 0) {
        const { data: ex } = await supabase
          .from("cohorts")
          .select("id, name, description, created_at")
          .in("id", onlyCo)
          .order("created_at", { ascending: false });
        extra = (ex ?? []) as Cohort[];
      }
      const rawCohorts = [...primary, ...extra].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      // Count students per cohort
      const enriched = await Promise.all(
        rawCohorts.map(async (c) => {
          const { count } = await supabase
            .from("cohort_students")
            .select("student_id", { count: "exact", head: true })
            .eq("cohort_id", c.id);
          return { ...c, student_count: count ?? 0 };
        })
      );

      setCohorts(enriched);
      setStudents(
        (studentsRes.data ?? []) as StudentOption[]
      );
      setLoading(false);
    })();
  }, [supabase]);

  function toggleStudent(id: string) {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  async function handleCreate() {
    if (!name.trim() || !userId) return;
    setError(null);
    startTransition(async () => {
      const { data: newCohort, error: cohortErr } = await (supabase.from("cohorts" as never) as unknown as {
        insert: (v: Record<string, unknown>) => { select: () => { single: () => Promise<{ data: unknown; error: { message: string } | null }> } };
      }).insert({ name: name.trim(), description: desc.trim() || null, instructor_id: userId }).select().single();

      if (cohortErr || !newCohort) {
        setError(cohortErr?.message ?? "Failed to create class");
        return;
      }

      const cohort = newCohort as Cohort;

      await (supabase.from("cohort_instructors" as never) as unknown as {
        insert: (v: Record<string, unknown>) => Promise<{ error: { message: string } | null }>;
      }).insert({ cohort_id: cohort.id, instructor_id: userId });

      if (selectedStudentIds.length > 0) {
        const rows = selectedStudentIds.map((sid) => ({ cohort_id: cohort.id, student_id: sid }));
        await (supabase.from("cohort_students" as never) as unknown as {
          insert: (v: unknown[]) => Promise<unknown>;
        }).insert(rows);
      }

      setCohorts((prev) => [
        { ...cohort, student_count: selectedStudentIds.length },
        ...prev,
      ]);
      setName("");
      setDesc("");
      setSelectedStudentIds([]);
      setShowForm(false);
    });
  }

  async function handleDelete(cohortId: string) {
    await supabase.from("cohorts").delete().eq("id", cohortId);
    setCohorts((prev) => prev.filter((c) => c.id !== cohortId));
  }

  return (
    <>
      <DashboardHeader heading="My Classes" />
      <div className="mx-auto w-full max-w-7xl flex-1 space-y-6 p-6">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Cohort Management
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
              My Classes
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Organise your students into classes or cohorts for easier management.
            </p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="rounded-xl bg-gradient-primary text-[#f0f7f5] hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Create New Class
          </Button>
        </div>

        {/* Create form */}
        {showForm && (
          <div className="rounded-[1.75rem] bg-muted/50 p-6 shadow-ambient sm:p-8">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-display text-base font-semibold">New Class</h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setError(null);
                }}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-muted-foreground hover:bg-secondary hover:text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                    Class Name *
                  </label>
                  <Input
                    placeholder="e.g. Digital Literacy — Term 1"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                    Description (optional)
                  </label>
                  <Input
                    placeholder="Brief notes about this class..."
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                {error && (
                  <p className="text-xs text-destructive">{error}</p>
                )}
              </div>

              {/* Student selector */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                  Add Students ({selectedStudentIds.length} selected)
                </label>
                <div className="h-40 overflow-y-auto rounded-xl border bg-card p-2">
                  {students.length === 0 ? (
                    <p className="p-3 text-xs text-muted-foreground">
                      No students available.
                    </p>
                  ) : (
                    students.map((s) => {
                      const selected = selectedStudentIds.includes(s.id);
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => toggleStudent(s.id)}
                          className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors ${
                            selected
                              ? "bg-secondary text-primary"
                              : "hover:bg-muted"
                          }`}
                        >
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[9px] font-bold ${
                              selected
                                ? "border-primary bg-primary text-[#f0f7f5]"
                                : "border-border text-muted-foreground"
                            }`}
                          >
                            {selected ? "✓" : ""}
                          </span>
                          <span className="truncate font-medium">
                            {s.full_name || s.email}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <Button
                onClick={() => void handleCreate()}
                disabled={!name.trim() || isPending}
                className="rounded-xl bg-gradient-primary text-[#f0f7f5] hover:opacity-90"
              >
                {isPending ? "Creating…" : "Create Class"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowForm(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Cohort list */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-2xl bg-muted/50"
              />
            ))}
          </div>
        ) : cohorts.length === 0 ? (
          <div className="flex flex-col items-center rounded-[1.75rem] bg-muted/40 px-8 py-20 text-center shadow-ambient">
            <Users2 className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <h3 className="font-display text-lg font-semibold">No classes yet</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Create your first class to organise students into cohorts and
              track their group progress.
            </p>
            <Button
              onClick={() => setShowForm(true)}
              className="mt-6 rounded-xl bg-gradient-primary text-[#f0f7f5] hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Create Your First Class
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cohorts.map((cohort) => (
              <div
                key={cohort.id}
                className="group relative rounded-2xl bg-card p-5 shadow-ambient transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* Delete button */}
                <button
                  onClick={() => void handleDelete(cohort.id)}
                  className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                  title="Delete class"
                >
                  <X className="h-3 w-3" />
                </button>

                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary">
                  <Users2 className="h-5 w-5" />
                </div>

                <h3 className="font-display text-base font-semibold leading-snug">
                  {cohort.name}
                </h3>
                {cohort.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {cohort.description}
                  </p>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-sm">
                    <span className="font-bold text-foreground">
                      {cohort.student_count}
                    </span>
                    <span className="text-muted-foreground">
                      student{cohort.student_count !== 1 ? "s" : ""}
                    </span>
                  </span>
                  <Link
                    href={`/dashboard/instructor/students`}
                    className="inline-flex items-center gap-1 rounded-lg bg-secondary px-2.5 py-1.5 text-[11px] font-semibold text-primary transition-colors hover:bg-primary hover:text-[#f0f7f5]"
                  >
                    View Students
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                <p className="mt-2 text-[10px] text-muted-foreground">
                  Created{" "}
                  {new Date(cohort.created_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

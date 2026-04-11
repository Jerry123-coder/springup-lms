"use client";

import { useState, useTransition } from "react";
import { ChevronDown, ChevronRight, Plus, Trash2, UserMinus, UserPlus, X } from "lucide-react";
import { toast } from "sonner";

import {
  adminCreateCohort,
  adminDeleteCohort,
  adminUpdateCohortInstructor,
  adminAddStudentToCohort,
  adminRemoveStudentFromCohort,
} from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CohortRow = {
  id: string;
  name: string;
  description: string | null;
  instructor_id: string;
  instructorName: string;
  created_at: string;
  students: { id: string; full_name: string; email: string }[];
  avgPct: number;
};

type Instructor = { id: string; full_name: string; email: string };
type Student    = { id: string; full_name: string; email: string };

export function AdminCohortManager({
  cohorts,
  instructors,
  allStudents,
}: {
  cohorts: CohortRow[];
  instructors: Instructor[];
  allStudents: Student[];
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-4">
      {/* Create cohort button */}
      <div className="flex justify-end">
        <Button
          onClick={() => setShowCreate(true)}
          className="gap-2 rounded-xl"
        >
          <Plus className="h-4 w-4" /> New Cohort
        </Button>
      </div>

      {/* Create form */}
      {showCreate && (
        <CreateCohortForm
          instructors={instructors}
          onClose={() => setShowCreate(false)}
        />
      )}

      {/* Cohort list */}
      {cohorts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-card px-6 py-14 text-center shadow-ambient">
          <p className="font-display text-sm font-semibold">No cohorts yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Create your first cohort to organise students into classes.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {cohorts.map((cohort) => (
            <CohortCard
              key={cohort.id}
              cohort={cohort}
              instructors={instructors}
              allStudents={allStudents}
              expanded={expanded === cohort.id}
              onToggle={() => setExpanded(expanded === cohort.id ? null : cohort.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Create cohort form ───────────────────────────────────────────
function CreateCohortForm({
  instructors,
  onClose,
}: {
  instructors: Instructor[];
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [instructorId, setInstructorId] = useState(instructors[0]?.id ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !instructorId) return;

    const fd = new FormData();
    fd.set("name", name.trim());
    fd.set("description", description.trim());
    fd.set("instructor_id", instructorId);

    startTransition(async () => {
      const res = await adminCreateCohort(fd);
      if (res.error) toast.error(res.error);
      else { toast.success("Cohort created"); onClose(); }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border-2 border-dashed border-primary/30 bg-card p-5 shadow-ambient space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold">New Cohort</h3>
        <button type="button" onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Cohort Name *</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Alpha Class 2026" className="rounded-xl" required />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Instructor *</label>
          <select
            value={instructorId}
            onChange={(e) => setInstructorId(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            required
          >
            <option value="">Select instructor</option>
            {instructors.map((i) => (
              <option key={i.id} value={i.id}>{i.full_name || i.email}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs font-semibold text-muted-foreground">Description</label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" className="rounded-xl" />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
        <Button
          type="submit"
          size="sm"
          loading={isPending}
          disabled={isPending || !name.trim() || !instructorId}
        >
          {isPending ? "Creating…" : "Create Cohort"}
        </Button>
      </div>
    </form>
  );
}

// ── Single cohort card ────────────────────────────────────────────
function CohortCard({
  cohort,
  instructors,
  allStudents,
  expanded,
  onToggle,
}: {
  cohort: CohortRow;
  instructors: Instructor[];
  allStudents: Student[];
  expanded: boolean;
  onToggle: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [addingStudentId, setAddingStudentId] = useState("");

  const memberIds = new Set(cohort.students.map((s) => s.id));
  const eligibleToAdd = allStudents.filter((s) => !memberIds.has(s.id));

  function handleDelete() {
    if (!confirm(`Delete cohort "${cohort.name}"? This cannot be undone.`)) return;
    const fd = new FormData();
    fd.set("cohort_id", cohort.id);
    startTransition(async () => {
      const res = await adminDeleteCohort(fd);
      if (res.error) toast.error(res.error);
      else toast.success("Cohort deleted");
    });
  }

  function handleReassignInstructor(e: React.ChangeEvent<HTMLSelectElement>) {
    const fd = new FormData();
    fd.set("cohort_id", cohort.id);
    fd.set("instructor_id", e.target.value);
    startTransition(async () => {
      const res = await adminUpdateCohortInstructor(fd);
      if (res.error) toast.error(res.error);
      else toast.success("Instructor updated");
    });
  }

  function handleAddStudent() {
    if (!addingStudentId) return;
    const fd = new FormData();
    fd.set("cohort_id", cohort.id);
    fd.set("student_id", addingStudentId);
    startTransition(async () => {
      const res = await adminAddStudentToCohort(fd);
      if (res.error) toast.error(res.error);
      else { toast.success("Student added"); setAddingStudentId(""); }
    });
  }

  function handleRemoveStudent(studentId: string, studentName: string) {
    const fd = new FormData();
    fd.set("cohort_id", cohort.id);
    fd.set("student_id", studentId);
    startTransition(async () => {
      const res = await adminRemoveStudentFromCohort(fd);
      if (res.error) toast.error(res.error);
      else toast.success(`${studentName} removed`);
    });
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-card shadow-ambient ring-1 ring-border/40">
      {/* Header row */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/30"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary font-bold text-sm">
          {cohort.students.length}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-semibold text-foreground">{cohort.name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {cohort.instructorName} · {cohort.students.length} student{cohort.students.length !== 1 ? "s" : ""}
            {cohort.avgPct > 0 && ` · ${cohort.avgPct}% avg completion`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {cohort.avgPct > 0 && (
            <div className="hidden w-24 sm:block">
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${cohort.avgPct}%` }} />
              </div>
            </div>
          )}
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded panel */}
      {expanded && (
        <div className="border-t px-5 pb-5 pt-4 space-y-4">
          {/* Instructor reassignment */}
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Instructor:</label>
            <select
              value={cohort.instructor_id}
              onChange={handleReassignInstructor}
              disabled={isPending}
              className="rounded-xl border border-input bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
            >
              {instructors.map((i) => (
                <option key={i.id} value={i.id}>{i.full_name || i.email}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="ml-auto flex items-center gap-1 rounded-xl bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete Cohort
            </button>
          </div>

          {/* Student list */}
          <div>
            <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Members</p>
            {cohort.students.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No students yet</p>
            ) : (
              <div className="space-y-1.5">
                {cohort.students.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 rounded-xl bg-muted/40 px-3 py-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-primary">
                      {s.full_name.split(" ").slice(0,2).map(p=>p[0]).join("").toUpperCase() || "?"}
                    </div>
                    <p className="flex-1 text-xs font-medium text-foreground truncate">{s.full_name || s.email}</p>
                    <button
                      type="button"
                      onClick={() => handleRemoveStudent(s.id, s.full_name || s.email)}
                      disabled={isPending}
                      className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                      title="Remove from cohort"
                    >
                      <UserMinus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add student */}
          {eligibleToAdd.length > 0 && (
            <div className="flex gap-2">
              <select
                value={addingStudentId}
                onChange={(e) => setAddingStudentId(e.target.value)}
                className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">Add a student…</option>
                {eligibleToAdd.map((s) => (
                  <option key={s.id} value={s.id}>{s.full_name || s.email}</option>
                ))}
              </select>
              <Button
                type="button"
                size="sm"
                onClick={handleAddStudent}
                disabled={isPending || !addingStudentId}
                className="rounded-xl gap-1.5"
              >
                <UserPlus className="h-3.5 w-3.5" /> Add
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

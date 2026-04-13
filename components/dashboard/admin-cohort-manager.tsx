"use client";

import { useState, useTransition } from "react";
import { ChevronDown, ChevronRight, Plus, Trash2, UserMinus, UserPlus, X } from "lucide-react";
import { toast } from "sonner";

import {
  adminCreateCohort,
  adminDeleteCohort,
  adminSetCohortInstructors,
  adminAddStudentsToCohortBulk,
  adminRemoveStudentFromCohort,
} from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CohortRow = {
  id: string;
  name: string;
  description: string | null;
  instructor_id: string;
  /** Primary first, then co-instructors */
  instructor_ids: string[];
  instructorNamesDisplay: string;
  created_at: string;
  students: { id: string; full_name: string; email: string }[];
  avgPct: number;
};

type Instructor = { id: string; full_name: string; email: string };
type Student = { id: string; full_name: string; email: string };

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
      <div className="flex justify-end">
        <Button
          onClick={() => setShowCreate(true)}
          className="gap-2 rounded-xl"
        >
          <Plus className="h-4 w-4" /> New Cohort
        </Button>
      </div>

      {showCreate && (
        <CreateCohortForm
          instructors={instructors}
          onClose={() => setShowCreate(false)}
        />
      )}

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
  const [selectedInstructorIds, setSelectedInstructorIds] = useState<string[]>(() =>
    instructors[0]?.id ? [instructors[0].id] : []
  );

  function toggleInstructor(id: string) {
    setSelectedInstructorIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || selectedInstructorIds.length === 0) return;

    const fd = new FormData();
    fd.set("name", name.trim());
    fd.set("description", description.trim());
    fd.set("instructor_ids", JSON.stringify(selectedInstructorIds));

    startTransition(async () => {
      const res = await adminCreateCohort(fd);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Cohort created");
        onClose();
      }
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
          <label className="text-xs font-semibold text-muted-foreground">
            Instructors * ({selectedInstructorIds.length} selected — first is primary)
          </label>
          <div className="max-h-36 overflow-y-auto rounded-xl border border-input bg-background px-2 py-2">
            {instructors.length === 0 ? (
              <p className="px-1 py-2 text-xs text-muted-foreground">No instructors in the system.</p>
            ) : (
              instructors.map((i) => {
                const selected = selectedInstructorIds.includes(i.id);
                return (
                  <button
                    key={i.id}
                    type="button"
                    onClick={() => toggleInstructor(i.id)}
                    className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors ${
                      selected ? "bg-secondary text-primary" : "hover:bg-muted"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border text-[9px] font-bold ${
                        selected ? "border-primary bg-primary text-[#f0f7f5]" : "border-border text-muted-foreground"
                      }`}
                    >
                      {selected ? "✓" : ""}
                    </span>
                    <span className="truncate font-medium">{i.full_name || i.email}</span>
                  </button>
                );
              })
            )}
          </div>
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
          disabled={isPending || !name.trim() || selectedInstructorIds.length === 0}
        >
          {isPending ? "Creating…" : "Create Cohort"}
        </Button>
      </div>
    </form>
  );
}

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
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  const memberIds = new Set(cohort.students.map((s) => s.id));
  const eligibleToAdd = allStudents.filter((s) => !memberIds.has(s.id));

  function toggleStudent(id: string) {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

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

  function applyInstructorSelection(nextIds: string[]) {
    if (nextIds.length === 0) {
      toast.error("At least one instructor is required");
      return;
    }
    const fd = new FormData();
    fd.set("cohort_id", cohort.id);
    fd.set("instructor_ids", JSON.stringify(nextIds));
    startTransition(async () => {
      const res = await adminSetCohortInstructors(fd);
      if (res.error) toast.error(res.error);
      else toast.success("Instructors updated");
    });
  }

  function toggleCohortInstructor(id: string) {
    const ids = new Set(cohort.instructor_ids);
    if (ids.has(id)) {
      if (ids.size <= 1) return;
      ids.delete(id);
    } else {
      ids.add(id);
    }
    const kept = cohort.instructor_ids.filter((i) => ids.has(i));
    const brandNew = instructors
      .map((i) => i.id)
      .filter((i) => ids.has(i) && !cohort.instructor_ids.includes(i));
    const ordered = [...kept, ...brandNew];
    applyInstructorSelection(ordered);
  }

  function handleAddStudentsBulk() {
    if (selectedStudentIds.length === 0) return;
    const fd = new FormData();
    fd.set("cohort_id", cohort.id);
    fd.set("student_ids", JSON.stringify(selectedStudentIds));
    startTransition(async () => {
      const res = await adminAddStudentsToCohortBulk(fd);
      if (res.error) toast.error(res.error);
      else {
        const n = "added" in res && typeof res.added === "number" ? res.added : selectedStudentIds.length;
        toast.success(n === 0 ? "Students were already in this cohort" : `Added ${n} student${n === 1 ? "" : "s"}`);
        setSelectedStudentIds([]);
      }
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
            {cohort.instructorNamesDisplay} · {cohort.students.length} student{cohort.students.length !== 1 ? "s" : ""}
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

      {expanded && (
        <div className="border-t px-5 pb-5 pt-4 space-y-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Instructors</p>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="flex items-center gap-1 rounded-xl bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete Cohort
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              First selected below is the primary instructor (account owner for the class row). Check or uncheck to update.
            </p>
            <div className="max-h-40 overflow-y-auto rounded-xl border border-input bg-background px-2 py-2">
              {instructors.map((i) => {
                const checked = cohort.instructor_ids.includes(i.id);
                const isPrimary = i.id === cohort.instructor_id;
                return (
                  <label
                    key={i.id}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-muted/60"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={isPending || (checked && cohort.instructor_ids.length === 1)}
                      onChange={() => toggleCohortInstructor(i.id)}
                      className="rounded border-input"
                    />
                    <span className="font-medium">
                      {i.full_name || i.email}
                      {isPrimary && <span className="ml-1 text-[10px] font-normal text-muted-foreground">(primary)</span>}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Members</p>
            {cohort.students.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No students yet</p>
            ) : (
              <div className="space-y-1.5">
                {cohort.students.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 rounded-xl bg-muted/40 px-3 py-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-primary">
                      {s.full_name.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase() || "?"}
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

          {eligibleToAdd.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Add students</p>
              <div className="max-h-36 overflow-y-auto rounded-xl border border-input bg-background px-2 py-2">
                {eligibleToAdd.map((s) => {
                  const selected = selectedStudentIds.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleStudent(s.id)}
                      className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors ${
                        selected ? "bg-secondary text-primary" : "hover:bg-muted"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border text-[9px] font-bold ${
                          selected ? "border-primary bg-primary text-[#f0f7f5]" : "border-border text-muted-foreground"
                        }`}
                      >
                        {selected ? "✓" : ""}
                      </span>
                      <span className="truncate font-medium">{s.full_name || s.email}</span>
                    </button>
                  );
                })}
              </div>
              <Button
                type="button"
                size="sm"
                onClick={handleAddStudentsBulk}
                disabled={isPending || selectedStudentIds.length === 0}
                className="rounded-xl gap-1.5"
              >
                <UserPlus className="h-3.5 w-3.5" /> Add selected ({selectedStudentIds.length})
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

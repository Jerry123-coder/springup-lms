"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Search, ArrowRight, ChevronDown } from "lucide-react";
import { toast } from "sonner";

import { setStudentInstructor } from "@/lib/actions/admin";
import { Input } from "@/components/ui/input";

type Student = {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  pct: number;
  submittedLessons: number;
  totalLessons: number;
  lastActive: string | null;
  instructorId: string | null;
  instructorName: string | null;
};

type Instructor = { id: string; full_name: string; email: string };

export function AdminStudentDirectory({
  students,
  instructors,
}: {
  students: Student[];
  instructors: Instructor[];
}) {
  const [query, setQuery] = useState("");

  const filtered = students.filter((s) => {
    const q = query.toLowerCase();
    return (
      !q ||
      s.full_name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.instructorName ?? "").toLowerCase().includes(q)
    );
  });

  function timeAgo(iso: string | null) {
    if (!iso) return "Never";
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  }

  function initials(name: string) {
    return name
      .split(" ")
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase();
  }

  return (
    <div className="space-y-5">
      {/* Search bar */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search students by name, email or instructor…"
          className="h-12 rounded-2xl border-0 bg-card pl-11 text-sm shadow-ambient placeholder:text-muted-foreground/60"
        />
      </div>

      {/* Count */}
      <p className="text-xs text-muted-foreground">
        Showing <span className="font-semibold text-foreground">{filtered.length}</span> of{" "}
        <span className="font-semibold text-foreground">{students.length}</span> students
      </p>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl bg-card shadow-ambient">
        <div className="hidden grid-cols-[2fr_2fr_1fr_1.5fr_1fr_auto] items-center gap-4 border-b bg-muted/50 px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground sm:grid">
          <span>Student</span>
          <span>Progress</span>
          <span>Last Active</span>
          <span>Instructor</span>
          <span>Joined</span>
          <span />
        </div>

        {filtered.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-muted-foreground">
            No students match your search.
          </div>
        ) : (
          <div className="divide-y">
            {filtered.map((student) => (
              <StudentRow
                key={student.id}
                student={student}
                instructors={instructors}
                timeAgo={timeAgo}
                initials={initials}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StudentRow({
  student,
  instructors,
  timeAgo,
  initials,
}: {
  student: Student;
  instructors: Instructor[];
  timeAgo: (iso: string | null) => string;
  initials: (name: string) => string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleAssign(e: React.ChangeEvent<HTMLSelectElement>) {
    const instructorId = e.target.value;
    const fd = new FormData();
    fd.set("student_id", student.id);
    fd.set("instructor_id", instructorId);
    startTransition(async () => {
      const res = await setStudentInstructor(fd);
      if (res.error) toast.error(res.error);
      else toast.success("Instructor assignment updated");
    });
  }

  const avatarColors = [
    "bg-sky-500/20 text-sky-700 dark:text-sky-300",
    "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
    "bg-violet-500/20 text-violet-700 dark:text-violet-300",
    "bg-amber-500/20 text-amber-700 dark:text-amber-300",
    "bg-rose-500/20 text-rose-700 dark:text-rose-300",
  ];
  const colorIdx = student.full_name.charCodeAt(0) % avatarColors.length;

  return (
    <div className="grid grid-cols-1 gap-3 px-5 py-4 transition-colors hover:bg-muted/30 sm:grid-cols-[2fr_2fr_1fr_1.5fr_1fr_auto] sm:items-center sm:gap-4">
      {/* Name + email */}
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${avatarColors[colorIdx]}`}>
          {initials(student.full_name || student.email)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {student.full_name || "—"}
          </p>
          <p className="truncate text-xs text-muted-foreground">{student.email}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="sm:block">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>{student.pct}%</span>
          <span>{student.submittedLessons}/{student.totalLessons} lessons</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500"
            style={{ width: `${student.pct}%` }}
          />
        </div>
      </div>

      {/* Last active */}
      <p className="text-xs text-muted-foreground">{timeAgo(student.lastActive)}</p>

      {/* Instructor assignment */}
      <div className="relative">
        <select
          value={student.instructorId ?? ""}
          onChange={handleAssign}
          disabled={isPending}
          className="w-full appearance-none rounded-xl border border-input bg-background py-1.5 pl-3 pr-8 text-xs font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
        >
          <option value="">Unassigned</option>
          {instructors.map((i) => (
            <option key={i.id} value={i.id}>
              {i.full_name || i.email}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
      </div>

      {/* Joined */}
      <p className="text-xs text-muted-foreground">
        {new Date(student.created_at).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </p>

      {/* Detail link */}
      <Link
        href={`/dashboard/instructor/students/${student.id}`}
        className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary text-primary transition-colors hover:bg-primary hover:text-[#f0f7f5]"
        title="View student details"
      >
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

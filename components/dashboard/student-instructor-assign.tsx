"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { setStudentInstructor } from "@/lib/actions/admin";

export function StudentInstructorAssign({
  studentId,
  instructors,
  currentInstructorId,
}: {
  studentId: string;
  instructors: { id: string; full_name: string; email: string }[];
  currentInstructorId: string | null;
}) {
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    const nextId = value === "__none__" ? "" : value;

    startTransition(async () => {
      const fd = new FormData();
      fd.set("student_id", studentId);
      fd.set("instructor_id", nextId);
      const result = await setStudentInstructor(fd);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(
          nextId ? "Instructor assigned for reviews" : "Instructor unassigned"
        );
      }
    });
  }

  return (
    <select
      value={currentInstructorId ?? "__none__"}
      onChange={handleChange}
      disabled={isPending}
      className="h-8 max-w-[200px] rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
    >
      <option value="__none__">— None —</option>
      {instructors.map((ins) => (
        <option key={ins.id} value={ins.id}>
          {ins.full_name || ins.email}
        </option>
      ))}
    </select>
  );
}

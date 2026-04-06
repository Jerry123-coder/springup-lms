"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { toggleInstructorCoursePermission } from "@/lib/actions/admin";

export function InstructorPermissionToggle({
  instructorId,
  canEditCourses,
}: {
  instructorId: string;
  canEditCourses: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    const fd = new FormData();
    fd.set("instructor_id", instructorId);
    fd.set("value", String(!canEditCourses));

    startTransition(async () => {
      const res = await toggleInstructorCoursePermission(fd);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(
          canEditCourses ? "Course editing disabled" : "Course editing enabled"
        );
      }
    });
  }

  const active = canEditCourses;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      onClick={handleToggle}
      disabled={isPending}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
        active ? "bg-primary" : "bg-muted-foreground/30"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 translate-x-1 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          active ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

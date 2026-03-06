"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateUserRole } from "@/lib/actions/admin";
import type { UserRole } from "@/lib/types/database";

const roles: UserRole[] = ["student", "instructor", "admin"];

export function RoleSelector({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: UserRole;
}) {
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = e.target.value as UserRole;
    if (newRole === currentRole) return;

    const fd = new FormData();
    fd.set("user_id", userId);
    fd.set("role", newRole);

    startTransition(async () => {
      const result = await updateUserRole(fd);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Role updated to ${newRole}`);
      }
    });
  }

  return (
    <select
      value={currentRole}
      onChange={handleChange}
      disabled={isPending}
      className="h-8 rounded-md border border-input bg-background px-2 text-xs font-medium capitalize focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
    >
      {roles.map((r) => (
        <option key={r} value={r}>
          {r}
        </option>
      ))}
    </select>
  );
}

"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { adminDeleteUser } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";

export function AdminDeleteUserButton({
  userId,
  userLabel,
}: {
  userId: string;
  userLabel: string;
}) {
  const [pending, start] = useTransition();

  function handleClick() {
    if (
      !confirm(
        `Delete ${userLabel}? This permanently removes their account and related data.`
      )
    ) {
      return;
    }
    const fd = new FormData();
    fd.set("user_id", userId);
    start(async () => {
      const res = await adminDeleteUser(fd);
      if (res.error) toast.error(res.error);
      else {
        toast.success("User deleted");
        window.location.href = "/dashboard/admin/users";
      }
    });
  }

  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      loading={pending}
      onClick={handleClick}
    >
      Delete user
    </Button>
  );
}

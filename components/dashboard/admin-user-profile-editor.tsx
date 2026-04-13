"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { adminUpdateUserProfile } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminUserProfileEditor({
  userId,
  initialFullName,
  initialEmail,
}: {
  userId: string;
  initialFullName: string;
  initialEmail: string;
}) {
  const [pending, start] = useTransition();

  function save(fd: FormData) {
    fd.set("user_id", userId);
    start(async () => {
      const res = await adminUpdateUserProfile(fd);
      if (res.error) toast.error(res.error);
      else toast.success("Profile updated");
    });
  }

  return (
    <form action={save} className="space-y-4">
      <input type="hidden" name="user_id" value={userId} />
      <div className="space-y-2">
        <label htmlFor="full_name" className="text-sm font-medium">
          Full name
        </label>
        <Input
          id="full_name"
          name="full_name"
          defaultValue={initialFullName}
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={initialEmail}
          required
        />
        <p className="text-xs text-muted-foreground">
          Updates both the login email and profile. User may need to confirm a new email address.
        </p>
      </div>
      <Button type="submit" loading={pending}>
        Save profile
      </Button>
    </form>
  );
}

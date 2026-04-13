"use client";

import { useState, useTransition } from "react";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

import { adminInviteUser } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import type { UserRole } from "@/lib/types/database";

const roles: UserRole[] = ["student", "instructor", "admin"];

export function AdminInviteUserDialog() {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  function submit(fd: FormData) {
    start(async () => {
      const res = await adminInviteUser(fd);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Invite sent — user will receive an email to set their password.");
        setOpen(false);
      }
    });
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Invite user
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Invite user</SheetTitle>
          <SheetDescription>
            Sends an email invite so they can set a password and access Spring Up. Requires{" "}
            <code className="rounded bg-muted px-1 text-xs">SUPABASE_SERVICE_ROLE_KEY</code> on the server.
          </SheetDescription>
        </SheetHeader>
        <form action={submit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="invite-email" className="text-sm font-medium">
              Email
            </label>
            <Input id="invite-email" name="email" type="email" required placeholder="name@example.com" />
          </div>
          <div className="space-y-2">
            <label htmlFor="invite-name" className="text-sm font-medium">
              Full name
            </label>
            <Input id="invite-name" name="full_name" type="text" placeholder="Optional" />
          </div>
          <div className="space-y-2">
            <label htmlFor="invite-role" className="text-sm font-medium">
              Role
            </label>
            <select
              id="invite-role"
              name="role"
              required
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              defaultValue="student"
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" className="w-full" loading={pending}>
            Send invite
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

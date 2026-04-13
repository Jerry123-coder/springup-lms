"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { updateProfileEmail, updateProfileName } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ProfileSettingsForm({
  initialFullName,
  initialEmail,
}: {
  initialFullName: string;
  initialEmail: string;
}) {
  const [pendingName, startName] = useTransition();
  const [pendingEmail, startEmail] = useTransition();

  function submitName(fd: FormData) {
    startName(async () => {
      const res = await updateProfileName(fd);
      if ("error" in res && res.error) toast.error(res.error);
      else toast.success("Name updated");
    });
  }

  function submitEmail(fd: FormData) {
    startEmail(async () => {
      const res = await updateProfileEmail(fd);
      if ("error" in res && res.error) toast.error(res.error);
      else {
        toast.success(
          (res as { message?: string }).message ?? "Email update started — check your inbox."
        );
      }
    });
  }

  return (
    <div className="space-y-8">
      <form action={submitName} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="full_name" className="text-sm font-medium leading-none">
            Full name
          </label>
          <Input
            id="full_name"
            name="full_name"
            defaultValue={initialFullName}
            required
            autoComplete="name"
          />
        </div>
        <Button type="submit" loading={pendingName}>
          Save name
        </Button>
      </form>

      <div className="border-t pt-8">
        <form action={submitEmail} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium leading-none">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={initialEmail}
              required
              autoComplete="email"
            />
            <p className="text-xs text-muted-foreground">
              Changing your email may require confirming the new address from your inbox.
            </p>
          </div>
          <Button type="submit" variant="secondary" loading={pendingEmail}>
            Update email
          </Button>
        </form>
      </div>
    </div>
  );
}

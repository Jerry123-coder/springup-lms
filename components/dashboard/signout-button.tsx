"use client";

import { useFormStatus } from "react-dom";
import { Loader2, LogOut } from "lucide-react";
import { signout } from "@/lib/actions/auth";
import { SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";

function SignoutSubmit() {
  const { pending } = useFormStatus();
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <SidebarMenuButton
      type="submit"
      tooltip="Sign Out"
      className="w-full"
      disabled={pending}
      onClick={() => {
        if (isMobile) setOpenMobile(false);
      }}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <LogOut />}
      <span>Log Out</span>
    </SidebarMenuButton>
  );
}

export function SignoutButton({ userName: _userName }: { userName: string }) {
  return (
    <form action={signout}>
      <SignoutSubmit />
    </form>
  );
}

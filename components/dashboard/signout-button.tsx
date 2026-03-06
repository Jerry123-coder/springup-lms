"use client";

import { LogOut } from "lucide-react";
import { signout } from "@/lib/actions/auth";
import { SidebarMenuButton } from "@/components/ui/sidebar";

export function SignoutButton({ userName }: { userName: string }) {
  return (
    <form action={signout}>
      <SidebarMenuButton type="submit" tooltip="Sign Out" className="w-full">
        <LogOut />
        <span>{userName}</span>
      </SidebarMenuButton>
    </form>
  );
}

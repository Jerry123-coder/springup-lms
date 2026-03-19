"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { useDashboardUser } from "@/components/dashboard/user-context";
import { User } from "lucide-react";

interface DashboardHeaderProps {
  heading: string;
}

export function DashboardHeader({ heading }: DashboardHeaderProps) {
  const { userName } = useDashboardUser();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1 md:hidden" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-sm font-semibold tracking-tight">{heading}</h1>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle className="h-8 w-8" />
        <Separator orientation="vertical" className="h-4" />
        <div className="flex items-center gap-2 rounded-md px-2 py-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
            <User className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="hidden text-sm font-medium sm:inline-block">
            {userName}
          </span>
        </div>
      </div>
    </header>
  );
}

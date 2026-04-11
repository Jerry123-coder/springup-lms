"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "lucide-react";

import { NotificationBell } from "@/components/dashboard/notification-bell";
import { useDashboardUser } from "@/components/dashboard/user-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { profilePathForRole } from "@/lib/dashboard-routes";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  heading: string;
}

export function DashboardHeader({ heading }: DashboardHeaderProps) {
  const { userName, role } = useDashboardUser();
  const pathname = usePathname();
  const studentShell = pathname.startsWith("/dashboard/student");

  return (
    <header
      className={cn(
        "flex h-14 shrink-0 items-center justify-between px-4 sm:px-6 lg:px-8",
        studentShell
          ? "sticky top-0 z-20 border-0 bg-background/65 backdrop-blur-xl supports-[backdrop-filter]:bg-background/55"
          : "border-b"
      )}
    >
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1 md:hidden" />
        {!studentShell ? (
          <span className="mr-2 hidden h-4 w-px bg-border md:block" aria-hidden />
        ) : null}
        <h1
          className={cn(
            "tracking-tight",
            studentShell
              ? "font-display text-base font-semibold text-foreground md:text-lg"
              : "text-sm font-semibold"
          )}
        >
          {heading}
        </h1>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <ThemeToggle className="h-8 w-8" />
        <span className="hidden h-4 w-px bg-border/60 sm:block" aria-hidden />
        <NotificationBell />
        <Link
          href={profilePathForRole(role)}
          className="flex items-center gap-2 rounded-full bg-muted/60 px-2 py-1 pl-1 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Open profile"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">
            <User className="h-4 w-4" />
          </div>
          <span className="hidden max-w-[12rem] truncate text-sm font-medium sm:inline-block">
            {userName}
          </span>
        </Link>
      </div>
    </header>
  );
}

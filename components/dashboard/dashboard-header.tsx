"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Check, CheckCheck, User, X } from "lucide-react";

import { useDashboardNotifications } from "@/components/dashboard/notifications-context";
import { useDashboardUser } from "@/components/dashboard/user-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

function profilePathForRole(role: string): string {
  if (role === "admin") return "/dashboard/admin/profile";
  if (role === "instructor") return "/dashboard/instructor/profile";
  return "/dashboard/student/profile";
}

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { items, unreadCount, markRead, markAllRead, dismiss } =
    useDashboardNotifications();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 shrink-0"
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader className="space-y-1 text-left">
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>
            Updates and tips for your Spring Up workspace. Stored on this device until you clear them.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 flex gap-2 border-b pb-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="gap-1.5"
            disabled={unreadCount === 0}
            onClick={() => markAllRead()}
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </Button>
        </div>
        <ul className="mt-2 flex-1 space-y-2 overflow-y-auto pr-1">
          {items.length === 0 ? (
            <li className="rounded-xl border border-dashed bg-muted/30 px-4 py-10 text-center text-sm text-muted-foreground">
              You&apos;re all caught up.
            </li>
          ) : (
            items.map((n) => (
              <li
                key={n.id}
                className={cn(
                  "rounded-xl border bg-card p-3 shadow-sm transition-colors",
                  !n.read && "border-primary/25 bg-primary/[0.04]"
                )}
              >
                <div className="flex gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">{n.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {n.body}
                    </p>
                    <p className="mt-2 text-[10px] text-muted-foreground">
                      {new Date(n.createdAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                    {n.href ? (
                      <Link
                        href={n.href}
                        className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
                        onClick={() => {
                          markRead(n.id);
                          setOpen(false);
                        }}
                      >
                        Open link
                      </Link>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 flex-col gap-1">
                    {!n.read ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Mark read"
                        onClick={() => markRead(n.id)}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      title="Dismiss"
                      onClick={() => dismiss(n.id)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </SheetContent>
    </Sheet>
  );
}

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

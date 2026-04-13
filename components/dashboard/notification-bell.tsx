"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Check, CheckCheck, X } from "lucide-react";

import { useDashboardNotifications } from "@/components/dashboard/notifications-context";
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

export function NotificationBell() {
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

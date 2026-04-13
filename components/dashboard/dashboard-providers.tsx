"use client";

import { NotificationsProvider } from "@/components/dashboard/notifications-context";

export function DashboardProviders({
  userId,
  children,
}: {
  userId: string;
  children: React.ReactNode;
}) {
  return <NotificationsProvider userId={userId}>{children}</NotificationsProvider>;
}

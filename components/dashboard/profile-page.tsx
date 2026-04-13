import { redirect } from "next/navigation";
import { CalendarDays, Mail, Shield, User } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ProfileSettingsForm } from "@/components/dashboard/profile-settings-form";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { UserRole } from "@/lib/types/database";
import { cn } from "@/lib/utils";

function roleLabel(role: UserRole): string {
  if (role === "admin") return "Administrator";
  if (role === "instructor") return "Instructor";
  return "Student";
}

export async function ProfilePageView() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("profiles")
    .select("full_name, email, role, created_at")
    .eq("id", user.id)
    .single();

  const row = data as {
    full_name?: string;
    email?: string;
    role?: UserRole;
    created_at?: string;
  } | null;

  const role = row?.role ?? "student";
  const displayName = row?.full_name?.trim() || row?.email || user.email || "Member";
  const memberSince = row?.created_at
    ? new Date(row.created_at).toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <>
      <DashboardHeader heading="Profile" />
      <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto grid max-w-3xl gap-6 lg:grid-cols-5">
          <Card className="border bg-card shadow-ambient lg:col-span-2">
            <CardHeader className="pb-4">
              <div className="flex items-start gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                  <User className="h-7 w-7" />
                </div>
                <div className="min-w-0 space-y-1">
                  <CardTitle className="font-display text-xl leading-tight">
                    {displayName}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 text-xs sm:text-sm">
                    {row?.email ?? user.email}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 border-t pt-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Role</span>
                <Badge
                  variant="secondary"
                  className={cn(
                    "capitalize",
                    role === "admin" && "border-primary/20 bg-primary/10 text-primary"
                  )}
                >
                  {roleLabel(role)}
                </Badge>
              </div>
              {memberSince ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4 shrink-0 opacity-70" />
                  <span>Member since {memberSince}</span>
                </div>
              ) : null}
              <p className="text-xs leading-relaxed text-muted-foreground">
                Use the person icon in the top bar anytime to return here. Notifications
                live in the bell next to it.
              </p>
            </CardContent>
          </Card>

          <div className="space-y-6 lg:col-span-3">
            <Card className="border bg-card shadow-ambient">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Contact and display
                </CardTitle>
                <CardDescription>
                  Your name appears on certificates and in the classroom. Changing email
                  sends a confirmation link — you stay signed in until you confirm.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileSettingsForm
                  initialFullName={row?.full_name ?? ""}
                  initialEmail={row?.email ?? user.email ?? ""}
                />
              </CardContent>
            </Card>

            <Card className="border border-dashed bg-muted/20 shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-medium">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  Account security
                </CardTitle>
                <CardDescription className="text-xs leading-relaxed">
                  Password resets and two-factor settings are managed through your sign-in
                  provider. If you use email magic links, keep your inbox secure.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

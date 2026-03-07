import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardUserProvider } from "@/components/dashboard/user-context";
import type { UserRole } from "@/lib/types/database";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data } = await (supabase.from("profiles") as any)
    .select("role, full_name, email")
    .eq("id", user.id)
    .single();

  const profileData = data as { role?: UserRole; full_name?: string; email?: string } | null;
  const role: UserRole = profileData?.role ?? "student";
  const userName =
    profileData?.full_name || profileData?.email || user.email || "User";

  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

  return (
    <DashboardUserProvider userName={userName} role={role}>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar role={role} userName={userName} />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </DashboardUserProvider>
  );
}

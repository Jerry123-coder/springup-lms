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

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, email")
    .eq("id", user.id)
    .single();

  const role: UserRole = profile?.role ?? "student";
  const userName =
    profile?.full_name || profile?.email || user.email || "User";

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

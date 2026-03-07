import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { RoleSelector } from "@/components/dashboard/role-selector";
import { Skeleton } from "@/components/ui/skeleton";
import type { Profile } from "@/lib/types/database";

async function UsersTable() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <p className="text-sm text-destructive">
        Error loading users: {error.message}
      </p>
    );
  }

  const users = (data ?? []) as Profile[];

  if (users.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No users found.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium">Name</th>
            <th className="hidden px-4 py-3 text-left font-medium sm:table-cell">
              Email
            </th>
            <th className="px-4 py-3 text-left font-medium">Role</th>
            <th className="hidden px-4 py-3 text-left font-medium md:table-cell">
              Joined
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b last:border-b-0 even:bg-muted/60 transition-colors hover:bg-muted/80">
              <td className="px-4 py-3 font-medium">
                {u.full_name || "—"}
              </td>
              <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                {u.email}
              </td>
              <td className="px-4 py-3">
                <RoleSelector userId={u.id} currentRole={u.role} />
              </td>
              <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                {new Date(u.created_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="border-b bg-muted/50 px-4 py-3">
        <Skeleton className="h-4 w-48" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex gap-4 border-b px-4 py-3 last:border-b-0"
        >
          <Skeleton className="h-4 w-32" />
          <Skeleton className="hidden h-4 w-40 sm:block" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <>
      <DashboardHeader heading="User Management" />
      <div className="flex-1 space-y-6 p-6">
        <div>
          <h2 className="text-lg font-semibold">All Users</h2>
          <p className="text-sm text-muted-foreground">
            Toggle any user&apos;s role using the dropdown selector.
          </p>
        </div>
        <Suspense fallback={<TableSkeleton />}>
          <UsersTable />
        </Suspense>
      </div>
    </>
  );
}

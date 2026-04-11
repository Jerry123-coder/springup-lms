import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { AdminInviteUserDialog } from "@/components/dashboard/admin-invite-user-dialog";
import { RoleSelector } from "@/components/dashboard/role-selector";
import { StudentInstructorAssign } from "@/components/dashboard/student-instructor-assign";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingLink } from "@/components/ui/loading-link";
import { ExternalLink } from "lucide-react";
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

  const instructors = users.filter((u) => u.role === "instructor");

  const { data: assignRows } = await supabase
    .from("instructor_student_assignments")
    .select("student_id, instructor_id");

  const assignByStudent = new Map<string, string>();
  for (const row of assignRows ?? []) {
    const r = row as { student_id: string; instructor_id: string };
    if (!assignByStudent.has(r.student_id)) {
      assignByStudent.set(r.student_id, r.instructor_id);
    }
  }

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
            <th className="hidden px-4 py-3 text-left font-medium lg:table-cell">
              Instructor
            </th>
            <th className="hidden px-4 py-3 text-left font-medium md:table-cell">
              Joined
            </th>
            <th className="px-4 py-3 text-right font-medium">Profile</th>
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
              <td className="hidden px-4 py-3 lg:table-cell">
                {u.role === "student" ? (
                  <StudentInstructorAssign
                    studentId={u.id}
                    instructors={instructors}
                    currentInstructorId={assignByStudent.get(u.id) ?? null}
                  />
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </td>
              <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                {new Date(u.created_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </td>
              <td className="px-4 py-3 text-right">
                <LoadingLink
                  href={`/dashboard/admin/users/${u.id}`}
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View
                </LoadingLink>
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
          <Skeleton className="hidden h-8 w-40 rounded-md lg:block" />
          <Skeleton className="hidden h-4 w-20 md:block" />
          <Skeleton className="ml-auto h-8 w-16 rounded-md" />
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">All Users</h2>
            <p className="text-sm text-muted-foreground">
              Toggle any user&apos;s role using the dropdown. For students, choose an
              instructor so their submissions appear in that instructor&apos;s grading
              queue (when assignments are set). Invite new users or open a profile for
              details and progress.
            </p>
          </div>
          <AdminInviteUserDialog />
        </div>
        <Suspense fallback={<TableSkeleton />}>
          <UsersTable />
        </Suspense>
      </div>
    </>
  );
}

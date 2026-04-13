import type { UserRole } from "@/lib/types/database";

export function profilePathForRole(role: UserRole | string): string {
  if (role === "admin") return "/dashboard/admin/profile";
  if (role === "instructor") return "/dashboard/instructor/profile";
  return "/dashboard/student/profile";
}

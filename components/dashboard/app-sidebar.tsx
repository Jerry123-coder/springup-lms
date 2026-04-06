"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  Users2,
  BookOpen,
  ClipboardCheck,
  Settings,
  PlayCircle,
  Award,
  TrendingUp,
  BarChart3,
  UserCheck,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { SignoutButton } from "@/components/dashboard/signout-button";
import type { UserRole } from "@/lib/types/database";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tutorialsLink: NavItem = {
  title: "Tutorials",
  href: "/dashboard/tutorials",
  icon: PlayCircle,
};

const navByRole: Record<UserRole, NavItem[]> = {
  admin: [
    { title: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
    { title: "Students", href: "/dashboard/admin/students", icon: Users },
    { title: "Instructors", href: "/dashboard/admin/instructors", icon: UserCheck },
    { title: "Cohorts", href: "/dashboard/admin/cohorts", icon: Users2 },
    { title: "Courses", href: "/dashboard/admin/courses", icon: BookOpen },
    { title: "Analytics", href: "/dashboard/admin/analytics", icon: BarChart3 },
    tutorialsLink,
    { title: "Settings", href: "/dashboard/admin/settings", icon: Settings },
  ],
  instructor: [
    { title: "Overview", href: "/dashboard/instructor", icon: LayoutDashboard },
    { title: "My Students", href: "/dashboard/instructor/students", icon: Users },
    { title: "My Classes", href: "/dashboard/instructor/cohorts", icon: Users2 },
    { title: "Grading", href: "/dashboard/instructor/grading", icon: ClipboardCheck },
    { title: "Courses", href: "/dashboard/instructor/courses", icon: BookOpen },
    tutorialsLink,
  ],
  student: [
    { title: "Home", href: "/dashboard/student", icon: LayoutDashboard },
    {
      title: "Course catalog",
      href: "/dashboard/student/catalog",
      icon: BookOpen,
    },
    {
      title: "Learning Path",
      href: "/dashboard/student/progress",
      icon: TrendingUp,
    },
    {
      title: "Assignments",
      href: "/dashboard/student/submissions",
      icon: ClipboardCheck,
    },
    {
      title: "Certificates",
      href: "/dashboard/student/certificates",
      icon: Award,
    },
    tutorialsLink,
  ],
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  role: UserRole;
  userName: string;
}

function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/dashboard/admin" || href === "/dashboard/instructor") {
    return pathname === href;
  }
  if (href === "/dashboard/student") {
    return pathname === "/dashboard/student";
  }
  if (href === "/dashboard/student/catalog") {
    return (
      pathname === "/dashboard/student/catalog" ||
      pathname.startsWith("/dashboard/student/courses")
    );
  }
  if (href === "/dashboard/tutorials") {
    return pathname === href || pathname.startsWith("/dashboard/tutorials/");
  }
  if (href === "/dashboard/instructor/grading") {
    return (
      pathname === href ||
      pathname.startsWith("/dashboard/instructor/reviews")
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar({ role, userName, ...props }: AppSidebarProps) {
  const pathname = usePathname();
  const items = navByRole[role];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-xl bg-gradient-primary">
                  <GraduationCap className="size-4 text-white" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Spring Up</span>
                  <span
                    className="truncate text-xs capitalize opacity-60"
                  >
                    {role} Dashboard
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isNavItemActive(pathname, item.href)}
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SignoutButton userName={userName} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

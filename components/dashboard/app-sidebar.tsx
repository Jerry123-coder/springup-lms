"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardCheck,
  Settings,
  PlayCircle,
  Award,
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
    { title: "Users", href: "/dashboard/admin/users", icon: Users },
    { title: "Courses", href: "/dashboard/admin/courses", icon: BookOpen },
    tutorialsLink,
    { title: "Settings", href: "/dashboard/admin/settings", icon: Settings },
  ],
  instructor: [
    {
      title: "Overview",
      href: "/dashboard/instructor",
      icon: LayoutDashboard,
    },
    {
      title: "Reviews",
      href: "/dashboard/instructor/reviews",
      icon: ClipboardCheck,
    },
    {
      title: "Courses",
      href: "/dashboard/instructor/courses",
      icon: BookOpen,
    },
    tutorialsLink,
  ],
  student: [
    { title: "Classroom", href: "/dashboard/student", icon: BookOpen },
    {
      title: "My Submissions",
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
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-emerald-400">
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
                    isActive={pathname === item.href}
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

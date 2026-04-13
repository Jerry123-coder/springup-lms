"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
  type MouseEvent,
} from "react";
import {
  GraduationCap,
  LayoutDashboard,
  Loader2,
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
  UserCog,
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
  useSidebar,
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
    { title: "Users", href: "/dashboard/admin/users", icon: UserCog },
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

/** Overview routes: only an exact pathname match counts as "arrived" (not deeper segments). */
const MOBILE_NAV_EXACT_DEST = new Set([
  "/dashboard/student",
  "/dashboard/admin",
  "/dashboard/instructor",
]);

function mobileNavDestinationReached(pathname: string, dest: string): boolean {
  if (pathname === dest) return true;
  if (dest === "/") return false;
  if (MOBILE_NAV_EXACT_DEST.has(dest)) return false;
  return pathname.startsWith(`${dest}/`);
}

export function AppSidebar({ role, userName, ...props }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const items = navByRole[role];
  const { isMobile, setOpenMobile } = useSidebar();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  /** Pathname when mobile nav started — avoids closing early while still on a subpath of the target. */
  const mobileNavFromPathRef = useRef<string | null>(null);

  const finishMobileNav = useCallback(() => {
    mobileNavFromPathRef.current = null;
    setPendingHref(null);
    if (isMobile) setOpenMobile(false);
  }, [isMobile, setOpenMobile]);

  useEffect(() => {
    if (!isMobile || !pendingHref || mobileNavFromPathRef.current === null) {
      return;
    }
    if (pathname === mobileNavFromPathRef.current) {
      return;
    }
    if (mobileNavDestinationReached(pathname, pendingHref)) {
      finishMobileNav();
    }
  }, [pathname, pendingHref, isMobile, finishMobileNav]);

  useEffect(() => {
    if (!pendingHref) return;
    const id = window.setTimeout(() => {
      mobileNavFromPathRef.current = null;
      setPendingHref(null);
      if (isMobile) setOpenMobile(false);
    }, 15_000);
    return () => window.clearTimeout(id);
  }, [pendingHref, isMobile, setOpenMobile]);

  const handleMobileNavClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>, href: string) => {
      if (!isMobile) return;
      if (pathname === href) {
        setOpenMobile(false);
        return;
      }
      e.preventDefault();
      mobileNavFromPathRef.current = pathname;
      setPendingHref(href);
      startTransition(() => {
        router.push(href);
      });
    },
    [isMobile, pathname, router, setOpenMobile, startTransition]
  );

  const headerLoading = isMobile && pendingHref === "/";
  const navBusy = isMobile && pendingHref !== null;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link
                href="/"
                aria-busy={headerLoading || undefined}
                className={
                  navBusy && !headerLoading
                    ? "pointer-events-none opacity-50"
                    : undefined
                }
                onClick={(e) => handleMobileNavClick(e, "/")}
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-xl bg-gradient-primary">
                  {headerLoading ? (
                    <Loader2 className="size-4 animate-spin text-white" aria-hidden />
                  ) : (
                    <GraduationCap className="size-4 text-white" />
                  )}
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
              {items.map((item) => {
                const itemLoading = isMobile && pendingHref === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isNavItemActive(pathname, item.href)}
                      tooltip={item.title}
                    >
                      <Link
                        href={item.href}
                        aria-busy={itemLoading || undefined}
                        className={
                          navBusy && !itemLoading
                            ? "pointer-events-none opacity-50"
                            : undefined
                        }
                        onClick={(e) => handleMobileNavClick(e, item.href)}
                      >
                        {itemLoading ? (
                          <Loader2
                            className="size-4 shrink-0 animate-spin"
                            aria-hidden
                          />
                        ) : (
                          <item.icon />
                        )}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
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

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, Heart, Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SupportDrawer } from "@/components/marketing/support-drawer";
import { ThemeToggle } from "@/components/theme-toggle";

const navLinks = [
  { label: "Mission", href: "#mission" },
  { label: "Curriculum", href: "#curriculum" },
  { label: "Impact", href: "#impact" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    if (!isHome) {
      setActiveSection(null);
      return;
    }
    const sectionIds = navLinks.map((l) => l.href.slice(1));

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const viewportMid = scrollY + window.innerHeight * 0.35;

      let current: string | null = null;
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        const { top, bottom } = el.getBoundingClientRect();
        const elTop = top + scrollY;
        const elBottom = bottom + scrollY;
        if (viewportMid >= elTop && viewportMid <= elBottom) {
          current = id;
        }
      }
      if (!current && sectionIds.length > 0) {
        current =
          scrollY < 100 ? sectionIds[0] : sectionIds[sectionIds.length - 1];
      }
      setActiveSection(current);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0f2847]/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-sky-400 to-emerald-400 transition-transform duration-200 group-hover:scale-105">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">Spring Up</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const sectionId = link.href.slice(1);
            const isActive = activeSection === sectionId;
            const href = isHome ? link.href : `/${link.href}`;
            return (
              <Button
                key={link.href}
                variant="ghost"
                size="sm"
                className={`font-medium transition-colors hover:bg-white/10 hover:text-white ${
                  isActive
                    ? "bg-white/15 text-white"
                    : "text-blue-100/90"
                }`}
                asChild
              >
                <Link href={href}>{link.label}</Link>
              </Button>
            );
          })}

          <SupportDrawer>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 font-medium text-pink-400 transition-colors hover:bg-pink-400/10 hover:text-pink-300"
            >
              <Heart className="h-3.5 w-3.5" />
              Support Us
            </Button>
          </SupportDrawer>

          <ThemeToggle className="text-blue-200 hover:bg-white/10 hover:text-white" />

          <div className="ml-1 h-6 w-px bg-white/20" />

          <Button
            size="sm"
            className="ml-2 bg-sky-500 text-white hover:bg-sky-400"
            asChild
          >
            <Link href="/login">Login</Link>
          </Button>
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle className="text-blue-200 hover:bg-white/10 hover:text-white" />
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-[#0f2847] px-4 pb-4 pt-2 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const sectionId = link.href.slice(1);
              const isActive = activeSection === sectionId;
              const href = isHome ? link.href : `/${link.href}`;
              return (
                <Button
                  key={link.href}
                  variant="ghost"
                  className={`justify-start font-medium transition-colors hover:bg-white/10 hover:text-white ${
                    isActive
                      ? "bg-white/15 text-white"
                      : "text-blue-100/90"
                  }`}
                  asChild
                  onClick={() => setMobileOpen(false)}
                >
                  <Link href={href}>{link.label}</Link>
                </Button>
              );
            })}

            <SupportDrawer>
              <Button
                variant="ghost"
                className="justify-start gap-1.5 font-medium text-pink-400 hover:bg-pink-400/10 hover:text-pink-300"
              >
                <Heart className="h-3.5 w-3.5" />
                Support Us
              </Button>
            </SupportDrawer>

            <div className="my-2 h-px bg-white/10" />

            <Button
              className="bg-sky-500 text-white hover:bg-sky-400"
              asChild
              onClick={() => setMobileOpen(false)}
            >
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { SpringLogo } from "@/components/marketing/spring-logo";

const navLinks = [
  { label: "Mission",    href: "#mission"     },
  { label: "Curriculum", href: "#curriculum"  },
  { label: "Impact",     href: "#impact"      },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isHome) { setActiveSection(null); return; }
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
        if (viewportMid >= elTop && viewportMid <= elBottom) current = id;
      }
      if (!current && sectionIds.length > 0) {
        current = scrollY < 100 ? sectionIds[0] : sectionIds[sectionIds.length - 1];
      }
      setActiveSection(current);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 180, damping: 20, delay: 0.05 }}
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-[#001a14]/90 backdrop-blur-xl shadow-[0_1px_24px_rgba(0,0,0,0.4)]"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2 transition-opacity hover:opacity-90">
          <SpringLogo size={38} variant="full" animated />
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link, i) => {
            const sectionId = link.href.slice(1);
            const isActive = activeSection === sectionId;
            const href = isHome ? link.href : `/${link.href}`;
            return (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.06 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className={`relative font-medium transition-colors hover:bg-white/10 hover:text-white ${
                    isActive ? "bg-white/12 text-[#94d3c1]" : "text-[#c8ebe2]/75"
                  }`}
                  asChild
                >
                  <Link href={href}>
                    {link.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute -bottom-0.5 left-2 right-2 h-px rounded-full bg-[#94d3c1]"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                </Button>
              </motion.div>
            );
          })}

          <ThemeToggle className="text-[#94d3c1]/70 hover:bg-white/10 hover:text-white" />
          <div className="ml-1 h-6 w-px bg-white/20" />

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            <Button
              size="sm"
              className="ml-2 font-semibold shadow-sm transition-all hover:opacity-90 hover:scale-[1.03]"
              style={{ background: "linear-gradient(135deg, #c8f542 0%, #a8e832 100%)", color: "#0a2a10" }}
              asChild
            >
              <Link href="/login">Login</Link>
            </Button>
          </motion.div>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle className="text-[#94d3c1]/70 hover:bg-white/10 hover:text-white" />
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={mobileOpen ? "close" : "open"}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </motion.div>
            </AnimatePresence>
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: "easeInOut" }}
            className="overflow-hidden border-t border-white/10 bg-[#001a14]/95 px-4 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-1 py-3">
              {navLinks.map((link, i) => {
                const sectionId = link.href.slice(1);
                const isActive = activeSection === sectionId;
                const href = isHome ? link.href : `/${link.href}`;
                return (
                  <motion.div
                    key={link.href}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Button
                      variant="ghost"
                      className={`justify-start font-medium transition-colors hover:bg-white/10 hover:text-white ${
                        isActive ? "bg-white/12 text-[#94d3c1]" : "text-[#c8ebe2]/75"
                      }`}
                      asChild
                      onClick={() => setMobileOpen(false)}
                    >
                      <Link href={href}>{link.label}</Link>
                    </Button>
                  </motion.div>
                );
              })}
              <div className="my-2 h-px bg-white/10" />
              <Button
                className="font-semibold hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #c8f542 0%, #a8e832 100%)", color: "#0a2a10" }}
                asChild
                onClick={() => setMobileOpen(false)}
              >
                <Link href="/login">Login</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

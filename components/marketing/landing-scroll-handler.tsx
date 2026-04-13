"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  LANDING_SECTION_PARAM,
  parseLandingSection,
  getLandingScrollElementId,
  type LandingSectionKey,
} from "@/lib/marketing-anchors";

/**
 * Reads `/?section=mission|curriculum|impact`, scrolls to the target, then
 * replaces the URL with `/` (no hash, query stripped after scroll).
 */
export function LandingScrollHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const sectionParam = searchParams.get(LANDING_SECTION_PARAM);

  useEffect(() => {
    if (pathname !== "/") return;

    const section = parseLandingSection(sectionParam);
    if (!section) return;

    const id = getLandingScrollElementId(section as LandingSectionKey);
    let cancelled = false;

    const run = () => {
      if (cancelled) return;
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      router.replace("/", { scroll: false });
    };

    const t = requestAnimationFrame(() => {
      requestAnimationFrame(run);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(t);
    };
  }, [pathname, sectionParam, router]);

  return null;
}

"use client";

import * as React from "react";

import { useSidebar } from "@/components/ui/sidebar";

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function CourseSidebarAutoCollapse() {
  const { isMobile, setOpen } = useSidebar();

  React.useEffect(() => {
    if (isMobile) return;

    // Collapse immediately (desktop) so the course view has more space.
    setOpen(false);

    // Persist the preference for future visits.
    document.cookie = `${SIDEBAR_COOKIE_NAME}=false; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
  }, [isMobile, setOpen]);

  return null;
}


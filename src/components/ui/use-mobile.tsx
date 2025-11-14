
/*
This file is a utility hook and does not contain styling, so no changes were needed for the redesign. The comment has been updated for consistency with the project's documentation style.
*/
"use client";

import * as React from "react";

const MOBILE_BREAKPOINT = 768; // Standard breakpoint for md in Tailwind

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    // Initial state for client-side rendering
    if (typeof window !== "undefined") {
      return window.innerWidth < MOBILE_BREAKPOINT;
    }
    return false; // Default for SSR
  });

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    const handleChange = () => {
      setIsMobile(mql.matches);
    };

    // Set initial state correctly after mount
    handleChange();

    mql.addEventListener("change", handleChange);

    return () => mql.removeEventListener("change", handleChange);
  }, []); // Empty dependency array ensures this runs once

  return isMobile;
}
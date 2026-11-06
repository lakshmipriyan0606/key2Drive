"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackAction } from "@/lib/analytics/tracker";

/**
 * Global Visitor Tracker Component
 * Automatically tracks page views, active presence heartbeats, and user click actions.
 */
export default function VisitorTracker() {
  const pathname = usePathname();
  const lastPathRef = useRef<string>("");

  // 1. Track Pageviews on route changes (Public Customer Website Only - Exclude Admin Portal)
  useEffect(() => {
    // Strictly exclude admin portal routes from customer visitor analytics
    if (!pathname || pathname.startsWith("/admin")) {
      return;
    }

    // Avoid double firing on same path
    if (pathname !== lastPathRef.current) {
      lastPathRef.current = pathname;
      trackAction("pageview", `Viewed ${pathname}`);
    }
  }, [pathname]);

  // 2. Active Presence Heartbeat (Every 30 seconds when customer tab is active)
  useEffect(() => {
    // Exclude admin pages from sending client presence heartbeats
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
      return;
    }

    const interval = setInterval(() => {
      if (
        typeof document !== "undefined" &&
        document.visibilityState === "visible" &&
        !window.location.pathname.startsWith("/admin")
      ) {
        trackAction("heartbeat");
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [pathname]);

  // 3. Global Click Listener for WhatsApp, Phone Calls, and Custom Actions (Customer actions only)
  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      // Ignore clicks within admin portal
      if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (!target) return;

      // Find closest anchor tag or action element
      const anchor = target.closest("a");
      const actionElement = target.closest("[data-track-action]");

      if (actionElement) {
        const action = actionElement.getAttribute("data-track-action");
        const label = actionElement.getAttribute("data-track-label") || actionElement.textContent?.trim();
        if (action) {
          trackAction(action, label?.substring(0, 50));
          return;
        }
      }

      if (anchor) {
        const href = anchor.getAttribute("href") || "";

        // WhatsApp Click Detection
        if (href.includes("wa.me") || href.includes("api.whatsapp.com")) {
          const label = anchor.getAttribute("aria-label") || anchor.textContent?.trim() || "WhatsApp Click";
          trackAction("click_whatsapp", label.substring(0, 50));
          return;
        }

        // Phone Call Click Detection
        if (href.startsWith("tel:")) {
          const phone = href.replace("tel:", "").trim();
          trackAction("click_call", `Call to ${phone}`);
          return;
        }

        // Book Driver Button Detection
        if (href.includes("/book")) {
          const label = anchor.textContent?.trim() || "Book Driver Click";
          trackAction("click_book", label.substring(0, 50));
          return;
        }
      }
    };

    document.addEventListener("click", handleGlobalClick, { capture: true });
    return () => document.removeEventListener("click", handleGlobalClick, { capture: true });
  }, []);

  return null;
}


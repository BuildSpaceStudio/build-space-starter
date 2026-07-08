"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { getBrowserClient } from "@/lib/buildspace-client";

// Client-side page-view tracking, mounted once in the root layout. Events are
// batched by the browser SDK and flushed automatically. Analytics must never
// break the app — any failure is swallowed.
export function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    try {
      getBrowserClient().events.track("page_viewed", { path: pathname });
    } catch {
      // Missing key or network issues — never surface to the user.
    }
  }, [pathname]);

  return null;
}

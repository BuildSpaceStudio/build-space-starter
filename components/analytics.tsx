"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { getBrowserClient } from "@/lib/buildspace-client";

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign"] as const;

// Client-side page-view tracking, mounted once in the root layout. Buildspace
// turns `path`, `referrer` and `utm_*` into the Pages, Referrers and Campaigns
// views in Studio. Visitors are counted without cookies. Events are batched by
// the browser SDK and flushed automatically. Analytics must never break the
// app — any failure is swallowed.
export function Analytics() {
  const pathname = usePathname();
  const isLanding = useRef(true);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const properties: Record<string, string> = { path: pathname };
      for (const key of UTM_KEYS) {
        const value = params.get(key);
        if (value) {
          properties[key] = value;
        }
      }
      // document.referrer never changes during client navigation; only the
      // landing view owns it.
      if (isLanding.current && document.referrer) {
        properties.referrer = document.referrer;
      }
      isLanding.current = false;
      getBrowserClient().events.track("page_viewed", properties);
    } catch {
      // Missing key or network issues — never surface to the user.
    }
  }, [pathname]);

  return null;
}

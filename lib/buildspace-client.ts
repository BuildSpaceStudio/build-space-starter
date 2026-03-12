"use client";

import { createClient } from "@buildspacestudio/sdk/client";

// Browser-safe SDK singleton — uses the publishable key (bs_pub_*)
// Set NEXT_PUBLIC_BUILDSPACE_PUBLISHABLE_KEY in your environment or .env.local

let instance: ReturnType<typeof createClient> | null = null;

export function getBrowserClient() {
  if (instance) return instance;
  const key = process.env.NEXT_PUBLIC_BUILDSPACE_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error("Missing NEXT_PUBLIC_BUILDSPACE_PUBLISHABLE_KEY environment variable");
  }
  instance = createClient(key);
  return instance;
}

import Buildspace from "@buildspacestudio/sdk";
import { env } from "@/lib/env";

// Server-side SDK singleton — uses the secret key (bs_sec_*)
// Set BUILDSPACE_SECRET_KEY in your environment or .env.local

let instance: Buildspace | null = null;

export function getServerClient(): Buildspace {
  if (instance) return instance;
  instance = new Buildspace(env.BUILDSPACE_SECRET_KEY);
  return instance;
}

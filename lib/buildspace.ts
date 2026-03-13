import Buildspace from "@buildspacestudio/sdk";

// Server-side SDK singleton — uses the secret key (bs_sec_*)
// Set BUILDSPACE_SECRET_KEY in your environment or .env.local

let instance: Buildspace | null = null;

export function getServerClient(): Buildspace {
  if (instance) return instance;
  const key = process.env.BUILDSPACE_SECRET_KEY;
  if (!key) {
    throw new Error("Missing BUILDSPACE_SECRET_KEY environment variable");
  }
  instance = new Buildspace(key);
  return instance;
}

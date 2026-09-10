import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output bundles only what the server needs — smaller deploy
  // artifact and faster cold starts on Railway. `bun run start` runs the
  // generated server (see the start script + postbuild asset copy).
  output: "standalone",
  // Anchor file tracing here so the standalone layout is stable even when the
  // project sits inside a larger workspace.
  outputFileTracingRoot: import.meta.dirname,
  // The BuildSpace hosted dev workspace runs `next dev` behind a custom
  // domain (its Railway public URL), not localhost. Without this, Next's
  // default dev-origin protection silently blocks every request for its own
  // JS/HMR chunks from that domain — the server-rendered HTML still looks
  // fine, but client components never hydrate, so buttons do nothing and
  // next/link falls back to full-page navigations. Dev-only; unused by the
  // production build (`next start`), which doesn't apply this check.
  allowedDevOrigins: [
    "*.devapps.buildspace.studio",
    "*.apps.buildspace.studio",
    process.env.RAILWAY_PUBLIC_DOMAIN,
  ].filter((origin): origin is string => Boolean(origin)),
};

export default nextConfig;

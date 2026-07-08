import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output bundles only what the server needs — smaller deploy
  // artifact and faster cold starts on Railway. `bun run start` runs the
  // generated server (see the start script + postbuild asset copy).
  output: "standalone",
  // Anchor file tracing here so the standalone layout is stable even when the
  // project sits inside a larger workspace.
  outputFileTracingRoot: import.meta.dirname,
};

export default nextConfig;

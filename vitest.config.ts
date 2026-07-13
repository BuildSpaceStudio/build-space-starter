import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["**/*.test.ts"],
    environment: "node",
  },
  resolve: {
    alias: {
      // Server-only modules import "server-only", which throws outside a React
      // Server Components bundle. Stub it so unit tests can import them.
      "server-only": path.resolve(__dirname, "test/stubs/server-only.ts"),
      "@": path.resolve(__dirname, "."),
    },
  },
});

import { describe, expect, it } from "vitest";
import { cn, formatBytes } from "./utils";

// Exemplar `lib/` unit test: pure helpers need no mocks. Copy this shape for
// any new helper you add to `lib/`.
describe("cn", () => {
  it("merges conditional classes and resolves Tailwind conflicts", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("flex", false, undefined, "gap-2")).toBe("flex gap-2");
  });
});

describe("formatBytes", () => {
  it("formats across unit boundaries", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(1024)).toBe("1.0 KB");
    expect(formatBytes(10 * 1024)).toBe("10 KB");
    expect(formatBytes(5.25 * 1024 * 1024)).toBe("5.3 MB");
  });
});

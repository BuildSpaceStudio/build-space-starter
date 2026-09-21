import { afterEach, describe, expect, it, vi } from "vitest";
import { log } from "@/lib/log";

function captureError(fn: () => void): string {
  const spy = vi.spyOn(console, "error").mockImplementation(() => {});
  fn();
  const output = spy.mock.calls.map((call) => call.join(" ")).join("\n");
  spy.mockRestore();
  return output;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("log", () => {
  it("formats scope and message", () => {
    const output = captureError(() => log.error("billing", "checkout failed"));
    expect(output).toBe("[billing] checkout failed");
  });

  it("masks values under sensitive keys", () => {
    const output = captureError(() =>
      log.error("auth", "exchange failed", {
        access_token: "bs_sec_abcdefghijklmnop",
        userId: "user_123",
      }),
    );
    expect(output).not.toContain("bs_sec_abcdefghijklmnop");
    expect(output).toContain("[redacted");
    expect(output).toContain("user_123");
  });

  it("masks nested secrets", () => {
    const output = captureError(() =>
      log.error("api", "call failed", { headers: { authorization: "Bearer sk-live-123456789" } }),
    );
    expect(output).not.toContain("sk-live-123456789");
  });

  it("keeps errors readable without their stack", () => {
    const output = captureError(() =>
      log.error("db", "query failed", { err: new Error("connection refused") }),
    );
    expect(output).toContain("connection refused");
    expect(output).not.toContain("at ");
  });
});

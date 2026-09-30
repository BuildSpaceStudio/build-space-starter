import { BuildspaceError } from "@buildspacestudio/sdk";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mocks the SDK seam (getServerClient) and runs the real lib/billing helper,
// so these cover the promo-code path end to end on our side of the API.

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  createCheckout: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ getSession: mocks.getSession }));
vi.mock("@/lib/env", () => ({ env: { NEXT_PUBLIC_APP_URL: "https://app.test" } }));
vi.mock("@/lib/buildspace", () => ({
  getServerClient: () => ({ billing: { createCheckout: mocks.createCheckout } }),
}));

import { normalizePromoCode } from "@/lib/billing";
import { startCheckout } from "./actions";

const SESSION = { user: { id: "user_1", email: "a@b.co", name: "Ada" }, token: "tok" };

describe("startCheckout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSession.mockResolvedValue(SESSION);
  });

  it("starts checkout for the session user", async () => {
    mocks.createCheckout.mockResolvedValue({ url: "https://checkout.stripe.com/c/1" });

    const result = await startCheckout({ priceId: "price_1" });

    expect(result?.data).toEqual({ url: "https://checkout.stripe.com/c/1" });
    expect(mocks.createCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user_1",
        priceId: "price_1",
        promotionCode: undefined,
        successUrl: "https://app.test/dashboard/billing?checkout=success",
      }),
    );
  });

  it("forwards a promo code", async () => {
    mocks.createCheckout.mockResolvedValue({ url: "https://checkout.stripe.com/c/2" });

    await startCheckout({ priceId: "price_1", promotionCode: "LAUNCH20" });

    expect(mocks.createCheckout).toHaveBeenCalledWith(
      expect.objectContaining({ promotionCode: "LAUNCH20" }),
    );
  });

  it("returns a rejected promo code as a user-facing error", async () => {
    mocks.createCheckout.mockRejectedValue(
      new BuildspaceError({
        service: "billing",
        status: 400,
        code: "billing/http-400",
        message: "Promotion code not found",
      }),
    );

    const result = await startCheckout({ priceId: "price_1", promotionCode: "NOPE" });

    expect(result?.data).toEqual({
      error: "Promo code NOPE can't be used: Promotion code not found",
    });
  });

  it("rejects malformed promo codes before calling the API", async () => {
    const result = await startCheckout({ priceId: "price_1", promotionCode: "no spaces!" });

    expect(result?.validationErrors).toBeDefined();
    expect(mocks.createCheckout).not.toHaveBeenCalled();
  });
});

describe("normalizePromoCode", () => {
  it("uppercases valid codes and drops malformed ones", () => {
    expect(normalizePromoCode(" launch20 ")).toBe("LAUNCH20");
    expect(normalizePromoCode("a b")).toBeNull();
    expect(normalizePromoCode("")).toBeNull();
    expect(normalizePromoCode(undefined)).toBeNull();
  });
});

import "server-only";
import type { BillingPrice, BillingProduct, BillingStatusResponse } from "@buildspacestudio/sdk";
import { BuildspaceError } from "@buildspacestudio/sdk";
import { getServerClient } from "@/lib/buildspace";
import { log } from "@/lib/log";

// Billing helpers around the SDK's `bs.billing` namespace. Everything degrades
// gracefully: an app without billing enabled resolves to the
// "unavailable"/"disabled" states instead of crashing, so a fresh clone with
// only the two keys always renders.

export type { BillingPrice, BillingProduct } from "@buildspacestudio/sdk";

export type BillingStatus = BillingStatusResponse;

export interface BillingSubscription {
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
  id: string;
  status: string;
}

export type BillingOverview =
  | { state: "unavailable" }
  | { state: "disabled"; status: BillingStatus }
  | { state: "active"; status: BillingStatus; products: BillingProduct[]; prices: BillingPrice[] };

// One call for the billing page: status plus (when active) products and prices.
export async function getBillingOverview(): Promise<BillingOverview> {
  const billing = getServerClient().billing;

  try {
    const status = await billing.getStatus();
    if (!status.enabled || status.status !== "active") {
      return { state: "disabled", status };
    }
    const [{ products }, { prices }] = await Promise.all([
      billing.listProducts(),
      billing.listPrices(),
    ]);
    return { state: "active", status, products, prices };
  } catch (err) {
    if (err instanceof BuildspaceError) {
      log.error("billing", "overview failed", { code: err.code, status: err.status });
      return { state: "unavailable" };
    }
    throw err;
  }
}

// What customers type: codes are created with `buildspace app billing promos create`.
export const PROMO_CODE_PATTERN = /^[A-Za-z0-9_-]{3,40}$/;

// Normalizes a `?promo=` value or form input; null when absent or malformed.
export function normalizePromoCode(raw: string | null | undefined): string | null {
  const code = raw?.trim();
  return code && PROMO_CODE_PATTERN.test(code) ? code.toUpperCase() : null;
}

export type CheckoutResult = { url: string } | { error: string };

// `promotionCode` pre-applies a code (any price type). `allowPromotionCodes`
// instead shows Stripe's own code field (subscription prices only). Pass one
// or neither. A rejected code (unknown, expired, used up, wrong product) is
// returned as `{ error }` for the UI, since a thrown message would be replaced
// by next-safe-action's generic server error.
export async function createCheckout({
  userId,
  priceId,
  successUrl,
  cancelUrl,
  promotionCode,
  allowPromotionCodes,
}: {
  userId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  promotionCode?: string;
  allowPromotionCodes?: boolean;
}): Promise<CheckoutResult> {
  try {
    const { url } = await getServerClient().billing.createCheckout({
      userId,
      priceId,
      successUrl,
      cancelUrl,
      promotionCode,
      allowPromotionCodes,
    });
    return { url };
  } catch (err) {
    if (promotionCode && err instanceof BuildspaceError && err.status === 400) {
      log.warn("billing", "promotion code rejected", { status: err.status });
      return { error: `Promo code ${promotionCode} can't be used: ${err.message}` };
    }
    throw err;
  }
}

export async function createPortalSession({
  userId,
  returnUrl,
}: {
  userId: string;
  returnUrl: string;
}): Promise<{ url: string }> {
  return getServerClient().billing.createPortalSession({ userId, returnUrl });
}

export async function getSubscription({
  userId,
}: {
  userId: string;
}): Promise<BillingSubscription | null> {
  try {
    const { subscription } = await getServerClient().billing.getSubscription({ userId });
    return subscription;
  } catch (err) {
    if (err instanceof BuildspaceError) {
      log.error("billing", "subscription lookup failed", { code: err.code, status: err.status });
      return null;
    }
    throw err;
  }
}

// Gate paid features with this: `if (await hasEntitlement({ userId })) { ... }`.
// Resolves false (never throws) when billing is unavailable or the user is unpaid.
export async function hasEntitlement({ userId }: { userId: string }): Promise<boolean> {
  try {
    const { active } = await getServerClient().billing.getEntitlements({ userId });
    return active;
  } catch (err) {
    if (err instanceof BuildspaceError) {
      log.error("billing", "entitlement check failed", { code: err.code, status: err.status });
      return false;
    }
    throw err;
  }
}

export function formatPrice(price: BillingPrice): string {
  if (price.amountCents == null) return "Custom";
  const amount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: price.currency.toUpperCase(),
  }).format(price.amountCents / 100);
  return price.interval ? `${amount}/${price.interval}` : amount;
}

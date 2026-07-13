import "server-only";
import type { BillingPrice, BillingProduct, BillingStatusResponse } from "@buildspacestudio/sdk";
import { BuildspaceError } from "@buildspacestudio/sdk";
import { getServerClient } from "@/lib/buildspace";

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
      console.error(`[billing] overview failed: ${err.code} (${err.status})`);
      return { state: "unavailable" };
    }
    throw err;
  }
}

export async function createCheckout({
  userId,
  priceId,
  successUrl,
  cancelUrl,
}: {
  userId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ url: string }> {
  return getServerClient().billing.createCheckout({ userId, priceId, successUrl, cancelUrl });
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
      console.error(`[billing] subscription lookup failed: ${err.code} (${err.status})`);
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
      console.error(`[billing] entitlement check failed: ${err.code} (${err.status})`);
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

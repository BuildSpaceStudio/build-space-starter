import "server-only";
import { BuildspaceError } from "@buildspacestudio/sdk";
import { getServerClient } from "@/lib/buildspace";

// Billing helpers around the SDK's `bs.billing` namespace (added in
// @buildspacestudio/sdk 0.4.0). The types below mirror the SDK's billing types;
// once the installed SDK ships the namespace they can be replaced with direct
// imports. Everything degrades gracefully: an older SDK or an app without
// billing enabled resolves to the "unavailable"/"disabled" states instead of
// crashing, so a fresh clone with only the two keys always renders.

export interface BillingStatus {
  enabled: boolean;
  mode: "test" | "live" | null;
  status: "disabled" | "setup_required" | "active" | "paused" | null;
  testMode: boolean;
}

export interface BillingProduct {
  active: boolean;
  createdAt: string;
  description: string | null;
  id: string;
  name: string;
}

export interface BillingPrice {
  active: boolean;
  amountCents: number | null;
  createdAt: string;
  currency: string;
  id: string;
  interval: string | null;
  lookupKey: string | null;
  productId: string;
  productName: string;
  type: "one_time" | "recurring" | "metered";
}

export interface BillingSubscription {
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
  id: string;
  status: string;
}

interface BillingNamespace {
  getStatus(): Promise<BillingStatus>;
  listProducts(): Promise<{ products: BillingProduct[] }>;
  listPrices(): Promise<{ prices: BillingPrice[] }>;
  createCheckout(opts: {
    userId?: string;
    priceId?: string;
    lookupKey?: string;
    quantity?: number;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
  }): Promise<{ url: string }>;
  createPortalSession(opts: { userId?: string; returnUrl: string }): Promise<{ url: string }>;
  getSubscription(opts?: {
    userId?: string;
  }): Promise<{ subscription: BillingSubscription | null }>;
  getEntitlements(opts?: {
    userId?: string;
  }): Promise<{ active: boolean; subscription: BillingSubscription | null }>;
}

function getBillingNamespace(): BillingNamespace | null {
  const bs = getServerClient() as unknown as { billing?: BillingNamespace };
  return bs.billing ?? null;
}

export type BillingOverview =
  | { state: "unavailable" }
  | { state: "disabled"; status: BillingStatus }
  | { state: "active"; status: BillingStatus; products: BillingProduct[]; prices: BillingPrice[] };

// One call for the billing page: status plus (when active) products and prices.
export async function getBillingOverview(): Promise<BillingOverview> {
  const billing = getBillingNamespace();
  if (!billing) return { state: "unavailable" };

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
  const billing = getBillingNamespace();
  if (!billing) throw new Error("Billing is not available");
  return billing.createCheckout({ userId, priceId, successUrl, cancelUrl });
}

export async function createPortalSession({
  userId,
  returnUrl,
}: {
  userId: string;
  returnUrl: string;
}): Promise<{ url: string }> {
  const billing = getBillingNamespace();
  if (!billing) throw new Error("Billing is not available");
  return billing.createPortalSession({ userId, returnUrl });
}

export async function getSubscription({
  userId,
}: {
  userId: string;
}): Promise<BillingSubscription | null> {
  const billing = getBillingNamespace();
  if (!billing) return null;
  try {
    const { subscription } = await billing.getSubscription({ userId });
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
  const billing = getBillingNamespace();
  if (!billing) return false;
  try {
    const { active } = await billing.getEntitlements({ userId });
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

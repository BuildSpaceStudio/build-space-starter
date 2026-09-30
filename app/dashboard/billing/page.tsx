import { CreditCard, Sparkles, TicketPercent } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getSession } from "@/lib/auth";
import {
  type BillingPrice,
  formatPrice,
  getBillingOverview,
  getSubscription,
  hasEntitlement,
  normalizePromoCode,
} from "@/lib/billing";
import { CheckoutButton, ManageSubscriptionButton } from "./checkout-button";

function pricesForProduct(prices: BillingPrice[], productId: string): BillingPrice[] {
  return prices.filter((price) => price.productId === productId && price.active);
}

// Promo codes arrive as `?promo=CODE` (campaign links) or through the form
// below, which submits back to this page as a GET. The code rides along on
// every checkout button; Stripe validates it when checkout starts.
function PromoCodeCard({ promo, invalid }: { promo: string | null; invalid: boolean }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm">
          <TicketPercent className="h-4 w-4 text-primary" />
          {promo ? (
            <span>
              Code <span className="font-medium text-foreground">{promo}</span> will be applied at
              checkout.
            </span>
          ) : (
            <span className="text-muted-foreground">
              {invalid ? "That doesn't look like a promo code." : "Have a promo code?"}
            </span>
          )}
        </div>
        {promo ? (
          <Button asChild variant="ghost" size="sm" className="self-start sm:self-auto">
            <Link href="/dashboard/billing">Remove</Link>
          </Button>
        ) : (
          <form action="/dashboard/billing" className="flex gap-2">
            <Input
              name="promo"
              placeholder="LAUNCH20"
              maxLength={40}
              aria-label="Promo code"
              className="h-8 w-40 uppercase"
            />
            <Button type="submit" variant="outline" size="sm">
              Apply
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ promo?: string | string[] }>;
}) {
  const session = await getSession();
  if (!session) redirect("/");

  const { promo: rawPromo } = await searchParams;
  const promoParam = typeof rawPromo === "string" ? rawPromo : undefined;
  const promo = normalizePromoCode(promoParam);

  const overview = await getBillingOverview();

  if (overview.state !== "active") {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Billing" description="Subscriptions and paid features." />
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon={CreditCard}
              title="Billing isn't enabled yet"
              description="Connect Stripe for this app in Creator Studio to sell subscriptions. This page lights up automatically once billing is active."
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  const [subscription, entitled] = await Promise.all([
    getSubscription({ userId: session.user.id }),
    hasEntitlement({ userId: session.user.id }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Billing"
        description="Subscriptions and paid features."
        actions={subscription ? <ManageSubscriptionButton /> : undefined}
      />

      {overview.status.testMode && (
        <div className="rounded-lg border border-dashed bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Test mode.</span> Payments use Stripe test
          cards — no real charges.
        </div>
      )}

      <PromoCodeCard promo={promo} invalid={Boolean(promoParam?.trim()) && !promo} />

      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              Current subscription
              <Badge variant={subscription.status === "active" ? "default" : "secondary"}>
                {subscription.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {subscription.cancelAtPeriodEnd
              ? "Cancels at the end of the current period"
              : subscription.currentPeriodEnd
                ? `Renews ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                : "Active"}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {overview.products
          .filter((product) => product.active)
          .map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <CardTitle className="text-base">{product.name}</CardTitle>
                {product.description && (
                  <p className="text-sm text-muted-foreground">{product.description}</p>
                )}
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {pricesForProduct(overview.prices, product.id).map((price) => (
                  <div key={price.id} className="flex flex-col gap-2">
                    <p className="text-2xl font-semibold">{formatPrice(price)}</p>
                    <CheckoutButton
                      priceId={price.id}
                      label={`Subscribe to ${product.name}`}
                      promotionCode={promo ?? undefined}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Entitlement gating example: render (or hide) paid features off hasEntitlement(). */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" />
            Pro features
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {entitled
            ? "Your plan is active — pro features are unlocked."
            : "Subscribe to unlock pro features. This block is gated with hasEntitlement() in lib/billing.ts."}
        </CardContent>
      </Card>
    </div>
  );
}

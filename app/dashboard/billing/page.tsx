import { CreditCard, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/auth";
import {
  type BillingPrice,
  formatPrice,
  getBillingOverview,
  getSubscription,
  hasEntitlement,
} from "@/lib/billing";
import { CheckoutButton, ManageSubscriptionButton } from "./checkout-button";

function pricesForProduct(prices: BillingPrice[], productId: string): BillingPrice[] {
  return prices.filter((price) => price.productId === productId && price.active);
}

export default async function BillingPage() {
  const session = await getSession();
  if (!session) redirect("/");

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
                    <CheckoutButton priceId={price.id} label={`Subscribe to ${product.name}`} />
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

"use client";

import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { openBillingPortal, startCheckout } from "./actions";

export function CheckoutButton({ priceId, label }: { priceId: string; label: string }) {
  const { execute, isPending } = useAction(startCheckout, {
    onSuccess: ({ data }) => {
      if (data?.url) window.location.href = data.url;
    },
    onError: ({ error }) => toast.error(error.serverError ?? "Failed to start checkout"),
  });

  return (
    <Button className="w-full" disabled={isPending} onClick={() => execute({ priceId })}>
      {isPending ? "Redirecting…" : label}
    </Button>
  );
}

export function ManageSubscriptionButton() {
  const { execute, isPending } = useAction(openBillingPortal, {
    onSuccess: ({ data }) => {
      if (data?.url) window.location.href = data.url;
    },
    onError: ({ error }) => toast.error(error.serverError ?? "Failed to open the billing portal"),
  });

  return (
    <Button variant="outline" disabled={isPending} onClick={() => execute()}>
      {isPending ? "Redirecting…" : "Manage subscription"}
    </Button>
  );
}

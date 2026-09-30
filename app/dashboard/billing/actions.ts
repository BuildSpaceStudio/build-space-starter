"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { createCheckout, createPortalSession, PROMO_CODE_PATTERN } from "@/lib/billing";
import { env } from "@/lib/env";
import { authActionClient } from "@/lib/safe-action";

// Redirect URLs must be absolute. Prefer NEXT_PUBLIC_APP_URL; fall back to the
// request origin so local dev works without extra config.
async function getAppOrigin(): Promise<string> {
  if (env.NEXT_PUBLIC_APP_URL) return env.NEXT_PUBLIC_APP_URL;
  const origin = (await headers()).get("origin");
  if (!origin) throw new Error("Set NEXT_PUBLIC_APP_URL to use billing redirects");
  return origin;
}

// Server-side checkout is the blessed integration: the session user is bound
// to the Stripe session here, so billing state lands on the right identity.
// `promotionCode` comes from a `?promo=` link or the page's "Have a promo
// code?" form. Stripe validates it; for codes meant only for certain users,
// decide on the server who gets one instead of accepting it from the client.
export const startCheckout = authActionClient
  .inputSchema(
    z.object({
      priceId: z.string().min(1).max(128),
      promotionCode: z.string().trim().max(40).regex(PROMO_CODE_PATTERN).optional(),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const origin = await getAppOrigin();
    return createCheckout({
      userId: ctx.session.user.id,
      priceId: parsedInput.priceId,
      promotionCode: parsedInput.promotionCode,
      successUrl: `${origin}/dashboard/billing?checkout=success`,
      cancelUrl: `${origin}/dashboard/billing?checkout=cancelled`,
    });
  });

export const openBillingPortal = authActionClient.action(async ({ ctx }) => {
  const origin = await getAppOrigin();
  const { url } = await createPortalSession({
    userId: ctx.session.user.id,
    returnUrl: `${origin}/dashboard/billing`,
  });
  return { url };
});

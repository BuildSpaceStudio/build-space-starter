import { BuildspaceError } from "@buildspacestudio/sdk";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { trackEvent } from "@/lib/analytics";
import { getServerClient } from "@/lib/buildspace";
import { upsertUserFromSession } from "@/lib/db/users";
import { sendWelcomeEmail } from "@/lib/email";

// Railway's edge proxy terminates TLS and forwards to this container over its
// internal address, so `request.nextUrl.origin`/`request.url` resolve to
// something like `http://0.0.0.0:8080` rather than the public domain — the
// forwarded headers carry the real one. Every redirect below (the OAuth
// `redirect_uri` and the browser-facing response) has to use this, not the
// raw request URL, or it sends the auth service — and the visitor — to an
// address only reachable from inside the container.
function resolvePublicOrigin(request: NextRequest): string {
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }
  return request.nextUrl.origin;
}

// Handles the OAuth callback from BuildSpace login.
// Exchanges the authorization code for an access token and stores it in a cookie.
export async function GET(request: NextRequest) {
  const bs = getServerClient();
  const origin = resolvePublicOrigin(request);

  let access_token: string;
  let expires_in: number;
  let user: { id: string; email: string; name: string | null };
  try {
    ({ access_token, expires_in, user } = await bs.auth.handleCallback(request.url, {
      redirectUri: `${origin}/api/auth/callback`,
    }));
  } catch (err) {
    // The code is single-use and short-lived — a replayed callback URL (page
    // refresh, browser back button, a link opened twice) hits this on every
    // normal app, not just a misconfiguration. Send the visitor back to sign
    // in again instead of a 500.
    if (err instanceof BuildspaceError) {
      console.error("[auth] callback code exchange failed", err);
      return NextResponse.redirect(new URL("/?auth_error=1", origin));
    }
    throw err;
  }

  // Mirror BuildSpace identity into the local users table. First sign-in is the
  // one place for signup side effects (welcome email, signup event). Local-DB
  // failures are logged, never allowed to break login.
  try {
    const { isNewUser } = await upsertUserFromSession({
      buildspaceUserId: user.id,
      email: user.email,
      name: user.name,
    });
    if (isNewUser) {
      await trackEvent({ event: "user_signed_up", userId: user.id });
      await sendWelcomeEmail({ to: user.email, name: user.name });
    }
  } catch (err) {
    console.error("[auth] user upsert failed", err);
  }

  const jar = await cookies();
  jar.set("bs_session", access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: expires_in,
    path: "/",
  });

  return NextResponse.redirect(new URL("/dashboard", origin));
}

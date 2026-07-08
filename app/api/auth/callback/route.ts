import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { trackEvent } from "@/lib/analytics";
import { getServerClient } from "@/lib/buildspace";
import { upsertUserFromSession } from "@/lib/db/users";
import { sendWelcomeEmail } from "@/lib/email";

// Handles the OAuth callback from BuildSpace login.
// Exchanges the authorization code for an access token and stores it in a cookie.
export async function GET(request: NextRequest) {
  const bs = getServerClient();

  const { access_token, expires_in, user } = await bs.auth.handleCallback(request.url, {
    redirectUri: `${request.nextUrl.origin}/api/auth/callback`,
  });

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

  return NextResponse.redirect(new URL("/dashboard", request.url));
}

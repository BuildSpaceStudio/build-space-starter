import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/buildspace";

// Handles the OAuth callback from BuildSpace login.
// Exchanges the authorization code for an access token and stores it in a cookie.
export async function GET(request: NextRequest) {
  const bs = getServerClient();

  const { access_token, expires_in } = await bs.auth.handleCallback(request.url, {
    redirectUri: `${request.nextUrl.origin}/api/auth/callback`,
  });

  const jar = await cookies();
  jar.set("bs_session", access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: expires_in,
    path: "/",
  });

  return NextResponse.redirect(new URL("/", request.url));
}

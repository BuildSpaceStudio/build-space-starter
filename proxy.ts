import { NextResponse } from "next/server";

export function proxy(request: Request) {
  const url = new URL(request.url);
  const cookie = request.headers.get("cookie") ?? "";
  const hasSession = cookie.includes("bs_session=");

  if (!hasSession) {
    // Railway's edge proxy forwards to this container over its internal
    // address, so `request.url`'s origin can be `http://0.0.0.0:8080`
    // instead of the public domain — use the forwarded headers when present.
    const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
    const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
    const origin =
      forwardedProto && forwardedHost ? `${forwardedProto}://${forwardedHost}` : url.origin;
    return NextResponse.redirect(new URL("/", origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};

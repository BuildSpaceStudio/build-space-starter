import { NextResponse } from "next/server";

export function proxy(request: Request) {
  const url = new URL(request.url);
  const cookie = request.headers.get("cookie") ?? "";
  const hasSession = cookie.includes("bs_session=");

  if (!hasSession) {
    return NextResponse.redirect(new URL("/", url.origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};

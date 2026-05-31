import { type NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = pathname.startsWith("/dashboard");

  if (isProtected) {
    const sessionCookie = request.cookies.get("bs_session");
    if (!sessionCookie?.value) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.searchParams.set("auth", "required");
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};

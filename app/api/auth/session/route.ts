import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getServerClient } from "@/lib/buildspace";

// Returns the current user session, or null if not authenticated.
export async function GET() {
  const jar = await cookies();
  const token = jar.get("bs_session")?.value;
  if (!token) {
    return NextResponse.json({ session: null });
  }

  const bs = getServerClient();
  const session = await bs.auth.getSession(token);
  return NextResponse.json({ session });
}

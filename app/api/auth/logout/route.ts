import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getServerClient } from "@/lib/buildspace";

// Revokes the session and clears the session cookie.
export async function POST() {
  const jar = await cookies();
  const token = jar.get("bs_session")?.value;

  if (token) {
    const bs = getServerClient();
    await bs.auth.revokeSession(token);
  }

  jar.delete("bs_session");
  return NextResponse.json({ ok: true });
}

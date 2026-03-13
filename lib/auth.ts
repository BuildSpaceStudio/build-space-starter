import { cookies } from "next/headers";
import { getServerClient } from "@/lib/buildspace";

export async function getSession() {
  const jar = await cookies();
  const token = jar.get("bs_session")?.value;
  if (!token) return null;
  try {
    const bs = getServerClient();
    const session = await bs.auth.getSession(token);
    return session ? { ...session, token } : null;
  } catch {
    return null;
  }
}

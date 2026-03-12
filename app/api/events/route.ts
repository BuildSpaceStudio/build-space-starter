import { type NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/buildspace";

// Server-side event tracking endpoint.
// Client components can POST events here when server-side tracking is preferred.
export async function POST(request: NextRequest) {
  const { event, properties, actorId } = await request.json();

  const bs = getServerClient();
  const result = await bs.events.track(event, properties, actorId);

  return NextResponse.json(result);
}

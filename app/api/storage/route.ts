import { type NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/buildspace";

// Lists stored objects. Optionally filter by prefix via ?prefix=some/path
export async function GET(request: NextRequest) {
  const prefix = request.nextUrl.searchParams.get("prefix") ?? undefined;
  const bs = getServerClient();
  const result = await bs.storage.list(prefix);
  return NextResponse.json(result);
}

// Generates a presigned upload URL for server-mediated uploads.
export async function POST(request: NextRequest) {
  const { key, contentType, size } = await request.json();

  const bs = getServerClient();
  const result = await bs.storage.getUploadUrl({ key, contentType, size });

  return NextResponse.json(result);
}

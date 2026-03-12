import { type NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/buildspace";

// Sends a notification email. Notifications are server-only.
export async function POST(request: NextRequest) {
  const body = await request.json();
  const bs = getServerClient();

  // Support both direct send and template-based send
  if (body.templateSlug) {
    const { templateSlug, to, variables, metadata } = body;
    const result = await bs.notifications.sendTemplate(templateSlug, { to, variables, metadata });
    return NextResponse.json(result);
  }

  const { to, subject, html, text, replyTo, metadata } = body;
  const result = await bs.notifications.send({ to, subject, html, text, replyTo, metadata });
  return NextResponse.json(result);
}

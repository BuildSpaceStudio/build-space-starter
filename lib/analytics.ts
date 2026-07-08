import "server-only";
import { BuildspaceError } from "@buildspacestudio/sdk";
import { getServerClient } from "@/lib/buildspace";

// Server-side event tracking. Analytics must never break the app: failures are
// logged and swallowed, so callers can `await trackEvent(...)` without a try/catch.
// For client components, track directly via getBrowserClient().events (batched).
export async function trackEvent({
  event,
  properties,
  userId,
}: {
  event: string;
  properties?: Record<string, unknown>;
  userId?: string;
}): Promise<void> {
  try {
    const bs = getServerClient();
    await bs.events.track(event, properties ?? {}, userId);
  } catch (err) {
    if (err instanceof BuildspaceError) {
      console.error(`[analytics] "${event}" failed: ${err.code} (${err.status})`);
      return;
    }
    console.error(`[analytics] "${event}" failed`, err);
  }
}

import "server-only";
import { BuildspaceError } from "@buildspacestudio/sdk";
import { getServerClient } from "@/lib/buildspace";

// Transactional email lives here: one exported function per message type, each
// with a small inline HTML template. Emails are best-effort — failures are
// logged, never thrown, so a mail outage can't break sign-in or checkout.

export async function sendWelcomeEmail({
  to,
  name,
}: {
  to: string;
  name: string | null;
}): Promise<void> {
  const greeting = name ? `Hi ${name},` : "Hi,";
  try {
    const bs = getServerClient();
    await bs.notifications.send({
      to,
      subject: "Welcome to your new app",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h1 style="font-size: 20px;">Welcome!</h1>
          <p>${greeting}</p>
          <p>Your account is ready. Head to your dashboard to get started.</p>
        </div>
      `.trim(),
      text: `${greeting}\n\nYour account is ready. Head to your dashboard to get started.`,
    });
  } catch (err) {
    if (err instanceof BuildspaceError) {
      console.error(`[email] welcome email failed: ${err.code} (${err.status})`);
      return;
    }
    console.error("[email] welcome email failed", err);
  }
}

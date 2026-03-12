"use client";

import { useCallback, useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/buildspace-client";

interface AuthSession {
  user: { id: string; email: string; name: string | null };
  appId: string | null;
}

export default function ExamplesPage() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [eventStatus, setEventStatus] = useState<string | null>(null);
  const [files, setFiles] = useState<{ key: string; size: number }[]>([]);
  const [notifStatus, setNotifStatus] = useState<string | null>(null);

  // Fetch session on mount
  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => setSession(data.session))
      .finally(() => setLoading(false));
  }, []);

  // --- Auth helpers ---
  const handleSignIn = useCallback(() => {
    try {
      const bs = getBrowserClient();
      const url = bs.auth.getSignInUrl({
        redirectUri: `${window.location.origin}/api/auth/callback`,
      });
      window.location.href = url;
    } catch {
      setEventStatus("Set NEXT_PUBLIC_BUILDSPACE_PUBLISHABLE_KEY to enable auth");
    }
  }, []);

  const handleSignUp = useCallback(() => {
    try {
      const bs = getBrowserClient();
      const url = bs.auth.getSignUpUrl({
        redirectUri: `${window.location.origin}/api/auth/callback`,
      });
      window.location.href = url;
    } catch {
      setEventStatus("Set NEXT_PUBLIC_BUILDSPACE_PUBLISHABLE_KEY to enable auth");
    }
  }, []);

  const handleLogout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setSession(null);
  }, []);

  // --- Events ---
  const trackClientEvent = useCallback(() => {
    try {
      const bs = getBrowserClient();
      bs.events.track("button_clicked", { page: "examples", source: "client" });
      setEventStatus("Client event queued (auto-flushes)");
    } catch {
      setEventStatus("Set NEXT_PUBLIC_BUILDSPACE_PUBLISHABLE_KEY to enable events");
    }
  }, []);

  const trackServerEvent = useCallback(async () => {
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "button_clicked",
        properties: { page: "examples", source: "server" },
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setEventStatus(`Server event tracked: ${data.event_id}`);
    } else {
      setEventStatus("Set BUILDSPACE_SECRET_KEY to enable server events");
    }
  }, []);

  // --- Storage ---
  const refreshFiles = useCallback(async () => {
    const res = await fetch("/api/storage?prefix=uploads/");
    if (res.ok) {
      const data = await res.json();
      setFiles(data.objects ?? []);
    }
  }, []);

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const bs = getBrowserClient();
        await bs.storage.upload(file, { path: `uploads/${file.name}` });
        refreshFiles();
      } catch {
        setEventStatus("Set NEXT_PUBLIC_BUILDSPACE_PUBLISHABLE_KEY to enable storage");
      }
    },
    [refreshFiles],
  );

  // --- Notifications ---
  const sendNotification = useCallback(async () => {
    const res = await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: "test@example.com",
        subject: "Hello from BuildSpace",
        html: "<h1>It works!</h1><p>Sent via the BuildSpace SDK.</p>",
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setNotifStatus(`Sent! ID: ${data.id}`);
    } else {
      setNotifStatus("Set BUILDSPACE_SECRET_KEY to enable notifications");
    }
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-20 text-slate-100">
      <div className="mx-auto max-w-3xl">
        <a href="/" className="font-sans text-sky-300 text-sm hover:underline">
          &larr; Home
        </a>
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          SDK Examples
        </h1>
        <p className="mt-4 font-sans text-slate-400 text-sm leading-relaxed">
          Interactive examples for every BuildSpace SDK feature. Set your keys in{" "}
          <code className="rounded bg-slate-800 px-1 text-sky-300 font-mono">.env.local</code> to
          try them live.
        </p>

        {/* ─── Authentication ─── */}
        <section className="mt-10">
          <h2 className="font-sans text-lg font-medium text-slate-200">Authentication</h2>
          <p className="mt-1 font-sans text-slate-400 text-sm">
            Sign in / sign up via BuildSpace, session stored in an HTTP-only cookie.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {loading ? (
              <p className="text-slate-500 text-sm">Loading session…</p>
            ) : session ? (
              <>
                <span className="rounded bg-emerald-900/40 px-3 py-1.5 text-emerald-300 text-sm">
                  Signed in as {session.user.email}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded bg-slate-800 px-3 py-1.5 text-slate-200 text-sm hover:bg-slate-700"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleSignIn}
                  className="rounded bg-sky-600 px-3 py-1.5 text-white text-sm hover:bg-sky-500"
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={handleSignUp}
                  className="rounded bg-slate-800 px-3 py-1.5 text-slate-200 text-sm hover:bg-slate-700"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </section>

        {/* ─── Event Tracking ─── */}
        <section className="mt-10">
          <h2 className="font-sans text-lg font-medium text-slate-200">Event Tracking</h2>
          <p className="mt-1 font-sans text-slate-400 text-sm">
            Track events from the browser (batched) or server (immediate).
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={trackClientEvent}
              className="rounded bg-sky-600 px-3 py-1.5 text-white text-sm hover:bg-sky-500"
            >
              Track (client)
            </button>
            <button
              type="button"
              onClick={trackServerEvent}
              className="rounded bg-slate-800 px-3 py-1.5 text-slate-200 text-sm hover:bg-slate-700"
            >
              Track (server)
            </button>
          </div>
          {eventStatus && <p className="mt-3 font-mono text-emerald-300 text-xs">{eventStatus}</p>}
        </section>

        {/* ─── Storage ─── */}
        <section className="mt-10">
          <h2 className="font-sans text-lg font-medium text-slate-200">Storage</h2>
          <p className="mt-1 font-sans text-slate-400 text-sm">
            Upload files from the browser. List stored objects via the server.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className="cursor-pointer rounded bg-sky-600 px-3 py-1.5 text-white text-sm hover:bg-sky-500">
              Upload file
              <input type="file" className="hidden" onChange={handleUpload} />
            </label>
            <button
              type="button"
              onClick={refreshFiles}
              className="rounded bg-slate-800 px-3 py-1.5 text-slate-200 text-sm hover:bg-slate-700"
            >
              Refresh list
            </button>
          </div>
          {files.length > 0 && (
            <ul className="mt-3 space-y-1 font-mono text-xs text-slate-400">
              {files.map((f) => (
                <li key={f.key}>
                  {f.key} ({f.size} bytes)
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ─── Notifications ─── */}
        <section className="mt-10">
          <h2 className="font-sans text-lg font-medium text-slate-200">Notifications</h2>
          <p className="mt-1 font-sans text-slate-400 text-sm">
            Send transactional emails from the server. Notifications are server-only.
          </p>
          <div className="mt-4">
            <button
              type="button"
              onClick={sendNotification}
              className="rounded bg-sky-600 px-3 py-1.5 text-white text-sm hover:bg-sky-500"
            >
              Send test email
            </button>
          </div>
          {notifStatus && <p className="mt-3 font-mono text-emerald-300 text-xs">{notifStatus}</p>}
        </section>
      </div>
    </main>
  );
}

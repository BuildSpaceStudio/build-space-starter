import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-20 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <p className="font-sans text-sm uppercase tracking-[0.2em] text-sky-600 dark:text-sky-300">
            BuildSpace Starter
          </p>
          <ThemeToggle />
        </div>

        <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Build your app from a clean Next.js baseline
        </h1>
        <p className="mt-6 max-w-2xl font-sans leading-relaxed text-slate-600 dark:text-slate-300">
          This repository is the canonical starter for new BuildSpace apps. It includes the{" "}
          <code className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-sm text-sky-600 dark:bg-slate-800 dark:text-sky-300">
            @buildspacestudio/sdk
          </code>{" "}
          with working examples for authentication, event tracking, storage, and notifications.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white/60 p-5 dark:border-slate-800 dark:bg-slate-900/60">
            <p className="font-sans text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
              Develop
            </p>
            <p className="mt-2 font-sans text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              Run locally with{" "}
              <code className="rounded bg-slate-200 px-1 font-mono text-sky-600 dark:bg-slate-800 dark:text-sky-300">
                bun dev
              </code>
              .
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white/60 p-5 dark:border-slate-800 dark:bg-slate-900/60">
            <p className="font-sans text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
              Deploy
            </p>
            <p className="mt-2 font-sans text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              Push to{" "}
              <code className="rounded bg-slate-200 px-1 font-mono text-sky-600 dark:bg-slate-800 dark:text-sky-300">
                main
              </code>
              , then run{" "}
              <code className="rounded bg-slate-200 px-1 font-mono text-sky-600 dark:bg-slate-800 dark:text-sky-300">
                buildspace deploy
              </code>
              .
            </p>
          </div>
        </div>

        <h2 className="mt-14 font-sans text-sm font-medium uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
          SDK Features
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white/60 p-5 dark:border-slate-800 dark:bg-slate-900/60">
            <p className="font-sans text-sm font-medium text-sky-600 dark:text-sky-300">
              Authentication
            </p>
            <p className="mt-2 font-sans text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Sign in &amp; sign up flows with session management via HTTP-only cookies.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white/60 p-5 dark:border-slate-800 dark:bg-slate-900/60">
            <p className="font-sans text-sm font-medium text-sky-600 dark:text-sky-300">
              Event Tracking
            </p>
            <p className="mt-2 font-sans text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Client-side batched tracking and server-side immediate event ingestion.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white/60 p-5 dark:border-slate-800 dark:bg-slate-900/60">
            <p className="font-sans text-sm font-medium text-sky-600 dark:text-sky-300">Storage</p>
            <p className="mt-2 font-sans text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Browser uploads via presigned URLs. Server-side listing, signed URLs, and usage
              metrics.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white/60 p-5 dark:border-slate-800 dark:bg-slate-900/60">
            <p className="font-sans text-sm font-medium text-sky-600 dark:text-sky-300">
              Notifications
            </p>
            <p className="mt-2 font-sans text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Transactional email dispatch with direct HTML or template-based sending.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <a
            href="/examples"
            className="inline-block rounded-lg bg-sky-600 px-5 py-2.5 font-sans text-sm font-medium text-white hover:bg-sky-500"
          >
            View live examples &rarr;
          </a>
          <a
            href="https://creator.buildspace.studio"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-sans text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Creator Dashboard
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h5a.75.75 0 0 1 0 1.5h-5Zm7.25-.75a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0V6.31l-5.47 5.47a.75.75 0 1 1-1.06-1.06l5.47-5.47H12.25a.75.75 0 0 1-.75-.75Z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        </div>
      </div>
    </main>
  );
}

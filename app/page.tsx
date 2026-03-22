import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

const docLinks = [
  { href: "https://docs.buildspace.studio/docs", label: "BuildSpace Documentation" },
] as const;

function ExternalLinkIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4 shrink-0 opacity-70"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h5a.75.75 0 0 1 0 1.5h-5Zm7.25-.75a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0V6.31l-5.47 5.47a.75.75 0 1 1-1.06-1.06l5.47-5.47H12.25a.75.75 0 0 1-.75-.75Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-20 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <p className="font-sans text-sm uppercase tracking-[0.2em] text-sky-600 dark:text-sky-300">
            BuildSpace
          </p>
          <ThemeToggle />
        </div>

        <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          This is your Buildspace app!
        </h1>
        <p className="mt-4 max-w-xl font-sans text-slate-600 dark:text-slate-300">
          Start building here—everything else lives in the docs.
        </p>

        <ul className="mt-10 flex flex-col gap-3">
          {docLinks.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-sans text-sm font-medium text-sky-600 underline-offset-4 transition-colors hover:text-sky-500 hover:underline dark:text-sky-300 dark:hover:text-sky-200"
              >
                {label}
                <ExternalLinkIcon />
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-10">
          <Link
            href="https://creator.buildspace.studio"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-sans text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Creator Dashboard
            <ExternalLinkIcon />
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-20 text-slate-100">
      <div className="mx-auto max-w-3xl">
        <p className="font-sans text-sky-300 text-sm uppercase tracking-[0.2em]">BuildSpace Starter</p>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Build your app from a clean Next.js baseline
        </h1>
        <p className="mt-6 max-w-2xl font-sans text-slate-300 leading-relaxed">
          This repository is the canonical starter for new BuildSpace apps. Edit this page, commit,
          push, and deploy with <code className="rounded bg-slate-800 px-1.5 py-0.5 text-sky-300 text-sm font-mono">buildspace deploy</code>.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="font-sans text-slate-400 text-xs uppercase tracking-[0.16em]">Develop</p>
            <p className="mt-2 font-sans text-slate-200 text-sm leading-relaxed">Run locally with <code className="rounded bg-slate-800 px-1 text-sky-300 font-mono">bun dev</code>.</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="font-sans text-slate-400 text-xs uppercase tracking-[0.16em]">Deploy</p>
            <p className="mt-2 font-sans text-slate-200 text-sm leading-relaxed">
              Push to <code className="rounded bg-slate-800 px-1 text-sky-300 font-mono">main</code>, then run <code className="rounded bg-slate-800 px-1 text-sky-300 font-mono">buildspace deploy</code>.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-20 text-slate-100">
      <div className="mx-auto max-w-3xl">
        <p className="text-sky-300 text-sm uppercase tracking-[0.2em]">BuildSpace Starter</p>
        <h1 className="mt-4 font-semibold text-4xl tracking-tight sm:text-5xl">
          Build your app from a clean Next.js baseline
        </h1>
        <p className="mt-6 max-w-2xl text-slate-300">
          This repository is the canonical starter for new BuildSpace apps. Edit this page, commit,
          push, and deploy with <code>buildspace deploy</code>.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-slate-400 text-xs uppercase tracking-[0.16em]">Develop</p>
            <p className="mt-2 text-slate-200 text-sm">Run locally with `bun dev`.</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-slate-400 text-xs uppercase tracking-[0.16em]">Deploy</p>
            <p className="mt-2 text-slate-200 text-sm">
              Push to `main`, then run `buildspace deploy`.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

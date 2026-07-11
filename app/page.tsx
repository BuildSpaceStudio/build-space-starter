import { ArrowRight, CreditCard, FolderOpen, ListTodo, Settings, Shield } from "lucide-react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const slices = [
  {
    icon: ListTodo,
    title: "Todos",
    description: "The vertical-slice pattern: schema, safe action, server component, toasts.",
    accent: "mint",
  },
  {
    icon: FolderOpen,
    title: "Files",
    description: "Browser uploads and server-signed downloads with BuildSpace storage.",
    accent: "sky",
  },
  {
    icon: CreditCard,
    title: "Billing",
    description: "Stripe checkout, customer portal, and entitlement gating via the SDK.",
    accent: "peach",
  },
  {
    icon: Settings,
    title: "Settings",
    description: "Profile form and avatar upload against the local users table.",
    accent: "butter",
  },
  {
    icon: Shield,
    title: "Admin",
    description: "Role-gated pages and actions with the adminActionClient tier.",
    accent: "lilac",
  },
] as const;

const accentTiles = {
  mint: "bg-mint-bg text-mint-text",
  sky: "bg-sky-bg text-sky-text",
  peach: "bg-peach-bg text-peach-text",
  butter: "bg-butter-bg text-butter-text",
  lilac: "bg-lilac-bg text-lilac-text",
} as const;

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 font-mono text-[0.6875rem] uppercase tracking-wide text-muted-foreground">
            BuildSpace
          </span>
          <h1 className="mt-4 font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
            This is your <span className="italic text-peach-text">BuildSpace</span> app!
          </h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Every platform capability — auth, database, events, storage, email, and billing — has
            one working example inside. Extend a slice, or delete the ones you don't need.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/dashboard">
                Open the dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link
                href="https://docs.buildspace.studio/docs"
                target="_blank"
                rel="noopener noreferrer"
              >
                Documentation
              </Link>
            </Button>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2">
            {slices.map(({ icon: Icon, title, description, accent }) => (
              <Card key={title}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-3 text-base">
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${accentTiles[accent]}`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    {title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

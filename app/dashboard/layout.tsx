import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard-nav";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth";

// proxy.ts already bounces requests without a session cookie; this layout does
// the full session validation and loads the local role for the nav.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const current = await getCurrentUser();
  if (!current) redirect("/");

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-8 md:flex-row">
        <aside className="md:w-48 md:shrink-0">
          <DashboardNav isAdmin={current.role === "super_admin"} />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

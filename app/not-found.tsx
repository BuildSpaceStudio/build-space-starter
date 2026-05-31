import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">404</p>
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <Button asChild variant="outline">
        <Link href="/">Go home</Link>
      </Button>
    </main>
  );
}

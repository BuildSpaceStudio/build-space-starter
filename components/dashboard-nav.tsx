"use client";

import { CreditCard, FolderOpen, ListTodo, Settings, Shield } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard/todos", label: "Todos", icon: ListTodo },
  { href: "/dashboard/files", label: "Files", icon: FolderOpen },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;

const adminItem = { href: "/dashboard/admin", label: "Admin", icon: Shield } as const;

// Sidebar nav for the dashboard. New slices get one entry here — nothing else.
// The Admin entry is hidden for non-admins; the page re-checks server-side.
export function DashboardNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const navItems = isAdmin ? [...items, adminItem] : [...items];

  return (
    <nav className="flex gap-1 md:flex-col">
      {navItems.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors",
            pathname.startsWith(href)
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-background-2 hover:text-foreground",
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </nav>
  );
}

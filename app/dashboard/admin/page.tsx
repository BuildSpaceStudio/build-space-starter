import { desc } from "drizzle-orm";
import { Users } from "lucide-react";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCurrentUser } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { RoleSelect } from "./role-select";

// Role-gated page: the nav hides this entry for members, but the page itself
// re-checks server-side — never trust the client for authorization.
export default async function AdminPage() {
  const current = await getCurrentUser();
  if (!current) redirect("/");
  if (current.role !== "super_admin") redirect("/dashboard");

  const users = await db.select().from(schema.users).orderBy(desc(schema.users.createdAt));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Admin"
        description="Local user records mirrored from BuildSpace sign-ins."
      />
      <Card>
        <CardContent className="pt-6">
          {users.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No users yet"
              description="Rows appear here after the first sign-in."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Marketing</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.name ?? "—"}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.marketingOptIn ? (
                        <Badge variant="secondary">Opted in</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">No</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <RoleSelect
                        userId={user.id}
                        role={user.role}
                        disabled={user.id === current.record?.id}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

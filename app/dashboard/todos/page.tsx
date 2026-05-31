import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TodoForm } from "./todo-form";
import { TodoItem } from "./todo-item";

export default async function TodosPage() {
  const session = await getSession();
  if (!session) redirect("/");

  const todos = await db
    .select()
    .from(schema.todos)
    .where(eq(schema.todos.userId, session.user.id))
    .orderBy(desc(schema.todos.createdAt));

  return (
    <main className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle>Todos</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <TodoForm />
            <div className="flex flex-col gap-2">
              {todos.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No todos yet. Add one above.
                </p>
              )}
              {todos.map((todo) => (
                <TodoItem key={todo.id} todo={todo} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

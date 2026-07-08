import { desc, eq } from "drizzle-orm";
import { ListTodo } from "lucide-react";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { getSession } from "@/lib/auth";
import { db, schema } from "@/lib/db";
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
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Todos"
        description="The canonical vertical slice — copy this shape for new features."
      />
      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <TodoForm />
          {todos.length === 0 ? (
            <EmptyState
              icon={ListTodo}
              title="No todos yet"
              description="Add one above to see the full action → revalidate → toast loop."
            />
          ) : (
            <div className="flex flex-col gap-2">
              {todos.map((todo) => (
                <TodoItem key={todo.id} todo={todo} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { authActionClient } from "@/lib/safe-action";
import { db, schema } from "@/lib/db";
import { getServerClient } from "@/lib/buildspace";

export const createTodo = authActionClient
  .inputSchema(z.object({ text: z.string().min(1).max(500) }))
  .action(async ({ parsedInput, ctx }) => {
    const [todo] = await db
      .insert(schema.todos)
      .values({ text: parsedInput.text, userId: ctx.session.user.id })
      .returning();

    const bs = getServerClient();
    await bs.events.track("todo_created", { todoId: todo.id }, ctx.session.user.id);

    revalidatePath("/dashboard/todos");
    return { todo };
  });

export const toggleTodo = authActionClient
  .inputSchema(z.object({ id: z.string(), completed: z.boolean() }))
  .action(async ({ parsedInput }) => {
    await db
      .update(schema.todos)
      .set({ completed: parsedInput.completed })
      .where(eq(schema.todos.id, parsedInput.id));
    revalidatePath("/dashboard/todos");
  });

export const deleteTodo = authActionClient
  .inputSchema(z.object({ id: z.string() }))
  .action(async ({ parsedInput }) => {
    await db.delete(schema.todos).where(eq(schema.todos.id, parsedInput.id));
    revalidatePath("/dashboard/todos");
  });

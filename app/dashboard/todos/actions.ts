"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { trackEvent } from "@/lib/analytics";
import { db, schema } from "@/lib/db";
import { authActionClient } from "@/lib/safe-action";

export const createTodo = authActionClient
  .inputSchema(z.object({ text: z.string().min(1).max(500) }))
  .action(async ({ parsedInput, ctx }) => {
    const [todo] = await db
      .insert(schema.todos)
      .values({ text: parsedInput.text, userId: ctx.session.user.id })
      .returning();

    await trackEvent({
      event: "todo_created",
      properties: { todoId: todo.id },
      userId: ctx.session.user.id,
    });

    revalidatePath("/dashboard/todos");
    return { todo };
  });

export const toggleTodo = authActionClient
  .inputSchema(z.object({ id: z.string(), completed: z.boolean() }))
  .action(async ({ parsedInput, ctx }) => {
    await db
      .update(schema.todos)
      .set({ completed: parsedInput.completed })
      .where(
        and(eq(schema.todos.id, parsedInput.id), eq(schema.todos.userId, ctx.session.user.id)),
      );
    revalidatePath("/dashboard/todos");
  });

export const deleteTodo = authActionClient
  .inputSchema(z.object({ id: z.string() }))
  .action(async ({ parsedInput, ctx }) => {
    await db
      .delete(schema.todos)
      .where(
        and(eq(schema.todos.id, parsedInput.id), eq(schema.todos.userId, ctx.session.user.id)),
      );
    revalidatePath("/dashboard/todos");
  });

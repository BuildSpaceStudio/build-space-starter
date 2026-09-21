"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { trackEvent } from "@/lib/analytics";
import { schema } from "@/lib/db";
import { scopedTo } from "@/lib/db/scoped";
import { authActionClient } from "@/lib/safe-action";

// The reference slice. Two rules every action here follows:
//
// 1. Queries go through `scopedTo(ctx.session.user.id)` — never `db` directly.
//    Ownership is then structural: `update`/`delete` match on id AND owner, so
//    passing someone else's id touches zero rows.
// 2. Every string input is bounded (`.max()`). Unbounded input is how a form
//    turns into an unbounded row, an unbounded bill, or an unbounded log line.

export const createTodo = authActionClient
  .inputSchema(z.object({ text: z.string().min(1).max(500) }))
  .action(async ({ parsedInput, ctx }) => {
    const mine = scopedTo(ctx.session.user.id);
    const todo = await mine.insert(schema.todos, { text: parsedInput.text });

    await trackEvent({
      event: "todo_created",
      properties: { todoId: todo.id },
      userId: ctx.session.user.id,
    });

    revalidatePath("/dashboard/todos");
    return { todo };
  });

export const toggleTodo = authActionClient
  .inputSchema(z.object({ id: z.string().min(1).max(64), completed: z.boolean() }))
  .action(async ({ parsedInput, ctx }) => {
    const mine = scopedTo(ctx.session.user.id);
    await mine.update(schema.todos, parsedInput.id, { completed: parsedInput.completed });
    revalidatePath("/dashboard/todos");
  });

export const deleteTodo = authActionClient
  .inputSchema(z.object({ id: z.string().min(1).max(64) }))
  .action(async ({ parsedInput, ctx }) => {
    const mine = scopedTo(ctx.session.user.id);
    await mine.delete(schema.todos, parsedInput.id);
    revalidatePath("/dashboard/todos");
  });

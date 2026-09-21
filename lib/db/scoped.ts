import "server-only";
import { and, eq, type SQL } from "drizzle-orm";
import type { SQLiteColumn, SQLiteTable } from "drizzle-orm/sqlite-core";
import { db } from "@/lib/db";

// Tenant scoping, made unforgettable.
//
// Every user-owned query has to carry `WHERE user_id = ?`. Writing that by hand
// in each action works right up until one action forgets it, and then one user
// can read or delete another's rows. `scopedTo(userId)` injects the predicate
// for you, so the correct query is also the shortest one to write:
//
//   const mine = scopedTo(ctx.session.user.id);
//   const rows  = await mine.select(schema.todos).orderBy(desc(schema.todos.createdAt));
//   const todo  = await mine.insert(schema.todos, { text });
//   await mine.update(schema.todos, id, { completed });
//   await mine.delete(schema.todos, id);
//
// `update` and `delete` scope by id AND owner, so a request carrying someone
// else's id affects zero rows instead of theirs.
//
// App code must not reach for `db` directly — `test/guardrails.test.ts`
// enforces that. Queries that genuinely aren't user-scoped (admin views,
// lookups by another key) belong in a `lib/db/*.ts` helper, where the
// authorization story lives next to the query.

type OwnedTable = SQLiteTable & { id: SQLiteColumn; userId: SQLiteColumn };

export function scopedTo(userId: string) {
  function owned(table: OwnedTable, extra?: SQL): SQL {
    const mine = eq(table.userId, userId);
    // `and()` only returns undefined when given no conditions.
    return extra ? (and(mine, extra) as SQL) : mine;
  }

  return {
    /** Rows owned by this user. Chain `.orderBy()` / `.limit()` as usual. */
    select<T extends OwnedTable>(table: T, extra?: SQL) {
      return db.select().from(table).where(owned(table, extra));
    },

    /** One row by id, or null when it doesn't exist or isn't theirs. */
    async byId<T extends OwnedTable>(table: T, id: string): Promise<T["$inferSelect"] | null> {
      const [row] = await db
        .select()
        .from(table)
        .where(owned(table, eq(table.id, id)))
        .limit(1);
      return row ?? null;
    },

    /** Insert with `userId` filled in from the session — it can't be spoofed by input. */
    async insert<T extends OwnedTable>(
      table: T,
      values: Omit<T["$inferInsert"], "userId">,
    ): Promise<T["$inferSelect"]> {
      const [row] = await db
        .insert(table)
        .values({ ...values, userId } as T["$inferInsert"])
        .returning();
      return row;
    },

    /** Update by id, scoped to the owner. Returns null if nothing matched. */
    async update<T extends OwnedTable>(
      table: T,
      id: string,
      values: Partial<Omit<T["$inferInsert"], "id" | "userId">>,
    ): Promise<T["$inferSelect"] | null> {
      const [row] = await db
        .update(table)
        .set(values as Partial<T["$inferInsert"]>)
        .where(owned(table, eq(table.id, id)))
        .returning();
      return row ?? null;
    },

    /** Delete by id, scoped to the owner. Returns how many rows went. */
    async delete<T extends OwnedTable>(table: T, id: string): Promise<number> {
      const rows = await db
        .delete(table)
        .where(owned(table, eq(table.id, id)))
        .returning();
      return rows.length;
    },
  };
}

export type ScopedDb = ReturnType<typeof scopedTo>;

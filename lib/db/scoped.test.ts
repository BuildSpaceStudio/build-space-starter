import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

// Cross-tenant isolation, proven against a real (in-memory) database rather
// than a mock — mocks can't tell you whether the WHERE clause is there.
//
// If you add a user-owned table, you don't need to copy this file: the point is
// that `scopedTo()` itself is tested once, so every slice built on it inherits
// the guarantee.

vi.mock("@/lib/db", async () => {
  const { createClient } = await import("@libsql/client");
  const { drizzle } = await import("drizzle-orm/libsql");
  const schema = await import("@/lib/db/schema");
  const client = createClient({ url: ":memory:" });
  return { db: drizzle(client, { schema }), schema };
});

const { db, schema } = await import("@/lib/db");
const { scopedTo } = await import("@/lib/db/scoped");

const ALICE = "user_alice";
const BOB = "user_bob";

beforeAll(async () => {
  await db.run(`
    CREATE TABLE todos (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      text TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    )
  `);
});

beforeEach(async () => {
  await db.run("DELETE FROM todos");
});

describe("scopedTo", () => {
  it("stamps the owner on insert, ignoring anything the caller sent", async () => {
    // A caller-supplied userId must not win — the session decides. The cast is
    // what a malicious request looks like: the type says it can't happen.
    const spoofed = { text: "alice's todo", userId: BOB } as unknown as { text: string };

    const todo = await scopedTo(ALICE).insert(schema.todos, spoofed);

    expect(todo.userId).toBe(ALICE);
  });

  it("only selects the caller's rows", async () => {
    await scopedTo(ALICE).insert(schema.todos, { text: "alice's todo" });
    await scopedTo(BOB).insert(schema.todos, { text: "bob's todo" });

    const rows = await scopedTo(ALICE).select(schema.todos);

    expect(rows.map((row) => row.text)).toEqual(["alice's todo"]);
  });

  it("returns null for another user's row by id", async () => {
    const bobsTodo = await scopedTo(BOB).insert(schema.todos, { text: "bob's todo" });

    expect(await scopedTo(ALICE).byId(schema.todos, bobsTodo.id)).toBeNull();
    expect(await scopedTo(BOB).byId(schema.todos, bobsTodo.id)).not.toBeNull();
  });

  it("refuses to update another user's row", async () => {
    const bobsTodo = await scopedTo(BOB).insert(schema.todos, { text: "bob's todo" });

    const updated = await scopedTo(ALICE).update(schema.todos, bobsTodo.id, { completed: true });

    expect(updated).toBeNull();
    expect((await scopedTo(BOB).byId(schema.todos, bobsTodo.id))?.completed).toBe(false);
  });

  it("refuses to delete another user's row", async () => {
    const bobsTodo = await scopedTo(BOB).insert(schema.todos, { text: "bob's todo" });

    const deleted = await scopedTo(ALICE).delete(schema.todos, bobsTodo.id);

    expect(deleted).toBe(0);
    expect(await scopedTo(BOB).byId(schema.todos, bobsTodo.id)).not.toBeNull();
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

// Exemplar server-action test: mock the seams (session, db, analytics,
// Next.js cache) and call the action like the client would. Copy this shape
// when testing any new slice's actions.

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  trackEvent: vi.fn(),
  revalidatePath: vi.fn(),
  insertedTodo: { id: "todo_1", text: "write tests", completed: false, userId: "user_1" },
}));

vi.mock("@/lib/auth", () => ({ getSession: mocks.getSession }));
vi.mock("@/lib/analytics", () => ({ trackEvent: mocks.trackEvent }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/db", () => ({
  db: {
    insert: () => ({
      values: () => ({ returning: () => Promise.resolve([mocks.insertedTodo]) }),
    }),
  },
  schema: { todos: {} },
}));

import { createTodo } from "./actions";

const SESSION = { user: { id: "user_1", email: "a@b.co", name: "Ada" }, token: "tok" };

describe("createTodo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a todo for the signed-in user and tracks the event", async () => {
    mocks.getSession.mockResolvedValue(SESSION);

    const result = await createTodo({ text: "write tests" });

    expect(result?.data?.todo).toEqual(mocks.insertedTodo);
    expect(mocks.trackEvent).toHaveBeenCalledWith(
      expect.objectContaining({ event: "todo_created", userId: "user_1" }),
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/dashboard/todos");
  });

  it("rejects unauthenticated calls", async () => {
    mocks.getSession.mockResolvedValue(null);

    const result = await createTodo({ text: "write tests" });

    expect(result?.data).toBeUndefined();
    expect(result?.serverError).toBeDefined();
  });

  it("rejects invalid input before running the action", async () => {
    mocks.getSession.mockResolvedValue(SESSION);

    const result = await createTodo({ text: "" });

    expect(result?.data).toBeUndefined();
    expect(result?.validationErrors).toBeDefined();
    expect(mocks.trackEvent).not.toHaveBeenCalled();
  });
});

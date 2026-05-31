import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable(
  "users",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    buildspaceUserId: text("buildspace_user_id").notNull(),
    email: text("email").notNull(),
    name: text("name"),
    avatarUrl: text("avatar_url"),
    role: text("role", {
      enum: ["member", "super_admin"],
    })
      .notNull()
      .default("member"),
    marketingOptIn: integer("marketing_opt_in", {
      mode: "boolean",
    })
      .notNull()
      .default(false),
    createdAt: text("created_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text("updated_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [uniqueIndex("users_buildspace_user_id_idx").on(table.buildspaceUserId)],
);

export type UserRecord = typeof users.$inferSelect;
export type NewUserRecord = typeof users.$inferInsert;

export const todos = sqliteTable("todos", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  text: text("text").notNull(),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export type TodoRecord = typeof todos.$inferSelect;
export type NewTodoRecord = typeof todos.$inferInsert;

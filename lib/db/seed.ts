import { db } from "./index";
import { users } from "./schema";

async function main() {
  const existingUsers = await db.select({ id: users.id }).from(users).limit(1);

  if (existingUsers.length > 0) {
    console.log("Seed skipped: users already exist.");
    return;
  }

  console.log(
    "Seed skipped: starter relies on real auth sign-ins to create users.",
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

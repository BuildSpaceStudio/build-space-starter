import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-auth";
import { getUserByBuildspaceId } from "@/lib/db/users";

// The pattern for every authenticated route handler: wrap it in `withAuth`,
// then read the caller off `session` — never off the request body or a query
// param, which the caller controls.
export const GET = withAuth(async (_request, { session }) => {
  const record = await getUserByBuildspaceId(session.user.id);
  return NextResponse.json({
    id: session.user.id,
    email: session.user.email,
    name: record?.name ?? session.user.name,
    role: record?.role ?? "member",
  });
});

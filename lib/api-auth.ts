import "server-only";
import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getUserByBuildspaceId } from "@/lib/db/users";
import { log } from "@/lib/log";

// Route handlers are NOT covered by `proxy.ts` — its matcher only guards
// `/dashboard/*`. Anything under `app/api/` is wide open unless it checks the
// session itself, so wrap every new route in `withAuth` (or `withAdmin`):
//
//   export const GET = withAuth(async (_request, { session }) =>
//     NextResponse.json({ id: session.user.id }),
//   );
//
// A route that really is public (webhooks, health, OAuth callbacks) must be
// listed in `test/public-routes.ts` with a reason — `test/guardrails.test.ts`
// fails the build for any route that is neither wrapped nor listed.

type Session = NonNullable<Awaited<ReturnType<typeof getSession>>>;

type RouteContext = { params: Promise<Record<string, string | string[] | undefined>> };

type AuthedHandler = (
  request: NextRequest,
  context: RouteContext & { session: Session },
) => Promise<Response> | Response;

type AdminHandler = (
  request: NextRequest,
  context: RouteContext & {
    session: Session;
    user: NonNullable<Awaited<ReturnType<typeof getUserByBuildspaceId>>>;
  },
) => Promise<Response> | Response;

export function withAuth(handler: AuthedHandler) {
  return async (request: NextRequest, context: RouteContext): Promise<Response> => {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return handler(request, { ...context, session });
  };
}

export function withAdmin(handler: AdminHandler) {
  return withAuth(async (request, context) => {
    let user: Awaited<ReturnType<typeof getUserByBuildspaceId>> = null;
    try {
      user = await getUserByBuildspaceId(context.session.user.id);
    } catch (err) {
      log.error("api-auth", "role lookup failed", { err });
      return NextResponse.json({ error: "Unavailable" }, { status: 503 });
    }
    if (user?.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return handler(request, { ...context, user });
  });
}

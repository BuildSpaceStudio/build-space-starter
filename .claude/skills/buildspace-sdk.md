# BuildSpace SDK

Use this skill when working with the BuildSpace SDK (`@buildspacestudio/sdk`) in this project. Always consult https://docs.buildspace.studio/docs for the latest API surface before implementing new features.

## SDK Overview

The BuildSpace SDK provides four services: **authentication**, **event tracking**, **storage**, and **notifications**. It ships two entry points:

- **Server** (`@buildspacestudio/sdk`) — uses a secret key (`bs_sec_*`), runs in API routes and server components
- **Client** (`@buildspacestudio/sdk/client`) — uses a publishable key (`bs_pub_*`), runs in the browser

## Initialization

### Server (API routes, server components, server actions)

```ts
import Buildspace from "@buildspacestudio/sdk";
const bs = new Buildspace(process.env.BUILDSPACE_SECRET_KEY!);
```

This project provides a singleton at `lib/buildspace.ts` — import `getServerClient()`.

### Browser (client components)

```ts
import { createClient } from "@buildspacestudio/sdk/client";
const bs = createClient(process.env.NEXT_PUBLIC_BUILDSPACE_PUBLISHABLE_KEY!);
```

This project provides a singleton at `lib/buildspace-client.ts` — import `getBrowserClient()`.

## Environment Variables

```
BUILDSPACE_SECRET_KEY=bs_sec_...          # server-only, never expose to browser
NEXT_PUBLIC_BUILDSPACE_PUBLISHABLE_KEY=bs_pub_...  # safe for browser
```

## Authentication (`bs.auth` / `bs.authClient`)

### Client — generate auth URLs

```ts
const signInUrl = bs.auth.getSignInUrl({ redirectUri: `${origin}/api/auth/callback` });
const signUpUrl = bs.auth.getSignUpUrl({ redirectUri: `${origin}/api/auth/callback` });
```

Options: `redirectUri` (required), `appSlug?`, `env?` (`"dev"` | `"prod"`)

### Server — handle callbacks and sessions

```ts
// Exchange authorization code for token (in callback route handler)
const { access_token, expires_in, user } = await bs.auth.handleCallback(request.url, {
  redirectUri: `${origin}/api/auth/callback`,
});

// Validate a session token
const session = await bs.auth.getSession(token);
// Returns { user: { id, email, name }, appId } or null

// Revoke a session
await bs.auth.revokeSession(token);
```

### Session forwarding (attach session to subsequent SDK calls)

```ts
bs.setSession(token);    // attach
bs.clearSession();       // detach
```

### Recommended auth flow

1. Client calls `getSignInUrl()` / `getSignUpUrl()` and redirects the user
2. BuildSpace redirects back to `/api/auth/callback` with an authorization code
3. The callback route calls `handleCallback()` to exchange for a token
4. Store the token in an HTTP-only cookie
5. On each request, read the cookie and call `getSession()` to validate
6. On logout, call `revokeSession()` and delete the cookie

This starter implements this flow in:
- `app/api/auth/callback/route.ts`
- `app/api/auth/session/route.ts`
- `app/api/auth/logout/route.ts`

## Event Tracking (`bs.events`)

### Client (batched, auto-flushing)

```ts
bs.events.track("page_viewed", { path: "/pricing" });
bs.events.track("button_clicked", { label: "Sign Up" });

// Force-flush the batch
await bs.events.flush();

// Graceful shutdown (flushes remaining events)
await bs.events.shutdown();
```

Client config options (passed to `createClient`):
- `events.flushInterval` — ms between auto-flushes (default: SDK-defined)
- `events.maxBatchSize` — max events per batch

### Server (immediate, awaitable)

```ts
// Single event
const { event_id } = await bs.events.track("user_signed_up", { plan: "pro" }, userId);

// Batch multiple events
const { count, event_ids } = await bs.events.batchTrack([
  { event: "item_purchased", properties: { sku: "ABC" }, actor_id: userId },
  { event: "receipt_sent", properties: { orderId: "123" } },
]);
```

## Storage (`bs.storage`)

### Client (browser)

```ts
// Upload a file
const { key, url, size } = await bs.storage.upload(file, { path: "avatars/user-1.png" });

// Get a URL for a stored object
const { url } = await bs.storage.getUrl("avatars/user-1.png");

// List objects
const { objects } = await bs.storage.list("avatars/");

// Delete
await bs.storage.delete("avatars/user-1.png");
```

### Server

```ts
// Generate a presigned upload URL
const { upload_url, key, expires_in } = await bs.storage.getUploadUrl({
  key: "reports/q4.pdf",
  contentType: "application/pdf",
  size: fileBytes,
});

// Generate a temporary signed download URL
const { url, expiresIn } = await bs.storage.getSignedUrl("reports/q4.pdf", { expiresIn: 3600 });

// List objects with pagination
const { objects } = await bs.storage.list("reports/", { limit: 50, offset: 0 });

// Delete
await bs.storage.delete("reports/q4.pdf");

// Check usage
const { storageBytes, objectCount, maxStorageBytes } = await bs.storage.getUsage();
```

## Notifications (`bs.notifications`) — Server Only

```ts
// Direct HTML email
const { id } = await bs.notifications.send({
  to: "user@example.com",       // or string[]
  subject: "Welcome!",
  html: "<h1>Hello</h1>",
  text: "Hello (plain text)",   // optional
  replyTo: "support@you.com",   // optional
  metadata: { userId: "123" },  // optional
});

// Template-based email
const { id } = await bs.notifications.sendTemplate("welcome-email", {
  to: "user@example.com",
  variables: { name: "Jane", plan: "Pro" },
  metadata: { userId: "123" },
});
```

## Error Handling

All SDK methods throw `BuildspaceError` on failure:

```ts
import { BuildspaceError } from "@buildspacestudio/sdk";

try {
  await bs.auth.getSession(token);
} catch (err) {
  if (err instanceof BuildspaceError) {
    console.error(err.code, err.service, err.status, err.message);
  }
}
```

Properties: `code` (string), `service` (`"auth" | "events" | "storage" | "notifications"`), `status` (HTTP status), `message`.

## Configuration Options

Both `new Buildspace(key, config)` and `createClient(key, config)` accept:

| Option | Default | Description |
|--------|---------|-------------|
| `baseUrl` | `https://api.buildspace.studio` | API endpoint |
| `loginUrl` | `https://login.buildspace.studio` | Auth host |
| `version` | `2025-06-01` | API version header |
| `fetch` | global `fetch` | Custom fetch implementation |

Client-only additional options:

| Option | Description |
|--------|-------------|
| `events.flushInterval` | Auto-flush interval in ms |
| `events.maxBatchSize` | Max events per batch |

## Project Structure

```
lib/
  buildspace.ts          # Server SDK singleton
  buildspace-client.ts   # Browser SDK singleton
app/api/
  auth/callback/route.ts # OAuth callback handler
  auth/session/route.ts  # Session validation endpoint
  auth/logout/route.ts   # Logout + session revocation
  events/route.ts        # Server-side event tracking
  storage/route.ts       # Storage list + presigned upload URLs
  notifications/route.ts # Email sending endpoint
app/examples/page.tsx    # Interactive examples for all SDK features
```

## Fetching Latest Docs

When you need up-to-date SDK information beyond what is in this file, fetch:
- `https://docs.buildspace.studio/llms-full.txt` — complete SDK reference in plain text
- `https://docs.buildspace.studio/docs` — documentation index

Use the WebFetch tool to retrieve these URLs and extract the latest methods, types, and examples.

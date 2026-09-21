import "server-only";

// Structured, redacting logger. Use this instead of `console.*` in app and lib
// code — biome enforces it. Server logs land in Railway's log stream, which is
// readable by anyone with project access, so anything that looks like a secret
// is masked before it gets there.
//
//   log.error("auth", "local user lookup failed", { err, userId });
//   log.info("billing", "checkout created", { priceId });

const SENSITIVE_KEY = /token|secret|password|authorization|cookie|credential|apikey|api_key|key$/i;
const MAX_DEPTH = 4;

function maskString(value: string): string {
  if (value.length <= 8) return "[redacted]";
  return `[redacted:${value.length}]`;
}

// Values under a sensitive-looking key are masked; Errors keep name + message
// but never their (often token-bearing) stack or cause payloads.
function redact(value: unknown, depth = 0): unknown {
  if (value instanceof Error) {
    return { name: value.name, message: value.message };
  }
  if (typeof value === "string") return value;
  if (value === null || typeof value !== "object") return value;
  if (depth >= MAX_DEPTH) return "[truncated]";
  if (Array.isArray(value)) return value.slice(0, 20).map((item) => redact(item, depth + 1));

  const out: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    if (SENSITIVE_KEY.test(key)) {
      out[key] = typeof item === "string" ? maskString(item) : "[redacted]";
      continue;
    }
    out[key] = redact(item, depth + 1);
  }
  return out;
}

function format(scope: string, message: string, context?: Record<string, unknown>): string {
  if (!context || Object.keys(context).length === 0) return `[${scope}] ${message}`;
  try {
    return `[${scope}] ${message} ${JSON.stringify(redact(context))}`;
  } catch {
    return `[${scope}] ${message} [uncloneable context]`;
  }
}

// This module is the one place console.* is allowed (see biome.json overrides).
export const log = {
  info(scope: string, message: string, context?: Record<string, unknown>): void {
    console.log(format(scope, message, context));
  },
  warn(scope: string, message: string, context?: Record<string, unknown>): void {
    console.warn(format(scope, message, context));
  },
  error(scope: string, message: string, context?: Record<string, unknown>): void {
    console.error(format(scope, message, context));
  },
};

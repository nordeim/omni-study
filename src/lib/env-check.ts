// S22 (ADR-020) — the boot-guard seam.
//
// Production boots refuse to sign session cookies with the public dev
// fallback: src/instrumentation.ts calls authSecretBootStatus() once per
// server boot (standalone, next start, dev — never during `next build`)
// and a FATAL result terminates the process with the actionable message
// (console.error + process.exit(1) — a plain throw is caught by Next and
// leaves a degraded 500-everything server, validated empirically in the
// session-38 scratch probe).
//
// The gap this closes: src/lib/auth.ts's secret() silently fell back to
// DEV_FALLBACK_SECRET regardless of NODE_ENV, and the only enforcement
// was Docker-side (docker-compose's ${AUTH_SECRET:?}) — the documented
// non-Docker production path (bun run start, DEPLOYMENT.md §4) had NONE.
// An owner who missed the env step got a silently-booted server whose
// session cookies were signed with a constant committed to the public
// repo — forgeable sessions for any user id.
//
// Pure by design: explicit args, zero imports, never touches
// process.env itself — the instrumentation hook owns the env, the unit
// layer owns the boundaries. DEV_FALLBACK_SECRET lives HERE (the single
// source) and src/lib/auth.ts imports it, so the seam's pasted-constant
// check can never drift from the fallback auth actually uses.

/**
 * The documented dev-only fallback (unchanged historical value). Exported
 * from this seam — the single source — so auth.ts and the boot guard
 * reference the same constant by construction.
 */
export const DEV_FALLBACK_SECRET = "dev-only-insecure-session-secret";

/** The boot decision: ok proceeds silently, warn logs one line, fatal exits. */
export type BootCheckLevel = "ok" | "warn" | "fatal";

export interface BootCheckResult {
  level: BootCheckLevel;
  message: string;
}

/** Secrets shorter than this (post-trim) draw a weak-key warning. */
const MIN_RECOMMENDED_SECRET_LENGTH = 32;

const REMEDY = "openssl rand -hex 32";

/**
 * The AUTH_SECRET boot decision for one (nodeEnv, authSecret) pair.
 *
 * FATAL (production only — the boot exits):
 *  - missing / empty / whitespace-only secret
 *  - the secret equals the public DEV_FALLBACK_SECRET (pasted constant)
 * WARN (boots, one log line):
 *  - production secret shorter than 32 chars (weak HMAC key)
 *  - non-production with no secret (the documented dev fallback in use)
 * OK: everything else.
 */
export function authSecretBootStatus(
  nodeEnv: string | undefined,
  authSecret: string | undefined,
): BootCheckResult {
  const secret = authSecret?.trim() ?? "";
  const isProduction = nodeEnv === "production";

  if (!isProduction) {
    if (secret.length === 0) {
      return {
        level: "warn",
        message:
          "AUTH_SECRET is not set — using the insecure dev-only fallback. " +
          `Set a real secret (${REMEDY}) before deploying (DEPLOYMENT.md §4).`,
      };
    }
    return { level: "ok", message: "AUTH_SECRET present." };
  }

  if (secret.length === 0) {
    return {
      level: "fatal",
      message:
        "AUTH_SECRET is required in production: without it, session cookies are " +
        "signed with a public fallback constant — anyone could forge sessions. " +
        `Generate one with "${REMEDY}" and set it in the environment ` +
        "(see DEPLOYMENT.md §4).",
    };
  }

  if (secret === DEV_FALLBACK_SECRET) {
    return {
      level: "fatal",
      message:
        "AUTH_SECRET is set to the public dev-only fallback constant — equally " +
        `forgeable. Generate a real secret with "${REMEDY}" (see DEPLOYMENT.md §4).`,
    };
  }

  if (secret.length < MIN_RECOMMENDED_SECRET_LENGTH) {
    return {
      level: "warn",
      message:
        `AUTH_SECRET is shorter than ${MIN_RECOMMENDED_SECRET_LENGTH} characters — a weak ` +
        `HMAC key. Prefer "${REMEDY}" (64 hex chars).`,
    };
  }

  return { level: "ok", message: "AUTH_SECRET present." };
}

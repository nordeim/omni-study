import { LoginCard } from "./login-card";

// S15 — the login route is a server component that reads the reset
// deep-link (`/login?token=<48hex>`) from searchParams and seeds the client
// state machine with it: the reset screen renders in the SSR HTML itself
// (no post-hydration setState, no Suspense restructuring, no hydration
// mismatch — the react-hooks/set-state-in-effect-compliant shape).
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = params["token"];
  const token = typeof raw === "string" && /^[0-9a-f]{48}$/.test(raw) ? raw : null;
  return <LoginCard initialResetToken={token} />;
}

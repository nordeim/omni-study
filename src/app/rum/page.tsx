import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { RumPanel } from "@/components/rum/rum-panel";

// S19 (ADR-017) — the RUM diagnostics panel route.
//
// The owner-facing surface for the S18 beacon's p75 field data. A pure
// SUPERSET: the reference has no diagnostics surface, and this route adds
// ZERO chrome to any parity-pinned surface — it is linked from NOWHERE
// (the sidebar/drawer stay exactly 20 links; an e2e guard pins the shell
// /rum-link-free) and is not a sitemap entry (auth-gated tooling, not
// public content). The owner navigates directly — see README's
// observability row + DEPLOYMENT.md §8.
//
// The gate runs SERVER-side (getCurrentUser + redirect): an anonymous
// visit never renders a flash of panel chrome — it lands on /login, the
// same contract the API routes enforce.
export const metadata: Metadata = {
  title: "Performance Diagnostics",
  robots: { index: false, follow: false },
};

export default async function RumDiagnosticsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return <RumPanel />;
}

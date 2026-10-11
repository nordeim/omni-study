import { defineConfig } from "vitest/config";
import path from "node:path";

// Unit-test layer for the pure domain seams — 20 files / 371 tests:
// router, theme, theme-cache, date, calculator, auth, validation, db-path,
// site, api-timeout, api-offline, files (content-disposition),
// rum-diagnostics, data-export, data-import, env-check, view-collections,
// dep-audit (the S30 bun-audit parser/classifier seam), dev-preflight
// (the S31 dev-server boot-stability classifier seam), suite-verdict
// (the S32 standing-suite verdict seam — the anti-phantom shape guard —
// extended in S33 with the mobile-sweep classifier pins: the light-mode
// 390×844 drawer-navigation sweep; extended in S34 with the midband-sweep
// classifier pins: the light-mode 768×1024 drawer-navigation sweep at the
// md breakpoint, the 391–1023px band's representative width, with the
// chrome vehicle-contract class; extended in S35 with the landscape-sweep
// classifier pins: the light-mode 844×390 phone-landscape drawer-navigation
// sweep — the HEIGHT axis the standing surface never varied — with the
// per-view heading-clearance key and the drawerNavScrollable short-viewport
// contract class).
// Browser/E2E coverage lives in tests/e2e/*.spec.ts (Playwright — never
// picked up by this config, which matches *.test.ts only; the standalone
// server is booted by playwright.config.ts's webServer).
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts", "tests/**/*.test.ts"],
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
});

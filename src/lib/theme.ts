// ---------------------------------------------------------------------------
// Theme tokens — accent colors + light/dark palettes for StudyFlow.
// Mirrors the reference app's Settings → Appearance system (7 accents,
// Light/Dark/System modes, RGB-triplet CSS variables measured live:
// `--primary: 139 92 246` for the default Violet theme).
//
// The variables are injected as `--sf-primary: <r> <g> <b>` style triplets
// (the reference's own convention) and consumed by globals.css utilities.
// Pure data + pure functions — unit-tested in tests/theme.test.ts.

export const ACCENTS = ["violet", "blue", "green", "orange", "pink", "red", "teal"] as const;
export type Accent = (typeof ACCENTS)[number];

export type ThemeMode = "light" | "dark" | "system";

export interface AccentToken {
  /** Primary accent (rgb triplet string "r g b"). */
  primary: string;
  /** Accessible foreground on primary (usually white). */
  primaryFg: string;
  /** Soft tint used for active nav backgrounds / icon chips. */
  soft: string;
  /** Soft tint in dark mode. */
  softDark: string;
  /** Stronger text tone (600-level) for links/labels. */
  strong: string;
  /** Stronger text tone in dark mode. */
  strongDark: string;
  /** Deepest text tone (700-level) — reference sidebar clock time text. */
  deep: string;
  /** Lightest tint (50-level) — reference sidebar clock chip gradient start. */
  softest: string;
  /** 50-level tint of the ADJACENT hue — the clock chip gradient's second
   *  stop. The reference (violet default) ends its chip gradient at
   *  indigo-50 `rgb(238,242,255)` exactly — a hue rotation that cannot be
   *  reproduced by mixing the accent toward white, so it gets its own
   *  token (v3-pinned hexes for the other accents' adjacent hues). */
  softestAdjacent: string;
  /** 600-level of the ADJACENT hue — brand chips + CTA gradients end here
   *  (reference: violet-500 → indigo-600 `rgb(79,70,229)` measured). The
   *  hue rotation cannot be derived from the accent itself (session 4,
   * extends the softestAdjacent pattern to the 600 level). */
  gradientTo: string;
  /** 700-level of the ADJACENT hue — the gradient HOVER end (reference:
   *  hover:from-violet-600 hover:to-indigo-700 = indigo-700 rgb(67,56,202)).
   *  Session 5 (S5-A): gradient CTAs darken both stops on hover. */
  gradientToStrong: string;
  /** 400-level of the accent — the avatar gradient's start (reference:
   *  violet-400 `rgb(167,139,250)`). */
  avatarFrom: string;
  /** 500-level of the ADJACENT hue — the avatar gradient's end (reference:
   *  indigo-500 `rgb(99,102,241)` — the LIGHTER pair, unlike the brand
   *  chips' 500→600). */
  avatarTo: string;
  /** 100-level of the accent — the empty-state block gradient's start
   *  (reference: violet-100 `rgb(237,233,254)`). */
  emptyFrom: string;
  /** 100-level of the ADJACENT hue — the empty-state block gradient's end
   *  (reference: indigo-100 `rgb(224,231,255)`). */
  emptyTo: string;
}

export const ACCENT_TOKENS: Record<Accent, AccentToken> = {
  // Violet (default) — measured on the live app:
  // --primary: 139 92 246 (#8B5CF6, violet-500), links #7C3AED (violet-600),
  // active nav tint ~ #F3E8FF/#EDE9FE (violet-100).
  violet: {
    primary: "139 92 246",
    primaryFg: "255 255 255",
    soft: "243 232 255",
    softDark: "76 29 149",
    strong: "124 58 237",
    strongDark: "196 181 253",
    deep: "109 40 217",
    softest: "245 243 255",
    softestAdjacent: "238 242 255", // indigo-50 #EEF2FF (measured on the reference)
    // S4-G measured gradient stops (session 4):
    gradientTo: "79 70 229", // indigo-600 #4F46E5 — brand chips + CTA end
    gradientToStrong: "67 56 202", // indigo-700 #4338CA — gradient hover end
    avatarFrom: "167 139 250", // violet-400 #A78BFA — avatar start
    avatarTo: "99 102 241", // indigo-500 #6366F1 — avatar end
    emptyFrom: "237 233 254", // violet-100 #EDE9FE — empty-state block start
    emptyTo: "224 231 255", // indigo-100 #E0E7FF — empty-state block end
  },
  blue: {
    primary: "59 130 246",
    primaryFg: "255 255 255",
    soft: "219 234 254",
    softDark: "30 58 138",
    strong: "37 99 235",
    strongDark: "191 219 254",
    deep: "29 78 216",
    softest: "239 246 255",
    softestAdjacent: "238 242 255", // indigo-50 (blue's adjacent hue)
    gradientTo: "8 145 178", // cyan-600 #0891B2
    gradientToStrong: "14 116 144", // cyan-700 #0E7490
    avatarFrom: "96 165 250", // blue-400 #60A5FA
    avatarTo: "6 182 212", // cyan-500 #06B6D4
    emptyFrom: "219 234 254", // blue-100 #DBEAFE
    emptyTo: "207 250 254", // cyan-100 #CFFAFE
  },
  green: {
    // S5-F: migrated to the EMERALD family — the reference's swatch face
    // measured rgb(16,185,129) = emerald-500 (NOT green-500 rgb(34,197,94)).
    primary: "16 185 129",
    primaryFg: "255 255 255",
    soft: "209 250 229",
    softDark: "6 78 59",
    strong: "5 150 105",
    strongDark: "110 231 183",
    deep: "4 120 87",
    softest: "236 253 245",
    softestAdjacent: "240 253 250", // teal-50 #F0FDFA
    gradientTo: "13 148 136", // teal-600 #0D9488
    gradientToStrong: "15 118 110", // teal-700 #0F766E
    avatarFrom: "52 211 153", // emerald-400 #34D399
    avatarTo: "20 184 166", // teal-500 #14B8A6
    emptyFrom: "209 250 229", // emerald-100 #D1FAE5
    emptyTo: "204 251 241", // teal-100 #CCFBF1
  },
  orange: {
    // S5-F: migrated to the AMBER family — the reference's swatch face
    // measured rgb(245,158,11) = amber-500 (NOT orange-500 rgb(249,115,22)).
    primary: "245 158 11",
    primaryFg: "255 255 255",
    soft: "254 243 199",
    softDark: "120 53 15",
    strong: "217 119 6",
    strongDark: "252 211 77",
    deep: "180 83 9",
    softest: "255 251 235",
    softestAdjacent: "255 247 237", // orange-50 #FFF7ED
    gradientTo: "234 88 12", // orange-600 #EA580C
    gradientToStrong: "194 65 12", // orange-700 #C2410C
    avatarFrom: "251 191 36", // amber-400 #FBBF24
    avatarTo: "249 115 22", // orange-500 #F97316
    emptyFrom: "254 243 199", // amber-100 #FEF3C7
    emptyTo: "255 237 213", // orange-100 #FFEDD5
  },
  pink: {
    primary: "236 72 153",
    primaryFg: "255 255 255",
    soft: "252 231 243",
    softDark: "131 24 67",
    strong: "219 39 119",
    strongDark: "251 207 232",
    deep: "190 24 93",
    softest: "253 242 248",
    softestAdjacent: "255 241 242", // rose-50 #FFF1F2
    gradientTo: "225 29 72", // rose-600 #E11D48 (the stat-chip pair)
    gradientToStrong: "190 18 60", // rose-700 #BE123C
    avatarFrom: "244 114 182", // pink-400 #F472B6
    avatarTo: "244 63 94", // rose-500 #F43F5E
    emptyFrom: "252 231 243", // pink-100 #FCE7F3
    emptyTo: "255 228 230", // rose-100 #FFE4E6
  },
  red: {
    primary: "239 68 68",
    primaryFg: "255 255 255",
    soft: "254 226 226",
    softDark: "127 29 29",
    strong: "220 38 38",
    strongDark: "252 165 165",
    deep: "185 28 28",
    softest: "254 242 242",
    softestAdjacent: "255 241 242", // rose-50 #FFF1F2
    gradientTo: "234 88 12", // orange-600 #EA580C
    gradientToStrong: "194 65 12", // orange-700 #C2410C
    avatarFrom: "248 113 113", // red-400 #F87171
    avatarTo: "249 115 22", // orange-500 #F97316
    emptyFrom: "254 226 226", // red-100 #FEE2E2
    emptyTo: "255 237 213", // orange-100 #FFEDD5
  },
  teal: {
    primary: "20 184 166",
    primaryFg: "255 255 255",
    soft: "204 251 241",
    softDark: "19 78 74",
    strong: "13 148 136",
    strongDark: "153 246 228",
    deep: "15 118 110",
    softest: "240 253 250",
    softestAdjacent: "236 254 255", // cyan-50 #ECFEFF
    gradientTo: "8 145 178", // cyan-600 #0891B2
    gradientToStrong: "14 116 144", // cyan-700 #0E7490
    avatarFrom: "45 212 191", // teal-400 #2DD4BF
    avatarTo: "6 182 212", // cyan-500 #06B6D4
    emptyFrom: "204 251 241", // teal-100 #CCFBF1
    emptyTo: "207 250 254", // cyan-100 #CFFAFE
  },
};

export const AVATAR_EMOJIS = [
  "🎓", "📚", "🧠", "💡", "🎯", "🚀", "⭐", "🌟",
  "🦊", "🐱", "🐶", "🐼", "🦁", "🐸", "🦉", "🐧",
  "🎨", "🎵", "🎮", "⚽", "🏀", "🎾", "🏆", "🎪",
] as const;

/** The active nav item's tint gradient stops (S8-A, live-measured on the
 *  reference): `linear-gradient(to right, rgba(139,92,246,0.1),
 *  rgba(99,102,241,0.1))` — the second stop is indigo-500, which is exactly
 *  the `avatarTo` token (NOT `strong`/violet-600 — the clone's earlier
 *  routing rendered a same-hue gradient). `toCssVar` carries the kebab-case
 *  CSS variable suffix. Pinned by tests/theme.test.ts and the S8-A e2e
 *  spec. */
export const NAV_ACTIVE_GRADIENT_STOPS = {
  from: "primary",
  to: "avatarTo",
  toCssVar: "avatar-to",
  alpha: 0.1,
} as const;

export function isAccent(value: string): value is Accent {
  return (ACCENTS as readonly string[]).includes(value);
}

export function isThemeMode(value: string): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}

/** CSS variables applied to :root for a given accent (light palette). */
export function accentCssVars(accent: Accent): Record<string, string> {
  const t = ACCENT_TOKENS[accent];
  return {
    "--sf-primary": t.primary,
    "--sf-primary-foreground": t.primaryFg,
    "--sf-primary-soft": t.soft,
    "--sf-primary-soft-dark": t.softDark,
    "--sf-primary-strong": t.strong,
    "--sf-primary-strong-dark": t.strongDark,
    "--sf-primary-deep": t.deep,
    "--sf-primary-softest": t.softest,
    "--sf-primary-softest-adjacent": t.softestAdjacent,
    "--sf-primary-gradient-to": t.gradientTo,
    "--sf-primary-gradient-to-strong": t.gradientToStrong,
    "--sf-primary-avatar-from": t.avatarFrom,
    "--sf-primary-avatar-to": t.avatarTo,
    "--sf-primary-empty-from": t.emptyFrom,
    "--sf-primary-empty-to": t.emptyTo,
  };
}

export function resolveMode(mode: ThemeMode, prefersDark: boolean): "light" | "dark" {
  if (mode === "system") return prefersDark ? "dark" : "light";
  return mode;
}

// ---------------------------------------------------------------------------
// S11-1 — the theme-application cache contract.
//
// applyToDocument (src/lib/store.ts) persists { mode, accent } to
// localStorage on EVERY apply; the boot script below reads it BEFORE first
// paint (injected into <head> by the root layout) so dark users never see a
// light flash while /api/auth/me resolves — and the login route themes at
// all (fresh visitors fall back to the OS preference). The script is a
// hand-maintained inline string (it must run before any module loads and
// cannot import this file) — the unit tests in tests/theme-cache.test.ts pin
// the PAYLOAD FORMAT so a format change here fails tests and forces the
// script to be updated in the same change.
// ---------------------------------------------------------------------------

export const THEME_CACHE_KEY = "sf-theme";

/** The JSON the boot script parses — compact by design (localStorage read
 *  happens pre-paint on every hard load). */
export function themeCachePayload(mode: ThemeMode, accent: Accent): string {
  return JSON.stringify({ mode, accent });
}

/** Parse the cached payload (the boot script's reader, mirrored for tests
 *  and any future app-side reader). Returns null for anything invalid. */
export function parseThemeCache(raw: string | null): { mode: ThemeMode; accent: Accent } | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== "object" || value === null) return null;
    const { mode, accent } = value as { mode?: unknown; accent?: unknown };
    if (typeof mode !== "string" || !isThemeMode(mode)) return null;
    if (typeof accent !== "string" || !isAccent(accent)) return null;
    return { mode, accent };
  } catch {
    return null;
  }
}

/** The pre-paint boot script (S11-1). Self-contained on purpose: no imports,
 *  no frameworks — it must execute synchronously in <head> before the first
 *  paint. Resolves the cached mode (falling back to the OS preference when
 *  the cache is absent — fresh visitors and post-sign-out) and applies the
 *  dark class. The accent vars still land post-auth (pre-auth surfaces use
 *  the violet :root defaults — the reference's own login is
 *  platform-default-styled). Keep the localStorage key in sync with
 *  THEME_CACHE_KEY (unit-pinned). */
// S11-1: applies the cached mode (sf-theme) pre-paint with a matchMedia
// fallback. S12-C1: also registers beforeprint/afterprint handlers — the
// print media never un-themes (the S11 print block forces the canvas white
// while every dark:text-* utility keeps rendering LIGHT text on it —
// measured 2–8 invisible elements per view, all 20 views), so beforeprint
// removes the dark class for the print duration (remembering it in
// __sfPrintDark) and afterprint restores it. Running on BOTH routes from
// the single <head> injection; Chromium fires both events for real print
// dialogs AND for page.pdf() (measured). The handler strings are unit-
// pinned in tests/theme-cache.test.ts — the hand-maintained-script sync
// contract.
export const THEME_BOOT_SCRIPT = `(function(){try{var t=JSON.parse(localStorage.getItem("sf-theme")||"null");var m=t&&t.mode;var d=m==="dark"||(m!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(d)document.documentElement.classList.add("dark");}catch(e){}
try{window.addEventListener("beforeprint",function(){var c=document.documentElement.classList;if(c.contains("dark")){c.remove("dark");window.__sfPrintDark=true;}});window.addEventListener("afterprint",function(){if(window.__sfPrintDark){document.documentElement.classList.add("dark");window.__sfPrintDark=false;}});}catch(e){}})();`;

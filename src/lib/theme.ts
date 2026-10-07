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
  },
  green: {
    primary: "34 197 94",
    primaryFg: "255 255 255",
    soft: "220 252 231",
    softDark: "20 83 45",
    strong: "22 163 74",
    strongDark: "187 247 208",
    deep: "21 128 61",
    softest: "240 253 244",
    softestAdjacent: "236 253 245", // emerald-50 #ECFDF5
  },
  orange: {
    primary: "249 115 22",
    primaryFg: "255 255 255",
    soft: "255 237 213",
    softDark: "124 45 18",
    strong: "234 88 12",
    strongDark: "253 186 116",
    deep: "194 65 12",
    softest: "255 247 237",
    softestAdjacent: "255 251 235", // amber-50 #FFFBEB
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
  },
};

export const AVATAR_EMOJIS = [
  "🎓", "📚", "🧠", "💡", "🎯", "🚀", "⭐", "🌟",
  "🦊", "🐱", "🐶", "🐼", "🦁", "🐸", "🦉", "🐧",
  "🎨", "🎵", "🎮", "⚽", "🏀", "🎾", "🏆", "🎪",
] as const;

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
  };
}

export function resolveMode(mode: ThemeMode, prefersDark: boolean): "light" | "dark" {
  if (mode === "system") return prefersDark ? "dark" : "light";
  return mode;
}

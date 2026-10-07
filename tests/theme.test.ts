import { describe, expect, it } from "vitest";
import {
  ACCENTS,
  ACCENT_TOKENS,
  AVATAR_EMOJIS,
  accentCssVars,
  isAccent,
  isThemeMode,
  resolveMode,
} from "@/lib/theme";

describe("ACCENT_TOKENS", () => {
  it("carries the measured violet default (139 92 246 = #8b5cf6)", () => {
    expect(ACCENT_TOKENS.violet.primary).toBe("139 92 246");
    expect(ACCENT_TOKENS.violet.primaryFg).toBe("255 255 255");
    expect(ACCENT_TOKENS.violet.strong).toBe("124 58 237"); // violet-600 links
  });

  it("pins the clock chip's second gradient stop to the measured indigo-50", () => {
    // Reference clock chip (measured): linear-gradient(to right bottom,
    // rgb(245,243,255), rgb(238,242,255)) — violet-50 → indigo-50 exactly.
    expect(ACCENT_TOKENS.violet.softest).toBe("245 243 255");
    expect(ACCENT_TOKENS.violet.softestAdjacent).toBe("238 242 255");
  });

  it("pins the S4-G gradient tokens to the measured reference stops", () => {
    // Brand chips + CTA end at indigo-600 (measured rgb(79,70,229)), the
    // avatar uses the LIGHTER violet-400 → indigo-500 pair (measured
    // rgb(167,139,250) → rgb(99,102,241)), and the empty-state block
    // runs violet-100 → indigo-100 (measured rgb(237,233,254) →
    // rgb(224,231,255)). The clone previously routed all of these through
    // primary/strong (violet-500 → violet-600).
    expect(ACCENT_TOKENS.violet.gradientTo).toBe("79 70 229"); // indigo-600
    expect(ACCENT_TOKENS.violet.avatarFrom).toBe("167 139 250"); // violet-400
    expect(ACCENT_TOKENS.violet.avatarTo).toBe("99 102 241"); // indigo-500
    expect(ACCENT_TOKENS.violet.emptyFrom).toBe("237 233 254"); // violet-100
    expect(ACCENT_TOKENS.violet.emptyTo).toBe("224 231 255"); // indigo-100
  });

  it("defines all seven reference accents", () => {
    expect([...ACCENTS]).toEqual([
      "violet",
      "blue",
      "green",
      "orange",
      "pink",
      "red",
      "teal",
    ]);
  });

  it("uses RGB-triplet strings for every token (the reference's convention)", () => {
    for (const accent of ACCENTS) {
      const token = ACCENT_TOKENS[accent];
      for (const value of Object.values(token)) {
        expect(value).toMatch(/^\d+ \d+ \d+$/);
      }
    }
  });
});

describe("isAccent / isThemeMode", () => {
  it("accepts the valid values and rejects the rest", () => {
    expect(isAccent("violet")).toBe(true);
    expect(isAccent("teal")).toBe(true);
    expect(isAccent("purple")).toBe(false);
    expect(isAccent("")).toBe(false);
    expect(isThemeMode("light")).toBe(true);
    expect(isThemeMode("dark")).toBe(true);
    expect(isThemeMode("system")).toBe(true);
    expect(isThemeMode("auto")).toBe(false);
  });
});

describe("resolveMode", () => {
  it("passes explicit modes through and resolves system against the preference", () => {
    expect(resolveMode("light", true)).toBe("light");
    expect(resolveMode("dark", false)).toBe("dark");
    expect(resolveMode("system", true)).toBe("dark");
    expect(resolveMode("system", false)).toBe("light");
  });
});

describe("accentCssVars", () => {
  it("emits the --sf-* variable set for :root", () => {
    const vars = accentCssVars("violet");
    expect(vars["--sf-primary"]).toBe("139 92 246");
    expect(Object.keys(vars)).toContain("--sf-primary-soft");
    expect(Object.keys(vars)).toContain("--sf-primary-strong-dark");
    expect(vars["--sf-primary-softest-adjacent"]).toBe("238 242 255");
  });

  it("emits the COMPLETE token set — deep/softest/adjacent + S4-G gradients included (S3-J regression pin)", () => {
    // applyToDocument historically wrote only 6 of the tokens; the rest kept
    // the violet :root defaults, so non-violet accents left the clock violet.
    // S4-G extends the set with the gradient stops (14 vars total).
    for (const accent of ACCENTS) {
      const vars = accentCssVars(accent);
      const t = ACCENT_TOKENS[accent];
      expect(vars["--sf-primary-deep"]).toBe(t.deep);
      expect(vars["--sf-primary-softest"]).toBe(t.softest);
      expect(vars["--sf-primary-softest-adjacent"]).toBe(t.softestAdjacent);
      expect(vars["--sf-primary-gradient-to"]).toBe(t.gradientTo);
      expect(vars["--sf-primary-avatar-from"]).toBe(t.avatarFrom);
      expect(vars["--sf-primary-avatar-to"]).toBe(t.avatarTo);
      expect(vars["--sf-primary-empty-from"]).toBe(t.emptyFrom);
      expect(vars["--sf-primary-empty-to"]).toBe(t.emptyTo);
      expect(Object.keys(vars)).toHaveLength(14);
    }
  });
});

describe("AVATAR_EMOJIS", () => {
  it("matches the reference's 24-emoji picker", () => {
    expect(AVATAR_EMOJIS).toHaveLength(24);
    expect(AVATAR_EMOJIS[0]).toBe("🎓");
    expect(AVATAR_EMOJIS[7]).toBe("🌟");
  });
});

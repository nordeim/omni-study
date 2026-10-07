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

  it("emits the COMPLETE token set — deep/softest/adjacent included (S3-J regression pin)", () => {
    // applyToDocument historically wrote only 6 of the tokens; the rest kept
    // the violet :root defaults, so non-violet accents left the clock violet.
    for (const accent of ACCENTS) {
      const vars = accentCssVars(accent);
      const t = ACCENT_TOKENS[accent];
      expect(vars["--sf-primary-deep"]).toBe(t.deep);
      expect(vars["--sf-primary-softest"]).toBe(t.softest);
      expect(vars["--sf-primary-softest-adjacent"]).toBe(t.softestAdjacent);
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

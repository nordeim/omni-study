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
  });
});

describe("AVATAR_EMOJIS", () => {
  it("matches the reference's 24-emoji picker", () => {
    expect(AVATAR_EMOJIS).toHaveLength(24);
    expect(AVATAR_EMOJIS[0]).toBe("🎓");
    expect(AVATAR_EMOJIS[7]).toBe("🌟");
  });
});

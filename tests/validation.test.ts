import { describe, expect, it } from "vitest";
import {
  aiChatSchema,
  eventSchema,
  examSchema,
  loginSchema,
  mathSolveSchema,
  preferencesSchema,
  studyGroupSchema,
  subjectSchema,
  taskSchema,
} from "@/lib/validation";

describe("loginSchema", () => {
  it("accepts a valid login and rejects short passwords / bad emails", () => {
    expect(loginSchema.safeParse({ email: "demo@studyflow.app", password: "Demo1234!" }).success).toBe(true);
    expect(loginSchema.safeParse({ email: "demo@studyflow.app", password: "short" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "not-an-email", password: "Demo1234!" }).success).toBe(false);
    expect(loginSchema.safeParse({}).success).toBe(false);
  });
});

describe("taskSchema", () => {
  it("applies defaults and bounds the title", () => {
    const parsed = taskSchema.parse({ title: "Read chapter 4" });
    expect(parsed.completed).toBe(false);
    expect(parsed.important).toBe(false);
    expect(parsed.notes).toBe("");
    expect(taskSchema.safeParse({ title: "" }).success).toBe(false);
    expect(taskSchema.safeParse({ title: "x".repeat(201) }).success).toBe(false);
  });

  it("normalizes empty date strings to null", () => {
    const parsed = taskSchema.parse({ title: "t", dueDate: "" });
    expect(parsed.dueDate).toBeNull();
  });
});

describe("subjectSchema", () => {
  it("validates the hex color format", () => {
    expect(subjectSchema.safeParse({ name: "Math" }).success).toBe(true);
    expect(subjectSchema.parse({ name: "Math" }).color).toBe("#8b5cf6");
    expect(subjectSchema.safeParse({ name: "Math", color: "violet" }).success).toBe(false);
    expect(subjectSchema.safeParse({ name: "Math", color: "#8b5c" }).success).toBe(false);
  });
});

describe("examSchema", () => {
  it("requires a date and accepts optional fields", () => {
    const ok = examSchema.safeParse({ title: "Midterm", date: "2026-10-13T09:00:00" });
    expect(ok.success).toBe(true);
    expect(examSchema.safeParse({ title: "Midterm" }).success).toBe(false);
  });
});

describe("eventSchema", () => {
  it("keeps the color default and the allDay flag", () => {
    const parsed = eventSchema.parse({ title: "Study group", startDate: "2026-10-06T17:00:00" });
    expect(parsed.allDay).toBe(false);
    expect(parsed.color).toBe("#8b5cf6");
  });
});

describe("studyGroupSchema", () => {
  it("caps members at 50 and validates emails", () => {
    const ok = studyGroupSchema.safeParse({
      name: "Calc Crew",
      members: [{ name: "Ari", email: "ari@example.com" }],
    });
    expect(ok.success).toBe(true);
    expect(
      studyGroupSchema.safeParse({
        name: "Crew",
        members: [{ name: "X", email: "not-an-email" }],
      }).success,
    ).toBe(false);
    expect(
      studyGroupSchema.safeParse({
        name: "Crew",
        members: Array.from({ length: 51 }, () => ({ name: "x", email: "" })),
      }).success,
    ).toBe(false);
  });
});

describe("preferencesSchema", () => {
  it("only accepts the documented enum values", () => {
    expect(preferencesSchema.safeParse({ themeMode: "dark", accentColor: "teal" }).success).toBe(true);
    expect(preferencesSchema.safeParse({ themeMode: "auto" }).success).toBe(false);
    expect(preferencesSchema.safeParse({ accentColor: "purple" }).success).toBe(false);
    expect(preferencesSchema.safeParse({ avatarEmoji: "🎓" }).success).toBe(true);
    expect(preferencesSchema.safeParse({ avatarEmoji: "🎓".repeat(9) }).success).toBe(false); // 9 code points > 8 (zod v4 counts code points)
  });
});

describe("aiChatSchema", () => {
  it("requires 1..40 well-formed messages", () => {
    expect(
      aiChatSchema.safeParse({ messages: [{ role: "user", content: "hi" }] }).success,
    ).toBe(true);
    expect(aiChatSchema.safeParse({ messages: [] }).success).toBe(false);
    expect(
      aiChatSchema.safeParse({ messages: [{ role: "system", content: "hi" }] }).success,
    ).toBe(false);
    expect(
      aiChatSchema.safeParse({ messages: [{ role: "user", content: "" }] }).success,
    ).toBe(false);
  });
});

describe("mathSolveSchema", () => {
  it("accepts text problems and validates base64 data URLs", () => {
    expect(mathSolveSchema.safeParse({ problem: "2x + 5 = 15" }).success).toBe(true);
    expect(
      mathSolveSchema.safeParse({ problem: "x", image: "data:image/png;base64,AAAA" }).success,
    ).toBe(true);
    expect(
      mathSolveSchema.safeParse({ problem: "x", image: "https://example.com/x.png" }).success,
    ).toBe(false);
    expect(mathSolveSchema.safeParse({ problem: "" }).success).toBe(false);
  });
});

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
  timetableClassSchema,
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

  it("carries the S5-B2 reference dialog fields: location, repeat, reminders", () => {
    // The reference's New Event dialog (measured) has Location / Link,
    // Repeat (combobox, "No repeat" default) and multi-reminders (minutes
    // before). Reminders persist as a JSON array of minute offsets.
    const parsed = eventSchema.parse({ title: "Study group", startDate: "2026-10-06T17:00:00" });
    expect(parsed.location).toBe("");
    expect(parsed.repeat).toBe("none");
    expect(parsed.reminders).toBe("[]");

    const full = eventSchema.parse({
      title: "Advising",
      startDate: "2026-10-06T17:00:00",
      location: "Room 210",
      repeat: "weekly",
      reminders: "[15,60]",
    });
    expect(full.location).toBe("Room 210");
    expect(full.repeat).toBe("weekly");
    expect(full.reminders).toBe("[15,60]");

    expect(eventSchema.safeParse({ title: "X", startDate: "2026-10-06T17:00:00", repeat: "sometimes" }).success).toBe(false);
    expect(eventSchema.safeParse({ title: "X", startDate: "2026-10-06T17:00:00", reminders: "not-json" }).success).toBe(false);
    expect(eventSchema.safeParse({ title: "X", startDate: "2026-10-06T17:00:00", reminders: "[15," }).success).toBe(false);
  });
});

describe("timetableClassSchema", () => {
  it("defaults weekType to ALL and accepts Week A / Week B (S5-J)", () => {
    // The reference's Timetable header carries an "All Weeks" select with
    // options All Weeks / Week A / Week B (measured) — alternating-week
    // timetables. The schema models it as weekType ALL|A|B.
    const parsed = timetableClassSchema.parse({
      name: "Calculus II",
      dayOfWeek: 0,
      startTime: "9:00",
      endTime: "10:30",
    });
    expect(parsed.weekType).toBe("ALL");
    expect(parsed.room).toBe("");

    const weekA = timetableClassSchema.parse({
      name: "Lab",
      dayOfWeek: 1,
      startTime: "14:00",
      endTime: "16:00",
      weekType: "A",
    });
    expect(weekA.weekType).toBe("A");

    expect(
      timetableClassSchema.safeParse({
        name: "Lab",
        dayOfWeek: 1,
        startTime: "14:00",
        endTime: "16:00",
        weekType: "C",
      }).success,
    ).toBe(false);
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

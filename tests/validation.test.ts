import { describe, expect, it } from "vitest";
import {
  assignmentSchema,
  aiChatSchema,
  eventSchema,
  examSchema,
  flashcardDeckSchema,
  flashcardSchema,
  loginSchema,
  mathSolveSchema,
  practiceTestSchema,
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

  it("carries the S6-B reference dialog fields: priority, repeat, myDay, subtasks", () => {
    // The reference's Add/Edit Task dialog (measured live) has a Priority
    // combobox (None/Low/Medium/High), a Repeat combobox (No repeat/Daily/
    // Weekly/Monthly), a My Day toggle, and a subtask adder. Subtasks
    // persist as a JSON array of {id,title,done} objects.
    const parsed = taskSchema.parse({ title: "t" });
    expect(parsed.priority).toBe("none");
    expect(parsed.repeat).toBe("none");
    expect(parsed.myDay).toBe(false);
    expect(parsed.subtasks).toBe("[]");

    const full = taskSchema.parse({
      title: "t",
      priority: "high",
      repeat: "weekly",
      myDay: true,
      subtasks: '[{"id":"s1","title":"First","done":false}]',
    });
    expect(full.priority).toBe("high");
    expect(full.repeat).toBe("weekly");
    expect(full.myDay).toBe(true);
    expect(full.subtasks).toBe('[{"id":"s1","title":"First","done":false}]');

    expect(taskSchema.safeParse({ title: "t", priority: "urgent" }).success).toBe(false);
    expect(taskSchema.safeParse({ title: "t", repeat: "sometimes" }).success).toBe(false);
    expect(taskSchema.safeParse({ title: "t", subtasks: "not-json" }).success).toBe(false);
    expect(taskSchema.safeParse({ title: "t", subtasks: "[{\"id\":1" }).success).toBe(false);
  });
});

describe("assignmentSchema", () => {
  it("carries the S6-E reference row fields: type, progress, urgent priority", () => {
    // The reference's assignment row (measured) shows a type pill
    // (homework/essay/project/...) and an interactive progress slider
    // (0-100), and its dialog Priority combobox offers Low/Medium/High/Urgent.
    const parsed = assignmentSchema.parse({ title: "Problem set" });
    expect(parsed.type).toBe("homework");
    expect(parsed.progress).toBe(0);
    expect(parsed.priority).toBe("medium");

    const full = assignmentSchema.parse({ title: "P", type: "essay", progress: 65, priority: "urgent" });
    expect(full.type).toBe("essay");
    expect(full.progress).toBe(65);
    expect(full.priority).toBe("urgent");

    expect(assignmentSchema.safeParse({ title: "P", type: "unknown-kind" }).success).toBe(false);
    expect(assignmentSchema.safeParse({ title: "P", progress: 101 }).success).toBe(false);
    expect(assignmentSchema.safeParse({ title: "P", progress: -1 }).success).toBe(false);
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

  it("carries the S6-F reference card fields: type, duration, topics", () => {
    // The reference's exam cards (measured) show a type footer pill
    // (test/quiz/midterm/final/oral/practical) and a "12:00 AM · 60 min"
    // clock line; its dialog has a duration spinbutton (default 60) and a
    // topics adder. Topics persist as a JSON string array.
    const parsed = examSchema.parse({ title: "Midterm", date: "2026-10-13T09:00:00" });
    expect(parsed.type).toBe("test");
    expect(parsed.duration).toBe(60);
    expect(parsed.topics).toBe("[]");

    const full = examSchema.parse({
      title: "Midterm",
      date: "2026-10-13T09:00:00",
      type: "oral",
      duration: 120,
      topics: '["Integrals","Series"]',
    });
    expect(full.type).toBe("oral");
    expect(full.duration).toBe(120);
    expect(full.topics).toBe('["Integrals","Series"]');

    expect(examSchema.safeParse({ title: "M", date: "2026-10-13T09:00:00", type: "final-exam" }).success).toBe(false);
    expect(examSchema.safeParse({ title: "M", date: "2026-10-13T09:00:00", duration: 4 }).success).toBe(false);
    expect(examSchema.safeParse({ title: "M", date: "2026-10-13T09:00:00", duration: 6000 }).success).toBe(false);
    expect(examSchema.safeParse({ title: "M", date: "2026-10-13T09:00:00", topics: "not-json" }).success).toBe(false);
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

describe("flashcardDeckSchema", () => {
  it("carries the S7-A reference dialog fields: color swatch picker", () => {
    // The reference's Create Deck dialog (measured live) offers a 6-swatch
    // Color picker (violet/blue/emerald/amber/red/pink-500); the deck row's
    // 40px icon block renders the picked color inline.
    const parsed = flashcardDeckSchema.parse({ name: "Biology Chapter 5" });
    expect(parsed.color).toBe("#8b5cf6");
    expect(parsed.description).toBe("");

    const blue = flashcardDeckSchema.parse({ name: "B", color: "#3b82f6" });
    expect(blue.color).toBe("#3b82f6");

    expect(flashcardDeckSchema.safeParse({ name: "B", color: "blue" }).success).toBe(false);
    expect(flashcardDeckSchema.safeParse({ name: "B", color: "#8b5cf" }).success).toBe(false);
    expect(flashcardDeckSchema.safeParse({ name: "" }).success).toBe(false);
  });
});

describe("flashcardSchema", () => {
  it("carries the S7-A reference card field: difficulty", () => {
    // The reference's populated card grid renders a difficulty badge
    // (measured "medium" on a live card, bg-yellow-100 text-yellow-700).
    const parsed = flashcardSchema.parse({ front: "Q", back: "A" });
    expect(parsed.difficulty).toBe("medium");
    expect(parsed.mastered).toBe(false);

    const hard = flashcardSchema.parse({ front: "Q", back: "A", difficulty: "hard" });
    expect(hard.difficulty).toBe("hard");

    expect(flashcardSchema.safeParse({ front: "Q", back: "A", difficulty: "impossible" }).success).toBe(false);
  });
});

describe("practiceTestSchema", () => {
  it("carries the S7-B reference dialog field: questions array", () => {
    // The reference's Create Practice Test dialog (measured) builds a
    // scrollable question list (multiple_choice / true_false / short_answer)
    // via AI Generate; questions persist as a JSON array of {question,type}.
    const parsed = practiceTestSchema.parse({ title: "Bio Review" });
    expect(parsed.questions).toBe("[]");
    expect(parsed.durationMinutes).toBe(60);

    const full = practiceTestSchema.parse({
      title: "Bio Review",
      durationMinutes: 45,
      questions: '[{"question":"What is DNA?","type":"short_answer"}]',
    });
    expect(full.questions).toBe('[{"question":"What is DNA?","type":"short_answer"}]');

    expect(practiceTestSchema.safeParse({ title: "T", questions: "not-json" }).success).toBe(false);
    expect(practiceTestSchema.safeParse({ title: "T", questions: '[{"question":"Q","type":"essay"}]' }).success).toBe(false);
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

// Seed — idempotent demo data for local development and the e2e suite.
//   bun run db:seed
// Safe to re-run: it upserts the demo user by email and tops up subject
// rows only when missing.

// The db client applies src/lib/db-path.ts resolution, so DATABASE_URL from
// the environment (e.g. the e2e runner's file:../db/e2e.db) lands on the
// intended database file regardless of the process CWD.
import { db as prisma } from "../src/lib/db";
import { scryptSync, randomBytes } from "node:crypto";

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

async function main() {
  const demoEmail = "demo@studyflow.app";
  const existing = await prisma.user.findUnique({ where: { email: demoEmail } });

  if (existing) {
    console.log(`[seed] demo user ${demoEmail} already present — topping up subjects only`);
    const count = await prisma.subject.count({ where: { userId: existing.id } });
    if (count === 0) {
      await prisma.subject.createMany({
        data: [
          { userId: existing.id, name: "Mathematics", color: "#8b5cf6" },
          { userId: existing.id, name: "Physics", color: "#3b82f6" },
          { userId: existing.id, name: "Literature", color: "#ec4899" },
        ],
      });
    }
    return;
  }

  const user = await prisma.user.create({
    data: {
      email: demoEmail,
      passwordHash: hashPassword("Demo1234!"),
      name: "Demo Student",
      // Empty avatar = reference default state (initial "D" in the gradient
      // circle); pick an emoji in Settings → Appearance to demo the feature.
      avatarEmoji: "",
      themeMode: "system",
      accentColor: "violet",
    },
  });

  const [math, physics, literature] = await Promise.all(
    [
      { name: "Mathematics", color: "#8b5cf6", teacher: "Ms. Tan", room: "B-201" },
      { name: "Physics", color: "#3b82f6", teacher: "Mr. Iyer", room: "Lab 3" },
      { name: "Literature", color: "#ec4899", teacher: "Ms. Duffy", room: "A-105" },
      { name: "History", color: "#f97316", teacher: "Mr. Kahn", room: "C-301" },
      { name: "Chemistry", color: "#14b8a6", teacher: "Dr. Novak", room: "Lab 1" },
    ].map((s) => prisma.subject.create({ data: { ...s, userId: user.id } })),
  );

  const now = new Date();
  const day = (offset: number, hour = 9, minute = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() + offset);
    d.setHours(hour, minute, 0, 0);
    return d;
  };

  await prisma.task.createMany({
    data: [
      // S6 seed — exercises the reference-measured dialog/row fields:
      // priority (checkbox border color), repeat (violet pill), myDay,
      // subtasks (JSON adder data).
      {
        userId: user.id,
        title: "Read chapter 4 — vectors",
        subjectId: math.id,
        dueDate: day(0, 20),
        important: true,
        priority: "high",
        myDay: true,
        subtasks: '[{"id":"st1","title":"Sections 4.1–4.3","done":true},{"id":"st2","title":"Exercises 4a–4c","done":false}]',
      },
      {
        userId: user.id,
        title: "Lab report: pendulum experiment",
        subjectId: physics.id,
        dueDate: day(1, 23, 59),
        priority: "medium",
        myDay: true,
      },
      {
        userId: user.id,
        title: "Weekly vocabulary review",
        subjectId: literature.id,
        dueDate: day(2, 18),
        repeat: "weekly",
      },
      {
        userId: user.id,
        title: "Annotate Keats ode",
        subjectId: literature.id,
        dueDate: day(2, 18),
        priority: "low",
        myDay: true,
      },
      { userId: user.id, title: "Flashcards: integration rules", subjectId: math.id, completed: true, dueDate: day(-1, 20) },
    ],
  });

  await prisma.assignment.createMany({
    data: [
      {
        userId: user.id,
        title: "Problem set 6 — dot products",
        subjectId: math.id,
        dueDate: day(2, 23, 59),
        priority: "high",
        description: "Exercises 1–20, skip 13.",
        type: "worksheet",
        progress: 45,
      },
      {
        userId: user.id,
        title: "Essay: symbolism in Wuthering Heights",
        subjectId: literature.id,
        dueDate: day(5, 23, 59),
        priority: "medium",
        type: "essay",
        progress: 20,
      },
    ],
  });

  await prisma.exam.createMany({
    data: [
      {
        userId: user.id,
        title: "Midterm — Classical Mechanics",
        subjectId: physics.id,
        date: day(7, 9),
        endTime: day(7, 11),
        location: "Exam Hall B",
        type: "midterm",
        duration: 120,
        topics: '["Lagrangians","Oscillations"]',
      },
      {
        userId: user.id,
        title: "Quiz — Integration Techniques",
        subjectId: math.id,
        date: day(3, 10),
        endTime: day(3, 10, 45),
        location: "B-201",
        type: "quiz",
        duration: 45,
        topics: '["Substitution","By parts"]',
      },
    ],
  });

  await prisma.event.createMany({
    data: [
      { userId: user.id, title: "Study group — calculus", startDate: day(0, 17), endDate: day(0, 18, 30), color: "#8b5cf6", location: "Library room 2B", reminders: "[30]" },
      { userId: user.id, title: "Library reservation", startDate: day(1, 14), endDate: day(1, 17), color: "#3b82f6", location: "Main reading hall" },
      { userId: user.id, title: "Career fair", startDate: day(4, 10), endDate: day(4, 16), color: "#f97316", location: "Sports hall", reminders: "[60,1440]" },
      // S5-B2 — a weekly recurring event exercises the Repeat expansion.
      { userId: user.id, title: "Weekly advisor check-in", startDate: day(0, 11), endDate: day(0, 11, 30), color: "#22c55e", repeat: "weekly", reminders: "[15]" },
    ],
  });

  await prisma.timetableClass.createMany({
    data: [
      { userId: user.id, name: "Calculus II", subjectId: math.id, dayOfWeek: 0, startTime: "09:00", endTime: "10:30", room: "B-201", teacher: "Ms. Tan", color: "#8b5cf6" },
      { userId: user.id, name: "Mechanics", subjectId: physics.id, dayOfWeek: 0, startTime: "11:00", endTime: "12:30", room: "Lab 3", teacher: "Mr. Iyer", color: "#3b82f6" },
      { userId: user.id, name: "Victorian Lit", subjectId: literature.id, dayOfWeek: 1, startTime: "09:00", endTime: "10:30", room: "A-105", teacher: "Ms. Duffy", color: "#ec4899" },
      { userId: user.id, name: "Calculus II", subjectId: math.id, dayOfWeek: 2, startTime: "09:00", endTime: "10:30", room: "B-201", teacher: "Ms. Tan", color: "#8b5cf6" },
      { userId: user.id, name: "Organic Chemistry", subjectId: undefined, dayOfWeek: 2, startTime: "13:00", endTime: "15:00", room: "Lab 1", teacher: "Dr. Novak", color: "#14b8a6" },
      { userId: user.id, name: "Modern History", subjectId: undefined, dayOfWeek: 3, startTime: "10:00", endTime: "11:30", room: "C-301", teacher: "Mr. Kahn", color: "#f97316" },
      { userId: user.id, name: "Mechanics Lab", subjectId: physics.id, dayOfWeek: 4, startTime: "14:00", endTime: "16:00", room: "Lab 3", teacher: "Mr. Iyer", color: "#3b82f6" },
      // S5-J — alternating-week classes exercise the Week A / Week B model.
      { userId: user.id, name: "Discrete Math (A-week)", subjectId: math.id, dayOfWeek: 1, startTime: "13:00", endTime: "14:30", room: "D-102", teacher: "Dr. Rao", color: "#8b5cf6", weekType: "A" },
      { userId: user.id, name: "Stats Lab (B-week)", subjectId: math.id, dayOfWeek: 3, startTime: "15:00", endTime: "17:00", room: "Lab 2", teacher: "Dr. Rao", color: "#ec4899", weekType: "B" },
    ].map((c) => ({ ...c, subjectId: c.subjectId ?? null })),
  });

  const notebook = await prisma.notebook.create({
    data: { userId: user.id, name: "Semester Notes", color: "#8b5cf6" },
  });
  await prisma.note.createMany({
    data: [
      {
        userId: user.id,
        notebookId: notebook.id,
        title: "Dot product intuition",
        content: "The dot product measures alignment: positive = same direction, zero = perpendicular.\n\na·b = |a||b|cos(θ)",
        tags: "math,vectors",
        pinned: true,
      },
      {
        userId: user.id,
        notebookId: notebook.id,
        title: "Pendulum lab method",
        content: "Measure 10 oscillations, divide by 10. Keep amplitude < 15° for the small-angle approximation.",
        tags: "physics,lab",
      },
    ],
  });

  const deck = await prisma.flashcardDeck.create({
    data: { userId: user.id, name: "Integration rules", description: "Core techniques", subjectId: math.id },
  });
  await prisma.flashcard.createMany({
    data: [
      { deckId: deck.id, front: "d/dx of sin(x)", back: "cos(x)", order: 0 },
      { deckId: deck.id, front: "∫ 1/x dx", back: "ln|x| + C", order: 1 },
      { deckId: deck.id, front: "Chain rule", back: "(f∘g)'(x) = f'(g(x))·g'(x)", order: 2 },
      { deckId: deck.id, front: "d/dx of tan(x)", back: "sec²(x)", order: 3 },
    ],
  });

  await prisma.practiceTest.createMany({
    data: [
      {
        userId: user.id,
        title: "Vectors practice set",
        subjectId: math.id,
        date: day(-2, 15),
        status: "completed",
        totalQuestions: 20,
        correctCount: 17,
        score: 85,
        durationMinutes: 40,
      },
      { userId: user.id, title: "Mechanics mock paper", subjectId: physics.id, date: day(1, 15), status: "created", totalQuestions: 30, durationMinutes: 90 },
    ],
  });

  await prisma.studyGroup.create({
    data: {
      userId: user.id,
      name: "Calc Crew",
      description: "Weekly integration drills",
      subjectId: math.id,
      color: "#8b5cf6",
      members: JSON.stringify([
        { name: "Ari", email: "ari@example.com" },
        { name: "Bea", email: "" },
      ]),
      nextMeeting: day(0, 17),
    },
  });

  await prisma.grade.createMany({
    data: [
      { userId: user.id, subjectId: math.id, assessment: "Problem set 5", score: 92, maxScore: 100, type: "assignment", date: day(-14) },
      { userId: user.id, subjectId: math.id, assessment: "Vectors quiz", score: 17, maxScore: 20, type: "quiz", date: day(-10) },
      { userId: user.id, subjectId: physics.id, assessment: "Kinematics test", score: 84, maxScore: 100, weight: 2, type: "exam", date: day(-7) },
      { userId: user.id, subjectId: literature.id, assessment: "Essay — Romanticism", score: 88, maxScore: 100, type: "assignment", date: day(-5) },
    ].map((g) => ({ ...g, date: g.date })),
  });

  await prisma.focusSession.createMany({
    data: [
      { userId: user.id, subjectId: math.id, durationMinutes: 50, mode: "focus", date: day(-9, 16) },
      { userId: user.id, subjectId: physics.id, durationMinutes: 25, mode: "focus", date: day(-6, 10) },
      { userId: user.id, subjectId: literature.id, durationMinutes: 50, mode: "focus", date: day(-3, 20) },
      { userId: user.id, subjectId: math.id, durationMinutes: 25, mode: "focus", date: day(-1, 15) },
    ],
  });

  console.log(`[seed] created demo user ${demoEmail} (password: Demo1234!) with sample data`);
}

main()
  .catch((err) => {
    console.error("[seed] failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

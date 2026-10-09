import { z } from "zod";

// ---------------------------------------------------------------------------
// Validation schemas — every API boundary validates its payload (the
// scandihaven convention: "Zod at every boundary"). Strings are bounded to
// stop oversized payloads; dates arrive as ISO strings.
// ---------------------------------------------------------------------------

const bounded = (max: number) => z.string().max(max);
const isoDate = z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}(T.*)?$/));
const optionalIsoDate = isoDate.nullish().or(z.literal("")).transform((v) => (v === "" ? null : v));

export const loginSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(8).max(200),
});

export const registerSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(8).max(200),
  name: bounded(80).default(""),
});

// S15 — the auth-flow depth schemas (see docs/remediation-plan-session15.md).
export const verifyEmailSchema = z.object({
  email: z.string().email().max(200),
  code: z.string().regex(/^\d{6}$/, "The code is 6 digits"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email().max(200),
});

export const resetPasswordSchema = z.object({
  token: z.string().regex(/^[0-9a-f]{48}$/, "Malformed reset token"),
  password: z.string().min(8).max(200),
});

// S24 (ADR-022) — the account-security rotation schema. The register
// family's policy applies to BOTH fields (min 8 / max 200 — ONE policy, no
// drift), and the same-password rejection rides the object's refine so the
// route's safeParse failure message IS the actionable copy (the caller is
// the authenticated account owner — no enumeration surface).
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8).max(200),
    newPassword: z.string().min(8).max(200),
  })
  .refine((v) => v.currentPassword !== v.newPassword, {
    message: "The new password must be different from your current password.",
  });

// S25 (ADR-023) — the ownership-exit schema. The password proof applies the
// register family's policy (min 8 / max 200 — ONE policy, no drift), and
// the typed-confirmation rule rides the object's refine so the route's
// safeParse failure message IS the actionable copy — the word is CASE-EXACT
// by design (a deliberate, unambiguous gesture before an irreversible
// cascade write).
export const deleteAccountSchema = z
  .object({
    password: z.string().min(8).max(200),
    confirmation: z.string(),
  })
  .refine((v) => v.confirmation === "DELETE", {
    message: "Type DELETE to confirm.",
  });

export const subjectSchema = z.object({
  name: bounded(80).min(1),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#8b5cf6"),
  teacher: bounded(80).default(""),
  room: bounded(80).default(""),
});

export const taskSchema = z.object({
  title: bounded(200).min(1),
  notes: bounded(2000).default(""),
  completed: z.boolean().default(false),
  important: z.boolean().default(false),
  dueDate: optionalIsoDate,
  listId: z.string().max(40).nullish(),
  subjectId: z.string().max(40).nullish(),
  // S6-B — the reference's Add/Edit Task dialog fields (measured live):
  // Priority combobox (None/Low/Medium/High), Repeat combobox (No repeat/
  // Daily/Weekly/Monthly), My Day toggle, subtask adder.
  priority: z.enum(["none", "low", "medium", "high"]).default("none"),
  repeat: z.enum(["none", "daily", "weekly", "monthly"]).default("none"),
  myDay: z.boolean().default(false),
  // JSON array of {id,title,done} subtask objects.
  subtasks: z
    .string()
    .max(4000)
    .default("[]")
    .refine(
      (v) => {
        try {
          const parsed: unknown = JSON.parse(v);
          return (
            Array.isArray(parsed) &&
            parsed.every(
              (s) =>
                typeof s === "object" &&
                s !== null &&
                typeof (s as { id?: unknown }).id === "string" &&
                typeof (s as { title?: unknown }).title === "string" &&
                typeof (s as { done?: unknown }).done === "boolean",
            )
          );
        } catch {
          return false;
        }
      },
      { message: "subtasks must be a JSON array of {id,title,done}" },
    ),
});

export const taskPatchSchema = taskSchema.partial();

export const taskListSchema = z.object({
  name: bounded(80).min(1),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#8b5cf6"),
});

export const assignmentSchema = z.object({
  title: bounded(200).min(1),
  description: bounded(4000).default(""),
  subjectId: z.string().max(40).nullish(),
  dueDate: optionalIsoDate,
  status: z.enum(["active", "submitted", "graded"]).default("active"),
  // S6-E — the reference's combobox option sets (measured): Priority adds
  // "Urgent" beyond the clone's low/medium/high; Type is new.
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  score: z.number().min(0).max(100000).nullish(),
  maxScore: z.number().min(0).max(100000).nullish(),
  type: z
    .enum(["homework", "essay", "project", "reading", "worksheet", "presentation", "study", "other"])
    .default("homework"),
  progress: z.number().int().min(0).max(100).default(0),
});

export const assignmentPatchSchema = assignmentSchema.partial();

export const examSchema = z.object({
  title: bounded(200).min(1),
  subjectId: z.string().max(40).nullish(),
  date: isoDate,
  endTime: optionalIsoDate,
  location: bounded(120).default(""),
  notes: bounded(2000).default(""),
  status: z.enum(["upcoming", "done"]).default("upcoming"),
  // S6-F — the reference's exam dialog/card fields (measured): Type
  // combobox (Test/Quiz/Midterm/Final/Oral/Practical), duration spinbutton
  // (default 60 minutes), topics adder (JSON string array).
  type: z.enum(["test", "quiz", "midterm", "final", "oral", "practical"]).default("test"),
  duration: z.number().int().min(5).max(600).default(60),
  topics: z
    .string()
    .max(2000)
    .default("[]")
    .refine(
      (v) => {
        try {
          const parsed: unknown = JSON.parse(v);
          return Array.isArray(parsed) && parsed.every((t) => typeof t === "string");
        } catch {
          return false;
        }
      },
      { message: "topics must be a JSON array of strings" },
    ),
});

export const examPatchSchema = examSchema.partial();

export const eventSchema = z.object({
  title: bounded(200).min(1),
  description: bounded(2000).default(""),
  startDate: isoDate,
  endDate: optionalIsoDate,
  allDay: z.boolean().default(false),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#8b5cf6"),
  // S5-B2 — the reference's New Event dialog fields (measured):
  // "Location / Link" free text, "Repeat" combobox, multi-"Reminders".
  location: bounded(160).default(""),
  repeat: z.enum(["none", "daily", "weekly", "monthly"]).default("none"),
  // JSON array of minute-offsets before start, e.g. "[15,60]".
  reminders: z
    .string()
    .max(200)
    .default("[]")
    .refine(
      (v) => {
        try {
          const parsed: unknown = JSON.parse(v);
          return (
            Array.isArray(parsed) &&
            parsed.every((n) => typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= 10080)
          );
        } catch {
          return false;
        }
      },
      { message: "reminders must be a JSON array of minute offsets" },
    ),
});

export const eventPatchSchema = eventSchema.partial();

export const timetableClassSchema = z.object({
  name: bounded(120).min(1),
  subjectId: z.string().max(40).nullish(),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{1,2}:\d{2}$/),
  endTime: z.string().regex(/^\d{1,2}:\d{2}$/),
  room: bounded(80).default(""),
  teacher: bounded(80).default(""),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#8b5cf6"),
  // S5-J — the reference's "All Weeks / Week A / Week B" select (measured):
  // alternating-week timetables.
  weekType: z.enum(["ALL", "A", "B"]).default("ALL"),
});

export const timetableClassPatchSchema = timetableClassSchema.partial();

export const notebookSchema = z.object({
  name: bounded(80).min(1),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#8b5cf6"),
});

export const noteSchema = z.object({
  title: bounded(200).default("Untitled"),
  content: bounded(50000).default(""),
  notebookId: z.string().max(40).nullish(),
  tags: bounded(500).default(""),
  pinned: z.boolean().default(false),
});

export const notePatchSchema = noteSchema.partial();

export const flashcardDeckSchema = z.object({
  name: bounded(120).min(1),
  description: bounded(1000).default(""),
  // S7-A: the reference's Create Deck dialog has a 6-swatch Color picker
  // (violet/blue/emerald/amber/red/pink-500) — the deck row's 40px icon
  // block renders the picked color.
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#8b5cf6"),
  subjectId: z.string().max(40).nullish(),
});

export const flashcardSchema = z.object({
  front: bounded(2000).min(1),
  back: bounded(2000).min(1),
  // S7-A: the reference's card grid renders a difficulty badge (measured
  // "medium", bg-yellow-100 text-yellow-700).
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  mastered: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
});

export const flashcardPatchSchema = flashcardSchema.partial();

export const practiceTestSchema = z.object({
  title: bounded(200).min(1),
  subjectId: z.string().max(40).nullish(),
  date: optionalIsoDate,
  // S7-B: the reference's Create Practice Test dialog builds a question
  // list (multiple_choice/true_false/short_answer) — persisted as JSON.
  questions: z
    .string()
    .max(20000)
    .default("[]")
    .refine(
      (v) => {
        try {
          const parsed: unknown = JSON.parse(v);
          return (
            Array.isArray(parsed) &&
            parsed.every(
              (q) =>
                typeof q === "object" &&
                q !== null &&
                typeof (q as { question?: unknown }).question === "string" &&
                (q as { type?: unknown }).type !== undefined &&
                ["multiple_choice", "true_false", "short_answer"].includes(
                  (q as { type: unknown }).type as string,
                )
            )
          );
        } catch {
          return false;
        }
      },
      { message: "questions must be a JSON array of {question,type}" },
    ),
  totalQuestions: z.number().int().min(0).max(500).default(0),
  // S7-B: the reference's "Time Limit (minutes)" spinbutton defaults to 60.
  durationMinutes: z.number().int().min(0).max(600).default(60),
});

export const practiceTestPatchSchema = practiceTestSchema.partial().extend({
  status: z.enum(["created", "in_progress", "completed"]).optional(),
  correctCount: z.number().int().min(0).max(500).optional(),
  score: z.number().min(0).max(100000).nullish(),
});

export const studyGroupSchema = z.object({
  name: bounded(120).min(1),
  description: bounded(2000).default(""),
  subjectId: z.string().max(40).nullish(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#8b5cf6"),
  members: z.array(z.object({ name: bounded(80), email: z.string().email().max(200).or(z.literal("")) })).max(50).default([]),
  nextMeeting: optionalIsoDate,
});

export const studyGroupPatchSchema = studyGroupSchema.partial();

export const gradeSchema = z.object({
  subjectId: z.string().max(40).nullish(),
  assessment: bounded(200).min(1),
  score: z.number().min(0).max(100000),
  maxScore: z.number().min(0).max(100000).default(100),
  weight: z.number().min(0).max(100).default(1),
  type: z.enum(["assignment", "exam", "quiz", "project"]).default("assignment"),
  date: isoDate,
});

export const gradePatchSchema = gradeSchema.partial();

export const focusSessionSchema = z.object({
  subjectId: z.string().max(40).nullish(),
  durationMinutes: z.number().int().min(1).max(24 * 60),
  mode: z.enum(["focus", "short_break", "long_break"]).default("focus"),
  date: isoDate,
});

export const fileFolderSchema = z.object({
  name: bounded(120).min(1),
  parentId: z.string().max(40).nullish(),
});

export const fileLinkSchema = z.object({
  name: bounded(200).min(1),
  url: z.string().url().max(2000),
  folderId: z.string().max(40).nullish(),
});

export const calculatorHistorySchema = z.object({
  expression: bounded(500).min(1),
  result: bounded(500).min(1),
  mode: z.enum(["basic", "scientific", "gpa", "converter"]).default("basic"),
});

export const holidaySchema = z.object({
  name: bounded(120).min(1),
  date: isoDate,
});

// S17-A — the reference's Profile tab persists four study-profile fields on
// its User entity (captured from the reference's own PUT body; see
// docs/remediation-plan-session17.md). The Grade Level enum is the
// reference-measured 12-option list; the study goal mirrors the reference's
// 1–12 hour slider; notificationsEnabled is the Notifications master toggle.
const GRADE_LEVELS = [
  "6th Grade", "7th Grade", "8th Grade", "9th Grade", "10th Grade", "11th Grade", "12th Grade",
  "College Freshman", "College Sophomore", "College Junior", "College Senior", "Graduate",
] as const;

export const preferencesSchema = z.object({
  themeMode: z.enum(["light", "dark", "system"]).optional(),
  accentColor: z.enum(["violet", "blue", "green", "orange", "pink", "red", "teal"]).optional(),
  avatarEmoji: z.string().max(8).optional(),
  name: bounded(80).optional(),
  schoolName: bounded(120).optional(),
  gradeLevel: z.enum(GRADE_LEVELS).optional(),
  studyGoalHours: z.number().int().min(1).max(12).optional(),
  notificationsEnabled: z.boolean().optional(),
});

export const GRADE_LEVEL_OPTIONS = GRADE_LEVELS;

export const aiChatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(8000),
      }),
    )
    .min(1)
    .max(40),
  mode: z.enum(["chat", "explain", "tips", "summarize", "solve", "translate", "essay"]).default("chat"),
});

export const mathSolveSchema = z.object({
  problem: z.string().min(1).max(2000),
  image: z
    .string()
    .max(6 * 1024 * 1024)
    .regex(/^data:image\/[a-z+]+;base64,[A-Za-z0-9\/=]+$/)
    .optional(),
});

// S7-A: AI card generation for a flashcard deck (server-side SDK route).
export const aiGenerateCardsSchema = z.object({
  deckId: z.string().min(1).max(40),
  count: z.number().int().min(1).max(20).default(6),
});

// S7-B: AI question generation for a practice test (server-side SDK route).
export const aiGenerateQuestionsSchema = z.object({
  title: z.string().min(1).max(200),
  context: z.string().max(500).default(""),
  count: z.number().int().min(1).max(20).default(10),
});

// S18 (ADR-016) — the RUM hook's inbound shapes. One event per
// (sessionId, metric) report the authed beacon POSTs; the route UPSERTS
// on that pair so web-vitals' final-value-wins semantics update in place.
// The enums mirror the web-vitals v6 Metric type exactly (name/rating/
// navigationType unions). Bounds keep the store tidy; unknown keys are
// stripped per the repo-wide Zod convention.
export const RUM_METRICS = ["TTFB", "FCP", "LCP", "CLS", "INP"] as const;
export const RUM_RATINGS = ["good", "needs-improvement", "poor"] as const;
export const RUM_NAVIGATION_TYPES = [
  "navigate",
  "reload",
  "back-forward",
  "back-forward-cache",
  "prerender",
  "restore",
  "soft-navigation",
] as const;

export const rumEventSchema = z.object({
  metric: z.enum(RUM_METRICS),
  value: z.number().min(0),
  rating: z.enum(RUM_RATINGS),
  navigationType: z.enum(RUM_NAVIGATION_TYPES).default("navigate"),
  path: z.string().max(200).default(""),
  userAgent: z.string().max(300).default(""),
});

export const rumBatchSchema = z.object({
  sessionId: z.string().min(1).max(100),
  events: z.array(rumEventSchema).min(1).max(10),
});

export type RumEventInput = z.infer<typeof rumEventSchema>;
export type RumBatchInput = z.infer<typeof rumBatchSchema>;

export type LoginInput = z.infer<typeof loginSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type AssignmentInput = z.infer<typeof assignmentSchema>;
export type ExamInput = z.infer<typeof examSchema>;
export type EventInput = z.infer<typeof eventSchema>;
export type NoteInput = z.infer<typeof noteSchema>;
export type StudyGroupInput = z.infer<typeof studyGroupSchema>;
export type GradeInput = z.infer<typeof gradeSchema>;

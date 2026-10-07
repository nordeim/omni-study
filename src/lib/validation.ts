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
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  score: z.number().min(0).max(100000).nullish(),
  maxScore: z.number().min(0).max(100000).nullish(),
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
});

export const examPatchSchema = examSchema.partial();

export const eventSchema = z.object({
  title: bounded(200).min(1),
  description: bounded(2000).default(""),
  startDate: isoDate,
  endDate: optionalIsoDate,
  allDay: z.boolean().default(false),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#8b5cf6"),
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
  subjectId: z.string().max(40).nullish(),
});

export const flashcardSchema = z.object({
  front: bounded(2000).min(1),
  back: bounded(2000).min(1),
  mastered: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
});

export const flashcardPatchSchema = flashcardSchema.partial();

export const practiceTestSchema = z.object({
  title: bounded(200).min(1),
  subjectId: z.string().max(40).nullish(),
  date: optionalIsoDate,
  totalQuestions: z.number().int().min(0).max(500).default(0),
  durationMinutes: z.number().int().min(0).max(600).nullish(),
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

export const preferencesSchema = z.object({
  themeMode: z.enum(["light", "dark", "system"]).optional(),
  accentColor: z.enum(["violet", "blue", "green", "orange", "pink", "red", "teal"]).optional(),
  avatarEmoji: z.string().max(8).optional(),
  name: bounded(80).optional(),
});

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

export type LoginInput = z.infer<typeof loginSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type AssignmentInput = z.infer<typeof assignmentSchema>;
export type ExamInput = z.infer<typeof examSchema>;
export type EventInput = z.infer<typeof eventSchema>;
export type NoteInput = z.infer<typeof noteSchema>;
export type StudyGroupInput = z.infer<typeof studyGroupSchema>;
export type GradeInput = z.infer<typeof gradeSchema>;

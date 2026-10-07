import { db } from "@/lib/db";
import { BadRequestError, NotFoundError, parseWith, toDate } from "@/lib/server/http";
import {
  assignmentPatchSchema,
  assignmentSchema,
  flashcardDeckSchema,
  focusSessionSchema,
  eventPatchSchema,
  eventSchema,
  examPatchSchema,
  examSchema,
  flashcardPatchSchema,
  flashcardSchema,
  gradePatchSchema,
  gradeSchema,
  holidaySchema,
  notebookSchema,
  notePatchSchema,
  noteSchema,
  practiceTestPatchSchema,
  practiceTestSchema,
  studyGroupPatchSchema,
  studyGroupSchema,
  subjectSchema,
  taskListSchema,
  taskPatchSchema,
  taskSchema,
  timetableClassPatchSchema,
  timetableClassSchema,
} from "@/lib/validation";
import type { CrudDelegate } from "@/lib/server/http";

// ---------------------------------------------------------------------------
// Entity CRUD delegates — every query is scoped by userId (ownership is
// enforced in the WHERE clause, not after the fetch). Input flows through
// the Zod schemas from src/lib/validation.ts before touching Prisma.
// ---------------------------------------------------------------------------

async function owned<T>(
  userId: string,
  id: string,
  query: () => Promise<T | null>,
): Promise<T> {
  const record = await query();
  if (!record) throw new NotFoundError("Record not found");
  return record;
}

// ---- Tasks ------------------------------------------------------------------

type TaskPayload = Record<string, unknown>;

export const tasksDelegate: CrudDelegate<TaskPayload, TaskPayload> = {
  list: (userId) =>
    db.task.findMany({ where: { userId }, orderBy: [{ completed: "asc" }, { createdAt: "desc" }] }),
  create: async (userId, input) => {
    const data = parseWith(taskSchema, input);
    return db.task.create({
      data: {
        userId,
        title: data.title,
        notes: data.notes,
        completed: data.completed,
        important: data.important,
        dueDate: toDate(data.dueDate) ?? null,
        listId: data.listId || null,
        subjectId: data.subjectId || null,
        priority: data.priority,
        repeat: data.repeat,
        myDay: data.myDay,
        subtasks: data.subtasks,
      },
    });
  },
  update: async (userId, id, input) => {
    const patch = parseWith(taskPatchSchema, input);
    await owned(userId, id, () => db.task.findFirst({ where: { id, userId } }));
    return db.task.update({
      where: { id },
      data: {
        ...(patch.title !== undefined ? { title: patch.title } : {}),
        ...(patch.notes !== undefined ? { notes: patch.notes } : {}),
        ...(patch.completed !== undefined ? { completed: patch.completed } : {}),
        ...(patch.important !== undefined ? { important: patch.important } : {}),
        ...(patch.dueDate !== undefined ? { dueDate: toDate(patch.dueDate) ?? null } : {}),
        ...(patch.listId !== undefined ? { listId: patch.listId || null } : {}),
        ...(patch.subjectId !== undefined ? { subjectId: patch.subjectId || null } : {}),
        ...(patch.priority !== undefined ? { priority: patch.priority } : {}),
        ...(patch.repeat !== undefined ? { repeat: patch.repeat } : {}),
        ...(patch.myDay !== undefined ? { myDay: patch.myDay } : {}),
        ...(patch.subtasks !== undefined ? { subtasks: patch.subtasks } : {}),
      },
    });
  },
  remove: async (userId, id) => {
    await owned(userId, id, () => db.task.findFirst({ where: { id, userId } }));
    await db.task.delete({ where: { id } });
  },
};

// ---- Task lists ---------------------------------------------------------------

export const taskListsDelegate: CrudDelegate<Record<string, unknown>, Record<string, unknown>> = {
  list: (userId) => db.taskList.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
  create: async (userId, input) => {
    const data = parseWith(taskListSchema, input);
    return db.taskList.create({ data: { userId, name: data.name, color: data.color } });
  },
  update: async (userId, id, input) => {
    const patch = parseWith(taskListSchema.partial(), input);
    await owned(userId, id, () => db.taskList.findFirst({ where: { id, userId } }));
    return db.taskList.update({ where: { id }, data: patch });
  },
  remove: async (userId, id) => {
    await owned(userId, id, () => db.taskList.findFirst({ where: { id, userId } }));
    await db.taskList.delete({ where: { id } });
  },
};

// ---- Subjects -----------------------------------------------------------------

export const subjectsDelegate: CrudDelegate<Record<string, unknown>, Record<string, unknown>> = {
  list: (userId) => db.subject.findMany({ where: { userId }, orderBy: { name: "asc" } }),
  create: async (userId, input) => {
    const data = parseWith(subjectSchema, input);
    return db.subject.create({
      data: { userId, name: data.name, color: data.color, teacher: data.teacher, room: data.room },
    });
  },
  update: async (userId, id, input) => {
    const patch = parseWith(subjectSchema.partial(), input);
    await owned(userId, id, () => db.subject.findFirst({ where: { id, userId } }));
    return db.subject.update({ where: { id }, data: patch });
  },
  remove: async (userId, id) => {
    await owned(userId, id, () => db.subject.findFirst({ where: { id, userId } }));
    await db.subject.delete({ where: { id } });
  },
};

// ---- Assignments ---------------------------------------------------------------

export const assignmentsDelegate: CrudDelegate<Record<string, unknown>, Record<string, unknown>> = {
  list: (userId) =>
    db.assignment.findMany({ where: { userId }, orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }] }),
  create: async (userId, input) => {
    const data = parseWith(assignmentSchema, input);
    return db.assignment.create({
      data: {
        userId,
        title: data.title,
        description: data.description,
        subjectId: data.subjectId || null,
        dueDate: toDate(data.dueDate) ?? null,
        status: data.status,
        priority: data.priority,
        score: data.score ?? null,
        maxScore: data.maxScore ?? null,
        type: data.type,
        progress: data.progress,
      },
    });
  },
  update: async (userId, id, input) => {
    const patch = parseWith(assignmentPatchSchema, input);
    await owned(userId, id, () => db.assignment.findFirst({ where: { id, userId } }));
    return db.assignment.update({
      where: { id },
      data: {
        ...(patch.title !== undefined ? { title: patch.title } : {}),
        ...(patch.description !== undefined ? { description: patch.description } : {}),
        ...(patch.subjectId !== undefined ? { subjectId: patch.subjectId || null } : {}),
        ...(patch.dueDate !== undefined ? { dueDate: toDate(patch.dueDate) ?? null } : {}),
        ...(patch.status !== undefined ? { status: patch.status } : {}),
        ...(patch.priority !== undefined ? { priority: patch.priority } : {}),
        ...(patch.score !== undefined ? { score: patch.score ?? null } : {}),
        ...(patch.maxScore !== undefined ? { maxScore: patch.maxScore ?? null } : {}),
        ...(patch.type !== undefined ? { type: patch.type } : {}),
        ...(patch.progress !== undefined ? { progress: patch.progress } : {}),
      },
    });
  },
  remove: async (userId, id) => {
    await owned(userId, id, () => db.assignment.findFirst({ where: { id, userId } }));
    await db.assignment.delete({ where: { id } });
  },
};

// ---- Exams -----------------------------------------------------------------------

export const examsDelegate: CrudDelegate<Record<string, unknown>, Record<string, unknown>> = {
  list: (userId) => db.exam.findMany({ where: { userId }, orderBy: { date: "asc" } }),
  create: async (userId, input) => {
    const data = parseWith(examSchema, input);
    return db.exam.create({
      data: {
        userId,
        title: data.title,
        subjectId: data.subjectId || null,
        date: toDate(data.date) ?? new Date(),
        endTime: toDate(data.endTime) ?? null,
        location: data.location,
        notes: data.notes,
        status: data.status,
        type: data.type,
        duration: data.duration,
        topics: data.topics,
      },
    });
  },
  update: async (userId, id, input) => {
    const patch = parseWith(examPatchSchema, input);
    await owned(userId, id, () => db.exam.findFirst({ where: { id, userId } }));
    return db.exam.update({
      where: { id },
      data: {
        ...(patch.title !== undefined ? { title: patch.title } : {}),
        ...(patch.subjectId !== undefined ? { subjectId: patch.subjectId || null } : {}),
        ...(patch.date !== undefined ? { date: toDate(patch.date) ?? new Date() } : {}),
        ...(patch.endTime !== undefined ? { endTime: toDate(patch.endTime) ?? null } : {}),
        ...(patch.location !== undefined ? { location: patch.location } : {}),
        ...(patch.notes !== undefined ? { notes: patch.notes } : {}),
        ...(patch.status !== undefined ? { status: patch.status } : {}),
        ...(patch.type !== undefined ? { type: patch.type } : {}),
        ...(patch.duration !== undefined ? { duration: patch.duration } : {}),
        ...(patch.topics !== undefined ? { topics: patch.topics } : {}),
      },
    });
  },
  remove: async (userId, id) => {
    await owned(userId, id, () => db.exam.findFirst({ where: { id, userId } }));
    await db.exam.delete({ where: { id } });
  },
};

// ---- Events ----------------------------------------------------------------------

export const eventsDelegate: CrudDelegate<Record<string, unknown>, Record<string, unknown>> = {
  list: (userId) => db.event.findMany({ where: { userId }, orderBy: { startDate: "asc" } }),
  create: async (userId, input) => {
    const data = parseWith(eventSchema, input);
    return db.event.create({
      data: {
        userId,
        title: data.title,
        description: data.description,
        startDate: toDate(data.startDate) ?? new Date(),
        endDate: toDate(data.endDate) ?? null,
        allDay: data.allDay,
        color: data.color,
        location: data.location,
        repeat: data.repeat,
        reminders: data.reminders,
      },
    });
  },
  update: async (userId, id, input) => {
    const patch = parseWith(eventPatchSchema, input);
    await owned(userId, id, () => db.event.findFirst({ where: { id, userId } }));
    return db.event.update({
      where: { id },
      data: {
        ...(patch.title !== undefined ? { title: patch.title } : {}),
        ...(patch.description !== undefined ? { description: patch.description } : {}),
        ...(patch.startDate !== undefined ? { startDate: toDate(patch.startDate) ?? new Date() } : {}),
        ...(patch.endDate !== undefined ? { endDate: toDate(patch.endDate) ?? null } : {}),
        ...(patch.allDay !== undefined ? { allDay: patch.allDay } : {}),
        ...(patch.color !== undefined ? { color: patch.color } : {}),
        ...(patch.location !== undefined ? { location: patch.location } : {}),
        ...(patch.repeat !== undefined ? { repeat: patch.repeat } : {}),
        ...(patch.reminders !== undefined ? { reminders: patch.reminders } : {}),
      },
    });
  },
  remove: async (userId, id) => {
    await owned(userId, id, () => db.event.findFirst({ where: { id, userId } }));
    await db.event.delete({ where: { id } });
  },
};

// ---- Timetable classes --------------------------------------------------------------

export const timetableDelegate: CrudDelegate<Record<string, unknown>, Record<string, unknown>> = {
  list: (userId) =>
    db.timetableClass.findMany({
      where: { userId },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    }),
  create: async (userId, input) => {
    const data = parseWith(timetableClassSchema, input);
    return db.timetableClass.create({
      data: {
        userId,
        name: data.name,
        subjectId: data.subjectId || null,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        room: data.room,
        teacher: data.teacher,
        color: data.color,
        weekType: data.weekType,
      },
    });
  },
  update: async (userId, id, input) => {
    const patch = parseWith(timetableClassPatchSchema, input);
    await owned(userId, id, () => db.timetableClass.findFirst({ where: { id, userId } }));
    return db.timetableClass.update({ where: { id }, data: patch });
  },
  remove: async (userId, id) => {
    await owned(userId, id, () => db.timetableClass.findFirst({ where: { id, userId } }));
    await db.timetableClass.delete({ where: { id } });
  },
};

// ---- Notebooks ----------------------------------------------------------------------

export const notebooksDelegate: CrudDelegate<Record<string, unknown>, Record<string, unknown>> = {
  list: (userId) => db.notebook.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
  create: async (userId, input) => {
    const data = parseWith(notebookSchema, input);
    return db.notebook.create({ data: { userId, name: data.name, color: data.color } });
  },
  update: async (userId, id, input) => {
    const patch = parseWith(notebookSchema.partial(), input);
    await owned(userId, id, () => db.notebook.findFirst({ where: { id, userId } }));
    return db.notebook.update({ where: { id }, data: patch });
  },
  remove: async (userId, id) => {
    await owned(userId, id, () => db.notebook.findFirst({ where: { id, userId } }));
    await db.notebook.delete({ where: { id } });
  },
};

// ---- Notes ---------------------------------------------------------------------------

export const notesDelegate: CrudDelegate<Record<string, unknown>, Record<string, unknown>> = {
  list: (userId) =>
    db.note.findMany({
      where: { userId },
      orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
    }),
  create: async (userId, input) => {
    const data = parseWith(noteSchema, input);
    return db.note.create({
      data: {
        userId,
        title: data.title,
        content: data.content,
        notebookId: data.notebookId || null,
        tags: data.tags,
        pinned: data.pinned,
      },
    });
  },
  update: async (userId, id, input) => {
    const patch = parseWith(notePatchSchema, input);
    await owned(userId, id, () => db.note.findFirst({ where: { id, userId } }));
    return db.note.update({
      where: { id },
      data: {
        ...(patch.title !== undefined ? { title: patch.title } : {}),
        ...(patch.content !== undefined ? { content: patch.content } : {}),
        ...(patch.notebookId !== undefined ? { notebookId: patch.notebookId || null } : {}),
        ...(patch.tags !== undefined ? { tags: patch.tags } : {}),
        ...(patch.pinned !== undefined ? { pinned: patch.pinned } : {}),
      },
    });
  },
  remove: async (userId, id) => {
    await owned(userId, id, () => db.note.findFirst({ where: { id, userId } }));
    await db.note.delete({ where: { id } });
  },
};

// ---- Flashcards: decks + cards ---------------------------------------------------------

export const decksDelegate: CrudDelegate<Record<string, unknown>, Record<string, unknown>> = {
  list: async (userId) => {
    const decks = await db.flashcardDeck.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { cards: true } } },
    });
    return decks.map((d) => ({
      id: d.id,
      name: d.name,
      description: d.description,
      subjectId: d.subjectId,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
      cardCount: d._count.cards,
    }));
  },
  create: async (userId, input) => {
    const data = parseWith(flashcardDeckSchema, input);
    return db.flashcardDeck.create({
      data: {
        userId,
        name: data.name,
        description: data.description,
        subjectId: data.subjectId || null,
      },
    });
  },
  update: async (userId, id, input) => {
    const patch = parseWith(flashcardDeckSchema.partial(), input);
    await owned(userId, id, () => db.flashcardDeck.findFirst({ where: { id, userId } }));
    return db.flashcardDeck.update({
      where: { id },
      data: {
        ...(patch.name !== undefined ? { name: patch.name } : {}),
        ...(patch.description !== undefined ? { description: patch.description } : {}),
        ...(patch.subjectId !== undefined ? { subjectId: patch.subjectId || null } : {}),
      },
    });
  },
  remove: async (userId, id) => {
    await owned(userId, id, () => db.flashcardDeck.findFirst({ where: { id, userId } }));
    await db.flashcardDeck.delete({ where: { id } });
  },
};

async function ownedDeck(userId: string, deckId: string) {
  const deck = await db.flashcardDeck.findFirst({ where: { id: deckId, userId } });
  if (!deck) throw new NotFoundError("Deck not found");
  return deck;
}

export const cardsDelegate: CrudDelegate<Record<string, unknown>, Record<string, unknown>> = {
  list: async (userId) => {
    const decks = await db.flashcardDeck.findMany({ where: { userId }, select: { id: true } });
    const deckIds = decks.map((d) => d.id);
    if (deckIds.length === 0) return [];
    return db.flashcard.findMany({
      where: { deckId: { in: deckIds } },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
  },
  create: async (userId, input) => {
    const data = parseWith(flashcardSchema, input);
    const deckId = (input as { deckId?: string }).deckId;
    if (!deckId || typeof deckId !== "string") throw new BadRequestError("deckId is required");
    await ownedDeck(userId, deckId);
    return db.flashcard.create({
      data: {
        deckId,
        front: data.front,
        back: data.back,
        mastered: data.mastered,
        order: data.order,
      },
    });
  },
  update: async (userId, id, input) => {
    const patch = parseWith(flashcardPatchSchema, input);
    const card = await db.flashcard.findFirst({
      where: { id },
      include: { deck: { select: { userId: true } } },
    });
    if (!card || card.deck.userId !== userId) throw new NotFoundError("Card not found");
    return db.flashcard.update({
      where: { id },
      data: {
        ...(patch.front !== undefined ? { front: patch.front } : {}),
        ...(patch.back !== undefined ? { back: patch.back } : {}),
        ...(patch.mastered !== undefined ? { mastered: patch.mastered } : {}),
        ...(patch.order !== undefined ? { order: patch.order } : {}),
      },
    });
  },
  remove: async (userId, id) => {
    const card = await db.flashcard.findFirst({
      where: { id },
      include: { deck: { select: { userId: true } } },
    });
    if (!card || card.deck.userId !== userId) throw new NotFoundError("Card not found");
    await db.flashcard.delete({ where: { id } });
  },
};

// ---- Practice tests ----------------------------------------------------------------------

export const practiceTestsDelegate: CrudDelegate<Record<string, unknown>, Record<string, unknown>> = {
  list: (userId) => db.practiceTest.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
  create: async (userId, input) => {
    const data = parseWith(practiceTestSchema, input);
    return db.practiceTest.create({
      data: {
        userId,
        title: data.title,
        subjectId: data.subjectId || null,
        date: toDate(data.date) ?? null,
        totalQuestions: data.totalQuestions,
        durationMinutes: data.durationMinutes ?? null,
      },
    });
  },
  update: async (userId, id, input) => {
    const patch = parseWith(practiceTestPatchSchema, input);
    await owned(userId, id, () => db.practiceTest.findFirst({ where: { id, userId } }));
    return db.practiceTest.update({
      where: { id },
      data: {
        ...(patch.title !== undefined ? { title: patch.title } : {}),
        ...(patch.subjectId !== undefined ? { subjectId: patch.subjectId || null } : {}),
        ...(patch.date !== undefined ? { date: toDate(patch.date) ?? null } : {}),
        ...(patch.totalQuestions !== undefined ? { totalQuestions: patch.totalQuestions } : {}),
        ...(patch.durationMinutes !== undefined ? { durationMinutes: patch.durationMinutes ?? null } : {}),
        ...(patch.status !== undefined ? { status: patch.status } : {}),
        ...(patch.correctCount !== undefined ? { correctCount: patch.correctCount } : {}),
        ...(patch.score !== undefined ? { score: patch.score ?? null } : {}),
      },
    });
  },
  remove: async (userId, id) => {
    await owned(userId, id, () => db.practiceTest.findFirst({ where: { id, userId } }));
    await db.practiceTest.delete({ where: { id } });
  },
};

// ---- Study groups ---------------------------------------------------------------------------

export const studyGroupsDelegate: CrudDelegate<Record<string, unknown>, Record<string, unknown>> = {
  list: (userId) => db.studyGroup.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
  create: async (userId, input) => {
    const data = parseWith(studyGroupSchema, input);
    return db.studyGroup.create({
      data: {
        userId,
        name: data.name,
        description: data.description,
        subjectId: data.subjectId || null,
        color: data.color,
        members: JSON.stringify(data.members),
        nextMeeting: toDate(data.nextMeeting) ?? null,
      },
    });
  },
  update: async (userId, id, input) => {
    const patch = parseWith(studyGroupPatchSchema, input);
    await owned(userId, id, () => db.studyGroup.findFirst({ where: { id, userId } }));
    return db.studyGroup.update({
      where: { id },
      data: {
        ...(patch.name !== undefined ? { name: patch.name } : {}),
        ...(patch.description !== undefined ? { description: patch.description } : {}),
        ...(patch.subjectId !== undefined ? { subjectId: patch.subjectId || null } : {}),
        ...(patch.color !== undefined ? { color: patch.color } : {}),
        ...(patch.members !== undefined ? { members: JSON.stringify(patch.members) } : {}),
        ...(patch.nextMeeting !== undefined ? { nextMeeting: toDate(patch.nextMeeting) ?? null } : {}),
      },
    });
  },
  remove: async (userId, id) => {
    await owned(userId, id, () => db.studyGroup.findFirst({ where: { id, userId } }));
    await db.studyGroup.delete({ where: { id } });
  },
};

// ---- Grades ---------------------------------------------------------------------------------

export const gradesDelegate: CrudDelegate<Record<string, unknown>, Record<string, unknown>> = {
  list: (userId) => db.grade.findMany({ where: { userId }, orderBy: { date: "desc" } }),
  create: async (userId, input) => {
    const data = parseWith(gradeSchema, input);
    return db.grade.create({
      data: {
        userId,
        subjectId: data.subjectId || null,
        assessment: data.assessment,
        score: data.score,
        maxScore: data.maxScore,
        weight: data.weight,
        type: data.type,
        date: toDate(data.date) ?? new Date(),
      },
    });
  },
  update: async (userId, id, input) => {
    const patch = parseWith(gradePatchSchema, input);
    await owned(userId, id, () => db.grade.findFirst({ where: { id, userId } }));
    return db.grade.update({
      where: { id },
      data: {
        ...(patch.subjectId !== undefined ? { subjectId: patch.subjectId || null } : {}),
        ...(patch.assessment !== undefined ? { assessment: patch.assessment } : {}),
        ...(patch.score !== undefined ? { score: patch.score } : {}),
        ...(patch.maxScore !== undefined ? { maxScore: patch.maxScore } : {}),
        ...(patch.weight !== undefined ? { weight: patch.weight } : {}),
        ...(patch.type !== undefined ? { type: patch.type } : {}),
        ...(patch.date !== undefined ? { date: toDate(patch.date) ?? new Date() } : {}),
      },
    });
  },
  remove: async (userId, id) => {
    await owned(userId, id, () => db.grade.findFirst({ where: { id, userId } }));
    await db.grade.delete({ where: { id } });
  },
};

// ---- Focus sessions ---------------------------------------------------------------------------

export const focusSessionsDelegate: CrudDelegate<Record<string, unknown>, Record<string, unknown>> = {
  list: (userId) =>
    db.focusSession.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 200 }),
  create: async (userId, input) => {
    const data = parseWith(focusSessionSchema, input);
    return db.focusSession.create({
      data: {
        userId,
        subjectId: data.subjectId || null,
        durationMinutes: data.durationMinutes,
        mode: data.mode,
        date: toDate(data.date) ?? new Date(),
      },
    });
  },
  update: async () => {
    throw new BadRequestError("Focus sessions are immutable");
  },
  remove: async (userId, id) => {
    await owned(userId, id, () => db.focusSession.findFirst({ where: { id, userId } }));
    await db.focusSession.delete({ where: { id } });
  },
};

// ---- Holidays -----------------------------------------------------------------------------------

export const holidaysDelegate: CrudDelegate<Record<string, unknown>, Record<string, unknown>> = {
  list: (userId) => db.holiday.findMany({ where: { userId }, orderBy: { date: "asc" } }),
  create: async (userId, input) => {
    const data = parseWith(holidaySchema, input);
    return db.holiday.create({
      data: { userId, name: data.name, date: toDate(data.date) ?? new Date() },
    });
  },
  update: async () => {
    throw new BadRequestError("Holidays are immutable; delete and recreate");
  },
  remove: async (userId, id) => {
    await owned(userId, id, () => db.holiday.findFirst({ where: { id, userId } }));
    await db.holiday.delete({ where: { id } });
  },
};

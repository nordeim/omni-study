"use client";

import { create } from "zustand";
import { apiGet, apiSend } from "@/lib/api";

// ---------------------------------------------------------------------------
// Data store — the client-side cache for every entity collection, with a
// shared refresh registry so mutations anywhere update consumers everywhere.
// Deliberately simple (the app's data volume is per-user small); no query
// library needed for this scale — documented in Project_Architecture_Document.md.
// ---------------------------------------------------------------------------

export interface Subject {
  id: string;
  name: string;
  color: string;
  teacher: string;
  room: string;
}

export interface TaskList {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  notes: string;
  completed: boolean;
  important: boolean;
  dueDate: string | null;
  listId: string | null;
  subjectId: string | null;
  createdAt: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  subjectId: string | null;
  dueDate: string | null;
  status: "active" | "submitted" | "graded";
  priority: "low" | "medium" | "high";
  score: number | null;
  maxScore: number | null;
  createdAt: string;
}

export interface Exam {
  id: string;
  title: string;
  subjectId: string | null;
  date: string;
  endTime: string | null;
  location: string;
  notes: string;
  status: "upcoming" | "done";
}

export interface AppEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string | null;
  allDay: boolean;
  color: string;
}

export interface TimetableClass {
  id: string;
  name: string;
  subjectId: string | null;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string;
  teacher: string;
  color: string;
}

export interface Notebook {
  id: string;
  name: string;
  color: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  notebookId: string | null;
  tags: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  mastered: boolean;
  order: number;
}

export interface FlashcardDeck {
  id: string;
  name: string;
  description: string;
  subjectId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PracticeTest {
  id: string;
  title: string;
  subjectId: string | null;
  date: string | null;
  status: "created" | "in_progress" | "completed";
  score: number | null;
  totalQuestions: number;
  correctCount: number;
  durationMinutes: number | null;
  createdAt: string;
}

export interface StudyGroupMember {
  name: string;
  email: string;
}

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  subjectId: string | null;
  color: string;
  members: StudyGroupMember[];
  nextMeeting: string | null;
  createdAt: string;
}

export interface Grade {
  id: string;
  subjectId: string | null;
  assessment: string;
  score: number;
  maxScore: number;
  weight: number;
  type: "assignment" | "exam" | "quiz" | "project";
  date: string;
}

export interface FocusSession {
  id: string;
  subjectId: string | null;
  date: string;
  durationMinutes: number;
  mode: "focus" | "short_break" | "long_break";
}

export interface FileFolder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
}

export interface FileItem {
  id: string;
  name: string;
  folderId: string | null;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
}

export interface AiChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface CalculatorHistoryEntry {
  id: string;
  expression: string;
  result: string;
  mode: string;
  createdAt: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
}

type Status = "idle" | "loading" | "ready" | "error";

interface Collections {
  subjects: Subject[];
  taskLists: TaskList[];
  tasks: Task[];
  assignments: Assignment[];
  exams: Exam[];
  events: AppEvent[];
  timetable: TimetableClass[];
  notebooks: Notebook[];
  notes: Note[];
  decks: FlashcardDeck[];
  cards: Flashcard[];
  practiceTests: PracticeTest[];
  studyGroups: StudyGroup[];
  grades: Grade[];
  focusSessions: FocusSession[];
  folders: FileFolder[];
  files: FileItem[];
  chat: AiChatMessage[];
  calcHistory: CalculatorHistoryEntry[];
  holidays: Holiday[];
}

type CollectionKey = keyof Collections;

const EMPTY: Collections = {
  subjects: [],
  taskLists: [],
  tasks: [],
  assignments: [],
  exams: [],
  events: [],
  timetable: [],
  notebooks: [],
  notes: [],
  decks: [],
  cards: [],
  practiceTests: [],
  studyGroups: [],
  grades: [],
  focusSessions: [],
  folders: [],
  files: [],
  chat: [],
  calcHistory: [],
  holidays: [],
};

const PATHS: Record<CollectionKey, string> = {
  subjects: "/api/subjects",
  taskLists: "/api/task-lists",
  tasks: "/api/tasks",
  assignments: "/api/assignments",
  exams: "/api/exams",
  events: "/api/events",
  timetable: "/api/timetable",
  notebooks: "/api/notebooks",
  notes: "/api/notes",
  decks: "/api/flashcards/decks",
  cards: "/api/flashcards/cards",
  practiceTests: "/api/practice-tests",
  studyGroups: "/api/study-groups",
  grades: "/api/grades",
  focusSessions: "/api/focus-sessions",
  folders: "/api/files/folders",
  files: "/api/files",
  chat: "/api/ai/messages",
  calcHistory: "/api/calculator/history",
  holidays: "/api/holidays",
};

interface DataState {
  data: Collections;
  status: Record<CollectionKey, Status>;
  error: string | null;
  load: (key: CollectionKey, force?: boolean) => Promise<void>;
  loadAll: (keys: CollectionKey[]) => Promise<void>;
  refresh: (key: CollectionKey) => Promise<void>;
  setChat: (messages: AiChatMessage[]) => void;
  appendChat: (message: AiChatMessage) => void;
  reset: () => void;
}

export const useDataStore = create<DataState>((set, get) => ({
  data: { ...EMPTY },
  status: Object.fromEntries(Object.keys(EMPTY).map((k) => [k, "idle"])) as Record<CollectionKey, Status>,
  error: null,
  load: async (key, force = false) => {
    const status = get().status[key];
    if (!force && (status === "loading" || status === "ready")) return;
    set((s) => ({ status: { ...s.status, [key]: "loading" } }));
    try {
      const items = await apiGet<unknown[]>(PATHS[key]);
      set((s) => ({
        data: { ...s.data, [key]: items },
        status: { ...s.status, [key]: "ready" },
      }));
    } catch (err) {
      set((s) => ({
        status: { ...s.status, [key]: "error" },
        error: err instanceof Error ? err.message : "Failed to load data",
      }));
    }
  },
  loadAll: async (keys) => {
    await Promise.all(keys.map((k) => get().load(k)));
  },
  refresh: async (key) => {
    await get().load(key, true);
  },
  setChat: (messages) =>
    set((s) => ({ data: { ...s.data, chat: messages }, status: { ...s.status, chat: "ready" } })),
  appendChat: (message) =>
    set((s) => ({ data: { ...s.data, chat: [...s.data.chat, message] } })),
  reset: () =>
    set({
      data: { ...EMPTY },
      status: Object.fromEntries(Object.keys(EMPTY).map((k) => [k, "idle"])) as Record<CollectionKey, Status>,
      error: null,
    }),
}));

/** Mutations — thin typed wrappers; each refreshes the touched collections. */
export const mutations = {
  createTask: async (input: Record<string, unknown>) => {
    const task = await apiSend<Task>("POST", "/api/tasks", input);
    await useDataStore.getState().refresh("tasks");
    return task;
  },
  updateTask: async (id: string, patch: Record<string, unknown>) => {
    const task = await apiSend<Task>("PATCH", `/api/tasks/${id}`, patch);
    await useDataStore.getState().refresh("tasks");
    return task;
  },
  deleteTask: async (id: string) => {
    await apiSend<unknown>("DELETE", `/api/tasks/${id}`);
    await useDataStore.getState().refresh("tasks");
  },
  createTaskList: async (input: Record<string, unknown>) => {
    await apiSend("POST", "/api/task-lists", input);
    await useDataStore.getState().refresh("taskLists");
    await useDataStore.getState().refresh("tasks");
  },
  deleteTaskList: async (id: string) => {
    await apiSend("DELETE", `/api/task-lists/${id}`);
    await useDataStore.getState().refresh("taskLists");
    await useDataStore.getState().refresh("tasks");
  },
  createAssignment: async (input: Record<string, unknown>) => {
    await apiSend("POST", "/api/assignments", input);
    await useDataStore.getState().refresh("assignments");
  },
  updateAssignment: async (id: string, patch: Record<string, unknown>) => {
    await apiSend("PATCH", `/api/assignments/${id}`, patch);
    await useDataStore.getState().refresh("assignments");
  },
  deleteAssignment: async (id: string) => {
    await apiSend("DELETE", `/api/assignments/${id}`);
    await useDataStore.getState().refresh("assignments");
  },
  createExam: async (input: Record<string, unknown>) => {
    await apiSend("POST", "/api/exams", input);
    await useDataStore.getState().refresh("exams");
  },
  updateExam: async (id: string, patch: Record<string, unknown>) => {
    await apiSend("PATCH", `/api/exams/${id}`, patch);
    await useDataStore.getState().refresh("exams");
  },
  deleteExam: async (id: string) => {
    await apiSend("DELETE", `/api/exams/${id}`);
    await useDataStore.getState().refresh("exams");
  },
  createSubject: async (input: Record<string, unknown>) => {
    await apiSend("POST", "/api/subjects", input);
    await useDataStore.getState().refresh("subjects");
  },
  updateSubject: async (id: string, patch: Record<string, unknown>) => {
    await apiSend("PATCH", `/api/subjects/${id}`, patch);
    await useDataStore.getState().refresh("subjects");
  },
  deleteSubject: async (id: string) => {
    await apiSend("DELETE", `/api/subjects/${id}`);
    await Promise.all([
      useDataStore.getState().refresh("subjects"),
      useDataStore.getState().refresh("tasks"),
      useDataStore.getState().refresh("assignments"),
      useDataStore.getState().refresh("exams"),
    ]);
  },
  createEvent: async (input: Record<string, unknown>) => {
    await apiSend("POST", "/api/events", input);
    await useDataStore.getState().refresh("events");
  },
  updateEvent: async (id: string, patch: Record<string, unknown>) => {
    await apiSend("PATCH", `/api/events/${id}`, patch);
    await useDataStore.getState().refresh("events");
  },
  deleteEvent: async (id: string) => {
    await apiSend("DELETE", `/api/events/${id}`);
    await useDataStore.getState().refresh("events");
  },
  createTimetableClass: async (input: Record<string, unknown>) => {
    await apiSend("POST", "/api/timetable", input);
    await useDataStore.getState().refresh("timetable");
  },
  updateTimetableClass: async (id: string, patch: Record<string, unknown>) => {
    await apiSend("PATCH", `/api/timetable/${id}`, patch);
    await useDataStore.getState().refresh("timetable");
  },
  deleteTimetableClass: async (id: string) => {
    await apiSend("DELETE", `/api/timetable/${id}`);
    await useDataStore.getState().refresh("timetable");
  },
  createNotebook: async (input: Record<string, unknown>) => {
    await apiSend("POST", "/api/notebooks", input);
    await useDataStore.getState().refresh("notebooks");
  },
  deleteNotebook: async (id: string) => {
    await apiSend("DELETE", `/api/notebooks/${id}`);
    await Promise.all([
      useDataStore.getState().refresh("notebooks"),
      useDataStore.getState().refresh("notes"),
    ]);
  },
  createNote: async (input: Record<string, unknown>) => {
    await apiSend("POST", "/api/notes", input);
    await useDataStore.getState().refresh("notes");
  },
  updateNote: async (id: string, patch: Record<string, unknown>) => {
    await apiSend("PATCH", `/api/notes/${id}`, patch);
    await useDataStore.getState().refresh("notes");
  },
  deleteNote: async (id: string) => {
    await apiSend("DELETE", `/api/notes/${id}`);
    await useDataStore.getState().refresh("notes");
  },
  createDeck: async (input: Record<string, unknown>) => {
    await apiSend("POST", "/api/flashcards/decks", input);
    await useDataStore.getState().refresh("decks");
  },
  updateDeck: async (id: string, patch: Record<string, unknown>) => {
    await apiSend("PATCH", `/api/flashcards/decks/${id}`, patch);
    await useDataStore.getState().refresh("decks");
  },
  deleteDeck: async (id: string) => {
    await apiSend("DELETE", `/api/flashcards/decks/${id}`);
    await Promise.all([
      useDataStore.getState().refresh("decks"),
      useDataStore.getState().refresh("cards"),
    ]);
  },
  createCard: async (input: Record<string, unknown>) => {
    await apiSend("POST", "/api/flashcards/cards", input);
    await useDataStore.getState().refresh("cards");
  },
  updateCard: async (id: string, patch: Record<string, unknown>) => {
    await apiSend("PATCH", `/api/flashcards/cards/${id}`, patch);
    await useDataStore.getState().refresh("cards");
  },
  deleteCard: async (id: string) => {
    await apiSend("DELETE", `/api/flashcards/cards/${id}`);
    await useDataStore.getState().refresh("cards");
  },
  createPracticeTest: async (input: Record<string, unknown>) => {
    await apiSend("POST", "/api/practice-tests", input);
    await useDataStore.getState().refresh("practiceTests");
  },
  updatePracticeTest: async (id: string, patch: Record<string, unknown>) => {
    await apiSend("PATCH", `/api/practice-tests/${id}`, patch);
    await useDataStore.getState().refresh("practiceTests");
  },
  deletePracticeTest: async (id: string) => {
    await apiSend("DELETE", `/api/practice-tests/${id}`);
    await useDataStore.getState().refresh("practiceTests");
  },
  createStudyGroup: async (input: Record<string, unknown>) => {
    await apiSend("POST", "/api/study-groups", input);
    await useDataStore.getState().refresh("studyGroups");
  },
  updateStudyGroup: async (id: string, patch: Record<string, unknown>) => {
    await apiSend("PATCH", `/api/study-groups/${id}`, patch);
    await useDataStore.getState().refresh("studyGroups");
  },
  deleteStudyGroup: async (id: string) => {
    await apiSend("DELETE", `/api/study-groups/${id}`);
    await useDataStore.getState().refresh("studyGroups");
  },
  createGrade: async (input: Record<string, unknown>) => {
    await apiSend("POST", "/api/grades", input);
    await useDataStore.getState().refresh("grades");
  },
  updateGrade: async (id: string, patch: Record<string, unknown>) => {
    await apiSend("PATCH", `/api/grades/${id}`, patch);
    await useDataStore.getState().refresh("grades");
  },
  deleteGrade: async (id: string) => {
    await apiSend("DELETE", `/api/grades/${id}`);
    await useDataStore.getState().refresh("grades");
  },
  createFocusSession: async (input: Record<string, unknown>) => {
    await apiSend("POST", "/api/focus-sessions", input);
    await useDataStore.getState().refresh("focusSessions");
  },
  createFolder: async (input: Record<string, unknown>) => {
    await apiSend("POST", "/api/files/folders", input);
    await useDataStore.getState().refresh("folders");
  },
  deleteFolder: async (id: string) => {
    await apiSend("DELETE", `/api/files/folders/${id}`);
    await Promise.all([
      useDataStore.getState().refresh("folders"),
      useDataStore.getState().refresh("files"),
    ]);
  },
  createFileLink: async (input: Record<string, unknown>) => {
    await apiSend("POST", "/api/files/link", input);
    await useDataStore.getState().refresh("files");
  },
  deleteFile: async (id: string) => {
    await apiSend("DELETE", `/api/files/${id}`);
    await useDataStore.getState().refresh("files");
  },
  createHoliday: async (input: Record<string, unknown>) => {
    await apiSend("POST", "/api/holidays", input);
    await useDataStore.getState().refresh("holidays");
  },
  deleteHoliday: async (id: string) => {
    await apiSend("DELETE", `/api/holidays/${id}`);
    await useDataStore.getState().refresh("holidays");
  },
  savePreferences: async (input: Record<string, unknown>) => {
    await apiSend("PATCH", "/api/settings/preferences", input);
  },
  saveCalcHistory: async (input: Record<string, unknown>) => {
    await apiSend("POST", "/api/calculator/history", input);
    await useDataStore.getState().refresh("calcHistory");
  },
  clearCalcHistory: async () => {
    await apiSend("DELETE", "/api/calculator/history");
    await useDataStore.getState().refresh("calcHistory");
  },
  clearChat: async () => {
    await apiSend("DELETE", "/api/ai/messages");
    useDataStore.getState().setChat([]);
  },
};

export type { CollectionKey };

// S21 (ADR-019) — the data-export seam.
//
// The full-data export: the "own your data" portability promise. The app
// ships as a self-hosted single-user SQLite file; this seam builds the
// versioned JSON envelope the owner downloads via GET /api/export/data
// (and previews at /export). Everything shape-logical is a PURE function
// here so the unit layer can pin it end-to-end:
//
//  - EXPORT_COLLECTIONS is the stable manifest: the 20 content
//    collections, in a fixed order, every key ALWAYS present in the
//    envelope (empty → [] + count 0 — a consumer never branches on
//    key-presence).
//  - serializeExportRow normalizes a Prisma row to the wire shape:
//    `userId` dropped (single-user implied), Date values → ISO strings,
//    everything else passed through untouched (ids + foreign keys ride
//    so the export cross-references exactly like the database).
//  - buildDataExport assembles the versioned envelope. The user rides
//    `user` — the wire shape EXCLUDES passwordHash by construction, and
//    the seam actively STRIPS a hash if one ever slips through (the
//    secret guard, unit-pinned).
//
// Excluded families (ADR-019, documented decisions): VerificationToken /
// PasswordResetToken (short-lived secrets — never exportable), RumEvent
// (re-collectable telemetry — GET /api/rum/export is the full CSV dump),
// and the passwordHash (the auth secret).

/** The envelope's format identity — a future format change bumps the version. */
export const DATA_EXPORT_FORMAT = "studyflow-data-export";

/** The envelope version — consumers branch on this for forward compat. */
export const DATA_EXPORT_VERSION = 1;

/**
 * The stable collection manifest — the 20 content collections in the
 * export's canonical order. Wire keys mirror the User model's relation
 * names (timetableClasses for timetableClass, decks/cards for the
 * flashcard pair, folders/files for the file pair, chatMessages for
 * AiChatMessage, calcHistory for CalculatorHistoryEntry).
 */
export const EXPORT_COLLECTIONS = [
  "subjects",
  "taskLists",
  "tasks",
  "assignments",
  "exams",
  "events",
  "timetableClasses",
  "notebooks",
  "notes",
  "decks",
  "cards",
  "practiceTests",
  "studyGroups",
  "grades",
  "focusSessions",
  "folders",
  "files",
  "chatMessages",
  "calcHistory",
  "holidays",
] as const;

export type ExportCollection = (typeof EXPORT_COLLECTIONS)[number];

/** The rows as fetched (Prisma-shaped: Dates, userId, content fields). */
export type ExportRowInput = Record<string, unknown>;

/** The collections map — a missing key serializes as an empty collection. */
export type ExportCollectionsInput = Partial<Record<ExportCollection, ExportRowInput[]>>;

/** The user's profile wire shape — the hashless account identity. */
export interface DataExportUser {
  id: string;
  email: string;
  name: string;
  avatarEmoji: string;
  themeMode: string;
  accentColor: string;
  emailVerified: boolean;
  schoolName: string;
  gradeLevel: string;
  studyGoalHours: number;
  notificationsEnabled: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface DataExportEnvelope {
  format: string;
  version: number;
  exportedAt: string;
  user: Record<string, unknown>;
  counts: Record<ExportCollection, number>;
  data: Record<ExportCollection, Record<string, unknown>[]>;
}

/** Fields that must never ride an export (the secret guard). */
const NEVER_EXPORT_FIELDS = new Set(["passwordHash", "userId"]);

/**
 * Normalize one row to the wire shape: never-exported fields dropped
 * (userId — single-user implied; passwordHash — the secret guard),
 * Date values → ISO strings, everything else passed through untouched.
 */
export function serializeExportRow(row: ExportRowInput): Record<string, unknown> {
  const wire: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    if (NEVER_EXPORT_FIELDS.has(key)) continue;
    wire[key] = value instanceof Date ? value.toISOString() : value;
  }
  return wire;
}

/**
 * Assemble the versioned envelope. Every manifest collection key is
 * present in both `counts` and `data` (empty input → 0 / []); rows are
 * serialized through the normalizer; the user rides `user` hashless.
 */
export function buildDataExport(
  user: DataExportUser,
  collections: ExportCollectionsInput,
  exportedAt: Date,
): DataExportEnvelope {
  const data = {} as Record<ExportCollection, Record<string, unknown>[]>;
  const counts = {} as Record<ExportCollection, number>;
  for (const name of EXPORT_COLLECTIONS) {
    const rows = collections[name] ?? [];
    data[name] = rows.map(serializeExportRow);
    counts[name] = rows.length;
  }
  return {
    format: DATA_EXPORT_FORMAT,
    version: DATA_EXPORT_VERSION,
    exportedAt: exportedAt.toISOString(),
    user: serializeExportRow(user as unknown as ExportRowInput),
    counts,
    data,
  };
}

/** Human labels for the owner-facing count grid (the /export page). */
export const EXPORT_COLLECTION_LABELS: Record<ExportCollection, string> = {
  subjects: "Subjects",
  taskLists: "Task Lists",
  tasks: "Tasks",
  assignments: "Assignments",
  exams: "Exams",
  events: "Events",
  timetableClasses: "Timetable Classes",
  notebooks: "Notebooks",
  notes: "Notes",
  decks: "Flashcard Decks",
  cards: "Flashcards",
  practiceTests: "Practice Tests",
  studyGroups: "Study Groups",
  grades: "Grades",
  focusSessions: "Focus Sessions",
  folders: "Folders",
  files: "Files",
  chatMessages: "AI Messages",
  calcHistory: "Calculator History",
  holidays: "Holidays",
};

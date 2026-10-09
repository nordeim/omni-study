// S23 (ADR-021) — the data-import seam.
//
// The RESTORE half of the portability promise (S21 shipped the export).
// parseImportEnvelope turns a downloaded (or hand-crafted) export file
// into rows ready for the upsert-by-id transaction in POST
// /api/import/data — or an actionable error naming the first offender.
//
// Semantics (docs/remediation-plan-session23.md — the ADR-019 rejection
// revisited with the conflicts resolved by design):
//  - upsert-by-id, envelope-wins; import never deletes; all-or-nothing
//    (the route's ONE transaction rolls back on any failure).
//  - content only, never identity — the envelope's `user` block is
//    informational and IGNORED; `counts` is re-derived; `exportedAt` is
//    the past.
//  - the envelope is portable across accounts: the export dropped
//    `userId`, the import re-attaches the IMPORTING user's id (the route
//    owns that — the file never speaks for the account).
//
// Why FK pre-validation is REQUIRED, not belt-and-braces (validated
// empirically, the session-40 scratch probe): Prisma enforces foreign
// keys on SQLite — a dangling FK dies P2003 MID-TRANSACTION with an
// opaque "Foreign key constraint failed". The seam turns that into
// deterministic pre-flight behavior: a dangling OPTIONAL FK is NULLED
// (the schema's own onDelete: SetNull semantics — the same thing that
// would happen if the referenced row was deleted); a dangling REQUIRED FK
// (cards.deckId — the only one) is a corrupt envelope and fails with the
// collection + row named. Self-referential folders.parentId chains are
// topologically sorted parents-first (a hand-crafted child-before-parent
// order would hit P2003) and cycles are rejected (they must never reach
// the Files tree renderer).
//
// Pure by design: explicit args, zero imports beyond the export seam's
// shared constants (ONE source for the format identity, the version, and
// the collection manifest). The unit layer pins it end-to-end
// (tests/data-import.test.ts).

import {
  DATA_EXPORT_FORMAT,
  DATA_EXPORT_VERSION,
  EXPORT_COLLECTIONS,
  type ExportCollection,
} from "./data-export";

/**
 * The documented request-body cap (10 MiB — ~5x the largest realistic
 * single-user envelope: 2 MiB of file payloads + content). The route
 * enforces it server-side; the panel pre-checks it client-side for the
 * friendly early error.
 */
export const IMPORT_MAX_BYTES = 10 * 1024 * 1024;

/** One foreign-key rule: where the field points, and whether it is nullable. */
export interface ImportFkSpec {
  /** The row's FK field name. */
  field: string;
  /** The collection the field references (a manifest key). */
  target: ExportCollection;
  /** A required FK with no null semantics (cards.deckId) — dangling = corrupt. */
  required?: boolean;
}

/**
 * The per-collection FK map — every FK EXCEPT userId (the ownership
 * column the route re-attaches). Mirrors prisma/schema.prisma's relation
 * fields; unit-pinned for completeness against EXPORT_COLLECTIONS so a
 * new collection cannot ship without a map entry (the INITIAL_COLLECTIONS
 * pattern).
 */
export const IMPORT_FK_MAP: Record<ExportCollection, ImportFkSpec[]> = {
  subjects: [],
  taskLists: [],
  tasks: [
    { field: "listId", target: "taskLists" },
    { field: "subjectId", target: "subjects" },
  ],
  assignments: [{ field: "subjectId", target: "subjects" }],
  exams: [{ field: "subjectId", target: "subjects" }],
  events: [],
  timetableClasses: [{ field: "subjectId", target: "subjects" }],
  notebooks: [],
  notes: [{ field: "notebookId", target: "notebooks" }],
  decks: [{ field: "subjectId", target: "subjects" }],
  cards: [{ field: "deckId", target: "decks", required: true }],
  practiceTests: [{ field: "subjectId", target: "subjects" }],
  studyGroups: [{ field: "subjectId", target: "subjects" }],
  grades: [{ field: "subjectId", target: "subjects" }],
  focusSessions: [{ field: "subjectId", target: "subjects" }],
  folders: [{ field: "parentId", target: "folders" }],
  files: [{ field: "folderId", target: "folders" }],
  chatMessages: [],
  calcHistory: [],
  holidays: [],
};

/** Fields the file must never set (the import-side secret guard). */
const NEVER_IMPORT_FIELDS = new Set(["passwordHash", "userId"]);

/** The parse outcome — ok carries the normalized rows, else the actionable error. */
export type ImportParseResult =
  | {
      ok: true;
      rows: Record<ExportCollection, Record<string, unknown>[]>;
      totalRows: number;
    }
  | { ok: false; error: string };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Topologically sort the folders rows parents-first (parentId is
 * self-referential): a row is placeable when its parent is null, already
 * placed, or absent from the envelope (dangling parents were nulled
 * BEFORE this pass, so every surviving parent is envelope-internal).
 * Rows that can never be placed form a cycle → error.
 */
function sortFoldersParentsFirst(
  rows: Record<string, unknown>[],
): { ok: true; sorted: Record<string, unknown>[] } | { ok: false; error: string } {
  const byId = new Map<string, Record<string, unknown>>();
  for (const row of rows) byId.set(String(row.id), row);

  const sorted: Record<string, unknown>[] = [];
  const placed = new Set<string>();
  const remaining = [...rows];
  let progress = true;
  while (remaining.length > 0 && progress) {
    progress = false;
    for (let i = 0; i < remaining.length; i++) {
      const row = remaining[i];
      const parentId = row.parentId;
      if (parentId === null || parentId === undefined || placed.has(String(parentId))) {
        sorted.push(row);
        placed.add(String(row.id));
        remaining.splice(i, 1);
        i--;
        progress = true;
      }
    }
  }
  if (remaining.length > 0) {
    const ids = remaining.map((r) => String(r.id)).join(", ");
    return { ok: false, error: `folders.parentId cycle detected — rows form a loop: ${ids}` };
  }
  return { ok: true, sorted };
}

/**
 * Parse + validate an export envelope into transaction-ready rows.
 *
 * Tolerated/ignored (informational, never trusted): `user` (content only,
 * never identity), `counts` (re-derived from data), `exportedAt` (the
 * import happens now). Missing collection keys → empty (the export's own
 * never-branch-on-presence promise, honored). Date values stay ISO
 * strings — Prisma accepts them for DateTime fields as-is (validated).
 * Unknown content fields pass through untouched (forward-compat: the
 * database validates row content inside the transaction).
 */
export function parseImportEnvelope(raw: unknown): ImportParseResult {
  if (!isPlainObject(raw)) {
    return { ok: false, error: "The import file must be a JSON object (a StudyFlow data export)." };
  }

  if (raw.format !== DATA_EXPORT_FORMAT) {
    return {
      ok: false,
      error: `Unrecognized export format "${String(raw.format)}" — expected "${DATA_EXPORT_FORMAT}". Re-download your export from /export.`,
    };
  }

  if (raw.version !== DATA_EXPORT_VERSION) {
    if (typeof raw.version === "number" && raw.version > DATA_EXPORT_VERSION) {
      return {
        ok: false,
        error: `This export was written by a newer version (version ${raw.version}; this app reads version ${DATA_EXPORT_VERSION}). Update the app, then import again.`,
      };
    }
    return {
      ok: false,
      error: `Invalid export version ${String(raw.version)} — expected ${DATA_EXPORT_VERSION}.`,
    };
  }

  const data = raw.data === undefined ? {} : raw.data;
  if (!isPlainObject(data)) {
    return { ok: false, error: 'The export "data" field must be an object mapping collection names to arrays.' };
  }

  // Unknown collection keys are rejected (named) — a misspelled or
  // future key means the file is not what the importer expects.
  for (const key of Object.keys(data)) {
    if (!(EXPORT_COLLECTIONS as readonly string[]).includes(key)) {
      return {
        ok: false,
        error: `Unknown collection "${key}" in the export data — the app does not import this family (expected only the ${EXPORT_COLLECTIONS.length} known collections).`,
      };
    }
  }

  // Pass 1: shape + id rules + the secret guard, per collection.
  const rows = {} as Record<ExportCollection, Record<string, unknown>[]>;
  for (const collection of EXPORT_COLLECTIONS) {
    const list = (data as Record<string, unknown>)[collection];
    if (list === undefined) {
      rows[collection] = [];
      continue;
    }
    if (!Array.isArray(list)) {
      return { ok: false, error: `Collection "${collection}" must be an array of rows.` };
    }
    const normalized: Record<string, unknown>[] = [];
    const seenIds = new Set<string>();
    for (const row of list) {
      if (!isPlainObject(row)) {
        return { ok: false, error: `Every row in "${collection}" must be an object.` };
      }
      const id = row.id;
      if (typeof id !== "string" || id.length === 0) {
        return { ok: false, error: `A row in "${collection}" is missing its string "id".` };
      }
      if (seenIds.has(id)) {
        return {
          ok: false,
          error: `Duplicate id "${id}" within "${collection}" — the export file is corrupt (each row must have a unique id).`,
        };
      }
      seenIds.add(id);

      const clean: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(row)) {
        if (NEVER_IMPORT_FIELDS.has(key)) continue;
        clean[key] = value;
      }
      normalized.push(clean);
    }
    rows[collection] = normalized;
  }

  // Pass 2: FK validation against the envelope's own id sets (the P2003
  // pre-emption). Optional dangling FKs → null (SetNull semantics);
  // required dangling FKs → the corrupt-envelope error.
  for (const collection of EXPORT_COLLECTIONS) {
    const specs = IMPORT_FK_MAP[collection];
    if (specs.length === 0) continue;
    // The id set the FKs may reference: this collection's own rows plus
    // the target collection's rows (the manifest order guarantees the
    // target imports first — except folders, self-referential).
    const idSets = new Map<string, Set<string>>();
    const idSetFor = (target: ExportCollection): Set<string> => {
      let set = idSets.get(target);
      if (!set) {
        set = new Set(rows[target].map((r) => String(r.id)));
        idSets.set(target, set);
      }
      return set;
    };
    for (const row of rows[collection]) {
      for (const spec of specs) {
        const value = row[spec.field];
        if (value === null || value === undefined) {
          row[spec.field] = null; // normalize undefined → null
          continue;
        }
        if (typeof value !== "string") {
          return {
            ok: false,
            error: `Row "${String(row.id)}" in "${collection}" has a non-string ${spec.field} — the export file is corrupt.`,
          };
        }
        if (!idSetFor(spec.target).has(value)) {
          if (spec.required) {
            return {
              ok: false,
              error: `Row "${String(row.id)}" in "${collection}" references a missing ${spec.field} ("${value}") — the deck it belongs to is not in this export. Re-export from the account that owns the deck.`,
            };
          }
          // The schema's own SetNull semantics: the referenced row is
          // gone (or was never in this envelope) — the FK nulls.
          row[spec.field] = null;
        }
      }
    }
  }

  // Pass 3: the folders topological sort (parents import before
  // children; the same pass rejects cycles).
  const foldersResult = sortFoldersParentsFirst(rows.folders);
  if (!foldersResult.ok) {
    return { ok: false, error: foldersResult.error };
  }
  rows.folders = foldersResult.sorted;

  const totalRows = EXPORT_COLLECTIONS.reduce((sum, name) => sum + rows[name].length, 0);
  return { ok: true, rows, totalRows };
}

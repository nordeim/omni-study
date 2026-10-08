// ---------------------------------------------------------------------------
// S16-A — the per-view initial-collections seam (docs/remediation-plan-session16.md).
//
// WHY: the app shell used to flip from the Splash to the authenticated
// layout the moment /api/auth/me resolved — with an EMPTY data store. The
// active view's fetches then landed in a second pass, the conditional
// overdue banner inserted itself above the stats grid, and the sections
// grew from their slim-empty to populated heights: one layout shift worth
// CLS 0.117–0.125 (CWV needs-improvement; the reference's own gated first
// paint measures 0.088). The fix pre-warms the ACTIVE view's collections
// IN PARALLEL with the auth call (page.tsx) — the Splash→shell
// replacement then renders with final geometry (a replacement is not a
// move; the shift source disappears).
//
// This module is the single source of "what does each view need before its
// first paint" — the SAME sets the views' own loadAll effects fetch
// (their effects short-circuit via the store's status guard, so nothing
// is fetched twice). Unit-pinned by tests/view-collections.test.ts; a new
// view that forgets its entry fails that test instead of silently
// regressing the load stability.
// ---------------------------------------------------------------------------
import type { ViewId } from "./router";
import type { CollectionKey } from "./data";

export const INITIAL_COLLECTIONS: Record<ViewId, CollectionKey[]> = {
  dashboard: ["tasks", "assignments", "exams", "focusSessions", "subjects"],
  myday: ["tasks", "subjects"],
  tasks: ["tasks", "taskLists", "subjects"],
  calendar: ["events", "exams", "assignments", "tasks", "timetable", "subjects"],
  events: ["events"],
  timetable: ["timetable", "subjects"],
  assignments: ["assignments", "subjects"],
  exams: ["exams", "subjects"],
  notes: ["notes", "notebooks"],
  flashcards: ["decks", "cards", "subjects"],
  practicetests: ["practiceTests", "subjects"],
  studygroups: ["studyGroups", "subjects"],
  gradetracker: ["grades", "subjects"],
  analytics: ["tasks", "focusSessions", "grades", "assignments", "exams", "subjects"],
  files: ["folders", "files"],
  // The three tool views hold no server collections — they gate on auth
  // alone and must NOT hold the Splash for a data fetch that never comes.
  calculator: [],
  mathsolver: [],
  aiassistant: [],
  focustimer: ["focusSessions", "subjects"],
  settings: ["subjects", "holidays"],
};

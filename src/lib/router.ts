// ---------------------------------------------------------------------------
// View router — the single source of truth mapping the reference app's 20
// PascalCase paths to app views. Pure: no DOM access here (tests pin it);
// the pathname sync lives in the app store (src/lib/store.ts).
// ---------------------------------------------------------------------------

export const VIEWS = [
  "dashboard",
  "myday",
  "tasks",
  "calendar",
  "events",
  "timetable",
  "assignments",
  "exams",
  "notes",
  "flashcards",
  "practicetests",
  "studygroups",
  "gradetracker",
  "analytics",
  "files",
  "calculator",
  "mathsolver",
  "aiassistant",
  "focustimer",
  "settings",
] as const;

export type ViewId = (typeof VIEWS)[number];

export interface NavItem {
  id: ViewId;
  label: string;
  path: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { id: "dashboard", label: "Dashboard", path: "/Dashboard" },
  { id: "myday", label: "My Day", path: "/MyDay" },
  { id: "tasks", label: "Tasks", path: "/Tasks" },
  { id: "calendar", label: "Calendar", path: "/Calendar" },
  { id: "events", label: "Events", path: "/Events" },
  { id: "timetable", label: "Timetable", path: "/Timetable" },
  { id: "assignments", label: "Assignments", path: "/Assignments" },
  { id: "exams", label: "Exams", path: "/Exams" },
  { id: "notes", label: "Notes", path: "/Notes" },
  { id: "flashcards", label: "Flashcards", path: "/Flashcards" },
  { id: "practicetests", label: "Practice Tests", path: "/PracticeTests" },
  { id: "studygroups", label: "Study Groups", path: "/StudyGroups" },
  { id: "gradetracker", label: "Grade Tracker", path: "/GradeTracker" },
  { id: "analytics", label: "Analytics", path: "/Analytics" },
  { id: "files", label: "Files", path: "/Files" },
  { id: "calculator", label: "Calculator", path: "/Calculator" },
  { id: "mathsolver", label: "Math Solver", path: "/MathSolver" },
  { id: "aiassistant", label: "AI Assistant", path: "/AIAssistant" },
  { id: "focustimer", label: "Focus Timer", path: "/FocusTimer" },
  { id: "settings", label: "Settings", path: "/Settings" },
];

/**
 * Map a URL pathname to a view id. The first path segment that names a view
 * wins (deep links like /Tasks/abc still land on tasks); unknown/empty →
 * dashboard.
 */
export function viewFromPath(pathname: string): ViewId {
  const clean = (pathname || "/").split("?")[0]!.replace(/\/+$/, "");
  if (!clean || clean === "/") return "dashboard";
  const segments = clean.split("/").filter(Boolean);
  for (const segment of segments) {
    const hit = VIEWS.find((v) => v === segment.toLowerCase());
    if (hit) return hit;
  }
  return "dashboard";
}

/** Canonical path for a view id. */
export function pathForView(view: ViewId): string {
  const item = NAV_ITEMS.find((n) => n.id === view);
  return item?.path ?? "/Dashboard";
}

/** Greeting bucket by hour — matches the reference ("Good evening, … 👋"). */
export function greetingForHour(hour: number): string {
  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

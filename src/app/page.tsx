"use client";

import * as React from "react";
import { useAppStore, useThemeStore } from "@/lib/store";
import { useDataStore } from "@/lib/data";
import type { PublicUserShape } from "@/lib/app-context";
import { apiGet } from "@/lib/api";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileChrome } from "@/components/layout/mobile-chrome";
import { ConnectivityBanner } from "@/components/layout/connectivity-banner";
import { RumBeacon } from "@/components/layout/rum-beacon";
import { DashboardView } from "@/components/views/dashboard-view";
import { MyDayView } from "@/components/views/myday-view";
import { TasksView } from "@/components/views/tasks-view";
import { CalendarView } from "@/components/views/calendar-view";
import { EventsView } from "@/components/views/events-view";
import { TimetableView } from "@/components/views/timetable-view";
import { AssignmentsView } from "@/components/views/assignments-view";
import { ExamsView } from "@/components/views/exams-view";
import { NotesView } from "@/components/views/notes-view";
import { FlashcardsView } from "@/components/views/flashcards-view";
import { PracticeTestsView } from "@/components/views/practicetests-view";
import { StudyGroupsView } from "@/components/views/studygroups-view";
import { GradeTrackerView } from "@/components/views/gradetracker-view";
import { AnalyticsView } from "@/components/views/analytics-view";
import { FilesView } from "@/components/views/files-view";
import { CalculatorView } from "@/components/views/calculator-view";
import { MathSolverView } from "@/components/views/mathsolver-view";
import { AIAssistantView } from "@/components/views/aiassistant-view";
import { FocusTimerView } from "@/components/views/focustimer-view";
import { SettingsView } from "@/components/views/settings-view";
import { GraduationCap } from "lucide-react";
import type { ViewId } from "@/lib/router";
import { INITIAL_COLLECTIONS } from "@/lib/view-collections";

const VIEWS: Record<ViewId, React.ComponentType> = {
  dashboard: DashboardView,
  myday: MyDayView,
  tasks: TasksView,
  calendar: CalendarView,
  events: EventsView,
  timetable: TimetableView,
  assignments: AssignmentsView,
  exams: ExamsView,
  notes: NotesView,
  flashcards: FlashcardsView,
  practicetests: PracticeTestsView,
  studygroups: StudyGroupsView,
  gradetracker: GradeTrackerView,
  analytics: AnalyticsView,
  files: FilesView,
  calculator: CalculatorView,
  mathsolver: MathSolverView,
  aiassistant: AIAssistantView,
  focustimer: FocusTimerView,
  settings: SettingsView,
};

function Splash() {
  return (
    <div className="sf-canvas flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <span
          className="flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl text-white shadow-md"
          style={{ backgroundColor: "rgb(var(--sf-primary))" }}
        >
          <GraduationCap className="h-7 w-7" strokeWidth={1.75} />
        </span>
        <p className="text-sm text-slate-400">Loading StudyFlow…</p>
      </div>
    </div>
  );
}

export default function StudyFlowApp() {
  const [status, setStatus] = React.useState<"loading" | "authed" | "anon">("loading");
  const view = useAppStore((s) => s.view);
  const hydrate = useAppStore((s) => s.hydrate);
  const syncFromPath = useAppStore((s) => s.syncFromPath);
  const loadFromUser = useThemeStore((s) => s.loadFromUser);
  const resetData = useDataStore((s) => s.reset);

  React.useEffect(() => {
    hydrate();
    let cancelled = false;
    (async () => {
      try {
        // S16-A — the load-stability fix (docs/remediation-plan-session16.md):
        // the auth call and the ACTIVE view's initial collections are fetched
        // in PARALLEL (the session cookie already exists; the data calls do
        // not need the auth result), and the shell flips only when BOTH have
        // settled. Pre-fix the shell rendered with an empty data store and
        // the data arrival re-laid the conditional overdue banner + sections
        // out from under the viewport (CLS 0.117–0.125). The Splash→shell
        // REPLACEMENT then renders with final geometry — replacements are
        // not moves, so the shift source disappears entirely.
        // `view` is read from the store AFTER hydrate() ran (syncFromPath is
        // synchronous) — never from the render-time closure, which would
        // capture the pre-hydration default (the AP-59 stale-closure family).
        const activeView = useAppStore.getState().view;
        const initial = INITIAL_COLLECTIONS[activeView] ?? [];
        const dataPromise = initial.length
          ? useDataStore.getState().loadAll(initial).catch(() => {
              // A failed pre-warm never blocks the app: the view's own
              // loadAll effect retries (status left on "error"), so the
              // shell must still flip on auth alone.
            })
          : null;
        const { user } = await apiGet<{ user: PublicUserShape }>("/api/auth/me");
        if (cancelled) return;
        loadFromUser(user);
        if (dataPromise) await dataPromise;
        if (cancelled) return;
        setStatus("authed");
      } catch {
        if (cancelled) return;
        resetData();
        window.location.replace("/login");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrate, loadFromUser, resetData]);

  React.useEffect(() => {
    const onPop = () => syncFromPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [syncFromPath]);

  if (status !== "authed") return <Splash />;

  const CurrentView = VIEWS[view] ?? DashboardView;
  return (
    <div className="sf-canvas min-h-screen">
      {/* S12-B — WCAG 2.4.1 Bypass Blocks: 21 sidebar stops precede the
          content on every view; this link is the first focusable element
          and skips straight to main. Visually hidden until focused
          (.sf-skip-link — off-screen, NOT display:none). */}
      <a href="#main-content" className="sf-skip-link">
        Skip to main content
      </a>
      <Sidebar />
      <MobileChrome />
      {/* S14-A0: the global offline indicator — renders null while online
          (byte-identical online DOM; the pill is pure superset). */}
      <ConnectivityBanner />
      {/* S18 (ADR-016) — the RUM beacon: web-vitals reported to the in-app
          /api/rum endpoint. Renders null — zero DOM, zero CLS impact —
          and only mounts in the AUTHED shell (an unauthenticated metrics
          endpoint is an abuse surface; the login CWV is pinned by
          s16-perf-parity.spec.ts). Pure superset — the reference has no
          field telemetry at all. */}
      <RumBeacon />
      {/* pt-20 (80px) offsets the FIXED mobile app bar: 64px of bar + the
          16px the reference's content keeps below it (its main is pt-16 and
          an inner p-4 wrapper adds the rest — measured: first heading at
          y=80 on BOTH apps). At lg the bar is hidden and lg:pt-8 applies. */}
      <main id="main-content" tabIndex={-1} className="sf-scroll min-h-screen overflow-x-clip p-4 pt-20 transition-all duration-300 lg:ml-[260px] lg:p-8 lg:pt-8">
        <CurrentView />
      </main>
    </div>
  );
}

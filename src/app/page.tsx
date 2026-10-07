"use client";

import * as React from "react";
import { useAppStore, useThemeStore } from "@/lib/store";
import { useDataStore } from "@/lib/data";
import type { PublicUserShape } from "@/lib/app-context";
import { apiGet } from "@/lib/api";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileChrome } from "@/components/layout/mobile-chrome";
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
        const { user } = await apiGet<{ user: PublicUserShape }>("/api/auth/me");
        if (cancelled) return;
        loadFromUser(user);
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
      <Sidebar />
      <MobileChrome />
      {/* pt-20 (80px) offsets the FIXED mobile app bar: 64px of bar + the
          16px the reference's content keeps below it (its main is pt-16 and
          an inner p-4 wrapper adds the rest — measured: first heading at
          y=80 on BOTH apps). At lg the bar is hidden and lg:pt-8 applies. */}
      <main className="sf-scroll min-h-screen overflow-x-clip p-4 pt-20 transition-all duration-300 lg:ml-[260px] lg:p-8 lg:pt-8">
        <CurrentView />
      </main>
    </div>
  );
}

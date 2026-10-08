"use client";

import * as React from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, Grid3x3, List } from "lucide-react";
import { useDataStore, type AppEvent, type Task } from "@/lib/data";
import { useAppStore } from "@/lib/store";
import { EmptyState, useSubjectMap, ViewHeader } from "./shared";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { addMonths, CALENDAR_WEEKDAYS, formatFullDate, isSameDay, monthGrid } from "@/lib/date";

// Calendar — month grid (S9-E: SUNDAY-first, dynamic week count — the
// reference's measured column order — with leading/trailing days muted) +
// day detail panel. Timeline toggle switches to a
// chronological agenda of events/exams/assignments.
//
// S6-G — the month grid + legend + day detail were re-measured against the
// live reference WITH data:
//   • day cells: `relative aspect-square p-2 rounded-xl transition-all flex
//     flex-col items-center justify-center hover:bg-slate-100` with
//     `span.text-sm.font-medium` dates + `div.flex.gap-0.5.mt-1` event dots
//     (`span.w-1.5.h-1.5.rounded-full` — blue tasks / amber assignments /
//     red exams / emerald classes); adjacent-month cells = text-slate-300;
//     TODAY = solid `bg-violet-500 text-white` (accent-aware here) with
//     WHITE dots.
//   • legend below the grid: `flex flex-wrap gap-4 mt-4 pt-4 border-t
//     border-slate-100` rows `flex items-center gap-2 text-sm text-slate-600`
//     with `span.w-2.h-2.rounded-full.bg-{blue,amber,red,emerald}-500`.
//   • day detail: `bg-white rounded-2xl border border-slate-200 p-6` +
//     `h3.font-bold` full date + per-type sections with
//     `p.text-xs.font-semibold.text-slate-500.uppercase.mb-2` labels and
//     event rows `div.p-3.bg-blue-50.rounded-lg.border-l-4.border-blue-500`
//     (blue for tasks — measured; amber/red/emerald for assignment/exam/
//     class rows — same family).

interface AgendaItem {
  date: Date;
  kind: "event" | "exam" | "assignment";
  label: string;
  color: string;
}

// The reference's legend/dot palette (measured).
const KIND_COLORS = {
  task: "#3b82f6", // blue-500
  assignment: "#f59e0b", // amber-500
  exam: "#ef4444", // red-500
  class: "#10b981", // emerald-500
  event: "#8b5cf6", // violet-500 (events use their own color; legend omits them)
} as const;

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export function CalendarView() {
  const navigate = useAppStore((s) => s.navigate);
  const events = useDataStore((s) => s.data.events);
  const exams = useDataStore((s) => s.data.exams);
  const assignments = useDataStore((s) => s.data.assignments);
  const tasks = useDataStore((s) => s.data.tasks);
  const timetable = useDataStore((s) => s.data.timetable);
  const loadAll = useDataStore((s) => s.loadAll);
  const subjectMap = useSubjectMap();

  const [cursor, setCursor] = React.useState(() => new Date());
  const [selected, setSelected] = React.useState(() => new Date());
  const [mode, setMode] = React.useState<"calendar" | "timeline">("calendar");

  React.useEffect(() => {
    void loadAll(["events", "exams", "assignments", "tasks", "timetable", "subjects"]);
  }, [loadAll]);

  const cells = React.useMemo(
    () => monthGrid(cursor.getFullYear(), cursor.getMonth()),
    [cursor],
  );

  const today = new Date();

  // Per-day dot colors (S6-G): one dot per KIND present that day.
  const dotsByDay = React.useMemo(() => {
    const map = new Map<string, Set<string>>();
    const add = (date: Date, kind: keyof typeof KIND_COLORS) => {
      const key = dayKey(date);
      const set = map.get(key) ?? new Set<string>();
      set.add(kind);
      map.set(key, set);
    };
    for (const t of tasks) {
      if (!t.completed && t.dueDate) add(new Date(t.dueDate), "task");
    }
    for (const a of assignments) {
      if (a.status === "active" && a.dueDate) add(new Date(a.dueDate), "assignment");
    }
    for (const e of exams) {
      if (e.status === "upcoming") add(new Date(e.date), "exam");
    }
    for (const c of timetable) {
      // Classes repeat weekly on their dayOfWeek.
      for (let i = 0; i < cells.length; i++) {
        const d = new Date(cells[0].date);
        d.setDate(d.getDate() + i);
        if (d.getDay() === c.dayOfWeek) add(d, "class");
      }
    }
    return map;
  }, [tasks, assignments, exams, timetable, cells]);

  const dayDetail = React.useMemo(() => {
    const dayEvents = events.filter((e) => isSameDay(new Date(e.startDate), selected));
    const dayExams = exams.filter((e) => isSameDay(new Date(e.date), selected));
    const dayAssignments = assignments.filter(
      (a) => a.dueDate && isSameDay(new Date(a.dueDate), selected),
    );
    const dayTasks = tasks.filter((t) => t.dueDate && isSameDay(new Date(t.dueDate), selected));
    const dayClasses = timetable.filter((c) => c.dayOfWeek === selected.getDay());
    return { dayEvents, dayExams, dayAssignments, dayTasks, dayClasses };
  }, [events, exams, assignments, tasks, timetable, selected]);

  const agenda = React.useMemo<AgendaItem[]>(() => {
    const items: AgendaItem[] = [];
    for (const e of events) {
      items.push({ date: new Date(e.startDate), kind: "event", label: e.title, color: e.color });
    }
    for (const e of exams) {
      const subject = e.subjectId ? subjectMap.get(e.subjectId) : undefined;
      items.push({ date: new Date(e.date), kind: "exam", label: e.title, color: subject?.color ?? "#8b5cf6" });
    }
    for (const a of assignments) {
      if (!a.dueDate) continue;
      const subject = a.subjectId ? subjectMap.get(a.subjectId) : undefined;
      items.push({ date: new Date(a.dueDate), kind: "assignment", label: `${a.title} (due)`, color: subject?.color ?? "#f97316" });
    }
    return items.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [events, exams, assignments, subjectMap]);

  return (
    <div className="flex flex-col gap-6">
      <ViewHeader
        title="Calendar"
        subtitle="View all your tasks, assignments and classes"
        actions={
          // S9-F (re-measured): segmented control — `flex items-center gap-2
          // bg-white rounded-lg border border-slate-200 p-1` container (42px)
          // with h-8 px-3 text-xs tabs carrying icons (Calendar = grid3x3,
          // Timeline = list); active = solid accent fill, inactive = ghost.
          <div
            aria-label="Calendar mode"
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900"
          >
            <button
              type="button"
              onClick={() => setMode("calendar")}
              aria-pressed={mode === "calendar"}
              className={cn(
                "flex h-8 items-center gap-2 rounded-md px-3 text-xs font-medium transition-colors sf-focus",
                mode === "calendar"
                  ? "bg-sf-primary text-sf-primary-foreground"
                  : "text-gray-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
              )}
            >
              <Grid3x3 className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              Calendar
            </button>
            <button
              type="button"
              onClick={() => setMode("timeline")}
              aria-pressed={mode === "timeline"}
              className={cn(
                "flex h-8 items-center gap-2 rounded-md px-3 text-xs font-medium transition-colors sf-focus",
                mode === "timeline"
                  ? "bg-sf-primary text-sf-primary-foreground"
                  : "text-gray-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
              )}
            >
              <List className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              Timeline
            </button>
          </div>
        }
      />

      {mode === "calendar" ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
          {/* Month grid — S8-C: a SIMPLE p-6 card (border-slate-200, no
              header split) with the title row + weekday header + cells +
              legend stacked inside. */}
          <section
            aria-label="Calendar month"
            className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </h2>
              <div className="flex items-center gap-1">
                {/* S8-C (measured): exactly TWO ghost h-9 w-9 chevron buttons —
                    the reference has no "Today" reset button. */}
                <Button variant="ghost" size="icon" className="rounded-lg" onClick={() => setCursor(addMonths(cursor, -1))} aria-label="Previous month">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-lg" onClick={() => setCursor(addMonths(cursor, 1))} aria-label="Next month">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {/* S8-C (measured): weekday header — text-center text-sm
                font-medium text-slate-500 py-2 cells on grid-cols-7 gap-1.
                S9-E: the reference's column order is SUNDAY-FIRST. */}
            <div className="mb-2 grid grid-cols-7 gap-1" aria-label="Calendar weekdays">
              {CALENDAR_WEEKDAYS.map((d) => (
                <span key={d} className="py-2 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                  {d}
                </span>
              ))}
            </div>
            {/* S6-G — measured cells: aspect-square, centered, r12, dots row.
                S8-C: selected = solid accent fill + white text; TODAY (when
                unselected) = 100-level tint (emptyFrom family) + strong text;
                both states strip the hover class (measured on the reference). */}
            <div className="grid grid-cols-7 gap-1" aria-label="Calendar days">
              {cells.map(({ date, inMonth }) => {
                const key = dayKey(date);
                const dots = dotsByDay.get(key);
                const isSelected = isSameDay(date, selected);
                const isToday = isSameDay(date, today);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelected(date)}
                    aria-pressed={isSelected}
                    aria-label={`${formatFullDate(date)}${isToday ? " (Today)" : ""}`}
                    data-today={isToday || undefined}
                    className={cn(
                      "relative flex aspect-square flex-col items-center justify-center rounded-xl p-2 transition-all sf-focus",
                      isSelected
                        ? "text-white"
                        : isToday
                          ? "text-sf-primary-strong dark:text-sf-primary-strong-dark"
                          : inMonth
                            ? "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                            : "text-slate-300 dark:text-slate-600",
                    )}
                    style={
                      isSelected
                        ? { backgroundColor: "rgb(var(--sf-primary))" }
                        : isToday
                          ? { backgroundColor: "rgb(var(--sf-primary-empty-from))" }
                          : undefined
                    }
                  >
                    <span className="text-sm font-medium">{date.getDate()}</span>
                    <div className="mt-1 flex gap-0.5">
                      {dots
                        ? [...dots].slice(0, 3).map((kind) => (
                            <span
                              key={kind}
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: isSelected ? "#ffffff" : KIND_COLORS[kind as keyof typeof KIND_COLORS] }}
                            />
                          ))
                        : null}
                    </div>
                  </button>
                );
              })}
            </div>
            {/* S6-G — the reference's legend (measured): dot + label row. */}
            <div className="mt-4 flex flex-wrap gap-4 border-t border-slate-100 pt-4 dark:border-slate-800" aria-label="Calendar legend">
              {(
                [
                  ["task", "Tasks"],
                  ["assignment", "Assignments"],
                  ["exam", "Exams"],
                  ["class", "Classes"],
                ] as const
              ).map(([kind, label]) => (
                <div key={kind} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: KIND_COLORS[kind] }} />
                  {label}
                </div>
              ))}
            </div>
          </section>

          {/* Day detail — S8-C: simple p-6 card (border-slate-200) with a
              font-bold h3 long date and a space-y-4 body. */}
          <aside
            aria-label="Day detail"
            className="h-fit rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900"
          >
            <h3 className="mb-4 font-bold text-slate-800 dark:text-slate-100">
              {formatFullDate(selected)}
            </h3>
            <div className="space-y-4">
              {dayDetail.dayTasks.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Tasks</p>
                  <div className="flex flex-col gap-2">
                    {dayDetail.dayTasks.map((t: Task) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => navigate("tasks")}
                        className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-3 text-left sf-focus dark:border-blue-400 dark:bg-blue-950/30"
                      >
                        <p className="font-medium text-slate-800 dark:text-slate-100">{t.title}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {dayDetail.dayExams.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Exams</p>
                  <div className="flex flex-col gap-2">
                    {dayDetail.dayExams.map((e) => (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() => navigate("exams")}
                        className="rounded-lg border-l-4 border-red-500 bg-red-50 p-3 text-left sf-focus dark:border-red-400 dark:bg-red-950/30"
                      >
                        <p className="font-medium text-slate-800 dark:text-slate-100">{e.title}</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {new Date(e.date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                          {" · "}
                          {e.duration} min
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {dayDetail.dayAssignments.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Due</p>
                  <div className="flex flex-col gap-2">
                    {dayDetail.dayAssignments.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => navigate("assignments")}
                        className="rounded-lg border-l-4 border-amber-500 bg-amber-50 p-3 text-left sf-focus dark:border-amber-400 dark:bg-amber-950/30"
                      >
                        <p className="font-medium text-slate-800 dark:text-slate-100">{a.title}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {dayDetail.dayEvents.length > 0 && (
                <div>
                  <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
                    <CalendarDays className="h-3.5 w-3.5" /> Events
                  </p>
                  <div className="flex flex-col gap-2">
                    {dayDetail.dayEvents.map((e: AppEvent) => (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() => navigate("events")}
                        className="rounded-lg border-l-4 border-violet-500 bg-violet-50 p-3 text-left sf-focus dark:border-violet-400 dark:bg-violet-950/30"
                      >
                        <p className="font-medium text-slate-800 dark:text-slate-100">{e.title}</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {new Date(e.startDate).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {dayDetail.dayClasses.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Classes</p>
                  <div className="flex flex-col gap-2">
                    {dayDetail.dayClasses.map((c) => (
                      <div
                        key={c.id}
                        className="rounded-lg border-l-4 border-emerald-500 bg-emerald-50 p-3 dark:border-emerald-400 dark:bg-emerald-950/30"
                      >
                        <p className="font-medium text-slate-800 dark:text-slate-100">{c.name}</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {c.startTime} – {c.endTime}
                          {c.room ? ` · ${c.room}` : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {dayDetail.dayTasks.length +
                dayDetail.dayExams.length +
                dayDetail.dayAssignments.length +
                dayDetail.dayEvents.length +
                dayDetail.dayClasses.length ===
                0 && (
                // S8-C (measured): the reference's empty day-detail body is a
                // bare centered gray paragraph — no CTA button.
                <p className="py-8 text-center text-slate-400">No events for this day</p>
              )}
            </div>
          </aside>
        </div>
      ) : (
        // Timeline mode — chronological agenda
        <section className="sf-card overflow-hidden">
          <header className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
            <h2 className="text-[18px] font-semibold text-slate-800 dark:text-slate-100">Upcoming timeline</h2>
          </header>
          {agenda.length === 0 ? (
            <EmptyState icon={Clock3} title="Nothing scheduled" hint="Events, exams and assignment due dates appear here." />
          ) : (
            <ul className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
              {agenda.slice(0, 40).map((item, i) => (
                <li key={i} className="flex items-center gap-4 px-6 py-3.5">
                  <div className="w-28 shrink-0 text-sm">
                    <p className="font-semibold text-slate-700 dark:text-slate-200">
                      {item.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                    <p className="text-xs text-slate-400">
                      {item.date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                    </p>
                  </div>
                  <span className="h-8 w-1 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                  <p className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                    {item.label}
                  </p>
                  <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium capitalize text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                    {item.kind}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

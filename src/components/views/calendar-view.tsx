"use client";

import * as React from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3 } from "lucide-react";
import { useDataStore, type AppEvent } from "@/lib/data";
import { useAppStore } from "@/lib/store";
import { EmptyState, useSubjectMap, ViewHeader } from "./shared";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { addMonths, formatFullDate, isSameDay, monthGrid, WEEKDAY_SHORT } from "@/lib/date";

// Calendar — month grid (Monday-first, 6×7, leading/trailing days muted —
// matches the reference) + day detail panel. Timeline toggle switches to a
// chronological agenda of events/exams/assignments.

interface AgendaItem {
  date: Date;
  kind: "event" | "exam" | "assignment";
  label: string;
  color: string;
}

export function CalendarView() {
  const navigate = useAppStore((s) => s.navigate);
  const events = useDataStore((s) => s.data.events);
  const exams = useDataStore((s) => s.data.exams);
  const assignments = useDataStore((s) => s.data.assignments);
  const loadAll = useDataStore((s) => s.loadAll);
  const subjectMap = useSubjectMap();

  const [cursor, setCursor] = React.useState(() => new Date());
  const [selected, setSelected] = React.useState(() => new Date());
  const [mode, setMode] = React.useState<"calendar" | "timeline">("calendar");

  React.useEffect(() => {
    void loadAll(["events", "exams", "assignments", "subjects"]);
  }, [loadAll]);

  const cells = React.useMemo(
    () => monthGrid(cursor.getFullYear(), cursor.getMonth()),
    [cursor],
  );

  const eventsByDay = React.useMemo(() => {
    const map = new Map<string, AppEvent[]>();
    for (const e of events) {
      const d = new Date(e.startDate);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      map.set(key, [...(map.get(key) ?? []), e]);
    }
    return map;
  }, [events]);

  const today = new Date();

  const dayDetail = React.useMemo(() => {
    const dayEvents = events.filter((e) => isSameDay(new Date(e.startDate), selected));
    const dayExams = exams.filter((e) => isSameDay(new Date(e.date), selected));
    const dayAssignments = assignments.filter(
      (a) => a.dueDate && isSameDay(new Date(a.dueDate), selected),
    );
    return { dayEvents, dayExams, dayAssignments };
  }, [events, exams, assignments, selected]);

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
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            {(["calendar", "timeline"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors",
                  mode === m
                    ? "bg-card text-slate-900 shadow-sm dark:text-slate-100"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400",
                )}
                aria-pressed={mode === m}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        }
      />

      {mode === "calendar" ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
          {/* Month grid */}
          <section className="sf-card overflow-hidden">
            <header className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <h2 className="text-[18px] font-semibold text-slate-800 dark:text-slate-100">
                {cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </h2>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="iconSm" onClick={() => setCursor(addMonths(cursor, -1))} aria-label="Previous month">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCursor(new Date());
                    setSelected(new Date());
                  }}
                >
                  Today
                </Button>
                <Button variant="ghost" size="iconSm" onClick={() => setCursor(addMonths(cursor, 1))} aria-label="Next month">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </header>
            <div className="p-4">
              <div className="grid grid-cols-7 gap-1 pb-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
                {WEEKDAY_SHORT.map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {cells.map(({ date, inMonth }) => {
                  const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
                  const dayEvents = eventsByDay.get(key) ?? [];
                  const isSelected = isSameDay(date, selected);
                  const isToday = isSameDay(date, today);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelected(date)}
                      aria-pressed={isSelected}
                      aria-label={formatFullDate(date)}
                      className={cn(
                        "flex h-[64px] flex-col items-start rounded-lg border p-1.5 text-left transition-colors",
                        inMonth
                          ? "border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
                          : "border-transparent text-slate-300 dark:text-slate-600",
                        isSelected && "ring-2",
                      )}
                      style={isSelected ? { boxShadow: "inset 0 0 0 2px rgb(var(--sf-primary))" } : undefined}
                    >
                      <span
                        className={cn(
                          "mb-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold",
                          isToday && "text-white",
                        )}
                        style={isToday ? { backgroundColor: "rgb(var(--sf-primary))" } : undefined}
                      >
                        {date.getDate()}
                      </span>
                      <span className="flex flex-wrap gap-0.5">
                        {dayEvents.slice(0, 3).map((e) => (
                          <span key={e.id} className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: e.color }} />
                        ))}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Day detail */}
          <aside className="sf-card h-fit overflow-hidden">
            <header className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <h3 className="text-[18px] font-semibold text-slate-800 dark:text-slate-100">
                {formatFullDate(selected)}
              </h3>
            </header>
            <div className="flex flex-col gap-4 p-5">
              <div>
                <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <CalendarDays className="h-3.5 w-3.5" /> Events
                </h4>
                {dayDetail.dayEvents.length === 0 ? (
                  <p className="text-sm text-slate-400">No events</p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {dayDetail.dayEvents.map((e) => (
                      <li key={e.id} className="flex items-center gap-2.5 rounded-lg border border-slate-100 px-3 py-2 text-sm dark:border-slate-800">
                        <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: e.color }} />
                        <span className="min-w-0 flex-1 truncate font-medium text-slate-800 dark:text-slate-100">{e.title}</span>
                        <span className="shrink-0 text-xs text-slate-400">
                          {new Date(e.startDate).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Exams</h4>
                {dayDetail.dayExams.length === 0 ? (
                  <p className="text-sm text-slate-400">No exams</p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {dayDetail.dayExams.map((e) => (
                      <li key={e.id} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: "rgb(var(--sf-primary-soft))" }}>
                        <span className="font-medium text-slate-800 dark:text-slate-100">{e.title}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Due</h4>
                {dayDetail.dayAssignments.length === 0 ? (
                  <p className="text-sm text-slate-400">Nothing due</p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {dayDetail.dayAssignments.map((a) => (
                      <li key={a.id} className="rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                        {a.title}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-1"
                onClick={() => navigate("events")}
              >
                Add an event →
              </Button>
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

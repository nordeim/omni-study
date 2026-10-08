"use client";

import * as React from "react";
import { ArrowRight, BookOpen, Calendar, Check, CircleAlert, Clock, Flag, Flame, GraduationCap, Sparkles, SquareCheckBig, Target } from "lucide-react";
import { useAppStore, useThemeStore } from "@/lib/store";
import { useDataStore, mutations, type Task } from "@/lib/data";
import { STAT_COLORS, SectionCard, StatCard, ViewAllLink, useSubjectMap } from "./shared";
import { greetingForHour } from "@/lib/router";
import { daysUntil, formatFullDate, isSameDay } from "@/lib/date";
import { Checkbox } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

// Dashboard — layout measured from the live reference:
//   header row (greeting + gradient CTA)
//   stats grid grid-cols-2 lg:grid-cols-4 gap-4
//   grid lg:grid-cols-3 gap-6: Today's Tasks (col-span-2) + Upcoming Exams
//   Upcoming Assignments (full width)

// S6-D — the reference's dashboard task row (measured with a real
// due-today task): a BARE `flex items-center gap-4 p-4 hover:bg-slate-50
// transition-colors` row (no border/radius/card) with a 20px ROUND
// border-2 checkbox and a `p.font-medium.text-slate-700.truncate` title
// ONLY — no subject, no star. Clicking the title navigates to Tasks.

// S8-B — the reference's exam date line (measured): "Oct 10, 12:00 AM"
// (short month + day, comma, 12-hour clock).
function formatExamWhen(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
}

// S9-R (measured on the reference): the dashboard's per-section empty state
// is a SLIM inline block — `p-8 text-center text-slate-500` with a leading
// `w-12 h-12 mx-auto text-slate-300 mb-3` icon — NOT the 80px gradient
// EmptyState used by whole-view empties.
function DashSectionEmpty({
  icon: Icon,
  message,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  message: string;
}) {
  return (
    <div className="p-8 text-center text-slate-500 dark:text-slate-400">
      <Icon className="mx-auto mb-3 h-12 w-12 text-slate-300 dark:text-slate-600" strokeWidth={1.75} aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}

function TaskRow({ task, onOpen }: { task: Task; onOpen: () => void }) {
  return (
    <li className="flex items-center gap-4 p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
      <button
        type="button"
        role="checkbox"
        aria-checked={task.completed}
        aria-label={`Mark "${task.title}" ${task.completed ? "incomplete" : "complete"}`}
        onClick={() => void mutations.updateTask(task.id, { completed: !task.completed })}
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all hover:scale-110 sf-focus",
          task.completed
            ? "border-transparent bg-sf-primary text-white"
            : "border-slate-300 dark:border-slate-600",
        )}
      >
        {task.completed && <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />}
      </button>
      <button type="button" onClick={onOpen} className="sf-focus min-w-0 flex-1 rounded text-left">
        <p
          className={cn(
            "truncate font-medium",
            task.completed ? "text-slate-400 line-through" : "text-slate-700 dark:text-slate-200",
          )}
        >
          {task.title}
        </p>
      </button>
    </li>
  );
}

export function DashboardView() {
  const navigate = useAppStore((s) => s.navigate);
  const userName = useThemeStore((s) => s.userName);
  const tasks = useDataStore((s) => s.data.tasks);
  const assignments = useDataStore((s) => s.data.assignments);
  const exams = useDataStore((s) => s.data.exams);
  const focusSessions = useDataStore((s) => s.data.focusSessions);
  const loadAll = useDataStore((s) => s.loadAll);
  const subjectMap = useSubjectMap();

  React.useEffect(() => {
    void loadAll(["tasks", "assignments", "exams", "focusSessions", "subjects"]);
  }, [loadAll]);

  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const todayTasks = tasks.filter(
    (t) => t.myDay || (t.dueDate && isSameDay(new Date(t.dueDate), now)),
  );
  const doneToday = todayTasks.filter((t) => t.completed).length;
  const pending = tasks.filter((t) => !t.completed).length;
  const dueSoon = assignments.filter(
    (a) => a.status === "active" && a.dueDate && daysUntil(new Date(a.dueDate), now) <= 7,
  ).length;

  const thisMonth = now.getMonth();
  const focusMinutes = focusSessions
    .filter((f) => {
      const d = new Date(f.date);
      return d.getMonth() === thisMonth && f.mode === "focus";
    })
    .reduce((sum, f) => sum + f.durationMinutes, 0);
  const focusHours = focusMinutes >= 60 ? `${Math.floor(focusMinutes / 60)}h` : "0h";

  const upcomingExams = exams
    .filter((e) => e.status === "upcoming" && new Date(e.date).getTime() >= now.getTime() - 86_400_000)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const upcomingAssignments = assignments
    .filter((a) => a.status === "active")
    .sort((a, b) => (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999"))
    .slice(0, 3);

  const greeting = greetingForHour(now.getHours());

  // S9-A — the reference's overdue alert (live-measured): incomplete tasks
  // whose due date is strictly before today.
  const overdueCount = tasks.filter(
    (t) => !t.completed && t.dueDate && daysUntil(new Date(t.dueDate), now) < 0,
  ).length;

  return (
    <div className="flex flex-col gap-8">
      {/* Greeting row */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            {greeting}
            {userName ? `, ${userName}` : ""} 👋
          </h1>
          <p className="mt-1 text-base text-slate-500">{formatFullDate(now)}</p>
        </div>
        {/* self-start: the greeting row is flex-col below md — without it the
            CTA stretches full-width (measured 358px); the reference keeps it
            content-sized (155px) at mobile. */}
        <button
          type="button"
          onClick={() => navigate("myday")}
          className="inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 self-start sf-focus"
          style={{
            backgroundImage: "linear-gradient(to right, rgb(var(--sf-primary)), rgb(var(--sf-primary-gradient-to)))",
            boxShadow: "0 10px 15px -3px rgb(var(--sf-primary) / 0.25)",
          }}
        >
          <Sparkles className="h-4 w-4" strokeWidth={2} />
          Start My Day
        </button>
      </div>

      {/* S9-A — Overdue alert banner (reference-measured): gradient
          red-50 → orange-50, red-200 border, rounded-2xl, circle-alert block,
          red-700/600 text, ghost View All CTA linking to /Tasks. Sits between
          the greeting and the stats grid. */}
      {overdueCount > 0 && (
        <div
          aria-label="Overdue alert"
          className="rounded-2xl border border-red-200 p-4 dark:border-red-900/60"
          style={{
            // Trap 5 — sRGB-exact inline gradient (the utility interpolates
            // in oklab; measured: red-50 #fef2f2 → orange-50 #fff7ed).
            backgroundImage: "linear-gradient(to right, #fef2f2, #fff7ed)",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-950/60">
              <CircleAlert className="h-5 w-5 text-red-500 dark:text-red-400" strokeWidth={2} aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-red-700 dark:text-red-300">
                You have {overdueCount} overdue item(s)
              </h3>
              <p className="text-sm text-red-600 dark:text-red-400">Don't forget to complete them!</p>
            </div>
            <a
              href="/Tasks"
              className="inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              View All
              <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            </a>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Today's Progress" value={`${doneToday}/${todayTasks.length}`} hint="tasks completed" icon={Target} colors={STAT_COLORS.violet} />
        <StatCard label="Pending Tasks" value={String(pending)} hint="to be done" icon={SquareCheckBig} colors={STAT_COLORS.blue} />
        <StatCard label="Due Soon" value={String(dueSoon)} hint="assignments" icon={BookOpen} colors={STAT_COLORS.orange} />
        <StatCard label="Focus Time" value={focusHours} hint="this month" icon={Flame} colors={STAT_COLORS.pink} />
      </div>

      {/* Today's Tasks (2/3) + Upcoming Exams (1/3) — S8-B: the reference's
          card bodies are FLUSH divide-y lists (rows edge-to-edge, p-4 rows). */}
      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard
          title="Today's Tasks"
          icon={SquareCheckBig}
          className="lg:col-span-2"
          action={<ViewAllLink onClick={() => navigate("tasks")} />}
          flush
        >
          {todayTasks.length === 0 ? (
            <DashSectionEmpty icon={SquareCheckBig} message="No tasks for today. Add some from My Day!" />
          ) : (
            <ul className="divide-y divide-slate-50" aria-label="Today's tasks">
              {todayTasks.map((t) => (
                <TaskRow key={t.id} task={t} onOpen={() => navigate("tasks")} />
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title="Upcoming Exams"
          icon={GraduationCap}
          action={<ViewAllLink label="All" onClick={() => navigate("exams")} />}
          flush
        >
          {upcomingExams.length === 0 ? (
            <DashSectionEmpty icon={GraduationCap} message="No upcoming exams" />
          ) : (
            <ul className="divide-y divide-slate-50" aria-label="Upcoming exams">
              {upcomingExams.map((e) => {
                const days = daysUntil(new Date(e.date), now);
                return (
                  <li
                    key={e.id}
                    className="p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <h3 className="font-medium text-slate-700 dark:text-slate-200">{e.title}</h3>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          // Measured: the reference's dashboard exam badge is
                          // red-100/red-600 ("2d") — the dashboard's urgency
                          // scale is more aggressive than the amber exams-view
                          // badge (7-day red window).
                          days <= 7
                            ? "bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
                        )}
                      >
                        {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days}d`}
                      </span>
                    </div>
                    <p className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                      <Calendar className="h-3 w-3" aria-hidden="true" />
                      {formatExamWhen(e.date)}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>
      </div>

      {/* Upcoming Assignments (full width) */}
      <SectionCard
        title="Upcoming Assignments"
        icon={BookOpen}
        action={<ViewAllLink onClick={() => navigate("assignments")} />}
        flush
      >
        {upcomingAssignments.length === 0 ? (
          <DashSectionEmpty icon={BookOpen} message="No upcoming assignments" />
        ) : (
          <ul className="divide-y divide-slate-50" aria-label="Upcoming assignments">
            {upcomingAssignments.map((a) => {
              const due = a.dueDate ? new Date(a.dueDate) : null;
              const subject = a.subjectId ? subjectMap.get(a.subjectId) : undefined;
              return (
                <li
                  key={a.id}
                  className="flex items-center gap-4 p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  <span
                    className="h-12 w-1 shrink-0 rounded-full"
                    style={{ backgroundColor: subject?.color ?? "rgb(148, 163, 184)" }}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-medium text-slate-700 dark:text-slate-200">{a.title}</h3>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {due ? due.toLocaleDateString("en-US", { weekday: "long" }) : "no due date"}
                    </p>
                  </div>
                  <div className="min-w-[120px] text-right">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-200 bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-500 dark:border-yellow-900 dark:bg-yellow-950/40 dark:text-yellow-400">
                      <Flag className="h-3 w-3" aria-hidden="true" />
                      {a.priority ?? "medium"}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}

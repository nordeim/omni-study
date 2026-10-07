"use client";

import * as React from "react";
import { BookOpen, Flame, GraduationCap, Sparkles, SquareCheckBig, Target } from "lucide-react";
import { useAppStore, useThemeStore } from "@/lib/store";
import { useDataStore, mutations, type Task } from "@/lib/data";
import { STAT_COLORS, SectionCard, SimpleEmptyState, StatCard, ViewAllLink, useSubjectMap } from "./shared";
import { greetingForHour } from "@/lib/router";
import { daysUntil, formatFullDate, isSameDay } from "@/lib/date";
import { Checkbox } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

// Dashboard — layout measured from the live reference:
//   header row (greeting + gradient CTA)
//   stats grid grid-cols-2 lg:grid-cols-4 gap-4
//   grid lg:grid-cols-3 gap-6: Today's Tasks (col-span-2) + Upcoming Exams
//   Upcoming Assignments (full width)

function TaskRow({ task }: { task: Task }) {
  const subjectMap = useSubjectMap();
  const subject = task.subjectId ? subjectMap.get(task.subjectId) : undefined;
  return (
    <li className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
      <Checkbox
        checked={task.completed}
        onCheckedChange={(v) => mutations.updateTask(task.id, { completed: v === true })}
        aria-label={`Mark "${task.title}" ${task.completed ? "incomplete" : "complete"}`}
      />
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-sm font-medium",
            task.completed ? "text-slate-400 line-through" : "text-slate-800 dark:text-slate-100",
          )}
        >
          {task.title}
        </p>
        {subject && <p className="mt-0.5 text-xs" style={{ color: subject.color }}>{subject.name}</p>}
      </div>
      {task.important && <span className="text-xs text-amber-500">★</span>}
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

  const todayTasks = tasks.filter((t) => t.dueDate && isSameDay(new Date(t.dueDate), now));
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

  return (
    <div className="flex flex-col gap-8">
      {/* Greeting row */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            {greeting}
            {userName ? `, ${userName}` : ""} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500">{formatFullDate(now)}</p>
        </div>
        {/* self-start: the greeting row is flex-col below md — without it the
            CTA stretches full-width (measured 358px); the reference keeps it
            content-sized (155px) at mobile. */}
        <button
          type="button"
          onClick={() => navigate("myday")}
          className="inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 self-start sf-focus"
          style={{
            backgroundImage: "linear-gradient(to right, rgb(var(--sf-primary)), rgb(var(--sf-primary-strong)))",
            boxShadow: "0 10px 15px -3px rgb(var(--sf-primary) / 0.25)",
          }}
        >
          <Sparkles className="h-4 w-4" strokeWidth={2} />
          Start My Day
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Today's Progress" value={`${doneToday}/${todayTasks.length}`} hint="tasks completed" icon={Target} colors={STAT_COLORS.violet} />
        <StatCard label="Pending Tasks" value={String(pending)} hint="to be done" icon={SquareCheckBig} colors={STAT_COLORS.blue} />
        <StatCard label="Due Soon" value={String(dueSoon)} hint="assignments" icon={BookOpen} colors={STAT_COLORS.orange} />
        <StatCard label="Focus Time" value={focusHours} hint="this month" icon={Flame} colors={STAT_COLORS.pink} />
      </div>

      {/* Today's Tasks (2/3) + Upcoming Exams (1/3) */}
      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard
          title="Today's Tasks"
          icon={SquareCheckBig}
          className="lg:col-span-2"
          action={<ViewAllLink onClick={() => navigate("tasks")} />}
        >
          {todayTasks.length === 0 ? (
            <SimpleEmptyState icon={SquareCheckBig} message="No tasks for today. Add some from My Day!" />
          ) : (
            <ul className="flex flex-col gap-1">
              {todayTasks.map((t) => (
                <TaskRow key={t.id} task={t} />
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title="Upcoming Exams"
          icon={GraduationCap}
          action={<ViewAllLink label="All" onClick={() => navigate("exams")} />}
        >
          {upcomingExams.length === 0 ? (
            <SimpleEmptyState icon={GraduationCap} message="No upcoming exams" />
          ) : (
            <ul className="flex flex-col gap-3">
              {upcomingExams.map((e) => {
                const days = daysUntil(new Date(e.date), now);
                const subject = e.subjectId ? subjectMap.get(e.subjectId) : undefined;
                return (
                  <li key={e.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-4 py-3 dark:border-slate-800">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{e.title}</p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {subject ? `${subject.name} · ` : ""}
                        {new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        {e.location ? ` · ${e.location}` : ""}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-md bg-sf-primary-soft px-2 py-1 text-xs font-semibold text-sf-primary-strong dark:bg-sf-primary-soft-dark dark:text-sf-primary-strong-dark">
                      {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days} days`}
                    </span>
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
      >
        {upcomingAssignments.length === 0 ? (
          <SimpleEmptyState icon={BookOpen} message="No upcoming assignments" />
        ) : (
          <ul className="flex flex-col gap-3">
            {upcomingAssignments.map((a) => {
              const days = a.dueDate ? daysUntil(new Date(a.dueDate), now) : null;
              const subject = a.subjectId ? subjectMap.get(a.subjectId) : undefined;
              return (
                <li key={a.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-4 py-3 dark:border-slate-800">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{a.title}</p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {subject ? `${subject.name} · ` : ""}
                      {a.dueDate ? `due ${new Date(a.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : "no due date"}
                    </p>
                  </div>
                  {days !== null && (
                    <span
                      className={cn(
                        "shrink-0 rounded-md px-2 py-1 text-xs font-semibold",
                        days <= 1
                          ? "bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400"
                          : days <= 3
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
                      )}
                    >
                      {days < 0 ? "overdue" : days === 0 ? "today" : `${days}d left`}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}

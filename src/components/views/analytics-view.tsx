"use client";

import * as React from "react";
import { BarChart3, BookOpen, ChartColumn, Clock, GraduationCap, SquareCheckBig, TrendingUp } from "lucide-react";
import { useDataStore } from "@/lib/data";
import { EmptyState, useSubjectMap, ViewHeader } from "./shared";
import { formatMinutes, startOfDay } from "@/lib/date";

// Analytics — S7-D aligns the stat cards + chart cards with the measured
// reference: four r12 border-0 cards with 48px tinted icon blocks
// ("Tasks Completed X/Y", "Assignments X/Y", "Focus Time", "Upcoming Exams")
// and "Task Activity (Last 7 Days)" / "Focus Time (Last 7 Days)" chart cards.
// The clone's grade-trend and subject-distribution charts remain as
// supersets below. Charts are custom inline SVG (no chart library).

interface DayPoint {
  label: string;
  value: number;
}

function BarChart({
  data,
  color,
  height = 160,
  unit = "",
  title,
}: {
  data: DayPoint[];
  color: string;
  height?: number;
  unit?: string;
  title: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
      <div className="flex items-end gap-1" style={{ height }} role="img" aria-label={`${title} bar chart`}>
        {data.map((d, i) => (
          <div key={i} className="group relative flex h-full flex-1 flex-col justify-end">
            <span className="pointer-events-none absolute -top-6 left-1/2 hidden -translate-x-1/2 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-white group-hover:block">
              {d.value}{unit}
            </span>
            <div
              className="w-full rounded-t-md transition-all"
              style={{
                height: `${Math.max(2, (d.value / max) * 100)}%`,
                backgroundColor: d.value > 0 ? color : "#e2e8f0",
              }}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-1">
        {data.map((d, i) => (
          <span key={i} className="flex-1 truncate text-center text-[10px] text-slate-400">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  // Measured: rounded-xl border shadow card with a p-6 header carrying a
  // trending-up icon + text-lg semibold title.
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col space-y-1.5 p-6">
        <div className="flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-800 dark:text-slate-100">
          <TrendingUp className="h-5 w-5 text-sf-primary" strokeWidth={2} aria-hidden="true" />
          {title}
        </div>
      </div>
      <div className="px-6 pb-6">{children}</div>
    </section>
  );
}

/** S7-D: the measured stat card — 48px tinted icon block + label/value/sub stack. */
function AnalyticsStatCard({
  label,
  value,
  sub,
  icon: Icon,
  tintClass,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  tintClass: string;
}) {
  return (
    <div className="rounded-xl bg-white shadow-sm dark:bg-slate-900">
      <div className="p-6">
        <div className="flex items-center gap-4">
          <div className={"flex h-12 w-12 shrink-0 items-center justify-center rounded-xl " + tintClass}>
            <Icon className="h-6 w-6" strokeWidth={2} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">{sub}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LineChart({ points, title }: { points: { x: string; y: number }[]; title: string }) {
  if (points.length < 2) {
    return (
      <div className="flex h-[180px] items-center justify-center text-sm text-slate-400">
        Add more grades to see your trend
      </div>
    );
  }
  const w = 560;
  const h = 180;
  const pad = 24;
  const maxY = 100;
  const xs = points.map((_, i) => pad + (i / (points.length - 1)) * (w - pad * 2));
  const ys = points.map((p) => h - pad - (p.y / maxY) * (h - pad * 2));
  const path = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${ys[i]!.toFixed(1)}`).join(" ");
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label={`${title} line chart`}>
        <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="#e2e8f0" />
        <line x1={pad} y1={pad} x2={pad} y2={h - pad} stroke="#e2e8f0" />
        <text x={pad - 4} y={pad + 4} textAnchor="end" fontSize="9" fill="#94a3b8">100</text>
        <text x={pad - 4} y={h - pad} textAnchor="end" fontSize="9" fill="#94a3b8">0</text>
        <path d={path} fill="none" stroke="rgb(var(--sf-primary))" strokeWidth="2" />
        {xs.map((x, i) => (
          <circle key={i} cx={x} cy={ys[i]} r="3.5" fill="rgb(var(--sf-primary))" />
        ))}
      </svg>
      <div className="flex justify-between text-[10px] text-slate-400">
        <span>{points[0]?.x}</span>
        <span>{points[points.length - 1]?.x}</span>
      </div>
    </div>
  );
}

export function AnalyticsView() {
  const tasks = useDataStore((s) => s.data.tasks);
  const focusSessions = useDataStore((s) => s.data.focusSessions);
  const grades = useDataStore((s) => s.data.grades);
  const assignments = useDataStore((s) => s.data.assignments);
  const exams = useDataStore((s) => s.data.exams);
  const subjects = useDataStore((s) => s.data.subjects);
  const loadAll = useDataStore((s) => s.loadAll);
  const subjectMap = useSubjectMap();

  React.useEffect(() => {
    void loadAll(["tasks", "focusSessions", "grades", "assignments", "exams", "subjects"]);
  }, [loadAll]);

  // S7-D: measured 7-day windows with day-name ("Thu"…"Wed") axes.
  const completion = React.useMemo<DayPoint[]>(() => {
    const days: DayPoint[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const done = tasks.filter(
        (t) =>
          t.completed &&
          t.dueDate &&
          new Date(t.dueDate).toDateString() === d.toDateString(),
      ).length;
      days.push({ label: d.toLocaleDateString("en-US", { weekday: "short" }), value: done });
    }
    return days;
  }, [tasks]);

  // S7-D: 7-day focus minutes series.
  const focus = React.useMemo<DayPoint[]>(() => {
    const days: DayPoint[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const mins = focusSessions
        .filter((f) => f.mode === "focus" && new Date(f.date).toDateString() === d.toDateString())
        .reduce((s, f) => s + f.durationMinutes, 0);
      days.push({ label: d.toLocaleDateString("en-US", { weekday: "short" }), value: mins });
    }
    return days;
  }, [focusSessions]);

  const gradeTrend = React.useMemo(
    () =>
      [...grades]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((g) => ({
          x: new Date(g.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          y: Math.round((g.score / g.maxScore) * 100),
        })),
    [grades],
  );

  // S7-D: measured stat values — Tasks Completed X/Y + completion rate,
  // Assignments done/total + avg progress, Focus Time, Upcoming Exams.
  const doneTasks = tasks.filter((t) => t.completed).length;
  const completionRate = tasks.length === 0 ? 0 : Math.round((doneTasks / tasks.length) * 100);
  const doneAssignments = assignments.filter((a) => a.status === "graded" || a.status === "submitted").length;
  const avgProgress =
    assignments.length === 0
      ? 0
      : Math.round(assignments.reduce((s, a) => s + (a.progress ?? 0), 0) / assignments.length);

  const thisMonthFocus = focusSessions
    .filter((f) => {
      const d = new Date(f.date);
      return d.getMonth() === new Date().getMonth() && f.mode === "focus";
    })
    .reduce((s, f) => s + f.durationMinutes, 0);

  const upcomingExams = exams.filter(
    (e) => new Date(e.date).getTime() >= startOfDay(new Date()).getTime(),
  ).length;

  // subject distribution (tasks per subject)
  const distribution = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of tasks) {
      if (!t.subjectId) continue;
      counts.set(t.subjectId, (counts.get(t.subjectId) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([id, count]) => ({ subject: subjectMap.get(id), count }))
      .filter((d): d is { subject: NonNullable<ReturnType<typeof subjectMap.get>>; count: number } => Boolean(d.subject))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [tasks, subjectMap]);

  const hasAnyData =
    tasks.length + focusSessions.length + grades.length + assignments.length + exams.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <ViewHeader title="Analytics" subtitle="Track your study progress and productivity" icon={ChartColumn} />

      {!hasAnyData ? (
        <div className="sf-card">
          <EmptyState
            icon={BarChart3}
            title="No data yet"
            hint="Complete tasks, log focus sessions and record grades — your analytics appear here."
          />
        </div>
      ) : (
        <>
          {/* S7-D — measured stat cards: r12 border-0 + 48px tinted icon blocks. */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Analytics stats">
            <AnalyticsStatCard
              label="Tasks Completed"
              value={`${doneTasks}/${tasks.length}`}
              sub={`${completionRate}% completion rate`}
              icon={SquareCheckBig}
              tintClass="bg-violet-100 text-violet-600 dark:bg-violet-950/60 dark:text-violet-300"
            />
            <AnalyticsStatCard
              label="Assignments"
              value={`${doneAssignments}/${assignments.length}`}
              sub={`${avgProgress}% avg progress`}
              icon={BookOpen}
              tintClass="bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300"
            />
            <AnalyticsStatCard
              label="Focus Time"
              value={formatMinutes(thisMonthFocus)}
              sub="total study hours"
              icon={Clock}
              tintClass="bg-green-100 text-green-600 dark:bg-green-950/60 dark:text-green-300"
            />
            <AnalyticsStatCard
              label="Upcoming Exams"
              value={String(upcomingExams)}
              sub={`${upcomingExams === 1 ? "exam" : "exams"} scheduled`}
              icon={GraduationCap}
              tintClass="bg-orange-100 text-orange-600 dark:bg-orange-950/60 dark:text-orange-300"
            />
          </div>

          {/* Measured chart cards: 7-day windows, trending-up icon headers. */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCard title="Task Activity (Last 7 Days)">
              <BarChart data={completion} color="rgb(139, 92, 246)" title="" />
            </ChartCard>
            <ChartCard title="Focus Time (Last 7 Days)">
              <BarChart data={focus} color="rgb(139, 92, 246)" title="" unit="m" />
            </ChartCard>
          </div>

          {/* Superset charts kept below the measured pair. */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <section className="sf-card p-6">
              <LineChart points={gradeTrend} title="Grade trend (%)" />
            </section>
            <section className="sf-card p-6">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Tasks by subject
              </p>
              {distribution.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">No subject-tagged tasks yet</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {distribution.map(({ subject, count }) => (
                    <li key={subject.id} className="flex items-center gap-3">
                      <span className="w-28 shrink-0 truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                        {subject.name}
                      </span>
                      <div className="h-6 flex-1 overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full rounded-md"
                          style={{
                            width: `${(count / Math.max(...distribution.map((d) => d.count))) * 100}%`,
                            backgroundColor: subject.color,
                          }}
                        />
                      </div>
                      <span className="w-8 shrink-0 text-right text-sm font-semibold text-slate-600 dark:text-slate-300">
                        {count}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}

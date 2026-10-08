"use client";

import * as React from "react";
import { BarChart3, BookOpen, ChartColumn, Clock, Flame, GraduationCap, SquareCheckBig, Target, TrendingUp } from "lucide-react";
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

/** Catmull-Rom → cubic-bezier smoothing (recharts' default curve feel). */
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0]!.x.toFixed(1)},${pts[0]!.y.toFixed(1)}`;
  let d = `M ${pts[0]!.x.toFixed(1)},${pts[0]!.y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]!;
    const p1 = pts[i]!;
    const p2 = pts[i + 1]!;
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  return d;
}

/** S9-K (measured on the reference): the 7-day charts are recharts-style
 *  AREA charts — a 250px-tall plot with 12px #666 axis labels (X = day
 *  names Fri…Thu, Y = 5 ticks), horizontal #f1f5f9 gridlines dashed 3 3.
 *  Task Activity renders a single slate-200-filled area; Focus Time a
 *  violet gradient area + #8b5cf6 line on top. Y ticks mirror recharts'
 *  default scale: counts cap at ≥ 2 (0.5 steps at 2 — the reference's
 *  measured ticks), focus at ≥ 4 whole hours (0h…4h). Hover tooltips are
 *  the clone's superset. */
function AreaChart({
  data,
  ariaLabel,
  unit = "",
  line = false,
}: {
  data: DayPoint[];
  ariaLabel: string;
  unit?: string;
  line?: boolean;
}) {
  const W = 560;
  const H = 250;
  const padL = 44;
  const padR = 10;
  const padT = 10;
  const padB = 30;
  const iw = W - padL - padR;
  const ih = H - padT - padB;
  const isHours = unit === "h";
  const maxVal = Math.max(0, ...data.map((d) => d.value));
  const niceMax = isHours
    ? Math.max(240, Math.ceil(Math.max(1, maxVal) / 60) * 60)
    : Math.max(2, Math.ceil(maxVal));
  const ticks = Array.from({ length: 5 }, (_, i) => (niceMax * i) / 4);
  const fmtTick = (v: number) =>
    isHours ? `${Math.round(v / 60)}h` : Number.isInteger(v) ? String(v) : v.toFixed(1);
  const xAt = (i: number) => padL + (data.length <= 1 ? iw / 2 : (i / (data.length - 1)) * iw);
  const yAt = (v: number) => padT + ih - (v / niceMax) * ih;
  const baseY = padT + ih;
  const pts = data.map((d, i) => ({ x: xAt(i), y: yAt(d.value) }));
  const path = smoothPath(pts);
  const areaPath =
    pts.length > 0
      ? `${path} L ${xAt(data.length - 1).toFixed(1)},${baseY} L ${xAt(0).toFixed(1)},${baseY} Z`
      : "";
  const gradId = `areaGrad-${ariaLabel.replace(/\W+/g, "")}`;
  const [hover, setHover] = React.useState<number | null>(null);
  const fmtValue = (v: number) => (isHours ? formatMinutes(v) : String(v));

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={ariaLabel}
        onMouseLeave={() => setHover(null)}
      >
        {line && (
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.05" />
            </linearGradient>
          </defs>
        )}
        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} y1={yAt(t)} x2={W - padR} y2={yAt(t)} stroke="#f1f5f9" strokeDasharray="3 3" />
            <text x={padL - 8} y={yAt(t) + 4} textAnchor="end" fontSize="12" fill="#666">
              {fmtTick(t)}
            </text>
          </g>
        ))}
        {data.map((d, i) => (
          <text key={`${d.label}-${i}`} x={xAt(i)} y={H - 8} textAnchor="middle" fontSize="12" fill="#666">
            {d.label}
          </text>
        ))}
        {areaPath && <path d={areaPath} fill={line ? `url(#${gradId})` : "#e2e8f0"} />}
        {line && path && <path d={path} fill="none" stroke="#8b5cf6" strokeWidth="2" />}
        {data.map((d, i) => {
          const colW = data.length > 0 ? iw / data.length : iw;
          return (
            <rect
              key={`hover-${i}`}
              x={padL + i * colW}
              y={padT}
              width={colW}
              height={ih}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
            />
          );
        })}
        {hover !== null && data[hover] && (
          <circle cx={xAt(hover)} cy={yAt(data[hover]!.value)} r="4" fill="#8b5cf6" stroke="#ffffff" strokeWidth="2" />
        )}
      </svg>
      {hover !== null && data[hover] && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 rounded bg-slate-800 px-2 py-1 text-[11px] text-white"
          style={{ left: `${(xAt(hover) / W) * 100}%`, top: 0 }}
        >
          {data[hover]!.label}: {fmtValue(data[hover]!.value)}
        </div>
      )}
    </div>
  );
}

function ChartCard({
  title,
  icon: Icon = TrendingUp,
  children,
}: {
  title: string;
  /** S8-I (measured): each reference chart card carries its OWN icon —
   *  trending-up (Task Activity), clock (Focus Time), book-open
   *  (Assignment Status), target (Subject Workload) — all w-5 h-5
   *  text-violet-500. */
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  children: React.ReactNode;
}) {
  // Measured: rounded-xl border shadow card with a p-6 header carrying a
  // per-card icon + text-lg semibold title (S8-I icon prop).
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col space-y-1.5 p-6">
        <div className="flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-800 dark:text-slate-100">
          <Icon className="h-5 w-5 text-sf-primary" strokeWidth={2} aria-hidden="true" />
          {title}
        </div>
      </div>
      <div className="p-6 pt-0">{children}</div>
    </section>
  );
}

/** S8-I — the reference's "Assignment Status" donut (measured: a recharts
 *  pie, 250px, Not Started sector #94a3b8 — the only populated state on the
 *  audit account). The In Progress / Completed sectors are unmeasurable on
 *  the empty reference; the palette follows the measured slate-400 + the
 *  app's accent/emerald conventions. Donut-style rings (inner radius) with
 *  the legend chips below. */
function StatusDonut({
  slices,
}: {
  slices: { label: string; value: number; color: string }[];
}) {
  const total = slices.reduce((s, x) => s + x.value, 0);
  const size = 200;
  const stroke = 32;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <>
      {/* S8-I (measured): the reference's recharts pie plot area is 250px
          tall — the donut centers inside it, legend below. */}
      <div className="flex h-[250px] items-center justify-center" aria-label="Assignment status chart">
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Assignment status donut chart">
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
            {total > 0 &&
              slices.map((s) => {
                if (s.value <= 0) return null;
                const frac = s.value / total;
                const dash = frac * c;
                const offset = -acc * c;
                acc += frac;
                return (
                  <circle
                    key={s.label}
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={stroke}
                    strokeDasharray={`${dash} ${c - dash}`}
                    strokeDashoffset={offset}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                  />
                );
              })}
          </svg>
          <span className="absolute text-2xl font-bold text-slate-800 dark:text-slate-100">{total}</span>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-4">
        {slices.map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color }} aria-hidden="true" />
            {s.label} ({s.value})
          </div>
        ))}
      </div>
    </>
  );
}
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
  const subjectWorkload = React.useMemo(() => {
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

  // S8-I (measured): the reference's "Assignment Status" donut — the only
  // populated sector on the audit account was Not Started #94a3b8 (1
  // assignment); In Progress / Completed colors follow the app conventions
  // (accent violet-500 / green-500).
  const assignmentStatus = React.useMemo(
    () => [
      { label: "Not Started", value: assignments.filter((a) => a.status === "active" && (a.progress ?? 0) === 0).length, color: "#94a3b8" },
      { label: "In Progress", value: assignments.filter((a) => a.status === "active" && (a.progress ?? 0) > 0).length, color: "#8b5cf6" },
      { label: "Completed", value: assignments.filter((a) => a.status === "submitted" || a.status === "graded").length, color: "#22c55e" },
    ],
    [assignments],
  );

  // S8-I: "Active Items by Priority" — active assignments + uncompleted
  // tasks, grouped by priority. Measured chip colors: medium #f59e0b,
  // high #ef4444 (amber-500 / red-500); low follows the sky family.
  const activeByPriority = React.useMemo(() => {
    const counts = new Map<string, number>();
    const bump = (p: string) => counts.set(p, (counts.get(p) ?? 0) + 1);
    for (const a of assignments) if (a.status === "active") bump(a.priority);
    for (const t of tasks) if (!t.completed && t.priority !== "none") bump(t.priority);
    const palette: Record<string, { color: string; label: string }> = {
      low: { color: "#0ea5e9", label: "Low Priority" },
      medium: { color: "#f59e0b", label: "Medium Priority" },
      high: { color: "#ef4444", label: "High Priority" },
      urgent: { color: "#dc2626", label: "Urgent" },
    };
    return ["low", "medium", "high", "urgent"]
      .filter((p) => (counts.get(p) ?? 0) > 0)
      .map((p) => ({ label: palette[p]!.label, value: counts.get(p)!, color: palette[p]!.color }));
  }, [assignments, tasks]);

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
          {/* S7-D — measured stat cards: r12 border-0 + 48px tinted icon
              blocks. S8-I: the reference's grid is grid-cols-2 lg:grid-cols-4. */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="Analytics stats">
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

          {/* Measured chart cards: 7-day windows, per-card icon headers
              (S8-I: trending-up / clock / book-open / target). */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCard title="Task Activity (Last 7 Days)">
              <AreaChart data={completion} ariaLabel="Task activity chart" />
            </ChartCard>
            <ChartCard title="Focus Time (Last 7 Days)" icon={Clock}>
              <AreaChart data={focus} ariaLabel="Focus time chart" unit="h" line />
            </ChartCard>
            <ChartCard title="Assignment Status" icon={BookOpen}>
              <StatusDonut slices={assignmentStatus} />
            </ChartCard>
            <ChartCard title="Subject Workload" icon={Target}>
              {/* S8-I (measured): a 250px plot area; the reference shows the
                  centered "No subject data yet" empty text when bare. */}
              <div className="h-[250px]" aria-label="Subject workload chart">
                {subjectWorkload.length === 0 ? (
                  <p className="flex h-full items-center justify-center text-slate-400">No subject data yet</p>
                ) : (
                  <ul className="flex h-full flex-col justify-center gap-3">
                    {subjectWorkload.map(({ subject, count }) => (
                      <li key={subject.id} className="flex items-center gap-3">
                        <span className="w-28 shrink-0 truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                          {subject.name}
                        </span>
                        <div className="h-6 flex-1 overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800">
                          <div
                            className="h-full rounded-md"
                            style={{
                              width: `${(count / Math.max(...subjectWorkload.map((d) => d.count))) * 100}%`,
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
              </div>
            </ChartCard>
          </div>

          {/* S8-I (measured): "Active Items by Priority" — flame icon header
              + a flex-wrap row of slate-50 chips (16px color dot + bold
              count + xs label). */}
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col space-y-1.5 p-6">
              <div className="flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-800 dark:text-slate-100">
                <Flame className="h-5 w-5 text-sf-primary" strokeWidth={2} aria-hidden="true" />
                Active Items by Priority
              </div>
            </div>
            <div className="p-6 pt-0">
              {activeByPriority.length === 0 ? (
                <p className="py-8 text-center text-slate-400">No active items</p>
              ) : (
                <div className="flex flex-wrap gap-4" aria-label="Priority chips">
                  {activeByPriority.map((p) => (
                    <div
                      key={p.label}
                      className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60"
                    >
                      <div className="h-4 w-4 rounded-full" style={{ backgroundColor: p.color }} aria-hidden="true" />
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-100">{p.value}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{p.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Superset charts kept below the measured set. */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <section className="sf-card p-6">
              <LineChart points={gradeTrend} title="Grade trend (%)" />
            </section>
          </div>
        </>
      )}
    </div>
  );
}

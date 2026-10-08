"use client";

import * as React from "react";
import { ArrowRight, Calendar, Check, MoreHorizontal, Star, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { mutations, useDataStore, type Subject, type Task } from "@/lib/data";

// Shared view primitives: page headers, empty states, subject helpers.

export function ViewHeader({
  title,
  subtitle,
  actions,
  icon: Icon,
  size = "md",
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  /** Reference view titles carry a 24px violet lucide icon on 16 of 18
   *  non-dashboard views (measured map — Tasks/MyDay have none). */
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  /** Reference exception: MyDay + FocusTimer titles are text-3xl (30px). */
  size?: "md" | "lg";
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        {/* Reference (measured on every view): <h1 class="text-2xl font-bold
            text-slate-800 flex items-center gap-2"> + optional 24px
            text-violet-500 icon; tracking is NORMAL (not tracking-tight).
            Subtitle: p.text-slate-500 → 16px. */}
        <h1
          className={cn(
            "flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100",
            size === "lg" ? "text-3xl" : "text-2xl",
          )}
        >
          {Icon && <Icon className="h-6 w-6 text-sf-primary" strokeWidth={2} />}
          {title}
        </h1>
        {subtitle && <p className="text-base text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  hint,
  action,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  // Reference pattern (measured on Tasks/Notes): flex flex-col
  // items-center justify-center py-16 px-4 text-center — an 80px
  // rounded-2xl gradient block (violet-100 → indigo-100) holding a 40px
  // violet-500 icon, an h3 20px/600 slate-800 title, and a 16px
  // slate-500 hint (S4-C). Gradient routes through the accent tokens.
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
      <div
        className="flex h-20 w-20 items-center justify-center rounded-2xl"
        style={{
          backgroundImage:
            "linear-gradient(to right bottom, rgb(var(--sf-primary-empty-from)), rgb(var(--sf-primary-empty-to)))",
        }}
      >
        <Icon className="h-10 w-10 text-sf-primary" strokeWidth={2} />
      </div>
      <h3 className="mt-4 text-xl font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
      {hint && <p className="text-base text-slate-500">{hint}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function LoadingCards({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="sf-card sf-skeleton h-28" />
      ))}
    </div>
  );
}

/** Resolve a subject by id with a stable map. */
export function useSubjectMap() {
  const subjects = useDataStore((s) => s.data.subjects);
  return React.useMemo(() => {
    const map = new Map<string, Subject>();
    for (const s of subjects) map.set(s.id, s);
    return map;
  }, [subjects]);
}

export function SubjectChip({ subject }: { subject?: Subject | null }) {
  if (!subject) return null;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: `${subject.color}1a`, color: subject.color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: subject.color }} />
      {subject.name}
    </span>
  );
}

export function ViewAllLink({ label = "View All", onClick }: { label?: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-8 items-center gap-0 rounded-md px-3 text-xs font-medium transition-colors text-sf-primary-strong hover:opacity-80 sf-focus dark:text-sf-primary-strong-dark"
    >
      {label}
      {/* Reference (measured): lucide-arrow-right w-4 h-4 ml-1 — the
          clone previously rendered a unicode "→" span (S4-E). */}
      <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
    </button>
  );
}

interface StatCardColors {
  /** Gradient stops + tinted shadow (measured on the reference). */
  from: string;
  to: string;
  shadow: string;
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  colors,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  colors: StatCardColors;
}) {
  const gradient = `linear-gradient(to bottom right, ${colors.from}, ${colors.to})`;
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      {/* decorative blob (measured: -right-8 -bottom-8 w-32 h-32 opacity-10) */}
      <div
        aria-hidden="true"
        className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full opacity-10"
        style={{ backgroundImage: gradient }}
      />
      {/* Reference internals (S4-B, measured): label text-sm font-medium
          slate-500 mb-1; value <h3 class="text-3xl font-bold"> — 30px/700
          with v4's 36px text-3xl line-height and NORMAL tracking; hint
          text-sm slate-400 mt-1. The clone previously rendered
          p.text-[30px].leading-none.tracking-tight with a 12px hint. */}
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="mb-1 text-sm font-medium text-slate-500">{label}</p>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{value}</h3>
          <p className="mt-1 text-sm text-slate-400">{hint}</p>
        </div>
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white"
          style={{
            backgroundImage: gradient,
            boxShadow: `0 10px 15px -3px ${colors.shadow}`,
          }}
        >
          {/* Reference stat chips carry a w-6 h-6 (24px) white glyph —
              measured live (session 3; the clone previously used 20px). */}
          <Icon className="h-6 w-6" strokeWidth={2} />
        </span>
      </div>
    </div>
  );
}

/** The reference's measured stat-card color pairs (gradient + tinted shadow). */
export const STAT_COLORS = {
  violet: { from: "#8b5cf6", to: "#4f46e5", shadow: "rgba(139, 92, 246, 0.25)" },
  blue: { from: "#3b82f6", to: "#0891b2", shadow: "rgba(59, 130, 246, 0.25)" },
  orange: { from: "#f97316", to: "#d97706", shadow: "rgba(249, 115, 22, 0.25)" },
  pink: { from: "#ec4899", to: "#e11d48", shadow: "rgba(236, 72, 153, 0.25)" },
} as const;

/** Simple section empty state — reference pattern (S4-C): py-16 px-4,
 *  80px gradient block, h3 20px/600, 16px slate-500 hint. */
export function SimpleEmptyState({
  icon: Icon,
  message,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 text-center text-slate-500">
      <div
        className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl"
        style={{
          backgroundImage:
            "linear-gradient(to right bottom, rgb(var(--sf-primary-empty-from)), rgb(var(--sf-primary-empty-to)))",
        }}
      >
        <Icon className="h-10 w-10 text-sf-primary" strokeWidth={2} />
      </div>
      <p className="text-base">{message}</p>
    </div>
  );
}

export function SectionCard({
  title,
  icon: Icon,
  action,
  children,
  className,
  bodyClassName,
  flush = false,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  /** S8-B (measured): the reference's dashboard card bodies are FLUSH —
   *  `divide-y divide-slate-50` edge-to-edge rows with NO body padding
   *  (only the header is p-6). Padded (default) keeps the S4 card body. */
  flush?: boolean;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900",
        className,
      )}
    >
      <header className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
        {/* Reference (measured): dashboard card titles are <h2> 18px/600
            with a 20px icon — the h3 level belongs to stat values (S4-J). */}
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
          <Icon className="h-5 w-5 text-sf-primary" strokeWidth={2} />
          {title}
        </h2>
        {action}
      </header>
      <div
        className={cn(
          flush ? "divide-y divide-slate-50 dark:divide-slate-800" : "p-6",
          !flush && bodyClassName,
        )}
      >
        {children}
      </div>
    </section>
  );
}

export function ErrorText({ message }: { message: string }) {
  return (
    <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400" role="alert">
      {message}
    </p>
  );
}

// ---- S6-A · the reference's populated task row (measured live) ---------------
//
// The reference renders every task row as a STANDALONE bordered card
// (`group bg-white rounded-xl border transition-all duration-200
// border-slate-200 hover:border-violet-200 hover:shadow-md
// hover:shadow-violet-100/50`) wrapping `flex items-center gap-3 p-4`, with:
//   • a 24px ROUND checkbox whose 2px border IS the priority color
//     (slate-300 none / sky-400 low / amber-400 medium / red-400 high —
//     slate-300 + red-400 measured; the middle steps follow the same
//     reference palette ladder),
//   • a slate-700 font-medium title (clickable → edit dialog),
//   • a `mt-1` meta row of PILLS: due date (slate-100/slate-500 future,
//     red-100/red-600 due-today-or-overdue — both measured), repeat
//     (violet-100/violet-600 — measured "weekly"), + the clone's subject
//     and subtask-count as slate-100 superset pills,
//   • h-8 w-8 ghost actions revealed on group-hover: sun (My Day toggle),
//     star (violet-500 + fill when important — measured), ellipsis menu
//     (Edit / red-600 Delete — measured).
// Tasks + MyDay consume this row; the Dashboard renders its own lighter
// bare-row variant (S6-D).

const PRIORITY_BORDER: Record<string, string> = {
  none: "border-slate-300 dark:border-slate-600",
  low: "border-sky-400",
  medium: "border-amber-400",
  high: "border-red-400",
};

export function dueUrgency(dueDate: string | null): "past" | "today" | "future" | "none" {
  if (!dueDate) return "none";
  const due = new Date(dueDate);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
  if (due < startOfToday) return "past";
  if (due < startOfTomorrow) return "today";
  return "future";
}

export function TaskRowCard({
  task,
  subject,
  onEdit,
}: {
  task: Task;
  subject?: Subject | null;
  onEdit: (task: Task) => void;
}) {
  const subtasks = React.useMemo(() => {
    try {
      const parsed: unknown = JSON.parse(task.subtasks || "[]");
      return Array.isArray(parsed) ? (parsed as { id: string; title: string; done: boolean }[]) : [];
    } catch {
      return [];
    }
  }, [task.subtasks]);
  const doneSubtasks = subtasks.filter((s) => s.done).length;
  const urgency = dueUrgency(task.dueDate);
  const dueDated = task.dueDate ? new Date(task.dueDate) : null;

  return (
    <div className="group rounded-xl border border-slate-200 bg-white transition-all duration-200 hover:border-violet-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-violet-500/60">
      <div className="flex items-center gap-3 p-4">
        <button
          type="button"
          role="checkbox"
          aria-checked={task.completed}
          aria-label={`Mark "${task.title}" ${task.completed ? "incomplete" : "complete"}`}
          onClick={() => void mutations.updateTask(task.id, { completed: !task.completed })}
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all hover:scale-110 sf-focus",
            task.completed
              ? "sf-print-exact border-transparent bg-sf-primary text-white"
              : PRIORITY_BORDER[task.priority] ?? PRIORITY_BORDER.none,
          )}
        >
          {task.completed && <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />}
        </button>

        <button type="button" onClick={() => onEdit(task)} className="sf-focus min-w-0 flex-1 rounded text-left">
          <p
            className={cn(
              "truncate font-medium transition-colors",
              task.completed ? "text-slate-400 line-through" : "text-slate-700 dark:text-slate-200",
            )}
          >
            {task.title}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            {dueDated && (
              <span
                className={cn(
                  "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs",
                  urgency === "future"
                    ? "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                    : "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400",
                )}
              >
                <Calendar className="h-3 w-3" aria-hidden="true" />
                {dueDated.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            )}
            {task.repeat !== "none" && (
              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs text-violet-600 dark:bg-violet-950/40 dark:text-violet-300">
                {task.repeat}
              </span>
            )}
            {subject && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {subject.name}
              </span>
            )}
            {subtasks.length > 0 && (
              <span className="text-xs text-slate-400">
                {doneSubtasks}/{subtasks.length} subtasks
              </span>
            )}
          </div>
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => void mutations.updateTask(task.id, { myDay: !task.myDay })}
            aria-label={task.myDay ? "Remove from My Day" : "Add to My Day"}
            aria-pressed={task.myDay}
            className={cn(
              "sf-focus inline-flex h-8 w-8 items-center justify-center rounded-md transition-opacity hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300",
              task.myDay ? "opacity-100 text-amber-500" : "text-slate-500 opacity-0 group-hover:opacity-100",
            )}
          >
            <Sun className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => void mutations.updateTask(task.id, { important: !task.important })}
            aria-label={task.important ? "Unmark important" : "Mark important"}
            aria-pressed={task.important}
            className={cn(
              "sf-focus inline-flex h-8 w-8 items-center justify-center rounded-md transition-opacity hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300",
              task.important ? "opacity-100 text-violet-500" : "text-slate-500 opacity-0 group-hover:opacity-100",
            )}
          >
            <Star className="h-4 w-4" fill={task.important ? "currentColor" : "none"} aria-hidden="true" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={`Task menu for "${task.title}"`}
                className="sf-focus inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 opacity-0 transition-opacity hover:bg-slate-100 hover:text-slate-600 group-hover:opacity-100 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              >
                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>Edit</DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  void mutations.deleteTask(task.id);
                  toast.success("Task deleted");
                }}
                className="text-red-600 focus:text-red-600"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

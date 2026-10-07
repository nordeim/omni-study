"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDataStore, type Subject } from "@/lib/data";

// Shared view primitives: page headers, empty states, subject helpers.

export function ViewHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
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
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl px-6 py-12 text-center">
      <div className="mb-1 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800/60">
        <Icon className="h-7 w-7 text-slate-300 dark:text-slate-600" strokeWidth={1.5} />
      </div>
      <p className="text-[15px] font-semibold text-slate-700 dark:text-slate-200">{title}</p>
      {hint && <p className="max-w-sm text-sm text-slate-400">{hint}</p>}
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
      className="inline-flex h-8 items-center gap-0 rounded-md px-3 text-xs font-medium transition-colors text-sf-primary-strong hover:opacity-80 sf-focus"
    >
      {label}
      <span aria-hidden="true" className="ml-1">→</span>
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
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-1.5 text-[30px] font-bold leading-none tracking-tight text-slate-800 dark:text-slate-100">
            {value}
          </p>
          <p className="mt-1.5 text-xs text-slate-400">{hint}</p>
        </div>
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white"
          style={{
            backgroundImage: gradient,
            boxShadow: `0 10px 15px -3px ${colors.shadow}`,
          }}
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
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

/** Simple section empty state — measured: p-8 text-center + w-12 icon. */
export function SimpleEmptyState({
  icon: Icon,
  message,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  message: string;
}) {
  return (
    <div className="p-8 text-center text-slate-500">
      <Icon className="mx-auto mb-3 h-12 w-12 text-slate-300 dark:text-slate-600" strokeWidth={2} />
      <p>{message}</p>
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
}: {
  title: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900",
        className,
      )}
    >
      <header className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
          <Icon className="h-5 w-5 text-sf-primary" strokeWidth={2} />
          {title}
        </h3>
        {action}
      </header>
      <div className={cn("p-6", bodyClassName)}>{children}</div>
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

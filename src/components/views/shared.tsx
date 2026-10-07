"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDataStore, type Subject } from "@/lib/data";

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
      className="inline-flex h-8 items-center gap-0 rounded-md px-3 text-xs font-medium transition-colors text-sf-primary-strong hover:opacity-80 sf-focus"
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
        {/* Reference (measured): dashboard card titles are <h2> 18px/600
            with a 20px icon — the h3 level belongs to stat values (S4-J). */}
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
          <Icon className="h-5 w-5 text-sf-primary" strokeWidth={2} />
          {title}
        </h2>
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

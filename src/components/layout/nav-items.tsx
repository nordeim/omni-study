"use client";

import * as React from "react";
import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  Calculator,
  Calendar,
  CalendarDays,
  FileQuestion,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  Layers,
  Settings as SettingsIcon,
  Sparkles,
  SquareCheckBig,
  Sun,
  Timer,
  TrendingUp,
  Users,
} from "lucide-react";
import { NAV, useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { ViewId } from "@/lib/router";
import { NAV_ACTIVE_GRADIENT_STOPS } from "@/lib/theme";

// Shared nav primitives — the desktop sidebar and the mobile drawer render
// IDENTICAL nav items (measured on the reference: a 20px icon + label on
// px-4 py-3 rounded-xl, active state = accent gradient tint + strong text
// + a 6px trailing dot). Extracted in session 3 so the drawer mirrors the
// sidebar by construction instead of by copy-paste.

export const NAV_ICONS: Record<
  ViewId,
  React.ComponentType<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }>
> = {
  // S8-A (live-measured on the reference): Calendar and Timetable share the
  // bare `calendar` glyph, Events uses `calendar-days`, Notes reuses
  // `book-open` (like Assignments), Files is `folder-open`, Math Solver
  // reuses `calculator`, Tasks is `square-check-big`, Analytics is
  // `chart-column` (BarChart3's current lucide name — renders identical).
  dashboard: LayoutDashboard,
  myday: Sun,
  tasks: SquareCheckBig,
  calendar: Calendar,
  events: CalendarDays,
  timetable: Calendar,
  assignments: BookOpen,
  exams: GraduationCap,
  notes: BookOpen,
  flashcards: Layers,
  practicetests: FileQuestion,
  studygroups: Users,
  gradetracker: TrendingUp,
  analytics: BarChart3,
  files: FolderOpen,
  calculator: Calculator,
  mathsolver: Calculator,
  aiassistant: Sparkles,
  focustimer: Timer,
  settings: SettingsIcon,
};

export function NavItemLink({ id, collapsed = false }: { id: ViewId; collapsed?: boolean }) {
  const item = NAV.find((n) => n.id === id)!;
  const navigate = useAppStore((s) => s.navigate);
  const view = useAppStore((s) => s.view);
  const Icon = NAV_ICONS[id];
  const active = view === id;
  return (
    <Link
      href={item.path}
      onClick={(e) => {
        e.preventDefault();
        navigate(id);
      }}
      aria-current={active ? "page" : undefined}
      title={collapsed ? item.label : undefined}
      className="group block cursor-pointer"
    >
      <span
        className={cn(
          "flex items-center rounded-xl px-4 py-3 transition-all duration-200",
          collapsed && "justify-center px-0",
          active ? "font-medium" : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/60",
        )}
        style={
          active
            ? {
                // S8-A (measured): the reference's active tint runs
                // primary → indigo-500 (avatarTo) at 10% — pinned by
                // NAV_ACTIVE_GRADIENT_STOPS + the S8 e2e spec.
                backgroundImage: `linear-gradient(to right, rgb(var(--sf-primary) / ${NAV_ACTIVE_GRADIENT_STOPS.alpha}), rgb(var(--sf-primary-${NAV_ACTIVE_GRADIENT_STOPS.toCssVar}) / ${NAV_ACTIVE_GRADIENT_STOPS.alpha}))`,
                color: "rgb(var(--sf-primary-strong))",
              }
            : undefined
        }
      >
        <Icon
          className={cn(
            "h-5 w-5 shrink-0 transition-colors",
            !active && "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200",
          )}
          strokeWidth={2}
          style={active ? { color: "rgb(var(--sf-primary))" } : undefined}
        />
        {!collapsed && <span className="ml-3 truncate">{item.label}</span>}
        {!collapsed && active && (
          <span
            className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: "rgb(var(--sf-primary))" }}
            aria-hidden="true"
          />
        )}
      </span>
    </Link>
  );
}

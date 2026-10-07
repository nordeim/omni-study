"use client";

import * as React from "react";
import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  Calendar,
  CalendarDays,
  CalendarPlus,
  Calculator,
  FileQuestion,
  Folder,
  GraduationCap,
  LayoutDashboard,
  Layers,
  Notebook,
  Settings as SettingsIcon,
  Sparkles,
  SquareRadical,
  Sun,
  Timer,
  TrendingUp,
  Users,
  ListChecks,
} from "lucide-react";
import { NAV, useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { ViewId } from "@/lib/router";

// Shared nav primitives — the desktop sidebar and the mobile drawer render
// IDENTICAL nav items (measured on the reference: a 20px icon + label on
// px-4 py-3 rounded-xl, active state = accent gradient tint + strong text
// + a 6px trailing dot). Extracted in session 3 so the drawer mirrors the
// sidebar by construction instead of by copy-paste.

export const NAV_ICONS: Record<
  ViewId,
  React.ComponentType<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }>
> = {
  dashboard: LayoutDashboard,
  myday: Sun,
  tasks: ListChecks,
  calendar: CalendarDays,
  events: CalendarPlus,
  timetable: Calendar,
  assignments: BookOpen,
  exams: GraduationCap,
  notes: Notebook,
  flashcards: Layers,
  practicetests: FileQuestion,
  studygroups: Users,
  gradetracker: TrendingUp,
  analytics: BarChart3,
  files: Folder,
  calculator: Calculator,
  mathsolver: SquareRadical,
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
                backgroundImage:
                  "linear-gradient(to right, rgb(var(--sf-primary) / 0.1), rgb(var(--sf-primary-strong) / 0.1))",
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

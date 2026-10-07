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
  PanelLeftClose,
  PanelLeftOpen,
  Settings as SettingsIcon,
  Sparkles,
  SquareRadical,
  Sun,
  Timer,
  TrendingUp,
  Users,
  ListChecks,
} from "lucide-react";
import { NAV, useAppStore, useThemeStore } from "@/lib/store";
import { formatShortWithYear, formatTime12h } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { ViewId } from "@/lib/router";

const ICONS: Record<ViewId, React.ComponentType<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }>> = {
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

function SidebarClock() {
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000 * 20);
    return () => clearInterval(id);
  }, []);
  return (
    <div
      className="mb-3 rounded-xl p-3"
      style={{
        backgroundImage: "linear-gradient(to bottom right, rgb(var(--sf-primary-soft)), rgb(var(--sf-primary-soft)))",
      }}
    >
      <p
        className="text-2xl font-bold leading-tight"
        style={{ color: "rgb(var(--sf-primary-strong))" }}
      >
        {formatTime12h(now)}
      </p>
      <p className="text-sm font-medium" style={{ color: "rgb(var(--sf-primary))" }}>
        {formatShortWithYear(now)}
      </p>
    </div>
  );
}

export function Sidebar() {
  const view = useAppStore((s) => s.view);
  const navigate = useAppStore((s) => s.navigate);
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const avatar = useThemeStore((s) => s.avatar);
  const userName = useThemeStore((s) => s.userName);
  const email = useThemeStore((s) => s.email);

  return (
    <aside
      className={cn(
        "glass hidden lg:flex fixed left-0 top-0 z-40 h-screen flex-col shadow-xl shadow-slate-200/50 transition-all duration-300 dark:shadow-black/30",
        collapsed ? "w-[76px]" : "w-[260px]",
      )}
    >
      {/* Brand header */}
      <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-lg"
            style={{
              backgroundImage: "linear-gradient(to bottom right, rgb(var(--sf-primary)), rgb(var(--sf-primary-strong)))",
              boxShadow: "0 10px 15px -3px rgb(var(--sf-primary) / 0.3)",
            }}
            aria-hidden="true"
          >
            <GraduationCap className="h-5 w-5" strokeWidth={1.75} />
          </span>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold text-slate-800 dark:text-slate-100">StudyFlow</h1>
              <p className="truncate text-xs text-slate-400">Your study companion</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Collapse sidebar"
            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 sf-focus dark:hover:bg-slate-800"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>
      {collapsed && (
        <div className="flex justify-center py-2">
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Expand sidebar"
            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 sf-focus dark:hover:bg-slate-800"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav aria-label="Primary" className="sf-scroll flex-1 overflow-y-auto p-4">
        <ul className="flex flex-col gap-1">
          {NAV.map((item) => {
            const Icon = ICONS[item.id];
            const active = view === item.id;
            return (
              <li key={item.id}>
                <Link
                  href={item.path}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(item.id);
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
                      className={cn("h-5 w-5 shrink-0 transition-colors", !active && "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200")}
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
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer: clock + user */}
      <div className="border-t border-slate-100 p-4 dark:border-slate-800">
        {!collapsed && <SidebarClock />}
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl shadow-sm"
            style={{ backgroundColor: "rgb(var(--sf-primary-soft))" }}
            aria-hidden="true"
          >
            {avatar}
          </span>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                {userName || "Student"}
              </p>
              <p className="truncate text-xs text-slate-400">{email}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

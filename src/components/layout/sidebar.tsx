"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, GraduationCap } from "lucide-react";
import { NAV, useAppStore, useThemeStore } from "@/lib/store";
import { formatShortWithYear, formatTime12h } from "@/lib/date";
import { cn } from "@/lib/utils";
import { NavItemLink } from "./nav-items";
import { UserAvatar } from "./user-avatar";

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
        // Reference (measured): bg-gradient-to-br from-violet-50 to-indigo-50
        // = linear-gradient(to right bottom, rgb(245,243,255), rgb(238,242,255)).
        // The second stop is a FIXED adjacent-hue tint (indigo-50) — a hue
        // rotation that cannot be approximated by mixing toward white —
        // so it lives in its own --sf-primary-softest-adjacent token
        // (accent-aware: each accent maps to its adjacent hue's 50-level).
        backgroundImage:
          "linear-gradient(to bottom right, rgb(var(--sf-primary-softest)), rgb(var(--sf-primary-softest-adjacent)))",
      }}
    >
      <p
        className="text-2xl font-bold leading-tight"
        style={{ color: "rgb(var(--sf-primary-deep))" }}
      >
        {formatTime12h(now)}
      </p>
      <p className="text-sm font-medium" style={{ color: "rgb(var(--sf-primary-strong))" }}>
        {formatShortWithYear(now)}
      </p>
    </div>
  );
}

export function Sidebar() {
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
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
              backgroundImage: "linear-gradient(to bottom right, rgb(var(--sf-primary)), rgb(var(--sf-primary-gradient-to)))",
              boxShadow: "0 10px 15px -3px rgb(var(--sf-primary) / 0.3)",
            }}
            aria-hidden="true"
          >
            <GraduationCap className="h-5 w-5" strokeWidth={2} />
          </span>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold text-slate-800 dark:text-slate-100">StudyFlow</h1>
              {/* S8-A: the reference's tagline never truncates (measured
                  text-overflow: clip / overflow: visible) — only the brand
                  h1 keeps the truncate guard. */}
              <p className="text-xs text-slate-400">Your study companion</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Collapse sidebar"
            className="sf-focus flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            {/* Reference (measured): a bare h-9 w-9 rounded-lg ghost with a
                chevron-left glyph (icon renders 16px via the shadcn
                [&_svg]:size-4 override). */}
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>
      {collapsed && (
        <div className="flex justify-center py-2">
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Expand sidebar"
            className="sf-focus flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav aria-label="Primary" className="sf-scroll flex-1 overflow-y-auto p-4">
        <ul className="flex flex-col gap-1">
          {NAV.map((item) => (
            <li key={item.id}>
              <NavItemLink id={item.id} collapsed={collapsed} />
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer: clock + user */}
      <div className="border-t border-slate-100 p-4 dark:border-slate-800">
        {!collapsed && <SidebarClock />}
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <UserAvatar size="sm" />
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

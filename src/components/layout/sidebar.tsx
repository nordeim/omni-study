"use client";

import * as React from "react";
import { ChevronLeft, GraduationCap } from "lucide-react";
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
    // S10-5 — the chip's gradient + text colors live in the .sf-clock-chip /
    // .sf-clock-time / .sf-clock-date classes (globals.css): the light values
    // are the measured S3-B/S3-C pins (softest → softest-adjacent stops; deep
    // time text) and .dark swaps in the soft-dark washes + violet-300 text —
    // inline styles cannot re-theme.
    <div className="sf-clock-chip mb-3 rounded-xl p-3">
      <p className="sf-clock-time text-2xl font-bold leading-tight">
        {formatTime12h(now)}
      </p>
      <p className="sf-clock-date text-sm font-medium">{formatShortWithYear(now)}</p>
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
        // S52 — the reference's collapsed rail measures w-20 (80px, live
        // 2026-10-14); the session-8-era 76px corrected.
        collapsed ? "w-20" : "w-[260px]",
      )}
    >
      {/* Brand header — S52: the toggle button lives in the header row in
          BOTH states (the reference's collapsed header renders ONLY the
          chevron — the brand block is unmounted, the button sits left); no
          separate expand row below the header. */}
      <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
        {!collapsed && (
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
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold text-slate-800 dark:text-slate-100">StudyFlow</h1>
              {/* S8-A: the reference's tagline never truncates (measured
                  text-overflow: clip / overflow: visible) — only the brand
                  h1 keeps the truncate guard. */}
              <p className="text-xs text-slate-400">Your study companion</p>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="sf-focus flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          {/* Reference (measured): a bare h-9 w-9 rounded-lg ghost with a
              chevron-left glyph (icon renders 16px via the shadcn
              [&_svg]:size-4 override). S52: the SAME glyph rotates 180°
              when collapsed (chevron-left rotate-180 points right =
              expand — the reference's exact glyph behavior). */}
          <ChevronLeft
            className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")}
          />
        </button>
      </div>

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

      {/* Footer: clock + user — S52: the reference's collapsed footer is
          COMPLETELY empty (<div class="mt-auto"></div> — the clock AND the
          user row are unmounted); the content renders only when expanded. */}
      {collapsed ? (
        <div className="mt-auto" />
      ) : (
        <div className="border-t border-slate-100 p-4 dark:border-slate-800">
          <SidebarClock />
          <div className="flex items-center gap-3">
            <UserAvatar size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                {userName || "Student"}
              </p>
              <p className="truncate text-xs text-slate-400">{email}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { GraduationCap, Menu, X } from "lucide-react";
import { NAV, useAppStore, useThemeStore } from "@/lib/store";
import { formatShortWithYear, formatTime12h } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { ViewId } from "@/lib/router";

// Mobile chrome: full-width app bar with hamburger + brand, and the slide-in
// drawer with every nav item (measured live at 390×844 — the drawer carries
// the brand header, a close button, then all 20 links).

function MobileHeader() {
  const setMobileMenu = useAppStore((s) => s.setMobileMenu);
  const view = useAppStore((s) => s.view);
  const current = NAV.find((n) => n.id === view);
  return (
    <header
      className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-slate-200/70 bg-white/85 px-4 backdrop-blur-xl lg:hidden dark:border-slate-800 dark:bg-slate-950/85"
      role="banner"
    >
      <button
        type="button"
        onClick={() => setMobileMenu(true)}
        aria-label="Open navigation menu"
        className="-ml-1.5 rounded-lg p-2 text-slate-600 hover:bg-slate-100 sf-focus dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <Menu className="h-5 w-5" />
      </button>
      <span
        className="flex h-8 w-8 items-center justify-center rounded-lg text-white shadow-sm"
        style={{ backgroundColor: "rgb(var(--sf-primary))" }}
        aria-hidden="true"
      >
        <GraduationCap className="h-4 w-4" strokeWidth={1.75} />
      </span>
      <p className="truncate text-[15px] font-bold text-slate-900 dark:text-slate-50">
        {current?.label ?? "StudyFlow"}
      </p>
    </header>
  );
}

function MobileDrawer() {
  const open = useAppStore((s) => s.mobileMenuOpen);
  const setMobileMenu = useAppStore((s) => s.setMobileMenu);
  const navigate = useAppStore((s) => s.navigate);
  const view = useAppStore((s) => s.view);
  const avatar = useThemeStore((s) => s.avatar);
  const userName = useThemeStore((s) => s.userName);
  const email = useThemeStore((s) => s.email);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenu(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setMobileMenu]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      className="fixed inset-0 z-50 lg:hidden"
    >
      <button
        type="button"
        aria-label="Close navigation menu"
        className="absolute inset-0 bg-black/45"
        onClick={() => setMobileMenu(false)}
      />
      <div className="sf-toast-in absolute inset-y-0 left-0 flex w-[290px] max-w-[85vw] flex-col border-r border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm"
              style={{ backgroundColor: "rgb(var(--sf-primary))" }}
              aria-hidden="true"
            >
              <GraduationCap className="h-4.5 w-4.5 h-[18px] w-[18px]" strokeWidth={1.75} />
            </span>
            <div>
              <p className="text-[15px] font-bold text-slate-900 dark:text-slate-50">StudyFlow</p>
              <p className="text-[11px] text-slate-400">Your study companion</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenu(false)}
            aria-label="Close menu"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 sf-focus dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav aria-label="Primary" className="sf-scroll flex-1 overflow-y-auto px-3 py-3">
          <ul className="flex flex-col gap-1">
            {NAV.map((item) => {
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
                    className={cn(
                      "flex items-center rounded-lg px-3 py-3 text-[15px] font-medium transition-colors sf-focus",
                      active
                        ? "text-slate-900 dark:text-white"
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60",
                    )}
                    style={
                      active
                        ? {
                            backgroundColor: "rgb(var(--sf-primary-soft))",
                            color: "rgb(var(--sf-primary-strong))",
                          }
                        : undefined
                    }
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-slate-100 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full text-lg shadow-sm"
              style={{ backgroundColor: "rgb(var(--sf-primary-soft))" }}
              aria-hidden="true"
            >
              {avatar}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                {userName || "Student"}
              </p>
              <p className="truncate text-xs text-slate-400">{email}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            {formatTime12h(new Date())} · {formatShortWithYear(new Date())}
          </p>
        </div>
      </div>
    </div>
  );
}

export function MobileChrome() {
  return (
    <>
      <MobileHeader />
      <MobileDrawer />
    </>
  );
}

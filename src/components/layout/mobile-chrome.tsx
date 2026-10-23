"use client";

import * as React from "react";
import { GraduationCap, Menu, X } from "lucide-react";
import { NAV, useAppStore } from "@/lib/store";
import { formatTime12h } from "@/lib/date";
import { NavItemLink } from "./nav-items";

// Mobile chrome — measured live on the reference at 390×844 (session 3):
//
// App bar:  lg:hidden fixed top-0 left-0 right-0 h-16 glass z-40 …
//           justify-between px-4 shadow-sm. LEFT: hamburger (36px, 16px
//           glyph) + 32px gradient brand chip + "StudyFlow" (16px/700).
//           RIGHT: a live clock ("03:45 AM", text-sm/500 slate-600).
//           Because the bar is FIXED (out of flow), main offsets with
//           pt-16 (64px) — content starts at 80px (64 + the content's own
//           16px padding). The brand + clock NEVER change with the view.
//
// Drawer:   fixed inset-0 z-50 backdrop (bg-black/20 + backdrop-blur-xs)
//           + a 288px (w-72) white panel, shadow-2xl, no right border.
//           Brand header p-6 (40px gradient chip) + nav items IDENTICAL
//           to the desktop sidebar (icon + label + trailing dot). The
//           reference drawer has NO footer.

function HeaderClock() {
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(id);
  }, []);
  return <div className="text-sm font-medium text-slate-600 dark:text-slate-300">{formatTime12h(now)}</div>;
}

function MobileHeader() {
  const setMobileMenu = useAppStore((s) => s.setMobileMenu);
  const menuOpen = useAppStore((s) => s.mobileMenuOpen);
  // S91 — the hamburger reports its control state (the web-app-foundation
  // §8.1 drawer contract; the reference's own button carries no aria).
  return (
    <header
      className="glass fixed top-0 left-0 right-0 z-40 flex h-16 items-center justify-between px-4 shadow-sm lg:hidden dark:shadow-black/20"
      role="banner"
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setMobileMenu(true)}
          aria-label="Open navigation menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation-drawer"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-slate-100 sf-focus dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Menu className="h-4 w-4" strokeWidth={2} />
        </button>
        <div className="flex items-center gap-2">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white shadow-sm"
            style={{
              backgroundImage:
                "linear-gradient(to bottom right, rgb(var(--sf-primary)), rgb(var(--sf-primary-gradient-to)))",
            }}
            aria-hidden="true"
          >
            <GraduationCap className="h-4 w-4" strokeWidth={2} />
          </span>
          <span className="font-bold text-slate-800 dark:text-slate-100">StudyFlow</span>
        </div>
      </div>
      <HeaderClock />
    </header>
  );
}

function MobileDrawer() {
  const open = useAppStore((s) => s.mobileMenuOpen);
  const setMobileMenu = useAppStore((s) => s.setMobileMenu);
  // S52 — the drawer SHARES the sidebar's collapsed state (measured on the
  // reference: with sidebarOpen=false the drawer's 20 links render
  // ICON-ONLY in the same 288px panel — no labels, no trailing dot; the
  // labeled rendering is the default expanded state). The drawer header,
  // backdrop, and panel geometry are identical in both states.
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);

  // S91 — the modal drawer mechanics (the web-app-foundation §8.1
  // non-negotiables; every one a superset — the reference's drawer has no
  // aria/focus mechanics at all, measured S3–S52):
  //   - focus moves INTO the panel on open (the close button)
  //   - Tab (and Shift+Tab) cycle within the dialog — no escape into the
  //     page behind the overlay
  //   - the body is scroll-locked while open, released on close
  //   - focus is RESTORED to the hamburger on close
  // Pinned by tests/e2e/s91-drawer-focus-a11y.spec.ts. The DOM structure,
  // panel geometry, and every standing drawer pin are untouched.
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    // Focus the panel's close button once the drawer is mounted.
    closeButtonRef.current?.focus();
    // Scroll-lock the page under the overlay.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const isFocusable = (el: Element): el is HTMLElement =>
      el instanceof HTMLElement &&
      el.tabIndex >= 0 &&
      !el.hasAttribute("disabled") &&
      el.offsetParent !== null;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenu(false);
        return;
      }
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusables = [...panel.querySelectorAll("*")].filter(isFocusable);
      if (focusables.length === 0) return;
      const first = focusables[0]!;
      const last = focusables[focusables.length - 1]!;
      const active = document.activeElement;
      if (e.shiftKey) {
        if (active === first || !panel.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last || !panel.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      // Restore focus to the hamburger — the user's point of departure.
      const burger = document.querySelector<HTMLButtonElement>(
        'button[aria-label="Open navigation menu"]'
      );
      burger?.focus();
    };
  }, [open, setMobileMenu]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      id="mobile-navigation-drawer"
      className="fixed inset-0 z-50 lg:hidden"
    >
      <button
        type="button"
        aria-label="Close navigation menu"
        className="absolute inset-0 bg-black/20 backdrop-blur-xs"
        onClick={() => setMobileMenu(false)}
      />
      <div
        ref={panelRef}
        className="sf-toast-in absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-2xl dark:bg-slate-950"
      >
        <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-lg"
              style={{
                backgroundImage:
                  "linear-gradient(to bottom right, rgb(var(--sf-primary)), rgb(var(--sf-primary-gradient-to)))",
                boxShadow: "0 10px 15px -3px rgb(var(--sf-primary) / 0.3)",
              }}
              aria-hidden="true"
            >
              <GraduationCap className="h-5 w-5" strokeWidth={2} />
            </span>
            <div>
              <h1 className="font-bold text-slate-800 dark:text-slate-100">StudyFlow</h1>
              <p className="text-xs text-slate-400">Your study companion</p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => setMobileMenu(false)}
            aria-label="Close menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 sf-focus dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
        <nav aria-label="Primary" className="sf-scroll flex-1 overflow-y-auto p-4">
          <ul className="flex flex-col gap-1">
            {NAV.map((item) => (
              <li key={item.id}>
                <NavItemLink id={item.id} collapsed={sidebarCollapsed} />
              </li>
            ))}
          </ul>
        </nav>
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

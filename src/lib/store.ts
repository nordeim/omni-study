"use client";

import { create } from "zustand";
import { NAV_ITEMS, pathForView, viewFromPath, type ViewId } from "@/lib/router";
import {
  ACCENT_TOKENS,
  accentCssVars,
  resolveMode,
  THEME_CACHE_KEY,
  themeCachePayload,
  type Accent,
  type ThemeMode,
} from "@/lib/theme";

// ---------------------------------------------------------------------------
// App store — view routing (synced with location.pathname), sidebar collapse,
// mobile drawer. One store, small surface, no persistence (URL is the truth
// for the view; localStorage holds the sidebar preference).
// ---------------------------------------------------------------------------

interface AppState {
  view: ViewId;
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;
  hydrated: boolean;
  navigate: (view: ViewId) => void;
  syncFromPath: (pathname: string) => void;
  toggleSidebar: () => void;
  setMobileMenu: (open: boolean) => void;
  hydrate: () => void;
}

const SIDEBAR_PREF_KEY = "sf-sidebar-collapsed";

export const useAppStore = create<AppState>((set, get) => ({
  view: "dashboard",
  sidebarCollapsed: false,
  mobileMenuOpen: false,
  hydrated: false,
  navigate: (view) => {
    const path = pathForView(view);
    if (typeof window !== "undefined" && window.location.pathname !== path) {
      window.history.pushState({}, "", path);
    }
    set({ view, mobileMenuOpen: false });
  },
  syncFromPath: (pathname) => {
    const view = viewFromPath(pathname);
    if (view !== get().view) set({ view });
  },
  toggleSidebar: () => {
    const next = !get().sidebarCollapsed;
    set({ sidebarCollapsed: next });
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(SIDEBAR_PREF_KEY, next ? "1" : "0");
      } catch {
        /* storage unavailable — preference simply not persisted */
      }
    }
  },
  setMobileMenu: (open) => set({ mobileMenuOpen: open }),
  hydrate: () => {
    if (get().hydrated) return;
    let collapsed = false;
    try {
      collapsed = window.localStorage.getItem(SIDEBAR_PREF_KEY) === "1";
    } catch {
      /* ignore */
    }
    set({
      view: viewFromPath(window.location.pathname),
      sidebarCollapsed: collapsed,
      hydrated: true,
    });
  },
}));

// ---------------------------------------------------------------------------
// Theme store — mode (light/dark/system) + accent, applied to <html> as
// RGB-triplet CSS variables (the reference app's own convention).
// ---------------------------------------------------------------------------

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  avatarEmoji: string;
  themeMode: ThemeMode;
  accentColor: Accent;
}

interface ThemeState {
  mode: ThemeMode;
  accent: Accent;
  avatar: string;
  userName: string;
  email: string;
  /** S17-A: the reference's study-profile fields (Settings → Profile) +
   * the account-creation line. They ride the theme store's user slice so
   * the Profile tab renders them without a second fetch. */
  schoolName: string;
  gradeLevel: string;
  studyGoalHours: number;
  notificationsEnabled: boolean;
  accountCreatedAt: string;
  applied: boolean;
  setTheme: (mode: ThemeMode, accent?: Accent) => void;
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: Accent) => void;
  setAvatar: (emoji: string) => void;
  loadFromUser: (user: {
    themeMode?: string;
    accentColor?: string;
    avatarEmoji?: string;
    name?: string;
    email?: string;
    schoolName?: string;
    gradeLevel?: string;
    studyGoalHours?: number;
    notificationsEnabled?: boolean;
    createdAt?: string;
  }) => void;
  apply: () => void;
}

/** S11-1 — keep a plain (non-media) theme-color meta in sync with the
 *  EFFECTIVE mode. Next's viewport export emits two prefers-color-scheme
 *  metas; a user who explicitly picks Dark on a light OS would otherwise
 *  keep a white mobile browser chrome. The plain meta is appended AFTER the
 *  media-qualified ones — Chromium uses the LAST matching one. */
function ensureThemeColorMeta(effective: "light" | "dark") {
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]:not([media])');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.appendChild(meta);
  }
  meta.content = effective === "dark" ? "#020617" : "#ffffff";
}

function applyToDocument(mode: ThemeMode, accent: Accent) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const effective = resolveMode(mode, window.matchMedia("(prefers-color-scheme: dark)").matches);
  root.classList.toggle("dark", effective === "dark");
  root.dataset.accent = accent;
  // The COMPLETE token set — a previous version wrote only six of the nine
  // vars, so deep/softest (and now softest-adjacent) kept the violet :root
  // defaults under every non-violet accent (clock text/chip stayed violet).
  // accentCssVars is the single source of truth; keep it that way.
  for (const [k, v] of Object.entries(accentCssVars(accent))) {
    root.style.setProperty(k, v);
  }
  // S11-1 — persist for the pre-paint boot script (layout.tsx <head>): a
  // dark user must not see a light flash while /api/auth/me resolves, and
  // the login route needs a theme source before any user is known. The
  // payload format is unit-pinned (tests/theme-cache.test.ts).
  try {
    window.localStorage.setItem(THEME_CACHE_KEY, themeCachePayload(mode, accent));
  } catch {
    /* storage unavailable — the boot script falls back to the OS preference */
  }
  ensureThemeColorMeta(effective);
}

// S11-1 — System mode must track OS theme changes AT RUNTIME (measured: the
// app used to stay stale until a manual reload). Registered once, client-side
// only; re-applies only when the stored mode is "system" (explicit light/dark
// choices are user intent and must NOT follow the OS). The reference's own
// System option is the measured platform no-op — dynamic tracking is superset.
let systemThemeTrackingInstalled = false;
function installSystemThemeTracking() {
  if (systemThemeTrackingInstalled || typeof window === "undefined") return;
  systemThemeTrackingInstalled = true;
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const onChange = () => {
    const { mode, accent } = useThemeStore.getState();
    if (mode === "system") applyToDocument(mode, accent);
  };
  if (typeof mq.addEventListener === "function") {
    mq.addEventListener("change", onChange);
  } else {
    // Legacy Safari (< 14) fallback.
    const legacy = mq as MediaQueryListLegacy;
    legacy.addListener?.(onChange);
  }
}
type MediaQueryListLegacy = {
  addListener?: (listener: (e: MediaQueryListEvent) => void) => void;
  removeListener?: (listener: (e: MediaQueryListEvent) => void) => void;
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: "system",
  accent: "violet",
  // Empty avatar = the reference's default state: the UserAvatar component
  // renders the user's initial in a gradient circle until an emoji is chosen
  // in Settings (session-2 remediation R3).
  avatar: "",
  userName: "",
  email: "",
  // S17-A defaults mirror the schema's defaults (the reference's own:
  // empty school/grade, a 4h goal, notifications on).
  schoolName: "",
  gradeLevel: "",
  studyGoalHours: 4,
  notificationsEnabled: true,
  accountCreatedAt: "",
  applied: false,
  setTheme: (mode, accent) => {
    set({ mode, accent: accent ?? get().accent });
    applyToDocument(get().mode, get().accent);
  },
  setMode: (mode) => {
    set({ mode });
    applyToDocument(mode, get().accent);
  },
  setAccent: (accent) => {
    set({ accent });
    applyToDocument(get().mode, accent);
  },
  setAvatar: (avatar) => set({ avatar }),
  loadFromUser: (user) => {
    const mode = user.themeMode === "light" || user.themeMode === "dark" ? user.themeMode : user.themeMode === "system" ? "system" : get().mode;
    const accent = (user.accentColor && user.accentColor in ACCENT_TOKENS ? user.accentColor : get().accent) as Accent;
    set({
      mode,
      accent,
      avatar: user.avatarEmoji || "",
      userName: user.name || "",
      email: user.email || "",
      schoolName: user.schoolName ?? "",
      gradeLevel: user.gradeLevel ?? "",
      studyGoalHours: typeof user.studyGoalHours === "number" ? user.studyGoalHours : 4,
      notificationsEnabled: user.notificationsEnabled ?? true,
      accountCreatedAt: user.createdAt ?? "",
      applied: true,
    });
    applyToDocument(mode, accent);
  },
  apply: () => {
    applyToDocument(get().mode, get().accent);
    set({ applied: true });
  },
}));

/** Nav items for the sidebar/drawer (stable reference). */
export const NAV = NAV_ITEMS;

// S11-1 — install the System-mode runtime tracking once, on first client
// import of this module (page.tsx, settings, and every view import the
// store). Idempotent; no-op on the server.
installSystemThemeTracking();

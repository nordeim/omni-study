"use client";

import { create } from "zustand";
import { NAV_ITEMS, pathForView, viewFromPath, type ViewId } from "@/lib/router";
import { ACCENT_TOKENS, resolveMode, type Accent, type ThemeMode } from "@/lib/theme";

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
  }) => void;
  apply: () => void;
}

function applyToDocument(mode: ThemeMode, accent: Accent) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const effective = resolveMode(mode, window.matchMedia("(prefers-color-scheme: dark)").matches);
  root.classList.toggle("dark", effective === "dark");
  root.dataset.accent = accent;
  const tokens = ACCENT_TOKENS[accent];
  for (const [k, v] of Object.entries({
    "--sf-primary": tokens.primary,
    "--sf-primary-foreground": tokens.primaryFg,
    "--sf-primary-soft": tokens.soft,
    "--sf-primary-soft-dark": tokens.softDark,
    "--sf-primary-strong": tokens.strong,
    "--sf-primary-strong-dark": tokens.strongDark,
  })) {
    root.style.setProperty(k, v);
  }
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: "system",
  accent: "violet",
  // Empty avatar = the reference's default state: the UserAvatar component
  // renders the user's initial in a gradient circle until an emoji is chosen
  // in Settings (session-2 remediation R3).
  avatar: "",
  userName: "",
  email: "",
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

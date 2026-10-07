"use client";

import type { Accent, ThemeMode } from "@/lib/theme";

/** The /api/auth/me response shape (shared by the app shell and login). */
export interface PublicUserShape {
  id: string;
  email: string;
  name: string;
  avatarEmoji: string;
  themeMode: ThemeMode;
  accentColor: Accent;
}

export type { PublicUserShape as MeUser };

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
  /** S17-A: the reference's study-profile fields ride the user record. */
  schoolName?: string;
  gradeLevel?: string;
  studyGoalHours?: number;
  notificationsEnabled?: boolean;
  createdAt?: string;
}

export type { PublicUserShape as MeUser };

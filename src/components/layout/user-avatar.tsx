"use client";

import * as React from "react";
import { useThemeStore } from "@/lib/store";
import { cn } from "@/lib/utils";

/**
 * UserAvatar — the sidebar/drawer footer avatar, matched to the reference's
 * measured default state: a 36px (w-9 h-9) gradient circle (reference:
 * from-violet-400 to-indigo-500) showing the user's INITIAL in white when no
 * emoji avatar is set, or the chosen emoji otherwise. The gradient routes
 * through the accent tokens (rgb(var(--sf-primary)) → rgb(var(--sf-primary-strong)))
 * so it re-themes with the Settings accent picker — the reference's own
 * behavior for its 7 accents.
 *
 * Session-2 remediation R3 (docs/remediation-plan.md): previously a 40px flat
 * primary-soft circle that always rendered the default "🎓" emoji even when
 * the user record had none.
 */

function initialFor(name: string, email: string): string {
  const source = (name || email || "").trim();
  const match = source.match(/[a-zA-Z]/); // first latin letter, any position
  return (match ? match[0] : "?").toUpperCase();
}

const SIZES = {
  sm: "h-9 w-9 text-sm font-semibold", // sidebar + drawer footer (36px, reference-measured)
  lg: "h-14 w-14 rounded-2xl text-3xl", // Settings profile preview tile
} as const;

export function UserAvatar({ size = "sm" }: { size?: keyof typeof SIZES }) {
  const avatar = useThemeStore((s) => s.avatar);
  const userName = useThemeStore((s) => s.userName);
  const email = useThemeStore((s) => s.email);
  const content = avatar || initialFor(userName, email);

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full text-white shadow-sm",
        SIZES[size],
      )}
      style={{
        backgroundImage:
          "linear-gradient(to bottom right, rgb(var(--sf-primary)), rgb(var(--sf-primary-strong)))",
      }}
      aria-hidden="true"
    >
      {content}
    </span>
  );
}

"use client";

import * as React from "react";
import { create } from "zustand";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Toast — a minimal zustand-backed toaster (no external dep). Fixed top-right
// stack, auto-dismiss, three severities, close buttons, aria-live region.
// ---------------------------------------------------------------------------

type ToastKind = "success" | "error" | "info";

export interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastState {
  toasts: ToastItem[];
  push: (kind: ToastKind, message: string) => void;
  dismiss: (id: number) => void;
}

let nextId = 1;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  push: (kind, message) => {
    const id = nextId++;
    set((s) => ({ toasts: [...s.toasts, { id, kind, message }].slice(-4) }));
    setTimeout(() => get().dismiss(id), kind === "error" ? 6000 : 3500);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (message: string) => useToastStore.getState().push("success", message),
  error: (message: string) => useToastStore.getState().push("error", message),
  info: (message: string) => useToastStore.getState().push("info", message),
};

const KIND_STYLES: Record<ToastKind, { icon: React.ReactNode; classes: string }> = {
  success: {
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
    classes: "border-emerald-200 dark:border-emerald-900",
  },
  error: {
    icon: <AlertCircle className="h-4 w-4 text-red-500" />,
    classes: "border-red-200 dark:border-red-900",
  },
  info: {
    icon: <Info className="h-4 w-4 text-sky-500" />,
    classes: "border-sky-200 dark:border-sky-900",
  },
};

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);
  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-[calc(100vw-2rem)] max-w-sm"
    >
      {toasts.map((t) => {
        const style = KIND_STYLES[t.kind];
        return (
          <div
            key={t.id}
            role="status"
            className={cn(
              "sf-toast-in flex items-start gap-3 rounded-xl border bg-card p-4 shadow-lg text-sm",
              style.classes,
            )}
          >
            <span className="mt-0.5 shrink-0">{style.icon}</span>
            <p className="flex-1 leading-relaxed text-foreground">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="rounded-md p-1 text-muted-foreground hover:text-foreground sf-focus"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

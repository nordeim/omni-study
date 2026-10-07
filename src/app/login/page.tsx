"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { apiSend, ApiError } from "@/lib/api";
import type { PublicUserShape } from "@/lib/app-context";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const { user } = await apiSend<{ user: PublicUserShape }>("POST", "/api/auth/login", {
        email,
        password,
      });
      toast.success(`Welcome back, ${user.name || user.email.split("@")[0]}!`);
      router.replace("/Dashboard");
      router.refresh();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Sign in failed. Please try again.";
      toast.error(message);
      setBusy(false);
    }
  }

  return (
    <div className="sf-canvas flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-[420px]">
        <div className="sf-card p-8 sm:p-10 shadow-lg">
          {/* Brand */}
          <div className="flex flex-col items-center text-center">
            <span
              className="mb-4 flex h-[76px] w-[76px] items-center justify-center rounded-2xl text-white shadow-md"
              style={{ backgroundColor: "rgb(var(--sf-primary))" }}
            >
              <GraduationCap className="h-10 w-10" strokeWidth={1.5} />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Welcome to StudyFlow
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">Sign in to continue</p>
          </div>

          {/* Google (visual parity with the reference; OAuth is not
              configured in this self-hosted clone — honest fallback). */}
          <button
            type="button"
            onClick={() =>
              toast.info(
                "Google sign-in isn't configured in this clone. Use email and password — try the demo account below.",
              )
            }
            className="mt-8 flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white text-[15px] font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 sf-focus dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 48 48">
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3" aria-hidden="true">
            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">or</span>
            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          </div>

          {/* Email/password */}
          <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="h-11 pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="h-11 pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 hover:text-slate-600 sf-focus"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={busy || !email || !password}
              className="h-11 w-full bg-slate-900 text-[15px] font-semibold hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
            >
              {busy ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          {/* Footer links */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-sm">
            <button
              type="button"
              onClick={() =>
                toast.info("Password reset isn't configured in this clone. Use the demo account.")
              }
              className="text-slate-500 hover:text-slate-700 sf-focus dark:text-slate-400 dark:hover:text-slate-200"
            >
              Forgot password?
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail("demo@studyflow.app");
                setPassword("Demo1234!");
                toast.info("Demo credentials filled in — press Sign in.");
              }}
              className="font-medium text-slate-600 hover:text-slate-900 sf-focus dark:text-slate-300 dark:hover:text-slate-100"
            >
              Need an account? <span className="underline">Sign up</span>
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Demo account: demo@studyflow.app · Demo1234!
        </p>
      </div>
    </div>
  );
}

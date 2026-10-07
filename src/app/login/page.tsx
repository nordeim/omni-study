"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { Input, Label } from "@/components/ui/input";
import { apiSend, ApiError } from "@/lib/api";
import type { PublicUserShape } from "@/lib/app-context";

// Login surface — rebuilt to the reference's measured spec (session 4, S4-F):
// a border-0 shadow-2xl bg-white/95 backdrop-blur rounded-2xl card (448px
// max-w-md) with a 1px slate gradient top strip; an 80px circular gradient
// logo with ring-4 ring-white/50 + blurred glow; text-2xl sm:text-3xl title;
// 48px/rounded-xl inputs (bg-slate-50/50, border-slate-200); a 54px
// rounded-xl Google button; and the h-[1px] divider with the "or" chip.
// The clone's superset behaviors stay: honest Google fallback toast,
// password reveal, and the demo-account helper.
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
      <div className="w-full max-w-md">
        <div className="relative overflow-hidden rounded-2xl border-0 bg-white/95 shadow-2xl backdrop-blur-xs dark:bg-slate-900/95">
          {/* Measured top strip: h-1 slate-200 → 300 → 200 gradient. */}
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700"
          />
          <div className="p-8 sm:p-10 md:px-10 md:pb-10 md:pt-12">
            {/* Brand — reference: 80px circle (sm:96px) + ring-4 ring-white/50
                + a blurred glow behind. */}
            <div className="flex flex-col items-center space-y-6 text-center sm:space-y-8">
              <div className="group relative">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 opacity-30 blur-xl transition-opacity duration-300 group-hover:opacity-40 dark:from-slate-700 dark:to-slate-600"
                />
                <span
                  className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full text-white shadow-lg ring-4 ring-white/50 transition-all duration-300 group-hover:shadow-xl sm:h-24 sm:w-24 dark:ring-slate-800/50"
                  style={{
                    backgroundImage:
                      "linear-gradient(to bottom right, rgb(var(--sf-primary)), rgb(var(--sf-primary-gradient-to)))",
                  }}
                >
                  <GraduationCap className="h-10 w-10" strokeWidth={2} />
                </span>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
                  Welcome to StudyFlow
                </h1>
                <p className="text-sm font-medium text-slate-500 sm:text-base">
                  Sign in to continue
                </p>
              </div>

              <div className="w-full">
                {/* Google (visual parity with the reference; OAuth is not
                    configured in this self-hosted clone — honest fallback). */}
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() =>
                      toast.info(
                        "Google sign-in isn't configured in this clone. Use email and password — try the demo account below.",
                      )
                    }
                    className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-[16px] font-medium text-slate-700 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sf-focus"
                  >
                    <svg aria-hidden="true" className="-ml-4 h-5 w-5" viewBox="0 0 48 48">
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
                </div>

                {/* Divider — reference: h-[1px] line + overlapping "or" chip. */}
                <div className="relative my-6" aria-hidden="true">
                  <div className="absolute inset-0 flex items-center">
                    <div className="h-[1px] w-full bg-slate-200 dark:bg-slate-800" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-3 font-medium tracking-wider text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                      or
                    </span>
                  </div>
                </div>

                {/* Email/password — reference inputs: h-11 sm:h-12, rounded-xl,
                    bg-slate-50/50, border-slate-200, pl-10 with leading icon. */}
                <form onSubmit={onSubmit} className="space-y-4 sm:space-y-5" noValidate>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                      aria-hidden="true"
                    />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="h-11 rounded-xl border-slate-200 bg-slate-50/50 pl-10 placeholder:text-slate-600 focus-visible:border-slate-400 sm:h-12 dark:border-slate-700 dark:bg-slate-800/50"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                      aria-hidden="true"
                    />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="h-11 rounded-xl border-slate-200 bg-slate-50/50 pl-10 pr-10 placeholder:text-slate-600 focus-visible:border-slate-400 sm:h-12 dark:border-slate-700 dark:bg-slate-800/50"
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

                <button
                  type="submit"
                  disabled={busy || !email || !password}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-slate-900 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:pointer-events-none disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white sf-focus"
                >
                  {busy ? "Signing in…" : "Sign in"}
                </button>

                {/* Footer — reference (measured): inside the form, a
                    space-y-3 block holding flex-col sm:flex-row
                    justify-between links; "Sign up" emphasized. */}
                <div className="space-y-3">
                  <div className="flex flex-col items-center justify-between gap-2 text-sm sm:flex-row sm:gap-0">
                    <button
                      type="button"
                      onClick={() =>
                        toast.info("Password reset isn't configured in this clone. Use the demo account.")
                      }
                      className="font-medium text-slate-500 transition-colors hover:text-slate-700 sf-focus dark:text-slate-400 dark:hover:text-slate-200"
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
                      className="text-slate-500 transition-colors hover:text-slate-700 sf-focus dark:text-slate-400 dark:hover:text-slate-200"
                    >
                      Need an account? <span className="font-medium text-slate-700 dark:text-slate-200">Sign up</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Demo account: demo@studyflow.app · Demo1234!
        </p>
      </div>
    </div>
  );
}

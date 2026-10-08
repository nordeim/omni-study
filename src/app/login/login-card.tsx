"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CircleAlert,
  CircleCheck,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import { Input, Label } from "@/components/ui/input";
import { apiSend, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { PublicUserShape } from "@/lib/app-context";

// ---------------------------------------------------------------------------
// Login surface — rebuilt to the reference's measured spec (session 4, S4-F):
// a border-0 shadow-2xl bg-white/95 backdrop-blur rounded-2xl card (448px
// max-w-md) with a 1px slate gradient top strip; an 80px circular gradient
// logo with ring-4 ring-white/50 + blurred glow; text-2xl sm:text-3xl title;
// 48px/rounded-xl inputs (bg-slate-50/50, border-slate-200); a 54px
// rounded-xl Google button; and the h-[1px] divider with the "or" chip.
//
// S15 (ADR-013) — the auth-card grew the reference's full sub-screen family,
// measured against the live reference (scripts/ref-auth-probe-s15.mjs):
//   signin  — brand block + Google + divider + Email/Password (48px inputs)
//   signup  — "Create your account" (Back→h2 gap 8px; 44px inputs; Email /
//             Password "Min. 8 characters" / Confirm Password)
//   verify  — shield-in-circle icon (64px bg-slate-100) + "Verify your email"
//             + "We've sent a 6-digit code to <email>" + six 40×44 OTP boxes
//             (gap 6px, centered) + helper + "Verify email" + "Resend"
//   forgot  — "Reset your password" (gap 16px) + copy + Email + "Send reset
//             link"
//   check-email — envelope-in-circle + "Check your email" + "We've sent
//             password reset instructions to <email>" + GREEN alert + a
//             full-width text-style Back button
//   reset   — the superset completion of the reference's emailed link
//             (`/login?token=<48hex>`): new password + confirm.
// Login errors render INLINE (role=alert red wash between Password and
// Sign in — the reference's measured pattern, replacing the S14 toast).
// The demo-account helper and the self-hosted code/reset-link notes are the
// clone's additive superset (this app has no SMTP — the code/link is shown
// to the actor; documented in docs/remediation-plan-session15.md).
// ---------------------------------------------------------------------------

type Screen = "signin" | "signup" | "verify" | "forgot" | "check-email" | "reset";

const DEMO_EMAIL = "demo@studyflow.app";
const DEMO_PASSWORD = "Demo1234!";

/** The reference's measured inline alert (S15-A1): red/green wash, p-4,
 *  rounded-xl, icon at left-4 top-4, 16px text, role=alert. */
function InlineAlert({
  tone,
  children,
}: {
  tone: "error" | "success";
  children: React.ReactNode;
}) {
  const Icon = tone === "success" ? CircleCheck : CircleAlert;
  return (
    <div
      role="alert"
      className={cn(
        "relative w-full rounded-xl border p-4 text-foreground",
        "[&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
        tone === "success"
          ? "border-green-200 bg-green-50/70 dark:border-green-900 dark:bg-green-950/40"
          : "border-red-200 bg-red-50/70 dark:border-red-900 dark:bg-red-950/40",
      )}
    >
      <Icon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
      <div className="text-base">{children}</div>
    </div>
  );
}

/** Shared sub-screen field: 44px input with a leading icon (measured). */
function SubField({
  id,
  label,
  icon,
  ...props
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-slate-700 dark:text-slate-300">
        {label}
      </Label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true">
          {icon}
        </span>
        <Input
          id={id}
          className="h-10 rounded-xl border-slate-200 bg-slate-50/50 pl-10 text-sm placeholder:text-slate-400 focus-visible:border-slate-400 focus-visible:ring-slate-400 sm:h-11 sm:text-base dark:border-slate-700 dark:bg-slate-800/50"
          {...props}
        />
      </div>
    </div>
  );
}

/** The sub-screens' measured Back affordance (top-left, 16px icon + text). */
function BackToSignIn({ onBack }: { onBack: () => void }) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-700 sf-focus dark:text-slate-400 dark:hover:text-slate-200"
    >
      <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
      Back to sign in
    </button>
  );
}

/** The sub-screens' measured primary submit (44px slate-900 rounded-xl). */
function SubSubmit({
  busy,
  children,
}: {
  busy: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="inline-flex h-10 w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-slate-900 px-3 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:pointer-events-none disabled:opacity-50 sm:h-11 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white sf-focus"
    >
      {children}
    </button>
  );
}

export function LoginCard({ initialResetToken }: { initialResetToken: string | null }) {
  const router = useRouter();
  const [screen, setScreen] = React.useState<Screen>(initialResetToken ? "reset" : "signin");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  // Verify state: surfaced code (no-SMTP self-hosted delivery) + OTP digits.
  const [surfacedCode, setSurfacedCode] = React.useState<string | null>(null);
  const [digits, setDigits] = React.useState<string[]>(Array<string>(6).fill(""));
  const digitRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  // Forgot/reset state.
  const [resetUrl, setResetUrl] = React.useState<string | null>(null);
  const [resetToken, setResetToken] = React.useState<string | null>(initialResetToken);

  function goBackToSignIn() {
    setScreen("signin");
    setError(null);
    setNotice(null);
    setDigits(Array<string>(6).fill(""));
    setSurfacedCode(null);
  }

  const errOf = (e: unknown, fallback: string) =>
    e instanceof ApiError ? e.message : fallback;

  // ---- signin ---------------------------------------------------------------

  async function onSubmitSignin(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const { user } = await apiSend<{ user: PublicUserShape }>("POST", "/api/auth/login", {
        email,
        password,
      });
      toast.success(`Welcome back, ${user.name || user.email.split("@")[0]}!`);
      router.replace("/Dashboard");
      router.refresh();
    } catch (err) {
      setError(errOf(err, "Sign in failed. Please try again."));
      setBusy(false);
    }
  }

  // ---- signup ----------------------------------------------------------------

  async function onSubmitSignup(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const res = await apiSend<{ ok: boolean; email: string; code: string }>(
        "POST",
        "/api/auth/register",
        { email, password },
      );
      setSurfacedCode(res.code);
      setDigits(Array<string>(6).fill(""));
      setScreen("verify");
      setError(null);
    } catch (err) {
      setError(errOf(err, "Could not create your account. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  // ---- verify ----------------------------------------------------------------

  async function submitVerification() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const { user } = await apiSend<{ user: PublicUserShape }>("POST", "/api/auth/verify-email", {
        email,
        code: digits.join(""),
      });
      toast.success(`Welcome to StudyFlow, ${user.name || user.email.split("@")[0]}!`);
      router.replace("/Dashboard");
      router.refresh();
    } catch (err) {
      setError(errOf(err, "Invalid verification code."));
      setBusy(false);
    }
  }

  async function onResend() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await apiSend<{ ok: boolean; code?: string }>(
        "POST",
        "/api/auth/resend-verification",
        { email },
      );
      if (res.code) {
        setSurfacedCode(res.code);
        setDigits(Array<string>(6).fill(""));
        toast.info("A new 6-digit code is ready below.");
      } else {
        toast.info("If that email needs verification, a new code is on its way.");
      }
    } catch (err) {
      toast.error(errOf(err, "Could not resend the code. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  function setDigit(i: number, value: string) {
    const clean = value.replace(/\D/g, "");
    if (clean.length > 1) {
      // A paste of the whole code into any box distributes across the row.
      const next = Array<string>(6).fill("");
      for (let k = 0; k < Math.min(6, clean.length); k++) next[k] = clean[k]!;
      setDigits(next);
      digitRefs.current[Math.min(5, clean.length - 1)]?.focus();
      return;
    }
    setDigits((d) => {
      const next = [...d];
      next[i] = clean;
      return next;
    });
    if (clean && i < 5) digitRefs.current[i + 1]?.focus();
  }

  function onDigitKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      e.preventDefault();
      setDigits((d) => {
        const next = [...d];
        next[i - 1] = "";
        return next;
      });
      digitRefs.current[i - 1]?.focus();
    }
  }

  // ---- forgot / check-email ---------------------------------------------------

  async function onSubmitForgot(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await apiSend<{ ok: boolean; resetUrl?: string }>(
        "POST",
        "/api/auth/forgot-password",
        { email },
      );
      setResetUrl(res.resetUrl ?? null);
      setScreen("check-email");
    } catch (err) {
      setError(errOf(err, "Could not send the reset link. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  // ---- reset (the emailed link's destination — superset) ----------------------

  async function onSubmitReset(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !resetToken) return;
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await apiSend<{ ok: boolean }>("POST", "/api/auth/reset-password", {
        token: resetToken,
        password,
      });
      setPassword("");
      setConfirmPassword("");
      setResetToken(null);
      setNotice("Password reset successfully. Sign in with your new password.");
      setScreen("signin");
    } catch (err) {
      setError(errOf(err, "This reset link is invalid or has expired."));
    } finally {
      setBusy(false);
    }
  }

  // ---- render -----------------------------------------------------------------

  const brandBlock = (
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
    </div>
  );

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
            {screen === "signin" && (
              <>
                {brandBlock}
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
                  <form onSubmit={onSubmitSignin} className="space-y-4 sm:space-y-5" noValidate>
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

                    {/* S15-A1 — the reference renders auth errors INLINE
                        (role=alert red wash) between Password and Sign in. */}
                    {error && <InlineAlert tone="error">{error}</InlineAlert>}
                    {notice && <InlineAlert tone="success">{notice}</InlineAlert>}

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
                          onClick={() => {
                            setScreen("forgot");
                            setError(null);
                          }}
                          className="font-medium text-slate-500 transition-colors hover:text-slate-700 sf-focus dark:text-slate-400 dark:hover:text-slate-200"
                        >
                          Forgot password?
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setScreen("signup");
                            setError(null);
                            setConfirmPassword("");
                          }}
                          className="text-slate-500 transition-colors hover:text-slate-700 sf-focus dark:text-slate-400 dark:hover:text-slate-200"
                        >
                          Need an account? <span className="font-medium text-slate-700 dark:text-slate-200">Sign up</span>
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </>
            )}

            {screen === "signup" && (
              <div>
                <BackToSignIn onBack={goBackToSignIn} />
                {/* Measured: Back → h2 gap 8px. */}
                <h2 className="mt-2 text-center text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                  Create your account
                </h2>
                <form onSubmit={onSubmitSignup} className="mt-6 space-y-4 sm:space-y-5" noValidate>
                  <SubField
                    id="signup-email"
                    label="Email"
                    icon={<Mail className="h-4 w-4" strokeWidth={2} aria-hidden="true" />}
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <SubField
                    id="signup-password"
                    label="Password"
                    icon={<Lock className="h-4 w-4" strokeWidth={2} aria-hidden="true" />}
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <SubField
                    id="signup-confirm"
                    label="Confirm Password"
                    icon={<Lock className="h-4 w-4" strokeWidth={2} aria-hidden="true" />}
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="text-xs text-slate-500 transition-colors hover:text-slate-700 sf-focus dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    {showPassword ? "Hide passwords" : "Show passwords"}
                  </button>
                  {error && <InlineAlert tone="error">{error}</InlineAlert>}
                  <SubSubmit busy={busy}>
                    {busy ? "Creating account…" : "Create account"}
                  </SubSubmit>
                </form>
              </div>
            )}

            {screen === "verify" && (
              <div>
                <BackToSignIn onBack={goBackToSignIn} />
                {/* Measured: 64px slate-100 circle + ShieldCheck, 16px gaps. */}
                <div className="mx-auto mt-4 mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 sm:h-16 sm:w-16 dark:bg-slate-800">
                  <ShieldCheck
                    className="h-7 w-7 text-slate-700 sm:h-8 sm:w-8 dark:text-slate-300"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </div>
                <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                  Verify your email
                </h2>
                <p className="mt-2 text-center text-slate-600 text-sm sm:text-base dark:text-slate-400">
                  We&apos;ve sent a 6-digit code to{" "}
                  <span className="font-medium text-slate-900 dark:text-slate-100">{email}</span>
                </p>
                {/* Measured: six 40×44 boxes, 6px gaps, centered row. */}
                <div className="mt-6 flex justify-center gap-1.5">
                  {digits.map((digit, i) => (
                    <Input
                      key={i}
                      ref={(el) => { digitRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      autoComplete={i === 0 ? "one-time-code" : "off"}
                      aria-label={`Digit ${i + 1}`}
                      value={digit}
                      onChange={(e) => setDigit(i, e.target.value)}
                      onKeyDown={(e) => onDigitKeyDown(i, e)}
                      className="h-11 w-10 rounded-lg bg-background text-center text-base"
                    />
                  ))}
                </div>
                <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
                  Enter the verification code sent to your email
                </p>
                <form
                  className="mt-6"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void submitVerification();
                  }}
                  noValidate
                >
                  {error && <InlineAlert tone="error">{error}</InlineAlert>}
                  <div className={error ? "mt-4" : undefined}>
                    <SubSubmit busy={busy || !digits.join("")}>
                      {busy ? "Verifying…" : "Verify email"}
                    </SubSubmit>
                  </div>
                </form>
                <p className="mt-3 text-center text-sm text-slate-600 dark:text-slate-400">
                  Didn&apos;t receive the code?{" "}
                  <button
                    type="button"
                    onClick={() => void onResend()}
                    disabled={busy}
                    className="font-medium text-slate-700 transition-colors hover:text-slate-900 disabled:opacity-50 sf-focus dark:text-slate-200 dark:hover:text-white"
                  >
                    Resend
                  </button>
                </p>
                {surfacedCode && (
                  <p className="mt-4 rounded-lg bg-slate-50 p-3 text-center text-xs text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                    Self-hosted note: SMTP isn&apos;t configured in this clone, so your code is{" "}
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{surfacedCode}</span>
                  </p>
                )}
              </div>
            )}

            {screen === "forgot" && (
              <div>
                <BackToSignIn onBack={goBackToSignIn} />
                {/* Measured: Back → h2 gap 16px. */}
                <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                  Reset your password
                </h2>
                <p className="mt-2 text-center text-slate-600 text-sm sm:text-base dark:text-slate-400">
                  Enter your email and we&apos;ll send you a link to reset your password
                </p>
                <form onSubmit={onSubmitForgot} className="mt-6 space-y-4 sm:space-y-5" noValidate>
                  <SubField
                    id="forgot-email"
                    label="Email"
                    icon={<Mail className="h-4 w-4" strokeWidth={2} aria-hidden="true" />}
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  {error && <InlineAlert tone="error">{error}</InlineAlert>}
                  <SubSubmit busy={busy}>{busy ? "Sending…" : "Send reset link"}</SubSubmit>
                </form>
              </div>
            )}

            {screen === "check-email" && (
              <div>
                {/* Measured: envelope-in-circle (same 64px slate-100 shape). */}
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 sm:h-16 sm:w-16 dark:bg-slate-800">
                  <Mail
                    className="h-7 w-7 text-slate-700 sm:h-8 sm:w-8 dark:text-slate-300"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </div>
                <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                  Check your email
                </h2>
                <p className="mt-2 text-center text-slate-600 text-sm sm:text-base dark:text-slate-400">
                  We&apos;ve sent password reset instructions to{" "}
                  <span className="font-medium text-slate-900 dark:text-slate-100">{email}</span>
                </p>
                <div className="mt-6">
                  <InlineAlert tone="success">
                    Please check your email for the password reset link. It may take a few minutes to
                    arrive.
                  </InlineAlert>
                </div>
                {resetUrl && (
                  <p className="mt-4 rounded-lg bg-slate-50 p-3 text-center text-xs text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                    Self-hosted note: SMTP isn&apos;t configured in this clone.{" "}
                    <a
                      href={resetUrl}
                      className="font-semibold text-slate-700 underline underline-offset-2 hover:text-slate-900 sf-focus dark:text-slate-200 dark:hover:text-white"
                    >
                      Open your reset link
                    </a>
                  </p>
                )}
                {/* Measured: full-width text-style Back (type=submit on the
                    reference — a plain form button). */}
                <button
                  type="button"
                  onClick={goBackToSignIn}
                  className="mt-6 flex w-full items-center justify-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700 sf-focus dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                  Back to sign in
                </button>
              </div>
            )}

            {screen === "reset" && (
              <div>
                <BackToSignIn onBack={goBackToSignIn} />
                <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                  Reset your password
                </h2>
                <p className="mt-2 text-center text-slate-600 text-sm sm:text-base dark:text-slate-400">
                  Choose a new password for your account
                </p>
                <form onSubmit={onSubmitReset} className="mt-6 space-y-4 sm:space-y-5" noValidate>
                  <SubField
                    id="reset-password"
                    label="Password"
                    icon={<Lock className="h-4 w-4" strokeWidth={2} aria-hidden="true" />}
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <SubField
                    id="reset-confirm"
                    label="Confirm Password"
                    icon={<Lock className="h-4 w-4" strokeWidth={2} aria-hidden="true" />}
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  {error && <InlineAlert tone="error">{error}</InlineAlert>}
                  <SubSubmit busy={busy}>{busy ? "Resetting…" : "Reset password"}</SubSubmit>
                </form>
              </div>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          {/* Clickable demo helper (superset): fills the sign-in form. */}
          <button
            type="button"
            onClick={() => {
              setScreen("signin");
              setEmail(DEMO_EMAIL);
              setPassword(DEMO_PASSWORD);
              setError(null);
              setNotice(null);
            }}
            className="transition-colors hover:text-slate-600 sf-focus dark:hover:text-slate-300"
          >
            Demo account: {DEMO_EMAIL} · {DEMO_PASSWORD}
          </button>
        </p>
      </div>
    </div>
  );
}

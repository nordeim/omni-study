"use client";

import * as React from "react";
import {
  Brain,
  Check,
  Coffee,
  Flame,
  Pause,
  Play,
  RotateCcw,
  Settings2,
  Target,
  Timer,
  Volume2,
  Zap,
} from "lucide-react";
import { useDataStore, mutations } from "@/lib/data";
import { ErrorText, LoadingCards } from "./shared";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { formatMinutes, isSameDay } from "@/lib/date";
import { cn } from "@/lib/utils";

type TimerMode = "focus" | "short_break" | "long_break";

interface Preset {
  name: string;
  durations: string;
  focus: number;
  short_break: number;
  long_break: number;
}

const MODE_META: Record<TimerMode, { label: string; ringLabel: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }> = {
  focus: { label: "Focus", ringLabel: "Focus Time", icon: Brain },
  short_break: { label: "Short Break", ringLabel: "Short Break", icon: Coffee },
  // S9-L: Long Break uses the reference's coffee glyph (not moon).
  long_break: { label: "Long Break", ringLabel: "Long Break", icon: Coffee },
};

const PRESETS: Preset[] = [
  { name: "Pomodoro", durations: "25/5/15", focus: 25, short_break: 5, long_break: 15 },
  { name: "Deep Work", durations: "50/10/30", focus: 50, short_break: 10, long_break: 30 },
];

/** S5-E — the reference's ring: 256px box, r=120, stroke-width 8. */
const RADIUS = 120;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const LONG_BREAK_INTERVAL = 4;

const pad = (n: number) => n.toString().padStart(2, "0");

/** Completion chime (WebAudio) — the reference's volume2 button implies an
 *  audible alarm; the clone makes it real. No assets needed: two soft beeps. */
function playChime(): void {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    for (const [i, freq] of [880, 1174.66].entries()) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.35);
      gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + i * 0.35 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.35 + 0.9);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.35);
      osc.stop(ctx.currentTime + i * 0.35 + 1);
    }
    window.setTimeout(() => void ctx.close(), 2500);
  } catch {
    // Audio is best-effort only.
  }
}

export function FocusTimerView() {
  const focusSessions = useDataStore((s) => s.data.focusSessions);
  const subjects = useDataStore((s) => s.data.subjects);
  const status = useDataStore((s) => s.status.focusSessions);
  const error = useDataStore((s) => s.error);
  const loadAll = useDataStore((s) => s.loadAll);

  React.useEffect(() => {
    void loadAll(["focusSessions", "subjects"]);
  }, [loadAll]);

  const [mode, setMode] = React.useState<TimerMode>("focus");
  const [durations, setDurations] = React.useState<Record<TimerMode, number>>({
    focus: 25,
    short_break: 5,
    long_break: 15,
  });
  const [remaining, setRemaining] = React.useState(25 * 60);
  const [running, setRunning] = React.useState(false);
  const [subjectId, setSubjectId] = React.useState("");
  const [soundOn, setSoundOn] = React.useState(true);
  const [autoBreaks, setAutoBreaks] = React.useState(false);
  const [pomodoroCount, setPomodoroCount] = React.useState(0);

  // Timestamp (ms) at which the running timer will reach zero — tracking an
  // absolute deadline instead of decrementing keeps the timer drift-free
  // across pauses, tab throttling and re-renders.
  const endAtRef = React.useRef<number | null>(null);

  const totalSeconds = durations[mode] * 60;

  // Completion handler is invoked from inside the interval; a ref keeps the
  // interval effect's dependency list stable while always calling the latest
  // closure (current mode, durations and subject).
  const completeRef = React.useRef<() => void>(() => {});

  async function handleComplete() {
    const completedMode = mode;
    const totalMinutes = durations[completedMode];
    const isLongBreakDue = completedMode === "focus" && (pomodoroCount + 1) % LONG_BREAK_INTERVAL === 0;
    const next: TimerMode =
      completedMode === "focus" ? (isLongBreakDue ? "long_break" : "short_break") : "focus";
    if (completedMode === "focus") setPomodoroCount((c) => c + 1);
    // Advance immediately so the ring resets while the session logs.
    setMode(next);
    setRemaining(durations[next] * 60);
    if (soundOn) playChime();
    try {
      await mutations.createFocusSession({
        durationMinutes: totalMinutes,
        mode: completedMode,
        subjectId: subjectId || null,
        date: new Date().toISOString(),
      });
      if (completedMode === "focus") {
        toast.success("Focus session complete! 🎉");
      } else {
        toast.success(`${MODE_META[completedMode].label} finished — time to focus!`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not log the session");
    }
    if (autoBreaks && !isLongBreakDue) {
      endAtRef.current = Date.now() + durations[next] * 60_000;
      setRunning(true);
    }
  }

  React.useEffect(() => {
    completeRef.current = () => void handleComplete();
  });

  React.useEffect(() => {
    if (!running) return;
    const tick = () => {
      const endAt = endAtRef.current;
      if (endAt == null) return;
      const secs = Math.max(0, Math.round((endAt - Date.now()) / 1000));
      setRemaining(secs);
      if (secs <= 0) {
        endAtRef.current = null;
        setRunning(false);
        completeRef.current();
      }
    };
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [running]);

  function toggleRunning() {
    if (running) {
      // Pause — freeze the remaining time at its current value.
      const endAt = endAtRef.current;
      if (endAt != null) {
        setRemaining(Math.max(0, Math.round((endAt - Date.now()) / 1000)));
      }
      endAtRef.current = null;
      setRunning(false);
    } else {
      const startFrom = remaining > 0 ? remaining : totalSeconds;
      endAtRef.current = Date.now() + startFrom * 1000;
      setRemaining(startFrom);
      setRunning(true);
    }
  }

  function resetTimer() {
    endAtRef.current = null;
    setRunning(false);
    setRemaining(totalSeconds);
  }

  function skipSession() {
    endAtRef.current = null;
    setRunning(false);
    const next: TimerMode = mode === "focus" ? "short_break" : "focus";
    setMode(next);
    setRemaining(durations[next] * 60);
  }

  function switchMode(next: TimerMode) {
    endAtRef.current = null;
    setRunning(false);
    setMode(next);
    setRemaining(durations[next] * 60);
  }

  function applyPreset(preset: Preset) {
    const next: Record<TimerMode, number> = {
      focus: preset.focus,
      short_break: preset.short_break,
      long_break: preset.long_break,
    };
    setDurations(next);
    endAtRef.current = null;
    setRunning(false);
    setRemaining(next[mode] * 60);
    toast.success(`${preset.name} preset applied`);
  }

  const fraction = totalSeconds > 0 ? (totalSeconds - remaining) / totalSeconds : 0;
  const display = `${pad(Math.floor(remaining / 60))}:${pad(remaining % 60)}`;
  const now = new Date();
  const todaySessions = focusSessions.filter((f) => isSameDay(new Date(f.date), now));
  const todayFocus = todaySessions.filter((f) => f.mode === "focus");
  const totalTodayMinutes = todaySessions.reduce((sum, f) => sum + f.durationMinutes, 0);
  const activePreset = PRESETS.find(
    (p) => p.focus === durations.focus && p.short_break === durations.short_break && p.long_break === durations.long_break,
  );

  return (
    <div className="flex flex-col gap-8">
      {/* S5-E — the reference centers the whole view in a max-w-2xl column
          with a centered text-3xl title + 32px icon. */}
      <div className="mx-auto w-full max-w-2xl space-y-8">
        <div className="text-center">
          <h1 className="flex items-center justify-center gap-3 text-3xl font-bold text-slate-800 dark:text-slate-100">
            <Timer className="h-8 w-8 text-sf-primary" strokeWidth={2} aria-hidden="true" />
            Focus Timer
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Stay focused and productive</p>
        </div>

        {status === "error" ? (
          <ErrorText message={error ?? "Failed to load focus sessions"} />
        ) : status === "idle" || status === "loading" ? (
          <LoadingCards count={3} />
        ) : (
          <>
            {/* Today stats — measured: grid-cols-3, rounded-xl cards,
                centered, 24px icon + text-2xl/700 value + text-xs label. */}
            <div className="grid grid-cols-3 gap-4">
              {[
                // S9-L (measured): the reference's stat icons are
                // flame (Pomodoros) / target (Today) / zap (Sessions).
                { icon: Flame, value: String(todayFocus.length), label: "Pomodoros" },
                { icon: Target, value: formatMinutes(totalTodayMinutes), label: "Today" },
                { icon: Zap, value: String(todaySessions.length), label: "Sessions" },
              ].map(({ icon: Icon, value, label }) => (
                <div
                  key={label}
                  className="rounded-xl border border-slate-100 bg-white p-4 text-center dark:border-slate-800 dark:bg-slate-900"
                >
                  <Icon className="mx-auto h-6 w-6 text-sf-primary" strokeWidth={1.75} aria-hidden="true" />
                  <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{label}</p>
                </div>
              ))}
            </div>

            {/* Main timer card — measured: rounded-3xl, p-8, shadow-xl. */}
            <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
              {/* Mode buttons — measured: px-4 py-2 rounded-xl h9/r12, active
                  = gradient + shadow-lg + white; inactive = text-slate-600
                  hover:bg-slate-100. */}
              <div className="mb-8 flex justify-center gap-2" role="group" aria-label="Timer mode">
                {(Object.keys(MODE_META) as TimerMode[]).map((m) => {
                  const Meta = MODE_META[m];
                  const Icon = Meta.icon;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => switchMode(m)}
                      aria-pressed={mode === m}
                      className={cn(
                        "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all sf-focus",
                        mode === m
                          ? "sf-gradient text-white shadow-lg"
                          : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
                      )}
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.75} />
                      {Meta.label}
                    </button>
                  );
                })}
              </div>

              {/* Ring — measured: 256px, r=120, sw=8, track slate-100,
                  progress an SVG linearGradient (violet → indigo). */}
              <div className="relative mx-auto mb-8 h-64 w-64">
                <svg viewBox="0 0 256 256" className="h-full w-full -rotate-90" aria-hidden="true">
                  <defs>
                    <linearGradient id="sf-timer-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" style={{ stopColor: "rgb(var(--sf-primary))" }} />
                      <stop offset="100%" style={{ stopColor: "rgb(var(--sf-primary-gradient-to))" }} />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="128"
                    cy="128"
                    r={RADIUS}
                    fill="none"
                    strokeWidth="8"
                    className="stroke-slate-100 dark:stroke-slate-800"
                  />
                  <circle
                    cx="128"
                    cy="128"
                    r={RADIUS}
                    fill="none"
                    strokeWidth="8"
                    strokeLinecap="round"
                    stroke="url(#sf-timer-grad)"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={CIRCUMFERENCE * (1 - fraction)}
                    style={{ transition: "stroke-dashoffset 1s linear" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p
                    className="font-mono text-5xl font-bold text-slate-800 dark:text-slate-100"
                    role="timer"
                    aria-label={`${Math.floor(remaining / 60)} minutes and ${remaining % 60} seconds remaining`}
                  >
                    {display}
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{MODE_META[mode].ringLabel}</p>
                </div>
              </div>

              {/* Controls — measured: three round buttons; reset/skip 48px
                  outline circles, play a 64px gradient circle. */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={resetTimer}
                  aria-label="Reset timer"
                  className="h-12 w-12 rounded-full"
                >
                  <RotateCcw className="h-5 w-5" strokeWidth={2} />
                </Button>
                <button
                  type="button"
                  onClick={toggleRunning}
                  aria-label={running ? "Pause timer" : remaining < totalSeconds ? "Resume timer" : "Start timer"}
                  className="sf-gradient sf-focus flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105 disabled:pointer-events-none disabled:opacity-50"
                  style={{ boxShadow: "0 10px 15px -3px rgb(var(--sf-primary) / 0.25), 0 4px 6px -4px rgb(var(--sf-primary) / 0.25)" }}
                >
                  {running ? (
                    <Pause className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
                  ) : (
                    <Play className="h-6 w-6 translate-x-0.5" strokeWidth={2} aria-hidden="true" />
                  )}
                </button>
                <Button
                  variant="outline"
                  onClick={skipSession}
                  aria-label="Complete session"
                  className="h-12 w-12 rounded-full"
                >
                  {/* S8-N (measured): the reference's third control is a CHECK
                      glyph (w-5 h-5) — not skip-forward. */}
                  <Check className="h-5 w-5" strokeWidth={2} />
                </Button>
              </div>

              {/* Subject select + sound/settings — measured: border-t row,
                  h-9 select flanked by two 40px outline icon buttons. */}
              <div className="mt-8 flex items-center justify-center gap-4 border-t border-slate-100 pt-6 dark:border-slate-800">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setSoundOn((v) => !v);
                    toast.info(soundOn ? "Chime muted" : "Chime on");
                  }}
                  aria-label={soundOn ? "Mute completion chime" : "Enable completion chime"}
                  aria-pressed={soundOn}
                  className="h-10 w-10 shrink-0"
                >
                  <Volume2 className="h-4 w-4" strokeWidth={2} />
                </Button>
                <Select value={subjectId || undefined} onValueChange={(v) => setSubjectId(v)}>
                  <SelectTrigger className="w-48" aria-label="Session subject">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setAutoBreaks((v) => !v);
                    toast.info(autoBreaks ? "Auto-start breaks off" : "Auto-start breaks on");
                  }}
                  aria-label="Toggle auto-start breaks"
                  aria-pressed={autoBreaks}
                  className="h-10 w-10 shrink-0"
                >
                  <Settings2 className="h-4 w-4" strokeWidth={2} />
                </Button>
              </div>

              {/* Pomodoro cycle dots — measured: 4× w-3 h-3 rounded-full. */}
              <div className="mt-6 flex justify-center gap-2" aria-label="Pomodoro cycle progress">
                {Array.from({ length: LONG_BREAK_INTERVAL }, (_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-3 w-3 rounded-full transition-all",
                      i < pomodoroCount % LONG_BREAK_INTERVAL || (pomodoroCount > 0 && pomodoroCount % LONG_BREAK_INTERVAL === 0)
                        ? "bg-sf-primary"
                        : "bg-slate-200 dark:bg-slate-700",
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Presets — measured: two-line buttons px-6 py-3 rounded-xl
                (64px tall); active bg violet-100. */}
            <div className="flex justify-center gap-4">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => applyPreset(p)}
                  aria-pressed={activePreset?.name === p.name}
                  className={cn(
                    "rounded-xl px-6 py-3 text-sm font-medium transition-all sf-focus",
                    activePreset?.name === p.name
                      ? "bg-sf-primary-soft text-sf-primary-strong dark:bg-sf-primary-soft-dark dark:text-sf-primary-strong-dark"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800",
                  )}
                >
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-xs opacity-70">{p.durations}</p>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

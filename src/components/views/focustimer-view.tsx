"use client";

import * as React from "react";
import { Brain, Coffee, Flame, Moon, Pause, Play, RotateCcw, SkipForward, Timer, Zap } from "lucide-react";
import { useDataStore, mutations, type FocusSession } from "@/lib/data";
import { EmptyState, ErrorText, LoadingCards, ViewHeader, useSubjectMap } from "./shared";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { formatMinutes, isSameDay } from "@/lib/date";
import { cn } from "@/lib/utils";

type TimerMode = "focus" | "short_break" | "long_break";

interface Preset {
  name: string;
  focus: number;
  short_break: number;
  long_break: number;
}

const MODE_META: Record<TimerMode, { label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }> = {
  focus: { label: "Focus", icon: Brain },
  short_break: { label: "Short Break", icon: Coffee },
  long_break: { label: "Long Break", icon: Moon },
};

const PRESETS: Preset[] = [
  { name: "Pomodoro 25/5/15", focus: 25, short_break: 5, long_break: 15 },
  { name: "Deep Work 50/10/30", focus: 50, short_break: 10, long_break: 30 },
];

const RADIUS = 110;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const pad = (n: number) => n.toString().padStart(2, "0");

export function FocusTimerView() {
  const focusSessions = useDataStore((s) => s.data.focusSessions);
  const subjects = useDataStore((s) => s.data.subjects);
  const status = useDataStore((s) => s.status.focusSessions);
  const error = useDataStore((s) => s.error);
  const loadAll = useDataStore((s) => s.loadAll);
  const subjectMap = useSubjectMap();

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
    const next: TimerMode = completedMode === "focus" ? "short_break" : "focus";
    // Advance immediately so the ring resets while the session logs.
    setMode(next);
    setRemaining(durations[next] * 60);
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
  const totalTodayMinutes = todaySessions.reduce((sum, f) => sum + f.durationMinutes, 0);

  return (
    <div className="flex flex-col gap-6">
      <ViewHeader
        title="Focus Timer"
        subtitle="Stay on task with structured focus sessions and breaks"
      />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Timer card */}
        <div className="w-full lg:flex-1">
          <div className="sf-card flex flex-col items-center gap-6 p-6 sm:p-8">
            {/* Mode buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2" role="group" aria-label="Timer mode">
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
                      "inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors sf-focus",
                      mode === m
                        ? "bg-sf-primary text-sf-primary-foreground shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800",
                    )}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                    {Meta.label}
                  </button>
                );
              })}
            </div>

            {/* Presets */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {PRESETS.map((p) => (
                <Button key={p.name} variant="outline" size="sm" onClick={() => applyPreset(p)} className="gap-1.5">
                  {p.name.startsWith("Deep") ? (
                    <Zap className="h-3.5 w-3.5" strokeWidth={1.75} />
                  ) : (
                    <Timer className="h-3.5 w-3.5" strokeWidth={1.75} />
                  )}
                  {p.name}
                </Button>
              ))}
            </div>

            {/* Circular timer */}
            <div className="relative flex h-64 w-64 items-center justify-center">
              <svg viewBox="0 0 256 256" className="h-full w-full -rotate-90" aria-hidden="true">
                <circle
                  cx="128"
                  cy="128"
                  r={RADIUS}
                  fill="none"
                  strokeWidth="12"
                  className="stroke-slate-100 dark:stroke-slate-800"
                />
                <circle
                  cx="128"
                  cy="128"
                  r={RADIUS}
                  fill="none"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={CIRCUMFERENCE * (1 - fraction)}
                  style={{ stroke: "rgb(var(--sf-primary))" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  {MODE_META[mode].label}
                </p>
                <p
                  className="text-5xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-slate-50"
                  role="timer"
                  aria-label={`${Math.floor(remaining / 60)} minutes and ${remaining % 60} seconds remaining`}
                >
                  {display}
                </p>
                <p className="text-xs text-slate-400">of {formatMinutes(durations[mode])}</p>
              </div>
            </div>

            {/* Subject + controls */}
            <div className="flex w-full flex-col items-center gap-4">
              <Select value={subjectId || undefined} onValueChange={(v) => setSubjectId(v)}>
                <SelectTrigger className="w-full max-w-[260px]" aria-label="Session subject">
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
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button onClick={toggleRunning} className="min-w-[120px] gap-1.5">
                  {running ? (
                    <Pause className="h-4 w-4" strokeWidth={1.75} />
                  ) : (
                    <Play className="h-4 w-4" strokeWidth={1.75} />
                  )}
                  {running ? "Pause" : remaining < totalSeconds ? "Resume" : "Start"}
                </Button>
                <Button variant="outline" onClick={resetTimer} className="gap-1.5">
                  <RotateCcw className="h-4 w-4" strokeWidth={1.75} /> Reset
                </Button>
                <Button variant="outline" onClick={skipSession} className="gap-1.5">
                  <SkipForward className="h-4 w-4" strokeWidth={1.75} /> Skip
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Today's sessions */}
        <div className="w-full lg:w-96 lg:shrink-0">
          {status === "error" ? (
            <ErrorText message={error ?? "Failed to load focus sessions"} />
          ) : status === "idle" || status === "loading" ? (
            <LoadingCards count={1} />
          ) : (
            <section className="sf-card overflow-hidden" aria-label="Today's focus sessions">
              <header className="flex items-center justify-between gap-2 border-b border-slate-100 px-6 py-4 dark:border-slate-800">
                <h3 className="flex items-center gap-2.5 text-[18px] font-semibold text-slate-800 dark:text-slate-100">
                  <Flame className="h-5 w-5" strokeWidth={1.75} /> Today&apos;s Sessions
                </h3>
                <span className="text-xs text-slate-400">{todaySessions.length} logged</span>
              </header>
              <div className="flex flex-col gap-4 p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/60">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Sessions today</p>
                    <p className="mt-1 text-[26px] font-bold leading-none text-slate-800 dark:text-slate-100">
                      {todaySessions.length}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/60">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Total time</p>
                    <p className="mt-1 text-[26px] font-bold leading-none text-slate-800 dark:text-slate-100">
                      {formatMinutes(totalTodayMinutes)}
                    </p>
                  </div>
                </div>
                {todaySessions.length === 0 ? (
                  <EmptyState
                    icon={Timer}
                    title="No sessions yet today"
                    hint="Complete a timer to log your first session of the day."
                  />
                ) : (
                  <ul className="flex max-h-96 flex-col gap-2 overflow-y-auto sf-scroll">
                    {todaySessions.map((f: FocusSession) => {
                      const subject = f.subjectId ? subjectMap.get(f.subjectId) : undefined;
                      const ModeIcon = MODE_META[f.mode]?.icon ?? Timer;
                      return (
                        <li
                          key={f.id}
                          className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-4 py-2.5 dark:border-slate-800"
                        >
                          <span className="flex min-w-0 items-center gap-2.5">
                            <span
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sf-primary-soft text-sf-primary-strong dark:bg-sf-primary-soft-dark dark:text-sf-primary-strong-dark"
                              aria-hidden="true"
                            >
                              <ModeIcon className="h-4 w-4" strokeWidth={1.75} />
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                                {subject ? subject.name : MODE_META[f.mode]?.label ?? "Session"}
                              </span>
                              <span className="block text-xs text-slate-400">
                                {MODE_META[f.mode]?.label ?? f.mode} ·{" "}
                                {new Date(f.date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                              </span>
                            </span>
                          </span>
                          <span className="shrink-0 text-sm font-semibold text-slate-600 dark:text-slate-300">
                            {formatMinutes(f.durationMinutes)}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

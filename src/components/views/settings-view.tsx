"use client";

import * as React from "react";
import { Check, LogOut, Monitor, Moon, Plus, Sun, Trash2 } from "lucide-react";
import { useDataStore, mutations } from "@/lib/data";
import { useThemeStore } from "@/lib/store";
import { ACCENTS, ACCENT_TOKENS, AVATAR_EMOJIS, type ThemeMode } from "@/lib/theme";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Switch } from "@/components/ui/primitives";
import { toast } from "@/components/ui/toast";
import { apiSend } from "@/lib/api";
import { cn } from "@/lib/utils";

// Settings — Appearance (mode/accent/avatar), Profile, Subjects, Holidays,
// Notifications. Mirrors the reference's five tabs.

const MODES: { id: ThemeMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Monitor },
];

export function SettingsView() {
  const setMode = useThemeStore((s) => s.setMode);
  const setAccent = useThemeStore((s) => s.setAccent);
  const setAvatar = useThemeStore((s) => s.setAvatar);
  const mode = useThemeStore((s) => s.mode);
  const accent = useThemeStore((s) => s.accent);
  const avatar = useThemeStore((s) => s.avatar);
  const userName = useThemeStore((s) => s.userName);
  const email = useThemeStore((s) => s.email);

  const subjects = useDataStore((s) => s.data.subjects);
  const holidays = useDataStore((s) => s.data.holidays);
  const loadAll = useDataStore((s) => s.loadAll);

  const [nameDraft, setNameDraft] = React.useState(userName);
  const [newSubject, setNewSubject] = React.useState("");
  const [newSubjectColor, setNewSubjectColor] = React.useState("#8b5cf6");
  const [newHolidayName, setNewHolidayName] = React.useState("");
  const [newHolidayDate, setNewHolidayDate] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    void loadAll(["subjects", "holidays"]);
  }, [loadAll]);

  async function savePreferences(patch: Record<string, unknown>) {
    setBusy(true);
    try {
      await mutations.savePreferences(patch);
      toast.success("Preferences saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save preferences");
    } finally {
      setBusy(false);
    }
  }

  async function addSubject(e: React.FormEvent) {
    e.preventDefault();
    if (!newSubject.trim()) return;
    try {
      await mutations.createSubject({ name: newSubject.trim(), color: newSubjectColor });
      setNewSubject("");
      toast.success("Subject added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add the subject");
    }
  }

  async function addHoliday(e: React.FormEvent) {
    e.preventDefault();
    if (!newHolidayName.trim() || !newHolidayDate) return;
    try {
      await mutations.createHoliday({ name: newHolidayName.trim(), date: newHolidayDate });
      setNewHolidayName("");
      setNewHolidayDate("");
      toast.success("Holiday added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add the holiday");
    }
  }

  async function logout() {
    try {
      await apiSend("POST", "/api/auth/logout");
      window.location.replace("/login");
    } catch {
      toast.error("Could not log out");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Personalize StudyFlow to match your style</p>
      </div>

      <Tabs defaultValue="appearance">
        <TabsList>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="holidays">Holidays</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* Appearance */}
        <TabsContent value="appearance">
          <div className="sf-card flex flex-col gap-8 p-6">
            <div>
              <h3 className="mb-3 text-[15px] font-semibold text-slate-800 dark:text-slate-100">Theme</h3>
              <div className="flex flex-wrap gap-2">
                {MODES.map((m) => (
                  <Button
                    key={m.id}
                    variant={mode === m.id ? "default" : "outline"}
                    onClick={() => {
                      setMode(m.id);
                      void savePreferences({ themeMode: m.id });
                    }}
                    className="gap-2"
                  >
                    <m.icon className="h-4 w-4" /> {m.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-[15px] font-semibold text-slate-800 dark:text-slate-100">Accent color</h3>
              <div className="flex flex-wrap gap-2">
                {ACCENTS.map((a) => {
                  const token = ACCENT_TOKENS[a];
                  const rgb = `rgb(${token.primary.split(" ").join(",")})`;
                  return (
                    <button
                      key={a}
                      type="button"
                      onClick={() => {
                        setAccent(a);
                        void savePreferences({ accentColor: a });
                      }}
                      aria-label={`${a[0]!.toUpperCase()}${a.slice(1)} accent`}
                      aria-pressed={accent === a}
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-sm transition-transform hover:scale-105 sf-focus",
                        accent === a && "ring-2 ring-offset-2 ring-slate-400 dark:ring-offset-slate-900",
                      )}
                      style={{ backgroundColor: rgb }}
                    >
                      {accent === a && <Check className="h-4 w-4" strokeWidth={3} />}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs capitalize text-slate-400">Current: {accent}</p>
            </div>

            <div>
              <h3 className="mb-3 text-[15px] font-semibold text-slate-800 dark:text-slate-100">Avatar</h3>
              <div className="grid max-w-lg grid-cols-8 gap-2 sm:grid-cols-12">
                {AVATAR_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      setAvatar(emoji);
                      void savePreferences({ avatarEmoji: emoji });
                    }}
                    aria-label={`Choose avatar ${emoji}`}
                    aria-pressed={avatar === emoji}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl text-xl transition-colors hover:bg-slate-100 dark:hover:bg-slate-800",
                      avatar === emoji && "bg-sf-primary-soft dark:bg-sf-primary-soft-dark",
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={() => void savePreferences({})}
              disabled={busy}
              className="self-start"
            >
              Save Preferences
            </Button>
          </div>
        </TabsContent>

        {/* Profile */}
        <TabsContent value="profile">
          <div className="sf-card flex max-w-lg flex-col gap-6 p-6">
            <div className="flex items-center gap-4">
              <span
                className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl shadow-sm"
                style={{ backgroundColor: "rgb(var(--sf-primary-soft))" }}
                aria-hidden="true"
              >
                {avatar}
              </span>
              <div>
                <p className="text-[15px] font-semibold text-slate-800 dark:text-slate-100">
                  {userName || "Student"}
                </p>
                <p className="text-sm text-slate-400">{email}</p>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="display-name">Display name</Label>
              <Input
                id="display-name"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                maxLength={80}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => {
                  useThemeStore.setState({ userName: nameDraft });
                  void savePreferences({ name: nameDraft });
                }}
                disabled={busy}
              >
                Save profile
              </Button>
              <Button variant="outline" onClick={logout} className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/40">
                <LogOut className="h-4 w-4" /> Sign out
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Subjects */}
        <TabsContent value="subjects">
          <div className="sf-card flex max-w-2xl flex-col gap-5 p-6">
            <form onSubmit={addSubject} className="flex flex-wrap items-end gap-3">
              <div className="flex min-w-[200px] flex-1 flex-col gap-1.5">
                <Label htmlFor="subject-name">New subject</Label>
                <Input
                  id="subject-name"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="e.g. Biology"
                  maxLength={80}
                />
              </div>
              <div className="flex gap-1.5">
                {["#8b5cf6", "#3b82f6", "#22c55e", "#f97316", "#ec4899", "#ef4444", "#14b8a6"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewSubjectColor(c)}
                    aria-label={`Color ${c}`}
                    className={cn("h-8 w-8 rounded-full", newSubjectColor === c && "ring-2 ring-offset-2 ring-slate-400 dark:ring-offset-slate-900")}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <Button type="submit" disabled={!newSubject.trim()}>
                <Plus className="h-4 w-4" /> Add
              </Button>
            </form>
            <ul className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
              {subjects.map((s) => (
                <li key={s.id} className="flex items-center gap-3 py-3">
                  <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
                  <div className="min-w-0 flex-1">
                    <input
                      aria-label={`Rename subject "${s.name}"`}
                      defaultValue={s.name}
                      onBlur={(e) => {
                        const next = e.target.value.trim();
                        if (next && next !== s.name) {
                          void mutations.updateSubject(s.id, { name: next });
                          toast.success("Subject renamed");
                        }
                      }}
                      className="w-full truncate bg-transparent text-sm font-medium text-slate-800 focus:outline-none dark:text-slate-100"
                      maxLength={80}
                    />
                    {s.teacher && <p className="text-xs text-slate-400">{s.teacher}{s.room ? ` · ${s.room}` : ""}</p>}
                  </div>
                  <Button
                    variant="ghost"
                    size="iconSm"
                    aria-label={`Delete subject "${s.name}"`}
                    onClick={() => {
                      void mutations.deleteSubject(s.id);
                      toast.success("Subject deleted");
                    }}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
              {subjects.length === 0 && (
                <li className="py-6 text-center text-sm text-slate-400">No subjects yet</li>
              )}
            </ul>
          </div>
        </TabsContent>

        {/* Holidays */}
        <TabsContent value="holidays">
          <div className="sf-card flex max-w-2xl flex-col gap-5 p-6">
            <form onSubmit={addHoliday} className="flex flex-wrap items-end gap-3">
              <div className="flex min-w-[180px] flex-1 flex-col gap-1.5">
                <Label htmlFor="holiday-name">Holiday name</Label>
                <Input
                  id="holiday-name"
                  value={newHolidayName}
                  onChange={(e) => setNewHolidayName(e.target.value)}
                  placeholder="e.g. Spring break"
                  maxLength={120}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="holiday-date">Date</Label>
                <input
                  id="holiday-date"
                  type="date"
                  value={newHolidayDate}
                  onChange={(e) => setNewHolidayDate(e.target.value)}
                  className="flex h-10 rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm"
                />
              </div>
              <Button type="submit" disabled={!newHolidayName.trim() || !newHolidayDate}>
                <Plus className="h-4 w-4" /> Add
              </Button>
            </form>
            <ul className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
              {holidays.map((h) => (
                <li key={h.id} className="flex items-center gap-3 py-3 text-sm">
                  <span className="min-w-0 flex-1 font-medium text-slate-800 dark:text-slate-100">{h.name}</span>
                  <span className="text-slate-400">
                    {new Date(h.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </span>
                  <Button
                    variant="ghost"
                    size="iconSm"
                    aria-label={`Delete holiday "${h.name}"`}
                    onClick={() => {
                      void mutations.deleteHoliday(h.id);
                      toast.success("Holiday deleted");
                    }}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
              {holidays.length === 0 && (
                <li className="py-6 text-center text-sm text-slate-400">
                  No holidays yet — add term breaks and public holidays.
                </li>
              )}
            </ul>
          </div>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <div className="sf-card flex max-w-xl flex-col gap-5 p-6">
            {(
              [
                { id: "dueSoon", label: "Assignment due reminders", hint: "Notify me 2 days before a due date", default: true },
                { id: "exams", label: "Exam countdowns", hint: "Notify me a week before every exam", default: true },
                { id: "focusStreak", label: "Focus streak nudge", hint: "A gentle nudge when I skip focus sessions", default: false },
                { id: "weeklyDigest", label: "Weekly study digest", hint: "A Sunday summary of my week", default: false },
              ] as const
            ).map((row) => (
              <NotificationRow key={row.id} label={row.label} hint={row.hint} defaultOn={row.default} />
            ))}
            <p className="text-xs text-slate-400">
              Notification delivery requires a configured push/email channel — preferences are stored locally for now.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NotificationRow({ label, hint, defaultOn }: { label: string; hint: string; defaultOn: boolean }) {
  const storeKey = `sf-notify-${label.toLowerCase().replace(/\s+/g, "-")}`;
  // Lazy initializer — runs once on the client (this view renders only after
  // the client-side auth gate, so there is no SSR HTML to mismatch).
  const [on, setOn] = React.useState(() => {
    try {
      const saved = window.localStorage.getItem(storeKey);
      return saved === null ? defaultOn : saved === "1";
    } catch {
      return defaultOn;
    }
  });
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{label}</p>
        <p className="mt-0.5 text-xs text-slate-400">{hint}</p>
      </div>
      <Switch
        checked={on}
        onCheckedChange={(v) => {
          setOn(v);
          try {
            window.localStorage.setItem(storeKey, v ? "1" : "0");
          } catch {
            /* storage unavailable */
          }
        }}
        aria-label={label}
      />
    </div>
  );
}

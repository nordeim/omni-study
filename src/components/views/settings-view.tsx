"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { Bell, BookOpen as BookOpenIcon, Calendar as CalendarIcon, GraduationCap, LogOut, Monitor, Moon, Palette, Plus, Settings as SettingsIcon, Sun, Trash2, User as UserIcon } from "lucide-react";
import { useDataStore, mutations } from "@/lib/data";
import { GRADE_LEVEL_OPTIONS } from "@/lib/validation";
import { ViewHeader } from "./shared";
import { useThemeStore } from "@/lib/store";
import { ACCENTS, ACCENT_TOKENS, AVATAR_EMOJIS, THEME_CACHE_KEY, type ThemeMode } from "@/lib/theme";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Switch } from "@/components/ui/primitives";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { UserAvatar } from "@/components/layout/user-avatar";
import { apiSend, ApiError } from "@/lib/api";
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
  const setEmail = useThemeStore((s) => s.setEmail);
  const mode = useThemeStore((s) => s.mode);
  const accent = useThemeStore((s) => s.accent);
  const avatar = useThemeStore((s) => s.avatar);
  const userName = useThemeStore((s) => s.userName);
  const email = useThemeStore((s) => s.email);
  // S17-A: the reference's Profile-tab fields (Settings → Profile).
  const schoolName = useThemeStore((s) => s.schoolName);
  const gradeLevel = useThemeStore((s) => s.gradeLevel);
  const studyGoalHours = useThemeStore((s) => s.studyGoalHours);
  const notificationsEnabled = useThemeStore((s) => s.notificationsEnabled);
  const accountCreatedAt = useThemeStore((s) => s.accountCreatedAt);

  const subjects = useDataStore((s) => s.data.subjects);
  const holidays = useDataStore((s) => s.data.holidays);
  const loadAll = useDataStore((s) => s.loadAll);

  const [nameDraft, setNameDraft] = React.useState(userName);
  // S17-A drafts (the reference's Profile tab: school / grade / goal).
  const [schoolDraft, setSchoolDraft] = React.useState(schoolName);
  const [gradeDraft, setGradeDraft] = React.useState(gradeLevel);
  const [goalDraft, setGoalDraft] = React.useState(studyGoalHours);
  // S17-B draft — the Notifications master toggle.
  const [notifyMaster, setNotifyMaster] = React.useState(notificationsEnabled);
  const [newSubject, setNewSubject] = React.useState("");
  const [newSubjectColor, setNewSubjectColor] = React.useState("#8b5cf6");
  const [newHolidayName, setNewHolidayName] = React.useState("");
  const [newHolidayDate, setNewHolidayDate] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  // S24 (ADR-022) — the change-password card's state (the Profile tab
  // extension, the S23 additive-below pattern).
  const [pwCurrent, setPwCurrent] = React.useState("");
  const [pwNew, setPwNew] = React.useState("");
  const [pwConfirm, setPwConfirm] = React.useState("");
  const [pwBusy, setPwBusy] = React.useState(false);
  const [pwError, setPwError] = React.useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = React.useState<string | null>(null);
  // S25 (ADR-023) — the Danger zone card's state (the ownership exit, the
  // additive-below pattern under the S24 card). The confirmation form is
  // HIDDEN until "Delete account…" reveals it (the two-step reveal — an
  // accidental Enter on a visible delete form must never fire).
  const [delOpen, setDelOpen] = React.useState(false);
  const [delPassword, setDelPassword] = React.useState("");
  const [delConfirmation, setDelConfirmation] = React.useState("");
  const [delBusy, setDelBusy] = React.useState(false);
  const [delError, setDelError] = React.useState<string | null>(null);
  // S26 (ADR-024) — the Email address card's state (the account-identity
  // rotation, below the pinned Profile surfaces — the S23/S24 additive
  // pattern). Always visible (email change is NOT destructive — no
  // two-step reveal, the S24 posture); the success note clears the fields
  // and the theme store's email slice updates live.
  const [emNew, setEmNew] = React.useState("");
  const [emConfirm, setEmConfirm] = React.useState("");
  const [emPassword, setEmPassword] = React.useState("");
  const [emBusy, setEmBusy] = React.useState(false);
  const [emError, setEmError] = React.useState<string | null>(null);
  const [emSuccess, setEmSuccess] = React.useState<string | null>(null);

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

  // S17-A — the reference's "Save Profile": persists the study-profile
  // fields + the display name in ONE request, then syncs the theme store's
  // user slice from the returned record (so a reload AND an immediate
  // re-render agree with the server).
  async function saveProfile() {
    const trimmed = nameDraft.trim();
    if (!trimmed) {
      toast.error("Display name cannot be empty");
      return;
    }
    setBusy(true);
    try {
      const { user } = await mutations.savePreferences({
        name: trimmed,
        ...(schoolDraft.trim() !== schoolName ? { schoolName: schoolDraft.trim() } : {}),
        ...(gradeDraft !== gradeLevel ? { gradeLevel: gradeDraft } : {}),
        ...(goalDraft !== studyGoalHours ? { studyGoalHours: goalDraft } : {}),
      });
      useThemeStore.setState({
        userName: (user?.name as string) ?? trimmed,
        schoolName: (user?.schoolName as string) ?? schoolDraft.trim(),
        gradeLevel: (user?.gradeLevel as string) ?? gradeDraft,
        studyGoalHours: typeof user?.studyGoalHours === "number" ? user.studyGoalHours : goalDraft,
      });
      setNameDraft((user?.name as string) ?? trimmed);
      setSchoolDraft((user?.schoolName as string) ?? schoolDraft.trim());
      setGradeDraft((user?.gradeLevel as string) ?? gradeDraft);
      setGoalDraft(typeof user?.studyGoalHours === "number" ? user.studyGoalHours : goalDraft);
      toast.success("Profile saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save profile");
    } finally {
      setBusy(false);
    }
  }

  // S24 (ADR-022) — the change-password submission. The client-side
  // pre-checks (the S23 size-pre-check pattern — the early inline error,
  // no request): all three fields filled, the register policy's min-8, the
  // confirm match, and the same-password rule. Errors render INLINE
  // (role="alert" — the S15 auth convention: auth errors never render as
  // toasts); success renders as role="status" and clears the fields.
  async function changePassword() {
    setPwError(null);
    setPwSuccess(null);
    if (!pwCurrent || !pwNew || !pwConfirm) {
      setPwError("Fill in all three password fields.");
      return;
    }
    if (pwNew.length < 8) {
      setPwError("The new password must be at least 8 characters.");
      return;
    }
    if (pwNew !== pwConfirm) {
      setPwError("The new password and its confirmation do not match.");
      return;
    }
    if (pwNew === pwCurrent) {
      setPwError("The new password must be different from your current password.");
      return;
    }
    setPwBusy(true);
    try {
      await apiSend("POST", "/api/auth/change-password", {
        currentPassword: pwCurrent,
        newPassword: pwNew,
      });
      setPwSuccess("Password updated.");
      setPwCurrent("");
      setPwNew("");
      setPwConfirm("");
    } catch (err) {
      if (err instanceof ApiError) {
        setPwError(err.message);
      } else {
        setPwError("Could not change the password — try again.");
      }
    } finally {
      setPwBusy(false);
    }
  }

  // S26 (ADR-024) — the account-identity rotation. Client-side pre-checks
  // mirror the schema (the early inline error, no request); on success the
  // theme store's email slice updates LIVE (the identity block re-renders —
  // the setEmail action) and the fields clear. Errors render inline
  // (role="alert" — the S15/S24/S25 auth convention: auth errors never
  // render as toasts).
  async function changeEmail() {
    setEmError(null);
    setEmSuccess(null);
    if (!emNew || !emConfirm || !emPassword) {
      setEmError("Enter the new email address twice and your password.");
      return;
    }
    if (emNew !== emConfirm) {
      setEmError("The email addresses do not match.");
      return;
    }
    setEmBusy(true);
    try {
      const res = await apiSend<{ ok: boolean; email: string }>("POST", "/api/auth/change-email", {
        password: emPassword,
        newEmail: emNew,
        confirmEmail: emConfirm,
      });
      // The route answers { ok, email } — the store slice updates from the
      // server's normalized (lowercased) address, never the raw input.
      setEmail(res.email);
      setEmSuccess("Email address updated.");
      setEmNew("");
      setEmConfirm("");
      setEmPassword("");
    } catch (err) {
      if (err instanceof ApiError) {
        setEmError(err.message);
      } else {
        setEmError("Could not change the email address — try again.");
      }
    } finally {
      setEmBusy(false);
    }
  }

  // S25 (ADR-023) — the ownership exit. On success there is NO success note:
  // the client clears the theme cache (the logout pattern — the login route
  // falls back to the fresh-visitor state) and redirects to /login; the
  // redirect IS the feedback. Errors render inline (role="alert" — the S15
  // auth convention: auth errors never render as toasts).
  async function deleteAccount() {
    setDelError(null);
    if (!delPassword || !delConfirmation) {
      setDelError("Enter your password and type DELETE to confirm.");
      return;
    }
    if (delConfirmation !== "DELETE") {
      setDelError("Type DELETE to confirm.");
      return;
    }
    setDelBusy(true);
    try {
      await apiSend("POST", "/api/auth/delete-account", {
        password: delPassword,
        confirmation: delConfirmation,
      });
      // The account is gone — leave the shell exactly as logout does.
      try {
        window.localStorage.removeItem(THEME_CACHE_KEY);
      } catch {
        /* storage unavailable — nothing to clear */
      }
      window.location.replace("/login");
    } catch (err) {
      if (err instanceof ApiError) {
        setDelError(err.message);
      } else {
        setDelError("Could not delete the account — try again.");
      }
    } finally {
      setDelBusy(false);
    }
  }

  // S17-B — the reference's Notifications master toggle: persisted as
  // notifications_enabled on the user record (its own PUT body).
  async function saveNotificationMaster() {
    setBusy(true);
    try {
      const { user } = await mutations.savePreferences({ notificationsEnabled: notifyMaster });
      const next = typeof user?.notificationsEnabled === "boolean" ? user.notificationsEnabled : notifyMaster;
      useThemeStore.setState({ notificationsEnabled: next });
      setNotifyMaster(next);
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
      // S11-1 — drop the cached theme so the login route falls back to the
      // fresh-visitor state (OS preference + default violet accent) instead
      // of the previous user's theme.
      try {
        window.localStorage.removeItem(THEME_CACHE_KEY);
      } catch {
        /* storage unavailable — nothing to clear */
      }
      window.location.replace("/login");
    } catch {
      toast.error("Could not log out");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <ViewHeader title="Settings" subtitle="Customize your StudyFlow experience" icon={SettingsIcon} />

      <Tabs defaultValue="appearance">
        {/* S8-O (measured): the reference's tab list is bg-white with a
            border-slate-200 border, p-1, and flex-wrap (no fixed h-9) —
            the shadcn stock stays default for other consumers. */}
        <TabsList className="h-auto flex-wrap border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          {/* S9-M (measured): every tab carries its leading icon —
              palette / user / book-open / calendar / bell. */}
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-2">
            <UserIcon className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="subjects" className="gap-2">
            <BookOpenIcon className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            Subjects
          </TabsTrigger>
          <TabsTrigger value="holidays" className="gap-2">
            <CalendarIcon className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            Holidays
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Appearance — S5-F: measured on the reference. Theme = 88px
            border-2 cards (selected: accent border + 50-level tint); accent
            swatches = 48px rounded-xl with ring+scale selection (no check
            icon); avatars = 48px text-2xl tiles (selected: 100-level tint +
            accent ring + scale-110). */}
        <TabsContent value="appearance">
          <div className="sf-card flex flex-col gap-8 p-6">
            {/* S17-C (measured): the reference's Appearance tab opens with
                this line above the Theme section. */}
            <h3 className="text-[15px] font-semibold text-slate-800 dark:text-slate-100">Customize how StudyFlow looks</h3>
            <div>
              <h3 className="mb-3 text-[15px] font-semibold text-slate-800 dark:text-slate-100">Theme</h3>
              <div className="flex gap-3">
                {MODES.map((m) => {
                  const selected = mode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setMode(m.id);
                        void savePreferences({ themeMode: m.id });
                      }}
                      aria-pressed={selected}
                      className={cn(
                        "flex flex-1 flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all sf-focus",
                        selected
                          ? // S10-6 — the selected tint lives in the
                            // .sf-selected-tint class (light: accent border +
                            // softest bg; .dark: accent border + soft-dark
                            // wash — inline styles cannot re-theme).
                            "sf-selected-tint"
                          : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600",
                      )}
                    >
                      <m.icon className="h-6 w-6" aria-hidden="true" />
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-[15px] font-semibold text-slate-800 dark:text-slate-100">Accent Color</h3>
              <div className="flex flex-wrap gap-3">
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
                        "h-12 w-12 rounded-xl transition-transform hover:scale-110 sf-focus",
                        accent === a && "scale-110 ring-2 ring-offset-2 ring-slate-400 dark:ring-offset-slate-900",
                      )}
                      style={{ backgroundColor: rgb }}
                    />
                  );
                })}
              </div>
              <p className="mt-2 text-xs capitalize text-slate-400">Current: {accent}</p>
            </div>

            <div>
              <h3 className="mb-3 text-[15px] font-semibold text-slate-800 dark:text-slate-100">Avatar</h3>
              <div className="grid max-w-lg grid-cols-8 gap-2 sm:grid-cols-12">
                {AVATAR_EMOJIS.map((emoji) => {
                  const selected = avatar === emoji;
                  return (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        setAvatar(emoji);
                        void savePreferences({ avatarEmoji: emoji });
                      }}
                      aria-label={`Choose avatar ${emoji}`}
                      aria-pressed={selected}
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-xl text-2xl transition-all sf-focus",
                        selected
                          ? "scale-110 ring-2 sf-swatch-selected"
                          : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700",
                      )}
                      style={
                        selected
                          ? {
                              boxShadow: "0 0 0 2px rgb(var(--sf-primary))",
                            }
                          : undefined
                      }
                    >
                      {emoji}
                    </button>
                  );
                })}
              </div>
            </div>

            <Button
              variant="gradient"
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
            {/* S17-A (measured): the reference's Profile tab opens with this
                line above the identity block. */}
            <h3 className="text-[15px] font-semibold text-slate-800 dark:text-slate-100">
              Your account and study information
            </h3>
            <div className="flex items-center gap-4">
              <UserAvatar size="lg" />
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
            {/* S17-A (measured): the reference's study-profile fields —
                School Name (free text), Grade Level (12-option select),
                Daily Study Goal (1–12 hour slider with a live-hours label),
                all persisted on the user record by its own PUT body. The
                display-name input above is the clone's S14 superset. */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="school-name">School Name</Label>
              <Input
                id="school-name"
                value={schoolDraft}
                onChange={(e) => setSchoolDraft(e.target.value)}
                placeholder="Your school..."
                maxLength={120}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Grade Level</Label>
              <Select value={gradeDraft} onValueChange={setGradeDraft}>
                <SelectTrigger aria-label="Grade Level" className="w-full">
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {GRADE_LEVEL_OPTIONS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="study-goal" className="text-sm font-medium text-slate-800 dark:text-slate-100">
                Daily Study Goal: {goalDraft} {goalDraft === 1 ? "hour" : "hours"}
              </Label>
              <SliderPrimitive.Root
                value={[goalDraft]}
                onValueChange={(v) => setGoalDraft(v[0] ?? goalDraft)}
                min={1}
                max={12}
                step={1}
                aria-label="Daily Study Goal"
                className="relative flex w-full touch-none select-none items-center"
              >
                <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <SliderPrimitive.Range className="absolute h-full" style={{ backgroundColor: "rgb(var(--sf-primary))" }} />
                </SliderPrimitive.Track>
                <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 bg-white shadow transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none dark:bg-slate-50" style={{ borderColor: "rgb(var(--sf-primary))" }} />
              </SliderPrimitive.Root>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="gradient" onClick={() => void saveProfile()} disabled={busy}>
                Save Profile
              </Button>
              <Button variant="outline" onClick={logout} className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/40">
                <LogOut className="h-4 w-4" /> Sign out
              </Button>
            </div>
            {/* S17-A (measured): the reference renders the account-creation
                line under the save button (M/D/YYYY from the user record). */}
            {accountCreatedAt && (
              <p className="text-sm text-slate-400">
                Account created:{" "}
                {new Date(accountCreatedAt).toLocaleDateString("en-US", {
                  month: "numeric",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            )}
          </div>

          {/* S26 (ADR-024) — the Email address card: a purely additive
              sf-card BELOW the pinned Profile surfaces and ABOVE the S24
              Change password card (the natural account order: identity →
              security → destructive exit; the S24/S25 cards stay
              byte-identical). The reference has NO email-change surface;
              this is the clone's own account-identity rotation superset.
              Always visible (email change is NOT destructive — no two-step
              reveal, the S24 posture); the confirm field guards the typo
              lockout (a mistyped address is unrecoverable through the UI);
              the identity block's email line updates LIVE through the theme
              store's setEmail action. NO new CSS (zero Tailwind v4 surface). */}
          <section aria-label="Email address" className="sf-card flex max-w-lg flex-col gap-4 p-6">
            <h3 className="text-[15px] font-semibold text-slate-800 dark:text-slate-100">
              Email address
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Update the address you use to sign in. You'll need your current password.
            </p>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-email">New email</Label>
              <Input
                id="new-email"
                type="email"
                autoComplete="off"
                spellCheck={false}
                value={emNew}
                onChange={(e) => setEmNew(e.target.value)}
                maxLength={200}
                placeholder="e.g. you@example.com"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirm-new-email">Confirm new email</Label>
              <Input
                id="confirm-new-email"
                type="email"
                autoComplete="off"
                spellCheck={false}
                value={emConfirm}
                onChange={(e) => setEmConfirm(e.target.value)}
                maxLength={200}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email-password">Password</Label>
              <Input
                id="email-password"
                type="password"
                autoComplete="current-password"
                value={emPassword}
                onChange={(e) => setEmPassword(e.target.value)}
                maxLength={200}
              />
            </div>
            {emError && (
              <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                {emError}
              </p>
            )}
            {emSuccess && (
              <p role="status" className="text-sm text-green-600 dark:text-green-400">
                {emSuccess}
              </p>
            )}
            <div>
              <Button
                variant="gradient"
                onClick={() => void changeEmail()}
                disabled={emBusy || !emNew || !emConfirm || !emPassword}
              >
                Update email address
              </Button>
            </div>
          </section>

          {/* S24 (ADR-022) — the change-password card: a purely additive
              sf-card BELOW the pinned Profile surfaces (the S23
              Restore-card pattern — the reference has NO password surface;
              this is the clone's own account-security superset). Errors
              render inline (role="alert" — the S15 auth convention); the
              success note clears the fields. */}
          <section aria-label="Change password" className="sf-card flex max-w-lg flex-col gap-4 p-6">
            <h3 className="text-[15px] font-semibold text-slate-800 dark:text-slate-100">
              Change password
            </h3>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="current-password">Current password</Label>
              <Input
                id="current-password"
                type="password"
                autoComplete="current-password"
                value={pwCurrent}
                onChange={(e) => setPwCurrent(e.target.value)}
                maxLength={200}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={pwNew}
                onChange={(e) => setPwNew(e.target.value)}
                maxLength={200}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirm-new-password">Confirm new password</Label>
              <Input
                id="confirm-new-password"
                type="password"
                autoComplete="new-password"
                value={pwConfirm}
                onChange={(e) => setPwConfirm(e.target.value)}
                maxLength={200}
              />
            </div>
            {pwError && (
              <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                {pwError}
              </p>
            )}
            {pwSuccess && (
              <p role="status" className="text-sm text-emerald-600 dark:text-emerald-400">
                {pwSuccess}
              </p>
            )}
            <div>
              <Button
                variant="gradient"
                onClick={() => void changePassword()}
                disabled={pwBusy || !pwCurrent || !pwNew || !pwConfirm}
              >
                Update Password
              </Button>
            </div>
          </section>

          {/* S25 (ADR-023) — the Danger zone card: a purely additive sf-card
              BELOW the S24 Change password card (the reference has NO
              account-deletion surface; this is the clone's own ownership-exit
              superset — the right-to-erasure). The two-step reveal: the
              confirmation form is HIDDEN until "Delete account…" is clicked
              (an accidental Enter on a visible delete form must never fire);
              the typed word DELETE + the password proof are the guardrails;
              success never renders a note — the redirect to /login IS the
              feedback (the logout pattern). */}
          <section aria-label="Danger zone" className="sf-card flex max-w-lg flex-col gap-4 p-6">
            <h3 className="text-[15px] font-semibold text-slate-800 dark:text-slate-100">
              Danger zone
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Permanently delete your account and all your data — subjects, tasks, notes, flashcards, grades, files.
              This cannot be undone. To keep a copy, download your data from the Export page first.
            </p>
            {!delOpen ? (
              <div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDelError(null);
                    setDelOpen(true);
                  }}
                  className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/40"
                >
                  Delete account…
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="delete-password">Password</Label>
                  <Input
                    id="delete-password"
                    type="password"
                    autoComplete="current-password"
                    value={delPassword}
                    onChange={(e) => setDelPassword(e.target.value)}
                    maxLength={200}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="delete-confirmation">Confirmation</Label>
                  <Input
                    id="delete-confirmation"
                    placeholder="Type DELETE"
                    autoComplete="off"
                    spellCheck={false}
                    value={delConfirmation}
                    onChange={(e) => setDelConfirmation(e.target.value)}
                    maxLength={50}
                  />
                </div>
                {delError && (
                  <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                    {delError}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="destructive"
                    onClick={() => void deleteAccount()}
                    disabled={delBusy || !delPassword || !delConfirmation}
                  >
                    Permanently delete my account
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDelOpen(false);
                      setDelPassword("");
                      setDelConfirmation("");
                      setDelError(null);
                    }}
                    disabled={delBusy}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </section>
        </TabsContent>

        {/* Subjects */}
        <TabsContent value="subjects">
          <div className="sf-card flex max-w-2xl flex-col gap-5 p-6">
            {/* S17-C (measured): the reference's per-tab headers + its
                zero-subjects empty state. */}
            <div>
              <h3 className="text-[15px] font-semibold text-slate-800 dark:text-slate-100">Manage your subjects and classes</h3>
            </div>
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
                <li className="py-6 text-center text-sm text-slate-400">
                  No subjects yet. Add your first subject to get started!
                </li>
              )}
            </ul>
          </div>
        </TabsContent>

        {/* Holidays */}
        <TabsContent value="holidays">
          <div className="sf-card flex max-w-2xl flex-col gap-5 p-6">
            {/* S17-C (measured): the reference's Holidays headers. */}
            <div>
              <h3 className="text-[15px] font-semibold text-slate-800 dark:text-slate-100">Holidays &amp; Breaks</h3>
              <p className="mt-0.5 text-sm text-slate-400">Set your school holidays and breaks</p>
            </div>
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
                  className="flex h-9 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
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
                  No holidays set. Add your school holidays!
                </li>
              )}
            </ul>
          </div>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <div className="sf-card flex max-w-xl flex-col gap-5 p-6">
            {/* S17-B (measured): the reference's Notifications tab — a header,
               an "Enable Notifications" MASTER toggle (persisted as
               notifications_enabled on the user record — its own PUT body),
               the hint line, and a Save Preferences button. The four detail
               rows below are the clone's documented superset (locally stored). */}
            <div>
              <h3 className="text-[15px] font-semibold text-slate-800 dark:text-slate-100">Manage your notification preferences</h3>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Enable Notifications</p>
                <p className="mt-0.5 text-xs text-slate-400">Receive reminders for tasks and assignments</p>
              </div>
              <Switch
                checked={notifyMaster}
                onCheckedChange={setNotifyMaster}
                aria-label="Enable Notifications"
              />
            </div>
            <Button
              variant="gradient"
              onClick={() => void saveNotificationMaster()}
              disabled={busy}
              className="self-start"
            >
              Save Preferences
            </Button>
            <div className="flex flex-col gap-4 border-t border-slate-100 pt-5 dark:border-slate-800">
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

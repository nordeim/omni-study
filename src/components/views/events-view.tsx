"use client";

import * as React from "react";
import { Bell, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Circle, Clock, Plus, Repeat as RepeatIcon, Trash2, X } from "lucide-react";
import { useDataStore, mutations, type AppEvent } from "@/lib/data";
import { ViewHeader, LoadingCards, ErrorText } from "./shared";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/primitives";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { addDays, isoWeekNumber, isSameDay, startOfDay, WEEKDAY_LONG, WEEKDAY_SHORT, isoWeekday } from "@/lib/date";
import { cn } from "@/lib/utils";

const FIELD_CLASS = "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm";
/** S5-B — the reference's dialog color picker shows SIX swatches (measured). */
const EVENT_COLORS = ["#8b5cf6", "#3b82f6", "#22c55e", "#f97316", "#ec4899", "#ef4444"];
const REPEAT_OPTIONS = [
  { value: "none", label: "No repeat" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
] as const;
const REMINDER_UNITS = [
  { value: "minutes", minutes: 1 },
  { value: "hours", minutes: 60 },
  { value: "days", minutes: 1440 },
] as const;

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

/** ISO datetime → "YYYY-MM-DDTHH:MM" in the user's local timezone (input safe). */
function toDateTimeInputValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/** Stable local-time key for a day bucket. */
function dateKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function eventTimeLabel(ev: Occurrence): string {
  if (ev.allDay) return "All day";
  const start = new Date(ev.startDate);
  if (Number.isNaN(start.getTime())) return "";
  const startLabel = start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  if (ev.endDate) {
    const end = new Date(ev.endDate);
    if (!Number.isNaN(end.getTime())) {
      return `${startLabel} – ${end.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
    }
  }
  return startLabel;
}

/** An event occurrence on a specific date (recurring events expand into
 *  these within the visible window — S5-B2 makes the reference's Repeat
 *  combobox real). */
interface Occurrence {
  key: string;
  date: Date;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string | null;
  allDay: boolean;
  color: string;
  repeat: string;
  reminders: string;
  /** The underlying stored event (edit/delete operate on it). */
  source: AppEvent;
}

function parseReminders(raw: string): number[] {
  try {
    const parsed: unknown = JSON.parse(raw || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((n): n is number => typeof n === "number" && n >= 0);
  } catch {
    return [];
  }
}

/** Expand an event into occurrences inside [windowStart, windowEnd]. */
function expandOccurrences(ev: AppEvent, windowStart: Date, windowEnd: Date): Occurrence[] {
  const base = new Date(ev.startDate);
  if (Number.isNaN(base.getTime())) return [];
  const out: Occurrence[] = [];
  const push = (date: Date) => {
    if (date < windowStart || date > windowEnd) return;
    // Keep the event's wall-clock time on the occurrence date.
    const start = new Date(date);
    start.setHours(base.getHours(), base.getMinutes(), 0, 0);
    let end: string | null = null;
    if (ev.endDate) {
      const baseEnd = new Date(ev.endDate);
      if (!Number.isNaN(baseEnd.getTime())) {
        const durMs = baseEnd.getTime() - base.getTime();
        const occEnd = new Date(start.getTime() + durMs);
        end = occEnd.toISOString();
      }
    }
    out.push({
      key: `${ev.id}:${dateKey(date)}`,
      date,
      title: ev.title,
      description: ev.description,
      location: ev.location ?? "",
      startDate: start.toISOString(),
      endDate: end,
      allDay: ev.allDay,
      color: ev.color,
      repeat: ev.repeat ?? "none",
      reminders: ev.reminders ?? "[]",
      source: ev,
    });
  };

  const repeat = ev.repeat ?? "none";
  if (repeat === "none") {
    push(startOfDay(base));
    return out;
  }
  // Walk the recurrence from the event start (bounded to a 2-year lookback so
  // long-running dailies cannot loop forever).
  const cursor = startOfDay(base);
  const limit = 730;
  let count = 0;
  while (cursor <= windowEnd && count < limit) {
    if (cursor >= windowStart) push(new Date(cursor));
    if (repeat === "daily") cursor.setDate(cursor.getDate() + 1);
    else if (repeat === "weekly") cursor.setDate(cursor.getDate() + 7);
    else if (repeat === "monthly") cursor.setMonth(cursor.getMonth() + 1);
    else break;
    count += 1;
  }
  return out;
}

function EventRow({
  occ,
  onEdit,
  onDelete,
}: {
  occ: Occurrence;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-slate-800/60">
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: occ.color || "#8b5cf6" }}
        aria-hidden="true"
      />
      <button
        type="button"
        onClick={onEdit}
        className="min-w-0 flex-1 text-left"
        aria-label={`Edit event "${occ.title}"`}
      >
        <p className="truncate text-sm font-medium text-white">
          {occ.title}
          {occ.repeat !== "none" && (
            <RepeatIcon className="ml-1.5 inline h-3 w-3 text-slate-500" aria-label="Recurring event" />
          )}
        </p>
        <p className="mt-0.5 truncate text-xs text-slate-400">
          {eventTimeLabel(occ)}
          {occ.location ? ` · ${occ.location}` : ""}
          {occ.description
            ? ` · ${occ.description.slice(0, 50)}${occ.description.length > 50 ? "…" : ""}`
            : ""}
        </p>
      </button>
      <Button
        variant="ghost"
        size="iconSm"
        onClick={onDelete}
        aria-label={`Delete event "${occ.title}"`}
        className="text-slate-600 opacity-0 transition-opacity hover:text-red-400 hover:opacity-100 focus-visible:opacity-100 group-hover:opacity-100"
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
      </Button>
    </div>
  );
}

interface DaySection {
  date: Date;
  label: string;
  occurrences: Occurrence[];
}

export function EventsView() {
  const events = useDataStore((s) => s.data.events);
  const loadStatus = useDataStore((s) => s.status.events);
  const error = useDataStore((s) => s.error);
  const loadAll = useDataStore((s) => s.loadAll);

  const [selectedDay, setSelectedDay] = React.useState<Date>(() => startOfDay(new Date()));
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<AppEvent | null>(null);
  const datePickerRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    void loadAll(["events"]);
  }, [loadAll]);

  // ---- Form state ----
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [allDay, setAllDay] = React.useState(false);
  const [repeat, setRepeat] = React.useState<string>("none");
  const [reminderDraft, setReminderDraft] = React.useState("15");
  const [reminderUnit, setReminderUnit] = React.useState<string>("minutes");
  const [reminderList, setReminderList] = React.useState<number[]>([]);
  const [color, setColor] = React.useState("#8b5cf6");
  const [busy, setBusy] = React.useState(false);

  function defaultStart(): string {
    return `${selectedDay.getFullYear()}-${pad2(selectedDay.getMonth() + 1)}-${pad2(selectedDay.getDate())}T09:00`;
  }

  function openCreate() {
    setEditing(null);
    setTitle("");
    setDescription("");
    setLocation("");
    setStartDate(defaultStart());
    setEndDate("");
    setAllDay(false);
    setRepeat("none");
    setReminderDraft("15");
    setReminderUnit("minutes");
    setReminderList([]);
    setColor("#8b5cf6");
    setDialogOpen(true);
  }

  function openEdit(ev: AppEvent) {
    setEditing(ev);
    setTitle(ev.title);
    setDescription(ev.description ?? "");
    setLocation(ev.location ?? "");
    setStartDate(toDateTimeInputValue(ev.startDate));
    setEndDate(toDateTimeInputValue(ev.endDate));
    setAllDay(ev.allDay);
    setRepeat(ev.repeat ?? "none");
    setReminderDraft("15");
    setReminderUnit("minutes");
    setReminderList(parseReminders(ev.reminders));
    setColor(ev.color || "#8b5cf6");
    setDialogOpen(true);
  }

  function addReminder() {
    const n = Number.parseInt(reminderDraft, 10);
    if (!Number.isFinite(n) || n <= 0) return;
    const unit = REMINDER_UNITS.find((u) => u.value === reminderUnit) ?? REMINDER_UNITS[0];
    const minutes = n * unit.minutes;
    if (minutes > 10080) {
      toast.error("Reminders can be at most 7 days in advance");
      return;
    }
    setReminderList((prev) => (prev.includes(minutes) ? prev : [...prev, minutes].sort((a, b) => a - b)));
  }

  async function submitEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !startDate || busy) return;
    setBusy(true);
    const start = new Date(startDate);
    const payload = {
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      startDate: start.toISOString(),
      endDate: endDate || null,
      allDay,
      repeat,
      reminders: JSON.stringify(reminderList),
      color,
    };
    try {
      if (editing) {
        await mutations.updateEvent(editing.id, payload);
        toast.success("Event updated");
      } else {
        await mutations.createEvent(payload);
        toast.success("Event created");
        if (!Number.isNaN(start.getTime())) setSelectedDay(startOfDay(start));
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save the event");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(ev: AppEvent) {
    try {
      await mutations.deleteEvent(ev.id);
      toast.success("Event deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete the event");
    }
  }

  // ---- Sections: 7 days starting from the selected day ----
  const now = new Date();
  const windowStart = startOfDay(selectedDay);
  const windowEnd = addDays(windowStart, 6);
  /** Reference label format: "Today" / "Tomorrow" / "Friday, October 9" —
   *  formatFullDate WITHOUT the year (measured). */
  const sectionLabel = (date: Date): string => {
    if (isSameDay(date, now)) return "Today";
    if (isSameDay(date, addDays(now, 1))) return "Tomorrow";
    return `${WEEKDAY_LONG[isoWeekday(date)]}, ${date.toLocaleDateString("en-US", { month: "long", day: "numeric" })}`;
  };
  const sections: DaySection[] = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(windowStart, i);
    const occurrences = events
      .flatMap((ev) => expandOccurrences(ev, windowStart, windowEnd))
      .filter((occ) => isSameDay(occ.date, date))
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    return { date, label: sectionLabel(date), occurrences };
  });

  // ---- Reminders: toast when a reminder offset elapses while the view is open ----
  React.useEffect(() => {
    const timers: number[] = [];
    const windowEndMs = windowEnd.getTime() + 86_400_000;
    for (const ev of events) {
      if ((ev.reminders ?? "[]") === "[]") continue;
      const start = new Date(ev.startDate).getTime();
      if (Number.isNaN(start) || start > windowEndMs) continue;
      for (const minutes of parseReminders(ev.reminders)) {
        const fireAt = start - minutes * 60_000;
        const delay = fireAt - Date.now();
        if (delay <= 0 || delay > 2_147_000_000) continue;
        timers.push(
          window.setTimeout(() => {
            toast.info(`Reminder: “${ev.title}” starts in ${minutes >= 60 ? `${Math.round(minutes / 60)} h` : `${minutes} min`}`);
          }, delay),
        );
      }
    }
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [events, windowEnd]);

  const weekdayLabel = WEEKDAY_SHORT[isoWeekday(selectedDay)];
  const monthLabel = `${selectedDay.toLocaleString("en-US", { month: "short" })} ${selectedDay.getFullYear()}`;

  if (loadStatus === "error") {
    return (
      <div className="flex flex-col gap-6">
        <ViewHeader title="Events & Reminders" subtitle="Manage your events with custom reminders" icon={CalendarDays} />
        <ErrorText message={error ?? "Failed to load events"} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ViewHeader
        title="Events & Reminders"
        subtitle="Manage your events with custom reminders"
        icon={CalendarDays}
      />

      {loadStatus === "idle" || loadStatus === "loading" ? (
        <LoadingCards />
      ) : (
        <section
          className="sf-print-exact w-full overflow-hidden rounded-2xl bg-slate-900 text-white shadow-2xl"
          aria-label="Events panel"
        >
          {/* Panel header — S5-B measured spec. The panel is intentionally
              dark in BOTH themes (the reference renders it dark on its light
              canvas). */}
          <div className="border-b border-slate-700 p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider text-slate-400">Events</p>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="iconSm"
                  onClick={() => setSelectedDay((d) => addDays(d, -1))}
                  aria-label="Previous day"
                  className="h-6 w-6 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <ChevronLeft className="h-4 w-4" strokeWidth={2} />
                </Button>
                <Button
                  variant="ghost"
                  size="iconSm"
                  onClick={() => setSelectedDay(startOfDay(new Date()))}
                  aria-label="Today"
                  className="h-6 w-6 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <Circle className="h-3.5 w-3.5" strokeWidth={2} />
                </Button>
                <Button
                  variant="ghost"
                  size="iconSm"
                  onClick={() => setSelectedDay((d) => addDays(d, 1))}
                  aria-label="Next day"
                  className="h-6 w-6 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <ChevronRight className="h-4 w-4" strokeWidth={2} />
                </Button>
                <Button
                  variant="ghost"
                  size="iconSm"
                  onClick={() => datePickerRef.current?.showPicker?.()}
                  aria-label="Pick a date"
                  className="h-6 w-6 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <ChevronDown className="h-4 w-4" strokeWidth={2} />
                </Button>
                <input
                  ref={datePickerRef}
                  type="date"
                  onChange={(e) => {
                    if (e.target.value) setSelectedDay(startOfDay(new Date(`${e.target.value}T12:00`)));
                  }}
                  className="sr-only"
                  aria-hidden="true"
                  tabIndex={-1}
                />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">{selectedDay.getDate()}</span>
              <div>
                <span className="text-lg font-medium">{weekdayLabel}</span>
                <p className="text-sm text-slate-400">
                  {monthLabel} CW {isoWeekNumber(selectedDay)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={openCreate}
              className="mt-3 flex h-9 w-full items-center justify-start gap-2 rounded-md px-4 py-2 text-sm font-medium text-cyan-400 transition-colors hover:bg-slate-800 hover:text-cyan-300 sf-focus"
            >
              <CalendarDays className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              New Event
            </button>
          </div>

          {/* Day sections */}
          <div className="max-h-[calc(100vh-400px)] min-h-[300px] overflow-y-auto sf-scroll">
            {sections.map((section) => (
              <div key={dateKey(section.date)} className="border-b border-slate-800 last:border-b-0">
                <div className="bg-slate-800/50 px-4 py-2">
                  <h3 className="text-sm font-semibold text-slate-300">{section.label}</h3>
                </div>
                <div className="p-2">
                  {section.occurrences.length === 0 ? (
                    <p className="px-2 py-3 text-sm text-slate-500">No events</p>
                  ) : (
                    section.occurrences.map((occ) => (
                      <EventRow
                        key={occ.key}
                        occ={occ}
                        onEdit={() => openEdit(occ.source)}
                        onDelete={() => void handleDelete(occ.source)}
                      />
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Event dialog — S5-B2 field set measured on the reference. */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Event" : "New Event"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitEvent} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="event-title">Title *</Label>
              <Input
                id="event-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Event title"
                maxLength={200}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="event-location">Location / Link</Label>
              <Input
                id="event-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Room or meeting URL"
                maxLength={160}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="event-description">Description</Label>
              <Textarea
                id="event-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Event details..."
                maxLength={2000}
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="event-start">Start</Label>
                <input
                  id="event-start"
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className={FIELD_CLASS}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="event-end">End</Label>
                <input
                  id="event-end"
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={FIELD_CLASS}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="event-repeat">Repeat</Label>
              <Select value={repeat} onValueChange={setRepeat}>
                <SelectTrigger id="event-repeat">
                  <SelectValue placeholder="No repeat" />
                </SelectTrigger>
                <SelectContent>
                  {REPEAT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="flex items-center gap-2">
                <Bell className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                Reminders
              </Label>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="icon" onClick={addReminder} aria-label="Add reminder">
                  <Plus className="h-4 w-4" strokeWidth={2} />
                </Button>
                <input
                  type="number"
                  min={1}
                  max={10080}
                  value={reminderDraft}
                  onChange={(e) => setReminderDraft(e.target.value)}
                  aria-label="Reminder amount"
                  className={cn(FIELD_CLASS, "w-20")}
                />
                <Select value={reminderUnit} onValueChange={setReminderUnit}>
                  <SelectTrigger className="w-28" aria-label="Reminder unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REMINDER_UNITS.map((u) => (
                      <SelectItem key={u.value} value={u.value}>
                        {u.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">before</span>
              </div>
              {reminderList.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {reminderList.map((minutes) => (
                    <span
                      key={minutes}
                      className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"
                    >
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {minutes >= 1440
                        ? `${minutes / 1440} day${minutes / 1440 === 1 ? "" : "s"}`
                        : minutes >= 60
                          ? `${minutes / 60} hour${minutes / 60 === 1 ? "" : "s"}`
                          : `${minutes} min`}{" "}
                      before
                      <button
                        type="button"
                        onClick={() => setReminderList((prev) => prev.filter((m) => m !== minutes))}
                        aria-label={`Remove ${minutes} minute reminder`}
                        className="sf-focus rounded-sm hover:text-foreground"
                      >
                        <X className="h-3 w-3" aria-hidden="true" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="event-all-day"
                  checked={allDay}
                  onCheckedChange={(v) => setAllDay(v === true)}
                />
                <Label htmlFor="event-all-day">All day</Label>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Color</Label>
                <div className="flex gap-2">
                  {EVENT_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      aria-label={`Choose color ${c}`}
                      aria-pressed={color === c}
                      className={cn(
                        "h-7 w-7 rounded-full transition-shadow sf-focus",
                        color === c && "ring-2 ring-offset-2 ring-slate-400 dark:ring-slate-500",
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="gradient" disabled={busy || !title.trim() || !startDate}>
                {busy ? "Saving…" : editing ? "Save changes" : "Create Event"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

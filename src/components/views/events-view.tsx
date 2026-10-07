"use client";

import * as React from "react";
import { CalendarDays, Clock, Plus, Trash2 } from "lucide-react";
import { useDataStore, mutations, type AppEvent } from "@/lib/data";
import { ViewHeader, EmptyState, LoadingCards, ErrorText, SectionCard } from "./shared";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Checkbox, Switch } from "@/components/ui/primitives";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { WEEKDAY_SHORT, addDays, dayBucketLabel, daysUntil, isSameDay, isoWeekday, startOfDay } from "@/lib/date";
import { cn } from "@/lib/utils";

const FIELD_CLASS = "flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm";
const EVENT_COLORS = ["#8b5cf6", "#3b82f6", "#22c55e", "#f97316", "#ec4899", "#ef4444", "#14b8a6"];

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

function eventTimeLabel(ev: AppEvent): string {
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

function EventRow({
  ev,
  onEdit,
  onDelete,
}: {
  ev: AppEvent;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <li className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: ev.color || "#8b5cf6" }}
        aria-hidden="true"
      />
      <button
        type="button"
        onClick={onEdit}
        className="min-w-0 flex-1 text-left"
        aria-label={`Edit event "${ev.title}"`}
      >
        <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{ev.title}</p>
        <p className="mt-0.5 truncate text-xs text-slate-400">
          {eventTimeLabel(ev)}
          {ev.description
            ? ` · ${ev.description.slice(0, 60)}${ev.description.length > 60 ? "…" : ""}`
            : ""}
        </p>
      </button>
      <Button
        variant="ghost"
        size="iconSm"
        onClick={onDelete}
        aria-label={`Delete event "${ev.title}"`}
        className="text-slate-400 hover:text-red-500"
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
      </Button>
    </li>
  );
}

interface EventGroup {
  date: Date;
  items: AppEvent[];
}

function groupEventsByDay(items: AppEvent[]): EventGroup[] {
  const map = new Map<string, EventGroup>();
  for (const ev of items) {
    const d = new Date(ev.startDate);
    if (Number.isNaN(d.getTime())) continue;
    const key = dateKey(d);
    const entry = map.get(key) ?? { date: startOfDay(d), items: [] };
    entry.items.push(ev);
    map.set(key, entry);
  }
  const groups = [...map.values()];
  groups.sort((a, b) => a.date.getTime() - b.date.getTime());
  for (const g of groups) {
    g.items.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }
  return groups;
}

export function EventsView() {
  const events = useDataStore((s) => s.data.events);
  const loadStatus = useDataStore((s) => s.status.events);
  const error = useDataStore((s) => s.error);
  const loadAll = useDataStore((s) => s.loadAll);

  const [selectedDay, setSelectedDay] = React.useState<Date>(() => startOfDay(new Date()));
  const [showAll, setShowAll] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<AppEvent | null>(null);

  React.useEffect(() => {
    void loadAll(["events"]);
  }, [loadAll]);

  // ---- Form state ----
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [allDay, setAllDay] = React.useState(false);
  const [color, setColor] = React.useState("#8b5cf6");
  const [busy, setBusy] = React.useState(false);

  function defaultStart(): string {
    return `${selectedDay.getFullYear()}-${pad2(selectedDay.getMonth() + 1)}-${pad2(selectedDay.getDate())}T09:00`;
  }

  function openCreate() {
    setEditing(null);
    setTitle("");
    setDescription("");
    setStartDate(defaultStart());
    setEndDate("");
    setAllDay(false);
    setColor("#8b5cf6");
    setDialogOpen(true);
  }

  function openEdit(ev: AppEvent) {
    setEditing(ev);
    setTitle(ev.title);
    setDescription(ev.description ?? "");
    setStartDate(toDateTimeInputValue(ev.startDate));
    setEndDate(toDateTimeInputValue(ev.endDate));
    setAllDay(ev.allDay);
    setColor(ev.color || "#8b5cf6");
    setDialogOpen(true);
  }

  async function submitEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !startDate || busy) return;
    setBusy(true);
    const start = new Date(startDate);
    const payload = {
      title: title.trim(),
      description: description.trim(),
      startDate: start.toISOString(),
      endDate: endDate || null,
      allDay,
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

  // ---- Day strip + grouping ----
  const now = new Date();
  const today = startOfDay(now);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, i);
    const count = events.filter((ev) => {
      const d = new Date(ev.startDate);
      return !Number.isNaN(d.getTime()) && isSameDay(d, date);
    }).length;
    return { date, count };
  });

  const selectedEvents = events
    .filter((ev) => {
      const d = new Date(ev.startDate);
      return !Number.isNaN(d.getTime()) && isSameDay(d, selectedDay);
    })
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const pool = showAll
    ? events
    : events.filter((ev) => {
        const d = new Date(ev.startDate);
        if (Number.isNaN(d.getTime())) return false;
        const delta = daysUntil(d, now);
        return delta >= 0 && delta <= 6;
      });
  const groups = groupEventsByDay(pool);

  if (loadStatus === "error") {
    return (
      <div className="flex flex-col gap-6">
        <ViewHeader title="Events & Reminders" subtitle="Stay on top of your schedule" />
        <ErrorText message={error ?? "Failed to load events"} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ViewHeader
        title="Events & Reminders"
        subtitle="Stay on top of your schedule"
        actions={
          <Button onClick={openCreate} className="gap-1.5">
            <Plus className="h-4 w-4" strokeWidth={1.75} />
            New Event
          </Button>
        }
      />

      {loadStatus === "idle" || loadStatus === "loading" ? (
        <LoadingCards />
      ) : events.length === 0 ? (
        <div className="sf-card">
          <EmptyState
            icon={CalendarDays}
            title="No events yet"
            hint="Create reminders and events to see them across your 7-day schedule."
            action={<Button variant="outline" onClick={openCreate}>New Event</Button>}
          />
        </div>
      ) : (
        <>
          {/* 7-day strip */}
          <div className="sf-card flex gap-2 overflow-x-auto p-3" role="group" aria-label="Choose a day">
            {weekDays.map(({ date, count }) => {
              const selected = isSameDay(date, selectedDay);
              return (
                <button
                  key={dateKey(date)}
                  type="button"
                  onClick={() => setSelectedDay(date)}
                  aria-pressed={selected}
                  aria-label={`Show events for ${dayBucketLabel(date, now)}`}
                  className={cn(
                    "flex min-w-[60px] flex-1 flex-col items-center gap-1 rounded-lg px-2 py-2.5 transition-colors sf-focus",
                    selected
                      ? "bg-sf-primary text-sf-primary-foreground shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60",
                  )}
                >
                  <span
                    className={cn(
                      "text-xs font-medium",
                      selected ? "text-sf-primary-foreground/80" : "text-slate-400 dark:text-slate-500",
                    )}
                  >
                    {WEEKDAY_SHORT[isoWeekday(date)]}
                  </span>
                  <span className="text-base font-semibold leading-none">{date.getDate()}</span>
                  <span
                    className={cn(
                      "h-1 w-1 rounded-full",
                      count > 0 ? (selected ? "bg-white" : "bg-sf-primary") : "bg-transparent",
                    )}
                    aria-hidden="true"
                  />
                </button>
              );
            })}
          </div>

          {/* Selected day */}
          <SectionCard
            title={dayBucketLabel(selectedDay, now)}
            icon={CalendarDays}
            action={
              selectedEvents.length > 0 ? (
                <span className="text-xs text-slate-400">
                  {selectedEvents.length} event{selectedEvents.length === 1 ? "" : "s"}
                </span>
              ) : undefined
            }
          >
            {selectedEvents.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="Nothing scheduled"
                hint="Pick another day above or create a new event."
              />
            ) : (
              <ul className="flex flex-col gap-1">
                {selectedEvents.map((ev) => (
                  <EventRow
                    key={ev.id}
                    ev={ev}
                    onEdit={() => openEdit(ev)}
                    onDelete={() => void handleDelete(ev)}
                  />
                ))}
              </ul>
            )}
          </SectionCard>

          {/* Next 7 days / all events */}
          <SectionCard
            title={showAll ? "All Events" : "Next 7 Days"}
            icon={Clock}
            action={
              <div className="flex items-center gap-2">
                <label
                  htmlFor="events-show-all"
                  className="cursor-pointer text-sm text-slate-500 dark:text-slate-400"
                >
                  All events
                </label>
                <Switch
                  id="events-show-all"
                  checked={showAll}
                  onCheckedChange={(v) => setShowAll(v === true)}
                  aria-label="Show all events"
                />
              </div>
            }
          >
            {groups.length === 0 ? (
              <EmptyState
                icon={Clock}
                title={showAll ? "No events yet" : "Nothing scheduled this week"}
                hint={showAll ? undefined : "Flip the switch to see events beyond this week."}
              />
            ) : (
              <div className="flex flex-col gap-5">
                {groups.map((g) => (
                  <div key={dateKey(g.date)} className="flex flex-col gap-1">
                    <h4 className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {dayBucketLabel(g.date, now)}
                    </h4>
                    <ul className="flex flex-col gap-1">
                      {g.items.map((ev) => (
                        <EventRow
                          key={ev.id}
                          ev={ev}
                          onEdit={() => openEdit(ev)}
                          onDelete={() => void handleDelete(ev)}
                        />
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </>
      )}

      {/* Event dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Event" : "New Event"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitEvent} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="event-title">Title</Label>
              <Input
                id="event-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Study group meetup"
                maxLength={200}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="event-description">Description</Label>
              <Textarea
                id="event-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={2000}
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="event-start">Starts</Label>
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
                <Label htmlFor="event-end">Ends (optional)</Label>
                <input
                  id="event-end"
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={FIELD_CLASS}
                />
              </div>
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
              <Button type="submit" disabled={busy || !title.trim() || !startDate}>
                {busy ? "Saving…" : editing ? "Save changes" : "Create Event"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

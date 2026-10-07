"use client";

import * as React from "react";
import { Calendar, ChevronLeft, ChevronRight, Grid3x3, Plus, Trash2 } from "lucide-react";
import { useDataStore, mutations, type TimetableClass } from "@/lib/data";
import { useSubjectMap, ViewHeader } from "./shared";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { addDays, parseHHMM, startOfDay, WEEKDAY_SHORT, WEEKDAY_LONG } from "@/lib/date";

// Timetable — S7-C aligns the week grid with the measured reference: a
// grid-cols-8 time table (Time column + 7 day columns with full day-name
// headers + text-lg bold dates), 60px hour rows labelled "7 AM"-style, a
// min-w-[900px] horizontally-scrolling canvas, and a mobile accordion
// (40px date chips + "N classes" rows). My Classes carries today's long
// date in its header. Supersets kept: All Weeks / Week A / Week B select,
// Grid Builder, class editing.

const START_HOUR = 7;
const END_HOUR = 21;
const ROWS = END_HOUR - START_HOUR;
const HOUR_PX = 60; // measured h-[60px] cells

/** Sunday-first header labels for the displayed week. */
const WEEK_COLUMNS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const WEEK_FILTERS = [
  { value: "ALL", label: "All Weeks" },
  { value: "A", label: "Week A" },
  { value: "B", label: "Week B" },
] as const;

const FIELD_CLASS = "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm";

function classTop(cls: TimetableClass): number | null {
  const start = parseHHMM(cls.startTime);
  if (start === null) return null;
  return ((start - START_HOUR * 60) / 60) * HOUR_PX;
}

function classHeight(cls: TimetableClass): number {
  const start = parseHHMM(cls.startTime) ?? 0;
  const end = parseHHMM(cls.endTime) ?? start + 60;
  return Math.max(28, ((Math.max(end - start, 30)) / 60) * HOUR_PX);
}

/** Measured reference time label format: "7 AM" (trimmed hour, no minutes). */
function hourLabel(hour: number): string {
  const h12 = hour % 12 || 12;
  return `${h12} ${hour < 12 ? "AM" : "PM"}`;
}

export function TimetableView() {
  const classes = useDataStore((s) => s.data.timetable);
  const subjects = useDataStore((s) => s.data.subjects);
  const loadAll = useDataStore((s) => s.loadAll);
  const subjectMap = useSubjectMap();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<TimetableClass | null>(null);
  const [gridBuilder, setGridBuilder] = React.useState(false);
  const [weekFilter, setWeekFilter] = React.useState<string>("ALL");
  const [weekTypeDraft, setWeekTypeDraft] = React.useState<string>("ALL");
  /** The Sunday starting the displayed week (Sunday-first grid, measured). */
  const [weekStart, setWeekStart] = React.useState(() => addDays(startOfDay(new Date()), -new Date().getDay()));
  /** S7-C: the mobile accordion's expanded day column (0-6, null = all collapsed). */
  const [openDay, setOpenDay] = React.useState<number | null>(null);

  React.useEffect(() => {
    void loadAll(["timetable", "subjects"]);
  }, [loadAll]);

  // form state
  const [name, setName] = React.useState("");
  const [subjectId, setSubjectId] = React.useState("");
  const [day, setDay] = React.useState(0);
  const [startTime, setStartTime] = React.useState("09:00");
  const [endTime, setEndTime] = React.useState("10:30");
  const [room, setRoom] = React.useState("");
  const [teacher, setTeacher] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  function openCreate() {
    setEditing(null);
    setName("");
    setSubjectId("");
    setDay(0);
    setStartTime("09:00");
    setEndTime("10:30");
    setRoom("");
    setTeacher("");
    setWeekTypeDraft("ALL");
    setDialogOpen(true);
  }

  function openEdit(cls: TimetableClass) {
    setEditing(cls);
    setName(cls.name);
    setSubjectId(cls.subjectId ?? "");
    setDay(cls.dayOfWeek);
    setStartTime(cls.startTime);
    setEndTime(cls.endTime);
    setRoom(cls.room);
    setTeacher(cls.teacher);
    setWeekTypeDraft(cls.weekType ?? "ALL");
    setDialogOpen(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || busy) return;
    if (parseHHMM(startTime) === null || parseHHMM(endTime) === null) {
      toast.error("Enter valid start and end times (HH:MM)");
      return;
    }
    if ((parseHHMM(endTime) ?? 0) <= (parseHHMM(startTime) ?? 0)) {
      toast.error("End time must be after start time");
      return;
    }
    setBusy(true);
    const payload = {
      name: name.trim(),
      subjectId: subjectId || null,
      dayOfWeek: day,
      startTime,
      endTime,
      room: room.trim(),
      teacher: teacher.trim(),
      weekType: weekTypeDraft,
    };
    try {
      if (editing) {
        await mutations.updateTimetableClass(editing.id, payload);
        toast.success("Class updated");
      } else {
        await mutations.createTimetableClass(payload);
        toast.success("Class added");
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save the class");
    } finally {
      setBusy(false);
    }
  }

  const byDay = React.useMemo(() => {
    const map = new Map<number, TimetableClass[]>();
    for (let d = 0; d < 7; d++) map.set(d, []);
    for (const c of classes) {
      if (weekFilter !== "ALL" && (c.weekType ?? "ALL") === (weekFilter === "A" ? "B" : "A")) continue;
      map.get(c.dayOfWeek)?.push(c);
    }
    for (const list of map.values()) list.sort((a, b) => a.startTime.localeCompare(b.startTime));
    return map;
  }, [classes, weekFilter]);

  const weekEnd = addDays(weekStart, 6);
  const monthTitle = weekStart.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const rangeTitle = `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  /** Column i is Sunday-first; classes are stored ISO (0 = Monday) — so
   *  Sunday (col 0) maps to ISO 6. (The previous (col+1)%7 mapping silently
   *  rendered every column's classes two days ahead — fixed in S7-C.) */
  const colToIso = (col: number) => (col + 6) % 7;
  const todayIso = (new Date().getDay() + 6) % 7;

  return (
    <div className="flex flex-col gap-6">
      <ViewHeader
        title="Timetable"
        subtitle="Manage your class schedule"
        icon={Calendar}
        actions={
        <div className="flex items-center gap-3">
          <Select value={weekFilter} onValueChange={setWeekFilter}>
            <SelectTrigger className="w-32" aria-label="Week filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {WEEK_FILTERS.map((f) => (
                <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setGridBuilder((v) => !v)} aria-pressed={gridBuilder}>
            <Grid3x3 className="h-4 w-4" /> Grid Builder
          </Button>
          <Button variant="gradient" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add Class
          </Button>
        </div>
        }
      />

      {/* S7-C — measured week-nav bar: rounded-xl card, p-4, ghost h-9 w-9
          (rounded-md) chevron buttons (S8-E — the reference's are ghost,
          not outline/round), centered month title + week range. */}
      <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-lg"
          onClick={() => setWeekStart((w) => addDays(w, -7))}
          aria-label="Previous week"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2} />
        </Button>
        <div className="text-center">
          <h2 className="text-base font-semibold text-slate-700 dark:text-slate-200">{monthTitle}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{rangeTitle}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-lg"
          onClick={() => setWeekStart((w) => addDays(w, 7))}
          aria-label="Next week"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={2} />
        </Button>
      </div>

      {gridBuilder && (
        <div className="sf-card p-5 text-sm text-slate-600 dark:text-slate-300">
          <p className="font-semibold text-slate-800 dark:text-slate-100">Grid Builder</p>
          <p className="mt-1">
            Click any empty cell to start a class at that time; click a class card to edit it.
          </p>
        </div>
      )}

      {/* S7-C — mobile accordion (measured md:hidden): border-b day rows
          with 40px rounded-xl date chips, day name + "N classes", and an
          expandable class list. */}
      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm md:hidden dark:border-slate-800 dark:bg-slate-900" aria-label="Week grid mobile">
        {WEEK_COLUMNS.map((label, col) => {
          const isoDay = colToIso(col);
          const date = addDays(weekStart, col);
          const dayClasses = byDay.get(isoDay) ?? [];
          return (
            <div key={label} className="border-b border-slate-100 last:border-b-0 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setOpenDay(openDay === col ? null : col)}
                aria-expanded={openDay === col}
                className="flex w-full items-center justify-between p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60"
                style={colToIso(col) === todayIso ? { backgroundColor: "rgb(var(--sf-primary-softest))" } : undefined}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 flex-col items-center justify-center rounded-xl",
                      colToIso(col) === todayIso
                        ? "bg-sf-primary-soft text-sf-primary-strong"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
                    )}
                  >
                    <span className="text-xs font-medium">{WEEKDAY_SHORT[isoDay]}</span>
                    <span className="text-xs font-semibold">{date.getDate()}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                      {WEEKDAY_LONG[isoDay]}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {dayClasses.length} {dayClasses.length === 1 ? "class" : "classes"}
                    </p>
                  </div>
                </div>
                <ChevronRight
                  className={cn("h-4 w-4 text-slate-400 transition-transform", openDay === col && "rotate-90")}
                  strokeWidth={2}
                />
              </button>
              {openDay === col && dayClasses.length > 0 && (
                <div className="flex flex-col gap-2 px-4 pb-4">
                  {dayClasses.map((cls) => (
                    <button
                      key={cls.id}
                      type="button"
                      onClick={() => openEdit(cls)}
                      className="flex items-center gap-3 rounded-lg p-3 text-left text-white"
                      style={{ backgroundColor: cls.color }}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{cls.name}</p>
                        <p className="text-xs opacity-90">{cls.startTime}–{cls.endTime}{cls.room ? ` · ${cls.room}` : ""}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* S7-C — desktop week grid (measured): grid-cols-8 with a Time column
          + full day-name headers (text-sm medium + text-lg bold dates),
          60px hour rows with hairline separators, min-w-[900px]. */}
      <section className="hidden overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm md:block dark:border-slate-800 dark:bg-slate-900" aria-label="Week grid">
        <div className="sf-scroll overflow-x-auto">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-8 border-b border-slate-100 dark:border-slate-800" aria-label="Week header">
              <div className="p-3 text-center text-sm font-medium text-slate-500 dark:text-slate-400">Time</div>
              {WEEK_COLUMNS.map((label, col) => {
                const date = addDays(weekStart, col);
                const isToday = colToIso(col) === todayIso;
                return (
                  <div
                    key={label}
                    data-today-header={isToday || undefined}
                    className="border-l border-slate-100 p-3 text-center dark:border-slate-800"
                    style={isToday ? { backgroundColor: "rgb(var(--sf-primary-softest))" } : undefined}
                  >
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{WEEKDAY_LONG[colToIso(col)]}</p>
                    <p className={cn("text-lg font-bold", isToday ? "text-sf-primary-strong" : "text-slate-700 dark:text-slate-200")}>
                      {date.getDate()}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="relative grid grid-cols-8">
              {/* hour labels — measured: h-[60px] cells, "7 AM" format */}
              <div className="border-r border-slate-100 dark:border-slate-800" aria-label="Hour cells">
                {Array.from({ length: ROWS }).map((_, r) => (
                  <div key={r} className="h-[60px] border-b border-slate-50 px-3 py-1 dark:border-slate-800/60">
                    <span className="text-xs text-slate-400">{hourLabel(START_HOUR + r)}</span>
                  </div>
                ))}
              </div>
              {/* day columns (Sunday-first) — S8-E: the reference's columns
                  are border-slate-100 with a hover:bg-slate-50/50 cursor;
                  the today tint lives on the HEADER cell (bg-violet-50 =
                  --sf-primary-softest), NOT the body. The earlier
                  bg-sf-primary-softest/50 body class was a dead utility
                  (never defined in @theme) and is removed. */}
              {WEEK_COLUMNS.map((label, col) => {
                const isoDay = colToIso(col);
                return (
                <div key={label} className="relative border-l border-slate-100 dark:border-slate-800">
                  {Array.from({ length: ROWS }).map((_, r) => (
                    <button
                      key={r}
                      type="button"
                      aria-label={`Add class ${WEEKDAY_LONG[isoDay]} ${hourLabel(START_HOUR + r)}`}
                      onClick={() => {
                        if (!gridBuilder) return;
                        setEditing(null);
                        setName("");
                        setSubjectId("");
                        setDay(isoDay);
                        setStartTime(`${(START_HOUR + r).toString().padStart(2, "0")}:00`);
                        setEndTime(`${(START_HOUR + r + 1).toString().padStart(2, "0")}:00`);
                        setRoom("");
                        setTeacher("");
                        setWeekTypeDraft("ALL");
                        setDialogOpen(true);
                      }}
                      className="h-[60px] w-full border-b border-slate-50 transition-colors hover:bg-slate-50 dark:border-slate-800/60 dark:hover:bg-slate-800/40"
                    />
                  ))}
                  {/* absolutely-positioned class blocks */}
                  {byDay.get(isoDay)?.map((cls) => {
                    const top = classTop(cls);
                    if (top === null) return null;
                    return (
                      <button
                        key={cls.id}
                        type="button"
                        onClick={() => openEdit(cls)}
                        aria-label={`Edit class "${cls.name}" — ${WEEKDAY_LONG[isoDay]} ${cls.startTime} to ${cls.endTime}`}
                        className="absolute inset-x-1 overflow-hidden rounded-md p-2 text-left text-white shadow-sm transition-transform hover:scale-[1.02]"
                        style={{
                          top,
                          height: classHeight(cls),
                          backgroundColor: cls.color,
                        }}
                      >
                        <p className="truncate text-xs font-semibold leading-tight">{cls.name}</p>
                        <p className="truncate text-[10px] leading-tight opacity-90">
                          {cls.startTime}–{cls.endTime}
                        </p>
                        {cls.room && <p className="truncate text-[10px] leading-tight opacity-75">{cls.room}</p>}
                      </button>
                    );
                  })}
                </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* My Classes — S7-C: measured header (h2 text-lg bold + today's long
          date on the right) inside a p-6 body with a 1/2/3-column card grid. */}
      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <header className="mb-4 flex items-center justify-between" aria-label="My Classes header">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">My Classes</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </header>
        {classes.length === 0 ? (
          <p className="py-8 text-center text-slate-400">
            No subjects added yet. Go to Settings to add subjects.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {classes.map((cls) => {
              const subject = cls.subjectId ? subjectMap.get(cls.subjectId) : undefined;
              const weekBadge =
                cls.weekType === "A" || cls.weekType === "B"
                  ? `Week ${cls.weekType}`
                  : null;
              return (
                <div
                  key={cls.id}
                  className="flex flex-col gap-3 rounded-xl border border-slate-100 p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: cls.color }} aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{cls.name}</p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {WEEKDAY_LONG[cls.dayOfWeek]} · {cls.startTime}–{cls.endTime}
                        {weekBadge ? ` · ${weekBadge}` : ""}
                      </p>
                    </div>
                    <Button variant="ghost" size="iconSm" onClick={() => openEdit(cls)} aria-label={`Edit class "${cls.name}"`}>
                      Edit
                    </Button>
                  </div>
                  {(subject || cls.room || cls.teacher) && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {[subject?.name, cls.room, cls.teacher].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <div className="mt-auto flex justify-end">
                    <Button
                      variant="ghost"
                      size="iconSm"
                      aria-label={`Delete class "${cls.name}"`}
                      onClick={() => {
                        void mutations.deleteTimetableClass(cls.id);
                        toast.success("Class deleted");
                      }}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Class" : "Add Class"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cls-name">Name</Label>
              <Input id="cls-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Calculus II" maxLength={120} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cls-day">Day</Label>
                <select
                  id="cls-day"
                  value={day}
                  onChange={(e) => setDay(Number(e.target.value))}
                  className={FIELD_CLASS}
                >
                  {WEEKDAY_LONG.map((d, i) => (
                    <option key={d} value={i}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cls-subject">Subject</Label>
                <select
                  id="cls-subject"
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className={FIELD_CLASS}
                >
                  <option value="">None</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cls-start">Start time</Label>
                <input
                  id="cls-start"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={FIELD_CLASS}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cls-end">End time</Label>
                <input
                  id="cls-end"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className={FIELD_CLASS}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cls-room">Room</Label>
                <Input id="cls-room" value={room} onChange={(e) => setRoom(e.target.value)} maxLength={80} placeholder="e.g. B-201" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cls-teacher">Teacher</Label>
                <Input id="cls-teacher" value={teacher} onChange={(e) => setTeacher(e.target.value)} maxLength={80} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cls-week">Week</Label>
              <Select value={weekTypeDraft} onValueChange={setWeekTypeDraft}>
                <SelectTrigger id="cls-week">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WEEK_FILTERS.map((f) => (
                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" variant="gradient" disabled={busy || !name.trim()}>
                {busy ? "Saving…" : editing ? "Save changes" : "Add Class"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

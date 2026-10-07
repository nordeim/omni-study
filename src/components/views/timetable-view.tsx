"use client";

import * as React from "react";
import { Calendar, CalendarClock, ChevronLeft, ChevronRight, Grid3x3, Plus, Trash2 } from "lucide-react";
import { useDataStore, mutations, type TimetableClass } from "@/lib/data";
import { useSubjectMap, EmptyState, ViewHeader } from "./shared";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { addDays, parseHHMM, startOfDay, WEEKDAY_SHORT, WEEKDAY_LONG } from "@/lib/date";

// Timetable — weekly class grid + My Classes cards. S5-J aligns the chrome
// with the measured reference: a standalone week-nav bar (36px round
// buttons + month title + week-range), an All Weeks / Week A / Week B
// select (alternating-week timetables), Sunday-first day headers carrying
// the date numbers, and My Classes as a 3-column card grid.

const START_HOUR = 8;
const END_HOUR = 20;
const ROWS = END_HOUR - START_HOUR;

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
  return ((start - START_HOUR * 60) / 60) * 64;
}

function classHeight(cls: TimetableClass): number {
  const start = parseHHMM(cls.startTime) ?? 0;
  const end = parseHHMM(cls.endTime) ?? start + 60;
  return Math.max(28, ((Math.max(end - start, 30)) / 60) * 64);
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
  /** Column i is Sunday-first; classes are stored ISO (0 = Monday). */
  const colToIso = (col: number) => (col + 1) % 7;
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

      {/* S5-J — standalone week-nav bar (measured): rounded-xl card, 36px
          round outline buttons, centered month title + week range. */}
      <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setWeekStart((w) => addDays(w, -7))}
          aria-label="Previous week"
          className="h-9 w-9 rounded-full"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2} />
        </Button>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{monthTitle}</p>
          <p className="text-xs text-slate-400">{rangeTitle}</p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setWeekStart((w) => addDays(w, 7))}
          aria-label="Next week"
          className="h-9 w-9 rounded-full"
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

      {/* Week grid */}
      <section className="sf-card overflow-hidden">
        <div className="sf-scroll overflow-x-auto p-4">
          <div className="min-w-[760px]">
            {/* S5-J — Sunday-first day headers with the displayed week's
                date numbers (measured: "Sunday 4", "Monday 5", …). */}
            <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-1 pb-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
              <span />
              {WEEK_COLUMNS.map((label, col) => {
                const date = addDays(weekStart, col);
                const isToday = colToIso(col) === todayIso;
                return (
                  <span key={label} className={cn(isToday && "text-sf-primary-strong")}>
                    {label} {date.getDate()}
                  </span>
                );
              })}
            </div>
            <div className="relative grid grid-cols-[60px_repeat(7,1fr)] gap-1">
              {/* hour labels */}
              <div className="flex flex-col">
                {Array.from({ length: ROWS }).map((_, r) => (
                  <div key={r} className="flex h-16 items-start justify-end pr-2 pt-0.5 text-[11px] text-slate-400">
                    {((START_HOUR + r) % 12 || 12).toString().padStart(2, "0")}:00 {START_HOUR + r < 12 ? "AM" : "PM"}
                  </div>
                ))}
              </div>
              {/* day columns (Sunday-first) */}
              {WEEK_COLUMNS.map((label, col) => {
                const isoDay = colToIso(col);
                const isToday = isoDay === todayIso;
                return (
                <div key={label} className={cn("relative flex flex-col rounded-lg", isToday && "bg-sf-primary-soft/40")}>
                  {Array.from({ length: ROWS }).map((_, r) => (
                    <button
                      key={r}
                      type="button"
                      aria-label={`Add class ${WEEKDAY_LONG[isoDay]} ${(START_HOUR + r).toString().padStart(2, "0")}:00`}
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
                      className="h-16 rounded-md border border-slate-100 transition-colors hover:border-slate-200 dark:border-slate-800/60 dark:hover:border-slate-700"
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
                        className="absolute left-1 right-1 overflow-hidden rounded-md p-2 text-left text-white shadow-sm transition-transform hover:scale-[1.02]"
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

      {/* My Classes — S5-J: measured as a 1/2/3-column CARD grid (the
          clone previously rendered a divided list). */}
      <section className="sf-card overflow-hidden">
        <header className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <h2 className="text-[18px] font-semibold text-slate-800 dark:text-slate-100">My Classes</h2>
        </header>
        {classes.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="No classes yet"
            hint="Add your first class with the Add Class button."
            action={<Button onClick={openCreate} variant="gradient" className="sf-gradient-shadow-lg">Add Class</Button>}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2 lg:grid-cols-3">
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

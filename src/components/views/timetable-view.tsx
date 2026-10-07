"use client";

import * as React from "react";
import { CalendarClock, ChevronLeft, ChevronRight, Grid3x3, Plus, Trash2 } from "lucide-react";
import { useDataStore, mutations, type TimetableClass } from "@/lib/data";
import { useSubjectMap, EmptyState } from "./shared";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { parseHHMM, WEEKDAY_SHORT, WEEKDAY_LONG } from "@/lib/date";

// Timetable — weekly class grid (Monday-first) + My Classes list. The
// reference also has a month header; the grid is the primary surface.

const START_HOUR = 8;
const END_HOUR = 20;
const ROWS = END_HOUR - START_HOUR;

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
      map.get(c.dayOfWeek)?.push(c);
    }
    for (const list of map.values()) list.sort((a, b) => a.startTime.localeCompare(b.startTime));
    return map;
  }, [classes]);

  const today = (new Date().getDay() + 6) % 7;
  const [cursor, setCursor] = React.useState(() => new Date());

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Timetable</h1>
          <p className="mt-1 text-sm text-slate-500">Your weekly class schedule</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setGridBuilder((v) => !v)} aria-pressed={gridBuilder}>
            <Grid3x3 className="h-4 w-4" /> Grid Builder
          </Button>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add Class
          </Button>
        </div>
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
        <header className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <h2 className="text-[18px] font-semibold text-slate-800 dark:text-slate-100">
            {cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </h2>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="iconSm" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} aria-label="Previous month">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="iconSm" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} aria-label="Next month">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </header>
        <div className="sf-scroll overflow-x-auto p-4">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-1 pb-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
              <span />
              {WEEKDAY_SHORT.map((d, i) => (
                <span key={d} className={cn(i === today && "text-sf-primary-strong")}>
                  {d}
                </span>
              ))}
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
              {/* day columns */}
              {WEEKDAY_SHORT.map((_, d) => (
                <div key={d} className={cn("relative flex flex-col rounded-lg", d === today && "bg-sf-primary-soft/40")}>
                  {Array.from({ length: ROWS }).map((_, r) => (
                    <button
                      key={r}
                      type="button"
                      aria-label={`Add class ${WEEKDAY_LONG[d]} ${(START_HOUR + r).toString().padStart(2, "0")}:00`}
                      onClick={() => {
                        if (!gridBuilder) return;
                        setEditing(null);
                        setName("");
                        setSubjectId("");
                        setDay(d);
                        setStartTime(`${(START_HOUR + r).toString().padStart(2, "0")}:00`);
                        setEndTime(`${(START_HOUR + r + 1).toString().padStart(2, "0")}:00`);
                        setRoom("");
                        setTeacher("");
                        setDialogOpen(true);
                      }}
                      className="h-16 rounded-md border border-slate-100 transition-colors hover:border-slate-200 dark:border-slate-800/60 dark:hover:border-slate-700"
                    />
                  ))}
                  {/* absolutely-positioned class blocks */}
                  {byDay.get(d)?.map((cls) => {
                    const top = classTop(cls);
                    if (top === null) return null;
                    return (
                      <button
                        key={cls.id}
                        type="button"
                        onClick={() => openEdit(cls)}
                        aria-label={`Edit class "${cls.name}" — ${WEEKDAY_LONG[d]} ${cls.startTime} to ${cls.endTime}`}
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
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* My Classes */}
      <section className="sf-card overflow-hidden">
        <header className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <h2 className="text-[18px] font-semibold text-slate-800 dark:text-slate-100">My Classes</h2>
        </header>
        {classes.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="No classes yet"
            hint="Add your first class with the Add Class button."
            action={<Button onClick={openCreate} variant="outline">Add Class</Button>}
          />
        ) : (
          <ul className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
            {classes.map((cls) => {
              const subject = cls.subjectId ? subjectMap.get(cls.subjectId) : undefined;
              return (
                <li key={cls.id} className="flex items-center gap-4 px-6 py-3.5">
                  <span className="h-9 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: cls.color }} />
                  <div className="w-24 shrink-0 text-sm font-medium text-slate-500">
                    {WEEKDAY_LONG[cls.dayOfWeek]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{cls.name}</p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {cls.startTime}–{cls.endTime}
                      {subject ? ` · ${subject.name}` : ""}
                      {cls.room ? ` · ${cls.room}` : ""}
                      {cls.teacher ? ` · ${cls.teacher}` : ""}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(cls)}>Edit</Button>
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
                </li>
              );
            })}
          </ul>
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
                  className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm"
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
                  className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm"
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
                  className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm"
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
                  className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm"
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
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={busy || !name.trim()}>
                {busy ? "Saving…" : editing ? "Save changes" : "Add Class"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

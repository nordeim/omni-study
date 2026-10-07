"use client";

import * as React from "react";
import { CalendarClock, MapPin, Plus } from "lucide-react";
import { useDataStore, mutations, type Exam } from "@/lib/data";
import { useSubjectMap, ViewHeader, EmptyState, LoadingCards, ErrorText, SubjectChip } from "./shared";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/toast";
import { daysUntil } from "@/lib/date";

type ExamFilter = "upcoming" | "past" | "all";

const FIELD_CLASS = "flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm";

/** ISO datetime → "YYYY-MM-DD" in the user's local timezone (date-input safe). */
function toDateInputValue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** ISO datetime → "HH:MM" in the user's local timezone (time-input safe). */
function toTimeInputValue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "09:00";
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function ExamWhenBadge({ exam, now }: { exam: Exam; now: Date }) {
  if (exam.status === "done") {
    return <Badge variant="success">Completed</Badge>;
  }
  const days = daysUntil(new Date(exam.date), now);
  if (days < 0) {
    return (
      <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        Past
      </span>
    );
  }
  return (
    <span className="shrink-0 rounded-md bg-sf-primary-soft px-2 py-1 text-xs font-semibold text-sf-primary-strong dark:bg-sf-primary-soft-dark dark:text-sf-primary-strong-dark">
      {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days} days`}
    </span>
  );
}

export function ExamsView() {
  const exams = useDataStore((s) => s.data.exams);
  const subjects = useDataStore((s) => s.data.subjects);
  const loadStatus = useDataStore((s) => s.status.exams);
  const error = useDataStore((s) => s.error);
  const loadAll = useDataStore((s) => s.loadAll);
  const subjectMap = useSubjectMap();

  const [search, setSearch] = React.useState("");
  const [examFilter, setExamFilter] = React.useState<ExamFilter>("upcoming");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Exam | null>(null);

  React.useEffect(() => {
    void loadAll(["exams", "subjects"]);
  }, [loadAll]);

  // ---- Form state ----
  const [title, setTitle] = React.useState("");
  const [subjectId, setSubjectId] = React.useState("");
  const [date, setDate] = React.useState("");
  const [time, setTime] = React.useState("09:00");
  const [location, setLocation] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  function openCreate() {
    setEditing(null);
    setTitle("");
    setSubjectId("");
    setDate("");
    setTime("09:00");
    setLocation("");
    setNotes("");
    setDialogOpen(true);
  }

  function openEdit(exam: Exam) {
    setEditing(exam);
    setTitle(exam.title);
    setSubjectId(exam.subjectId ?? "");
    setDate(toDateInputValue(exam.date));
    setTime(toTimeInputValue(exam.date));
    setLocation(exam.location ?? "");
    setNotes(exam.notes ?? "");
    setDialogOpen(true);
  }

  async function submitExam(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !date || busy) return;
    setBusy(true);
    const when = new Date(`${date}T${time || "09:00"}`);
    const payload = {
      title: title.trim(),
      subjectId: subjectId || null,
      date: when.toISOString(),
      location: location.trim(),
      notes: notes.trim(),
    };
    try {
      if (editing) {
        await mutations.updateExam(editing.id, payload);
        toast.success("Exam updated");
      } else {
        await mutations.createExam({ ...payload, status: "upcoming" });
        toast.success("Exam created");
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save the exam");
    } finally {
      setBusy(false);
    }
  }

  async function toggleDone(exam: Exam) {
    try {
      await mutations.updateExam(exam.id, { status: exam.status === "done" ? "upcoming" : "done" });
      toast.success(exam.status === "done" ? "Exam marked as upcoming" : "Exam marked as done");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update the exam");
    }
  }

  async function handleDelete(exam: Exam) {
    try {
      await mutations.deleteExam(exam.id);
      toast.success("Exam deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete the exam");
    }
  }

  // ---- Filtering ----
  const now = new Date();
  const visible = exams.filter((exam) => {
    if (search && !exam.title.toLowerCase().includes(search.toLowerCase())) return false;
    const upcoming = exam.status === "upcoming" && daysUntil(new Date(exam.date), now) >= 0;
    if (examFilter === "upcoming") return upcoming;
    if (examFilter === "past") return !upcoming;
    return true;
  });
  const sorted = [...visible].sort((a, b) => {
    const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
    return examFilter === "past" ? -diff : diff;
  });

  if (loadStatus === "error") {
    return (
      <div className="flex flex-col gap-6">
        <ViewHeader title="Exams" subtitle="Stay on top of your exam schedule" />
        <ErrorText message={error ?? "Failed to load exams"} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ViewHeader
        title="Exams"
        subtitle="Stay on top of your exam schedule"
        actions={
          <Button onClick={openCreate} className="gap-1.5">
            <Plus className="h-4 w-4" strokeWidth={1.75} />
            Add Exam
          </Button>
        }
      />

      {loadStatus === "idle" || loadStatus === "loading" ? (
        <LoadingCards />
      ) : (
        <>
          {/* Search + filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="min-w-[180px] flex-1">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search exams..."
                aria-label="Search exams"
                className="h-9"
              />
            </div>
            <Select value={examFilter} onValueChange={(v) => setExamFilter(v as ExamFilter)}>
              <SelectTrigger className="w-[130px]" aria-label="Filter exams">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="past">Past</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* List */}
          {sorted.length === 0 ? (
            <div className="sf-card">
              <EmptyState
                icon={CalendarClock}
                title={exams.length === 0 ? "No exams found" : "No matching exams"}
                hint={
                  exams.length === 0
                    ? "Add your first exam to start preparing in good time."
                    : "Try adjusting the search or filter."
                }
                action={<Button variant="outline" onClick={openCreate}>Add Exam</Button>}
              />
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {sorted.map((exam) => {
                const subject = exam.subjectId ? subjectMap.get(exam.subjectId) : undefined;
                const when = new Date(exam.date);
                const dateLabel = when.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                });
                const timeLabel = when.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
                return (
                  <li key={exam.id} className="sf-card flex flex-col gap-3 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => openEdit(exam)}
                          className="text-left"
                          aria-label={`Edit exam "${exam.title}"`}
                        >
                          <p className="truncate text-[15px] font-semibold text-slate-800 dark:text-slate-100">
                            {exam.title}
                          </p>
                        </button>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <SubjectChip subject={subject} />
                          <span className="text-xs text-slate-400">
                            {dateLabel} · {timeLabel}
                          </span>
                        </div>
                        {exam.location && (
                          <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-400">
                            <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
                            {exam.location}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <ExamWhenBadge exam={exam} now={now} />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="iconSm" aria-label={`Exam menu for "${exam.title}"`}>
                              ⋯
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(exam)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => void toggleDone(exam)}>
                              {exam.status === "done" ? "Mark as Upcoming" : "Mark as Done"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => void handleDelete(exam)}
                              className="text-red-600 focus:text-red-600"
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {exam.notes && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{exam.notes}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

      {/* Exam dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Exam" : "New Exam"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitExam} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="exam-title">Title</Label>
              <Input
                id="exam-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Calculus Midterm"
                maxLength={200}
                required
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="exam-subject">Subject</Label>
                <select
                  id="exam-subject"
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
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="exam-date">Date</Label>
                <input
                  id="exam-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className={FIELD_CLASS}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="exam-time">Start time</Label>
                <input
                  id="exam-time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className={FIELD_CLASS}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="exam-location">Location</Label>
                <Input
                  id="exam-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Hall B"
                  maxLength={200}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="exam-notes">Notes</Label>
              <Textarea
                id="exam-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                maxLength={2000}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy || !title.trim() || !date}>
                {busy ? "Saving…" : editing ? "Save changes" : "Create Exam"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

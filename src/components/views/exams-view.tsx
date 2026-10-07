"use client";

import * as React from "react";
import { Calendar, CalendarClock, Clock, GraduationCap, MoreHorizontal, Plus, Search } from "lucide-react";
import { useDataStore, mutations, type Exam } from "@/lib/data";
import { useSubjectMap, ViewHeader, EmptyState, LoadingCards, ErrorText } from "./shared";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/toast";
import { daysUntil } from "@/lib/date";
import { cn } from "@/lib/utils";

type ExamFilter = "upcoming" | "past" | "all";

const FIELD_CLASS = "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm";

// S6-F — the reference's Type combobox (measured): Test/Quiz/Midterm/Final/
// Oral/Practical.
const EXAM_TYPES = ["test", "quiz", "midterm", "final", "oral", "practical"] as const;

const DEFAULT_SUBJECT_COLOR = "#94a3b8"; // slate-400 — the reference's no-subject strip color (measured).

function parseTopics(json: string): string[] {
  try {
    const parsed: unknown = JSON.parse(json || "[]");
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

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

// S6-F — the reference's urgency badge (measured): text-xs font-semibold
// px-2.5 py-1 rounded-full bg-amber-100 text-amber-600 ("2 days"); red when
// the exam is today/past.
function ExamWhenBadge({ exam, now }: { exam: Exam; now: Date }) {
  if (exam.status === "done") {
    return (
      <span className="inline-block rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        Completed
      </span>
    );
  }
  const days = daysUntil(new Date(exam.date), now);
  const label = days < 0 ? "Past" : days === 0 ? "Today" : days === 1 ? "1 day" : `${days} days`;
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2.5 py-1 text-xs font-semibold",
        days <= 0
          ? "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400"
          : "bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
      )}
    >
      {label}
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

  // ---- Form state (S6-F — the reference's dialog field set, measured) ----
  const [title, setTitle] = React.useState("");
  const [subjectId, setSubjectId] = React.useState("");
  const [type, setType] = React.useState<Exam["type"]>("test");
  const [date, setDate] = React.useState("");
  const [time, setTime] = React.useState("09:00");
  const [duration, setDuration] = React.useState(60);
  const [location, setLocation] = React.useState("");
  const [topics, setTopics] = React.useState<string[]>([]);
  const [topicDraft, setTopicDraft] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  function openCreate() {
    setEditing(null);
    setTitle("");
    setSubjectId("");
    setType("test");
    setDate("");
    setTime("09:00");
    setDuration(60);
    setLocation("");
    setTopics([]);
    setTopicDraft("");
    setNotes("");
    setDialogOpen(true);
  }

  function openEdit(exam: Exam) {
    setEditing(exam);
    setTitle(exam.title);
    setSubjectId(exam.subjectId ?? "");
    setType(exam.type);
    setDate(toDateInputValue(exam.date));
    setTime(toTimeInputValue(exam.date));
    setDuration(exam.duration);
    setLocation(exam.location ?? "");
    setTopics(parseTopics(exam.topics));
    setTopicDraft("");
    setNotes(exam.notes ?? "");
    setDialogOpen(true);
  }

  function addTopic() {
    const text = topicDraft.trim();
    if (!text) return;
    setTopics((prev) => [...prev, text]);
    setTopicDraft("");
  }

  function removeTopic(topic: string) {
    setTopics((prev) => prev.filter((t) => t !== topic));
  }

  async function submitExam(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !date || busy) return;
    setBusy(true);
    const when = new Date(`${date}T${time || "09:00"}`);
    const payload = {
      title: title.trim(),
      subjectId: subjectId || null,
      type,
      date: when.toISOString(),
      duration,
      location: location.trim(),
      topics: JSON.stringify(topics),
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
  // Reference subtitle (measured): "N upcoming · N this week" — dynamic
  // counts of upcoming exams and those within the next 7 days.
  const upcomingCount = exams.filter(
    (e) => e.status === "upcoming" && daysUntil(new Date(e.date), now) >= 0,
  ).length;
  const thisWeekCount = exams.filter(
    (e) => e.status === "upcoming" && daysUntil(new Date(e.date), now) >= 0 && daysUntil(new Date(e.date), now) <= 7,
  ).length;
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
        <ViewHeader
          title="Exams"
          subtitle={`${upcomingCount} upcoming · ${thisWeekCount} this week`}
          icon={GraduationCap}
        />
        <ErrorText message={error ?? "Failed to load exams"} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ViewHeader
        title="Exams"
        subtitle={`${upcomingCount} upcoming · ${thisWeekCount} this week`}
        icon={GraduationCap}
        actions={
          <Button onClick={openCreate} variant="gradient" className="gap-1.5">
            <Plus className="h-4 w-4" strokeWidth={1.75} />
            Add Exam
          </Button>
        }
      />

      {loadStatus === "idle" || loadStatus === "loading" ? (
        <LoadingCards />
      ) : (
        <>
          {/* Search + filter — S8-P: the reference's search field carries
              an inline search icon; the filter row is flex-col → md:flex-row. */}
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative min-w-[180px] flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                strokeWidth={2}
                aria-hidden="true"
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search exams..."
                aria-label="Search exams"
                className="h-9 pl-9"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
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
          </div>

          {/* S6-F — card GRID (measured): grid md:grid-cols-2 lg:grid-cols-3
              gap-4 of rounded-2xl overflow-hidden cards with an h-2 subject
              color strip, amber urgency badge, h3 text-lg title, icon detail
              rows, and a border-t type footer. */}
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
                action={<Button variant="gradient" className="sf-gradient-shadow-lg" onClick={openCreate}>Add Exam</Button>}
              />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" aria-label="Exam cards">
              {sorted.map((exam) => {
                const subject = exam.subjectId ? subjectMap.get(exam.subjectId) : undefined;
                const when = new Date(exam.date);
                const dateLabel = when.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
                const timeLabel = when.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
                const topics = parseTopics(exam.topics);
                return (
                  <div
                    key={exam.id}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:shadow-lg dark:border-slate-700 dark:bg-slate-900"
                  >
                    {/* Subject color strip (h-2, inline subject color — measured). */}
                    <div
                      aria-label="Subject color strip"
                      className="h-2"
                      style={{ backgroundColor: subject?.color ?? DEFAULT_SUBJECT_COLOR }}
                    />
                    <div className="p-5">
                      <div className="mb-3 flex items-start justify-between">
                        <div>
                          <ExamWhenBadge exam={exam} now={now} />
                          <h3 className="mb-2 mt-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
                            <button
                              type="button"
                              onClick={() => openEdit(exam)}
                              className="text-left sf-focus"
                              aria-label={`Edit exam "${exam.title}"`}
                            >
                              {exam.title}
                            </button>
                          </h3>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              aria-label={`Exam menu for "${exam.title}"`}
                              className="sf-focus inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 opacity-0 transition-opacity hover:bg-slate-100 hover:text-slate-600 group-hover:opacity-100 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                            >
                              <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                            </button>
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

                      <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                        {/* S8-P (measured): the reference's exam card shows ONLY
                            the date + time·duration rows — no location row
                            (location stays an edit-dialog superset field). */}
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-400" aria-hidden="true" />
                          {dateLabel}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-slate-400" aria-hidden="true" />
                          {timeLabel}
                          <span className="text-slate-400">· {exam.duration} min</span>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                        {/* S8-P (measured): footer carries the type pill only
                            (topics count stays a dialog-level superset). */}
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs capitalize text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                          {exam.type}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Exam dialog (S6-F — the reference's field set, measured). */}
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
                placeholder="e.g., Math Final Exam"
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
                  <option value="">Select</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="exam-type">Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as Exam["type"])}>
                  <SelectTrigger id="exam-type" aria-label="Type" className={FIELD_CLASS}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXAM_TYPES.map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="exam-duration">Duration (minutes)</Label>
                <input
                  id="exam-duration"
                  type="number"
                  min={5}
                  max={600}
                  step={5}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value) || 60)}
                  className={FIELD_CLASS}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="exam-location">Location</Label>
                <Input
                  id="exam-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Room 101, Hall A"
                  maxLength={200}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="exam-topic">Topics</Label>
              <div className="flex gap-2">
                <Input
                  id="exam-topic"
                  value={topicDraft}
                  onChange={(e) => setTopicDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTopic();
                    }
                  }}
                  placeholder="Add a topic..."
                  maxLength={120}
                />
                <Button type="button" variant="outline" onClick={addTopic} aria-label="Add topic" className="px-3">
                  +
                </Button>
              </div>
              {topics.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {topics.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() => removeTopic(t)}
                        aria-label={`Remove topic ${t}`}
                        className="text-slate-400 transition-colors hover:text-red-500 sf-focus"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="exam-notes">Notes</Label>
              <Textarea
                id="exam-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                maxLength={2000}
                placeholder="Notes, resources, tips..."
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="gradient" disabled={busy || !title.trim() || !date}>
                {busy ? "Saving…" : editing ? "Save changes" : "Add Exam"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

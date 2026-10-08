"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { BookOpen, Flag, MoreHorizontal, Plus, Search } from "lucide-react";
import { useDataStore, mutations, type Assignment } from "@/lib/data";
import { useSubjectMap, ViewHeader, EmptyState, LoadingCards, ErrorText } from "./shared";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/toast";
import { daysUntil } from "@/lib/date";
import { cn } from "@/lib/utils";

type StatusFilter = "active" | "submitted" | "graded" | "all";

const FIELD_CLASS = "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm";

// S6-E — the reference's combobox option sets (measured live): Type =
// Homework/Essay/Project/Reading/Worksheet/Presentation/Study/Other;
// Priority = Low/Medium/High/Urgent.
const TYPE_OPTIONS = [
  "homework",
  "essay",
  "project",
  "reading",
  "worksheet",
  "presentation",
  "study",
  "other",
] as const;

const PRIORITY_OPTIONS = ["low", "medium", "high", "urgent"] as const;

// S6-E — the reference's priority pill (measured): a BORDERED pill with a
// flag icon; yellow-50 bg / yellow-200 border / yellow-500 text at Medium.
const PRIORITY_PILL: Record<Assignment["priority"], string> = {
  low: "border-sky-200 bg-sky-50 text-sky-500 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300",
  medium:
    "border-yellow-200 bg-yellow-50 text-yellow-500 dark:border-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300",
  high: "border-red-200 bg-red-50 text-red-500 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300",
  urgent: "border-red-300 bg-red-100 text-red-600 dark:border-red-700 dark:bg-red-950/60 dark:text-red-400",
};

/** ISO string → "YYYY-MM-DD" in the user's local timezone (date-input safe). */
function toDateInputValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

// S6-E — the reference's due-in pill (measured on a real assignment):
// `text-xs font-medium px-2 py-0.5 rounded-full text-blue-600 bg-blue-50`
// ("2 days"); red when overdue/today (urgency ladder).
function DueInPill({ dueDate, now }: { dueDate: string; now: Date }) {
  const days = daysUntil(new Date(dueDate), now);
  const label = days < 0 ? "Overdue" : days === 0 ? "Today" : days === 1 ? "1 day" : `${days} days`;
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-xs font-medium",
        days <= 0
          ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
          : "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
      )}
    >
      {label}
    </span>
  );
}

// S6-E — the reference's progress slider (measured): Radix slider with an
// h-2 slate-200 track, a violet→indigo GRADIENT fill (sRGB-exact inline
// per trap 5), a 20px white thumb with a 2px violet-500 border, and a
// violet-600 semibold % label. Dragging PATCHes progress (superset: the
// value persists server-side).
function ProgressSlider({ assignment }: { assignment: Assignment }) {
  const [value, setValue] = React.useState(assignment.progress);
  const [lastId, setLastId] = React.useState(assignment.id);
  // React-documented "adjust state during render" sync (lint forbids the
  // setState-in-effect form): remounts/row reordering reset the slider.
  if (lastId !== assignment.id) {
    setLastId(assignment.id);
    setValue(assignment.progress);
  }

  function commit(next: number[]) {
    setValue(next[0] ?? 0);
    void mutations.updateAssignment(assignment.id, { progress: next[0] ?? 0 });
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <SliderPrimitive.Root
          className="relative flex w-full touch-none select-none items-center"
          value={[value]}
          min={0}
          max={100}
          step={1}
          onValueChange={(v) => setValue(v[0] ?? 0)}
          onValueCommit={commit}
          aria-label={`Progress for ${assignment.title}`}
        >
          <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <SliderPrimitive.Range
              data-slot="slider-fill"
              className="sf-slider-fill absolute h-full rounded-full"
              style={{ backgroundImage: "linear-gradient(to right, rgb(139, 92, 246), rgb(79, 70, 229))" }}
            />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb
            className="block h-5 w-5 rounded-full border-2 border-violet-500 bg-white shadow-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:border-violet-400 dark:bg-slate-100"
            aria-label="Assignment progress percent"
          />
        </SliderPrimitive.Root>
      </div>
      <span className="min-w-[45px] text-sm font-semibold text-violet-600 dark:text-violet-400">{value}%</span>
    </div>
  );
}

export function AssignmentsView() {
  const assignments = useDataStore((s) => s.data.assignments);
  const subjects = useDataStore((s) => s.data.subjects);
  const loadStatus = useDataStore((s) => s.status.assignments);
  const error = useDataStore((s) => s.error);
  const loadAll = useDataStore((s) => s.loadAll);
  const subjectMap = useSubjectMap();

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("active");
  const [subjectFilter, setSubjectFilter] = React.useState("all");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Assignment | null>(null);

  React.useEffect(() => {
    void loadAll(["assignments", "subjects"]);
  }, [loadAll]);

  // ---- Form state ----
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [subjectId, setSubjectId] = React.useState("");
  const [dueDate, setDueDate] = React.useState("");
  const [priority, setPriority] = React.useState<Assignment["priority"]>("medium");
  const [type, setType] = React.useState<Assignment["type"]>("homework");
  const [status, setStatus] = React.useState<Assignment["status"]>("active");
  const [busy, setBusy] = React.useState(false);

  function openCreate() {
    setEditing(null);
    setTitle("");
    setDescription("");
    setSubjectId("");
    setDueDate("");
    setPriority("medium");
    setType("homework");
    setStatus("active");
    setDialogOpen(true);
  }

  function openEdit(a: Assignment) {
    setEditing(a);
    setTitle(a.title);
    setDescription(a.description ?? "");
    setSubjectId(a.subjectId ?? "");
    setDueDate(toDateInputValue(a.dueDate));
    setPriority(a.priority);
    setType(a.type);
    setStatus(a.status);
    setDialogOpen(true);
  }

  async function submitAssignment(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || busy) return;
    setBusy(true);
    const payload = {
      title: title.trim(),
      description: description.trim(),
      subjectId: subjectId || null,
      dueDate: dueDate || null,
      priority,
      type,
      status,
    };
    try {
      if (editing) {
        await mutations.updateAssignment(editing.id, payload);
        toast.success("Assignment updated");
      } else {
        await mutations.createAssignment(payload);
        toast.success("Assignment created");
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save the assignment");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(a: Assignment) {
    try {
      await mutations.deleteAssignment(a.id);
      toast.success("Assignment deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete the assignment");
    }
  }

  // ---- Filtering ----
  const now = new Date();
  const visible = assignments.filter((a) => {
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (subjectFilter !== "all" && (a.subjectId ?? "") !== subjectFilter) return false;
    if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const sorted = [...visible].sort((a, b) => {
    const activeDiff = (a.status === "active" ? 0 : 1) - (b.status === "active" ? 0 : 1);
    if (activeDiff !== 0) return activeDiff;
    return (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999");
  });

  if (loadStatus === "error") {
    return (
      <div className="flex flex-col gap-6">
        <ViewHeader title="Assignments" subtitle="Track your homework and projects" icon={BookOpen} />
        <ErrorText message={error ?? "Failed to load assignments"} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ViewHeader
        title="Assignments"
        subtitle="Track your homework and projects"
        icon={BookOpen}
        actions={
          <Button onClick={openCreate} variant="gradient" className="gap-1.5">
            <Plus className="h-4 w-4" strokeWidth={1.75} />
            Add Assignment
          </Button>
        }
      />

      {loadStatus === "idle" || loadStatus === "loading" ? (
        <LoadingCards />
      ) : (
        <>
          {/* Search + filters — S8-P: the reference's search field carries
              an inline search icon (left-3, w-4 h-4, input pl-9). */}
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
                placeholder="Search assignments..."
                aria-label="Search assignments"
                className="h-9 pl-9"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
              <SelectTrigger className="w-[130px]" aria-label="Filter assignments by status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="graded">Graded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-[150px]" aria-label="Filter assignments by subject">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            </div>
          </div>

          {/* List — S6-E card rows (measured). */}
          {sorted.length === 0 ? (
            <div className="sf-card">
              <EmptyState
                icon={BookOpen}
                title={assignments.length === 0 ? "No assignments yet" : "No matching assignments"}
                hint={
                  assignments.length === 0
                    ? "Add your first assignment to start tracking coursework."
                    : "Try adjusting the search or filters."
                }
                action={<Button variant="gradient" className="sf-gradient-shadow-lg" onClick={openCreate}>Add Assignment</Button>}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-4" aria-label="Assignment rows">
              {sorted.map((a) => {
                return (
                  <div
                    key={a.id}
                    className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-4 transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
                  >
                    <div className="flex items-start gap-4">
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={a.status !== "active"}
                        aria-label={`Mark "${a.title}" ${a.status !== "active" ? "active" : "submitted"}`}
                        onClick={() =>
                          void mutations.updateAssignment(a.id, {
                            status: a.status === "active" ? "submitted" : "active",
                          })
                        }
                        className={cn(
                          "mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all hover:scale-110 hover:border-violet-400 sf-focus",
                          a.status !== "active"
                            ? "border-transparent bg-violet-500 text-white"
                            : "border-slate-300 dark:border-slate-600",
                        )}
                      >
                        {a.status !== "active" && (
                          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-slate-800 dark:text-slate-100">{a.title}</h3>
                          {a.dueDate && <DueInPill dueDate={a.dueDate} now={now} />}
                        </div>
                        <div className="mb-3 flex flex-wrap items-center gap-3">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium capitalize",
                              PRIORITY_PILL[a.priority],
                            )}
                          >
                            <Flag className="h-3 w-3" aria-hidden="true" />
                            {a.priority}
                          </span>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs capitalize text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                            {a.type}
                          </span>
                          {/* S9-I (measured): the reference's assignment rows
                              render NO subject-name span and NO description
                              paragraph — subject/description stay in the edit
                              dialog. */}
                        </div>
                        <ProgressSlider assignment={a} />
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            aria-label={`Assignment menu for "${a.title}"`}
                            className="sf-focus inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 opacity-0 transition-opacity hover:bg-slate-100 hover:text-slate-600 group-hover:opacity-100 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                          >
                            <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(a)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => void handleDelete(a)}
                            className="text-red-600 focus:text-red-600"
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Assignment dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Assignment" : "New Assignment"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitAssignment} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="assignment-title">Title</Label>
              <Input
                id="assignment-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Assignment title..."
                maxLength={200}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="assignment-description">Description</Label>
              <Textarea
                id="assignment-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={2000}
                placeholder="Add details..."
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="assignment-subject">Subject</Label>
                <select
                  id="assignment-subject"
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
                <Label htmlFor="assignment-due">Due date</Label>
                <input
                  id="assignment-due"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={FIELD_CLASS}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="assignment-type">Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as Assignment["type"])}>
                  <SelectTrigger id="assignment-type" aria-label="Type" className={FIELD_CLASS}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPE_OPTIONS.map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="assignment-priority">Priority</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as Assignment["priority"])}>
                  <SelectTrigger id="assignment-priority" aria-label="Priority" className={FIELD_CLASS}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((p) => (
                      <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="assignment-status">Status</Label>
              <select
                id="assignment-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as Assignment["status"])}
                className={FIELD_CLASS}
              >
                <option value="active">Active</option>
                <option value="submitted">Submitted</option>
                <option value="graded">Graded</option>
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="gradient" disabled={busy || !title.trim()}>
                {busy ? "Saving…" : editing ? "Save changes" : "Add Assignment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

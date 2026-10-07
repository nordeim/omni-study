"use client";

import * as React from "react";
import { BookOpen, Plus } from "lucide-react";
import { useDataStore, mutations, type Assignment } from "@/lib/data";
import { useSubjectMap, ViewHeader, EmptyState, LoadingCards, ErrorText, SubjectChip } from "./shared";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/toast";
import { daysUntil } from "@/lib/date";
import { cn } from "@/lib/utils";

type StatusFilter = "active" | "submitted" | "graded" | "all";

const FIELD_CLASS = "flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm";

const PRIORITY_BADGE: Record<Assignment["priority"], { label: string; variant: "destructive" | "warning" | "secondary" }> = {
  high: { label: "High", variant: "destructive" },
  medium: { label: "Medium", variant: "warning" },
  low: { label: "Low", variant: "secondary" },
};

const STATUS_BADGE: Record<Assignment["status"], { label: string; variant: "default" | "info" | "success" }> = {
  active: { label: "Active", variant: "default" },
  submitted: { label: "Submitted", variant: "info" },
  graded: { label: "Graded", variant: "success" },
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

function DueBadge({ dueDate, now }: { dueDate: string; now: Date }) {
  const days = daysUntil(new Date(dueDate), now);
  const label =
    days < 0 ? "Overdue" : days === 0 ? "Due today" : days === 1 ? "1 day left" : `${days} days left`;
  return (
    <span
      className={cn(
        "shrink-0 rounded-md px-2 py-1 text-xs font-semibold",
        days <= 0
          ? "bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400"
          : days <= 3
            ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
      )}
    >
      {label}
    </span>
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
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
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
  const [status, setStatus] = React.useState<Assignment["status"]>("active");
  const [busy, setBusy] = React.useState(false);

  function openCreate() {
    setEditing(null);
    setTitle("");
    setDescription("");
    setSubjectId("");
    setDueDate("");
    setPriority("medium");
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
          {/* Search + filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="min-w-[180px] flex-1">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search assignments..."
                aria-label="Search assignments"
                className="h-9"
              />
            </div>
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

          {/* List */}
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
            <ul className="flex flex-col gap-4">
              {sorted.map((a) => {
                const subject = a.subjectId ? subjectMap.get(a.subjectId) : undefined;
                return (
                  <li key={a.id} className="sf-card flex flex-col gap-3 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => openEdit(a)}
                        className="min-w-0 text-left"
                        aria-label={`Edit assignment "${a.title}"`}
                      >
                        <p className="truncate text-[15px] font-semibold text-slate-800 dark:text-slate-100">
                          {a.title}
                        </p>
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="iconSm" aria-label={`Assignment menu for "${a.title}"`}>
                            ⋯
                          </Button>
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

                    <div className="flex flex-wrap items-center gap-2">
                      <SubjectChip subject={subject} />
                      {a.dueDate && (
                        <span className="text-xs text-slate-400">
                          Due{" "}
                          {new Date(a.dueDate).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      )}
                      {a.dueDate && <DueBadge dueDate={a.dueDate} now={now} />}
                      <Badge variant={PRIORITY_BADGE[a.priority].variant}>
                        {PRIORITY_BADGE[a.priority].label}
                      </Badge>
                      <Badge variant={STATUS_BADGE[a.status].variant}>
                        {STATUS_BADGE[a.status].label}
                      </Badge>
                    </div>

                    {a.description && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{a.description}</p>
                    )}
                  </li>
                );
              })}
            </ul>
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
                placeholder="e.g. Lab report 3"
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
                  <option value="">None</option>
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
                <Label htmlFor="assignment-priority">Priority</Label>
                <select
                  id="assignment-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Assignment["priority"])}
                  className={FIELD_CLASS}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
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
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="gradient" disabled={busy || !title.trim()}>
                {busy ? "Saving…" : editing ? "Save changes" : "Create Assignment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

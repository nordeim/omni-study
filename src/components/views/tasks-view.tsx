"use client";

import * as React from "react";
import { Filter, List as ListIcon, ListChecks, Plus, Search, Star } from "lucide-react";
import { useDataStore, mutations, type Task, type Subtask } from "@/lib/data";
import { useSubjectMap, EmptyState, ErrorText, TaskRowCard } from "./shared";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { isSameDay } from "@/lib/date";
import { cn } from "@/lib/utils";

type Filter = "active" | "completed" | "all";
type Bucket = "all" | "important" | "today" | { list: string };

function bucketKey(b: Bucket): string {
  return b === "all" ? "all" : b === "important" ? "important" : b === "today" ? "today" : `list:${b.list}`;
}

function bucketLabel(b: Bucket, listName?: string): string {
  return b === "all" ? "All Tasks" : b === "important" ? "Important" : b === "today" ? "Today" : (listName ?? "List");
}

const PRIORITY_OPTIONS = [
  { value: "none", label: "None" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
] as const;

const REPEAT_OPTIONS = [
  { value: "none", label: "No repeat" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
] as const;

function parseSubtasks(json: string): Subtask[] {
  try {
    const parsed: unknown = JSON.parse(json || "[]");
    return Array.isArray(parsed) ? (parsed as Subtask[]) : [];
  } catch {
    return [];
  }
}

export function TasksView() {
  const tasks = useDataStore((s) => s.data.tasks);
  const taskLists = useDataStore((s) => s.data.taskLists);
  const subjects = useDataStore((s) => s.data.subjects);
  const status = useDataStore((s) => s.status.tasks);
  const error = useDataStore((s) => s.error);
  const loadAll = useDataStore((s) => s.loadAll);
  const subjectMap = useSubjectMap();

  const [bucket, setBucket] = React.useState<Bucket>("all");
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState<Filter>("active");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Task | null>(null);
  const [listDialogOpen, setListDialogOpen] = React.useState(false);

  React.useEffect(() => {
    void loadAll(["tasks", "taskLists", "subjects"]);
  }, [loadAll]);

  // ---- Task form state (S6-B — the reference's dialog field set) ----
  const [title, setTitle] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [important, setImportant] = React.useState(false);
  const [myDay, setMyDay] = React.useState(false);
  const [priority, setPriority] = React.useState<string>("none");
  const [repeat, setRepeat] = React.useState<string>("none");
  const [dueDate, setDueDate] = React.useState("");
  const [dueExpanded, setDueExpanded] = React.useState(false);
  const [subtasks, setSubtasks] = React.useState<Subtask[]>([]);
  const [subtaskDraft, setSubtaskDraft] = React.useState("");
  const [subjectId, setSubjectId] = React.useState("");
  const [listId, setListId] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  function openCreate() {
    setEditing(null);
    setTitle("");
    setNotes("");
    setImportant(false);
    setMyDay(false);
    setPriority("none");
    setRepeat("none");
    setDueDate("");
    setDueExpanded(false);
    setSubtasks([]);
    setSubtaskDraft("");
    setSubjectId("");
    setListId(typeof bucket === "object" ? bucket.list : "");
    setDialogOpen(true);
  }

  function openEdit(task: Task) {
    setEditing(task);
    setTitle(task.title);
    setNotes(task.notes ?? "");
    setImportant(task.important);
    setMyDay(task.myDay);
    setPriority(task.priority);
    setRepeat(task.repeat);
    setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : "");
    setDueExpanded(!!task.dueDate);
    setSubtasks(parseSubtasks(task.subtasks));
    setSubtaskDraft("");
    setSubjectId(task.subjectId ?? "");
    setListId(task.listId ?? "");
    setDialogOpen(true);
  }

  function addSubtask() {
    const text = subtaskDraft.trim();
    if (!text) return;
    setSubtasks((prev) => [...prev, { id: `st${Date.now().toString(36)}`, title: text, done: false }]);
    setSubtaskDraft("");
  }

  function toggleSubtask(id: string) {
    setSubtasks((prev) => prev.map((s) => (s.id === id ? { ...s, done: !s.done } : s)));
  }

  function removeSubtask(id: string) {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
  }

  async function submitTask(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || busy) return;
    setBusy(true);
    const payload = {
      title: title.trim(),
      notes: notes.trim(),
      important,
      myDay,
      priority,
      repeat,
      subtasks: JSON.stringify(subtasks),
      dueDate: dueDate || null,
      subjectId: subjectId || null,
      listId: listId || null,
    };
    try {
      if (editing) {
        await mutations.updateTask(editing.id, payload);
        toast.success("Task updated");
      } else {
        await mutations.createTask(payload);
        toast.success("Task created");
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save the task");
    } finally {
      setBusy(false);
    }
  }

  // ---- List form state ----
  const [listName, setListName] = React.useState("");
  const [listColor, setListColor] = React.useState("#8b5cf6");

  async function submitList(e: React.FormEvent) {
    e.preventDefault();
    if (!listName.trim()) return;
    try {
      await mutations.createTaskList({ name: listName.trim(), color: listColor });
      setListName("");
      setListDialogOpen(false);
      toast.success("List created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create the list");
    }
  }

  // ---- Filtering ----
  const now = new Date();
  const visible = tasks.filter((t) => {
    if (bucket === "important" && !t.important) return false;
    if (bucket === "today" && !(t.dueDate && isSameDay(new Date(t.dueDate), now))) return false;
    if (typeof bucket === "object" && t.listId !== bucket.list) return false;
    if (filter === "active" && t.completed) return false;
    if (filter === "completed" && !t.completed) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const activeCount = tasks.filter((t) => !t.completed).length;
  const importantCount = tasks.filter((t) => t.important && !t.completed).length;

  if (status === "error") return <ErrorText message={error ?? "Failed to load tasks"} />;

  return (
    // S8-F (measured): the reference's Tasks view is a full-height two-pane
    // flex — a hidden-below-md w-64 aside (border-r, pr-6) and the main list.
    <div className="flex h-[calc(100vh-8rem)]">
      {/* Left panel — S8-F: filter buttons carry list/star icons + a
          flex-1 font-medium label; the My Lists block is separated by a
          border-t + pt-6 (the reference's section split). */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-100 pr-6 md:flex dark:border-slate-800" aria-label="Task views">
        <div className="mb-6 flex flex-col gap-1">
          {(
            [
              { key: "all" as const, label: "All Tasks", count: activeCount, icon: ListIcon },
              { key: "important" as const, label: "Important", count: importantCount, icon: Star },
            ]
          ).map((item) => {
            const Icon = item.icon;
            const active = bucketKey(bucket) === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setBucket(item.key)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all sf-focus",
                  active
                    ? "bg-violet-50 text-violet-700 dark:bg-sf-primary-soft-dark dark:text-sf-primary-strong-dark"
                    : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/60",
                )}
              >
                <Icon className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden="true" />
                <span className="flex-1 font-medium">{item.label}</span>
                <span className="text-sm text-slate-400">{item.count}</span>
              </button>
            );
          })}
        </div>

        <div className="border-t border-slate-100 pt-6 dark:border-slate-800">
          <div className="mb-4 flex items-center justify-between">
            {/* Reference (measured): text-sm font-semibold text-slate-500
                uppercase tracking-wider — the clone was one step small and
                light (text-xs slate-400; S4-H). */}
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">My Lists</h3>
            <button
              type="button"
              onClick={() => setListDialogOpen(true)}
              aria-label="New list"
              className="sf-focus flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {/* S9-D (measured): the reference's My Lists body is EMPTY when no
              lists exist — no placeholder text. */}
          <div className="flex flex-col gap-1">
            {taskLists.map((list) => {
              const count = tasks.filter((t) => t.listId === list.id && !t.completed).length;
              return (
                <div key={list.id} className="group relative">
                  <button
                    type="button"
                    onClick={() => setBucket({ list: list.id })}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all sf-focus",
                      bucketKey(bucket) === `list:${list.id}`
                        ? "bg-violet-50 text-violet-700 dark:bg-sf-primary-soft-dark dark:text-sf-primary-strong-dark"
                        : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/60",
                    )}
                  >
                    <span className="flex min-w-0 flex-1 items-center gap-2">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: list.color }} />
                      <span className="truncate font-medium">{list.name}</span>
                    </span>
                    <span className="text-sm text-slate-400">{count}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void mutations.deleteTaskList(list.id);
                      if (bucketKey(bucket) === `list:${list.id}`) setBucket("all");
                      toast.success("List deleted");
                    }}
                    aria-label={`Delete list "${list.name}"`}
                    className="absolute right-1 top-1/2 hidden -translate-y-1/2 rounded p-1 text-slate-400 hover:text-red-500 group-hover:block"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Main column — S8-F: ONE header row (h1 + count left; search +
          filter + Add Task right), then the scrollable row list. */}
      <main className="flex min-w-0 flex-1 flex-col md:pl-6">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center" aria-label="Tasks header">
          {/* Reference (measured): h1 text-2xl font-bold text-slate-800
              (tracking normal) + a dynamic "{N} tasks" subtitle (16px). */}
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {bucketLabel(bucket, taskLists.find((l) => typeof bucket === "object" && l.id === bucket.list)?.name)}
            </h1>
            <p className="text-base text-slate-500">{visible.length} tasks</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-64">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                strokeWidth={2}
                aria-hidden="true"
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tasks..."
                aria-label="Search tasks"
                className="h-9 pl-9"
              />
            </div>
            {/* S9-C (re-measured): the reference's status filter is a plain
                outline BUTTON — `lucide-filter w-4 h-4` icon + current value,
                NO chevron/combobox chrome. A DropdownMenu keeps the filter
                function (the reference's own popover never opens under
                synthetic clicks — contents unmeasurable; clone superset). */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-9 w-[110px] justify-between gap-2" aria-label="Filter tasks">
                  <Filter className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                  <span>{filter === "all" ? "All" : filter === "completed" ? "Completed" : "Active"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilter("active")}>Active</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("completed")}>Completed</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("all")}>All</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={openCreate} variant="gradient" className="shrink-0 gap-1.5">
              <Plus className="h-4 w-4" /> Add Task
            </Button>
          </div>
        </div>

        {visible.length === 0 ? (
          <div className="sf-card">
            <EmptyState
              icon={ListChecks}
              title="No tasks yet"
              action={<Button onClick={openCreate} variant="gradient" className="sf-gradient-shadow-lg">Create Task</Button>}
            />
          </div>
        ) : (
          // S6-A: per-row CARDS in a gap-2 column (the reference's
          // space-y-2 list, laid out flex-gap per the v4 trap-4 convention).
          // S8-F: the list scrolls inside the full-height pane (the pinned
          // "Task rows" label stays on the rows' direct parent).
          <div className="sf-scroll flex-1 overflow-y-auto">
            <div className="flex flex-col gap-2 pr-2" aria-label="Task rows">
              {visible.map((t) => (
                <TaskRowCard
                  key={t.id}
                  task={t}
                  subject={t.subjectId ? subjectMap.get(t.subjectId) : undefined}
                  onEdit={openEdit}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Task dialog (S6-B — the reference's field set, measured). */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Task" : "New Task"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitTask} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="task-title">Title</Label>
              <Input
                id="task-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task name..."
                maxLength={200}
                required
              />
            </div>

            {/* My Day / Important pill toggles (reference-measured row). */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMyDay((v) => !v)}
                aria-pressed={myDay}
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors sf-focus",
                  myDay
                    ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800",
                )}
              >
                ☀ My Day
              </button>
              <button
                type="button"
                onClick={() => setImportant((v) => !v)}
                aria-pressed={important}
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors sf-focus",
                  important
                    ? "border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-700 dark:bg-violet-950/40 dark:text-violet-300"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800",
                )}
              >
                ★ Important
              </button>
            </div>

            {/* Add due date collapsible (reference layout; native date input
                inside = honest superset of the reference's custom calendar). */}
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => setDueExpanded((v) => !v)}
                aria-expanded={dueExpanded}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 sf-focus dark:text-slate-300 dark:hover:text-white"
              >
                <span className={cn("transition-transform", dueExpanded && "rotate-90")}>›</span>
                {dueDate ? "Due date" : "Add due date"}
              </button>
              {dueExpanded && (
                <input
                  id="task-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="task-priority">Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger id="task-priority" aria-label="Priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="task-repeat">Repeat</Label>
                <Select value={repeat} onValueChange={setRepeat}>
                  <SelectTrigger id="task-repeat" aria-label="Repeat">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REPEAT_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Subtask adder (reference-measured). */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="task-subtask">Subtasks</Label>
              <div className="flex gap-2">
                <Input
                  id="task-subtask"
                  value={subtaskDraft}
                  onChange={(e) => setSubtaskDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSubtask();
                    }
                  }}
                  placeholder="Add a subtask..."
                  maxLength={200}
                />
                <Button type="button" variant="outline" onClick={addSubtask} aria-label="Add subtask" className="px-3">
                  +
                </Button>
              </div>
              {subtasks.length > 0 && (
                <ul className="flex flex-col gap-1.5 pt-1">
                  {subtasks.map((s) => (
                    <li key={s.id} className="flex items-center gap-2 text-sm">
                      <button
                        type="button"
                        onClick={() => toggleSubtask(s.id)}
                        aria-label={`Toggle subtask "${s.title}"`}
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-all sf-focus",
                          s.done ? "border-transparent bg-sf-primary text-white" : "border-slate-300 dark:border-slate-600",
                        )}
                      >
                        {s.done && <span className="text-[9px] leading-none">✓</span>}
                      </button>
                      <span className={cn("min-w-0 flex-1 truncate", s.done ? "text-slate-400 line-through" : "text-slate-600 dark:text-slate-300")}>
                        {s.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeSubtask(s.id)}
                        aria-label={`Remove subtask "${s.title}"`}
                        className="text-slate-300 transition-colors hover:text-red-500 sf-focus"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="task-notes">Notes</Label>
              <Textarea id="task-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} maxLength={2000} placeholder="Add notes..." />
            </div>

            {/* Superset fields (not on the reference): Subject + List. */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="task-subject">Subject</Label>
                <select
                  id="task-subject"
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                >
                  <option value="">None</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="task-list">List</Label>
                <select
                  id="task-list"
                  value={listId}
                  onChange={(e) => setListId(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                >
                  <option value="">None</option>
                  {taskLists.map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" variant="gradient" disabled={busy || !title.trim()}>
                {busy ? "Saving…" : editing ? "Update Task" : "Create Task"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* List dialog */}
      <Dialog open={listDialogOpen} onOpenChange={setListDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>New List</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitList} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="list-name">Name</Label>
              <Input id="list-name" value={listName} onChange={(e) => setListName(e.target.value)} maxLength={80} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="list-color">Color</Label>
              <div className="flex gap-2">
                {["#8b5cf6", "#3b82f6", "#22c55e", "#f97316", "#ec4899", "#ef4444", "#14b8a6"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setListColor(c)}
                    aria-label={`Choose color ${c}`}
                    className={cn("h-7 w-7 rounded-full", listColor === c && "ring-2 ring-offset-2 ring-slate-400")}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setListDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={!listName.trim()}>Create List</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

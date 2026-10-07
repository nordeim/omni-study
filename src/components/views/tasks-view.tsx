"use client";

import * as React from "react";
import { ListChecks, Plus, Star, Trash2 } from "lucide-react";
import { useDataStore, mutations, type Task } from "@/lib/data";
import { useSubjectMap, EmptyState, ErrorText } from "./shared";
import { Checkbox } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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

  // ---- Task form state ----
  const [title, setTitle] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [important, setImportant] = React.useState(false);
  const [dueDate, setDueDate] = React.useState("");
  const [subjectId, setSubjectId] = React.useState("");
  const [listId, setListId] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  function openCreate() {
    setEditing(null);
    setTitle("");
    setNotes("");
    setImportant(false);
    setDueDate("");
    setSubjectId("");
    setListId(typeof bucket === "object" ? bucket.list : "");
    setDialogOpen(true);
  }

  function openEdit(task: Task) {
    setEditing(task);
    setTitle(task.title);
    setNotes(task.notes ?? "");
    setImportant(task.important);
    setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : "");
    setSubjectId(task.subjectId ?? "");
    setListId(task.listId ?? "");
    setDialogOpen(true);
  }

  async function submitTask(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || busy) return;
    setBusy(true);
    const payload = {
      title: title.trim(),
      notes: notes.trim(),
      important,
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
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Left panel — views + lists */}
      <aside className="w-full shrink-0 lg:w-60" aria-label="Task views">
        <div className="sf-card flex flex-col gap-1 p-3">
          {(
            [
              { key: "all" as const, label: "All Tasks", count: activeCount },
              { key: "important" as const, label: "Important", count: importantCount },
            ]
          ).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setBucket(item.key)}
              className={cn(
                "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                bucketKey(bucket) === item.key
                  ? "bg-sf-primary-soft text-sf-primary-strong dark:bg-sf-primary-soft-dark dark:text-sf-primary-strong-dark"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60",
              )}
            >
              {item.label}
              <span className="text-xs text-slate-400">{item.count}</span>
            </button>
          ))}

          <div className="mt-3 flex items-center justify-between px-3 pb-1">
            {/* Reference (measured): text-sm font-semibold text-slate-500
                uppercase tracking-wider — the clone was one step small and
                light (text-xs slate-400; S4-H). */}
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">My Lists</h3>
            <button
              type="button"
              onClick={() => setListDialogOpen(true)}
              aria-label="New list"
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 sf-focus dark:hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {taskLists.length === 0 && (
            <p className="px-3 py-2 text-xs text-slate-400">No lists yet</p>
          )}
          {taskLists.map((list) => {
            const count = tasks.filter((t) => t.listId === list.id && !t.completed).length;
            return (
              <div key={list.id} className="group relative">
                <button
                  type="button"
                  onClick={() => setBucket({ list: list.id })}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    bucketKey(bucket) === `list:${list.id}`
                      ? "bg-sf-primary-soft text-sf-primary-strong dark:bg-sf-primary-soft-dark dark:text-sf-primary-strong-dark"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60",
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: list.color }} />
                    <span className="truncate">{list.name}</span>
                  </span>
                  <span className="text-xs text-slate-400">{count}</span>
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
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main column */}
      <div className="min-w-0 flex-1">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          {/* Reference (measured): h1 text-2xl font-bold text-slate-800
              (tracking normal) + a dynamic "{N} tasks" subtitle (16px). */}
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {bucketLabel(bucket, taskLists.find((l) => typeof bucket === "object" && l.id === bucket.list)?.name)}
            </h1>
            <p className="text-base text-slate-500">{visible.length} tasks</p>
          </div>
          <Button onClick={openCreate} variant="gradient" className="gap-1.5">
            <Plus className="h-4 w-4" /> Add Task
          </Button>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[180px] flex-1">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              aria-label="Search tasks"
              className="h-9"
            />
          </div>
          <Select value={filter} onValueChange={(v) => setFilter(v as Filter)}>
            <SelectTrigger className="w-[130px]" aria-label="Filter tasks">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
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
          <ul className="sf-card flex flex-col gap-1 p-3">
            {visible.map((t) => {
              const subject = t.subjectId ? subjectMap.get(t.subjectId) : undefined;
              return (
                <li key={t.id} className="group flex items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <Checkbox
                    checked={t.completed}
                    onCheckedChange={(v) => mutations.updateTask(t.id, { completed: v === true })}
                    aria-label={`Mark "${t.title}" ${t.completed ? "incomplete" : "complete"}`}
                  />
                  <button type="button" onClick={() => openEdit(t)} className="min-w-0 flex-1 text-left">
                    <p className={cn("truncate text-[15px] font-medium", t.completed ? "text-slate-400 line-through" : "text-slate-800 dark:text-slate-100")}>
                      {t.title}
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      {subject && <span style={{ color: subject.color }}>{subject.name}</span>}
                      {t.dueDate && <span>{new Date(t.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>}
                      {t.notes && <span className="truncate">· {t.notes.slice(0, 40)}</span>}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => mutations.updateTask(t.id, { important: !t.important })}
                    aria-label={t.important ? "Unmark important" : "Mark important"}
                    className={cn("rounded-md p-1.5", t.important ? "text-amber-500" : "text-slate-300 hover:text-amber-400")}
                  >
                    <Star className="h-4 w-4" fill={t.important ? "currentColor" : "none"} />
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="iconSm" aria-label={`Task menu for "${t.title}"`}>⋯</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(t)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          void mutations.deleteTask(t.id);
                          toast.success("Task deleted");
                        }}
                        className="text-red-600 focus:text-red-600"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Task dialog */}
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
                placeholder="What needs to be done?"
                maxLength={200}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="task-notes">Notes</Label>
              <Textarea id="task-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} maxLength={2000} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="task-date">Due date</Label>
                <input
                  id="task-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="task-subject">Subject</Label>
                <select
                  id="task-subject"
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
                <Label htmlFor="task-list">List</Label>
                <select
                  id="task-list"
                  value={listId}
                  onChange={(e) => setListId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm"
                >
                  <option value="">None</option>
                  {taskLists.map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end gap-2 pb-2">
                <Checkbox id="task-important" checked={important} onCheckedChange={(v) => setImportant(v === true)} />
                <Label htmlFor="task-important">Important</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" variant="gradient" disabled={busy || !title.trim()}>
                {busy ? "Saving…" : editing ? "Save changes" : "Create Task"}
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

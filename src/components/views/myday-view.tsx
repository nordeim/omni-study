"use client";

import * as React from "react";
import { Plus, Settings2, Sun } from "lucide-react";
import { useDataStore, mutations, type Task } from "@/lib/data";
import { useSubjectMap, EmptyState } from "./shared";
import { Checkbox } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { isSameDay } from "@/lib/date";
import { greetingForHour } from "@/lib/router";
import { cn } from "@/lib/utils";

function TaskRow({ task, onEdit }: { task: Task; onEdit?: () => void }) {
  const subjectMap = useSubjectMap();
  const subject = task.subjectId ? subjectMap.get(task.subjectId) : undefined;
  return (
    <li className="group flex items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
      <Checkbox
        checked={task.completed}
        onCheckedChange={(v) => mutations.updateTask(task.id, { completed: v === true })}
        aria-label={`Mark "${task.title}" ${task.completed ? "incomplete" : "complete"}`}
      />
      <button
        type="button"
        onClick={onEdit}
        className="min-w-0 flex-1 text-left"
        aria-label={`Edit task "${task.title}"`}
      >
        <p
          className={cn(
            "truncate text-[15px] font-medium",
            task.completed ? "text-slate-400 line-through" : "text-slate-800 dark:text-slate-100",
          )}
        >
          {task.title}
        </p>
        {subject && <p className="mt-0.5 text-xs" style={{ color: subject.color }}>{subject.name}</p>}
      </button>
      {task.important && <span className="text-sm text-amber-500" title="Important">★</span>}
    </li>
  );
}

export function MyDayView() {
  const tasks = useDataStore((s) => s.data.tasks);
  const subjects = useDataStore((s) => s.data.subjects);
  const loadAll = useDataStore((s) => s.loadAll);
  const [quick, setQuick] = React.useState("");
  const [moreOpen, setMoreOpen] = React.useState(false);
  const [important, setImportant] = React.useState(false);
  const [subjectId, setSubjectId] = React.useState("");
  const [dueDate, setDueDate] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [editing, setEditing] = React.useState<Task | null>(null);

  React.useEffect(() => {
    void loadAll(["tasks", "subjects"]);
  }, [loadAll]);

  const now = new Date();
  const todayTasks = tasks.filter((t) => t.dueDate && isSameDay(new Date(t.dueDate), now));
  const done = todayTasks.filter((t) => t.completed).length;

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    const title = quick.trim();
    if (!title) return;
    try {
      await mutations.createTask({
        title,
        important,
        subjectId: subjectId || null,
        dueDate: dueDate || null,
      });
      setQuick("");
      setImportant(false);
      setSubjectId("");
      toast.success("Task added to your day");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add the task");
    }
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    try {
      await mutations.updateTask(editing.id, {
        title: editing.title,
        important: editing.important,
        subjectId: editing.subjectId || null,
      });
      setEditing(null);
      toast.success("Task updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update the task");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        {/* Reference (measured): bare text-3xl h1 (30px, slate-800, no icon
            chip) + "Wednesday, October 7" — the MyDay subtitle carries NO
            year (unlike the dashboard date). */}
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">My Day</h1>
        <p className="text-base text-slate-500">
          {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Quick add */}
      <form onSubmit={addTask} className="sf-card flex flex-col gap-3 p-4">
        <div className="flex gap-2">
          <Input
            value={quick}
            onChange={(e) => setQuick(e.target.value)}
            placeholder="Add a task for today..."
            aria-label="Add a task for today"
            className="flex-1"
            maxLength={200}
          />
          <Button type="button" variant="outline" size="icon" onClick={() => setMoreOpen((v) => !v)} aria-expanded={moreOpen} aria-label="More options">
            <Settings2 className="h-4 w-4" />
          </Button>
          <Button type="submit" size="icon" disabled={!quick.trim()} aria-label="Add task">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {moreOpen && (
          <div className="flex flex-wrap items-center gap-3 rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800/50">
            <label className="flex items-center gap-2">
              <Checkbox checked={important} onCheckedChange={(v) => setImportant(v === true)} />
              Important
            </label>
            <label className="flex items-center gap-2">
              <span className="text-slate-500">Subject</span>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="h-8 rounded-md border border-input bg-card px-2 text-sm shadow-sm"
              >
                <option value="">None</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2">
              <span className="text-slate-500">Date</span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-8 rounded-md border border-input bg-card px-2 text-sm shadow-sm"
              />
            </label>
          </div>
        )}
      </form>

      {/* Progress */}
      <div className="sf-card flex items-center justify-between gap-4 p-5">
        <div>
          <h3 className="text-[15px] font-semibold text-slate-800 dark:text-slate-100">
            {greetingForHour(now.getHours())}!
          </h3>
          <p className="mt-0.5 text-sm text-slate-500">
            {todayTasks.length === 0
              ? "Nothing planned yet — add your first task above."
              : `${done} of ${todayTasks.length} done · ${todayTasks.length - done} to go`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {todayTasks.length === 0 ? "0%" : `${Math.round((done / todayTasks.length) * 100)}%`}
          </p>
          <p className="text-xs text-slate-400">day complete</p>
        </div>
      </div>

      {/* Edit dialog */}
      {editing && (
        <form onSubmit={saveEdit} className="sf-card flex flex-col gap-3 p-4">
          <Input
            value={editing.title}
            onChange={(e) => setEditing({ ...editing, title: e.target.value })}
            aria-label="Edit task title"
            maxLength={200}
          />
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <label className="flex items-center gap-2">
              <Checkbox
                checked={editing.important}
                onCheckedChange={(v) => setEditing({ ...editing, important: v === true })}
              />
              Important
            </label>
            <select
              value={editing.subjectId ?? ""}
              onChange={(e) => setEditing({ ...editing, subjectId: e.target.value || null })}
              className="h-8 rounded-md border border-input bg-card px-2 text-sm shadow-sm"
              aria-label="Task subject"
            >
              <option value="">No subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <Button type="submit" size="sm">Save</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </form>
      )}

      {/* Today's list */}
      <section className="sf-card overflow-hidden">
        <header className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <h3 className="text-[18px] font-semibold text-slate-800 dark:text-slate-100">Today</h3>
        </header>
        {todayTasks.length === 0 ? (
          <EmptyState
            icon={Sun}
            title="No tasks yet"
            hint="Add your first task for today using the box above."
          />
        ) : (
          <ul className="flex flex-col gap-1 p-3">
            {todayTasks.map((t) => (
              <TaskRow key={t.id} task={t} onEdit={() => setEditing(t)} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

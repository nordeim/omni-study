"use client";

import * as React from "react";
import { Calendar, ChevronRight, Circle, Plus, Sparkles, Sun } from "lucide-react";
import { useDataStore, mutations, type Task } from "@/lib/data";
import { useSubjectMap, EmptyState, TaskRowCard } from "./shared";
import { Checkbox } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { isSameDay } from "@/lib/date";
import { greetingForHour } from "@/lib/router";
import { cn } from "@/lib/utils";

export function MyDayView() {
  const tasks = useDataStore((s) => s.data.tasks);
  const subjects = useDataStore((s) => s.data.subjects);
  const loadAll = useDataStore((s) => s.loadAll);
  const subjectMap = useSubjectMap();
  const [quick, setQuick] = React.useState("");
  const [moreOpen, setMoreOpen] = React.useState(false);
  const [important, setImportant] = React.useState(false);
  const [subjectId, setSubjectId] = React.useState("");
  const [dueDate, setDueDate] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [editing, setEditing] = React.useState<Task | null>(null);
  const [suggestionsOpen, setSuggestionsOpen] = React.useState(false);
  // S9-B/S9-Q — the empty-state CTA focuses the quick-add input; the ref
  // replaces the removed gradient submit button (Enter submits the form).
  const quickRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    void loadAll(["tasks", "subjects"]);
  }, [loadAll]);

  const now = new Date();
  // S9-B — the empty state's greeting title (reference-measured wording).
  const greeting = greetingForHour(now.getHours());
  // S6-C — My Day is the explicit task set (myDay flag, reference-measured
  // toggle) — falling back to due-today so legacy rows still surface.
  const todayTasks = tasks.filter(
    (t) => t.myDay || (t.dueDate && isSameDay(new Date(t.dueDate), now)),
  );
  const done = todayTasks.filter((t) => t.completed).length;
  const progress = todayTasks.length === 0 ? 0 : Math.round((done / todayTasks.length) * 100);

  // Suggestions (reference-measured section): tasks not yet in My Day that
  // are overdue or due within the next few days (the reference's exact
  // window is unmeasurable on the empty account — 3 days covers the
  // "upcoming" intent robustly at any hour of day).
  const suggestions = tasks
    .filter((t) => !t.myDay && !t.completed && t.dueDate)
    .filter((t) => {
      const due = new Date(t.dueDate as string);
      const horizon = new Date(now);
      horizon.setDate(horizon.getDate() + 3);
      return due <= horizon;
    })
    .sort((a, b) => new Date(a.dueDate as string).getTime() - new Date(b.dueDate as string).getTime());

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    const title = quick.trim();
    if (!title) return;
    try {
      await mutations.createTask({
        title,
        important,
        myDay: true,
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

  function addToMyDay(task: Task) {
    void mutations.updateTask(task.id, { myDay: true });
    toast.success("Added to your day");
  }

  return (
    // S8-D (measured): the reference centers My Day in a max-w-3xl block
    // column — block layout so the header's mb-2 / amber card's mt-6 margin
    // pair collapses to the reference's 24px gap.
    <div className="mx-auto w-full max-w-3xl">
      {/* S8-D (measured): the reference's My Day header is a flex row with a
          56px amber-gradient sun block (w-14 h-14 rounded-2xl,
          from-amber-400 to-orange-500, shadow-lg shadow-amber-500/30,
          sun w-7 h-7 white) + the bare text-3xl h1 and weekday date. */}
      <div className="mb-2 flex items-center gap-4">
        <div
          aria-label="My Day header block"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
          style={{
            backgroundImage: "linear-gradient(to bottom right, #fbbf24, #f97316)",
            boxShadow: "0 10px 15px -3px rgba(245, 158, 11, 0.3)",
          }}
        >
          <Sun className="h-7 w-7 text-white" strokeWidth={2} aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">My Day</h1>
          <p className="text-base text-slate-500">
            {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
      </div>

      {/* S6-C — Today's Progress: the reference's amber gradient card
          (bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border
          border-amber-100, amber-700 label + amber-600 bold fraction + h-2
          amber progressbar). S8-D: sits directly under the header (mt-6).
          sRGB-exact inline gradient per trap 5. */}
      {/* S9-B (live re-measure): the reference HIDES this card when there
          are no today-tasks — its My Day shows only the header, quick-add,
          amber empty state and Suggestions. */}
      {todayTasks.length > 0 && (
      <div
        aria-label="Today progress"
        className="mt-6 rounded-2xl border border-amber-100 p-4 dark:border-amber-900/50"
        style={{ backgroundImage: "linear-gradient(to right, #fffbeb, #fff7ed)" }}
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-amber-700 dark:text-amber-400">Today&apos;s Progress</span>
          <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
            {done}/{todayTasks.length}
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          className="h-2 w-full overflow-hidden rounded-full bg-amber-100 dark:bg-amber-900/40"
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${progress}%`,
              backgroundImage: "linear-gradient(to right, #fbbf24, #f59e0b)",
            }}
          />
        </div>
      </div>
      )}

      {/* Quick add — S5-I: measured as a bare flex row (no card wrapper):
          h-12 rounded-xl input + "More Options" outline text button. S8-D:
          the input carries an inline plus icon (w-5 h-5, left-4). */}
      <form onSubmit={addTask} className="mb-6 flex gap-3">
        <div className="relative flex-1">
          <Plus
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            strokeWidth={2}
            aria-hidden="true"
          />
          <Input
            ref={quickRef}
            value={quick}
            onChange={(e) => setQuick(e.target.value)}
            placeholder="Add a task for today..."
            aria-label="Add a task for today"
            className="h-12 rounded-xl pl-12"
            maxLength={200}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-12 rounded-xl"
          onClick={() => setMoreOpen((v) => !v)}
          aria-expanded={moreOpen}
        >
          More Options
        </Button>
      </form>
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

      {/* Today's list — S6-A card rows (the reference's MyDay rows are the
          same task-row component as the Tasks view; measured). S8-D: the
          reference's list column is space-y-3 with an mb-8 tail. */}
      {todayTasks.length === 0 ? (
        // S9-B (re-measured on the reference): My Day's empty state is the
        // view-local AMBER design — a bare `text-center py-12` wrapper (no
        // card), an 80px from-amber-100→orange-100 block with an amber sun,
        // a greeting-titled h3 ("Good morning!" — time-aware) and the
        // "Add Your First Task" amber-gradient CTA. The reference's yellow
        // button text is the known Base44 platform bug — white stays.
        <div className="py-12 text-center">
          <div
            className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl"
            style={{
              // Trap 5 — sRGB-exact inline gradient (measured:
              // amber-100 #fef3c7 → orange-100 #ffedd5).
              backgroundImage: "linear-gradient(to right bottom, #fef3c7, #ffedd5)",
            }}
          >
            <Sun className="h-10 w-10 text-amber-500" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-slate-700 dark:text-slate-200">{greeting}!</h3>
          <p className="mb-6 text-slate-500 dark:text-slate-400">What would you like to accomplish today?</p>
          <button
            type="button"
            onClick={() => quickRef.current?.focus()}
            className="inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-md px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 sf-focus"
            style={{
              backgroundImage: "linear-gradient(to right, rgb(245, 158, 11), rgb(249, 115, 22))",
              boxShadow: "0 10px 15px -3px rgb(245 158 11 / 0.25)",
            }}
          >
            <Plus className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            Add Your First Task
          </button>
        </div>
      ) : (
        <div className="mb-8 flex flex-col gap-3" aria-label="Today's task rows">
          {todayTasks.map((t) => (
            <TaskRowCard
              key={t.id}
              task={t}
              subject={t.subjectId ? subjectMap.get(t.subjectId) : undefined}
              onEdit={setEditing}
            />
          ))}
        </div>
      )}

      {/* S8-D — Suggestions (measured): NOT a card — a bare toggle button
          (sparkles w-4 + text-sm font-medium label + rotating chevron) that
          expands a space-y-2 list of bg-slate-50 rounded-xl rows with a
          circle icon, title, due date, and a trailing Add affordance. */}
      {suggestions.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setSuggestionsOpen((v) => !v)}
            aria-expanded={suggestionsOpen}
            aria-controls="my-day-suggestions"
            className="sf-focus mb-4 flex items-center gap-2 text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <Sparkles className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            <span className="text-sm font-medium">Suggestions</span>
            <ChevronRight
              className={cn("h-4 w-4 transition-transform", suggestionsOpen && "rotate-90")}
              aria-hidden="true"
            />
          </button>
          {suggestionsOpen && (
            <div id="my-day-suggestions" className="space-y-2 overflow-hidden" aria-label="Suggested tasks">
              {suggestions.map((t) => {
                const due = t.dueDate ? new Date(t.dueDate) : null;
                return (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 transition-colors hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800"
                  >
                    <Circle className="h-5 w-5 shrink-0 text-slate-300 dark:text-slate-600" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-slate-600 dark:text-slate-300">{t.title}</p>
                      {due && (
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                          <Calendar className="h-3 w-3" aria-hidden="true" />
                          {due.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      )}
                    </div>
                    <Button type="button" size="sm" variant="ghost" onClick={() => addToMyDay(t)}>
                      Add
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

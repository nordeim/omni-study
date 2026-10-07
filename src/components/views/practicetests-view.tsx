"use client";

import * as React from "react";
import { CheckCircle2, ClipboardList, FileQuestion, MoreHorizontal, Play, Plus } from "lucide-react";
import { useDataStore, mutations, type PracticeTest, type Subject } from "@/lib/data";
import { EmptyState, ErrorText, LoadingCards, SubjectChip, ViewHeader, useSubjectMap } from "./shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input, Label } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { formatMinutes } from "@/lib/date";

const STATUS_META: Record<PracticeTest["status"], { label: string; variant: "secondary" | "warning" | "success" }> = {
  created: { label: "Created", variant: "secondary" },
  in_progress: { label: "In Progress", variant: "warning" },
  completed: { label: "Completed", variant: "success" },
};

const nativeSelectClass = "flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm";

function PracticeTestCard({
  test,
  subject,
  onEdit,
}: {
  test: PracticeTest;
  subject: Subject | null | undefined;
  onEdit: () => void;
}) {
  const [correct, setCorrect] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const meta = STATUS_META[test.status];

  async function startTest() {
    try {
      await mutations.updatePracticeTest(test.id, { status: "in_progress" });
      toast.success("Test started — good luck!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start the test");
    }
  }

  async function finishTest(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    const total = test.totalQuestions;
    const correctCount = Math.min(total, Math.max(0, Number.parseInt(correct, 10) || 0));
    const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    setBusy(true);
    try {
      await mutations.updatePracticeTest(test.id, {
        status: "completed",
        correctCount,
        score,
      });
      toast.success(`Test completed — you scored ${score}%`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save the result");
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="sf-card flex flex-col gap-4 p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-1.5">
          <h3 className="truncate text-[16px] font-semibold text-slate-800 dark:text-slate-100">{test.title}</h3>
          <div className="flex flex-wrap items-center gap-2">
            {subject && <SubjectChip subject={subject} />}
            <Badge variant={meta.variant}>{meta.label}</Badge>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="iconSm" aria-label={`Menu for test "${test.title}"`}>
              <MoreHorizontal className="h-4 w-4" strokeWidth={1.75} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                void mutations.deletePracticeTest(test.id);
                toast.success("Practice test deleted");
              }}
              className="text-red-600 focus:text-red-600"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
        <span>{test.totalQuestions} questions</span>
        {test.date && (
          <span aria-hidden="true">·</span>
        )}
        {test.date && <span>{new Date(test.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>}
        {test.durationMinutes != null && (
          <>
            <span aria-hidden="true">·</span>
            <span>{formatMinutes(test.durationMinutes)}</span>
          </>
        )}
      </p>

      {test.status === "completed" && (
        <div className="flex items-center justify-between gap-3 rounded-lg bg-emerald-50 px-4 py-3 dark:bg-emerald-950/30">
          <div>
            <p className="text-2xl font-bold leading-none text-emerald-600 dark:text-emerald-400">{test.score ?? 0}%</p>
            <p className="mt-1 text-xs text-emerald-700/80 dark:text-emerald-300/80">
              {test.correctCount}/{test.totalQuestions} correct
            </p>
          </div>
          <CheckCircle2 className="h-6 w-6 text-emerald-400" strokeWidth={1.75} aria-hidden="true" />
        </div>
      )}

      {test.status === "created" && (
        <Button onClick={() => void startTest()} className="gap-1.5">
          <Play className="h-4 w-4" strokeWidth={1.75} /> Start Test
        </Button>
      )}

      {test.status === "in_progress" && (
        <form onSubmit={finishTest} className="flex flex-col gap-2 rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
          <label
            htmlFor={`correct-${test.id}`}
            className="text-xs font-medium text-slate-600 dark:text-slate-300"
          >
            Correct answers (out of {test.totalQuestions})
          </label>
          <div className="flex gap-2">
            <Input
              id={`correct-${test.id}`}
              type="number"
              inputMode="numeric"
              min={0}
              max={test.totalQuestions}
              value={correct}
              onChange={(e) => setCorrect(e.target.value)}
              placeholder="0"
              className="h-9"
            />
            <Button type="submit" disabled={busy} className="shrink-0 gap-1.5">
              <CheckCircle2 className="h-4 w-4" strokeWidth={1.75} /> Finish
            </Button>
          </div>
        </form>
      )}
    </article>
  );
}

export function PracticeTestsView() {
  const practiceTests = useDataStore((s) => s.data.practiceTests);
  const subjects = useDataStore((s) => s.data.subjects);
  const status = useDataStore((s) => s.status.practiceTests);
  const error = useDataStore((s) => s.error);
  const loadAll = useDataStore((s) => s.loadAll);
  const subjectMap = useSubjectMap();

  React.useEffect(() => {
    void loadAll(["practiceTests", "subjects"]);
  }, [loadAll]);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<PracticeTest | null>(null);
  const [title, setTitle] = React.useState("");
  const [subjectId, setSubjectId] = React.useState("");
  const [date, setDate] = React.useState("");
  const [totalQuestions, setTotalQuestions] = React.useState("20");
  const [durationMinutes, setDurationMinutes] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const loading = status === "idle" || status === "loading";

  function openCreate() {
    setEditing(null);
    setTitle("");
    setSubjectId("");
    setDate("");
    setTotalQuestions("20");
    setDurationMinutes("");
    setDialogOpen(true);
  }

  function openEdit(test: PracticeTest) {
    setEditing(test);
    setTitle(test.title);
    setSubjectId(test.subjectId ?? "");
    setDate(test.date ? new Date(test.date).toISOString().slice(0, 10) : "");
    setTotalQuestions(String(test.totalQuestions));
    setDurationMinutes(test.durationMinutes != null ? String(test.durationMinutes) : "");
    setDialogOpen(true);
  }

  async function submitTest(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || busy) return;
    const total = Math.min(500, Math.max(0, Number.parseInt(totalQuestions, 10) || 0));
    const durationRaw = durationMinutes.trim();
    const duration =
      durationRaw === "" ? null : Math.min(600, Math.max(0, Number.parseInt(durationRaw, 10) || 0));
    setBusy(true);
    const payload = {
      title: trimmed,
      subjectId: subjectId || null,
      date: date || null,
      totalQuestions: total,
      durationMinutes: duration,
    };
    try {
      if (editing) {
        await mutations.updatePracticeTest(editing.id, payload);
        toast.success("Practice test updated");
      } else {
        await mutations.createPracticeTest(payload);
        toast.success("Practice test created");
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save the practice test");
    } finally {
      setBusy(false);
    }
  }

  if (status === "error") {
    return <ErrorText message={error ?? "Failed to load practice tests"} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <ViewHeader
        title="Practice Tests"
        subtitle="Test yourself with practice exams"
        icon={FileQuestion}
        actions={
          <Button onClick={openCreate} variant="gradient" className="gap-1.5">
            <Plus className="h-4 w-4" strokeWidth={1.75} /> Create Test
          </Button>
        }
      />

      {loading ? (
        <LoadingCards />
      ) : practiceTests.length === 0 ? (
        <div className="sf-card">
          <EmptyState
            icon={ClipboardList}
            title="No practice tests yet"
            hint="Create your first practice test to check what you really know."
            action={
              <Button onClick={openCreate} variant="gradient" className="sf-gradient-shadow-lg">
                Create Test
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {practiceTests.map((test) => (
            <PracticeTestCard
              key={test.id}
              test={test}
              subject={test.subjectId ? subjectMap.get(test.subjectId) : undefined}
              onEdit={() => openEdit(test)}
            />
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Practice Test" : "New Practice Test"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitTest} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pt-title">Title</Label>
              <Input
                id="pt-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Cell biology — chapter 4"
                maxLength={200}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="pt-subject">Subject</Label>
                <select
                  id="pt-subject"
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className={nativeSelectClass}
                >
                  <option value="">None</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="pt-date">Date (optional)</Label>
                <input
                  id="pt-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={nativeSelectClass}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="pt-total">Total questions</Label>
                <Input
                  id="pt-total"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={500}
                  value={totalQuestions}
                  onChange={(e) => setTotalQuestions(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="pt-duration">Duration in minutes (optional)</Label>
                <Input
                  id="pt-duration"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={600}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  placeholder="—"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="gradient" disabled={busy || !title.trim()}>
                {busy ? "Saving…" : editing ? "Save changes" : "Create Test"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

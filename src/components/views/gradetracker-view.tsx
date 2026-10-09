"use client";

import * as React from "react";
import {
  Award,
  ChartColumn,
  ClipboardList,
  LineChart,
  PieChart,
  Plus,
  Target,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useDataStore, mutations, type Grade } from "@/lib/data";
import { useSubjectMap, ViewHeader, EmptyState, LoadingCards, ErrorText, SubjectChip, SectionCard } from "./shared";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/primitives";
import { toast } from "@/components/ui/toast";

type GradeType = Grade["type"];

const FIELD_CLASS = "flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm";

const TYPE_BADGE: Record<GradeType, { label: string; variant: "default" | "info" | "warning" | "success" }> = {
  assignment: { label: "Assignment", variant: "info" },
  exam: { label: "Exam", variant: "default" },
  quiz: { label: "Quiz", variant: "warning" },
  project: { label: "Project", variant: "success" },
};

// Inline chart geometry (viewBox units; height maps 1:1 to the 240px container).
const CHART_W = 600;
const CHART_H = 240;
const CHART_PAD = 12;

function chartY(pct: number): number {
  return CHART_PAD + (1 - pct / 100) * (CHART_H - 2 * CHART_PAD);
}

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

function toDateInputValue(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function dateLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Weighted percentage average (sum((score/max)*weight) / sum(weight)); 0 when empty. */
function weightedPercent(items: Grade[]): number {
  let points = 0;
  let weight = 0;
  for (const g of items) {
    if (g.maxScore <= 0) continue;
    const w = g.weight > 0 ? g.weight : 1;
    points += (g.score / g.maxScore) * w;
    weight += w;
  }
  return weight === 0 ? 0 : (points / weight) * 100;
}

/** Percentage of a single grade, clamped to 0–100 for charting/bars. */
function gradePercent(g: Grade): number {
  if (g.maxScore <= 0) return 0;
  return Math.max(0, Math.min(100, (g.score / g.maxScore) * 100));
}

interface SubjectStat {
  subjectId: string;
  name: string;
  color: string;
  pct: number;
  count: number;
  latest: string;
}

export function GradeTrackerView() {
  const grades = useDataStore((s) => s.data.grades);
  const subjects = useDataStore((s) => s.data.subjects);
  const loadStatus = useDataStore((s) => s.status.grades);
  const error = useDataStore((s) => s.error);
  const loadAll = useDataStore((s) => s.loadAll);
  const subjectMap = useSubjectMap();

  const [dialogOpen, setDialogOpen] = React.useState(false);

  React.useEffect(() => {
    void loadAll(["grades", "subjects"]);
  }, [loadAll]);

  // ---- Form state ----
  const [assessment, setAssessment] = React.useState("");
  const [subjectId, setSubjectId] = React.useState("");
  const [score, setScore] = React.useState("");
  const [maxScore, setMaxScore] = React.useState("100");
  const [weight, setWeight] = React.useState("1");
  const [type, setType] = React.useState<GradeType>("assignment");
  const [date, setDate] = React.useState(() => toDateInputValue(new Date()));
  const [busy, setBusy] = React.useState(false);

  function openCreate() {
    setAssessment("");
    setSubjectId("");
    setScore("");
    setMaxScore("100");
    setWeight("1");
    setType("assignment");
    setDate(toDateInputValue(new Date()));
    setDialogOpen(true);
  }

  async function submitGrade(e: React.FormEvent) {
    e.preventDefault();
    const scoreNum = Number(score);
    const maxNum = Number(maxScore);
    const weightNum = Number(weight);
    if (!assessment.trim() || busy || Number.isNaN(scoreNum) || Number.isNaN(maxNum) || maxNum <= 0) return;
    setBusy(true);
    const payload = {
      assessment: assessment.trim(),
      subjectId: subjectId || null,
      score: scoreNum,
      maxScore: maxNum,
      weight: Number.isNaN(weightNum) || weightNum <= 0 ? 1 : weightNum,
      type,
      date: date || toDateInputValue(new Date()),
    };
    try {
      await mutations.createGrade(payload);
      toast.success("Grade added");
      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save the grade");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(g: Grade) {
    try {
      await mutations.deleteGrade(g.id);
      toast.success("Grade deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete the grade");
    }
  }

  // ---- Stats ----
  const overallPct = weightedPercent(grades);
  // Passing count feeds the By Subject table's summary line (kept data,
  // matched chrome — S5-M moved the 4th stat card out of the row).
  const passing = grades.filter((g) => g.maxScore > 0 && g.score / g.maxScore >= 0.5).length;
  const passingLabel = `${passing} of ${grades.length} scores at 50% or above`;

  const bySubject = new Map<string, Grade[]>();
  for (const g of grades) {
    if (!g.subjectId) continue;
    const list = bySubject.get(g.subjectId) ?? [];
    list.push(g);
    bySubject.set(g.subjectId, list);
  }
  const subjectStats: SubjectStat[] = [];
  for (const [id, items] of bySubject) {
    const subject = subjectMap.get(id);
    if (!subject) continue;
    const sortedItems = [...items].sort((a, b) => b.date.localeCompare(a.date));
    const latest = sortedItems[0];
    if (!latest) continue;
    subjectStats.push({
      subjectId: id,
      name: subject.name,
      color: subject.color,
      pct: weightedPercent(items),
      count: items.length,
      latest: latest.assessment,
    });
  }
  subjectStats.sort((a, b) => b.pct - a.pct);

  const bestSubject = subjectStats[0]?.name ?? "—";
  const bestDisplay = bestSubject.length > 16 ? `${bestSubject.slice(0, 15)}…` : bestSubject;
  const summaryLine = `Best subject: ${bestDisplay} · ${passingLabel}`;

  // ---- Trend chart points ----
  const trendPoints = [...grades]
    .filter((g) => g.maxScore > 0)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((g) => ({ pct: gradePercent(g), date: g.date }));
  const xs = trendPoints.map((_, i) =>
    trendPoints.length <= 1 ? CHART_W / 2 : CHART_PAD + (i / (trendPoints.length - 1)) * (CHART_W - 2 * CHART_PAD),
  );
  const ys = trendPoints.map((p) => chartY(p.pct));
  const polyline = xs.map((x, i) => `${Math.round(x)},${Math.round(ys[i] ?? 0)}`).join(" ");
  const firstPoint = trendPoints[0];
  const lastPoint = trendPoints[trendPoints.length - 1];

  // ---- Recent grades ----
  const recent = [...grades].sort((a, b) => b.date.localeCompare(a.date));

  if (loadStatus === "error") {
    return (
      <div className="flex flex-col gap-6">
        <ViewHeader title="Grade Tracker" subtitle="Monitor your academic performance" icon={TrendingUp} />
        <ErrorText message={error ?? "Failed to load grades"} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ViewHeader
        title="Grade Tracker"
        subtitle="Monitor your academic performance"
        icon={TrendingUp}
        actions={
          <Button onClick={openCreate} variant="gradient" className="gap-1.5">
            <Plus className="h-4 w-4" strokeWidth={1.75} />
            Add Grade
          </Button>
        }
      />

      {loadStatus === "idle" || loadStatus === "loading" ? (
        <LoadingCards />
      ) : (
        <>
          {/* Stat cards — S7-E: measured icons (award on the gradient card
              at w-8 h-8 mb-3 opacity-80; target / chart-column on the white
              cards) with strokeWidth 2 and mb-3 spacing. */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Grade summary">
            <div className="sf-gradient rounded-2xl p-6 text-white shadow-lg">
              <Award className="mb-3 h-8 w-8 opacity-80" strokeWidth={2} aria-hidden="true" />
              <p className="text-sm opacity-90">Overall Average</p>
              <p className="mt-2 text-4xl font-bold">{Math.round(overallPct)}%</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <Target className="mb-3 h-8 w-8 text-emerald-500" strokeWidth={2} aria-hidden="true" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Grades</p>
              <p className="mt-2 text-4xl font-bold text-slate-800 dark:text-slate-100">{grades.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <ChartColumn className="mb-3 h-8 w-8 text-blue-500" strokeWidth={2} aria-hidden="true" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Subjects Tracked</p>
              <p className="mt-2 text-4xl font-bold text-slate-800 dark:text-slate-100">{subjectStats.length}</p>
            </div>
          </div>

          {/* S17-E (measured on the reference's fresh account): at ZERO
              grades the reference renders the stat cards ONLY — no By
              Subject / GPA / trend sections. The sections below therefore
              gate on grades existing. */}
          {grades.length > 0 && (
            <>

          {/* Per-subject breakdown */}
          <SectionCard title="By Subject" icon={PieChart} action={subjectStats.length > 0 ? <span className="text-xs text-slate-400">{summaryLine}</span> : undefined}>
            {subjectStats.length === 0 ? (
              <EmptyState
                icon={PieChart}
                title="No subject data yet"
                hint="Add grades with a subject to see per-subject averages."
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {subjectStats.map((s) => (
                  <div
                    key={s.subjectId}
                    className="flex flex-col gap-3 rounded-xl border border-slate-100 p-4 dark:border-slate-800"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: s.color }}
                          aria-hidden="true"
                        />
                        <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{s.name}</p>
                      </div>
                      <p className="shrink-0 text-lg font-bold text-slate-800 dark:text-slate-100">
                        {Math.round(s.pct)}%
                      </p>
                    </div>
                    <div style={{ "--subject-bar": s.color } as React.CSSProperties}>
                      <Progress
                        value={Math.min(100, Math.round(s.pct))}
                        indicatorClassName="bg-[var(--subject-bar)]"
                        aria-label={`${s.name} average`}
                      />
                    </div>
                    <p className="text-xs text-slate-400">
                      {s.count} grade{s.count === 1 ? "" : "s"} · latest: {s.latest}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Recent grades */}
          <SectionCard title="Recent Grades" icon={ClipboardList}>
            <ul className="sf-scroll flex max-h-96 flex-col gap-1 overflow-y-auto pr-1">
              {recent.map((g) => {
                const subject = g.subjectId ? subjectMap.get(g.subjectId) : undefined;
                return (
                  <li
                    key={g.id}
                    className="flex flex-wrap items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                        {g.assessment}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <SubjectChip subject={subject} />
                        <Badge variant={TYPE_BADGE[g.type].variant}>{TYPE_BADGE[g.type].label}</Badge>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {g.score}/{g.maxScore}
                      </p>
                      <p className="text-xs text-slate-400">{Math.round(gradePercent(g))}%</p>
                    </div>
                    <span className="w-16 shrink-0 text-right text-xs text-slate-400">{dateLabel(g.date)}</span>
                    <Button
                      variant="ghost"
                      size="iconSm"
                      onClick={() => void handleDelete(g)}
                      aria-label={`Delete grade "${g.assessment}"`}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </Button>
                  </li>
                );
              })}
            </ul>
          </SectionCard>

          {/* Trend chart */}
          <SectionCard title="Performance Trend" icon={LineChart}>
            {trendPoints.length < 2 ? (
              <EmptyState
                icon={LineChart}
                title="Add more grades to see your trend"
                hint="At least two graded assessments are needed for a trend line."
              />
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <div className="relative h-[240px] w-6 shrink-0" aria-hidden="true">
                    {[100, 50, 0].map((v) => (
                      <span
                        key={v}
                        className="absolute left-0 -translate-y-1/2 text-[10px] font-medium text-slate-400"
                        style={{ top: `${Math.round(chartY(v))}px` }}
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                  <div className="relative h-[240px] min-w-0 flex-1">
                    <svg
                      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
                      preserveAspectRatio="none"
                      className="h-[240px] w-full"
                      role="img"
                      aria-label={`Grade percentage trend across ${trendPoints.length} assessments`}
                    >
                      {[0, 25, 50, 75, 100].map((pct) => (
                        <line
                          key={pct}
                          x1={0}
                          x2={CHART_W}
                          y1={chartY(pct)}
                          y2={chartY(pct)}
                          strokeWidth={1}
                          vectorEffect="non-scaling-stroke"
                          className="stroke-slate-100 dark:stroke-slate-800"
                        />
                      ))}
                      <polyline
                        points={polyline}
                        fill="none"
                        strokeWidth={2}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        vectorEffect="non-scaling-stroke"
                        style={{ stroke: "rgb(var(--sf-primary))" }}
                      />
                    </svg>
                    {trendPoints.map((p, i) => (
                      <span
                        key={i}
                        aria-hidden="true"
                        className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-sm"
                        style={{
                          left: `${((xs[i] ?? 0) / CHART_W) * 100}%`,
                          top: `${Math.round(ys[i] ?? 0)}px`,
                          backgroundColor: "rgb(var(--sf-primary))",
                        }}
                      />
                    ))}
                  </div>
                </div>
                {firstPoint && lastPoint && (
                  <p className="flex items-center justify-between pl-8 text-xs text-slate-400">
                    <span>{dateLabel(firstPoint.date)}</span>
                    <span>{dateLabel(lastPoint.date)}</span>
                  </p>
                )}
              </div>
            )}
          </SectionCard>
            </>
          )}
        </>
      )}

      {/* Add grade dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Grade</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitGrade} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="grade-assessment">Assessment</Label>
              <Input
                id="grade-assessment"
                value={assessment}
                onChange={(e) => setAssessment(e.target.value)}
                placeholder="e.g. Chapter 4 quiz"
                maxLength={200}
                required
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="grade-subject">Subject</Label>
                <select
                  id="grade-subject"
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
                <Label htmlFor="grade-type">Type</Label>
                <select
                  id="grade-type"
                  value={type}
                  onChange={(e) => setType(e.target.value as GradeType)}
                  className={FIELD_CLASS}
                >
                  <option value="assignment">Assignment</option>
                  <option value="exam">Exam</option>
                  <option value="quiz">Quiz</option>
                  <option value="project">Project</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="grade-score">Score</Label>
                <Input
                  id="grade-score"
                  type="number"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="e.g. 85"
                  min={0}
                  step="any"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="grade-max">Max score</Label>
                <Input
                  id="grade-max"
                  type="number"
                  value={maxScore}
                  onChange={(e) => setMaxScore(e.target.value)}
                  min={1}
                  step="any"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="grade-weight">Weight</Label>
                <Input
                  id="grade-weight"
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  min={0}
                  step="any"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="grade-date">Date</Label>
                <input
                  id="grade-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={FIELD_CLASS}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="gradient" disabled={busy || !assessment.trim() || score === ""}>
                {busy ? "Saving…" : "Add Grade"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

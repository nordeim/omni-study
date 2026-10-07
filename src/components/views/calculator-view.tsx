"use client";

import * as React from "react";
import { Calculator as CalcIcon, History, Plus, Trash2, X } from "lucide-react";
import {
  computeGpa,
  convert,
  evaluate,
  formatCalcResult,
  type GpaRow,
  type UnitCategory,
  UNITS,
} from "@/lib/calculator";
import { useDataStore, mutations, type CalculatorHistoryEntry } from "@/lib/data";
import { ViewHeader } from "./shared";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

// Calculator Suite — Basic / Scientific / GPA / Unit Converter tabs plus a
// History drawer (persisted per user). Matches the reference's tab labels.

const BASIC_KEYS = [
  ["C", "⌫", "%", "÷"],
  ["7", "8", "9", "×"],
  ["4", "5", "6", "−"],
  ["1", "2", "3", "+"],
  ["0", ".", "="], // "=" spans the last two columns
];

const SCI_KEYS: string[][] = [
  ["(", ")", "pi", "e"],
  ["sqrt(", "^", "ln(", "log("],
  ["sin(", "cos(", "tan(", "abs("],
];

function BasicPad({
  display,
  onKey,
  accent,
}: {
  display: string;
  onKey: (key: string) => void;
  accent: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      {BASIC_KEYS.map((row, ri) => (
        <div key={ri} className="grid grid-cols-4 gap-2">
          {row.map((key, ki) => {
            const isOp = ["÷", "×", "−", "+", "%"].includes(key);
            const isEq = key === "=";
            const isFn = key === "C" || key === "⌫";
            const wide = key === "=";
            return (
              <button
                key={`${ri}-${ki}`}
                type="button"
                onClick={() => onKey(key)}
                aria-label={
                  key === "="
                    ? "Equals"
                    : key === "⌫"
                      ? "Backspace"
                      : key === "C"
                        ? "Clear"
                        : `Insert ${key}`
                }
                className={cn(
                  "h-14 rounded-xl text-lg font-medium shadow-sm transition-transform active:scale-95 sf-focus",
                  wide && "col-span-2",
                  isEq
                    ? "text-white"
                    : isFn
                      ? "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                      : isOp
                        ? "bg-slate-800 text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
                        : "bg-white text-slate-800 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800",
                )}
                style={isEq ? { backgroundColor: accent } : undefined}
              >
                {key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function SciPad({ onInsert }: { onInsert: (text: string) => void }) {
  return (
    <div className="flex flex-col gap-2">
      {SCI_KEYS.map((row, ri) => (
        <div key={ri} className="grid grid-cols-4 gap-2">
          {row.map((token) => (
            <button
              key={token}
              type="button"
              onClick={() => onInsert(token)}
              className="h-11 rounded-lg bg-slate-100 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 sf-focus"
            >
              {token.endsWith("(") ? token.slice(0, -1) : token}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

function GpaTab() {
  const [rows, setRows] = React.useState<GpaRow[]>([
    { grade: "A", credits: 3 },
    { grade: "B+", credits: 4 },
  ]);
  const gpa = computeGpa(rows);
  return (
    <div className="flex flex-col gap-4">
      <div className="sf-card flex items-center justify-between gap-4 p-5">
        <div>
          <p className="text-sm text-slate-500">Semester GPA</p>
          <p className="text-4xl font-bold text-slate-800 dark:text-slate-100">{gpa.toFixed(2)}</p>
        </div>
        <p className="max-w-[220px] text-right text-xs text-slate-400">
          Letter grades (A+…F), numeric points (0–4) or percentages are accepted.
        </p>
      </div>
      <div className="sf-card p-5">
        <div className="mb-2 grid grid-cols-[1fr_110px_36px] gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <span>Grade</span>
          <span>Credits</span>
          <span />
        </div>
        <div className="flex flex-col gap-2">
          {rows.map((row, i) => (
            <div key={i} className="grid grid-cols-[1fr_110px_36px] gap-2">
              <Input
                value={row.grade}
                onChange={(e) =>
                  setRows((r) => r.map((x, j) => (j === i ? { ...x, grade: e.target.value } : x)))
                }
                aria-label={`Course ${i + 1} grade`}
                className="h-9"
              />
              <Input
                type="number"
                min={0}
                max={24}
                value={row.credits}
                onChange={(e) =>
                  setRows((r) =>
                    r.map((x, j) => (j === i ? { ...x, credits: Number(e.target.value) || 0 } : x)),
                  )
                }
                aria-label={`Course ${i + 1} credits`}
                className="h-9"
              />
              <Button
                variant="ghost"
                size="iconSm"
                aria-label={`Remove course ${i + 1}`}
                onClick={() => setRows((r) => r.filter((_, j) => j !== i))}
                className="text-slate-400 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => setRows((r) => [...r, { grade: "", credits: 3 }])}
        >
          <Plus className="h-4 w-4" /> Add course
        </Button>
      </div>
    </div>
  );
}

function ConverterTab() {
  const [category, setCategory] = React.useState<UnitCategory>("length");
  const [value, setValue] = React.useState("1");
  const [from, setFrom] = React.useState("m");
  const [to, setTo] = React.useState("ft");
  const units = Object.keys(UNITS[category]);

  // Derived during render — a pure computation, no effect needed.
  const result = React.useMemo(() => {
    const v = Number(value);
    if (!Number.isFinite(v)) return "—";
    try {
      return formatCalcResult(convert(v, from, to, category));
    } catch {
      return "—";
    }
  }, [value, from, to, category]);

  function pickCategory(next: UnitCategory) {
    setCategory(next);
    const keys = Object.keys(UNITS[next]);
    setFrom(keys[0] ?? "");
    setTo(keys[1] ?? keys[0] ?? "");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="sf-card p-5">
        <div className="mb-4 flex flex-wrap gap-2">
          {(Object.keys(UNITS) as UnitCategory[]).map((c) => (
            <Button
              key={c}
              variant={category === c ? "default" : "outline"}
              size="sm"
              onClick={() => pickCategory(c)}
              className="capitalize"
            >
              {c}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="conv-value">Value</Label>
            <Input
              id="conv-value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              inputMode="decimal"
              className="h-11 text-lg"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="conv-from">From</Label>
            <select
              id="conv-from"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="h-11 rounded-md border border-input bg-card px-3 text-sm shadow-sm"
            >
              {units.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="conv-to">To</Label>
            <select
              id="conv-to"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="h-11 rounded-md border border-input bg-card px-3 text-sm shadow-sm"
            >
              {units.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="sf-card flex items-center justify-between gap-4 p-6">
        <p className="text-sm text-slate-500">
          {Number.isFinite(Number(value)) ? value : "—"} {from} =
        </p>
        <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">
          {result} <span className="text-lg font-medium text-slate-400">{to}</span>
        </p>
      </div>
    </div>
  );
}

export function CalculatorView() {
  const history = useDataStore((s) => s.data.calcHistory);
  const load = useDataStore((s) => s.load);
  const [tab, setTab] = React.useState<"basic" | "scientific">("basic");
  const [display, setDisplay] = React.useState("0");
  const [historyOpen, setHistoryOpen] = React.useState(false);

  React.useEffect(() => {
    void load("calcHistory");
  }, [load]);

  function press(key: string) {
    setDisplay((d) => {
      if (key === "C") return "0";
      if (key === "⌫") return d.length <= 1 ? "0" : d.slice(0, -1);
      if (key === "=") return d; // handled by submit()
      const raw = d === "0" && ![".", "("].includes(key) ? key : d + key;
      return raw.slice(0, 80);
    });
  }

  function insert(text: string) {
    setDisplay((d) => (d + text).slice(0, 80));
  }

  async function submit() {
    try {
      const result = evaluate(display);
      const pretty = formatCalcResult(result);
      setDisplay(pretty);
      try {
        await mutations.saveCalcHistory({ expression: display, result: pretty, mode: tab });
      } catch {
        /* history persistence is best-effort; display still updates */
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid expression");
    }
  }

  async function submitScientific() {
    await submit();
  }

  return (
    <div className="flex flex-col gap-6">
      <ViewHeader
        title="Calculator Suite"
        subtitle="All your calculation needs in one place"
        icon={CalcIcon}
        actions={
        <Button variant="outline" onClick={() => setHistoryOpen(true)}>
          <History className="h-4 w-4" /> History
        </Button>
        }
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="scientific">Scientific</TabsTrigger>
          <TabsTrigger value="gpa">GPA Calculator</TabsTrigger>
          <TabsTrigger value="converter">Unit Converter</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <div className="sf-card mx-auto max-w-sm p-5">
            <div
              className="mb-4 flex min-h-[64px] items-center justify-end rounded-xl bg-slate-900 px-4 py-3 text-right font-mono text-2xl text-white dark:bg-slate-800"
              role="textbox"
              aria-label="Calculator display"
              aria-live="polite"
            >
              <span className="truncate">{display}</span>
            </div>
            <BasicPad display={display} onKey={(k) => (k === "=" ? void submit() : press(k))} accent="rgb(var(--sf-primary))" />
          </div>
        </TabsContent>

        <TabsContent value="scientific">
          <div className="sf-card mx-auto max-w-md p-5">
            <div
              className="mb-4 flex min-h-[64px] items-center justify-end rounded-xl bg-slate-900 px-4 py-3 text-right font-mono text-2xl text-white dark:bg-slate-800"
              role="textbox"
              aria-label="Scientific calculator display"
              aria-live="polite"
            >
              <span className="truncate">{display}</span>
            </div>
            <SciPad onInsert={insert} />
            <div className="mt-2">
              <BasicPad display={display} onKey={(k) => (k === "=" ? void submitScientific() : press(k))} accent="rgb(var(--sf-primary))" />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="gpa">
          <div className="mx-auto max-w-lg">
            <GpaTab />
          </div>
        </TabsContent>

        <TabsContent value="converter">
          <div className="mx-auto max-w-lg">
            <ConverterTab />
          </div>
        </TabsContent>
      </Tabs>

      {/* History dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>History</DialogTitle>
          </DialogHeader>
          {history.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">No calculations yet</p>
          ) : (
            <ul className="sf-scroll flex max-h-[50vh] flex-col divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
              {history.map((entry: CalculatorHistoryEntry) => (
                <li key={entry.id} className="flex items-center gap-3 py-2.5">
                  <CalcIcon className="h-4 w-4 shrink-0 text-slate-300" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-sm text-slate-700 dark:text-slate-200">{entry.expression}</p>
                    <p className="truncate font-mono text-xs text-slate-400">= {entry.result}</p>
                  </div>
                  <span className="shrink-0 text-[10px] uppercase text-slate-300">{entry.mode}</span>
                </li>
              ))}
            </ul>
          )}
          {history.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void mutations.clearCalcHistory();
                toast.success("History cleared");
              }}
              className="mt-2"
            >
              <Trash2 className="h-4 w-4" /> Clear history
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

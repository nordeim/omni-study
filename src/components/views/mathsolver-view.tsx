"use client";

import * as React from "react";
import { Calculator, Eraser, ImageIcon, Loader2, Sigma, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ViewHeader } from "./shared";
import { Textarea } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { apiSend, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

// Math Solver — AI-powered step-by-step solutions; text problems and
// photographed problems (vision). Mirrors the reference's examples block.

const EXAMPLES = [
  "Solve for x: 2x + 5 = 15",
  "Find the derivative of f(x) = x^3 + 2x^2",
  "Calculate the area of a triangle with base 10 and height 8",
  "Simplify: (3x^2 + 2x - 5) + (x^2 - 4x + 3)",
];

export function MathSolverView() {
  const [problem, setProblem] = React.useState("");
  const [image, setImage] = React.useState<string | null>(null);
  const [solution, setSolution] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  async function solve() {
    if (busy) return;
    if (!problem.trim() && !image) return;
    setBusy(true);
    setSolution(null);
    try {
      const res = await apiSend<{ solution: string }>("POST", "/api/math/solve", {
        problem: problem.trim() || "(see image)",
        ...(image ? { image } : {}),
      });
      setSolution(res.solution);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "The solver could not process that.");
    } finally {
      setBusy(false);
    }
  }

  function pickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Image must be under 4 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImage(typeof reader.result === "string" ? reader.result : null);
    reader.onerror = () => toast.error("Could not read that image");
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  return (
    <div className="flex flex-col gap-6">
      <ViewHeader
        title="Math Solver"
        subtitle="Type a problem or upload an image to get step-by-step solutions"
        icon={Calculator}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Input */}
        <div className="sf-card flex flex-col gap-4 p-6">
          <Textarea
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder={"Type your math problem here...\n\nExamples:\n• Solve for x: 2x + 5 = 15\n• Find the derivative of f(x) = x³ + 2x²\n• Calculate the area of a triangle with base 10 and height 8\n• Simplify: (3x² + 2x − 5) + (x² − 4x + 3)"}
            aria-label="Math problem"
            className="min-h-[220px] text-[15px] leading-relaxed"
            maxLength={2000}
          />
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setProblem(ex)}
                className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                {ex}
              </button>
            ))}
          </div>
          {image && (
            <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
              <img src={image} alt="Problem snapshot" className="max-h-40 w-full object-contain" />
              <button
                type="button"
                onClick={() => setImage(null)}
                aria-label="Remove image"
                className="absolute right-2 top-2 rounded-md bg-black/60 p-1.5 text-white hover:bg-black/80"
              >
                <Eraser className="h-4 w-4" />
              </button>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={pickImage}
              className="hidden"
              aria-hidden="true"
              tabIndex={-1}
            />
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              <ImageIcon className="h-4 w-4" /> Upload Image
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setProblem("");
                setSolution(null);
                setImage(null);
              }}
            >
              <Eraser className="h-4 w-4" /> Clear
            </Button>
            <Button onClick={solve} disabled={busy || (!problem.trim() && !image)} className="ml-auto">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {busy ? "Solving…" : "Solve"}
            </Button>
          </div>
        </div>

        {/* Solution */}
        <div className="sf-card flex min-h-[320px] flex-col overflow-hidden">
          <header className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
            <h3 className="text-[18px] font-semibold text-slate-800 dark:text-slate-100">Solution</h3>
          </header>
          <div className="sf-scroll flex-1 overflow-y-auto p-6">
            {busy ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 py-10 text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin" style={{ color: "rgb(var(--sf-primary))" }} />
                <p className="text-sm">Working through the steps…</p>
              </div>
            ) : solution ? (
              <div className="flex flex-col gap-3">
                {solution.split(/\n+/).map((line, i) => (
                  <p
                    key={i}
                    className={cn(
                      "text-[15px] leading-relaxed",
                      line.trim().toLowerCase().startsWith("answer")
                        ? "font-bold text-emerald-600 dark:text-emerald-400"
                        : "text-slate-700 dark:text-slate-200",
                    )}
                  >
                    {line}
                  </p>
                ))}
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 py-10 text-center">
                <Sigma className="h-10 w-10 text-slate-200 dark:text-slate-700" strokeWidth={1.5} />
                <p className="text-sm text-slate-400">
                  Enter a problem (or upload a photo) and press Solve.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

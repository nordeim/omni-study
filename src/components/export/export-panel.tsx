"use client";

import * as React from "react";
import { Download, FileJson, UploadCloud } from "lucide-react";
import { apiGet, apiSend, ApiError } from "@/lib/api";
import { useThemeStore } from "@/lib/store";
import type { PublicUserShape } from "@/lib/app-context";
import {
  EXPORT_COLLECTION_LABELS,
  type ExportCollection,
} from "@/lib/data-export";
import { IMPORT_MAX_BYTES } from "@/lib/data-import";

// ExportPanel — the data-portability page's client half (S21, ADR-019;
// the import card S23, ADR-021).
//
// The owner-facing visible surface for the full-data download AND the
// restore. The reference has nothing like either — pure SUPERSET, and it
// adds ZERO chrome to any parity-pinned surface: the panel lives at the
// URL /export (server-gated — src/app/export/page.tsx redirects anonymous
// visitors to /login before any render, passing the server-computed
// count snapshot as props) and is linked from NOWHERE (an e2e guard pins
// the shell link-free; the owner navigates directly, per README +
// DEPLOYMENT.md §8.2).
//
// Theming: the layout's pre-paint boot script already applied the cached
// theme; on mount the panel loads /api/auth/me and calls
// useThemeStore.loadFromUser — exactly the shell's and /rum panel's
// pattern — so the account's dark mode + accent apply. The cards ride
// sf-card + standard Tailwind utilities (the .dark variant contract in
// globals.css), so dark mode and the 7 accents work with no new CSS.
//
// The S23 import card (the restore half): a plain file input
// (application/json — the export's own format round-trips unmodified), a
// client-side size pre-check (IMPORT_MAX_BYTES — the friendly early
// error before any upload), and the POST via apiSend to
// /api/import/data. The result renders as role="status" (the upsert
// summary) or role="alert" (the actionable validation error verbatim —
// the file's problem, stated plainly).

/** The route's success report shape. */
interface ImportReport {
  imported: Partial<Record<ExportCollection, { created: number; updated: number }>>;
  created: number;
  updated: number;
  total: number;
}

export function ExportPanel({
  counts,
  order,
}: {
  counts: Record<ExportCollection, number>;
  order: readonly ExportCollection[];
}) {
  const loadFromUser = useThemeStore((s) => s.loadFromUser);
  const total = React.useMemo(
    () => order.reduce((sum, name) => sum + counts[name], 0),
    [counts, order],
  );

  // ---- The S23 import card state ----
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [picked, setPicked] = React.useState<{ name: string; text: string } | null>(null);
  const [importing, setImporting] = React.useState(false);
  const [report, setReport] = React.useState<ImportReport | null>(null);
  const [importError, setImportError] = React.useState<string | null>(null);

  const onFilePicked = async (file: File | null | undefined) => {
    setReport(null);
    setImportError(null);
    if (!file) {
      setPicked(null);
      return;
    }
    if (file.size > IMPORT_MAX_BYTES) {
      setPicked(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setImportError(
        `That file is ${(file.size / (1024 * 1024)).toFixed(1)} MiB — the import cap is ` +
          `${IMPORT_MAX_BYTES / (1024 * 1024)} MiB. Re-export from the source account (file payloads ride whole).`,
      );
      return;
    }
    try {
      const text = await file.text();
      setPicked({ name: file.name, text });
    } catch {
      setPicked(null);
      setImportError("Could not read that file — try re-downloading your export.");
    }
  };

  const runImport = async () => {
    if (!picked || importing) return;
    setImporting(true);
    setImportError(null);
    setReport(null);
    try {
      // Parse client-side for the early friendly error (no request);
      // the server re-validates everything anyway (it never trusts the
      // client — the seam runs server-side on the same bytes).
      let parsed: unknown;
      try {
        parsed = JSON.parse(picked.text);
      } catch {
        setImportError(`"${picked.name}" is not valid JSON — re-download your export from /export.`);
        return;
      }
      const res = await apiSend<ImportReport>("POST", "/api/import/data", parsed, {
        timeoutMs: 120_000,
      });
      setReport(res);
    } catch (err) {
      if (err instanceof ApiError) {
        setImportError(err.message);
      } else {
        setImportError("The import failed — nothing was written (any failure rolls back completely).");
      }
    } finally {
      setImporting(false);
    }
  };

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // The shell's own pattern: the auth call carries the theme (the
        // boot script already painted the cached theme pre-hydration).
        // The server gate already redirected anonymous visitors — this
        // is defense in depth for a stale page after a sign-out.
        const { user } = await apiGet<{ user: PublicUserShape }>("/api/auth/me");
        if (cancelled) return;
        loadFromUser(user);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          window.location.replace("/login");
        }
        // Non-auth failures fall through — the count snapshot is already
        // rendered from the server props; the download link works
        // regardless (it is a plain navigation anchor).
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadFromUser]);

  return (
    <div className="sf-canvas min-h-screen">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-sm"
              style={{ backgroundColor: "rgb(var(--sf-primary))" }}
            >
              <Download className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Export Your Data</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Your complete study data as a single JSON file — your account, your content, your copy.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="text-sm font-medium text-slate-500 underline-offset-4 hover:text-slate-900 hover:underline dark:text-slate-400 dark:hover:text-slate-50"
            >
              Back to app
            </a>
            {/* S21: a real navigation link — the session cookie rides it;
                the browser downloads the JSON. Authed like every API route. */}
            <a
              href="/api/export/data"
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground dark:text-slate-200 dark:hover:text-slate-50"
            >
              <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
              Download JSON
            </a>
          </div>
        </header>

        <p className="text-sm text-slate-500 dark:text-slate-400">
          {total} {total === 1 ? "row" : "rows"} across {order.length} collections, snapshotted as of this visit. The
          download re-reads live data, so it always reflects the moment you click.
        </p>

        <section aria-label="What's included" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {order.map((name) => (
            <div key={name} className="sf-card flex flex-col gap-1 p-4">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {EXPORT_COLLECTION_LABELS[name]}
              </p>
              <p className="text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-50">
                {counts[name]}
              </p>
              <p className="text-[11px] leading-4 text-slate-400 dark:text-slate-500">
                {counts[name] === 1 ? "row" : "rows"}
              </p>
            </div>
          ))}
        </section>

        <section aria-label="Format" className="sf-card flex flex-col gap-3 p-6">
          <div className="flex items-center gap-2">
            <FileJson className="h-4 w-4 text-slate-400 dark:text-slate-500" strokeWidth={1.75} />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">The file you get</h2>
          </div>
          <ul className="flex flex-col gap-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            <li className="flex gap-2">
              <span aria-hidden="true">·</span>
              <span>
                One <code className="text-xs">studyflow-data-&lt;date&gt;.json</code> download — versioned (
                <code className="text-xs">format: studyflow-data-export</code>,{" "}
                <code className="text-xs">version: 1</code>), UTF-8, no intermediary caching.
              </span>
            </li>
            <li className="flex gap-2">
              <span aria-hidden="true">·</span>
              <span>
                Every collection above as a JSON array, in chronological order, with ids and foreign keys intact —
                tasks reference their lists and subjects, notes their notebooks, cards their decks, files their
                folders.
              </span>
            </li>
            <li className="flex gap-2">
              <span aria-hidden="true">·</span>
              <span>
                Your profile (name, email, theme, study settings) rides the <code className="text-xs">user</code>{" "}
                field — <strong className="font-semibold">without your password hash</strong>, and without
                verification/reset tokens or RUM telemetry (your performance metrics have their own{" "}
                <code className="text-xs">Export CSV</code> on the diagnostics panel).
              </span>
            </li>
            <li className="flex gap-2">
              <span aria-hidden="true">·</span>
              <span>Uploaded files ride with their full payloads (each is at most 2 MiB) — the export is a backup.</span>
            </li>
          </ul>
        </section>

        {/* S23 (ADR-021) — the restore half: import a StudyFlow export back
            into this account. Upsert-by-id (never deletes), all-or-nothing,
            content only (never identity). */}
        <section aria-label="Restore from a backup" className="sf-card flex flex-col gap-4 p-6">
          <div className="flex items-center gap-2">
            <UploadCloud className="h-4 w-4 text-slate-400 dark:text-slate-500" strokeWidth={1.75} />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Restore from a backup</h2>
          </div>
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
            Import a <code className="text-xs">studyflow-data-*.json</code> export into this account — the same file
            the Download JSON button produces. Rows are matched by id: existing rows are updated to the file&apos;s
            values, new ones are created, and nothing is ever deleted. The whole import either completes or rolls
            back completely — a failed import changes nothing.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm text-slate-500 shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground dark:text-slate-400">
              <FileJson className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              <span className="truncate">
                {picked ? picked.name : "Choose a StudyFlow export (.json, up to 10 MiB)"}
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                className="sr-only"
                onChange={(e) => void onFilePicked(e.target.files?.[0])}
              />
            </label>
            <button
              type="button"
              onClick={() => void runImport()}
              disabled={!picked || importing}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50 dark:bg-primary dark:text-primary-foreground"
            >
              <UploadCloud className={`h-4 w-4 ${importing ? "animate-pulse" : ""}`} strokeWidth={1.75} />
              {importing ? "Importing…" : "Import"}
            </button>
          </div>
          {report ? (
            <div role="status" className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
              <p className="font-semibold">
                Imported {report.total} {report.total === 1 ? "row" : "rows"} — {report.created} created,{" "}
                {report.updated} updated.
              </p>
              <ul className="mt-2 flex flex-col gap-1 text-xs leading-5">
                {Object.entries(report.imported)
                  .filter(([, c]) => c.created + c.updated > 0)
                  .map(([name, c]) => (
                    <li key={name} className="flex gap-2">
                      <span aria-hidden="true">·</span>
                      <span>
                        {EXPORT_COLLECTION_LABELS[name as ExportCollection] ?? name}: {c.created} created,{" "}
                        {c.updated} updated
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          ) : null}
          {importError ? (
            <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
              {importError}
            </div>
          ) : null}
        </section>

        <footer className="text-xs leading-5 text-slate-400 dark:text-slate-500">
          The export is a point-in-time download, not a sync — re-download after meaningful changes. The import
          restores content into this account by id (upsert — never deletes, rolls back completely on any failure);
          your account identity, password, and sign-in are never touched by an import. For a full reset-to-snapshot
          restore, run <code className="text-xs">bun run db:reset</code> first, then import (see DEPLOYMENT.md).
        </footer>
      </main>
    </div>
  );
}

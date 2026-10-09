import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser, checkRateLimit } from "@/lib/auth";
import { errorResponse, BadRequestError } from "@/lib/server/http";
import { IMPORT_MAX_BYTES, parseImportEnvelope } from "@/lib/data-import";
import { EXPORT_COLLECTIONS, type ExportCollection } from "@/lib/data-export";

// S23 (ADR-021) — the data-import (restore) route.
//
// The inverse of GET /api/export/data: POST a downloaded (or hand-crafted)
// export envelope and it is restored into the importing account — the
// upsert-by-id transaction (docs/remediation-plan-session23.md):
//
//  - Upsert-by-id, envelope-wins: a row whose id exists AND belongs to the
//    importer is updated to the envelope's field values; a new id is
//    created (with the IMPORTER's userId — the envelope is portable across
//    accounts; the export dropped userId by design).
//  - All-or-nothing: ONE interactive transaction; any failure rolls the
//    whole import back — the database is exactly as before, or exactly the
//    envelope merged in (validated empirically: the forced-failure probe
//    rolled back cleanly; 500 rows upsert in ~300 ms — the 60 s timeout
//    is free headroom).
//  - Import never deletes: rows absent from the envelope are untouched.
//    A true mirror-restore is the owner's explicit two-step
//    (`bun run db:reset` + import — DEPLOYMENT.md §8.2).
//  - Content only, never identity: the envelope's `user` block is
//    informational (the seam ignores it); this route never touches the
//    account's email, password, theme, or study profile.
//
// Contract: auth-gated (401 JSON for anonymous callers — the API-route
// convention), rate-limited 10/15-min per user (the S14 seam — an import
// is a rare, heavy write; the login/register default budget), the body
// capped at IMPORT_MAX_BYTES (413 with the actionable message), invalid
// JSON / invalid envelope → 400 with the seam's actionable error, and the
// success response IS the report: per-collection created/updated counts.
//
// The userId-safety of the upsert is BY CONSTRUCTION (validated
// empirically): the update branch is `updateMany({ where: { id, userId } })`
// — a foreign row matches NOTHING (count 0, untouched); the create branch
// on a cross-user id collision dies P2002 (the content models' only
// unique is the id) and the transaction rolls back. `cards` (Flashcard)
// has no userId column — its update branch scopes through the deck
// relation (`where: { id, deck: { userId } })`.

/** The two operations the import needs from a model delegate. */
type UpsertDelegate = {
  updateMany(args: {
    where: { id: string; userId: string };
    data: Record<string, unknown>;
  }): Promise<{ count: number }>;
  create(args: { data: Record<string, unknown> }): Promise<unknown>;
};

export async function POST(req: Request) {
  try {
    const user = await requireUser();

    // The S14 seam: 10 heavy writes / 15 min per user.
    const limit = checkRateLimit(`import:${user.id}`, 10);
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Too many import attempts — wait a few minutes and try again." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
      );
    }

    // Read the raw text FIRST and cap it BEFORE parsing (JSON.parse on a
    // hostile body is the DoS; the cap bounds it).
    const text = await req.text();
    if (text.length > IMPORT_MAX_BYTES) {
      return NextResponse.json(
        {
          error:
            `The import file is larger than the ${IMPORT_MAX_BYTES / (1024 * 1024)} MiB cap — ` +
            "re-export from the source account (file payloads ride whole; trim them if needed).",
        },
        { status: 413 },
      );
    }

    let raw: unknown;
    try {
      raw = JSON.parse(text);
    } catch {
      throw new BadRequestError("The import file is not valid JSON — re-download your export from /export.");
    }

    const parsed = parseImportEnvelope(raw);
    if (!parsed.ok) {
      throw new BadRequestError(parsed.error);
    }
    const { rows } = parsed;

    // The per-collection created/updated report (the response surface).
    const imported = {} as Record<ExportCollection, { created: number; updated: number }>;
    let created = 0;
    let updated = 0;

    await db.$transaction(
      async (tx) => {
        // The manifest order is topologically sorted (parents before
        // children — subjects before tasks, decks before cards; folders
        // were additionally sorted parents-first by the seam). `cards`
        // is special-cased below (no userId column — scoped through the
        // deck relation).
        const delegates: Record<Exclude<ExportCollection, "cards">, UpsertDelegate> = {
          subjects: tx.subject as unknown as UpsertDelegate,
          taskLists: tx.taskList as unknown as UpsertDelegate,
          tasks: tx.task as unknown as UpsertDelegate,
          assignments: tx.assignment as unknown as UpsertDelegate,
          exams: tx.exam as unknown as UpsertDelegate,
          events: tx.event as unknown as UpsertDelegate,
          timetableClasses: tx.timetableClass as unknown as UpsertDelegate,
          notebooks: tx.notebook as unknown as UpsertDelegate,
          notes: tx.note as unknown as UpsertDelegate,
          decks: tx.flashcardDeck as unknown as UpsertDelegate,
          practiceTests: tx.practiceTest as unknown as UpsertDelegate,
          studyGroups: tx.studyGroup as unknown as UpsertDelegate,
          grades: tx.grade as unknown as UpsertDelegate,
          focusSessions: tx.focusSession as unknown as UpsertDelegate,
          folders: tx.fileFolder as unknown as UpsertDelegate,
          files: tx.fileItem as unknown as UpsertDelegate,
          chatMessages: tx.aiChatMessage as unknown as UpsertDelegate,
          calcHistory: tx.calculatorHistoryEntry as unknown as UpsertDelegate,
          holidays: tx.holiday as unknown as UpsertDelegate,
        };

        for (const collection of EXPORT_COLLECTIONS) {
          const collectionRows = rows[collection];
          let cCreated = 0;
          let cUpdated = 0;

          for (const row of collectionRows) {
            const { id, ...data } = row;
            if (typeof id !== "string") continue; // the seam guarantees this

            if (collection === "cards") {
              // Flashcard has no userId column — scope the update through
              // the deck relation (validated: owned=1, foreign=0).
              const cards = tx.flashcard as unknown as {
                updateMany(args: {
                  where: { id: string; deck: { userId: string } };
                  data: Record<string, unknown>;
                }): Promise<{ count: number }>;
                create(args: { data: Record<string, unknown> }): Promise<unknown>;
              };
              const res = await cards.updateMany({
                where: { id, deck: { userId: user.id } },
                data,
              });
              if (res.count > 0) {
                cUpdated++;
              } else {
                // deckId is REQUIRED and seam-validated resolvable — it
                // rides in `data` untouched.
                await cards.create({ data: { ...data, id } });
                cCreated++;
              }
              continue;
            }

            // The general shape: userId-scoped update (a foreign row
            // matches nothing), then create with the importer's id.
            const res = await delegates[collection].updateMany({
              where: { id, userId: user.id },
              data,
            });
            if (res.count > 0) {
              cUpdated++;
            } else {
              await delegates[collection].create({
                data: { ...data, id, userId: user.id },
              });
              cCreated++;
            }
          }

          imported[collection] = { created: cCreated, updated: cUpdated };
          created += cCreated;
          updated += cUpdated;
        }
      },
      { timeout: 60_000 },
    );

    return NextResponse.json({ imported, created, updated, total: created + updated });
  } catch (err) {
    // Route-local Prisma mapping: a row that fails the DATABASE's own
    // content validation (a hand-crafted envelope) must surface as an
    // actionable 400, not a 500 — the whole transaction already rolled
    // back, so the database is exactly as before.
    const anyErr = err as { code?: string; message?: string };
    if (anyErr?.code === "P2002") {
      return NextResponse.json(
        {
          error:
            "The import rolled back — a row id in this file already exists under ANOTHER account. " +
            "Re-export from the account that owns the data.",
        },
        { status: 400 },
      );
    }
    if (anyErr?.code === "P2003") {
      // Belt-and-braces: the seam pre-empts every dangling FK this route
      // could hit (optional → nulled, required → rejected).
      return NextResponse.json(
        { error: "The import rolled back — a row references a missing record. " + (anyErr.message ?? "") },
        { status: 400 },
      );
    }
    if (anyErr?.code === "P2012" || anyErr?.code === "P2013") {
      return NextResponse.json(
        {
          error:
            "The import rolled back — a row is missing a required value: " +
            (anyErr.message?.split("\n").find((l) => l.includes("required")) ?? anyErr.message ?? anyErr.code),
        },
        { status: 400 },
      );
    }
    return errorResponse(err);
  }
}

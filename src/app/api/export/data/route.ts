import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { buildContentDisposition, errorResponse } from "@/lib/server/http";
import { buildDataExport } from "@/lib/data-export";

// S21 (ADR-019) — the full-data export route.
//
// The "own your data" download: the user's complete content across the
// 20 collections as a versioned JSON envelope (the pure seam
// src/lib/data-export.ts builds + normalizes it; this route owns auth,
// the parallel reads, and the download header contract).
//
// Contract: auth-gated (401 JSON for anonymous callers — the API-route
// convention, NOT a redirect), every collection scoped `where: {
// userId }` (ownership by construction, the CRUD-factory posture), rows
// in chronological order (createdAt asc — the natural backup reading
// order), the user profile selected EXPLICITLY (passwordHash is never
// read), and the S13/S14 download headers: attachment disposition via
// buildContentDisposition (the RFC 2183 fallback + RFC 5987 extended
// form), nosniff, and private/no-store (a personal data dump never
// belongs in an intermediary cache). No rate limit — a read endpoint at
// single-user scale, the same posture as the RUM GET/export routes.
//
// Excluded by decision (ADR-019): VerificationToken / PasswordResetToken
// (short-lived secrets), RumEvent (re-collectable telemetry — the
// /api/rum/export CSV is the full RUM dump), and the password hash.
// FileItem payloads ride WHOLE (the base64 data IS the user's files;
// bounded by the 2 MiB/upload cap — full-fidelity portability).
export async function GET() {
  try {
    const user = await requireUser();
    // The hashless profile — the explicit select is the first secret
    // guard; the seam's field strip is the second.
    const profile = await db.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatarEmoji: true,
        themeMode: true,
        accentColor: true,
        emailVerified: true,
        schoolName: true,
        gradeLevel: true,
        studyGoalHours: true,
        notificationsEnabled: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!profile) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    // The 20 content collections, read in parallel, userId-scoped,
    // chronological. `cards` (Flashcard) has no userId column — scoped
    // through its deck.
    const [
      subjects,
      taskLists,
      tasks,
      assignments,
      exams,
      events,
      timetableClasses,
      notebooks,
      notes,
      decks,
      cards,
      practiceTests,
      studyGroups,
      grades,
      focusSessions,
      folders,
      files,
      chatMessages,
      calcHistory,
      holidays,
    ] = await Promise.all([
      db.subject.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
      db.taskList.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
      db.task.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
      db.assignment.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
      db.exam.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
      db.event.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
      db.timetableClass.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
      db.notebook.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
      db.note.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
      db.flashcardDeck.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
      db.flashcard.findMany({ where: { deck: { userId: user.id } }, orderBy: { createdAt: "asc" } }),
      db.practiceTest.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
      db.studyGroup.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
      db.grade.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
      db.focusSession.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
      db.fileFolder.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
      db.fileItem.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
      db.aiChatMessage.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
      db.calculatorHistoryEntry.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
      db.holiday.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
    ]);

    const envelope = buildDataExport(
      profile,
      {
        subjects,
        taskLists,
        tasks,
        assignments,
        exams,
        events,
        timetableClasses,
        notebooks,
        notes,
        decks,
        cards,
        practiceTests,
        studyGroups,
        grades,
        focusSessions,
        folders,
        files,
        chatMessages,
        calcHistory,
        holidays,
      },
      new Date(),
    );

    const today = new Date().toISOString().slice(0, 10);
    return new NextResponse(JSON.stringify(envelope, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        // The S13 seam: ASCII-safe fallback + RFC 5987 extended form.
        "Content-Disposition": buildContentDisposition(`studyflow-data-${today}.json`),
        // The S14 download contract: no sniffing, no intermediary caching.
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}

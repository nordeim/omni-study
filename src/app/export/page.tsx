import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ExportPanel } from "@/components/export/export-panel";
import { EXPORT_COLLECTIONS, type ExportCollection } from "@/lib/data-export";

// S21 (ADR-019) — the data-export page.
//
// The owner-facing surface for the full-data export. A pure SUPERSET:
// the reference has no data-portability surface, and this route adds
// ZERO chrome to any parity-pinned surface — it is linked from NOWHERE
// (the sidebar/drawer stay exactly 20 links; an e2e guard pins the
// shell /export-link-free) and is not a sitemap entry (auth-gated
// tooling, not public content). The owner navigates directly — see
// README's portability row + DEPLOYMENT.md §8.2.
//
// The gate runs SERVER-side (getCurrentUser + redirect): an anonymous
// visit never renders a flash of panel chrome — it lands on /login, the
// same contract the API routes enforce (and the /rum precedent).
//
// The per-collection counts are queried here (server-side) and passed
// as props: they are a snapshot "as of this visit" — the download route
// re-reads live data, so a stale count never affects the export itself.
export const metadata: Metadata = {
  title: "Export Your Data",
  robots: { index: false, follow: false },
};

export default async function ExportDataPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // The count snapshot — 20 cheap COUNTs on a single-user SQLite file
  // (the S13 data-volume posture: measured bounds, no speculative
  // caching). `cards` (Flashcard) has no userId column — counted
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
    db.subject.count({ where: { userId: user.id } }),
    db.taskList.count({ where: { userId: user.id } }),
    db.task.count({ where: { userId: user.id } }),
    db.assignment.count({ where: { userId: user.id } }),
    db.exam.count({ where: { userId: user.id } }),
    db.event.count({ where: { userId: user.id } }),
    db.timetableClass.count({ where: { userId: user.id } }),
    db.notebook.count({ where: { userId: user.id } }),
    db.note.count({ where: { userId: user.id } }),
    db.flashcardDeck.count({ where: { userId: user.id } }),
    db.flashcard.count({ where: { deck: { userId: user.id } } }),
    db.practiceTest.count({ where: { userId: user.id } }),
    db.studyGroup.count({ where: { userId: user.id } }),
    db.grade.count({ where: { userId: user.id } }),
    db.focusSession.count({ where: { userId: user.id } }),
    db.fileFolder.count({ where: { userId: user.id } }),
    db.fileItem.count({ where: { userId: user.id } }),
    db.aiChatMessage.count({ where: { userId: user.id } }),
    db.calculatorHistoryEntry.count({ where: { userId: user.id } }),
    db.holiday.count({ where: { userId: user.id } }),
  ]);

  const counts = {
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
  } satisfies Record<ExportCollection, number>;

  return <ExportPanel counts={counts} order={EXPORT_COLLECTIONS} />;
}

"use client";

import * as React from "react";
import { BookOpen, FolderPlus, NotebookPen, Pin, PinOff, Plus, Search, Trash2 } from "lucide-react";
import { useDataStore, mutations, type Note, type Notebook } from "@/lib/data";
import { EmptyState, ViewHeader } from "./shared";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

// Notes — notebook/tag filters, master list, editor pane (matches the
// reference's two-pane "Select a note" layout).

export function NotesView() {
  const notes = useDataStore((s) => s.data.notes);
  const notebooks = useDataStore((s) => s.data.notebooks);
  const loadAll = useDataStore((s) => s.loadAll);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [notebookFilter, setNotebookFilter] = React.useState("");
  const [tagFilter, setTagFilter] = React.useState("");
  const [notebookDialogOpen, setNotebookDialogOpen] = React.useState(false);
  const [newNotebook, setNewNotebook] = React.useState("");

  React.useEffect(() => {
    void loadAll(["notes", "notebooks"]);
  }, [loadAll]);

  const allTags = React.useMemo(() => {
    const tags = new Set<string>();
    for (const n of notes) {
      for (const t of (n.tags ?? "").split(",")) {
        const clean = t.trim();
        if (clean) tags.add(clean);
      }
    }
    return Array.from(tags).sort();
  }, [notes]);

  const visible = notes.filter((n) => {
    if (notebookFilter && (n.notebookId ?? "") !== notebookFilter) return false;
    if (tagFilter && !(n.tags ?? "").toLowerCase().includes(tagFilter.toLowerCase())) return false;
    if (search) {
      const q = search.toLowerCase();
      const inTitle = n.title.toLowerCase().includes(q);
      const inContent = n.content.toLowerCase().includes(q);
      if (!inTitle && !inContent) return false;
    }
    return true;
  });

  const selected = visible.find((n) => n.id === selectedId) ?? null;

  async function createNote() {
    try {
      const note = await mutations.createNote({
        title: "Untitled",
        content: "",
        tags: "",
        pinned: false,
        notebookId: notebookFilter || null,
      });
      setSelectedId((note as unknown as { id: string }).id);
      toast.success("Note created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create the note");
    }
  }

  async function createNotebook(e: React.FormEvent) {
    e.preventDefault();
    if (!newNotebook.trim()) return;
    try {
      await mutations.createNotebook({ name: newNotebook.trim(), color: "#8b5cf6" });
      setNewNotebook("");
      setNotebookDialogOpen(false);
      toast.success("Notebook created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create the notebook");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <ViewHeader title="Notes" icon={BookOpen} />

      {/* S5-L — measured two-pane layout: left pane w-80 with a border-r
          divider (NOT a card) carrying the pane header (title + icon-only
          New Note gradient button), search, and the All Notebooks / All
          Tags SELECTS side-by-side; the right pane holds the editor. */}
      <div className="flex h-[calc(100vh-8rem)] min-h-[480px] gap-6">
        {/* Left pane */}
        <div className="hidden w-80 flex-col border-r border-slate-100 pr-6 dark:border-slate-800 lg:flex">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[18px] font-semibold text-slate-800 dark:text-slate-100">Notes</h2>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setNotebookDialogOpen(true)}
                aria-label="New notebook"
                title="New notebook"
              >
                <FolderPlus className="h-4 w-4" strokeWidth={2} />
              </Button>
              <Button variant="gradient" size="icon" onClick={createNote} aria-label="New note" title="New note">
                <Plus className="h-4 w-4" strokeWidth={2} />
              </Button>
            </div>
          </div>
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes..."
              aria-label="Search notes"
              className="pl-9"
            />
          </div>
          <div className="mb-4 flex gap-2">
            <select
              value={notebookFilter}
              onChange={(e) => setNotebookFilter(e.target.value)}
              aria-label="Filter by notebook"
              className="h-9 flex-1 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm"
            >
              <option value="">All Notebooks</option>
              {notebooks.map((nb) => (
                <option key={nb.id} value={nb.id}>{nb.name}</option>
              ))}
            </select>
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              aria-label="Filter by tag"
              className="h-9 flex-1 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm"
            >
              <option value="">All Tags</option>
              {allTags.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto sf-scroll pb-4">
            {visible.length === 0 ? (
              <EmptyState icon={NotebookPen} title="No notes yet" action={<Button variant="gradient" className="sf-gradient-shadow-lg" onClick={createNote}>New Note</Button>} />
            ) : (
              visible.map((n) => (
                <NoteListItem
                  key={n.id}
                  note={n}
                  selected={selectedId === n.id}
                  notebookName={notebooks.find((nb) => nb.id === n.notebookId)?.name}
                  onSelect={() => setSelectedId(n.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Editor — keyed by note id: switching notes remounts fresh state */}
        <div className="sf-card flex min-h-[420px] flex-1 flex-col overflow-hidden">
          {selected ? (
            <NoteEditor
              key={selected.id}
              note={selected}
              notebooks={notebooks}
              onDelete={() => setSelectedId(null)}
            />
          ) : (
            <EmptyState icon={NotebookPen} title="Select a note" hint="Pick a note from the list or create a new one." />
          )}
        </div>
      </div>

      {/* Mobile list — the reference's left pane is desktop-only; below lg
          the clone keeps the notes reachable via a stacked list. */}
      <div className="flex flex-col gap-3 lg:hidden">
        <div className="flex items-center justify-between gap-2">
          <Button variant="gradient" onClick={createNote} className="gap-1.5">
            <Plus className="h-4 w-4" /> New Note
          </Button>
          <Button variant="outline" size="icon" onClick={() => setNotebookDialogOpen(true)} aria-label="New notebook">
            <FolderPlus className="h-4 w-4" />
          </Button>
        </div>
        {visible.length === 0 ? (
          <div className="sf-card">
            <EmptyState icon={NotebookPen} title="No notes yet" action={<Button variant="gradient" className="sf-gradient-shadow-lg" onClick={createNote}>New Note</Button>} />
          </div>
        ) : (
          <ul className="sf-card divide-y divide-slate-100 dark:divide-slate-800">
            {visible.map((n) => (
              <li key={n.id}>
                <NoteListItem
                  note={n}
                  selected={selectedId === n.id}
                  notebookName={notebooks.find((nb) => nb.id === n.notebookId)?.name}
                  onSelect={() => setSelectedId(n.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Notebook dialog */}
      <Dialog open={notebookDialogOpen} onOpenChange={setNotebookDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>New Notebook</DialogTitle>
          </DialogHeader>
          <form onSubmit={createNotebook} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nb-name">Name</Label>
              <Input id="nb-name" value={newNotebook} onChange={(e) => setNewNotebook(e.target.value)} maxLength={80} required />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setNotebookDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={!newNotebook.trim()}>Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** A note row in the master list — extracted so the desktop pane and the
 *  mobile stacked list render identical rows. */
function NoteListItem({
  note: n,
  selected,
  notebookName,
  onSelect,
}: {
  note: Note;
  selected: boolean;
  notebookName?: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex w-full flex-col gap-1 rounded-lg px-3 py-3 text-left transition-colors",
        selected
          ? "bg-sf-primary-soft dark:bg-sf-primary-soft-dark"
          : "hover:bg-slate-50 dark:hover:bg-slate-800/40",
      )}
    >
      <span className="flex items-center gap-2">
        {n.pinned && <Pin className="h-3.5 w-3.5 shrink-0 text-amber-500" />}
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
          {n.title || "Untitled"}
        </span>
      </span>
      <span className="truncate text-xs text-slate-400">
        {n.content ? n.content.replace(/\n/g, " ").slice(0, 60) : "Empty note"}
      </span>
      <span className="flex items-center gap-2 text-[11px] text-slate-400">
        {notebookName && <span className="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-slate-800">{notebookName}</span>}
        {new Date(n.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
      </span>
    </button>
  );
}

// The editor owns its draft state; the `key` on the component resets it
// whenever a different note is selected (no effect-setState cascades).
function NoteEditor({
  note,
  notebooks,
  onDelete,
}: {
  note: Note;
  notebooks: Notebook[];
  onDelete: () => void;
}) {
  const [draft, setDraft] = React.useState<Note>(() => ({ ...note }));

  // Autosave on change with debounce; flushed on unmount.
  const saveTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = React.useRef(draft);
  latest.current = draft;

  function scheduleSave(next: Note) {
    setDraft(next);
    latest.current = next;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => void persist(next), 700);
  }

  async function persist(next: Note) {
    try {
      await mutations.updateNote(next.id, {
        title: next.title || "Untitled",
        content: next.content,
        tags: next.tags,
        pinned: next.pinned,
        notebookId: next.notebookId,
      });
    } catch {
      toast.error("Could not save the note");
    }
  }

  React.useEffect(
    () => () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      void persist(latest.current);
    },
    // Flush on unmount only (note switch).
     
    [],
  );

  return (
    <>
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-5 py-3 dark:border-slate-800">
        <Input
          value={draft.title}
          onChange={(e) => scheduleSave({ ...draft, title: e.target.value })}
          aria-label="Note title"
          // S7-F: the reference's measured intent — a borderless 20px bold
          // title input with the "Note title..." placeholder. (The reference
          // itself renders 14px because its shadcn base's md:text-sm wins the
          // cascade — a documented platform bug; the clone follows the
          // authored text-xl font-bold.)
          className="h-9 border-0 px-0 text-xl font-bold shadow-none focus-visible:ring-0"
          placeholder="Note title..."
          maxLength={200}
        />
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="iconSm"
            aria-label={draft.pinned ? "Unpin note" : "Pin note"}
            onClick={() => scheduleSave({ ...draft, pinned: !draft.pinned })}
            className={draft.pinned ? "text-amber-500" : "text-slate-400"}
          >
            {draft.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="iconSm"
            aria-label="Delete note"
            onClick={() => {
              if (saveTimer.current) clearTimeout(saveTimer.current);
              void mutations.deleteNote(draft.id);
              onDelete();
              toast.success("Note deleted");
            }}
            className="text-slate-400 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Textarea
        value={draft.content}
        onChange={(e) => scheduleSave({ ...draft, content: e.target.value })}
        aria-label="Note content"
        placeholder="Start writing..."
        className="sf-scroll min-h-[300px] flex-1 resize-none rounded-none border-0 px-5 py-4 text-[15px] leading-relaxed shadow-none focus-visible:ring-0"
        maxLength={50000}
      />
      <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 px-5 py-3 dark:border-slate-800">
        <Label htmlFor="note-tags" className="text-xs text-slate-400">Tags</Label>
        <Input
          id="note-tags"
          value={draft.tags}
          onChange={(e) => scheduleSave({ ...draft, tags: e.target.value })}
          placeholder="math, vectors"
          className="h-8 flex-1 text-xs"
          maxLength={500}
        />
        <select
          value={draft.notebookId ?? ""}
          onChange={(e) => scheduleSave({ ...draft, notebookId: e.target.value || null })}
          aria-label="Note notebook"
          className="h-8 rounded-md border border-input bg-card px-2 text-xs shadow-sm"
        >
          <option value="">No notebook</option>
          {notebooks.map((nb) => (
            <option key={nb.id} value={nb.id}>{nb.name}</option>
          ))}
        </select>
      </div>
    </>
  );
}

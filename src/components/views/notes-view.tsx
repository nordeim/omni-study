"use client";

import * as React from "react";
import { BookOpen, Folder, FolderPlus, Pin, PinOff, Plus, Search, Tag, Trash2 } from "lucide-react";
import { useDataStore, mutations, type Note, type Notebook } from "@/lib/data";
import { EmptyState } from "./shared";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
      {/* S8-G — measured two-pane layout (NO page-level header): the h1 +
          book-open icon live INSIDE the w-80 left pane with a single 36px
          gradient dropdown (New Note / New Notebook); Radix Select
          comboboxes for notebook/tag filters; the right pane is BARE (no
          card) holding the editor or the centered empty state. */}
      <div className="flex h-[calc(100vh-8rem)] min-h-[480px] gap-6">
        {/* Left pane */}
        <div
          aria-label="Notes list pane"
          className="hidden w-80 flex-col border-r border-slate-100 pr-6 lg:flex dark:border-slate-800"
        >
          <div className="mb-4 flex items-center justify-between">
            <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-800 dark:text-slate-100">
              <BookOpen className="h-6 w-6 text-sf-primary" strokeWidth={2} aria-hidden="true" />
              Notes
            </h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="gradient" size="icon" aria-label="New note menu" title="New note">
                  <Plus className="h-4 w-4" strokeWidth={2} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => void createNote()}>New Note</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setNotebookDialogOpen(true)}>New Notebook</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes..."
              aria-label="Search notes"
              className="h-9 pl-9"
            />
          </div>
          <div className="mb-4 flex gap-2">
            <Select
              value={notebookFilter || "all"}
              onValueChange={(v) => setNotebookFilter(v === "all" ? "" : v)}
            >
              <SelectTrigger aria-label="Filter by notebook" className="h-9 w-full">
                {/* S9-N (measured): the reference's combobox triggers carry
                    leading icons — folder for notebooks, tag for tags. The
                    icon+value group sits left; the chevron stays right
                    (justify-between trigger). */}
                <span className="flex min-w-0 items-center gap-2">
                  <Folder className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={1.75} aria-hidden="true" />
                  <SelectValue />
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Notebooks</SelectItem>
                {notebooks.map((nb) => (
                  <SelectItem key={nb.id} value={nb.id}>{nb.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={tagFilter || "all"}
              onValueChange={(v) => setTagFilter(v === "all" ? "" : v)}
            >
              <SelectTrigger aria-label="Filter by tag" className="h-9 w-full">
                <span className="flex min-w-0 items-center gap-2">
                  <Tag className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={1.75} aria-hidden="true" />
                  <SelectValue />
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {allTags.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="sf-scroll flex-1 space-y-4 overflow-y-auto pb-4" aria-label="Notes list">
            {visible.length === 0 ? (
              <EmptyState icon={BookOpen} title="No notes yet" hint="Create your first note" action={<Button variant="gradient" className="sf-gradient-shadow-lg" onClick={createNote}>New Note</Button>} />
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

        {/* Editor — keyed by note id: switching notes remounts fresh state.
            S8-G: the right pane is BARE (no card wrapper — measured); the
            empty state centers in the full pane height. */}
        <div
          aria-label="Note editor pane"
          className="flex min-h-[420px] min-w-0 flex-1 flex-col"
        >
          {selected ? (
            <NoteEditor
              key={selected.id}
              note={selected}
              notebooks={notebooks}
              onDelete={() => setSelectedId(null)}
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center">
              <EmptyState
                icon={BookOpen}
                title="Select a note"
                hint="Choose a note from the sidebar or create a new one"
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile list — the reference's two-pane renders at EVERY width (its
          w-80 pane overflows to 416px at 390); below lg the clone stacks the
          notes in a no-overflow list instead. S33: the stacked list keeps the
          view's IDENTITY HEADING — the reference renders its h1 at mobile,
          and the stack had lost it (the S16 mobile-only-gap class). The h2
          follows the StudyGroups S8-H pattern: the single h1 lives in the
          desktop pane, keeping main h1 count at 1. */}
      <div className="flex flex-col gap-3 lg:hidden">
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-800 dark:text-slate-100">
            <BookOpen className="h-6 w-6 text-sf-primary" strokeWidth={2} aria-hidden="true" />
            Notes
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="gradient" onClick={createNote} className="gap-1.5">
              <Plus className="h-4 w-4" /> New Note
            </Button>
            <Button variant="outline" size="icon" onClick={() => setNotebookDialogOpen(true)} aria-label="New notebook">
              <FolderPlus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {visible.length === 0 ? (
          <div className="sf-card">
            <EmptyState icon={BookOpen} title="No notes yet" hint="Create your first note" action={<Button variant="gradient" className="sf-gradient-shadow-lg" onClick={createNote}>New Note</Button>} />
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
    // S8-G: the pane is BARE — the editor keeps its own card chrome.
    <div className="sf-card flex min-w-0 flex-1 flex-col overflow-hidden">
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
    </div>
  );
}

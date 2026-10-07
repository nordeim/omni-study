"use client";

import * as React from "react";
import { Calendar, Pencil, Plus, Trash2, Users, X } from "lucide-react";
import { useDataStore, mutations, type StudyGroup, type StudyGroupMember, type Subject } from "@/lib/data";
import { EmptyState, ErrorText, LoadingCards, SubjectChip, ViewHeader, useSubjectMap } from "./shared";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { formatFullDate } from "@/lib/date";
import { cn } from "@/lib/utils";

// S7-B: the reference's 6-swatch picker (measured live — same family as
// deck colors): violet/blue/emerald/amber/red/pink-500, red before pink.
const GROUP_COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"] as const;
const MAX_DIALOG_MEMBERS = 10;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const nativeSelectClass = "flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm";

interface MemberDraft {
  name: string;
  email: string;
}

/**
 * The API returns `members` as a JSON-encoded string (SQLite text column),
 * while the client interface types it as an array — normalize both shapes
 * defensively so the view never crashes on either representation.
 */
function toMemberList(raw: unknown): StudyGroupMember[] {
  if (typeof raw === "string") {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return [];
    }
    return toMemberList(parsed);
  }
  if (!Array.isArray(raw)) return [];
  const out: StudyGroupMember[] = [];
  for (const m of raw) {
    if (typeof m === "object" && m !== null) {
      const rec = m as { name?: unknown; email?: unknown };
      if (typeof rec.name === "string" && rec.name.length > 0) {
        out.push({ name: rec.name, email: typeof rec.email === "string" ? rec.email : "" });
      }
    }
  }
  return out;
}

function groupMembers(group: StudyGroup): StudyGroupMember[] {
  return toMemberList(group.members);
}

function GroupDetailPane({
  group,
  subject,
  onEdit,
  onDelete,
}: {
  group: StudyGroup;
  subject: Subject | null | undefined;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [memberName, setMemberName] = React.useState("");
  const [memberEmail, setMemberEmail] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const members = groupMembers(group);

  async function addMember(e: React.FormEvent) {
    e.preventDefault();
    const name = memberName.trim();
    if (!name || busy) return;
    const email = memberEmail.trim();
    if (email && !EMAIL_RE.test(email)) {
      toast.error("That email address doesn't look right");
      return;
    }
    setBusy(true);
    try {
      await mutations.updateStudyGroup(group.id, { members: [...members, { name, email }] });
      setMemberName("");
      setMemberEmail("");
      toast.success(`${name} added to the group`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add the member");
    } finally {
      setBusy(false);
    }
  }

  async function removeMember(index: number, name: string) {
    try {
      await mutations.updateStudyGroup(group.id, {
        members: members.filter((_, i) => i !== index),
      });
      toast.success(`${name} removed from the group`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove the member");
    }
  }

  return (
    <section className="sf-card overflow-hidden" aria-label={`Details for ${group.name}`}>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4 dark:border-slate-800">
        <div className="flex min-w-0 items-center gap-3">
          <span className="h-3.5 w-3.5 shrink-0 rounded-full" style={{ backgroundColor: group.color }} aria-hidden="true" />
          <h2 className="truncate text-[18px] font-semibold text-slate-800 dark:text-slate-100">{group.name}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onEdit} className="gap-1.5">
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} /> Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="gap-1.5 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} /> Delete
          </Button>
        </div>
      </header>

      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {subject && <SubjectChip subject={subject} />}
            <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <Users className="h-3.5 w-3.5" strokeWidth={1.75} />
              {members.length} {members.length === 1 ? "member" : "members"}
            </span>
            {group.nextMeeting && (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-sf-primary-soft px-2 py-0.5 text-xs font-medium text-sf-primary-strong dark:bg-sf-primary-soft-dark dark:text-sf-primary-strong-dark">
                <Calendar className="h-3.5 w-3.5" strokeWidth={1.75} />
                Meets {formatFullDate(new Date(group.nextMeeting))}
              </span>
            )}
          </div>
          {group.description && (
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{group.description}</p>
          )}
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-slate-100 px-4 py-3 dark:border-slate-800">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sf-primary-soft text-sf-primary-strong dark:bg-sf-primary-soft-dark dark:text-sf-primary-strong-dark">
            <Calendar className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className="text-xs text-slate-400">Next meeting</p>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {group.nextMeeting ? formatFullDate(new Date(group.nextMeeting)) : "Not scheduled yet"}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Members</h3>
          {members.length === 0 ? (
            <p className="text-sm text-slate-400">No members yet — add the first one below.</p>
          ) : (
            <ul className="flex max-h-96 flex-col gap-2 overflow-y-auto sf-scroll">
              {members.map((m, i) => (
                <li
                  key={`${m.name}-${i}`}
                  className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-2.5 dark:border-slate-800"
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold uppercase"
                    style={{ backgroundColor: `${group.color}1a`, color: group.color }}
                    aria-hidden="true"
                  >
                    {m.name.charAt(0)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{m.name}</p>
                    {m.email && <p className="truncate text-xs text-slate-400">{m.email}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => void removeMember(i, m.name)}
                    aria-label={`Remove member ${m.name}`}
                    className="rounded-md p-1.5 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500 dark:text-slate-600 dark:hover:bg-red-950/40"
                  >
                    <X className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <form onSubmit={addMember} className="flex flex-wrap gap-2">
            <Input
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              placeholder="Member name"
              aria-label="New member name"
              maxLength={80}
              className="h-9 min-w-[140px] flex-1"
            />
            <Input
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              placeholder="Email (optional)"
              aria-label="New member email"
              maxLength={200}
              className="h-9 min-w-[160px] flex-1"
            />
            <Button type="submit" size="sm" disabled={busy || !memberName.trim()} className="gap-1">
              <Plus className="h-3.5 w-3.5" strokeWidth={1.75} /> Add member
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}

export function StudyGroupsView() {
  const studyGroups = useDataStore((s) => s.data.studyGroups);
  const subjects = useDataStore((s) => s.data.subjects);
  const status = useDataStore((s) => s.status.studyGroups);
  const error = useDataStore((s) => s.error);
  const loadAll = useDataStore((s) => s.loadAll);
  const subjectMap = useSubjectMap();

  React.useEffect(() => {
    void loadAll(["studyGroups", "subjects"]);
  }, [loadAll]);

  const [search, setSearch] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<StudyGroup | null>(null);

  // ---- Group dialog form state ----
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [subjectId, setSubjectId] = React.useState("");
  const [color, setColor] = React.useState<string>(GROUP_COLORS[0]);
  const [memberRows, setMemberRows] = React.useState<MemberDraft[]>([{ name: "", email: "" }]);
  const [nextMeeting, setNextMeeting] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const loading = status === "idle" || status === "loading";
  const selected = studyGroups.find((g) => g.id === selectedId) ?? null;

  const query = search.trim().toLowerCase();
  const visible = studyGroups.filter((g) => {
    if (!query) return true;
    const inName = g.name.toLowerCase().includes(query);
    const inDescription = g.description.toLowerCase().includes(query);
    const inMembers = groupMembers(g).some((m) => m.name.toLowerCase().includes(query));
    return inName || inDescription || inMembers;
  });

  function updateMemberRow(index: number, patch: Partial<MemberDraft>) {
    setMemberRows((rows) => rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function openCreate() {
    setEditing(null);
    setName("");
    setDescription("");
    setSubjectId("");
    setColor(GROUP_COLORS[0]);
    setMemberRows([{ name: "", email: "" }]);
    setNextMeeting("");
    setDialogOpen(true);
  }

  function openEdit(group: StudyGroup) {
    setEditing(group);
    setName(group.name);
    setDescription(group.description ?? "");
    setSubjectId(group.subjectId ?? "");
    setColor(group.color);
    const existing = groupMembers(group).map((m) => ({ name: m.name, email: m.email }));
    setMemberRows(existing.length > 0 ? existing : [{ name: "", email: "" }]);
    setNextMeeting(group.nextMeeting ? new Date(group.nextMeeting).toISOString().slice(0, 10) : "");
    setDialogOpen(true);
  }

  async function submitGroup(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName || busy) return;
    const members: StudyGroupMember[] = memberRows
      .map((m) => ({ name: m.name.trim(), email: m.email.trim() }))
      .filter((m) => m.name.length > 0);
    const invalid = members.find((m) => m.email.length > 0 && !EMAIL_RE.test(m.email));
    if (invalid) {
      toast.error(`"${invalid.email}" doesn't look like a valid email`);
      return;
    }
    setBusy(true);
    const payload = {
      name: trimmedName,
      description: description.trim(),
      subjectId: subjectId || null,
      color,
      members,
      nextMeeting: nextMeeting || null,
    };
    try {
      if (editing) {
        await mutations.updateStudyGroup(editing.id, payload);
        toast.success("Study group updated");
      } else {
        await mutations.createStudyGroup(payload);
        toast.success("Study group created");
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save the study group");
    } finally {
      setBusy(false);
    }
  }

  async function deleteGroup(group: StudyGroup) {
    try {
      await mutations.deleteStudyGroup(group.id);
      if (selectedId === group.id) setSelectedId(null);
      toast.success("Study group deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete the study group");
    }
  }

  if (status === "error") {
    return <ErrorText message={error ?? "Failed to load study groups"} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <ViewHeader
        title="Study Groups"
        icon={Users}
        actions={
          <Button onClick={openCreate} variant="gradient" className="gap-1.5">
            <Plus className="h-4 w-4" strokeWidth={1.75} /> Create Group
          </Button>
        }
      />

      {loading ? (
        <LoadingCards />
      ) : studyGroups.length === 0 ? (
        <div className="sf-card">
          <EmptyState
            icon={Users}
            title="No study groups"
            hint="Create a group to plan meetings and keep everyone on track."
            action={
              <Button onClick={openCreate} variant="gradient" className="sf-gradient-shadow-lg">
                Create Group
              </Button>
            }
          />
        </div>
      ) : (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* Left column — searchable group list */}
          <aside className="w-full shrink-0 lg:w-80" aria-label="Study groups list">
            <div className="flex flex-col gap-3">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search groups..."
                aria-label="Search study groups"
                className="h-9"
              />
              <div className="flex max-h-[32rem] flex-col gap-3 overflow-y-auto pr-1 sf-scroll">
                {visible.length === 0 ? (
                  <p className="px-1 py-6 text-center text-sm text-slate-400">No groups match "{search.trim()}"</p>
                ) : (
                  visible.map((g) => {
                    const members = groupMembers(g);
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setSelectedId(g.id)}
                        aria-pressed={selectedId === g.id}
                        className={cn(
                          "sf-card w-full p-4 text-left transition-shadow hover:shadow-md",
                          selectedId === g.id && "ring-2 ring-sf-primary",
                        )}
                      >
                        <span className="flex items-center gap-3">
                          <span
                            className="h-3 w-3 shrink-0 rounded-full"
                            style={{ backgroundColor: g.color }}
                            aria-hidden="true"
                          />
                          <span className="min-w-0 flex-1 truncate text-[15px] font-semibold text-slate-800 dark:text-slate-100">
                            {g.name}
                          </span>
                        </span>
                        <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                          <span className="inline-flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" strokeWidth={1.75} />
                            {members.length} {members.length === 1 ? "member" : "members"}
                          </span>
                          {g.nextMeeting && (
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" strokeWidth={1.75} />
                              {new Date(g.nextMeeting).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          )}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </aside>

          {/* Right column — selected group detail */}
          <div className="min-w-0 flex-1">
            {selected ? (
              <GroupDetailPane
                key={selected.id}
                group={selected}
                subject={selected.subjectId ? subjectMap.get(selected.subjectId) : undefined}
                onEdit={() => openEdit(selected)}
                onDelete={() => void deleteGroup(selected)}
              />
            ) : (
              <div className="sf-card">
                <EmptyState
                  icon={Users}
                  title="Select a group"
                  hint="Choose a study group from the list to see its members and meetings."
                />
              </div>
            )}
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Study Group" : "New Study Group"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitGroup} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sg-name">Name</Label>
              <Input
                id="sg-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Calculus crew"
                maxLength={120}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sg-description">Description</Label>
              <Textarea
                id="sg-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What will this group focus on?"
                rows={3}
                maxLength={2000}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="sg-subject">Subject</Label>
                <select
                  id="sg-subject"
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
                <Label htmlFor="sg-meeting">Next meeting (optional)</Label>
                <input
                  id="sg-meeting"
                  type="date"
                  value={nextMeeting}
                  onChange={(e) => setNextMeeting(e.target.value)}
                  className={nativeSelectClass}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Color</Label>
              <div className="flex items-center gap-2" role="group" aria-label="Group color swatches">
                {GROUP_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    aria-label={`Choose color ${c}`}
                    aria-pressed={color === c}
                    className={cn(
                      "h-8 w-8 rounded-full transition-transform sf-focus",
                      color === c && "scale-110 ring-2 ring-slate-400 ring-offset-2 dark:ring-offset-slate-900",
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Members ({memberRows.filter((m) => m.name.trim()).length} added)</Label>
              <div className="flex flex-col gap-2">
                {memberRows.map((m, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={m.name}
                      onChange={(e) => updateMemberRow(i, { name: e.target.value })}
                      placeholder="Name"
                      aria-label={`Member ${i + 1} name`}
                      maxLength={80}
                      className="h-9"
                    />
                    <Input
                      value={m.email}
                      onChange={(e) => updateMemberRow(i, { email: e.target.value })}
                      placeholder="Email (optional)"
                      aria-label={`Member ${i + 1} email`}
                      maxLength={200}
                      className="h-9"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="iconSm"
                      onClick={() => setMemberRows((rows) => rows.filter((_, idx) => idx !== i))}
                      aria-label={`Remove member row ${i + 1}`}
                      className="shrink-0 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400"
                    >
                      <X className="h-4 w-4" strokeWidth={1.75} />
                    </Button>
                  </div>
                ))}
              </div>
              {memberRows.length < MAX_DIALOG_MEMBERS && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setMemberRows((rows) => [...rows, { name: "", email: "" }])}
                  className="w-fit gap-1"
                >
                  <Plus className="h-3.5 w-3.5" strokeWidth={1.75} /> Add member
                </Button>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="gradient" disabled={busy || !name.trim()}>
                {busy ? "Saving…" : editing ? "Save changes" : "Create Group"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

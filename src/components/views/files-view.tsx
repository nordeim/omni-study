"use client";

import * as React from "react";
import {
  ChevronRight,
  File,
  FileImage,
  FileText,
  Folder,
  FolderOpen,
  FolderPlus,
  LayoutGrid,
  Link2,
  List,
  Trash2,
  Upload,
} from "lucide-react";
import { useDataStore, mutations, type FileFolder, type FileItem } from "@/lib/data";
import { apiUpload } from "@/lib/api";
import { EmptyState, ErrorText, LoadingCards, ViewHeader } from "./shared";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

type TypeFilter = "all" | "image" | "document" | "other";
type ViewMode = "grid" | "list";
type FileKind = "image" | "document" | "link" | "other";

const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

const KIND_ICONS: Record<FileKind, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  image: FileImage,
  document: FileText,
  link: Link2,
  other: File,
};

const KIND_ICON_CLASSES: Record<FileKind, string> = {
  image: "bg-sf-primary-soft text-sf-primary-strong dark:bg-sf-primary-soft-dark dark:text-sf-primary-strong-dark",
  document: "bg-emerald-50 text-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-400",
  link: "bg-pink-50 text-pink-500 dark:bg-pink-950/40 dark:text-pink-400",
  other: "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500",
};

const KIND_TEXT_CLASSES: Record<FileKind, string> = {
  image: "text-sf-primary-strong dark:text-sf-primary-strong-dark",
  document: "text-emerald-500 dark:text-emerald-400",
  link: "text-pink-500 dark:text-pink-400",
  other: "text-slate-400 dark:text-slate-500",
};

function formatFileSize(bytes: number): string {
  if (bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileKind(mimeType: string): FileKind {
  if (mimeType === "text/uri-list") return "link";
  if (mimeType.startsWith("image/")) return "image";
  if (
    mimeType.startsWith("text/") ||
    mimeType === "application/pdf" ||
    mimeType.includes("word") ||
    mimeType.includes("presentation") ||
    mimeType.includes("sheet")
  ) {
    return "document";
  }
  return "other";
}

function matchesFilter(kind: FileKind, filter: TypeFilter): boolean {
  if (filter === "all") return true;
  if (filter === "image") return kind === "image";
  if (filter === "document") return kind === "document";
  return kind === "other" || kind === "link";
}

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function FilesView() {
  const folders = useDataStore((s) => s.data.folders);
  const files = useDataStore((s) => s.data.files);
  const foldersStatus = useDataStore((s) => s.status.folders);
  const filesStatus = useDataStore((s) => s.status.files);
  const error = useDataStore((s) => s.error);
  const loadAll = useDataStore((s) => s.loadAll);
  const refresh = useDataStore((s) => s.refresh);

  React.useEffect(() => {
    void loadAll(["folders", "files"]);
  }, [loadAll]);

  const [currentFolderId, setCurrentFolderId] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<TypeFilter>("all");
  const [viewMode, setViewMode] = React.useState<ViewMode>("grid");
  const [folderDialogOpen, setFolderDialogOpen] = React.useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = React.useState(false);
  const [folderName, setFolderName] = React.useState("");
  const [linkName, setLinkName] = React.useState("");
  const [linkUrl, setLinkUrl] = React.useState("");
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const loading =
    (foldersStatus === "idle" || foldersStatus === "loading") &&
    (filesStatus === "idle" || filesStatus === "loading");

  // Ancestor chain for the breadcrumb (root → ... → current folder).
  const breadcrumb = React.useMemo(() => {
    const chain: FileFolder[] = [];
    let cursor: FileFolder | undefined = currentFolderId
      ? folders.find((f) => f.id === currentFolderId)
      : undefined;
    while (cursor) {
      chain.unshift(cursor);
      const parentId: string | null = cursor.parentId;
      cursor = parentId ? folders.find((f) => f.id === parentId) : undefined;
    }
    return chain;
  }, [folders, currentFolderId]);

  const query = search.trim().toLowerCase();
  const childFolders = folders
    .filter((f) => f.parentId === currentFolderId)
    .filter((f) => !query || f.name.toLowerCase().includes(query))
    .sort((a, b) => a.name.localeCompare(b.name));
  const currentFiles = files
    .filter((f) => f.folderId === currentFolderId)
    .filter((f) => matchesFilter(fileKind(f.mimeType), typeFilter))
    .filter((f) => !query || f.name.toLowerCase().includes(query))
    .sort((a, b) => a.name.localeCompare(b.name));

  function folderItemCount(folderId: string): number {
    const subFolders = folders.filter((f) => f.parentId === folderId).length;
    const docs = files.filter((f) => f.folderId === folderId).length;
    return subFolders + docs;
  }

  async function handleFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error(`"${file.name}" is larger than the 2 MB limit — add it as a link instead.`);
      return;
    }
    setUploading(true);
    try {
      await apiUpload<unknown>("/api/files", file, currentFolderId);
      await refresh("files");
      toast.success("File uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not upload the file");
    } finally {
      setUploading(false);
    }
  }

  async function submitFolder(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = folderName.trim();
    if (!trimmed) return;
    try {
      await mutations.createFolder({ name: trimmed, parentId: currentFolderId });
      setFolderName("");
      setFolderDialogOpen(false);
      toast.success("Folder created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create the folder");
    }
  }

  async function submitLink(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = linkName.trim();
    let url = linkUrl.trim();
    if (!trimmed || !url) return;
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    try {
      new URL(url);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }
    try {
      await mutations.createFileLink({ name: trimmed, url, folderId: currentFolderId });
      setLinkName("");
      setLinkUrl("");
      setLinkDialogOpen(false);
      toast.success("Link added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add the link");
    }
  }

  async function deleteFileItem(file: FileItem) {
    try {
      await mutations.deleteFile(file.id);
      toast.success("File deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete the file");
    }
  }

  async function deleteFolderItem(folder: FileFolder) {
    try {
      await mutations.deleteFolder(folder.id);
      if (currentFolderId === folder.id) setCurrentFolderId(folder.parentId ?? null);
      toast.success("Folder deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete the folder");
    }
  }

  if (foldersStatus === "error" || filesStatus === "error") {
    return <ErrorText message={error ?? "Failed to load files"} />;
  }

  const isEmpty = childFolders.length === 0 && currentFiles.length === 0;

  const deleteFileButton = (file: FileItem) => (
    <button
      type="button"
      onClick={() => void deleteFileItem(file)}
      aria-label={`Delete file "${file.name}"`}
      className="rounded-md p-1.5 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500 dark:text-slate-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
    >
      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
    </button>
  );

  const deleteFolderButton = (folder: FileFolder) => (
    <button
      type="button"
      onClick={() => void deleteFolderItem(folder)}
      aria-label={`Delete folder "${folder.name}"`}
      className="rounded-md p-1.5 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500 dark:text-slate-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
    >
      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
    </button>
  );

  return (
    <div className="flex flex-col gap-6">
      <ViewHeader
        title="Files"
        subtitle="Upload materials, save links, and keep everything organized"
        actions={
          <>
            <Button variant="outline" onClick={() => setFolderDialogOpen(true)} className="gap-1.5">
              <FolderPlus className="h-4 w-4" strokeWidth={1.75} /> New Folder
            </Button>
            <Button variant="outline" onClick={() => setLinkDialogOpen(true)} className="gap-1.5">
              <Link2 className="h-4 w-4" strokeWidth={1.75} /> Add Link
            </Button>
            <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="gap-1.5">
              <Upload className="h-4 w-4" strokeWidth={1.75} /> {uploading ? "Uploading…" : "Upload"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              tabIndex={-1}
              aria-hidden="true"
              onChange={(e) => void handleFileChosen(e)}
            />
          </>
        }
      />

      {/* Breadcrumb */}
      <nav aria-label="Folder breadcrumb" className="flex flex-wrap items-center gap-1 text-sm">
        <button
          type="button"
          onClick={() => setCurrentFolderId(null)}
          aria-current={currentFolderId ? undefined : "page"}
          className={cn(
            "rounded-md px-2 py-1 font-medium transition-colors",
            currentFolderId
              ? "text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
              : "bg-sf-primary-soft text-sf-primary-strong dark:bg-sf-primary-soft-dark dark:text-sf-primary-strong-dark",
          )}
        >
          All Files
        </button>
        {breadcrumb.map((f, i) => {
          const isLast = i === breadcrumb.length - 1;
          return (
            <span key={f.id} className="flex items-center gap-1">
              <ChevronRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600" aria-hidden="true" />
              {isLast ? (
                <span
                  aria-current="page"
                  className="rounded-md bg-sf-primary-soft px-2 py-1 font-medium text-sf-primary-strong dark:bg-sf-primary-soft-dark dark:text-sf-primary-strong-dark"
                >
                  {f.name}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setCurrentFolderId(f.id)}
                  className="rounded-md px-2 py-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  {f.name}
                </button>
              )}
            </span>
          );
        })}
      </nav>

      {/* Search, type filter, view toggle */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search files..."
          aria-label="Search files"
          className="h-9 min-w-[180px] flex-1"
        />
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TypeFilter)}>
          <SelectTrigger className="w-[130px]" aria-label="Filter files by type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="image">Images</SelectItem>
            <SelectItem value="document">Documents</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        <div
          className="flex items-center gap-1 rounded-md border border-input bg-card p-0.5 shadow-sm"
          role="group"
          aria-label="View mode"
        >
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="iconSm"
            onClick={() => setViewMode("grid")}
            aria-label="Grid view"
            aria-pressed={viewMode === "grid"}
          >
            <LayoutGrid className="h-4 w-4" strokeWidth={1.75} />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="iconSm"
            onClick={() => setViewMode("list")}
            aria-label="List view"
            aria-pressed={viewMode === "list"}
          >
            <List className="h-4 w-4" strokeWidth={1.75} />
          </Button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingCards />
      ) : isEmpty ? (
        <div className="sf-card">
          <EmptyState
            icon={FolderOpen}
            title="No files yet"
            hint={
              currentFolderId
                ? "This folder is empty — upload a file or create a subfolder."
                : "Upload a file, add a link, or create a folder to get started."
            }
          />
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {childFolders.map((f) => {
            const count = folderItemCount(f.id);
            return (
              <div key={f.id} className="sf-card relative flex flex-col p-4">
                <button
                  type="button"
                  onClick={() => setCurrentFolderId(f.id)}
                  className="flex flex-col gap-3 text-left"
                  aria-label={`Open folder "${f.name}"`}
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/40">
                    <Folder className="h-6 w-6 text-amber-400" strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[14px] font-medium text-slate-800 dark:text-slate-100">
                      {f.name}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-400">
                      {count} {count === 1 ? "item" : "items"}
                    </span>
                  </span>
                </button>
                <span className="absolute right-2 top-2">{deleteFolderButton(f)}</span>
              </div>
            );
          })}
          {currentFiles.map((f) => {
            const kind = fileKind(f.mimeType);
            const Icon = KIND_ICONS[kind];
            return (
              <div key={f.id} className="sf-card relative flex flex-col p-4">
                <button
                  type="button"
                  onClick={() => window.open(`/api/files/${f.id}`, "_blank")}
                  className="flex flex-col gap-3 text-left"
                  aria-label={`Open file "${f.name}"`}
                >
                  <span className={cn("flex h-11 w-11 items-center justify-center rounded-lg", KIND_ICON_CLASSES[kind])}>
                    <Icon className="h-6 w-6" strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[14px] font-medium text-slate-800 dark:text-slate-100">
                      {f.name}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-slate-400">
                      {formatFileSize(f.size)} · {shortDate(f.createdAt)}
                    </span>
                  </span>
                </button>
                <span className="absolute right-2 top-2">{deleteFileButton(f)}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="sf-card overflow-hidden">
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {childFolders.map((f) => (
              <li
                key={f.id}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
              >
                <Folder className="h-5 w-5 shrink-0 text-amber-400" strokeWidth={1.75} aria-hidden="true" />
                <button
                  type="button"
                  onClick={() => setCurrentFolderId(f.id)}
                  className="min-w-0 flex-1 truncate text-left text-sm font-medium text-slate-800 dark:text-slate-100"
                >
                  {f.name}
                </button>
                <span className="hidden shrink-0 text-xs text-slate-400 sm:block">
                  {folderItemCount(f.id)} items
                </span>
                <span className="hidden shrink-0 text-xs text-slate-400 md:block">{shortDate(f.createdAt)}</span>
                {deleteFolderButton(f)}
              </li>
            ))}
            {currentFiles.map((f) => {
              const kind = fileKind(f.mimeType);
              const Icon = KIND_ICONS[kind];
              return (
                <li
                  key={f.id}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  <Icon
                    className={cn("h-5 w-5 shrink-0", KIND_TEXT_CLASSES[kind])}
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                  <button
                    type="button"
                    onClick={() => window.open(`/api/files/${f.id}`, "_blank")}
                    className="min-w-0 flex-1 truncate text-left text-sm font-medium text-slate-800 dark:text-slate-100"
                  >
                    {f.name}
                  </button>
                  <span className="hidden shrink-0 text-xs text-slate-400 sm:block">
                    {formatFileSize(f.size)}
                  </span>
                  <span className="hidden shrink-0 text-xs text-slate-400 md:block">{shortDate(f.createdAt)}</span>
                  {deleteFileButton(f)}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* New folder dialog */}
      <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>New Folder</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitFolder} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="folder-name">Name</Label>
              <Input
                id="folder-name"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="e.g. Lecture notes"
                maxLength={120}
                required
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFolderDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!folderName.trim()}>
                Create Folder
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add link dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Link</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitLink} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="link-name">Name</Label>
              <Input
                id="link-name"
                value={linkName}
                onChange={(e) => setLinkName(e.target.value)}
                placeholder="e.g. Organic chemistry playlist"
                maxLength={200}
                required
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://…"
                maxLength={2000}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setLinkDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!linkName.trim() || !linkUrl.trim()}>
                Add Link
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

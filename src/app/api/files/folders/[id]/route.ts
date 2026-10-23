import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { errorResponse } from "@/lib/server/http";

// Folder item route: DELETE removes a folder tree. Ownership is enforced in
// the WHERE clause (the files/[id] pattern). The schema's FolderTree
// self-relation (onDelete: Cascade) removes descendant folders, and
// FileItem.folder (Cascade) removes the files stored inside them.
//
// S91: this route was MISSING since the S13 files build — the client
// (data.ts deleteFolder) and the Files view's folder-card trash button
// always called it, and every click 404'd (folders could be created but
// never deleted through the UI). Pinned by tests/e2e/s91-files-folders-delete.spec.ts.

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const folder = await db.fileFolder.findFirst({ where: { id, userId: user.id } });
    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }
    await db.fileFolder.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}

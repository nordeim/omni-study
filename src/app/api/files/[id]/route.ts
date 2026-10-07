import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { errorResponse } from "@/lib/server/http";

// File item routes: GET downloads the blob (or redirects for link-files),
// DELETE removes it. Ownership is enforced in the WHERE clause.

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const file = await db.fileItem.findFirst({ where: { id, userId: user.id } });
    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    if (!file.data) {
      if (file.url) return NextResponse.redirect(file.url, 302);
      return NextResponse.json({ error: "File has no stored payload" }, { status: 404 });
    }
    const bytes = Buffer.from(file.data, "base64");
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": file.mimeType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(file.name)}"`,
        "Content-Length": String(bytes.length),
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const file = await db.fileItem.findFirst({ where: { id, userId: user.id } });
    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    await db.fileItem.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}

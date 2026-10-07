import { db } from "@/lib/db";
import { jsonOk, withUser } from "@/lib/server/http";

// File collection: GET lists file metadata (never the base64 payload).
export const GET = withUser(async (userId) =>
  jsonOk(
    await db.fileItem.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        folderId: true,
        mimeType: true,
        size: true,
        url: true,
        createdAt: true,
      },
    }),
  ),
);

// POST — multipart upload for small files (<= 2 MiB payload stored in
// SQLite as base64; larger files are rejected with an actionable error).
const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

export const POST = withUser(async (userId, req) => {
  const form = await req.formData().catch(() => null);
  if (!form) {
    return jsonOk({ error: "Expected multipart/form-data with a 'file' field" }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) {
    return jsonOk({ error: "Missing 'file' field" }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return jsonOk(
      { error: "File is larger than the 2 MB limit. Add it as a link instead." },
      { status: 413 },
    );
  }
  const folderIdRaw = form.get("folderId");
  const folderId = typeof folderIdRaw === "string" && folderIdRaw ? folderIdRaw : null;
  if (folderId) {
    const folder = await db.fileFolder.findFirst({ where: { id: folderId, userId } });
    if (!folder) {
      return jsonOk({ error: "Folder not found" }, { status: 400 });
    }
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const record = await db.fileItem.create({
    data: {
      userId,
      name: file.name.slice(0, 200),
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      data: buffer.toString("base64"),
      folderId,
    },
    select: {
      id: true,
      name: true,
      folderId: true,
      mimeType: true,
      size: true,
      url: true,
      createdAt: true,
    },
  });
  return jsonOk(record, { status: 201 });
});

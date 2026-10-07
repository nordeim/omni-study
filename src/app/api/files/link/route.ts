import { db } from "@/lib/db";
import { BadRequestError, jsonOk, withUser, parseWith, readJson } from "@/lib/server/http";
import { fileLinkSchema } from "@/lib/validation";

// Link-files: metadata records pointing at external URLs (no payload).
export const POST = withUser(async (userId, req) => {
  const body = await readJson(req);
  const data = parseWith(fileLinkSchema, body as Record<string, unknown>);
  if (data.folderId) {
    const folder = await db.fileFolder.findFirst({ where: { id: data.folderId, userId } });
    if (!folder) throw new BadRequestError("Folder not found");
  }
  const file = await db.fileItem.create({
    data: {
      userId,
      name: data.name,
      url: data.url,
      mimeType: "text/uri-list",
      size: 0,
      folderId: data.folderId || null,
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
  return jsonOk(file, { status: 201 });
});

export { POST as PUT };

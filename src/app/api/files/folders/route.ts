import { db } from "@/lib/db";
import { BadRequestError, jsonOk, withUser, parseWith } from "@/lib/server/http";
import { fileFolderSchema } from "@/lib/validation";

// Folder collection: GET lists all folders (the client assembles the tree);
// POST creates one (parent must be owned when provided).
export const GET = withUser(async (userId) =>
  jsonOk(await db.fileFolder.findMany({ where: { userId }, orderBy: { createdAt: "asc" } })),
);

export const POST = withUser(async (userId, req) => {
  const body = await req.json().catch(() => {
    throw new BadRequestError("Request body must be valid JSON");
  });
  const data = parseWith(fileFolderSchema, body as Record<string, unknown>);
  if (data.parentId) {
    const parent = await db.fileFolder.findFirst({ where: { id: data.parentId, userId } });
    if (!parent) throw new BadRequestError("Parent folder not found");
  }
  const folder = await db.fileFolder.create({
    data: { userId, name: data.name, parentId: data.parentId || null },
  });
  return jsonOk(folder, { status: 201 });
});

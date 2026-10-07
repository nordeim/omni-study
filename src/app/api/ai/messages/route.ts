import { db } from "@/lib/db";
import { jsonOk, withUser } from "@/lib/server/http";

// Chat history: GET (ascending), DELETE (clear).
export const GET = withUser(async (userId) =>
  jsonOk(await db.aiChatMessage.findMany({ where: { userId }, orderBy: { createdAt: "asc" }, take: 200 })),
);

export const DELETE = withUser(async (userId) => {
  await db.aiChatMessage.deleteMany({ where: { userId } });
  return jsonOk({ ok: true });
});

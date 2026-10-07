import { db } from "@/lib/db";
import { jsonOk, withUser, parseWith, readJson } from "@/lib/server/http";
import { calculatorHistorySchema } from "@/lib/validation";

export const GET = withUser(async (userId) =>
  jsonOk(
    await db.calculatorHistoryEntry.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ),
);

export const POST = withUser(async (userId, req) => {
  const body = await readJson(req);
  const data = parseWith(calculatorHistorySchema, body as Record<string, unknown>);
  const entry = await db.calculatorHistoryEntry.create({
    data: { userId, expression: data.expression, result: data.result, mode: data.mode },
  });
  return jsonOk(entry, { status: 201 });
});

export const DELETE = withUser(async (userId) => {
  await db.calculatorHistoryEntry.deleteMany({ where: { userId } });
  return jsonOk({ ok: true });
});

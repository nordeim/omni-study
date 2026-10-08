import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimit, requireUser } from "@/lib/auth";
import { errorResponse, parseWith, readJson } from "@/lib/server/http";
import { aiChatSchema } from "@/lib/validation";

// AI Study Assistant chat — z-ai-web-dev-sdk is server-only (never bundled
// client-side). Perserves the conversation in AiChatMessage for history.

const SYSTEM_PROMPTS: Record<string, string> = {
  chat:
    "You are StudyFlow's AI Study Assistant — a friendly, encouraging study tutor. " +
    "Answer study-related questions clearly and concisely. Use short paragraphs or " +
    "bullet lists where helpful. If a question is outside studying/education, briefly " +
    "answer and steer back to studying. Never invent facts; say when unsure.",
  explain:
    "You are a patient tutor explaining a concept. Define the concept simply, then " +
    "build up with an example, an analogy, and one common misconception. Keep it " +
    "under 250 words unless the user asks for more.",
  tips:
    "You are a study-coach. Give 5 practical, specific study tips relevant to the " +
    "user's message (technique, timing, environment, retention, wellbeing). Format " +
    "as a numbered list with one-sentence explanations.",
  summarize:
    "Summarize the user's material. Produce: (1) a 2-sentence overview, (2) 3-6 key " +
    "bullet points, (3) one 'likely exam question' at the end. Preserve factual accuracy.",
  solve:
    "Solve the user's problem step by step. Number every step, show the working, and " +
    "finish with a clearly labelled final answer line. If information is missing, state " +
    "exactly what's needed.",
  translate:
    "Translate the user's text. Default to English unless they specify a target " +
    "language. Output the translation first, then a 2-line note on nuances.",
  essay:
    "Help with essay ideas. Offer 3 distinct angles with a one-line thesis each, then " +
    "suggest a simple paragraph outline for the strongest angle. Encourage originality.",
};

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    // S14-C1: per-USER budget for the app's only per-request cost surface
    // (each call triggers an LLM completion). Keyed by the authenticated
    // user, not the IP; 20/15 min is ~3x the heaviest realistic burst.
    const limit = checkRateLimit(`ai:${user.id}`, 20);
    if (!limit.ok) {
      return NextResponse.json(
        { error: `Too many AI requests. Try again in ${limit.retryAfterSec}s.` },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
      );
    }
    const body = await readJson(req);
    const data = parseWith(aiChatSchema, body as Record<string, unknown>);

    const history = await db.aiChatMessage.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
      take: 20,
    });

    const systemPrompt =
      SYSTEM_PROMPTS[data.mode] ?? SYSTEM_PROMPTS["chat"]!;

    const { default: ZAI } = await import("z-ai-web-dev-sdk");
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
        ...data.messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      thinking: { type: "disabled" },
      max_tokens: 1200,
    });
    const reply = completion.choices[0]?.message?.content?.trim();
    if (!reply) {
      return NextResponse.json({ error: "The assistant returned an empty reply. Try again." }, { status: 502 });
    }

    // Persist the latest user message + reply.
    const lastUser = data.messages[data.messages.length - 1]!;
    const [userMsg, assistantMsg] = await db.$transaction([
      db.aiChatMessage.create({ data: { userId: user.id, role: "user", content: lastUser.content } }),
      db.aiChatMessage.create({ data: { userId: user.id, role: "assistant", content: reply } }),
    ]);

    return NextResponse.json({ message: { ...assistantMsg } , echoed: { ...userMsg } });
  } catch (err) {
    return errorResponse(err);
  }
}

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimit, requireUser } from "@/lib/auth";
import { errorResponse, parseWith, readJson } from "@/lib/server/http";
import { aiGenerateCardsSchema } from "@/lib/validation";

// S7-A: AI card generation for a flashcard deck. Mirrors the reference's
// "AI Generate" deck-detail button (measured live) — a functional superset:
// our cards actually persist. z-ai-web-dev-sdk is server-only.

interface GeneratedCard {
  front: string;
  back: string;
  difficulty: "easy" | "medium" | "hard";
}

function parseCards(raw: string, count: number): GeneratedCard[] {
  const jsonMatch = raw.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];
  try {
    const parsed: unknown = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed)) return [];
    const out: GeneratedCard[] = [];
    for (const item of parsed) {
      if (typeof item !== "object" || item === null) continue;
      const c = item as { front?: unknown; back?: unknown; difficulty?: unknown };
      if (typeof c.front === "string" && typeof c.back === "string" && c.front && c.back) {
        const difficulty =
          c.difficulty === "easy" || c.difficulty === "hard" ? c.difficulty : "medium";
        out.push({ front: c.front.slice(0, 2000), back: c.back.slice(0, 2000), difficulty });
      }
      if (out.length >= count) break;
    }
    return out;
  } catch {
    return [];
  }
}

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
    const data = parseWith(aiGenerateCardsSchema, body as Record<string, unknown>);

    const deck = await db.flashcardDeck.findFirst({
      where: { id: data.deckId, userId: user.id },
      include: { subject: { select: { name: true } } },
    });
    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    const topic = [deck.name, deck.description, deck.subject?.name].filter(Boolean).join(" — ");
    const { default: ZAI } = await import("z-ai-web-dev-sdk");
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You generate study flashcards. Reply ONLY with a JSON array of objects " +
            'with keys "front" (a concise question or prompt), "back" (the answer), and ' +
            '"difficulty" ("easy" | "medium" | "hard"). No markdown, no prose, no code fences.',
        },
        {
          role: "user",
          content: `Generate ${data.count} flashcards about: ${topic}.`,
        },
      ],
      thinking: { type: "disabled" },
      max_tokens: 2000,
    });
    const reply = completion.choices[0]?.message?.content?.trim() ?? "";
    const cards = parseCards(reply, data.count);
    if (cards.length === 0) {
      return NextResponse.json(
        { error: "The generator returned no usable cards. Try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ cards });
  } catch (err) {
    return errorResponse(err);
  }
}

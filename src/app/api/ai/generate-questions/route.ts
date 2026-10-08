import { NextResponse } from "next/server";
import { checkRateLimit, requireUser } from "@/lib/auth";
import { errorResponse, parseWith, readJson } from "@/lib/server/http";
import { aiGenerateQuestionsSchema } from "@/lib/validation";

// S7-B: AI question generation for practice tests. Mirrors the reference's
// measured "AI Generate Questions" dialog button (the reference generates 10
// questions with types multiple_choice/true_false/short_answer — generation
// works there while test creation is broken). Our version persists through
// the clone's working CRUD. z-ai-web-dev-sdk is server-only.

interface GeneratedQuestion {
  question: string;
  type: "multiple_choice" | "true_false" | "short_answer";
}

function parseQuestions(raw: string, count: number): GeneratedQuestion[] {
  const jsonMatch = raw.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];
  try {
    const parsed: unknown = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed)) return [];
    const out: GeneratedQuestion[] = [];
    for (const item of parsed) {
      if (typeof item !== "object" || item === null) continue;
      const q = item as { question?: unknown; type?: unknown };
      if (typeof q.question === "string" && q.question) {
        const type =
          q.type === "multiple_choice" || q.type === "true_false" || q.type === "short_answer"
            ? q.type
            : "short_answer";
        out.push({ question: q.question.slice(0, 1000), type });
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
    const data = parseWith(aiGenerateQuestionsSchema, body as Record<string, unknown>);

    const { default: ZAI } = await import("z-ai-web-dev-sdk");
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You generate practice-test questions. Reply ONLY with a JSON array of " +
            'objects with keys "question" (a clear, self-contained question) and "type" ' +
            '("multiple_choice" | "true_false" | "short_answer"). Mix the three types. ' +
            "No markdown, no prose, no code fences, no answer keys.",
        },
        {
          role: "user",
          content: `Generate ${data.count} questions for a practice test titled "${data.title}"${data.context ? ` about: ${data.context}` : ""}.`,
        },
      ],
      thinking: { type: "disabled" },
      max_tokens: 2400,
    });
    const reply = completion.choices[0]?.message?.content?.trim() ?? "";
    const questions = parseQuestions(reply, data.count);
    if (questions.length === 0) {
      return NextResponse.json(
        { error: "The generator returned no usable questions. Try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ questions });
  } catch (err) {
    return errorResponse(err);
  }
}

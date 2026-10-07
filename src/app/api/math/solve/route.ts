import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { errorResponse, parseWith, readJson } from "@/lib/server/http";
import { z } from "zod";

// Math Solver — text problems (LLM) and image problems (vision-capable model,
// same SDK). Returns a structured step-by-step solution.

const solveSchema = z.object({
  problem: z.string().min(1).max(2000),
  image: z
    .string()
    .max(6 * 1024 * 1024)
    .regex(/^data:image\/[a-z+]+;base64,[A-Za-z0-9+/=]+$/)
    .optional(),
});

const MATH_SYSTEM =
  "You are StudyFlow's Math Solver. Solve the given problem with clear numbered steps. " +
  "Rules: show intermediate working; use plain text math notation (x^2, sqrt(x), pi) that " +
  "renders in any font; end with a line 'Answer: <result>'. If the problem is ambiguous or " +
  "missing data, list exactly what is missing. Never skip steps.";

export async function POST(req: Request) {
  try {
    await requireUser();
    const body = await readJson(req);
    const data = parseWith(solveSchema, body as Record<string, unknown>);

    const { default: ZAI } = await import("z-ai-web-dev-sdk");
    const zai = await ZAI.create();

    let solution: string | undefined;
    if (data.image) {
      const prompt =
        "Solve the math problem in this image. If multiple problems are visible, solve each one, numbered.";
      const completion = await zai.chat.completions.createVision({
        model: "glm-4.5v",
        messages: [
          { role: "system", content: MATH_SYSTEM },
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: data.image } },
            ],
          },
        ],
        thinking: { type: "disabled" },
      });
      solution = completion.choices[0]?.message?.content?.trim();
    } else {
      const completion = await zai.chat.completions.create({
        messages: [
          { role: "system", content: MATH_SYSTEM },
          { role: "user", content: `Solve this problem:\n\n${data.problem}` },
        ],
        thinking: { type: "disabled" },
        max_tokens: 1200,
      });
      solution = completion.choices[0]?.message?.content?.trim();
    }

    if (!solution) {
      return NextResponse.json({ error: "The solver returned an empty solution. Try again." }, { status: 502 });
    }
    return NextResponse.json({ solution });
  } catch (err) {
    return errorResponse(err);
  }
}

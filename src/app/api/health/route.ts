import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Liveness + database readiness probe (the Playwright webServer gate and
// any deploy health check hit this).
export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", db: "up", app: "studyflow" });
  } catch {
    return NextResponse.json({ status: "degraded", db: "down", app: "studyflow" }, { status: 503 });
  }
}

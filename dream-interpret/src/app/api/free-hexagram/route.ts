import { NextRequest, NextResponse } from "next/server";
import { buildDailyHexagramReport, type DailyHexagramInput } from "@/lib/daily-hexagram";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as DailyHexagramInput;
    const report = buildDailyHexagramReport(body);
    return NextResponse.json({ ok: true, report });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "起卦失败，请稍后再试。" },
      { status: 400 },
    );
  }
}

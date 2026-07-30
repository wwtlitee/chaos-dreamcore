import { NextRequest, NextResponse } from "next/server";
import { buildDreamOracleReport, type DreamOracleInput } from "@/lib/dream-oracle";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as DreamOracleInput;
    const { dream } = body;

    if (!dream || typeof dream !== "string") {
      return NextResponse.json(
        { error: "请提供梦境描述" },
        { status: 400 }
      );
    }

    const report = buildDreamOracleReport(body);
    const interpretation = report.sections
      .flatMap((section) => [
        section.title,
        ...(section.paragraphs ?? []),
        ...(section.bullets ?? []),
        ...(section.items ?? []).flatMap((item) => [item.title, item.verdict ?? "", ...(item.paragraphs ?? [])]),
      ])
      .filter(Boolean)
      .join("\n");

    return NextResponse.json({
      ok: true,
      report,
      interpretation,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("解梦API错误:", error);
    return NextResponse.json(
      { error: "解梦过程中出现错误" },
      { status: 500 }
    );
  }
}

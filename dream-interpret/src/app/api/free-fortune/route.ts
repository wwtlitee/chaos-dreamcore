import { NextRequest, NextResponse } from "next/server";
import { buildBaziFortuneReport, type BaziFortuneInput } from "@/lib/bazi-fortune";
import { buildPersonalProfile } from "@/lib/personal-profile";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as BaziFortuneInput;
    if (!String(body.name || "").trim()) {
      return NextResponse.json({ ok: false, error: "昵称不能为空" }, { status: 400 });
    }
    if (!String(body.birthDate || "").trim()) {
      return NextResponse.json({ ok: false, error: "生日不能为空" }, { status: 400 });
    }
    const targetDate = body.targetDate || new Date().toISOString().slice(0, 10);
    const profile = buildPersonalProfile(body.birthDate, targetDate);
    const report = buildBaziFortuneReport({ ...body, targetDate });
    report.sections.splice(2, 0, {
      id: "profile",
      eyebrow: "PROFILE",
      title: "基础信息校验",
      kind: "data",
      items: [
        { title: "年龄", verdict: `${profile.age} 岁`, paragraphs: [profile.lifeStage] },
        { title: "星座", verdict: profile.zodiac, paragraphs: ["星座只作基础展示，不参与四柱计算。"] },
        { title: "生肖", verdict: profile.chineseZodiac, paragraphs: ["生肖来自出生年，用于信息核对，不代替四柱。"] },
      ],
    });
    return NextResponse.json({ ok: true, report, profile });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "运势生成失败，请稍后再试。" },
      { status: 400 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import {
  buildChaosFortuneOracle,
  validateChaosFortuneOracleRequest,
  type ChaosFortuneOracleRequest,
} from "@/lib/chaos-fortune-oracle";
import { adaptLongReading } from "@/lib/free-oracle-adapters";
import { buildPersonalProfile } from "@/lib/personal-profile";

export const runtime = "nodejs";

interface FreeFortuneRequest extends ChaosFortuneOracleRequest {
  birthTime?: string;
  gender?: string;
  focus?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as FreeFortuneRequest;
    const targetDate = body.targetDate || new Date().toISOString().slice(0, 10);
    const validationError = validateChaosFortuneOracleRequest({ ...body, targetDate });
    if (validationError) return NextResponse.json({ ok: false, error: validationError }, { status: 400 });

    const profile = buildPersonalProfile(body.birthDate, targetDate);
    const contextQuestion = [
      body.focus ? `重点：${body.focus}` : "",
      body.question || "",
      body.birthTime ? `出生时间：${body.birthTime}` : "",
      body.gender && body.gender !== "不透露" ? `性别：${body.gender}` : "",
    ].filter(Boolean).join("；");
    const oracle = buildChaosFortuneOracle({
      name: body.name,
      birthDate: body.birthDate,
      targetDate,
      question: contextQuestion,
      mode: "full_ritual",
    });
    const sections = oracle.oracleReading.longReading.sections;
    const report = adaptLongReading({
      module: "fortune",
      title: oracle.oracleReading.title,
      subtitle: `${oracle.ritual.hexagram.name} → ${oracle.ritual.transformedHexagram.name}`,
      verdict: oracle.oracleReading.plain,
      metrics: [
        { label: "综合气象", value: fortuneLabel(oracle.oracleReading.fortuneLevel), tone: "accent" },
        { label: "年龄", value: `${profile.age} 岁` },
        { label: "星座", value: profile.zodiac },
        { label: "生肖", value: profile.chineseZodiac },
      ],
      sectionTitles: {
        overview: "今日总览",
        hexagramVerse: "卦辞",
        sixLines: "本命、今日与四域六爻",
        selfCrosscheck: "个人节律验卦",
        observationGuide: "今日观察指南",
        closing: "封卦",
      },
      sections,
      disclaimer: oracle.disclaimer,
      generatedAt: `${targetDate}T00:00:00.000Z`,
    });
    report.sections.splice(1, 0, {
      id: "profile",
      eyebrow: "02 / PROFILE",
      title: "个人基础画像",
      kind: "data",
      items: [
        { title: "生命阶段", verdict: profile.lifeStage, paragraphs: [`${profile.age}岁，${profile.zodiac}，生肖${profile.chineseZodiac}。这些字段用于建立当日节律，不作为性格定论。`] },
        { title: "重点领域", verdict: body.focus || "综合", paragraphs: [body.question || "本次没有额外问题，按综合运势展开。"] },
        { title: "观测日期", verdict: targetDate, paragraphs: ["运势报告只描述该日期的观察节奏，不应外推为长期命运。"] },
      ],
    });

    return NextResponse.json({ ok: true, report, oracle, profile });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "运势生成失败，请稍后再试。" },
      { status: 400 },
    );
  }
}

function fortuneLabel(value: string) {
  return ({ bright: "明朗", steady: "平稳", mixed: "吉凶交错", blocked: "有所阻滞", heavy: "宜守不宜躁" } as Record<string, string>)[value] || value;
}

import { NextRequest, NextResponse } from "next/server";
import {
  buildChaosWorldCupOracle,
  validateChaosWorldCupOracleRequest,
  type ChaosWorldCupOracleRequest,
} from "@/lib/chaos-worldcup-oracle";
import {
  resolveWorldCupPublicData,
  WorldCupTeamNotFoundError,
} from "@/lib/worldcup-public-data";
import { adaptLongReading } from "@/lib/free-oracle-adapters";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ChaosWorldCupOracleRequest;
    const validationError = validateChaosWorldCupOracleRequest(body);
    if (validationError) {
      return NextResponse.json({ ok: false, error: validationError }, { status: 400 });
    }

    const homeTeam = String(body.homeTeam ?? "").trim();
    const awayTeam = String(body.awayTeam ?? "").trim();
    const publicData = await resolveWorldCupPublicData(homeTeam, awayTeam);
    const enrichedBody: ChaosWorldCupOracleRequest = {
      ...body,
      homeTeam: publicData.homeTeam.name,
      awayTeam: publicData.awayTeam.name,
      match: `${publicData.homeTeam.name} vs ${publicData.awayTeam.name}`,
      focusTeam: publicData.homeTeam.name,
      kickoffTime: body.kickoffTime || publicData.matchMeta?.kickoffTime,
      venue: body.venue || publicData.matchMeta?.venue,
      stage: publicData.matchMeta?.stage || body.stage || "世界杯",
      homeContext: publicData.homeContext,
      awayContext: publicData.awayContext,
    };
    const oracle = buildChaosWorldCupOracle(enrichedBody);
    const report = adaptLongReading({
      module: "worldcup",
      title: oracle.oracleReading.title,
      subtitle: `${oracle.ritual.hexagram.name} → ${oracle.ritual.transformedHexagram.name}`,
      verdict: oracle.oracleReading.plain,
      metrics: [
        { label: "倾向", value: tendencyLabel(oracle.oracleReading.tendency), tone: "accent" },
        { label: "冷门风险", value: riskLabel(oracle.oracleReading.upsetRisk), tone: oracle.oracleReading.upsetRisk === "high" ? "warning" : "neutral" },
        { label: "数据置信", value: confidenceLabel(oracle.dataCrosscheck.confidence) },
        { label: "赛事阶段", value: oracle.matchSnapshot.stage || "世界杯" },
      ],
      sectionTitles: {
        overview: "赛事与卦象总览",
        hexagramVerse: "卦辞",
        sixLines: "阵容、气势、人心、贵人、小人、天命六爻",
        dataCrosscheck: "公开赛事数据验卦",
        observationGuide: "临场观察指南",
        closing: "封卦",
      },
      sections: oracle.oracleReading.longReading.sections,
      disclaimer: oracle.disclaimer,
      sources: publicData.sources.map((source) => source.label),
      generatedAt: publicData.fetchedAt,
    });
    report.sections.splice(1, 0, {
      id: "scoreForecast",
      eyebrow: "TOP SCORELINES",
      title: "三组最可能常规时间比分",
      kind: "data",
      summary: `预期进球 ${publicData.scoreForecast.expectedGoals.home} : ${publicData.scoreForecast.expectedGoals.away}`,
      items: publicData.scoreForecast.candidates.map((candidate, index) => ({
        title: `第 ${index + 1} 候选`,
        verdict: `${candidate.home} : ${candidate.away}`,
        paragraphs: [`单一准确比分模型概率 ${candidate.probabilityPct}%`],
      })),
    });

    return NextResponse.json({ ...oracle, report, publicData });
  } catch (error) {
    if (error instanceof WorldCupTeamNotFoundError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 404 });
    }
    console.error("Free World Cup Oracle API error:", error);
    return NextResponse.json(
      { ok: false, error: "公开赛事数据暂时不可用，请稍后再试。" },
      { status: 502 },
    );
  }
}

function tendencyLabel(value: string) {
  return ({
    focus_clear: "问卦方优势较明",
    focus_slight: "问卦方略占先机",
    balanced: "双方气势胶着",
    opponent_slight: "对手略占先机",
    opponent_clear: "对手优势较明",
  } as Record<string, string>)[value] || value;
}

function riskLabel(value: string) {
  return ({ low: "偏低", medium: "中等", high: "偏高" } as Record<string, string>)[value] || value;
}

function confidenceLabel(value: string) {
  return ({ low: "基础", medium: "充足", high: "较高" } as Record<string, string>)[value] || value;
}

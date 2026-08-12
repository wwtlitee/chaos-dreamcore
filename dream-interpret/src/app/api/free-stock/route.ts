import { NextRequest, NextResponse } from "next/server";
import {
  buildChaosStockOracle,
  stockSnapshotToContext,
  validateChaosStockOracleRequest,
  type ChaosStockOracleRequest,
} from "@/lib/chaos-stock-oracle";
import { adaptLongReading } from "@/lib/free-oracle-adapters";
import { buildEvidenceFirstSection } from "@/lib/evidence-first-answer";
import { resolveStockMarketData } from "@/lib/stock-market-data";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ChaosStockOracleRequest;
    const validationError = validateChaosStockOracleRequest(body);
    if (validationError) return NextResponse.json({ ok: false, error: validationError }, { status: 400 });

    const marketResolution = await resolveStockMarketData({ stock: body.stock, symbol: body.symbol });
    const marketContext = stockSnapshotToContext(marketResolution.snapshot) ?? body.marketContext;
    const oracle = buildChaosStockOracle({
      ...body,
      symbol: body.symbol || marketResolution.snapshot?.symbol,
      marketContext,
      mode: "full_ritual",
    });
    const snapshot = marketResolution.snapshot;
    const sections = oracle.oracleReading.longReading.sections;
    const report = adaptLongReading({
      module: "stock",
      title: oracle.oracleReading.title,
      subtitle: `${oracle.ritual.hexagram.name} → ${oracle.ritual.transformedHexagram.name}`,
      verdict: oracle.oracleReading.plain,
      metrics: [
        { label: "现价", value: snapshot?.price !== undefined ? `${snapshot.price} ${snapshot.currency || ""}`.trim() : "暂无" },
        { label: "涨跌", value: snapshot?.changePct !== undefined ? `${snapshot.changePct >= 0 ? "+" : ""}${snapshot.changePct.toFixed(2)}%` : "暂无", tone: (snapshot?.changePct ?? 0) >= 0 ? "positive" : "warning" },
        { label: "卦象趋势", value: tendencyLabel(oracle.oracleReading.tendency), tone: "accent" },
        { label: "波动风险", value: riskLabel(oracle.oracleReading.volatilityRisk), tone: oracle.oracleReading.volatilityRisk === "high" ? "warning" : "neutral" },
      ],
      sectionTitles: {
        overview: "行情与卦象总览",
        hexagramVerse: "卦辞",
        sixLines: "价格、量能、趋势、贵人、风险、天时六爻",
        dataCrosscheck: "公开行情验卦",
        observationGuide: "观察位与失效条件",
        closing: "封卦",
      },
      sections,
      disclaimer: oracle.disclaimer,
      sources: snapshot ? [`${snapshot.source} · ${snapshot.marketTime || snapshot.fetchedAt}`] : ["公开行情暂未取得"],
    });
    const question = body.question?.trim() || `${marketResolution.snapshot?.displayName || body.stock}当前趋势和风险如何？`;
    const directAnswer = stockDirectAnswer(
      tendencyLabel(oracle.oracleReading.tendency),
      riskLabel(oracle.oracleReading.volatilityRisk),
      snapshot?.changePct,
    );
    report.verdict = directAnswer;
    report.sections.unshift(buildEvidenceFirstSection({
      question,
      answer: directAnswer,
      reasons: snapshot ? [
        `公开行情现价 ${snapshot.price ?? "暂无"} ${snapshot.currency || ""}`.trim(),
        `当期涨跌 ${snapshot.changePct === undefined ? "暂无" : `${snapshot.changePct >= 0 ? "+" : ""}${snapshot.changePct.toFixed(2)}%`}`,
        `模型趋势为${tendencyLabel(oracle.oracleReading.tendency)}，波动风险为${riskLabel(oracle.oracleReading.volatilityRisk)}`,
      ] : ["没有取得可核验的公开行情，本次不能给出数据型方向结论。"],
      action: snapshot ? "先观察价格与成交是否继续同向，再决定是否扩大关注。" : "更换有效代码或稍后重试公开行情。",
      avoid: "不要只凭卦象、单日涨跌或一条消息作买卖决定。",
      uncertainty: snapshot ? (snapshot.riskFlags.length ? snapshot.riskFlags.join("；") : "缺少更长周期量价和公司基本面数据。") : marketResolution.reason,
    }));
    report.sections.splice(-1, 0, scenarioSection(
      "股票三种走势情景",
      oracle.oracleReading.tendency,
      oracle.oracleReading.volatilityRisk,
    ));

    return NextResponse.json({ ok: true, report, oracle, marketSnapshot: snapshot, marketResolution });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "股票验卦失败，请稍后再试。" },
      { status: 400 },
    );
  }
}

function stockDirectAnswer(tendency: string, risk: string, changePct?: number) {
  if (changePct === undefined) return "数据不足，暂时无法回答方向；当前卦象不作为替代结论。";
  if (tendency.includes("强") && risk !== "偏高") return `当前数据偏强，可以继续观察，但不等于适合追高；波动风险${risk}。`;
  if (tendency.includes("弱")) return `当前数据偏弱，不宜仅因短线反弹追入；波动风险${risk}。`;
  return `当前更接近震荡，方向没有得到充分确认；波动风险${risk}。`;
}

function tendencyLabel(value: string) {
  return ({ bullish: "偏强", slight_bullish: "略偏强", balanced: "震荡", slight_bearish: "略偏弱", bearish: "偏弱" } as Record<string, string>)[value] || value;
}

function riskLabel(value: string) {
  return ({ low: "偏低", medium: "中等", high: "偏高" } as Record<string, string>)[value] || value;
}

function scenarioSection(title: string, tendency: string, riskLevel: string) {
  const base = tendencyLabel(tendency);
  return {
    id: "scenarios",
    eyebrow: "SCENARIOS",
    title,
    kind: "data" as const,
    items: [
      { title: "顺势情景", verdict: `${base}结构延续`, paragraphs: ["量价继续同向且关键位置获得承接时，原趋势才算得到确认；只看上涨或下跌本身不足以成立。"] },
      { title: "震荡情景", verdict: "信号互相抵消", paragraphs: [`若量能、价格和消息不同步，优先按区间整理观察。当前波动风险为${riskLabel(riskLevel)}。`] },
      { title: "转弱情景", verdict: "原判断失效", paragraphs: ["当价格突破后迅速收回、量能衰减或风险标记增加，应停止沿用原卦结论并重新观察。"] },
    ],
  };
}

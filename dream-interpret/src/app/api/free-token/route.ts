import { NextRequest, NextResponse } from "next/server";
import {
  buildChaosTokenOracle,
  validateChaosTokenOracleRequest,
  type ChaosTokenOracleRequest,
} from "@/lib/chaos-token-oracle";
import { adaptLongReading } from "@/lib/free-oracle-adapters";
import { resolveTokenMarketData } from "@/lib/token-market-data";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ChaosTokenOracleRequest;
    const normalizedBody = { ...body, chain: body.chain === "自动识别" ? undefined : body.chain };
    const validationError = validateChaosTokenOracleRequest(normalizedBody);
    if (validationError) return NextResponse.json({ ok: false, error: validationError }, { status: 400 });

    const marketResolution = await resolveTokenMarketData({
      token: normalizedBody.token,
      chain: normalizedBody.chain,
      metrics: normalizedBody.metrics,
    });
    const detectedChain = marketResolution.detection.detectedChain === "unknown"
      ? normalizedBody.chain
      : marketResolution.detection.detectedChain;
    const snapshot = marketResolution.snapshot;
    const oracle = buildChaosTokenOracle({
      ...normalizedBody,
      chain: detectedChain || normalizedBody.chain,
      symbol: normalizedBody.symbol || snapshot?.tokenSymbol || snapshot?.tokenName,
      metrics: marketResolution.metrics,
      marketContext: snapshot ? {
        source: snapshot.source,
        instId: snapshot.instId,
        baseCcy: snapshot.baseCcy,
        quoteCcy: snapshot.quoteCcy,
        priceUsd: snapshot.priceUsd,
        priceChange24H: snapshot.priceChange24H,
        volume24H: snapshot.volume24H,
        liquidityUsd: snapshot.liquidityUsd,
        marketCapUsd: snapshot.marketCapUsd,
        holders: snapshot.holders,
        txs24H: snapshot.txs24H,
        buys24H: snapshot.buys24H,
        sells24H: snapshot.sells24H,
        topHolderConcentrationPct: snapshot.topHolderConcentrationPct,
        communityRecognized: snapshot.communityRecognized,
        tokenTags: snapshot.tokenTags,
        pairUrl: snapshot.pairUrl,
        riskFlags: snapshot.riskFlags,
      } : undefined,
      mode: "full_ritual",
    });
    const sections = oracle.oracleReading.longReading.sections;
    const report = adaptLongReading({
      module: "token",
      title: oracle.oracleReading.title,
      subtitle: `${oracle.ritual.hexagram.name} → ${oracle.ritual.transformedHexagram.name}`,
      verdict: oracle.oracleReading.plain,
      metrics: [
        { label: "价格", value: snapshot?.priceUsd !== undefined ? `$${snapshot.priceUsd}` : "暂无" },
        { label: "24H", value: snapshot?.priceChange24H !== undefined ? `${snapshot.priceChange24H >= 0 ? "+" : ""}${snapshot.priceChange24H.toFixed(2)}%` : "暂无", tone: (snapshot?.priceChange24H ?? 0) >= 0 ? "positive" : "warning" },
        { label: "风险", value: oracle.dataCrosscheck.riskLevel, tone: oracle.dataCrosscheck.riskLevel === "high" ? "warning" : "neutral" },
        { label: "数据置信", value: oracle.dataCrosscheck.confidence, tone: "accent" },
      ],
      sectionTitles: {
        opening: "代币与卦象总览",
        mainHexagram: "本卦",
        changingLines: "六爻与动爻",
        transformedHexagram: "变卦",
        dataVerification: "行情与链上数据验卦",
        timing: "节奏观察",
        cautions: "风险与失效条件",
        closing: "封卦",
      },
      sections,
      disclaimer: oracle.disclaimer,
      sources: snapshot ? [`${snapshot.source} · ${snapshot.fetchedAt}`] : ["公开行情或链上数据暂未取得"],
    });
    report.sections.splice(-1, 0, {
      id: "scenarios",
      eyebrow: "SCENARIOS",
      title: "三种链上情景",
      kind: "data",
      items: [
        { title: "热度延续", verdict: "量价与资金流同时确认", paragraphs: ["只有成交、流动性与买卖结构共同改善，热度才更可能延续；单一价格拉升不足以确认。"] },
        { title: "高位震荡", verdict: "注意筹码与流动性", paragraphs: [`当前风险级别为 ${oracle.dataCrosscheck.riskLevel}，若成交放大但承接不增，应防止热度透支。`] },
        { title: "叙事退潮", verdict: "原卦失效条件", paragraphs: ["流动性下降、集中度上升、卖出交易持续占优或风险标记新增时，应停止沿用原判断。"] },
      ],
    });

    return NextResponse.json({ ok: true, report, oracle, chainDetection: marketResolution.detection, marketSnapshot: snapshot });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "币卦生成失败，请稍后再试。" },
      { status: 400 },
    );
  }
}

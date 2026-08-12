import { NextRequest, NextResponse } from "next/server";
import {
  buildChaosTokenOracle,
  validateChaosTokenOracleRequest,
  type ChaosTokenOracleRequest,
} from "@/lib/chaos-token-oracle";
import { adaptLongReading } from "@/lib/free-oracle-adapters";
import { buildEvidenceFirstSection } from "@/lib/evidence-first-answer";
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
    const question = normalizedBody.question?.trim() || `${snapshot?.tokenSymbol || normalizedBody.token}当前热度与风险如何？`;
    const directAnswer = tokenDirectAnswer(snapshot?.priceChange24H, snapshot?.volume24H, snapshot?.liquidityUsd, oracle.dataCrosscheck.riskLevel);
    report.verdict = directAnswer;
    report.sections.unshift(buildEvidenceFirstSection({
      question,
      answer: directAnswer,
      reasons: snapshot ? [
        `24H 涨跌 ${snapshot.priceChange24H === undefined ? "暂无" : `${snapshot.priceChange24H >= 0 ? "+" : ""}${snapshot.priceChange24H.toFixed(2)}%`}`,
        `24H 成交额 ${formatUsd(snapshot.volume24H)}，流动性 ${formatUsd(snapshot.liquidityUsd)}`,
        `数据风险级别 ${oracle.dataCrosscheck.riskLevel}，来源 ${snapshot.source}`,
      ] : ["没有取得可核验的行情或链上快照，无法回答热度是否透支。"],
      action: snapshot ? "等待价格、成交和流动性至少两项同时确认，再判断热度能否延续。" : "核对代币符号、链或合约地址后重试。",
      avoid: "不要用卦象替代合约安全、流动性和持仓集中度检查。",
      uncertainty: snapshot ? (snapshot.riskFlags.length ? snapshot.riskFlags.join("；") : "部分链上持仓与资金流字段缺失。") : marketResolution.detection.reason,
    }));
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

function tokenDirectAnswer(change?: number, volume?: number, liquidity?: number, risk = "unknown") {
  if (change === undefined) return "数据不足，暂时无法回答热度是否透支；卦象不替代缺失数据。";
  const turnover = volume !== undefined && liquidity !== undefined && liquidity > 0 ? volume / liquidity : undefined;
  if (change >= 12 && (turnover === undefined || turnover < 0.8)) return `价格涨幅较快但成交或流动性没有充分确认，存在热度透支迹象；风险级别 ${risk}。`;
  if (change <= -10) return `价格处于明显回撤，当前重点是流动性和风险检查，不宜把下跌直接理解为机会；风险级别 ${risk}。`;
  return `当前没有单凭涨跌就能确认热度透支，仍需成交、流动性与买卖结构共同验证；风险级别 ${risk}。`;
}

function formatUsd(value?: number) {
  if (value === undefined) return "暂无";
  return `$${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value)}`;
}

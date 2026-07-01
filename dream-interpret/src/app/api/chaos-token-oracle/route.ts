import { NextRequest, NextResponse } from "next/server";
import {
  buildChaosTokenOracle,
  validateChaosTokenOracleRequest,
  type ChaosTokenOracleRequest,
} from "@/lib/chaos-token-oracle";
import { resolveTokenMarketData } from "@/lib/token-market-data";

export const runtime = "nodejs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      service: "chaos-token-oracle",
      version: "1.1.0",
      endpoint: "/api/chaos-token-oracle",
      methods: ["GET", "POST"],
      description:
        "Onchain liuyao token oracle. Provide chain, token, optional symbol/window/metrics, and receive a deterministic long-form ritual reading plus data crosscheck.",
      sampleRequest: {
        token: "8qNbYMCozwpiQHD9yYnDiYJtsZGrfkbPuLieGVTFpump",
        window: "24h",
        mode: "full_ritual",
      },
      chainDetection:
        "chain is optional. The service auto-detects likely solana/bsc/ethereum/base from CA and market data.",
      disclaimer:
        "Entertainment and research only. Not financial advice, investment advice, or a buy/sell recommendation.",
    },
    { headers: corsHeaders },
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ChaosTokenOracleRequest;
    const validationError = validateChaosTokenOracleRequest(body);
    if (validationError) {
      return NextResponse.json({ ok: false, error: validationError }, { status: 400, headers: corsHeaders });
    }

    const marketResolution = await resolveTokenMarketData({
      token: body.token,
      chain: body.chain,
      metrics: body.metrics,
    });
    const detectedChain =
      marketResolution.detection.detectedChain === "unknown" ? body.chain : marketResolution.detection.detectedChain;
    const enrichedBody: ChaosTokenOracleRequest = {
      ...body,
      chain: detectedChain || body.chain,
      symbol: body.symbol || marketResolution.snapshot?.tokenSymbol || marketResolution.snapshot?.tokenName,
      metrics: marketResolution.metrics,
      marketContext: marketResolution.snapshot
        ? {
            source: marketResolution.snapshot.source,
            priceUsd: marketResolution.snapshot.priceUsd,
            priceChange24H: marketResolution.snapshot.priceChange24H,
            volume24H: marketResolution.snapshot.volume24H,
            liquidityUsd: marketResolution.snapshot.liquidityUsd,
            marketCapUsd: marketResolution.snapshot.marketCapUsd,
            holders: marketResolution.snapshot.holders,
            txs24H: marketResolution.snapshot.txs24H,
            buys24H: marketResolution.snapshot.buys24H,
            sells24H: marketResolution.snapshot.sells24H,
            topHolderConcentrationPct: marketResolution.snapshot.topHolderConcentrationPct,
            communityRecognized: marketResolution.snapshot.communityRecognized,
            tokenTags: marketResolution.snapshot.tokenTags,
            pairUrl: marketResolution.snapshot.pairUrl,
            riskFlags: marketResolution.snapshot.riskFlags,
          }
        : undefined,
    };
    const oracle = buildChaosTokenOracle(enrichedBody);

    return NextResponse.json(
      {
        ...oracle,
        chainDetection: marketResolution.detection,
        marketSnapshot: marketResolution.snapshot,
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error("Chaos Token Oracle API error:", error);
    return NextResponse.json(
      { ok: false, error: "Chaos Token Oracle 生成失败" },
      { status: 500, headers: corsHeaders },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import {
  buildChaosTokenOracle,
  validateChaosTokenOracleRequest,
  type ChaosTokenOracleRequest,
} from "@/lib/chaos-token-oracle";

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
      version: "1.0.0",
      endpoint: "/api/chaos-token-oracle",
      methods: ["GET", "POST"],
      description:
        "Onchain liuyao token oracle. Provide chain, token, optional symbol/window/metrics, and receive a deterministic ritual reading plus data crosscheck.",
      sampleRequest: {
        chain: "solana",
        token: "So11111111111111111111111111111111111111112",
        symbol: "SOL",
        window: "24h",
        mode: "full_ritual",
        metrics: {
          priceChangePct: 8.4,
          volumeChangePct: 126,
          liquidityChangePct: 4.8,
          holderChangePct: 2.1,
          buySellRatio: 1.18,
          smartMoneyNetFlow: 42000,
          whaleNetFlow: 18000,
          topHolderConcentrationPct: 23,
          liquidityUsd: 2400000,
          securityFlags: [],
        },
      },
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

    return NextResponse.json(buildChaosTokenOracle(body), { headers: corsHeaders });
  } catch (error) {
    console.error("Chaos Token Oracle API error:", error);
    return NextResponse.json(
      { ok: false, error: "Chaos Token Oracle 生成失败" },
      { status: 500, headers: corsHeaders },
    );
  }
}

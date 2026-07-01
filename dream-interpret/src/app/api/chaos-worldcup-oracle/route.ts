import { NextRequest, NextResponse } from "next/server";
import { OKXFacilitatorClient } from "@okxweb3/x402-core";
import { ExactEvmScheme } from "@okxweb3/x402-evm/exact/server";
import { withX402, x402ResourceServer } from "@okxweb3/x402-next";
import {
  buildChaosWorldCupOracle,
  validateChaosWorldCupOracleRequest,
  type ChaosWorldCupOracleRequest,
} from "@/lib/chaos-worldcup-oracle";

export const runtime = "nodejs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-PAYMENT, PAYMENT-SIGNATURE, PAYMENT-REQUIRED",
  "Access-Control-Expose-Headers": "PAYMENT-REQUIRED, WWW-Authenticate",
};

const x402Network = "eip155:196";
const chaosWorldCupOraclePayTo =
  process.env.CHAOS_WORLDCUP_ORACLE_PAY_TO ||
  process.env.CHAOS_TOKEN_ORACLE_PAY_TO ||
  "0xedd646c269c2c81203a33244f1aca2a364690966";
const chaosWorldCupOraclePrice = process.env.CHAOS_WORLDCUP_ORACLE_PRICE || "$0.50";
const facilitatorClient = new OKXFacilitatorClient({
  apiKey: process.env.OKX_API_KEY || process.env.X402_OKX_API_KEY || "",
  secretKey: process.env.OKX_SECRET_KEY || process.env.X402_OKX_SECRET_KEY || "",
  passphrase: process.env.OKX_PASSPHRASE || process.env.X402_OKX_PASSPHRASE || "",
  syncSettle: true,
});
const x402Server = new x402ResourceServer(facilitatorClient).register(x402Network, new ExactEvmScheme());

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      service: "chaos-worldcup-oracle",
      version: "1.0.0",
      endpoint: "/api/chaos-worldcup-oracle",
      methods: ["GET", "POST"],
      description:
        "World Cup liuyao match oracle. Provide match or homeTeam/awayTeam, optional team data and market heat, and receive a ritual match reading with six-line analysis.",
      sampleRequest: {
        match: "England vs DR Congo",
        focusTeam: "England",
        stage: "Round of 32",
        mode: "full_ritual",
        homeContext: {
          fifaRank: 4,
          recentWins: 4,
          recentDraws: 1,
          recentLosses: 1,
          goalsFor: 11,
          goalsAgainst: 5,
          lineupQuality: 88,
          squadDepth: 82,
          keyPlayersAvailable: 86,
        },
        awayContext: {
          fifaRank: 56,
          recentWins: 3,
          recentDraws: 2,
          recentLosses: 1,
          goalsFor: 8,
          goalsAgainst: 6,
          lineupQuality: 72,
          squadDepth: 68,
          keyPlayersAvailable: 76,
        },
      },
      disclaimer: "Entertainment and match research only. Not betting advice or a guaranteed prediction.",
    },
    { headers: corsHeaders },
  );
}

async function postHandler(request: NextRequest) {
  try {
    const body = (await request.json()) as ChaosWorldCupOracleRequest;
    const validationError = validateChaosWorldCupOracleRequest(body);
    if (validationError) {
      return NextResponse.json({ ok: false, error: validationError }, { status: 400, headers: corsHeaders });
    }

    const oracle = buildChaosWorldCupOracle(body);

    return NextResponse.json(oracle, { headers: corsHeaders });
  } catch (error) {
    console.error("Chaos World Cup Oracle API error:", error);
    return NextResponse.json(
      { ok: false, error: "Chaos World Cup Oracle 生成失败" },
      { status: 500, headers: corsHeaders },
    );
  }
}

export const POST = withX402<unknown>(
  postHandler,
  {
    accepts: {
      scheme: "exact",
      price: chaosWorldCupOraclePrice,
      network: x402Network,
      payTo: chaosWorldCupOraclePayTo,
      maxTimeoutSeconds: 60,
    },
    description: "混沌梦核-世界杯：输入比赛信息，生成赛事数据验卦后的长篇世界杯卦象报告。",
  },
  x402Server,
);

import { NextRequest, NextResponse } from "next/server";
import { OKXFacilitatorClient } from "@okxweb3/x402-core";
import { ExactEvmScheme } from "@okxweb3/x402-evm/exact/server";
import { withX402, x402ResourceServer } from "@okxweb3/x402-next";
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
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-PAYMENT, PAYMENT-SIGNATURE, PAYMENT-REQUIRED",
  "Access-Control-Expose-Headers": "PAYMENT-REQUIRED, WWW-Authenticate",
};

const x402Network = "eip155:196";
const chaosTokenOraclePayTo =
  process.env.CHAOS_TOKEN_ORACLE_PAY_TO || "0xedd646c269c2c81203a33244f1aca2a364690966";
const chaosTokenOraclePrice = process.env.CHAOS_TOKEN_ORACLE_PRICE || "$0.50";
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

async function postHandler(request: NextRequest) {
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

export const POST = withX402<unknown>(
  postHandler,
  {
    accepts: {
      scheme: "exact",
      price: chaosTokenOraclePrice,
      network: x402Network,
      payTo: chaosTokenOraclePayTo,
      maxTimeoutSeconds: 60,
    },
    description: "混沌梦核-币：输入代币 CA，生成链上数据校验后的长篇代币卦象报告。",
  },
  x402Server,
);

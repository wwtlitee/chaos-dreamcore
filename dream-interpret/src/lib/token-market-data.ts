import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { TokenMarketMetrics } from "@/lib/chaos-token-oracle";

const execFileAsync = promisify(execFile);

export type DetectedChain = "solana" | "bsc" | "ethereum" | "base";
export type DetectionConfidence = "high" | "medium" | "low" | "none";

export interface ChainDetection {
  input: string;
  detectedChain: DetectedChain | "unknown";
  confidence: DetectionConfidence;
  candidatesTried: DetectedChain[];
  source: "okx_public" | "binance_public" | "dexscreener" | "onchainos_cli" | "heuristic" | "none";
  reason: string;
}

export interface TokenMarketSnapshot {
  source: "okx_public" | "binance_public" | "dexscreener" | "onchainos_cli";
  chain?: DetectedChain;
  tokenAddress: string;
  tokenName?: string;
  tokenSymbol?: string;
  instId?: string;
  baseCcy?: string;
  quoteCcy?: string;
  pairAddress?: string;
  pairUrl?: string;
  dexId?: string;
  priceUsd?: number;
  priceChange24H?: number;
  volume24H?: number;
  liquidityUsd?: number;
  marketCapUsd?: number;
  holders?: number;
  txs24H?: number;
  buys24H?: number;
  sells24H?: number;
  topHolderConcentrationPct?: number;
  communityRecognized?: boolean;
  tokenTags?: string[];
  riskFlags: string[];
  fetchedAt: string;
}

export interface TokenMarketResolution {
  detection: ChainDetection;
  snapshot?: TokenMarketSnapshot;
  metrics?: TokenMarketMetrics;
}

interface DexScreenerPair {
  chainId?: string;
  dexId?: string;
  url?: string;
  pairAddress?: string;
  baseToken?: {
    address?: string;
    name?: string;
    symbol?: string;
  };
  priceUsd?: string;
  txns?: {
    h24?: {
      buys?: number;
      sells?: number;
    };
  };
  volume?: {
    h24?: number;
  };
  priceChange?: {
    h24?: number;
  };
  liquidity?: {
    usd?: number;
  };
  fdv?: number;
  marketCap?: number;
}

interface OnchainSearchItem {
  chainIndex?: string;
  change?: string;
  holders?: string;
  liquidity?: string;
  marketCap?: string;
  price?: string;
  tagList?: {
    communityRecognized?: boolean;
  };
  tokenContractAddress?: string;
  tokenName?: string;
  tokenSymbol?: string;
}

interface OnchainAdvancedInfo {
  riskControlLevel?: string;
  tokenTags?: string[];
  top10HoldPercent?: string;
}

interface OkxInstrument {
  instId?: string;
  baseCcy?: string;
  quoteCcy?: string;
  state?: string;
}

interface OkxTicker {
  instId?: string;
  last?: string;
  open24h?: string;
  high24h?: string;
  low24h?: string;
  vol24h?: string;
  volCcy24h?: string;
  ts?: string;
}

interface BinanceTicker24H {
  symbol?: string;
  priceChangePercent?: string;
  lastPrice?: string;
  highPrice?: string;
  lowPrice?: string;
  volume?: string;
  quoteVolume?: string;
  closeTime?: number;
}

const EVM_ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/;
const SOLANA_ADDRESS_PATTERN = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const OKX_SPOT_QUOTES = ["USDT", "USDC", "USD", "BTC", "ETH"];

const CHAIN_BY_OKX_INDEX: Record<string, DetectedChain> = {
  "1": "ethereum",
  "56": "bsc",
  "8453": "base",
  "501": "solana",
};

const EXCHANGE_SYMBOL_ALIASES: Record<string, string> = {
  bitcoin: "BTC",
  btc: "BTC",
  ethereum: "ETH",
  ether: "ETH",
  eth: "ETH",
  bnb: "BNB",
  "binance coin": "BNB",
  binancecoin: "BNB",
  solana: "SOL",
  sol: "SOL",
  dogecoin: "DOGE",
  doge: "DOGE",
  ripple: "XRP",
  xrp: "XRP",
  cardano: "ADA",
  ada: "ADA",
  toncoin: "TON",
  ton: "TON",
  tron: "TRX",
  trx: "TRX",
  okb: "OKB",
};

export async function resolveTokenMarketData(input: {
  token: string;
  chain?: string;
  metrics?: TokenMarketMetrics;
}): Promise<TokenMarketResolution> {
  const token = input.token.trim();
  const candidates = buildChainCandidates(token, input.chain);

  if (!isLikelyContractAddress(token) && !input.chain) {
    const exchangeSnapshot = await fetchExchangeSpotSnapshot(token);
    if (exchangeSnapshot) {
      return {
        detection: {
          input: token,
          detectedChain: "unknown",
          confidence: "high",
          candidatesTried: [],
          source: exchangeSnapshot.source,
          reason: `${exchangeSnapshot.source}_spot_market_found`,
        },
        snapshot: exchangeSnapshot,
        metrics: mergeMetrics(input.metrics, snapshotToMetrics(exchangeSnapshot)),
      };
    }
  }

  const dexSnapshot = await fetchBestDexScreenerSnapshot(token, candidates);
  if (dexSnapshot) {
    return {
      detection: {
        input: token,
        detectedChain: dexSnapshot.chain ?? candidates[0] ?? "unknown",
        confidence: "high",
        candidatesTried: candidates,
        source: "dexscreener",
        reason: "public_market_pair_found",
      },
      snapshot: dexSnapshot,
      metrics: mergeMetrics(input.metrics, snapshotToMetrics(dexSnapshot)),
    };
  }

  const onchainSnapshot = await fetchOnchainOsSnapshot(token, candidates);
  if (onchainSnapshot) {
    return {
      detection: {
        input: token,
        detectedChain: onchainSnapshot.chain ?? candidates[0] ?? "unknown",
        confidence: "high",
        candidatesTried: candidates,
        source: "onchainos_cli",
        reason: "okx_onchainos_cli_found_token",
      },
      snapshot: onchainSnapshot,
      metrics: mergeMetrics(input.metrics, snapshotToMetrics(onchainSnapshot)),
    };
  }

  return {
    detection: {
      input: token,
      detectedChain: candidates[0] ?? "unknown",
      confidence: "none",
      candidatesTried: candidates,
      source: "none",
      reason: "no_market_data_found",
    },
    metrics: input.metrics,
  };
}

export function buildChainCandidates(token: string, explicitChain?: string): DetectedChain[] {
  const normalizedChain = normalizeChain(explicitChain);
  if (normalizedChain) return [normalizedChain];
  if (token.endsWith("pump")) return ["solana"];
  if (EVM_ADDRESS_PATTERN.test(token)) return ["bsc", "ethereum", "base"];
  if (SOLANA_ADDRESS_PATTERN.test(token)) return ["solana"];
  return ["solana", "bsc"];
}

function normalizeChain(chain?: string): DetectedChain | null {
  const value = String(chain ?? "").trim().toLowerCase();
  if (!value) return null;
  if (value === "bnb" || value === "bnbchain" || value === "bsc" || value === "56") return "bsc";
  if (value === "eth" || value === "ethereum" || value === "1") return "ethereum";
  if (value === "sol" || value === "solana" || value === "501") return "solana";
  if (value === "base" || value === "8453") return "base";
  return null;
}

function isLikelyContractAddress(token: string): boolean {
  return EVM_ADDRESS_PATTERN.test(token) || SOLANA_ADDRESS_PATTERN.test(token) || token.endsWith("pump");
}

async function fetchExchangeSpotSnapshot(token: string): Promise<TokenMarketSnapshot | null> {
  return (await fetchOkxSpotSnapshot(token)) ?? (await fetchBinanceSpotSnapshot(token));
}

async function fetchOkxSpotSnapshot(token: string): Promise<TokenMarketSnapshot | null> {
  const instrument = await findOkxSpotInstrument(token);
  if (!instrument?.instId) return null;

  const ticker = await fetchOkxTicker(instrument.instId);
  if (!ticker) return null;

  const priceUsd = parseNumeric(ticker.last);
  const open24h = parseNumeric(ticker.open24h);
  const priceChange24H =
    priceUsd !== undefined && open24h !== undefined && open24h > 0
      ? Math.round(((priceUsd - open24h) / open24h) * 10000) / 100
      : undefined;
  const volume24H = parseNumeric(ticker.volCcy24h) ?? parseNumeric(ticker.vol24h);

  return {
    source: "okx_public",
    tokenAddress: instrument.instId,
    tokenName: instrument.baseCcy,
    tokenSymbol: instrument.baseCcy,
    instId: instrument.instId,
    baseCcy: instrument.baseCcy,
    quoteCcy: instrument.quoteCcy,
    priceUsd,
    priceChange24H,
    volume24H,
    riskFlags: ["exchange_spot_market"],
    fetchedAt: ticker.ts ? new Date(Number(ticker.ts)).toISOString() : new Date().toISOString(),
  };
}

async function fetchBinanceSpotSnapshot(token: string): Promise<TokenMarketSnapshot | null> {
  const query = normalizeExchangeQuery(token);
  if (!query || query.includes("-")) return null;

  const symbol = `${query}USDT`;
  try {
    const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${encodeURIComponent(symbol)}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 20 },
    });
    if (!response.ok) return null;
    const ticker = (await response.json()) as BinanceTicker24H;
    if (!ticker.symbol) return null;

    return {
      source: "binance_public",
      tokenAddress: ticker.symbol,
      tokenName: query,
      tokenSymbol: query,
      instId: ticker.symbol,
      baseCcy: query,
      quoteCcy: "USDT",
      priceUsd: parseNumeric(ticker.lastPrice),
      priceChange24H: parseNumeric(ticker.priceChangePercent),
      volume24H: parseNumeric(ticker.quoteVolume) ?? parseNumeric(ticker.volume),
      riskFlags: ["exchange_spot_market"],
      fetchedAt: ticker.closeTime ? new Date(ticker.closeTime).toISOString() : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

async function findOkxSpotInstrument(token: string): Promise<OkxInstrument | null> {
  const query = normalizeExchangeQuery(token);
  if (!query) return null;

  const instruments = await fetchOkxSpotInstruments();
  const live = instruments.filter((instrument) => instrument.state === "live");
  const directInst = query.includes("-") ? query : `${query}-USDT`;
  const directMatch = live.find((instrument) => instrument.instId?.toUpperCase() === directInst);
  if (directMatch) return directMatch;

  const symbolMatches = live.filter((instrument) => instrument.baseCcy?.toUpperCase() === query);
  if (symbolMatches.length === 0) return null;

  return (
    OKX_SPOT_QUOTES.map((quote) => symbolMatches.find((instrument) => instrument.quoteCcy?.toUpperCase() === quote)).find(
      Boolean,
    ) ?? symbolMatches[0]
  );
}

async function fetchOkxSpotInstruments(): Promise<OkxInstrument[]> {
  try {
    const response = await fetch("https://www.okx.com/api/v5/public/instruments?instType=SPOT", {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });
    if (!response.ok) return [];
    const json = (await response.json()) as { data?: OkxInstrument[] };
    return Array.isArray(json.data) ? json.data : [];
  } catch {
    return [];
  }
}

async function fetchOkxTicker(instId: string): Promise<OkxTicker | null> {
  try {
    const response = await fetch(`https://www.okx.com/api/v5/market/ticker?instId=${encodeURIComponent(instId)}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 20 },
    });
    if (!response.ok) return null;
    const json = (await response.json()) as { data?: OkxTicker[] };
    return Array.isArray(json.data) ? json.data[0] ?? null : null;
  } catch {
    return null;
  }
}

function normalizeExchangeQuery(token: string): string {
  const lower = token.trim().toLowerCase().replace(/\s+/g, " ");
  const alias = EXCHANGE_SYMBOL_ALIASES[lower] || EXCHANGE_SYMBOL_ALIASES[lower.replace(/\s+/g, "")];
  if (alias) return alias;
  const cleaned = token.trim().toUpperCase().replace("/", "-").replace(/\s+/g, "-");
  return /^[A-Z0-9-]{2,30}$/.test(cleaned) ? cleaned : "";
}

async function fetchBestDexScreenerSnapshot(
  token: string,
  candidates: DetectedChain[],
): Promise<TokenMarketSnapshot | null> {
  const snapshots: TokenMarketSnapshot[] = [];

  await Promise.all(
    candidates.map(async (chain) => {
      const pairs = await fetchDexScreenerPairs(chain, token);
      for (const pair of pairs) {
        const snapshot = dexPairToSnapshot(pair, token, chain);
        if (snapshot) snapshots.push(snapshot);
      }
    }),
  );

  return snapshots.sort((left, right) => snapshotScore(right) - snapshotScore(left))[0] ?? null;
}

async function fetchDexScreenerPairs(chain: DetectedChain, token: string): Promise<DexScreenerPair[]> {
  try {
    const response = await fetch(`https://api.dexscreener.com/token-pairs/v1/${chain}/${token}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 20 },
    });
    if (!response.ok) return [];
    const json = (await response.json()) as unknown;
    return Array.isArray(json) ? (json as DexScreenerPair[]) : [];
  } catch {
    return [];
  }
}

function dexPairToSnapshot(
  pair: DexScreenerPair,
  token: string,
  fallbackChain: DetectedChain,
): TokenMarketSnapshot | null {
  const chain = normalizeChain(pair.chainId) ?? fallbackChain;
  const buys24H = finite(pair.txns?.h24?.buys);
  const sells24H = finite(pair.txns?.h24?.sells);
  const liquidityUsd = finite(pair.liquidity?.usd);
  const riskFlags = buildSharedRiskFlags({
    liquidityUsd,
    communityRecognized: undefined,
    topHolderConcentrationPct: undefined,
    priceChange24H: finite(pair.priceChange?.h24),
    holders: undefined,
  });

  return {
    source: "dexscreener",
    chain,
    tokenAddress: pair.baseToken?.address || token,
    tokenName: pair.baseToken?.name,
    tokenSymbol: pair.baseToken?.symbol,
    pairAddress: pair.pairAddress,
    pairUrl: pair.url,
    dexId: pair.dexId,
    priceUsd: parseNumeric(pair.priceUsd),
    priceChange24H: finite(pair.priceChange?.h24),
    volume24H: finite(pair.volume?.h24),
    liquidityUsd,
    marketCapUsd: finite(pair.marketCap ?? pair.fdv),
    txs24H: buys24H !== undefined || sells24H !== undefined ? (buys24H ?? 0) + (sells24H ?? 0) : undefined,
    buys24H,
    sells24H,
    riskFlags,
    fetchedAt: new Date().toISOString(),
  };
}

async function fetchOnchainOsSnapshot(
  token: string,
  candidates: DetectedChain[],
): Promise<TokenMarketSnapshot | null> {
  if (process.env.CHAOS_ORACLE_DISABLE_ONCHAINOS_CLI === "1") return null;

  const search = await runOnchainOsJson<OnchainSearchItem[]>("token", [
    "search",
    "--query",
    token,
    "--chains",
    candidates.map(chainToOkxIndex).join(","),
  ]);
  const searchItems = Array.isArray(search?.data) ? search.data : [];
  const match = searchItems.find((item) => item.tokenContractAddress?.toLowerCase() === token.toLowerCase());
  if (!match?.chainIndex) return null;

  const chain = CHAIN_BY_OKX_INDEX[match.chainIndex] ?? normalizeChain(match.chainIndex);
  if (!chain) return null;

  const advanced = await runOnchainOsJson<OnchainAdvancedInfo>("token", [
    "advanced-info",
    "--address",
    token.toLowerCase(),
    "--chain",
    chain,
  ]);

  const advancedData = advanced?.data && !Array.isArray(advanced.data) ? advanced.data : undefined;
  const topHolderConcentrationPct = parseNumeric(advancedData?.top10HoldPercent);
  const liquidityUsd = parseNumeric(match.liquidity);
  const holders = parseInteger(match.holders);
  const communityRecognized = match.tagList?.communityRecognized;
  const riskFlags = buildSharedRiskFlags({
    liquidityUsd,
    communityRecognized,
    topHolderConcentrationPct,
    priceChange24H: parseNumeric(match.change),
    holders,
  });

  for (const tag of advancedData?.tokenTags ?? []) {
    riskFlags.push(`okx_tag_${tag}`);
  }
  if (advancedData?.riskControlLevel) riskFlags.push(`okx_risk_control_level_${advancedData.riskControlLevel}`);

  return {
    source: "onchainos_cli",
    chain,
    tokenAddress: match.tokenContractAddress ?? token,
    tokenName: match.tokenName,
    tokenSymbol: match.tokenSymbol,
    priceUsd: parseNumeric(match.price),
    priceChange24H: parseNumeric(match.change),
    liquidityUsd,
    marketCapUsd: parseNumeric(match.marketCap),
    holders,
    topHolderConcentrationPct,
    communityRecognized,
    tokenTags: advancedData?.tokenTags ?? [],
    riskFlags: Array.from(new Set(riskFlags)).slice(0, 12),
    fetchedAt: new Date().toISOString(),
  };
}

async function runOnchainOsJson<T>(command: string, args: string[]) {
  try {
    const { stdout } = await execFileAsync("onchainos", [command, ...args], {
      timeout: 15000,
      windowsHide: true,
      maxBuffer: 1024 * 1024,
    });
    return JSON.parse(stdout) as { ok?: boolean; data?: T };
  } catch {
    return null;
  }
}

function chainToOkxIndex(chain: DetectedChain): string {
  const indexes: Record<DetectedChain, string> = {
    ethereum: "1",
    bsc: "56",
    base: "8453",
    solana: "501",
  };
  return indexes[chain];
}

function snapshotToMetrics(snapshot: TokenMarketSnapshot): TokenMarketMetrics {
  return {
    priceChangePct: snapshot.priceChange24H,
    volumeChangePct: volumeIntensity(snapshot.volume24H, snapshot.liquidityUsd),
    holderChangePct: undefined,
    buySellRatio:
      snapshot.buys24H !== undefined && snapshot.sells24H !== undefined
        ? snapshot.buys24H / Math.max(1, snapshot.sells24H)
        : undefined,
    topHolderConcentrationPct: snapshot.topHolderConcentrationPct,
    liquidityUsd: snapshot.liquidityUsd,
    marketCapUsd: snapshot.marketCapUsd,
    securityFlags: snapshot.riskFlags,
  };
}

function mergeMetrics(base?: TokenMarketMetrics, inferred?: TokenMarketMetrics): TokenMarketMetrics | undefined {
  if (!base && !inferred) return undefined;
  return {
    ...inferred,
    ...base,
    securityFlags: Array.from(new Set([...(inferred?.securityFlags ?? []), ...(base?.securityFlags ?? [])])),
  };
}

function volumeIntensity(volume24H?: number, liquidityUsd?: number): number | undefined {
  if (volume24H === undefined || liquidityUsd === undefined || liquidityUsd <= 0) return undefined;
  return Math.round((volume24H / liquidityUsd) * 10000) / 100;
}

function buildSharedRiskFlags(input: {
  liquidityUsd?: number;
  communityRecognized?: boolean;
  topHolderConcentrationPct?: number;
  priceChange24H?: number;
  holders?: number;
}) {
  const flags: string[] = [];
  if (input.communityRecognized === false) flags.push("not_community_recognized");
  if (input.liquidityUsd !== undefined && input.liquidityUsd < 1000) flags.push("liquidity_under_1k");
  else if (input.liquidityUsd !== undefined && input.liquidityUsd < 10000) flags.push("liquidity_under_10k");
  if (input.topHolderConcentrationPct !== undefined && input.topHolderConcentrationPct > 90) {
    flags.push("top_holders_extremely_concentrated");
  } else if (input.topHolderConcentrationPct !== undefined && input.topHolderConcentrationPct > 60) {
    flags.push("top_holders_concentrated");
  }
  if (input.priceChange24H !== undefined && input.priceChange24H < -20) flags.push("price_down_over_20pct_24h");
  if (input.holders !== undefined && input.holders < 50) flags.push("holder_count_under_50");
  return flags;
}

function snapshotScore(snapshot: TokenMarketSnapshot): number {
  return (
    (snapshot.liquidityUsd ?? 0) +
    (snapshot.volume24H ?? 0) * 0.2 +
    (snapshot.txs24H ?? 0) * 20 +
    (snapshot.marketCapUsd ?? 0) * 0.01
  );
}

function parseNumeric(value: unknown): number | undefined {
  if (value === "" || value === null || value === undefined) return undefined;
  return finite(Number(value));
}

function parseInteger(value: unknown): number | undefined {
  const numberValue = parseNumeric(value);
  return numberValue === undefined ? undefined : Math.round(numberValue);
}

function finite(value: unknown): number | undefined {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

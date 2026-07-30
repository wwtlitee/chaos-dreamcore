import stockMasterSnapshot from "@/data/stock-master-snapshot.json";

export interface StockMarketSnapshot {
  source: "eastmoney_quote" | "yahoo_chart" | "security_master" | "manual";
  input: string;
  symbol: string;
  displayName: string;
  currency?: string;
  market?: string;
  exchangeName?: string;
  assetType?: string;
  masterSource?: string;
  price?: number;
  previousClose?: number;
  change?: number;
  changePct?: number;
  volume?: number;
  marketTime?: string;
  fetchedAt: string;
  riskFlags: string[];
}

export interface StockMarketResolution {
  snapshot?: StockMarketSnapshot;
  reason: string;
}

interface StockMasterSnapshot {
  stocks?: StockMasterAsset[];
}

interface StockMasterAsset {
  name?: string;
  symbols?: string[];
  aliases?: string[];
  profile?: {
    company?: string;
    assetType?: string;
    primaryMarket?: string;
    primaryExchange?: string;
    currency?: string;
    source?: string;
  };
  listings?: StockMasterListing[];
}

interface StockMasterListing {
  symbol?: string;
  symbolRaw?: string;
  aliases?: string[];
  name?: string;
  market?: string;
  exchangeName?: string;
  currency?: string;
  instrumentType?: string;
  source?: string;
}

interface YahooChartResponse {
  chart?: {
    result?: Array<{
      meta?: {
        symbol?: string;
        longName?: string;
        shortName?: string;
        currency?: string;
        regularMarketPrice?: number;
        previousClose?: number;
        chartPreviousClose?: number;
        regularMarketTime?: number;
      };
      indicators?: {
        quote?: Array<{
          close?: Array<number | null>;
          volume?: Array<number | null>;
        }>;
      };
    }>;
    error?: unknown;
  };
}

interface EastMoneySuggestResponse {
  QuotationCodeTable?: {
    Data?: EastMoneySecurity[];
  };
}

interface EastMoneySecurity {
  Code?: string;
  Name?: string;
  Classify?: string;
  QuoteID?: string;
  SecurityTypeName?: string;
}

interface EastMoneyQuoteResponse {
  data?: {
    f43?: number;
    f57?: string;
    f58?: string;
    f60?: number;
    f169?: number;
    f170?: number;
    f47?: number;
    f86?: number;
  };
}

const STOCK_ALIASES: Record<string, string> = {
  apple: "AAPL",
  苹果: "AAPL",
  tesla: "TSLA",
  特斯拉: "TSLA",
  microsoft: "MSFT",
  微软: "MSFT",
  nvidia: "NVDA",
  英伟达: "NVDA",
  amazon: "AMZN",
  亚马逊: "AMZN",
  google: "GOOGL",
  alphabet: "GOOGL",
  meta: "META",
  贵州茅台: "600519.SS",
  茅台: "600519.SS",
  宁德时代: "300750.SZ",
  比亚迪: "002594.SZ",
  腾讯: "0700.HK",
  腾讯控股: "0700.HK",
  阿里: "BABA",
  阿里巴巴: "BABA",
};

const STOCK_MASTER = stockMasterSnapshot as StockMasterSnapshot;

export async function resolveStockMarketData(input: { stock: string; symbol?: string }): Promise<StockMarketResolution> {
  const raw = cleanText(input.symbol || input.stock);

  if (!raw) {
    return { reason: "empty_symbol" };
  }

  const masterAsset = findStockMasterAsset(raw);
  const eastMoneySecurity = await resolveEastMoneySecurity(raw);
  if (eastMoneySecurity?.QuoteID) {
    const eastMoneySnapshot = await fetchEastMoneySnapshot(raw, eastMoneySecurity);
    if (eastMoneySnapshot) {
      return { reason: "eastmoney_quote_found", snapshot: eastMoneySnapshot };
    }
  }

  const symbol = primaryMasterSymbol(masterAsset) || normalizeStockSymbol(raw);
  if (!symbol) {
    return { reason: "empty_symbol" };
  }

  const yahooSnapshot = await fetchYahooSnapshot(symbol, raw, masterAsset);
  if (yahooSnapshot) {
    return { reason: "yahoo_chart_found", snapshot: yahooSnapshot };
  }

  if (masterAsset) {
    return {
      reason: "security_master_found_without_quote",
      snapshot: buildMasterOnlySnapshot(raw, masterAsset),
    };
  }

  return { reason: "stock_fetch_failed" };
}

async function fetchYahooSnapshot(
  symbol: string,
  raw: string,
  masterAsset?: StockMasterAsset,
): Promise<StockMarketSnapshot | undefined> {
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=5d&interval=1d`,
      {
        headers: {
          accept: "application/json",
          "user-agent": "chaos-dreamcore-stock-oracle/1.0",
        },
        next: { revalidate: 120 },
      },
    );

    if (!response.ok) {
      return undefined;
    }

    const payload = (await response.json()) as YahooChartResponse;
    const result = payload.chart?.result?.[0];
    const meta = result?.meta;
    if (!meta) {
      return undefined;
    }

    const closeSeries = result.indicators?.quote?.[0]?.close?.filter(isFiniteNumber) ?? [];
    const volumeSeries = result.indicators?.quote?.[0]?.volume?.filter(isFiniteNumber) ?? [];
    const price = finite(meta.regularMarketPrice) ?? closeSeries.at(-1);
    const previousClose = finite(meta.previousClose) ?? finite(meta.chartPreviousClose) ?? closeSeries.at(-2);
    const change = price !== undefined && previousClose !== undefined ? price - previousClose : undefined;
    const changePct =
      change !== undefined && previousClose !== undefined && previousClose !== 0
        ? (change / previousClose) * 100
        : undefined;
    const listing = preferredListing(masterAsset, cleanText(meta.symbol || symbol));

    return {
      source: "yahoo_chart",
      input: raw,
      symbol: cleanText(meta.symbol || symbol),
      displayName: cleanText(
        meta.longName || meta.shortName || masterAsset?.profile?.company || masterAsset?.name || meta.symbol || symbol,
      ),
      currency: cleanOptional(meta.currency) || cleanOptional(listing?.currency) || cleanOptional(masterAsset?.profile?.currency),
      market: cleanOptional(listing?.market) || cleanOptional(masterAsset?.profile?.primaryMarket),
      exchangeName: cleanOptional(listing?.exchangeName) || cleanOptional(masterAsset?.profile?.primaryExchange),
      assetType: cleanOptional(listing?.instrumentType) || cleanOptional(masterAsset?.profile?.assetType),
      masterSource: cleanOptional(listing?.source) || cleanOptional(masterAsset?.profile?.source),
      price,
      previousClose,
      change,
      changePct,
      volume: volumeSeries.at(-1),
      marketTime: meta.regularMarketTime ? new Date(meta.regularMarketTime * 1000).toISOString() : undefined,
      fetchedAt: new Date().toISOString(),
      riskFlags: buildRiskFlags(changePct, volumeSeries.at(-1)),
    };
  } catch (error) {
    console.warn("Yahoo stock data fetch failed:", error);
    return undefined;
  }
}

async function resolveEastMoneySecurity(raw: string): Promise<EastMoneySecurity | undefined> {
  const keyword = stripExchangeSuffix(raw);
  if (!keyword) return undefined;

  try {
    const url = new URL("https://searchapi.eastmoney.com/api/suggest/get");
    url.searchParams.set("input", keyword);
    url.searchParams.set("type", "14");
    url.searchParams.set("token", "00fbb5dcd38db9462e297d25128d2a3e");

    const response = await fetch(url, {
      headers: {
        accept: "application/json",
        "user-agent": "chaos-dreamcore-stock-oracle/1.0",
      },
      next: { revalidate: 120 },
    });

    if (!response.ok) return undefined;

    const payload = (await response.json()) as EastMoneySuggestResponse;
    const candidates = payload.QuotationCodeTable?.Data ?? [];
    return candidates.find(isSupportedEastMoneySecurity);
  } catch (error) {
    console.warn("EastMoney suggest fetch failed:", error);
    return undefined;
  }
}

async function fetchEastMoneySnapshot(
  raw: string,
  security: EastMoneySecurity,
): Promise<StockMarketSnapshot | undefined> {
  if (!security.QuoteID) return undefined;

  try {
    const url = new URL("https://push2.eastmoney.com/api/qt/stock/get");
    url.searchParams.set("secid", security.QuoteID);
    url.searchParams.set("fields", "f43,f57,f58,f60,f169,f170,f47,f86");

    const response = await fetch(url, {
      headers: {
        accept: "application/json",
        "user-agent": "chaos-dreamcore-stock-oracle/1.0",
      },
      next: { revalidate: 120 },
    });

    if (!response.ok) return undefined;

    const payload = (await response.json()) as EastMoneyQuoteResponse;
    const quote = payload.data;
    if (!quote) return undefined;

    const price = scaleEastMoneyPrice(quote.f43);
    const previousClose = scaleEastMoneyPrice(quote.f60);
    const change = scaleEastMoneyPrice(quote.f169);
    const changePct = scaleEastMoneyPct(quote.f170);
    const volume = finite(quote.f47);
    const symbol = eastMoneySymbol(security);

    return {
      source: "eastmoney_quote",
      input: raw,
      symbol,
      displayName: cleanText(quote.f58 || security.Name || symbol),
      currency: eastMoneyCurrency(security),
      market: eastMoneyMarket(security),
      exchangeName: eastMoneyExchangeName(security),
      assetType: cleanOptional(security.SecurityTypeName) || cleanOptional(security.Classify),
      masterSource: "EastMoney public quote",
      price,
      previousClose,
      change,
      changePct,
      volume,
      marketTime: quote.f86 ? new Date(quote.f86 * 1000).toISOString() : undefined,
      fetchedAt: new Date().toISOString(),
      riskFlags: buildRiskFlags(changePct, volume),
    };
  } catch (error) {
    console.warn("EastMoney quote fetch failed:", error);
    return undefined;
  }
}

function buildMasterOnlySnapshot(raw: string, masterAsset: StockMasterAsset): StockMarketSnapshot {
  const listing = preferredListing(masterAsset);
  const symbol = primaryMasterSymbol(masterAsset) || cleanText(masterAsset.profile?.company || masterAsset.name || raw);

  return {
    source: "security_master",
    input: raw,
    symbol,
    displayName: cleanText(masterAsset.profile?.company || masterAsset.name || listing?.name || symbol),
    currency: cleanOptional(listing?.currency) || cleanOptional(masterAsset.profile?.currency),
    market: cleanOptional(listing?.market) || cleanOptional(masterAsset.profile?.primaryMarket),
    exchangeName: cleanOptional(listing?.exchangeName) || cleanOptional(masterAsset.profile?.primaryExchange),
    assetType: cleanOptional(listing?.instrumentType) || cleanOptional(masterAsset.profile?.assetType),
    masterSource: cleanOptional(listing?.source) || cleanOptional(masterAsset.profile?.source),
    fetchedAt: new Date().toISOString(),
    riskFlags: ["已识别证券主数据，实时行情暂未取得"],
  };
}

function normalizeStockSymbol(value: string): string {
  const text = cleanText(value);
  if (!text) return "";

  const alias = STOCK_ALIASES[text.toLowerCase()] || STOCK_ALIASES[text];
  if (alias) return alias;

  if (/^\d{6}$/.test(text)) {
    if (text.startsWith("6")) return `${text}.SS`;
    if (text.startsWith("0") || text.startsWith("3")) return `${text}.SZ`;
  }

  if (/^\d{4,5}$/.test(text)) return `${text.padStart(4, "0")}.HK`;

  return text.toUpperCase();
}

function findStockMasterAsset(raw: string): StockMasterAsset | undefined {
  const needle = normalizeSearchText(raw);
  if (!needle) return undefined;

  let best: { asset: StockMasterAsset; score: number } | undefined;
  for (const asset of STOCK_MASTER.stocks ?? []) {
    const score = scoreStockMasterAsset(asset, needle);
    if (!score) continue;
    if (!best || score > best.score) best = { asset, score };
    if (score >= 100) break;
  }

  return best?.asset;
}

function scoreStockMasterAsset(asset: StockMasterAsset, needle: string): number {
  const symbolValues = [
    ...(asset.symbols ?? []),
    ...(asset.listings ?? []).flatMap((listing) => [listing.symbol, listing.symbolRaw, ...(listing.aliases ?? [])]),
  ].map(normalizeSearchText);
  const nameValues = [asset.name, asset.profile?.company, ...(asset.aliases ?? []), ...(asset.listings ?? []).map((listing) => listing.name)]
    .map(normalizeSearchText)
    .filter(Boolean);

  if (symbolValues.some((value) => value === needle)) return 100;
  if (nameValues.some((value) => value === needle)) return 90;
  if (symbolValues.some((value) => value.startsWith(needle) || needle.startsWith(value))) return 80;
  if (nameValues.some((value) => value.startsWith(needle) || value.includes(needle))) return 60;
  return 0;
}

function primaryMasterSymbol(asset?: StockMasterAsset): string | undefined {
  if (!asset) return undefined;
  return cleanOptional(asset.symbols?.[0]) || cleanOptional(asset.listings?.[0]?.symbol);
}

function preferredListing(asset?: StockMasterAsset, symbol?: string): StockMasterListing | undefined {
  if (!asset?.listings?.length) return undefined;
  const target = normalizeSearchText(symbol);
  if (target) {
    const exact = asset.listings.find((listing) => normalizeSearchText(listing.symbol) === target);
    if (exact) return exact;
  }
  return asset.listings[0];
}

function isSupportedEastMoneySecurity(security: EastMoneySecurity): boolean {
  const classify = cleanText(security.Classify).toLowerCase();
  return Boolean(security.QuoteID && ["astock", "hk", "usstock"].includes(classify));
}

function eastMoneySymbol(security: EastMoneySecurity): string {
  const code = cleanText(security.Code);
  const quoteId = cleanText(security.QuoteID);
  const marketPrefix = quoteId.split(".")[0];

  if (security.Classify === "HK") return `${code.replace(/^0+(?=\d{4}$)/, "")}.HK`.padStart(7, "0");
  if (security.Classify === "USStock") return code.toUpperCase();
  if (marketPrefix === "1") return `${code}.SS`;
  return `${code}.SZ`;
}

function eastMoneyMarket(security: EastMoneySecurity): string | undefined {
  const classify = cleanText(security.Classify);
  if (classify === "AStock") return "CN";
  if (classify === "HK") return "HK";
  if (classify === "USStock") return "US";
  return cleanOptional(classify);
}

function eastMoneyExchangeName(security: EastMoneySecurity): string | undefined {
  const quoteId = cleanText(security.QuoteID);
  const marketPrefix = quoteId.split(".")[0];
  if (security.Classify === "HK") return "Hong Kong Exchanges and Clearing";
  if (security.Classify === "USStock") return "US exchange";
  if (marketPrefix === "1") return "Shanghai Stock Exchange";
  if (marketPrefix === "0") return "Shenzhen Stock Exchange";
  return undefined;
}

function eastMoneyCurrency(security: EastMoneySecurity): string | undefined {
  if (security.Classify === "HK") return "HKD";
  if (security.Classify === "USStock") return "USD";
  if (security.Classify === "AStock") return "CNY";
  return undefined;
}

function scaleEastMoneyPrice(value: unknown): number | undefined {
  const numberValue = finite(value);
  if (numberValue === undefined || numberValue <= -100000000) return undefined;
  return numberValue / 100;
}

function scaleEastMoneyPct(value: unknown): number | undefined {
  const numberValue = finite(value);
  if (numberValue === undefined || numberValue <= -100000000) return undefined;
  return numberValue / 100;
}

function stripExchangeSuffix(value: string): string {
  return cleanText(value).replace(/\.(ss|sz|hk)$/i, "");
}

function buildRiskFlags(changePct?: number, volume?: number): string[] {
  const flags: string[] = [];
  if (changePct !== undefined && changePct <= -5) flags.push("单日跌幅较深");
  if (changePct !== undefined && changePct >= 5) flags.push("单日涨幅较大");
  if (volume !== undefined && volume <= 0) flags.push("成交量异常");
  return flags;
}

function normalizeSearchText(value: unknown): string {
  return cleanText(value).toLowerCase().replace(/\s+/g, " ");
}

function cleanText(value: unknown): string {
  return String(value ?? "").trim();
}

function cleanOptional(value: unknown): string | undefined {
  const text = cleanText(value);
  return text || undefined;
}

function finite(value: unknown): number | undefined {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function isFiniteNumber(value: unknown): value is number {
  return Number.isFinite(value);
}

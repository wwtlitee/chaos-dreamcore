import type { StockMarketSnapshot } from "@/lib/stock-market-data";

export type ChaosStockOracleMode = "quick_omen" | "full_ritual";

export interface StockMarketContext {
  source?: string;
  symbol?: string;
  displayName?: string;
  currency?: string;
  price?: number;
  previousClose?: number;
  change?: number;
  changePct?: number;
  volume?: number;
  marketTime?: string;
  riskFlags?: string[];
}

export interface ChaosStockOracleRequest {
  stock: string;
  symbol?: string;
  market?: string;
  window?: string;
  mode?: ChaosStockOracleMode;
  question?: string;
  observedAt?: string;
  marketContext?: StockMarketContext;
}

export interface ChaosStockOracleResponse {
  ok: true;
  service: "chaos-stock-oracle";
  version: "1.0.0";
  mode: ChaosStockOracleMode;
  stockSnapshot: {
    stock: string;
    symbol: string;
    displayName: string;
    market?: string;
    window: string;
    observedAt: string;
    marketContext?: StockMarketContext;
  };
  ritual: {
    method: "stock_liuyao";
    seed: string;
    hexagram: HexagramReading;
    changingLines: ChangingLineReading[];
    transformedHexagram: HexagramReading;
    lineScores: LineScore[];
    omen: string;
  };
  oracleReading: {
    title: string;
    tendency: "bullish" | "slight_bullish" | "balanced" | "slight_bearish" | "bearish";
    volatilityRisk: "low" | "medium" | "high";
    plain: string;
    longReading: {
      summary: string;
      sections: {
        overview: string;
        hexagramVerse: string;
        sixLines: string;
        dataCrosscheck: string;
        observationGuide: string;
        closing: string;
      };
      fullText: string;
    };
    watch: string[];
  };
  dataCrosscheck: {
    confidence: "low" | "medium" | "high";
    dataSignals: string[];
    missingSignals: string[];
    volatilityRisk: "low" | "medium" | "high";
    noInvestmentAdvice: true;
  };
  disclaimer: string;
}

type LineName = "价格" | "量能" | "趋势" | "贵人" | "风险" | "天时";

interface HexagramReading {
  number: number;
  name: string;
  meaning: string;
}

interface ChangingLineReading {
  line: number;
  name: LineName;
  polarity: "yin" | "yang";
  message: string;
}

interface LineScore {
  line: number;
  name: LineName;
  score: number;
  polarity: "yin" | "yang";
  isChanging: boolean;
  verdict: string;
  evidence: string[];
  missing: string[];
  closing: string;
}

interface NormalizedStockRequest {
  stock: string;
  symbol: string;
  displayName: string;
  market?: string;
  window: string;
  mode: ChaosStockOracleMode;
  question: string;
  observedAt: string;
  marketContext?: StockMarketContext;
}

const DISCLAIMER = "本结果仅供娱乐与市场研究参考，不构成投资建议、买卖建议或确定性预测。";

const HEXAGRAMS: HexagramReading[] = [
  hex(1, "乾为天", "强势推进，过刚则折。"),
  hex(2, "坤为地", "承载力强，主动性弱。"),
  hex(5, "水天需", "需要等待确认，贸然追逐易被波动吞没。"),
  hex(11, "地天泰", "上下相通，若量价配合则顺。"),
  hex(12, "天地否", "上下不通，热度与承接脱节。"),
  hex(14, "火天大有", "资源聚拢，盛中防拥挤。"),
  hex(23, "山地剥", "剥落之象，风险逐层显现。"),
  hex(24, "地雷复", "低位复起，转机初现。"),
  hex(29, "坎为水", "重险之象，先守风险。"),
  hex(30, "离为火", "光明在场，盛极防燃尽。"),
  hex(34, "雷天大壮", "动能正盛，越强越要看承接。"),
  hex(35, "火地晋", "上升之象，循序可进。"),
  hex(39, "水山蹇", "阻滞在前，路难速通。"),
  hex(42, "风雷益", "增益可期，贵在真实增量。"),
  hex(47, "泽水困", "受困之象，出路不宽。"),
  hex(63, "水火既济", "阶段已成，后劲待验。"),
  hex(64, "火水未济", "事未完成，趋势仍待确认。"),
];

export function buildChaosStockOracle(input: ChaosStockOracleRequest): ChaosStockOracleResponse {
  const normalized = normalizeInput(input);
  const lineScores = buildLineScores(normalized);
  const seed = buildSeed(normalized);
  const hexagram = selectHexagram(seed, 0);
  const transformedHexagram = selectHexagram(seed, 7);
  const changingLines = buildChangingLineReadings(lineScores);
  const confidence = classifyConfidence(lineScores, normalized.marketContext);
  const tendency = classifyTendency(lineScores);
  const volatilityRisk = classifyVolatilityRisk(lineScores, normalized.marketContext);
  const dataSignals = collectDataSignals(lineScores, normalized.marketContext);
  const missingSignals = collectMissingSignals(lineScores);
  const watch = buildWatchList(lineScores, volatilityRisk);
  const longReading = buildLongReading({
    normalized,
    lineScores,
    hexagram,
    transformedHexagram,
    confidence,
    tendency,
    volatilityRisk,
    dataSignals,
    missingSignals,
    watch,
  });

  return {
    ok: true,
    service: "chaos-stock-oracle",
    version: "1.0.0",
    mode: normalized.mode,
    stockSnapshot: {
      stock: normalized.stock,
      symbol: normalized.symbol,
      displayName: normalized.displayName,
      market: normalized.market,
      window: normalized.window,
      observedAt: normalized.observedAt,
      marketContext: normalized.marketContext,
    },
    ritual: {
      method: "stock_liuyao",
      seed,
      hexagram,
      changingLines,
      transformedHexagram,
      lineScores,
      omen: `${hexagram.name}变${transformedHexagram.name}：${tendencyText(tendency)}，${volatilityText(volatilityRisk)}。`,
    },
    oracleReading: {
      title: `${normalized.displayName} 股票卦象`,
      tendency,
      volatilityRisk,
      plain: `${normalized.displayName} 得${hexagram.name}，变${transformedHexagram.name}。${tendencyText(tendency)}，${volatilityText(volatilityRisk)}。`,
      longReading,
      watch: normalized.mode === "quick_omen" ? watch.slice(0, 3) : watch,
    },
    dataCrosscheck: {
      confidence,
      dataSignals,
      missingSignals,
      volatilityRisk,
      noInvestmentAdvice: true,
    },
    disclaimer: DISCLAIMER,
  };
}

export function stockSnapshotToContext(snapshot?: StockMarketSnapshot): StockMarketContext | undefined {
  if (!snapshot) return undefined;
  return {
    source: snapshot.source,
    symbol: snapshot.symbol,
    displayName: snapshot.displayName,
    currency: snapshot.currency,
    price: snapshot.price,
    previousClose: snapshot.previousClose,
    change: snapshot.change,
    changePct: snapshot.changePct,
    volume: snapshot.volume,
    marketTime: snapshot.marketTime,
    riskFlags: snapshot.riskFlags,
  };
}

function normalizeInput(input: ChaosStockOracleRequest): NormalizedStockRequest {
  const stock = cleanText(input.stock);
  const context = sanitizeMarketContext(input.marketContext);
  const symbol = cleanText(input.symbol || context?.symbol || stock).toUpperCase();
  const displayName = cleanText(context?.displayName || stock || symbol);

  return {
    stock,
    symbol,
    displayName,
    market: cleanOptional(input.market),
    window: cleanText(input.window || "1d"),
    mode: input.mode === "quick_omen" ? "quick_omen" : "full_ritual",
    question: cleanText(input.question || ""),
    observedAt: input.observedAt || new Date().toISOString(),
    marketContext: context,
  };
}

function sanitizeMarketContext(context?: StockMarketContext): StockMarketContext | undefined {
  if (!context) return undefined;
  return {
    source: cleanOptional(context.source),
    symbol: cleanOptional(context.symbol),
    displayName: cleanOptional(context.displayName),
    currency: cleanOptional(context.currency),
    price: finite(context.price),
    previousClose: finite(context.previousClose),
    change: finite(context.change),
    changePct: finite(context.changePct),
    volume: finite(context.volume),
    marketTime: cleanOptional(context.marketTime),
    riskFlags: Array.isArray(context.riskFlags) ? context.riskFlags.map(cleanText).filter(Boolean).slice(0, 8) : [],
  };
}

function buildLineScores(input: NormalizedStockRequest): LineScore[] {
  const lines = [
    buildPriceLine(input),
    buildVolumeLine(input),
    buildTrendLine(input),
    buildCatalystLine(input),
    buildRiskLine(input),
    buildTimingLine(input),
  ];
  if (lines.some((line) => line.isChanging)) return lines;
  return lines.map((line) => (line.line === 3 ? { ...line, isChanging: true } : line));
}

function buildPriceLine(input: NormalizedStockRequest): LineScore {
  const evidence: string[] = [];
  const missing: string[] = [];
  const changePct = input.marketContext?.changePct;
  if (changePct === undefined) missing.push("涨跌幅");
  else evidence.push(`最新涨跌幅：${formatNumber(changePct)}%`);

  const score = changePct === undefined ? 0 : clamp(changePct / 6, -1.4, 1.4);
  return makeLine(1, "价格", score, evidence, missing, "价格有承接，盘面尚能立足。", "价格受压，短线气口偏弱。");
}

function buildVolumeLine(input: NormalizedStockRequest): LineScore {
  const evidence: string[] = [];
  const missing: string[] = [];
  const volume = input.marketContext?.volume;
  if (volume === undefined) missing.push("成交量");
  else evidence.push(`成交量：${formatNumber(volume)}`);

  const score = volume === undefined ? 0 : volume > 0 ? 0.35 : -0.35;
  return makeLine(2, "量能", score, evidence, missing, "量能有声，需看价量是否同向。", "量能不足，热度难成趋势。");
}

function buildTrendLine(input: NormalizedStockRequest): LineScore {
  const evidence: string[] = [];
  const missing: string[] = [];
  const price = input.marketContext?.price;
  const previousClose = input.marketContext?.previousClose;
  if (price === undefined || previousClose === undefined) missing.push("现价/前收");
  else evidence.push(`现价/前收：${formatNumber(price)} / ${formatNumber(previousClose)}`);

  const score = price !== undefined && previousClose !== undefined ? clamp((price - previousClose) / previousClose * 8, -1.2, 1.2) : 0;
  return makeLine(3, "趋势", score, evidence, missing, "趋势初顺，但仍要防高位分歧。", "趋势偏冷，先看止跌信号。");
}

function buildCatalystLine(input: NormalizedStockRequest): LineScore {
  const evidence: string[] = [];
  const missing: string[] = [];
  if (input.question) evidence.push(`关注主题：${input.question.slice(0, 80)}`);
  else missing.push("关注主题");

  const score = input.question ? 0.2 : 0;
  return makeLine(4, "贵人", score, evidence, missing, "贵人未必已至，但主题有可观察入口。", "催化未明，需等消息或财报触发。");
}

function buildRiskLine(input: NormalizedStockRequest): LineScore {
  const flags = input.marketContext?.riskFlags ?? [];
  const evidence = flags.map((flag) => `风险信号：${flag}`);
  const missing = input.marketContext ? [] : ["行情快照"];
  const changePct = Math.abs(input.marketContext?.changePct ?? 0);
  const score = flags.length ? -0.8 : changePct >= 5 ? -0.4 : 0.25;
  return makeLine(5, "风险", score, evidence, missing, "风险暂未压卦，但仍需设边界。", "小人当道，波动风险需优先处理。");
}

function buildTimingLine(input: NormalizedStockRequest): LineScore {
  const evidence: string[] = [];
  const missing: string[] = [];
  if (input.marketContext?.marketTime) evidence.push(`行情时间：${input.marketContext.marketTime}`);
  else missing.push("行情时间");
  if (input.window) evidence.push(`观察周期：${input.window}`);

  const score = input.marketContext ? 0.25 : -0.1;
  return makeLine(6, "天时", score, evidence, missing, "天时可观，后续看下一根 K 线确认。", "天时未明，数据不足不可强断。");
}

function makeLine(
  line: number,
  name: LineName,
  score: number,
  evidence: string[],
  missing: string[],
  positive: string,
  negative: string,
): LineScore {
  const clamped = clamp(score, -2, 2);
  const polarity = clamped >= 0 ? "yang" : "yin";
  const isChanging = Math.abs(clamped) < 0.3 || missing.length >= 2;
  return {
    line,
    name,
    score: clamped,
    polarity,
    isChanging,
    verdict: clamped >= 0 ? positive : negative,
    evidence,
    missing,
    closing: clamped >= 0 ? `${name}有可用之象` : `${name}偏弱须察`,
  };
}

function buildChangingLineReadings(lines: LineScore[]): ChangingLineReading[] {
  const source = lines.filter((line) => line.isChanging);
  return (source.length ? source : [lines[2]]).map((line) => ({
    line: line.line,
    name: line.name,
    polarity: line.polarity,
    message: line.score >= 0 ? `${line.name}可转强也可转虚，重点看下一组行情是否确认。` : `${line.name}虽弱但未死，若量价修复，凶意可减。`,
  }));
}

function buildLongReading(context: {
  normalized: NormalizedStockRequest;
  lineScores: LineScore[];
  hexagram: HexagramReading;
  transformedHexagram: HexagramReading;
  confidence: "low" | "medium" | "high";
  tendency: ChaosStockOracleResponse["oracleReading"]["tendency"];
  volatilityRisk: "low" | "medium" | "high";
  dataSignals: string[];
  missingSignals: string[];
  watch: string[];
}) {
  const { normalized, hexagram, transformedHexagram } = context;
  const overview = [
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "            卦 象 总 览",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
    `股票：${normalized.displayName}`,
    `代码：${normalized.symbol}`,
    normalized.market ? `市场：${normalized.market}` : "",
    `周期：${normalized.window}`,
    `本卦：${hexagram.name}`,
    `变卦：${transformedHexagram.name}`,
    `总判：${tendencyText(context.tendency)}，${volatilityText(context.volatilityRisk)}。`,
  ]
    .filter(Boolean)
    .join("\n");
  const hexagramVerse = [
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "              卦 辞",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
    `  ${hexagram.name}，${hexagram.meaning}`,
    `  ${normalized.displayName} 此课先看价格，再验量能；卦面只指市场情绪的方向，不给买卖号令。`,
    `  变卦${transformedHexagram.name}，主“${transformedHexagram.meaning}”。`,
  ].join("\n");
  const sixLines = buildSixLinesText(context.lineScores);
  const dataCrosscheck = buildDataCrosscheckText(context);
  const observationGuide = buildObservationGuide(context.watch);
  const closing = buildClosing(hexagram);
  const fullText = [overview, hexagramVerse, sixLines, dataCrosscheck, observationGuide, closing].join("\n\n");

  return {
    summary: `${normalized.displayName} 得${hexagram.name}变${transformedHexagram.name}，${tendencyText(context.tendency)}，${volatilityText(context.volatilityRisk)}。`,
    sections: { overview, hexagramVerse, sixLines, dataCrosscheck, observationGuide, closing },
    fullText,
  };
}

function buildSixLinesText(lines: LineScore[]) {
  const header = ["━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "            六 爻 详 解", "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"].join("\n");
  const bodies = lines.map((line) => {
    const mark = line.isChanging ? "△" : line.polarity === "yang" ? "✓" : "✗";
    const state = line.isChanging ? `${line.polarity === "yang" ? "阳" : "阴"}转${line.polarity === "yang" ? "阴" : "阳"}` : line.polarity === "yang" ? "阳爻" : "阴爻";
    const evidence = line.evidence.length ? line.evidence.slice(0, 4).map((item) => `  ${item}。`).join("\n") : "  公开数据不足，本爻按低置信度处理。";
    return [
      `【${lineName(line.line)} · ${line.name}】`,
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      `  判词：${line.verdict}`,
      "",
      evidence,
      line.missing.length ? `  尚待确认：${line.missing.slice(0, 4).join("、")}。` : "",
      "",
      `  此爻为${state}，${line.closing}。${mark}`,
    ]
      .filter(Boolean)
      .join("\n");
  });
  return [header, ...bodies].join("\n\n");
}

function buildDataCrosscheckText(context: {
  confidence: "low" | "medium" | "high";
  dataSignals: string[];
  missingSignals: string[];
  volatilityRisk: "low" | "medium" | "high";
}) {
  const signals = context.dataSignals.length
    ? context.dataSignals.slice(0, 8).map((item) => `  ✓ ${item}`).join("\n")
    : "  △ 未取得可用行情快照，本次以卦象低置信度输出。";
  const missing = context.missingSignals.length
    ? context.missingSignals.slice(0, 6).map((item) => `  △ ${item}尚待确认`).join("\n")
    : "  ✓ 核心验卦字段较完整。";
  return [
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "            行 情 验 卦",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
    `  数据置信度：${confidenceText(context.confidence)}`,
    `  波动风险：${volatilityText(context.volatilityRisk)}`,
    "",
    signals,
    "",
    missing,
  ].join("\n");
}

function buildObservationGuide(watch: string[]) {
  return [
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "            观 察 指 南",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
    ...watch.map((item) => `  - ${item}`),
    "",
    "  只看观察点，不给投资指令；若财报、政策或盘前盘后消息改变，需要重新起卦。",
  ].join("\n");
}

function buildClosing(hexagram: HexagramReading) {
  return [
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "              封 卦",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
    `  ${hexagram.name.slice(0, 2)}照盘影，`,
    "  红绿一线动人心。",
    "  卦中有象非号令，",
    "  先把风险放在前。",
    "",
    `  ${DISCLAIMER}`,
  ].join("\n");
}

function classifyConfidence(lines: LineScore[], context?: StockMarketContext): "low" | "medium" | "high" {
  const evidenceCount = lines.reduce((total, line) => total + line.evidence.length, 0);
  const contextCount = context ? Object.values(context).filter((value) => value !== undefined && value !== "").length : 0;
  if (evidenceCount + contextCount >= 10) return "high";
  if (evidenceCount + contextCount >= 5) return "medium";
  return "low";
}

function classifyTendency(lines: LineScore[]): ChaosStockOracleResponse["oracleReading"]["tendency"] {
  const total = lines.reduce((sum, line) => sum + line.score, 0);
  if (total >= 1.8) return "bullish";
  if (total >= 0.45) return "slight_bullish";
  if (total <= -1.8) return "bearish";
  if (total <= -0.45) return "slight_bearish";
  return "balanced";
}

function classifyVolatilityRisk(lines: LineScore[], context?: StockMarketContext): "low" | "medium" | "high" {
  const riskScore = lines.find((line) => line.name === "风险")?.score ?? 0;
  const move = Math.abs(context?.changePct ?? 0);
  if (riskScore < -0.7 || move >= 6) return "high";
  if (riskScore < 0 || move >= 3) return "medium";
  return "low";
}

function collectDataSignals(lines: LineScore[], context?: StockMarketContext) {
  const signals = lines.flatMap((line) => line.evidence.slice(0, 2));
  if (context?.source) signals.push(`行情来源：${context.source}`);
  if (context?.price !== undefined) signals.push(`最新价：${formatNumber(context.price)}${context.currency ? ` ${context.currency}` : ""}`);
  return Array.from(new Set(signals));
}

function collectMissingSignals(lines: LineScore[]) {
  return Array.from(new Set(lines.flatMap((line) => line.missing))).slice(0, 12);
}

function buildWatchList(lines: LineScore[], risk: "low" | "medium" | "high") {
  const watch = [
    "若价格上涨但成交量不跟，视为卦意转虚。",
    "若跌幅扩大同时量能放大，优先看风险爻是否继续转阴。",
    "财报、政策、行业新闻会改变天时爻，需要重新验卦。",
  ];
  if (risk !== "low") watch.push("波动风险不低时，任何吉象都要被风险边界降权。");
  if ((lines.find((line) => line.name === "贵人")?.missing.length ?? 0) > 0) watch.push("未提供关注主题时，催化剂爻不可强断。");
  return Array.from(new Set(watch)).slice(0, 6);
}

function buildSeed(input: NormalizedStockRequest): string {
  return hashText(
    [
      input.stock,
      input.symbol,
      input.market,
      input.window,
      input.question,
      stableNumber(input.marketContext?.price),
      stableNumber(input.marketContext?.changePct),
      stableNumber(input.marketContext?.volume),
    ].join("::"),
  );
}

function selectHexagram(seed: string, offset: number): HexagramReading {
  const value = Number.parseInt(seed.slice(offset, offset + 4), 16);
  return HEXAGRAMS[value % HEXAGRAMS.length];
}

function hashText(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  const first = (hash >>> 0).toString(16).padStart(8, "0");
  let second = 2166136261;
  for (let index = value.length - 1; index >= 0; index -= 1) {
    second ^= value.charCodeAt(index);
    second = Math.imul(second, 16777619);
  }
  return `${first}${(second >>> 0).toString(16).padStart(8, "0")}${first}`;
}

function hex(number: number, name: string, meaning: string): HexagramReading {
  return { number, name, meaning };
}

function tendencyText(tendency: ChaosStockOracleResponse["oracleReading"]["tendency"]) {
  const texts = {
    bullish: "多头气势较清楚",
    slight_bullish: "多头小优",
    balanced: "多空拉扯，方向未开",
    slight_bearish: "空头小压",
    bearish: "空头压力较重",
  };
  return texts[tendency];
}

function volatilityText(risk: "low" | "medium" | "high") {
  const texts = { low: "波动风险偏低", medium: "波动风险中等", high: "波动风险偏高" };
  return texts[risk];
}

function confidenceText(confidence: "low" | "medium" | "high") {
  const texts = { low: "低", medium: "中", high: "高" };
  return texts[confidence];
}

function lineName(line: number) {
  return ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"][line - 1] ?? `${line}爻`;
}

function stableNumber(value?: number): string {
  return Number.isFinite(value) ? String(Math.round(Number(value) * 1000) / 1000) : "";
}

function finite(value: unknown): number | undefined {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function cleanText(value: unknown): string {
  return String(value ?? "").trim();
}

function cleanOptional(value: unknown): string | undefined {
  const text = cleanText(value);
  return text || undefined;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatNumber(value: number) {
  const abs = Math.abs(value);
  if (abs >= 1000) return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (abs > 0 && abs < 0.01) return value.toPrecision(4);
  return String(Math.round(value * 100) / 100);
}

export function validateChaosStockOracleRequest(body: unknown): string | null {
  if (!body || typeof body !== "object") return "请求体必须是 JSON 对象";
  const value = body as Partial<ChaosStockOracleRequest>;
  if (!cleanText(value.stock)) return "stock 不能为空";
  if (cleanText(value.stock).length > 120) return "stock 过长";
  if (cleanText(value.symbol).length > 40) return "symbol 过长";
  if (cleanText(value.question).length > 500) return "question 过长";
  if (value.mode !== undefined && value.mode !== "quick_omen" && value.mode !== "full_ritual") {
    return "mode 只能是 quick_omen 或 full_ritual";
  }
  return null;
}

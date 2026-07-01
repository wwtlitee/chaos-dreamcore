export type ChaosOracleMode = "quick_omen" | "full_ritual";

export interface TokenMarketMetrics {
  priceChangePct?: number;
  volumeChangePct?: number;
  liquidityChangePct?: number;
  holderChangePct?: number;
  buySellRatio?: number;
  smartMoneyNetFlow?: number;
  whaleNetFlow?: number;
  topHolderConcentrationPct?: number;
  liquidityUsd?: number;
  marketCapUsd?: number;
  securityFlags?: string[];
}

export interface TokenMarketContext {
  source?: string;
  instId?: string;
  baseCcy?: string;
  quoteCcy?: string;
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
  pairUrl?: string;
  riskFlags?: string[];
}

export interface ChaosTokenOracleRequest {
  chain?: string;
  token: string;
  symbol?: string;
  window?: string;
  mode?: ChaosOracleMode;
  question?: string;
  observedAt?: string;
  metrics?: TokenMarketMetrics;
  marketContext?: TokenMarketContext;
}

export interface ChaosTokenOracleResponse {
  ok: true;
  service: "chaos-token-oracle";
  version: "1.2.0";
  mode: ChaosOracleMode;
  token: {
    chain: string;
    addressOrSymbol: string;
    symbol: string;
    window: string;
    observedAt: string;
  };
  ritual: {
    method: "onchain_liuyao";
    seed: string;
    hexagram: HexagramReading;
    changingLines: ChangingLineReading[];
    transformedHexagram: HexagramReading;
    omen: string;
  };
  oracleReading: {
    title: string;
    omenLevel: "great_omen" | "favorable" | "mixed" | "warning" | "danger";
    plain: string;
    tokenInterpretation: string;
    longReading: {
      summary: string;
      sections: {
        opening: string;
        mainHexagram: string;
        changingLines: string;
        transformedHexagram: string;
        dataVerification: string;
        timing: string;
        cautions: string;
        closing: string;
      };
      fullText: string;
    };
    watch: string[];
  };
  dataCrosscheck: {
    confidence: "low" | "medium" | "high";
    hypePhase: HypePhase;
    riskLevel: RiskLevel;
    riskScore: number;
    smartMoneySignal: SmartMoneySignal;
    liquidityOmen: string;
    match: string;
    redFlags: string[];
  };
  disclaimer: string;
}

type RiskLevel = "low" | "medium" | "high" | "critical";
type HypePhase = "ignition" | "expansion" | "saturation" | "decay" | "afterlife" | "unknown";
type SmartMoneySignal = "real_accumulation" | "probe" | "stale" | "exit_bait" | "unknown";
type TrigramKey = "qian" | "dui" | "li" | "zhen" | "xun" | "kan" | "gen" | "kun";

interface HexagramReading {
  number: number;
  name: string;
  code: string;
  upper: string;
  lower: string;
  element: string;
  meaning: string;
}

interface ChangingLineReading {
  line: number;
  polarity: "yin" | "yang";
  message: string;
}

interface LineState {
  line: number;
  polarity: "yin" | "yang";
  isChanging: boolean;
}

interface LongReadingContext {
  symbol: string;
  question: string;
  hexagram: HexagramReading;
  transformedHexagram: HexagramReading;
  changingLines: ChangingLineReading[];
  lineStates: LineState[];
  hypePhase: HypePhase;
  riskLevel: RiskLevel;
  riskScore: number;
  smartMoneySignal: SmartMoneySignal;
  confidence: "low" | "medium" | "high";
  liquidityOmen: string;
  matchReading: string;
  redFlags: string[];
  metrics: TokenMarketMetrics;
  marketContext?: TokenMarketContext;
  watchConditions: string[];
}

interface Trigram {
  key: TrigramKey;
  name: string;
  element: string;
  code: string;
}

interface HexagramMeta {
  number: number;
  name: string;
  meaning: string;
}

const DISCLAIMER =
  "Entertainment and research only. This output is not financial advice, investment advice, or a buy/sell recommendation.";

const TRIGRAMS_BY_BITS: Record<string, Trigram> = {
  "111": { key: "qian", name: "乾", element: "金", code: "111" },
  "110": { key: "dui", name: "兑", element: "泽", code: "110" },
  "101": { key: "li", name: "离", element: "火", code: "101" },
  "100": { key: "zhen", name: "震", element: "雷", code: "100" },
  "011": { key: "xun", name: "巽", element: "风", code: "011" },
  "010": { key: "kan", name: "坎", element: "水", code: "010" },
  "001": { key: "gen", name: "艮", element: "山", code: "001" },
  "000": { key: "kun", name: "坤", element: "地", code: "000" },
};

const KING_WEN: Record<TrigramKey, Record<TrigramKey, HexagramMeta>> = {
  qian: {
    qian: hex(1, "乾为天", "势能充足，强势推进，但过刚则折。"),
    dui: hex(43, "泽天夬", "强势破局，适合确认真假，忌情绪决断。"),
    li: hex(14, "火天大有", "资源聚集，热度充足，需防高位拥挤。"),
    zhen: hex(34, "雷天大壮", "动能强，但越强越要看承接。"),
    xun: hex(9, "风天小畜", "力量被蓄住，信号未完全释放。"),
    kan: hex(5, "水天需", "需要等待确认，贸然进入易被波动吞没。"),
    gen: hex(26, "山天大畜", "筹码蓄势，关键在是否继续积累。"),
    kun: hex(11, "地天泰", "上下相通，若数据配合则顺势较稳。"),
  },
  dui: {
    qian: hex(10, "天泽履", "踩在边缘，能行但要守规矩和止损。"),
    dui: hex(58, "兑为泽", "情绪扩散快，容易互相放大。"),
    li: hex(38, "火泽睽", "热度高但分歧变大，忌把噪声当共识。"),
    zhen: hex(54, "雷泽归妹", "短期诱因强，长期位置未稳。"),
    xun: hex(61, "风泽中孚", "信号需验真，表面热闹不等于真实积累。"),
    kan: hex(60, "水泽节", "需要限额和边界，适合做风控判断。"),
    gen: hex(41, "山泽损", "热度转损，需防回撤和流动性折价。"),
    kun: hex(19, "地泽临", "有人气靠近，但要看新增需求质量。"),
  },
  li: {
    qian: hex(13, "天火同人", "共识形成，适合看群体是否真的同向。"),
    dui: hex(49, "泽火革", "叙事切换，旧逻辑可能失效。"),
    li: hex(30, "离为火", "火势明亮，热度强，也最怕燃尽。"),
    zhen: hex(55, "雷火丰", "盛极之象，必须关注衰减信号。"),
    xun: hex(37, "风火家人", "结构要稳，核心地址行为很关键。"),
    kan: hex(63, "水火既济", "阶段完成，继续追逐需要新证据。"),
    gen: hex(22, "山火贲", "外表好看，需防包装大于内核。"),
    kun: hex(36, "地火明夷", "光被压住，容易有暗伤或未暴露风险。"),
  },
  zhen: {
    qian: hex(25, "天雷无妄", "突发变化，少做主观幻想。"),
    dui: hex(17, "泽雷随", "资金随势而动，注意是不是后排跟风。"),
    li: hex(21, "火雷噬嗑", "需要咬开阻力，适合查风险点。"),
    zhen: hex(51, "震为雷", "异动强烈，先惊后定。"),
    xun: hex(42, "风雷益", "增益之象，但要看增量是否真实。"),
    kan: hex(3, "水雷屯", "初动困难，波动大于确定性。"),
    gen: hex(27, "山雷颐", "靠叙事喂养，需看供给是否持续。"),
    kun: hex(24, "地雷复", "低位复燃，关键看买盘能否延续。"),
  },
  xun: {
    qian: hex(44, "天风姤", "偶遇强信号，可能短促而危险。"),
    dui: hex(28, "泽风大过", "压力过大，结构可能承不住热度。"),
    li: hex(50, "火风鼎", "重组叙事，适合看基本盘是否被重塑。"),
    zhen: hex(32, "雷风恒", "趋势延续，但要确认不是惯性。"),
    xun: hex(57, "巽为风", "消息扩散，风大则散，重在验证。"),
    kan: hex(48, "水风井", "有底层流动性，但取用速度有限。"),
    gen: hex(18, "山风蛊", "旧问题发酵，适合查合约和筹码腐坏。"),
    kun: hex(46, "地风升", "缓慢上行，胜在渐进而非暴冲。"),
  },
  kan: {
    qian: hex(6, "天水讼", "分歧和争夺明显，容易多空拉扯。"),
    dui: hex(47, "泽水困", "流动性受困，出场成本可能上升。"),
    li: hex(64, "火水未济", "事未完成，不能把半信号当结论。"),
    zhen: hex(40, "雷水解", "压力释放，需确认是真解还是假弹。"),
    xun: hex(59, "风水涣", "筹码涣散，热度容易扩散后失焦。"),
    kan: hex(29, "坎为水", "重险之象，优先看安全和退出。"),
    gen: hex(4, "山水蒙", "信息不明，适合先学习不适合冲动。"),
    kun: hex(7, "地水师", "队形与纪律重要，跟随信号需验队伍。"),
  },
  gen: {
    qian: hex(33, "天山遁", "退避之象，适合降低暴露。"),
    dui: hex(31, "泽山咸", "情绪互感，容易被气氛牵动。"),
    li: hex(56, "火山旅", "游离之象，短线可热但归属不稳。"),
    zhen: hex(62, "雷山小过", "小幅过界，信号偏短促。"),
    xun: hex(53, "风山渐", "渐进积累，适合看耐心资金。"),
    kan: hex(39, "水山蹇", "阻力明显，先看风险和路径。"),
    gen: hex(52, "艮为山", "止步观察，等待新触发。"),
    kun: hex(15, "地山谦", "低调蓄势，风险较可控但爆发慢。"),
  },
  kun: {
    qian: hex(12, "天地否", "上下不通，热度与承接可能脱节。"),
    dui: hex(45, "泽地萃", "人群聚集，聚而不稳则易散。"),
    li: hex(35, "火地晋", "上升之象，需有持续证据。"),
    zhen: hex(16, "雷地豫", "预期先行，易乐观过度。"),
    xun: hex(20, "风地观", "适合观察，不宜急判。"),
    kan: hex(8, "水地比", "资金靠拢，需看是否同盟真实。"),
    gen: hex(23, "山地剥", "剥落之象，风险逐层显现。"),
    kun: hex(2, "坤为地", "承载力强但主动性弱，等外力触发。"),
  },
};

function hex(number: number, name: string, meaning: string): HexagramMeta {
  return { number, name, meaning };
}

export function buildChaosTokenOracle(input: ChaosTokenOracleRequest): ChaosTokenOracleResponse {
  const normalized = normalizeInput(input);
  const metrics = normalized.metrics ?? {};
  const seed = buildSeed(normalized);
  const lineRolls = buildLineRolls(seed);
  const originalLines = lineRolls.map((roll) => roll.isYang);
  const transformedLines = lineRolls.map((roll) => (roll.isChanging ? !roll.isYang : roll.isYang));
  const hexagram = readHexagram(originalLines);
  const transformedHexagram = readHexagram(transformedLines);
  const changingLines = buildChangingLineReadings(lineRolls, metrics);
  const outputChangingLines = normalized.mode === "quick_omen" ? changingLines.slice(0, 2) : changingLines;
  const hypePhase = classifyHypePhase(metrics);
  const riskScore = scoreRisk(metrics);
  const riskLevel = classifyRisk(riskScore);
  const smartMoneySignal = classifySmartMoney(metrics);
  const confidence = classifyConfidence(metrics);
  const redFlags = collectRedFlags(metrics, riskScore);
  const omenLevel = classifyOmenLevel(riskLevel, hypePhase, hexagram);
  const watchConditions = buildWatchConditions(metrics, hypePhase, riskLevel, changingLines);
  const longReading = buildLongReading({
    symbol: normalized.symbol,
    question: normalized.question,
    hexagram,
    transformedHexagram,
    changingLines,
    lineStates: lineRolls.map((roll) => ({
      line: roll.line,
      polarity: roll.isYang ? "yang" : "yin",
      isChanging: roll.isChanging,
    })),
    hypePhase,
    riskLevel,
    riskScore,
    smartMoneySignal,
    confidence,
    liquidityOmen: buildLiquidityOmen(metrics),
    matchReading: buildMatchReading(hexagram, hypePhase, riskLevel, confidence),
    redFlags,
    metrics,
    marketContext: normalized.marketContext,
    watchConditions,
  });

  return {
    ok: true,
    service: "chaos-token-oracle",
    version: "1.2.0",
    mode: normalized.mode,
    token: {
      chain: normalized.chain,
      addressOrSymbol: normalized.token,
      symbol: normalized.symbol,
      window: normalized.window,
      observedAt: normalized.observedAt,
    },
    ritual: {
      method: "onchain_liuyao",
      seed,
      hexagram,
      changingLines: outputChangingLines,
      transformedHexagram,
      omen: buildOmen(hexagram, transformedHexagram, hypePhase),
    },
    oracleReading: {
      title: buildTitle(normalized.symbol, hexagram, omenLevel),
      omenLevel,
      plain: buildPlainReading(hexagram, transformedHexagram, hypePhase, riskLevel),
      tokenInterpretation: buildTokenInterpretation(normalized.symbol, hypePhase, smartMoneySignal, riskLevel),
      longReading,
      watch: normalized.mode === "quick_omen" ? watchConditions.slice(0, 3) : watchConditions,
    },
    dataCrosscheck: {
      confidence,
      hypePhase,
      riskLevel,
      riskScore,
      smartMoneySignal,
      liquidityOmen: buildLiquidityOmen(metrics),
      match: buildMatchReading(hexagram, hypePhase, riskLevel, confidence),
      redFlags,
    },
    disclaimer: DISCLAIMER,
  };
}

function normalizeInput(input: ChaosTokenOracleRequest) {
  const chain = cleanText(input.chain || "unknown").toLowerCase();
  const token = cleanText(input.token);
  const symbol = cleanText(input.symbol || token).slice(0, 24).toUpperCase();

  return {
    chain,
    token,
    symbol,
    window: cleanText(input.window || "24h"),
    mode: (input.mode === "quick_omen" ? "quick_omen" : "full_ritual") as ChaosOracleMode,
    question: cleanText(input.question || ""),
    observedAt: input.observedAt || new Date().toISOString(),
    metrics: sanitizeMetrics(input.metrics),
    marketContext: sanitizeMarketContext(input.marketContext),
  };
}

function sanitizeMetrics(metrics?: TokenMarketMetrics): TokenMarketMetrics | undefined {
  if (!metrics) return undefined;
  return {
    priceChangePct: finite(metrics.priceChangePct),
    volumeChangePct: finite(metrics.volumeChangePct),
    liquidityChangePct: finite(metrics.liquidityChangePct),
    holderChangePct: finite(metrics.holderChangePct),
    buySellRatio: finite(metrics.buySellRatio),
    smartMoneyNetFlow: finite(metrics.smartMoneyNetFlow),
    whaleNetFlow: finite(metrics.whaleNetFlow),
    topHolderConcentrationPct: finite(metrics.topHolderConcentrationPct),
    liquidityUsd: finite(metrics.liquidityUsd),
    marketCapUsd: finite(metrics.marketCapUsd),
    securityFlags: Array.isArray(metrics.securityFlags)
      ? metrics.securityFlags.map(cleanText).filter(Boolean).slice(0, 8)
      : [],
  };
}

function sanitizeMarketContext(context?: TokenMarketContext): TokenMarketContext | undefined {
  if (!context) return undefined;
  return {
    source: cleanText(context.source),
    instId: cleanText(context.instId),
    baseCcy: cleanText(context.baseCcy),
    quoteCcy: cleanText(context.quoteCcy),
    priceUsd: finite(context.priceUsd),
    priceChange24H: finite(context.priceChange24H),
    volume24H: finite(context.volume24H),
    liquidityUsd: finite(context.liquidityUsd),
    marketCapUsd: finite(context.marketCapUsd),
    holders: finite(context.holders),
    txs24H: finite(context.txs24H),
    buys24H: finite(context.buys24H),
    sells24H: finite(context.sells24H),
    topHolderConcentrationPct: finite(context.topHolderConcentrationPct),
    communityRecognized: typeof context.communityRecognized === "boolean" ? context.communityRecognized : undefined,
    tokenTags: Array.isArray(context.tokenTags) ? context.tokenTags.map(cleanText).filter(Boolean).slice(0, 10) : [],
    pairUrl: cleanText(context.pairUrl),
    riskFlags: Array.isArray(context.riskFlags) ? context.riskFlags.map(cleanText).filter(Boolean).slice(0, 12) : [],
  };
}

function finite(value: unknown): number | undefined {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function cleanText(value: unknown): string {
  return String(value ?? "").trim();
}

function buildSeed(input: ReturnType<typeof normalizeInput>): string {
  const metrics = input.metrics ?? {};
  const parts = [
    input.chain,
    input.token.toLowerCase(),
    input.symbol,
    input.window,
    stableNumber(metrics.priceChangePct),
    stableNumber(metrics.volumeChangePct),
    stableNumber(metrics.liquidityChangePct),
    stableNumber(metrics.holderChangePct),
    stableNumber(metrics.buySellRatio),
    stableNumber(metrics.smartMoneyNetFlow),
    stableNumber(metrics.whaleNetFlow),
    stableNumber(metrics.topHolderConcentrationPct),
    stableNumber(metrics.liquidityUsd),
    stableNumber(metrics.marketCapUsd),
    (metrics.securityFlags ?? []).join("|").toLowerCase(),
  ];
  return hashText(parts.join("::")).slice(0, 24);
}

function stableNumber(value?: number): string {
  return Number.isFinite(value) ? String(Math.round(Number(value) * 1000) / 1000) : "";
}

function hashText(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  const first = (hash >>> 0).toString(16).padStart(8, "0");
  let secondHash = 2166136261;
  for (let index = value.length - 1; index >= 0; index -= 1) {
    secondHash ^= value.charCodeAt(index);
    secondHash = Math.imul(secondHash, 16777619);
  }
  const second = (secondHash >>> 0).toString(16).padStart(8, "0");
  return `${first}${second}${first}`;
}

function buildLineRolls(seed: string) {
  return Array.from({ length: 6 }, (_, index) => {
    const pair = seed.slice(index * 2, index * 2 + 2);
    const value = Number.parseInt(pair || "0", 16);
    const roll = value % 4;
    return {
      line: index + 1,
      isYang: roll === 1 || roll === 3,
      isChanging: roll === 0 || roll === 3,
    };
  });
}

function readHexagram(lines: boolean[]): HexagramReading {
  const lower = trigramFromLines(lines.slice(0, 3));
  const upper = trigramFromLines(lines.slice(3, 6));
  const meta = KING_WEN[upper.key][lower.key];
  return {
    number: meta.number,
    name: meta.name,
    code: `${upper.code}${lower.code}`,
    upper: `${upper.name}${upper.element}`,
    lower: `${lower.name}${lower.element}`,
    element: `${upper.element}/${lower.element}`,
    meaning: meta.meaning,
  };
}

function trigramFromLines(lines: boolean[]): Trigram {
  const bits = lines.map((line) => (line ? "1" : "0")).join("");
  return TRIGRAMS_BY_BITS[bits] ?? TRIGRAMS_BY_BITS["000"];
}

function buildChangingLineReadings(lineRolls: ReturnType<typeof buildLineRolls>, metrics: TokenMarketMetrics) {
  const readings = lineRolls
    .filter((roll) => roll.isChanging)
    .map((roll) => ({
      line: roll.line,
      polarity: roll.isYang ? ("yang" as const) : ("yin" as const),
      message: lineMessage(roll.line, roll.isYang, metrics),
    }));

  if (readings.length > 0) return readings;

  return [
    {
      line: 0,
      polarity: "yin" as const,
      message: "本卦无动爻，表示当前结构暂未给出新触发；先看数据是否出现明确变化。",
    },
  ];
}

function lineMessage(line: number, isYang: boolean, metrics: TokenMarketMetrics): string {
  const polarity = isYang ? "阳动" : "阴动";
  const templates: Record<number, string> = {
    1: "初爻动，早期资金或底层流动性先变；注意是否只是小资金试探。",
    2: "二爻动，中层承接开始变化；若成交放大而价格不随，容易是假突破。",
    3: "三爻动，位置不稳且噪声较多；不宜只听单一信号。",
    4: "四爻动，外部叙事开始介入；需要验证热度是否转成真实买盘。",
    5: "五爻动，核心地址或主导资金影响更大；若净流出，卦意转弱。",
    6: "上爻动，热度接近阶段尽头；要防高位扩散后的退潮。",
  };
  const volumeHint =
    metrics.volumeChangePct !== undefined && metrics.volumeChangePct > 100
      ? " 当前量能很高，动爻信号会被情绪放大。"
      : "";
  return `${polarity}：${templates[line] ?? "动爻不明，先观察。"}${volumeHint}`;
}

function classifyHypePhase(metrics: TokenMarketMetrics): HypePhase {
  if (Object.keys(metrics).length === 0) return "unknown";
  const price = metrics.priceChangePct ?? 0;
  const volume = metrics.volumeChangePct ?? 0;
  const holders = metrics.holderChangePct ?? 0;
  const liquidity = metrics.liquidityChangePct ?? 0;
  const buySell = metrics.buySellRatio ?? 1;

  if (price > 20 && volume > 120 && holders > 5 && buySell >= 1.1) return "expansion";
  if (price > 5 && volume > 40 && holders > 1) return "ignition";
  if (price > 35 && volume > 150 && (holders <= 2 || buySell < 1)) return "saturation";
  if (price < -15) return "decay";
  if ((price < -8 && volume > 40) || liquidity < -10 || buySell < 0.75) return "decay";
  if (price < -25 && volume < -20 && holders < -3) return "afterlife";
  return "unknown";
}

function scoreRisk(metrics: TokenMarketMetrics): number {
  let score = 18;
  const flags = metrics.securityFlags ?? [];
  score += Math.min(flags.length * 18, 44);

  if ((metrics.topHolderConcentrationPct ?? 0) > 55) score += 22;
  else if ((metrics.topHolderConcentrationPct ?? 0) > 35) score += 12;

  if (metrics.liquidityUsd !== undefined && metrics.liquidityUsd < 25000) score += 24;
  else if (metrics.liquidityUsd !== undefined && metrics.liquidityUsd < 100000) score += 12;

  if ((metrics.priceChangePct ?? 0) > 50 && (metrics.volumeChangePct ?? 0) < 25) score += 12;
  if ((metrics.volumeChangePct ?? 0) > 200 && (metrics.buySellRatio ?? 1) < 0.9) score += 15;
  if ((metrics.smartMoneyNetFlow ?? 0) < 0) score += 10;
  if ((metrics.whaleNetFlow ?? 0) < 0) score += 10;
  if ((metrics.holderChangePct ?? 0) < -2) score += 8;
  if ((metrics.liquidityChangePct ?? 0) < -12) score += 12;

  if ((metrics.liquidityUsd ?? 0) > 1_000_000) score -= 8;
  if ((metrics.holderChangePct ?? 0) > 8 && (metrics.buySellRatio ?? 0) > 1.2) score -= 8;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function classifyRisk(score: number): RiskLevel {
  if (score >= 78) return "critical";
  if (score >= 58) return "high";
  if (score >= 34) return "medium";
  return "low";
}

function classifySmartMoney(metrics: TokenMarketMetrics): SmartMoneySignal {
  const smart = metrics.smartMoneyNetFlow;
  const whale = metrics.whaleNetFlow;
  const price = metrics.priceChangePct ?? 0;
  const buySell = metrics.buySellRatio ?? 1;

  if (smart === undefined && whale === undefined) return "unknown";
  if ((smart ?? 0) > 0 && (whale ?? 0) > 0 && buySell >= 1) return "real_accumulation";
  if ((smart ?? 0) > 0 && Math.abs(smart ?? 0) < Math.max(1000, (metrics.liquidityUsd ?? 0) * 0.005)) return "probe";
  if ((smart ?? 0) < 0 && price > 20) return "exit_bait";
  if ((smart ?? 0) <= 0 && (whale ?? 0) <= 0) return "stale";
  return "probe";
}

function classifyConfidence(metrics: TokenMarketMetrics): "low" | "medium" | "high" {
  const present = [
    metrics.priceChangePct,
    metrics.volumeChangePct,
    metrics.liquidityChangePct,
    metrics.holderChangePct,
    metrics.buySellRatio,
    metrics.smartMoneyNetFlow,
    metrics.whaleNetFlow,
    metrics.topHolderConcentrationPct,
    metrics.liquidityUsd,
    metrics.marketCapUsd,
  ].filter((value) => value !== undefined).length;
  const flagWeight = (metrics.securityFlags?.length ?? 0) > 0 ? 1 : 0;

  if (present + flagWeight >= 7) return "high";
  if (present + flagWeight >= 4) return "medium";
  return "low";
}

function collectRedFlags(metrics: TokenMarketMetrics, riskScore: number): string[] {
  const flags = [...(metrics.securityFlags ?? [])];
  if ((metrics.topHolderConcentrationPct ?? 0) > 55) flags.push("top_holder_concentration_high");
  if (metrics.liquidityUsd !== undefined && metrics.liquidityUsd < 25000) flags.push("thin_liquidity");
  if ((metrics.volumeChangePct ?? 0) > 200 && (metrics.buySellRatio ?? 1) < 0.9) flags.push("high_volume_weak_buy_side");
  if ((metrics.smartMoneyNetFlow ?? 0) < 0 && (metrics.priceChangePct ?? 0) > 20) flags.push("smart_money_selling_into_strength");
  if (riskScore >= 78) flags.push("critical_composite_risk");
  return Array.from(new Set(flags)).slice(0, 10);
}

function classifyOmenLevel(riskLevel: RiskLevel, hypePhase: HypePhase, hexagram: HexagramReading) {
  if (riskLevel === "critical" || /坎|困|剥|遁|否|蛊/.test(hexagram.name)) return "danger";
  if (riskLevel === "high" || hypePhase === "decay" || hypePhase === "afterlife") return "warning";
  if (hypePhase === "saturation" || /睽|讼|未济|小过/.test(hexagram.name)) return "mixed";
  if (riskLevel === "low" && (hypePhase === "ignition" || hypePhase === "expansion")) return "favorable";
  return "mixed";
}

function buildOmen(hexagram: HexagramReading, transformedHexagram: HexagramReading, hypePhase: HypePhase): string {
  if (hexagram.number === transformedHexagram.number) {
    return `${hexagram.name}守卦，${phaseText(hypePhase)}；当前重在等待新触发。`;
  }
  return `${hexagram.name}变${transformedHexagram.name}，${phaseText(hypePhase)}；卦象提示局势正在转相。`;
}

function buildTitle(symbol: string, hexagram: HexagramReading, omenLevel: string): string {
  const levelText: Record<string, string> = {
    great_omen: "大吉",
    favorable: "偏吉",
    mixed: "吉凶相杂",
    warning: "有警",
    danger: "重险",
  };
  return `${symbol} 起得 ${hexagram.name}：${levelText[omenLevel] ?? "待观"}`;
}

function buildPlainReading(
  hexagram: HexagramReading,
  transformedHexagram: HexagramReading,
  hypePhase: HypePhase,
  riskLevel: RiskLevel,
): string {
  const changeText =
    hexagram.number === transformedHexagram.number
      ? "本卦无明显变相，说明当前信号仍在原结构内震荡。"
      : `本卦转为${transformedHexagram.name}，说明局势从“${hexagram.meaning}”向“${transformedHexagram.meaning}”移动。`;
  return `${hexagram.name}主“${hexagram.meaning}”${changeText} 当前热度阶段为${phaseText(hypePhase)}，综合风险为${riskText(riskLevel)}。`;
}

function buildTokenInterpretation(
  symbol: string,
  hypePhase: HypePhase,
  smartMoneySignal: SmartMoneySignal,
  riskLevel: RiskLevel,
): string {
  return `${symbol} 当前不应按单一涨跌解读。卦象用于看势，数据用于验势：热度处于${phaseText(
    hypePhase,
  )}，聪明钱信号为${smartMoneyText(smartMoneySignal)}，风险层级为${riskText(
    riskLevel,
  )}。若卦意偏顺但数据不确认，应按数据优先处理。`;
}

function buildLongReading(context: LongReadingContext): ChaosTokenOracleResponse["oracleReading"]["longReading"] {
  const questionText = context.question ? `问事：${context.question}` : `问事：观 ${context.symbol} 近势`;
  const auspicious = buildAuspiciousLabel(context.riskLevel, context.hypePhase, context.confidence);
  const fiveElement = buildFiveElementText(context.hexagram, context.riskLevel, context.hypePhase);
  const glyph = `${hexagramGlyph(context.hexagram.code.slice(0, 3))}${hexagramGlyph(context.hexagram.code.slice(3, 6))}`;
  const changedGlyph = `${hexagramGlyph(context.transformedHexagram.code.slice(0, 3))}${hexagramGlyph(
    context.transformedHexagram.code.slice(3, 6),
  )}`;

  const sections = {
    opening: [
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      `         ${context.symbol} · 混沌第一卦`,
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
      `  卦象：${context.hexagram.name}（${glyph}）· 变卦：${context.transformedHexagram.name}（${changedGlyph}）`,
      `  五行属性：${fiveElement}`,
      `  吉凶等级：${auspicious.stars} ${auspicious.label}`,
      `  链上验卦：${confidenceText(context.confidence)}置信 · ${phaseText(context.hypePhase)} · 风险${riskText(
        context.riskLevel,
      )}（${context.riskScore}/100）`,
      "",
      `  总判：${buildOverallJudgement(context)}`,
      "",
      `  ${questionText}`,
    ].join("\n"),
    mainHexagram: [
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "              卦 辞",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
      buildOracleProse(context),
      "",
      buildMarketContextText(context.marketContext),
      context.liquidityOmen,
    ].join("\n"),
    changingLines: buildChangingLinesSection(context),
    transformedHexagram: [
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "              变 卦",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
      buildTransformationProse(context),
    ].join("\n"),
    dataVerification: [
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "              验 卦",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
      `数据断语：${context.matchReading}`,
      `聪明钱象：${smartMoneyText(context.smartMoneySignal)}。`,
      buildMetricsEvidence(context.metrics),
      buildRedFlagText(context.redFlags),
    ].join("\n"),
    timing: buildActionGuideSection(context),
    cautions: buildCautionSection(context.riskLevel, context.confidence, context.watchConditions),
    closing: [
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "              封 卦",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
      "  诗曰：",
      "",
      ...buildClosingPoem(context).map((line) => `    ${line}`),
      "",
      `  此卦已成，${context.symbol} 之势不在一念贪嗔，`,
      "  而在链上证据、风险纪律与认知边界。",
      "  信则图一乐，不信亦无妨；币市有风险，卦辞不作交易令。",
      "",
      "              ——卦师梦核 · 封卦",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    ].join("\n"),
  };

  const summary = `${context.symbol} 起得 ${context.hexagram.name}，变 ${context.transformedHexagram.name}，${auspicious.label}。总象为${phaseText(
    context.hypePhase,
  )}，风险${riskText(context.riskLevel)}，置信度${confidenceText(context.confidence)}。`;

  return {
    summary,
    sections,
    fullText: [
      sections.opening,
      "",
      sections.mainHexagram,
      "",
      sections.changingLines,
      "",
      sections.transformedHexagram,
      "",
      sections.dataVerification,
      "",
      sections.timing,
      "",
      sections.cautions,
      "",
      sections.closing,
    ].join("\n"),
  };
}

function buildHexagramTemper(hexagram: HexagramReading): string {
  if (/晋|升|益|泰|大有|丰/.test(hexagram.name)) {
    return "此类卦象偏向上行、聚势、增益，但最怕虚火。若只有热闹没有承接，吉象会转成诱象。";
  }
  if (/坎|困|剥|蹇|否|蛊|遁/.test(hexagram.name)) {
    return "此类卦象先看风险，后看机会。它提醒的是阻滞、暗伤或退出难度，不能只拿短线涨幅来抵消。";
  }
  if (/井|恒|渐|谦|观/.test(hexagram.name)) {
    return "此类卦象偏向蓄势、观察和渐进，不宜用暴涨暴跌的眼光读它，重点在结构是否持续变好。";
  }
  return "此卦不宜单向解读，应同时观察热度、承接、筹码和叙事是否一致。";
}

function buildAuspiciousLabel(
  riskLevel: RiskLevel,
  hypePhase: HypePhase,
  confidence: "low" | "medium" | "high",
): { label: string; stars: string } {
  if (riskLevel === "critical") return { label: "大凶", stars: "★☆☆☆☆" };
  if (riskLevel === "high") return { label: "小凶", stars: "★★☆☆☆" };
  if (hypePhase === "decay" || hypePhase === "afterlife") return { label: "凶中带观", stars: "★★☆☆☆" };
  if (confidence === "low") return { label: "平", stars: "★★★☆☆" };
  if (hypePhase === "ignition" || hypePhase === "expansion") return { label: "小吉", stars: "★★★★☆" };
  return { label: "平中有变", stars: "★★★☆☆" };
}

function buildFiveElementText(hexagram: HexagramReading, riskLevel: RiskLevel, hypePhase: HypePhase): string {
  const element = toFiveElement(hexagram.element.split("/")[0] || "土");
  const relation =
    riskLevel === "critical"
      ? "遇水则困，逢火反噬"
      : hypePhase === "ignition" || hypePhase === "expansion"
        ? "得木则生，遇金则鸣"
        : "喜静不喜躁，忌风大火虚";
  return `属${element}，${relation}`;
}

function toFiveElement(value: string): string {
  const map: Record<string, string> = {
    金: "金",
    泽: "金",
    火: "火",
    雷: "木",
    风: "木",
    水: "水",
    山: "土",
    地: "土",
  };
  return map[value] ?? "土";
}

function hexagramGlyph(bits: string): string {
  const glyphs: Record<string, string> = {
    "111": "☰",
    "110": "☱",
    "101": "☲",
    "100": "☳",
    "011": "☴",
    "010": "☵",
    "001": "☶",
    "000": "☷",
  };
  return glyphs[bits] ?? "☷";
}

function buildOverallJudgement(context: LongReadingContext): string {
  if (context.riskLevel === "critical") {
    return "卦有其象，险在链上；宜先观池水深浅，忌听鼓噪而追风。";
  }
  if (context.hypePhase === "decay" || context.hypePhase === "afterlife") {
    return "余火尚存，退潮已显；宜看承接，忌把反抽当新生。";
  }
  if (context.hypePhase === "ignition" || context.hypePhase === "expansion") {
    return "火候初成，人气渐聚；宜验真量，忌一念梭哈。";
  }
  return "象在雾中，数未全明；宜补链上证据，忌凭一句卦辞定生死。";
}

function buildOracleProse(context: LongReadingContext): string {
  const change =
    context.hexagram.number === context.transformedHexagram.number
      ? `变卦仍守${context.transformedHexagram.name}，主局未脱旧势。`
      : `变为${context.transformedHexagram.name}，主后势另开一门。`;
  const marketMood =
    context.riskLevel === "critical"
      ? "池浅浪急，筹码如悬石；一声喊单，未必托得住出逃之人。"
      : context.hypePhase === "decay"
        ? "热意退而余温在，盘面像风后残烛，亮处仍亮，暗处已暗。"
        : context.hypePhase === "ignition" || context.hypePhase === "expansion"
          ? "人气有聚，火星入草，若有真量续上，方能从故事走成趋势。"
          : "云气未开，灯火未明，链上有声无声之间，最怕自作多情。";

  return [
    `  ${context.hexagram.name}者，${context.hexagram.meaning}`,
    `  上${context.hexagram.upper}，下${context.hexagram.lower}，${buildHexagramTemper(context.hexagram)}`,
    "",
    `  落到 ${context.symbol}，此卦不单问涨跌，乃问气数、承接、人心与退路。`,
    `  ${marketMood}`,
    "",
    `  本卦看当下，${change}`,
    `  若链上数据与卦象同声，则为有根之象；若数据逆卦而行，则卦辞只作提醒，不作凭据。`,
  ].join("\n");
}

function buildChangingLinesSection(context: LongReadingContext): string {
  const dimensions = [
    {
      title: "初爻 · 财运",
      map: "池子深浅 / 市值根基",
      text: buildFoundationLine(context),
    },
    {
      title: "二爻 · 时运",
      map: "价格动能 / 24h 走势",
      text: buildMomentumLine(context),
    },
    {
      title: "三爻 · 人气",
      map: "持有人 / 交易活跃",
      text: buildPopularityLine(context),
    },
    {
      title: "四爻 · 贵人",
      map: "催化 / 聪明钱 / 标签",
      text: buildCatalystLine(context),
    },
    {
      title: "五爻 · 小人",
      map: "集中度 / 流动性 / 红旗",
      text: buildVillainLine(context),
    },
    {
      title: "上爻 · 天命",
      map: "大环境 / 阶段位置",
      text: buildMacroLine(context),
    },
  ];

  const header = [
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "            六 爻 详 解",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
  ].join("\n");
  const lines = dimensions.map((dimension, index) => {
      const state = context.lineStates[index] ?? { line: index + 1, polarity: "yin" as const, isChanging: false };
      const mark = state.isChanging ? "△" : state.polarity === "yang" ? "✓" : "✗";
      const lineState = state.isChanging ? "变爻" : state.polarity === "yang" ? "阳爻" : "阴爻";
      return [
        `【${dimension.title}】`,
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        `  判词：${dimension.text.verdict}`,
        "",
        `  ${dimension.text.body}`,
        "",
        `  此爻为${lineState}，${dimension.text.closing} ${mark}`,
      ].join("\n");
    });
  return [header, ...lines].join("\n\n");
}

function buildMarketContextText(context?: TokenMarketContext): string {
  if (!context?.source) {
    return "市场数据源：未取得可用行情或链上快照，本次只能按输入指标和卦象低置信度判断。";
  }

  const facts = [
    context.instId ? `交易对 ${context.instId}` : "",
    metricSentence("价格", context.priceUsd, " USD"),
    metricSentence("24h 涨跌", context.priceChange24H, "%"),
    metricSentence("24h 成交量", context.volume24H, " USD"),
    metricSentence("流动性", context.liquidityUsd, " USD"),
    metricSentence("市值", context.marketCapUsd, " USD"),
    metricSentence("持有人", context.holders, ""),
    metricSentence("24h 交易数", context.txs24H, ""),
    metricSentence("Top 持仓集中度", context.topHolderConcentrationPct, "%"),
  ].filter(Boolean);
  const recognition =
    context.communityRecognized === false
      ? "该 token 未被 community-recognized，名称和符号不可作为信任依据。"
      : context.communityRecognized === true
        ? "该 token 有 community-recognized 标记，但这不等于安全背书。"
        : "";
  const tags = context.tokenTags?.length ? `链上标签：${context.tokenTags.join("、")}。` : "";
  const pair = context.pairUrl ? `参考交易对：${context.pairUrl}` : "";
  const sourceLabel =
    context.source === "okx_public"
      ? "OKX 公开行情"
      : context.source === "binance_public"
        ? "Binance 公开行情"
        : `链上数据源 ${context.source}`;

  return [
    `市场数据源：${sourceLabel}。${facts.length ? `快照显示 ${facts.join("；")}。` : "数据源可识别 token，但可用数值有限。"}`,
    recognition,
    tags,
    pair,
  ]
    .filter(Boolean)
    .join("\n");
}

function buildFoundationLine(context: LongReadingContext) {
  const liquidity = context.marketContext?.liquidityUsd ?? context.metrics.liquidityUsd;
  const marketCap = context.marketContext?.marketCapUsd ?? context.metrics.marketCapUsd;
  const verdict =
    liquidity !== undefined && liquidity < 10000
      ? "财帛宫浅，池水难藏大鱼。"
      : liquidity !== undefined && liquidity > 1_000_000
        ? "财帛宫有库，根气尚能承压。"
        : "财帛宫未明，需看池水与市值是否相称。";
  const body = [
    liquidity !== undefined
      ? `当前流动性约 ${formatMetricValue(liquidity, " USD")} USD，池水深浅已入卦。`
      : "当前未取到明确流动性，财帛一宫只能低声断。", 
    marketCap !== undefined ? `市值约 ${formatMetricValue(marketCap, " USD")} USD，盘子大小决定风吹时的晃动幅度。` : "",
    liquidity !== undefined && liquidity < 10000
      ? "池浅则滑点重，喊声再响，也可能一脚踩空。"
      : "若池水不退，基本承接尚可继续观察。",
  ]
    .filter(Boolean)
    .join(" ");
  return { verdict, body, closing: liquidity !== undefined && liquidity < 10000 ? "根浅须慎" : "根气待验" };
}

function buildMomentumLine(context: LongReadingContext) {
  const change = context.marketContext?.priceChange24H ?? context.metrics.priceChangePct;
  const volume = context.marketContext?.volume24H;
  const verdict =
    change === undefined
      ? "时运未开，涨跌无凭。"
      : change < -15
        ? "时运转冷，退潮有声。"
        : change > 15
          ? "时运上扬，火势见明。"
          : "时运平平，仍在试探。";
  const body = [
    change !== undefined
      ? `24h 涨跌为 ${formatMetricValue(change, "%")}%，此数直接入时运。`
      : "未取得 24h 价格变化，K 线之象未全。",
    volume !== undefined ? `24h 成交量约 ${formatMetricValue(volume, " USD")} USD，可看热闹是否真有脚步声。` : "",
    change !== undefined && change < -15
      ? "跌幅已深，若无新增承接，反弹也多半是惊弓之鸟。"
      : "若后续价量同向，时运才算转实。",
  ]
    .filter(Boolean)
    .join(" ");
  return { verdict, body, closing: change !== undefined && change < -15 ? "临退潮之象" : "临待发之象" };
}

function buildPopularityLine(context: LongReadingContext) {
  const holders = context.marketContext?.holders;
  const txs = context.marketContext?.txs24H;
  const verdict =
    holders !== undefined && holders < 50
      ? "人气未聚，堂前少客。"
      : holders !== undefined && holders > 1000
        ? "人气已成，市声渐盛。"
        : "人气有影，尚未成潮。";
  const body = [
    holders !== undefined ? `持有人约 ${holders}，这是人气宫的底数。` : "未取得持有人数量，人气只能看影不看形。",
    txs !== undefined ? `24h 交易数约 ${txs}，可见散户脚步是否频繁。` : "",
    holders !== undefined && holders < 50
      ? "人少则盘轻，也易被少数地址牵动；热闹未必是共识，可能只是几人击鼓。"
      : "若持有人继续增长，社区之火才有续燃可能。",
  ]
    .filter(Boolean)
    .join(" ");
  return { verdict, body, closing: holders !== undefined && holders < 50 ? "人气偏虚" : "人气待聚" };
}

function buildCatalystLine(context: LongReadingContext) {
  const tags = context.marketContext?.tokenTags ?? [];
  const smartMoneyTag = tags.some((tag) => /smart/i.test(tag));
  const verdict = smartMoneyTag ? "贵人星动，暗手曾临。" : "贵人未现，催化待来。";
  const body = [
    tags.length ? `链上标签见 ${tags.join("、")}，可作贵人宫旁证。` : "暂未取得明显利好标签，贵人宫无强光。",
    smartMoneyTag
      ? "有聪明钱相关痕迹，但聪明钱不是护身符；若它只来试水，不续买盘，则贵人也会转身。"
      : "若后续出现真实买盘、迁移、上池或叙事扩散，方可说贵人入局。",
  ].join(" ");
  return { verdict, body, closing: smartMoneyTag ? "有贵人而需验真" : "贵人未至" };
}

function buildVillainLine(context: LongReadingContext) {
  const concentration = context.marketContext?.topHolderConcentrationPct ?? context.metrics.topHolderConcentrationPct;
  const flags = context.redFlags;
  const verdict =
    context.riskLevel === "critical"
      ? "小人当道，不可不防。"
      : flags.length
        ? "暗处有刺，须防回马。"
        : "小人未显，仍需巡夜。";
  const body = [
    concentration !== undefined ? `头部持仓集中度约 ${formatMetricValue(concentration, "%")}%，筹码宫已露形。` : "",
    flags.length ? `红旗见 ${flags.slice(0, 6).join("、")}。` : "当前未见明确红旗，但无旗不等于无险。",
    concentration !== undefined && concentration > 90
      ? "此为筹码悬顶之象，一人动念，全盘皆惊。"
      : "若集中度下降、池水加深，小人宫才有缓和。",
  ]
    .filter(Boolean)
    .join(" ");
  return { verdict, body, closing: context.riskLevel === "critical" ? "凶象压卦" : "暗伏须察" };
}

function buildMacroLine(context: LongReadingContext) {
  const verdict =
    context.hypePhase === "decay" || context.hypePhase === "afterlife"
      ? "天时转冷，逆风行舟。"
      : context.hypePhase === "ignition" || context.hypePhase === "expansion"
        ? "天时有火，顺风未满。"
        : "天命未判，须等风来。";
  const body = [
    `当前阶段为${phaseText(context.hypePhase)}，大环境在卦中表现为“${context.transformedHexagram.meaning}”。`,
    context.confidence === "low"
      ? "数据不足时，天命不可强说；强说便是自欺。"
      : "已有链上数据作证，但币市风云多变，仍需滚动复盘。",
  ].join(" ");
  return { verdict, body, closing: context.hypePhase === "decay" ? "逆风须避" : "顺逆未定" };
}

function buildMetricsEvidence(metrics: TokenMarketMetrics): string {
  const evidence = [
    metricSentence("价格变化", metrics.priceChangePct, "%"),
    metricSentence("成交量变化", metrics.volumeChangePct, "%"),
    metricSentence("流动性变化", metrics.liquidityChangePct, "%"),
    metricSentence("持有人变化", metrics.holderChangePct, "%"),
    metricSentence("买卖比", metrics.buySellRatio, ""),
    metricSentence("聪明钱净流", metrics.smartMoneyNetFlow, ""),
    metricSentence("巨鲸净流", metrics.whaleNetFlow, ""),
    metricSentence("头部持仓集中度", metrics.topHolderConcentrationPct, "%"),
    metricSentence("流动性规模", metrics.liquidityUsd, " USD"),
  ].filter(Boolean);

  if (evidence.length === 0) {
    return "本次没有提供具体行情和链上 metrics，所以只能先按卦象读势，不能把它当成已被数据确认的判断。";
  }

  return `可用指标：${evidence.join("；")}。这些指标用于验卦，不用于直接给交易指令。`;
}

function metricSentence(label: string, value: number | undefined, unit: string): string | null {
  if (value === undefined) return null;
  return `${label} ${formatMetricValue(value, unit)}${unit}`;
}

function formatMetricValue(value: number, unit: string): string {
  const abs = Math.abs(value);
  if (unit === " USD" && abs > 0 && abs < 0.01) return value.toPrecision(4);
  if (unit === "" && Number.isInteger(value)) return String(value);
  if (abs >= 1000) return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (abs > 0 && abs < 0.01) return value.toPrecision(4);
  return String(Math.round(value * 100) / 100);
}

function buildRedFlagText(redFlags: string[]): string {
  if (redFlags.length === 0) return "红旗：暂未从输入指标中读到明确红旗，但这不等于无风险。";
  return `红旗：${redFlags.join("、")}。红旗出现时，所有吉象都要降权。`;
}

function buildTransformationProse(context: LongReadingContext): string {
  const same = context.hexagram.number === context.transformedHexagram.number;
  const movement = same
    ? `本卦不变，仍守${context.hexagram.name}。不变不是无事，而是旧局未破，旧债未清。`
    : `本卦${context.hexagram.name}，变卦${context.transformedHexagram.name}。前者看当下之气，后者看下一步之门。`;
  const warning =
    context.riskLevel === "critical"
      ? "然链上凶数甚重，变卦纵有生机，也须先过流动性与筹码两关。"
      : context.hypePhase === "decay"
        ? "热度已有回落，变卦若要成吉，需见真量回补，不可只靠群内喊声。"
        : "若后续数据顺卦而行，则为势起；若数据背卦而走，则为虚象。";

  return [
    `  ${movement}`,
    `  ${context.transformedHexagram.name}主“${context.transformedHexagram.meaning}”。${warning}`,
    "  变卦不是预测价格，而是指出局势可能转向的门缝。门能不能开，要看链上脚步有没有跟上。",
  ].join("\n");
}

function buildTimingSection(hypePhase: HypePhase, changingLines: ChangingLineReading[]): string {
  const hasUpperMove = changingLines.some((line) => line.line >= 5);
  const timingHint = hasUpperMove
    ? "动在五爻或上爻，说明变化可能已经接近主导层或阶段尾部，应期偏短，重点看接下来一个窗口是否快速验证。"
    : "动爻未明显落在高位，说明变化未必立刻兑现，应期更适合按后续 1 到 3 个观察窗口复核。";
  const phaseHint =
    hypePhase === "ignition"
      ? "初燃之象看连续性，不看单次冲高。"
      : hypePhase === "saturation"
        ? "盛极之象看退潮信号，一旦量增价滞就要重新断卦。"
        : hypePhase === "unknown"
          ? "未明之象先补数据，缺少价格、量能、流动性和地址行为时，不宜硬断。"
          : "此阶段重点看当前趋势是否被下一组链上数据确认。";

  return `五、应期与观察窗口：${timingHint}${phaseHint}`;
}

function buildActionGuideSection(context: LongReadingContext): string {
  const timing = buildTimingSection(context.hypePhase, context.changingLines).replace("五、应期与观察窗口：", "");
  const posture =
    context.riskLevel === "critical"
      ? "以避险为主，先看池水、集中度与红旗是否缓和；凶数未解，不宜被短线火光迷眼。"
      : context.hypePhase === "ignition" || context.hypePhase === "expansion"
        ? "以验证为主，观察价量、人气、流动性是否同向；一项独亮，不足成局。"
        : "以观望复盘为主，等下一组链上数据给出方向。";
  const entry = context.riskLevel === "critical" ? "不设入场号令，只设观察门槛。" : "若要研究，只看确认，不看冲动。";
  const taboo = [
    "忌听群内一句喊单便满仓梭哈。",
    "忌只看卦面吉字，不看池子深浅。",
    "忌把低流动性反抽当成趋势反转。",
  ];

  return [
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "            行 动 指 南",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
    "  【观察姿态】",
    `  ${posture}`,
    "",
    "  【进退时机】",
    `  ${entry} 若 24h 交易、流动性、持有人与头部筹码同时改善，方可说卦象开始应验；若量增价滞、池水变浅、红旗增多，则按凶象处理。`,
    "",
    "  【应期】",
    `  ${timing}`,
    "",
    "  【禁忌】",
    ...taboo.map((item) => `  ✗ ${item}`),
    "",
    "  【玄学加成】",
    `  此币五行${buildFiveElementText(context.hexagram, context.riskLevel, context.hypePhase)}。火旺则情绪易燃，水重则流动受困；凡见热闹，先问池深。`,
  ].join("\n");
}

function buildCautionSection(
  riskLevel: RiskLevel,
  confidence: "low" | "medium" | "high",
  watchConditions: string[],
): string {
  const riskHint =
    riskLevel === "critical" || riskLevel === "high"
      ? "此课风险权重大，必须先看安全、流动性和退出条件。"
      : "此课风险暂未压过卦象，但仍需要后续数据确认。";
  const confidenceHint =
    confidence === "low"
      ? "本次置信度低，主要原因是输入数据不足，不能把完整卦文误读成完整事实。"
      : "本次有一定数据支撑，但链上世界变化快，仍需滚动复核。";

  return [
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "              戒 语",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
    `  ${riskHint}${confidenceHint}`,
    ...watchConditions.map((condition) => `  ✗ ${condition}`),
  ].join("\n");
}

function buildClosingPoem(context: LongReadingContext): string[] {
  if (context.riskLevel === "critical") {
    return [
      `${context.hexagram.name.slice(0, 2)}入局水声寒，`,
      "池浅筹高莫倚栏。",
      "一念贪风吹烛灭，",
      "留得本金是青山。",
    ];
  }
  if (context.hypePhase === "ignition" || context.hypePhase === "expansion") {
    return [
      `${context.hexagram.name.slice(0, 2)}初明照夜盘，`,
      "鲸影未深众意宽。",
      "若见真量随风起，",
      "不贪不惧自心安。",
    ];
  }
  return [
    `${context.hexagram.name.slice(0, 2)}云开未见山，`,
    "人声起落在池边。",
    "卦中有象非天命，",
    "且把风险放眼前。",
  ];
}

function buildWatchConditions(
  metrics: TokenMarketMetrics,
  hypePhase: HypePhase,
  riskLevel: RiskLevel,
  changingLines: ChangingLineReading[],
): string[] {
  const watch = [
    "如果成交量继续放大但价格不创新高，视为热度转衰。",
    "如果核心地址或聪明钱继续净流出，视为卦意转弱。",
  ];

  if (hypePhase === "ignition") watch.push("初燃阶段只看新增买盘是否连续，不把一次异动当趋势。");
  if (hypePhase === "saturation") watch.push("旺火阶段重点看高位承接，量增价滞要降权处理。");
  if (riskLevel === "critical" || riskLevel === "high") watch.push("风险偏高时，任何玄学吉象都不能覆盖安全与流动性问题。");
  if ((metrics.liquidityUsd ?? Number.POSITIVE_INFINITY) < 100000) watch.push("流动性偏薄，退出成本比入场故事更重要。");
  if (changingLines.some((line) => line.line === 5 || line.line === 6)) watch.push("五爻或上爻动，重点观察主导资金是否已经开始退场。");

  return Array.from(new Set(watch)).slice(0, 7);
}

function buildLiquidityOmen(metrics: TokenMarketMetrics): string {
  const liquidityUsd = metrics.liquidityUsd;
  const liquidityChange = metrics.liquidityChangePct ?? 0;
  if (liquidityUsd === undefined) return "池水未明：缺少流动性数据，只能低置信度观察。";
  if (liquidityUsd < 25000) return "池浅见底：流动性太薄，任何热度都可能无法承接退出。";
  if (liquidityChange < -12) return "退潮见石：流动性正在抽离，风险权重上升。";
  if (liquidityUsd > 1_000_000 && liquidityChange >= 0) return "池深水稳：承接条件较好，但仍需看买卖方向。";
  return "池水可渡：流动性尚可，但不能替代安全检查。";
}

function buildMatchReading(
  hexagram: HexagramReading,
  hypePhase: HypePhase,
  riskLevel: RiskLevel,
  confidence: "low" | "medium" | "high",
): string {
  const riskyHexagram = /坎|困|剥|遁|否|蛊|蹇|睽|讼/.test(hexagram.name);
  if (confidence === "low") return "数据不足：卦象可读，但链上交叉验证较弱。";
  if (riskLevel === "critical") return "数据强烈压过卦象：即使卦面有可用之势，也必须先按极高风险处理。";
  if (riskyHexagram && riskLevel === "high") {
    return "卦象与数据一致：玄学和指标都指向风险优先。";
  }
  if (!riskyHexagram && (hypePhase === "ignition" || hypePhase === "expansion")) {
    return "卦象与数据偏顺：热度仍有扩张条件，但不代表可买。";
  }
  return "卦象与数据混合：存在可观察信号，但确认度不足。";
}

function phaseText(phase: HypePhase): string {
  const texts: Record<HypePhase, string> = {
    ignition: "初燃",
    expansion: "旺火扩张",
    saturation: "盛极分歧",
    decay: "热度衰减",
    afterlife: "余烬残热",
    unknown: "未明",
  };
  return texts[phase];
}

function riskText(risk: RiskLevel): string {
  const texts: Record<RiskLevel, string> = {
    low: "低",
    medium: "中",
    high: "高",
    critical: "极高",
  };
  return texts[risk];
}

function smartMoneyText(signal: SmartMoneySignal): string {
  const texts: Record<SmartMoneySignal, string> = {
    real_accumulation: "真实积累",
    probe: "试探仓位",
    stale: "旧信号或退潮信号",
    exit_bait: "可能是高位诱导信号",
    unknown: "未提供足够数据",
  };
  return texts[signal];
}

function confidenceText(confidence: "low" | "medium" | "high"): string {
  const texts: Record<"low" | "medium" | "high", string> = {
    low: "低",
    medium: "中",
    high: "高",
  };
  return texts[confidence];
}

export function validateChaosTokenOracleRequest(body: unknown): string | null {
  if (!body || typeof body !== "object") return "请求体必须是 JSON 对象";
  const value = body as Partial<ChaosTokenOracleRequest>;
  if (!cleanText(value.token)) return "token 不能为空";
  if (cleanText(value.chain).length > 40) return "chain 过长";
  if (cleanText(value.token).length > 120) return "token 过长";
  if (value.mode !== undefined && value.mode !== "quick_omen" && value.mode !== "full_ritual") {
    return "mode 只能是 quick_omen 或 full_ritual";
  }
  return null;
}

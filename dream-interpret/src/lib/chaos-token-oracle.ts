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

export interface ChaosTokenOracleRequest {
  chain: string;
  token: string;
  symbol?: string;
  window?: string;
  mode?: ChaosOracleMode;
  question?: string;
  observedAt?: string;
  metrics?: TokenMarketMetrics;
}

export interface ChaosTokenOracleResponse {
  ok: true;
  service: "chaos-token-oracle";
  version: "1.0.0";
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

  return {
    ok: true,
    service: "chaos-token-oracle",
    version: "1.0.0",
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
  const chain = cleanText(input.chain).toLowerCase();
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
  ].filter((value) => value !== undefined).length;

  if (present >= 7) return "high";
  if (present >= 4) return "medium";
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
  if (riskyHexagram && (riskLevel === "high" || riskLevel === "critical")) {
    return "卦象与数据一致：玄学和指标都指向风险优先。";
  }
  if (!riskyHexagram && (hypePhase === "ignition" || hypePhase === "expansion") && riskLevel !== "critical") {
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

export function validateChaosTokenOracleRequest(body: unknown): string | null {
  if (!body || typeof body !== "object") return "请求体必须是 JSON 对象";
  const value = body as Partial<ChaosTokenOracleRequest>;
  if (!cleanText(value.chain)) return "chain 不能为空";
  if (!cleanText(value.token)) return "token 不能为空";
  if (cleanText(value.chain).length > 40) return "chain 过长";
  if (cleanText(value.token).length > 120) return "token 过长";
  if (value.mode !== undefined && value.mode !== "quick_omen" && value.mode !== "full_ritual") {
    return "mode 只能是 quick_omen 或 full_ritual";
  }
  return null;
}

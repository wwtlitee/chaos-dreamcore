export type ChaosWorldCupOracleMode = "quick_omen" | "full_ritual";

export interface WorldCupMarketContext {
  oddsHome?: number;
  oddsDraw?: number;
  oddsAway?: number;
  publicHeatHomePct?: number;
  publicHeatAwayPct?: number;
  source?: string;
}

export interface WorldCupTeamContext {
  fifaRank?: number;
  fifaPoints?: number;
  recentMatches?: number;
  recentWins?: number;
  recentDraws?: number;
  recentLosses?: number;
  goalsFor?: number;
  goalsAgainst?: number;
  injuries?: number;
  suspensions?: number;
  squadDepth?: number;
  lineupQuality?: number;
  keyPlayersAvailable?: number;
  coachStability?: number;
  moraleSignal?: number;
  disciplineRisk?: number;
  restDays?: number;
  travelLoad?: number;
  pathDifficulty?: number;
  styleMismatchRisk?: number;
  notes?: string[];
}

export interface ChaosWorldCupOracleRequest {
  match?: string;
  homeTeam?: string;
  awayTeam?: string;
  focusTeam?: string;
  kickoffTime?: string;
  venue?: string;
  stage?: string;
  mode?: ChaosWorldCupOracleMode;
  question?: string;
  marketContext?: WorldCupMarketContext;
  homeContext?: WorldCupTeamContext;
  awayContext?: WorldCupTeamContext;
}

export interface ChaosWorldCupOracleResponse {
  ok: true;
  service: "chaos-worldcup-oracle";
  version: "1.0.0";
  mode: ChaosWorldCupOracleMode;
  matchSnapshot: {
    match: string;
    homeTeam: string;
    awayTeam: string;
    focusTeam: string;
    opponentTeam: string;
    kickoffTime?: string;
    venue?: string;
    stage?: string;
    marketContext?: WorldCupMarketContext;
  };
  ritual: {
    method: "worldcup_liuyao";
    seed: string;
    hexagram: HexagramReading;
    changingLines: ChangingLineReading[];
    transformedHexagram: HexagramReading;
    lineScores: LineScore[];
    omen: string;
  };
  oracleReading: {
    title: string;
    tendency: "focus_clear" | "focus_slight" | "balanced" | "opponent_slight" | "opponent_clear";
    upsetRisk: "low" | "medium" | "high";
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
    upsetRisk: "low" | "medium" | "high";
    marketHeat: string;
    noBettingAdvice: true;
  };
  disclaimer: string;
}

type TrigramKey = "qian" | "dui" | "li" | "zhen" | "xun" | "kan" | "gen" | "kun";

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
  name: string;
  polarity: "yin" | "yang";
  message: string;
}

interface LineScore {
  line: number;
  name: "阵容" | "气势" | "人心" | "贵人" | "小人" | "天命";
  score: number;
  polarity: "yin" | "yang";
  isChanging: boolean;
  verdict: string;
  evidence: string[];
  missing: string[];
  closing: string;
}

interface NormalizedRequest {
  match: string;
  homeTeam: string;
  awayTeam: string;
  focusTeam: string;
  opponentTeam: string;
  kickoffTime?: string;
  venue?: string;
  stage?: string;
  mode: ChaosWorldCupOracleMode;
  question: string;
  marketContext?: WorldCupMarketContext;
  focusContext: WorldCupTeamContext;
  opponentContext: WorldCupTeamContext;
  homeContext: WorldCupTeamContext;
  awayContext: WorldCupTeamContext;
}

const DISCLAIMER =
  "本结果仅供娱乐与赛事研究参考，不构成投注、投资或任何确定性预测建议。";

const TRIGRAMS_BY_BITS: Record<string, Trigram> = {
  "111": { key: "qian", name: "乾", element: "天", code: "111" },
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
    qian: hex(1, "乾为天", "强势推进，过刚则折。"),
    dui: hex(43, "泽天夬", "破局在前，宜决不宜躁。"),
    li: hex(14, "火天大有", "资源聚拢，优势可成。"),
    zhen: hex(34, "雷天大壮", "声势正盛，忌轻敌。"),
    xun: hex(9, "风天小畜", "势被蓄住，需耐心拆局。"),
    kan: hex(5, "水天需", "强中有待，先守节奏。"),
    gen: hex(26, "山天大畜", "厚积待发，关键在释放。"),
    kun: hex(11, "地天泰", "上下相通，局面渐顺。"),
  },
  dui: {
    qian: hex(10, "天泽履", "临险而行，守规矩则过。"),
    dui: hex(58, "兑为泽", "情绪扩散，声势互振。"),
    li: hex(38, "火泽睽", "风格相冲，分歧明显。"),
    zhen: hex(54, "雷泽归妹", "短促诱因强，稳定性不足。"),
    xun: hex(61, "风泽中孚", "信号需验，真诚可通。"),
    kan: hex(60, "水泽节", "有节有制，守边界为先。"),
    gen: hex(41, "山泽损", "优势受损，需防折耗。"),
    kun: hex(19, "地泽临", "人气靠近，压力渐来。"),
  },
  li: {
    qian: hex(13, "天火同人", "众志可合，协同为贵。"),
    dui: hex(49, "泽火革", "局势将变，旧法未必通。"),
    li: hex(30, "离为火", "光明在场，盛极防燃尽。"),
    zhen: hex(55, "雷火丰", "盛势高张，变数亦重。"),
    xun: hex(37, "风火家人", "队形要稳，内外需同心。"),
    kan: hex(63, "水火既济", "阶段已成，后劲待验。"),
    gen: hex(22, "山火贲", "外象华美，内核需查。"),
    kun: hex(36, "地火明夷", "光被压住，暗伤需防。"),
  },
  zhen: {
    qian: hex(25, "天雷无妄", "突发之象，少作妄断。"),
    dui: hex(17, "泽雷随", "随势而动，需辨真假。"),
    li: hex(21, "火雷噬嗑", "阻力在前，必须咬开。"),
    zhen: hex(51, "震为雷", "惊雷入局，先乱后定。"),
    xun: hex(42, "风雷益", "增益可期，贵在真实。"),
    kan: hex(3, "水雷屯", "初动艰难，波折较多。"),
    gen: hex(27, "山雷颐", "靠供养续势，需看后勤。"),
    kun: hex(24, "地雷复", "低位复起，转机初现。"),
  },
  xun: {
    qian: hex(44, "天风姤", "偶遇强风，短促而险。"),
    dui: hex(28, "泽风大过", "压力过重，结构需稳。"),
    li: hex(50, "火风鼎", "重塑之象，换法可成。"),
    zhen: hex(32, "雷风恒", "趋势延续，贵在恒心。"),
    xun: hex(57, "巽为风", "风行四散，消息多变。"),
    kan: hex(48, "水风井", "根基可取，但不可急掘。"),
    gen: hex(18, "山风蛊", "旧患发酵，须先治病。"),
    kun: hex(46, "地风升", "缓升之象，渐进为宜。"),
  },
  kan: {
    qian: hex(6, "天水讼", "争执明显，拉扯加重。"),
    dui: hex(47, "泽水困", "受困之象，出路不宽。"),
    li: hex(64, "火水未济", "事未完成，胜负未定。"),
    zhen: hex(40, "雷水解", "压力可解，需看时机。"),
    xun: hex(59, "风水涣", "军心易散，聚焦为先。"),
    kan: hex(29, "坎为水", "重险之象，先守后谋。"),
    gen: hex(4, "山水蒙", "信息未明，勿强下断。"),
    kun: hex(7, "地水师", "纪律为本，队形定局。"),
  },
  gen: {
    qian: hex(33, "天山遁", "退避之象，避锋为宜。"),
    dui: hex(31, "泽山咸", "情绪相感，易被气氛牵动。"),
    li: hex(56, "火山旅", "客旅之象，短热难稳。"),
    zhen: hex(62, "雷山小过", "小过可成，大进须慎。"),
    xun: hex(53, "风山渐", "渐进之象，耐心见功。"),
    kan: hex(39, "水山蹇", "阻滞在前，路难速通。"),
    gen: hex(52, "艮为山", "止步观察，守住阵脚。"),
    kun: hex(15, "地山谦", "低调蓄势，谦则有得。"),
  },
  kun: {
    qian: hex(12, "天地否", "上下不通，气脉受阻。"),
    dui: hex(45, "泽地萃", "人群聚集，聚散看心。"),
    li: hex(35, "火地晋", "上升之象，循序可进。"),
    zhen: hex(16, "雷地豫", "预期先行，防乐观过度。"),
    xun: hex(20, "风地观", "宜观不宜断，先看证据。"),
    kan: hex(8, "水地比", "靠拢之象，结盟为重。"),
    gen: hex(23, "山地剥", "剥落之象，风险显现。"),
    kun: hex(2, "坤为地", "承载力强，主动性弱。"),
  },
};

function hex(number: number, name: string, meaning: string): HexagramMeta {
  return { number, name, meaning };
}

export function buildChaosWorldCupOracle(input: ChaosWorldCupOracleRequest): ChaosWorldCupOracleResponse {
  const normalized = normalizeInput(input);
  const lineScores = buildLineScores(normalized);
  const lines = lineScores.map((line) => line.polarity === "yang");
  const transformedLines = lineScores.map((line) =>
    line.isChanging ? line.polarity !== "yang" : line.polarity === "yang",
  );
  const hexagram = readHexagram(lines);
  const transformedHexagram = readHexagram(transformedLines);
  const changingLines = buildChangingLineReadings(lineScores);
  const confidence = classifyConfidence(lineScores, normalized.marketContext);
  const tendency = classifyTendency(lineScores);
  const upsetRisk = classifyUpsetRisk(lineScores, normalized.marketContext);
  const dataSignals = collectDataSignals(lineScores, normalized.marketContext);
  const missingSignals = collectMissingSignals(lineScores);
  const watch = buildWatchList(lineScores, upsetRisk);
  const longReading = buildLongReading({
    normalized,
    lineScores,
    hexagram,
    transformedHexagram,
    changingLines,
    confidence,
    tendency,
    upsetRisk,
    dataSignals,
    missingSignals,
    watch,
  });

  return {
    ok: true,
    service: "chaos-worldcup-oracle",
    version: "1.0.0",
    mode: normalized.mode,
    matchSnapshot: {
      match: normalized.match,
      homeTeam: normalized.homeTeam,
      awayTeam: normalized.awayTeam,
      focusTeam: normalized.focusTeam,
      opponentTeam: normalized.opponentTeam,
      kickoffTime: normalized.kickoffTime,
      venue: normalized.venue,
      stage: normalized.stage,
      marketContext: normalized.marketContext,
    },
    ritual: {
      method: "worldcup_liuyao",
      seed: buildSeed(normalized),
      hexagram,
      changingLines,
      transformedHexagram,
      lineScores,
      omen: `${hexagram.name}变${transformedHexagram.name}：${buildTendencyText(tendency)}，${buildUpsetText(upsetRisk)}。`,
    },
    oracleReading: {
      title: `${normalized.match} 赛事卦象`,
      tendency,
      upsetRisk,
      plain: buildPlainReading(normalized, hexagram, transformedHexagram, tendency, upsetRisk),
      longReading,
      watch,
    },
    dataCrosscheck: {
      confidence,
      dataSignals,
      missingSignals,
      upsetRisk,
      marketHeat: buildMarketHeatText(normalized.marketContext),
      noBettingAdvice: true,
    },
    disclaimer: DISCLAIMER,
  };
}

function normalizeInput(input: ChaosWorldCupOracleRequest): NormalizedRequest {
  const parsedMatch = parseMatch(input.match);
  const homeTeam = cleanText(input.homeTeam || parsedMatch.homeTeam);
  const awayTeam = cleanText(input.awayTeam || parsedMatch.awayTeam);
  const focusTeam = cleanText(input.focusTeam || homeTeam);
  const opponentTeam = focusTeam === awayTeam ? homeTeam : awayTeam;
  const homeContext = sanitizeTeamContext(input.homeContext);
  const awayContext = sanitizeTeamContext(input.awayContext);
  const focusContext = focusTeam === awayTeam ? awayContext : homeContext;
  const opponentContext = focusTeam === awayTeam ? homeContext : awayContext;

  return {
    match: `${homeTeam} vs ${awayTeam}`,
    homeTeam,
    awayTeam,
    focusTeam,
    opponentTeam,
    kickoffTime: cleanOptional(input.kickoffTime),
    venue: cleanOptional(input.venue),
    stage: cleanOptional(input.stage),
    mode: input.mode === "quick_omen" ? "quick_omen" : "full_ritual",
    question: cleanText(input.question || ""),
    marketContext: sanitizeMarketContext(input.marketContext),
    focusContext,
    opponentContext,
    homeContext,
    awayContext,
  };
}

function parseMatch(match?: string) {
  const text = cleanText(match);
  const parts = text.split(/\s+(?:vs\.?|v\.?|VS|对|VS\.?)\s+/i).map(cleanText).filter(Boolean);
  if (parts.length >= 2) return { homeTeam: parts[0], awayTeam: parts.slice(1).join(" ") };
  return { homeTeam: "", awayTeam: "" };
}

function sanitizeTeamContext(context?: WorldCupTeamContext): WorldCupTeamContext {
  if (!context) return {};
  return {
    fifaRank: finite(context.fifaRank),
    fifaPoints: finite(context.fifaPoints),
    recentMatches: finite(context.recentMatches),
    recentWins: finite(context.recentWins),
    recentDraws: finite(context.recentDraws),
    recentLosses: finite(context.recentLosses),
    goalsFor: finite(context.goalsFor),
    goalsAgainst: finite(context.goalsAgainst),
    injuries: finite(context.injuries),
    suspensions: finite(context.suspensions),
    squadDepth: clampScore(context.squadDepth),
    lineupQuality: clampScore(context.lineupQuality),
    keyPlayersAvailable: clampScore(context.keyPlayersAvailable),
    coachStability: clampScore(context.coachStability),
    moraleSignal: clampScore(context.moraleSignal),
    disciplineRisk: clampRisk(context.disciplineRisk),
    restDays: finite(context.restDays),
    travelLoad: clampRisk(context.travelLoad),
    pathDifficulty: clampRisk(context.pathDifficulty),
    styleMismatchRisk: clampRisk(context.styleMismatchRisk),
    notes: Array.isArray(context.notes) ? context.notes.map(cleanText).filter(Boolean).slice(0, 8) : [],
  };
}

function sanitizeMarketContext(context?: WorldCupMarketContext): WorldCupMarketContext | undefined {
  if (!context) return undefined;
  return {
    oddsHome: positive(context.oddsHome),
    oddsDraw: positive(context.oddsDraw),
    oddsAway: positive(context.oddsAway),
    publicHeatHomePct: percent(context.publicHeatHomePct),
    publicHeatAwayPct: percent(context.publicHeatAwayPct),
    source: cleanOptional(context.source),
  };
}

function buildLineScores(input: NormalizedRequest): LineScore[] {
  const lines = [
    buildSquadLine(input),
    buildMomentumLine(input),
    buildMoraleLine(input),
    buildCatalystLine(input),
    buildVillainLine(input),
    buildFateLine(input),
  ];
  const hasChanging = lines.some((line) => line.isChanging);
  if (hasChanging) return lines;

  const closest = lines.reduce((best, line) => (Math.abs(line.score) < Math.abs(best.score) ? line : best), lines[0]);
  return lines.map((line) => (line.line === closest.line ? { ...line, isChanging: true } : line));
}

function buildSquadLine(input: NormalizedRequest): LineScore {
  const focus = input.focusContext;
  const opponent = input.opponentContext;
  const evidence: string[] = [];
  const missing: string[] = [];
  let score = 0;

  score += compareHigh(focus.lineupQuality, opponent.lineupQuality, 0.65, evidence, missing, "预计首发质量");
  score += compareHigh(focus.squadDepth, opponent.squadDepth, 0.45, evidence, missing, "板凳深度");
  score += compareLow(focus.injuries, opponent.injuries, 0.45, evidence, missing, "伤病人数");
  score += compareLow(focus.suspensions, opponent.suspensions, 0.25, evidence, missing, "停赛人数");
  score += compareRank(focus.fifaRank, opponent.fifaRank, 0.35, evidence, missing);

  return makeLine(1, "阵容", score, evidence, missing, {
    positive: "将星列阵，厚度可依。",
    neutral: "兵形未明，强弱待验。",
    negative: "锋芒有缺，阵脚藏空。",
    closingPositive: "阵容有力",
    closingNegative: "阵容有明显短板",
  });
}

function buildMomentumLine(input: NormalizedRequest): LineScore {
  const focus = input.focusContext;
  const opponent = input.opponentContext;
  const evidence: string[] = [];
  const missing: string[] = [];
  let score = 0;

  score += compareForm(focus, opponent, evidence, missing);
  score += compareGoalBalance(focus, opponent, evidence, missing);
  score += compareHigh(focus.fifaPoints, opponent.fifaPoints, 0.25, evidence, missing, "FIFA 积分");

  return makeLine(2, "气势", score, evidence, missing, {
    positive: "锋火渐明，势头可用。",
    neutral: "风声未定，势能待察。",
    negative: "气口受压，前势不畅。",
    closingPositive: "势头不错",
    closingNegative: "气势偏弱",
  });
}

function buildMoraleLine(input: NormalizedRequest): LineScore {
  const focus = input.focusContext;
  const opponent = input.opponentContext;
  const evidence: string[] = [];
  const missing: string[] = [];
  let score = 0;

  score += compareHigh(focus.moraleSignal, opponent.moraleSignal, 0.45, evidence, missing, "外显士气");
  score += compareHigh(focus.coachStability, opponent.coachStability, 0.25, evidence, missing, "主帅稳定性");
  score += compareLow(focus.disciplineRisk, opponent.disciplineRisk, 0.2, evidence, missing, "纪律风险");
  score += comparePublicHeat(input, evidence);

  return makeLine(3, "人心", score, evidence, missing, {
    positive: "众心归一，声势相扶。",
    neutral: "声势在外，内情未明。",
    negative: "众望成压，暗流须防。",
    closingPositive: "人心可用",
    closingNegative: "人心有隐患",
  });
}

function buildCatalystLine(input: NormalizedRequest): LineScore {
  const focus = input.focusContext;
  const opponent = input.opponentContext;
  const evidence: string[] = [];
  const missing: string[] = [];
  let score = 0;

  score += compareHigh(focus.keyPlayersAvailable, opponent.keyPlayersAvailable, 0.75, evidence, missing, "关键球员可用性");
  score += compareHigh(focus.coachStability, opponent.coachStability, 0.25, evidence, missing, "临场调度稳定性");

  return makeLine(4, "贵人", score, evidence, missing, {
    positive: "星位有光，关键手在阵。",
    neutral: "贵人未显，待临门一脚。",
    negative: "星光受遮，破局者不足。",
    closingPositive: "贵人有力",
    closingNegative: "贵人不足",
  });
}

function buildVillainLine(input: NormalizedRequest): LineScore {
  const focus = input.focusContext;
  const opponent = input.opponentContext;
  const evidence: string[] = [];
  const missing: string[] = [];
  let score = 0;

  score += compareLow(focus.styleMismatchRisk, opponent.styleMismatchRisk, 0.5, evidence, missing, "风格克制风险");
  score += compareLow(focus.injuries, opponent.injuries, 0.3, evidence, missing, "伤病隐患");
  score += compareLow(focus.disciplineRisk, opponent.disciplineRisk, 0.25, evidence, missing, "红黄牌风险");
  score += compareLow(focus.travelLoad, opponent.travelLoad, 0.2, evidence, missing, "旅途消耗");

  return makeLine(5, "小人", score, evidence, missing, {
    positive: "暗礁可避，隐患不重。",
    neutral: "暗处有影，仍须巡夜。",
    negative: "三害当前，不可不察。",
    closingPositive: "小人未显",
    closingNegative: "小人当道",
  });
}

function buildFateLine(input: NormalizedRequest): LineScore {
  const focus = input.focusContext;
  const opponent = input.opponentContext;
  const evidence: string[] = [];
  const missing: string[] = [];
  let score = 0;

  score += compareHigh(focus.restDays, opponent.restDays, 0.35, evidence, missing, "休息天数");
  score += compareLow(focus.pathDifficulty, opponent.pathDifficulty, 0.35, evidence, missing, "晋级路径难度");
  score += compareLow(focus.travelLoad, opponent.travelLoad, 0.2, evidence, missing, "赛程奔波");
  if (input.stage) evidence.push(`赛程阶段：${input.stage}`);
  if (input.venue) evidence.push(`比赛地点：${input.venue}`);

  return makeLine(6, "天命", score, evidence, missing, {
    positive: "天时微顺，路有可行。",
    neutral: "签运中平，天时待察。",
    negative: "天路不宽，逆风入局。",
    closingPositive: "天命小顺",
    closingNegative: "天命不算眷顾",
  });
}

function makeLine(
  line: number,
  name: LineScore["name"],
  rawScore: number,
  evidence: string[],
  missing: string[],
  wording: {
    positive: string;
    neutral: string;
    negative: string;
    closingPositive: string;
    closingNegative: string;
  },
): LineScore {
  const score = clamp(rawScore, -2, 2);
  const polarity = score >= 0 ? "yang" : "yin";
  const isChanging = Math.abs(score) < 0.35 || missing.length >= 3;
  const verdict = score > 0.35 ? wording.positive : score < -0.35 ? wording.negative : wording.neutral;
  const closing = score >= 0 ? wording.closingPositive : wording.closingNegative;
  return { line, name, score, polarity, isChanging, verdict, evidence, missing, closing };
}

function compareHigh(
  focus?: number,
  opponent?: number,
  weight = 1,
  evidence: string[] = [],
  missing: string[] = [],
  label = "指标",
) {
  if (focus === undefined || opponent === undefined) {
    missing.push(label);
    return 0;
  }
  const diff = normalizeDiff(focus, opponent);
  evidence.push(`${label}：${formatNumber(focus)} 对 ${formatNumber(opponent)}`);
  return diff * weight;
}

function compareLow(
  focus?: number,
  opponent?: number,
  weight = 1,
  evidence: string[] = [],
  missing: string[] = [],
  label = "风险",
) {
  if (focus === undefined || opponent === undefined) {
    missing.push(label);
    return 0;
  }
  const diff = normalizeDiff(opponent, focus);
  evidence.push(`${label}：${formatNumber(focus)} 对 ${formatNumber(opponent)}`);
  return diff * weight;
}

function compareRank(
  focus?: number,
  opponent?: number,
  weight = 1,
  evidence: string[] = [],
  missing: string[] = [],
) {
  if (focus === undefined || opponent === undefined) {
    missing.push("FIFA 排名");
    return 0;
  }
  evidence.push(`FIFA 排名：${focus} 对 ${opponent}`);
  return normalizeDiff(opponent, focus) * weight;
}

function compareForm(
  focus: WorldCupTeamContext,
  opponent: WorldCupTeamContext,
  evidence: string[],
  missing: string[],
) {
  if (
    focus.recentWins === undefined ||
    focus.recentDraws === undefined ||
    focus.recentLosses === undefined ||
    opponent.recentWins === undefined ||
    opponent.recentDraws === undefined ||
    opponent.recentLosses === undefined
  ) {
    missing.push("近期战绩");
    return 0;
  }
  const focusPoints = focus.recentWins * 3 + focus.recentDraws;
  const opponentPoints = opponent.recentWins * 3 + opponent.recentDraws;
  evidence.push(
    `近期战绩：${focus.recentWins}胜${focus.recentDraws}平${focus.recentLosses}负，对手${opponent.recentWins}胜${opponent.recentDraws}平${opponent.recentLosses}负`,
  );
  return normalizeDiff(focusPoints, opponentPoints) * 0.75;
}

function compareGoalBalance(
  focus: WorldCupTeamContext,
  opponent: WorldCupTeamContext,
  evidence: string[],
  missing: string[],
) {
  if (
    focus.goalsFor === undefined ||
    focus.goalsAgainst === undefined ||
    opponent.goalsFor === undefined ||
    opponent.goalsAgainst === undefined
  ) {
    missing.push("进失球");
    return 0;
  }
  const focusBalance = focus.goalsFor - focus.goalsAgainst;
  const opponentBalance = opponent.goalsFor - opponent.goalsAgainst;
  evidence.push(`进失球：${focus.goalsFor}/${focus.goalsAgainst}，对手${opponent.goalsFor}/${opponent.goalsAgainst}`);
  return normalizeDiff(focusBalance, opponentBalance) * 0.45;
}

function comparePublicHeat(input: NormalizedRequest, evidence: string[]) {
  const heat = input.marketContext;
  if (!heat?.publicHeatHomePct && !heat?.publicHeatAwayPct) return 0;
  const focusHeat = input.focusTeam === input.homeTeam ? heat.publicHeatHomePct : heat.publicHeatAwayPct;
  const opponentHeat = input.focusTeam === input.homeTeam ? heat.publicHeatAwayPct : heat.publicHeatHomePct;
  if (focusHeat === undefined || opponentHeat === undefined) return 0;
  evidence.push(`公开热度：${focusHeat}% 对 ${opponentHeat}%`);
  return normalizeDiff(focusHeat, opponentHeat) * 0.2;
}

function normalizeDiff(a: number, b: number) {
  const scale = Math.max(Math.abs(a), Math.abs(b), 1);
  return clamp((a - b) / scale, -1, 1);
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

function buildChangingLineReadings(lines: LineScore[]): ChangingLineReading[] {
  const changing = lines.filter((line) => line.isChanging);
  const source = changing.length ? changing : [lines[2]];
  return source.map((line) => ({
    line: line.line,
    name: line.name,
    polarity: line.polarity,
    message:
      line.score >= 0
        ? `${line.name}一爻可转强也可转虚，重点看临场数据是否继续支撑。`
        : `${line.name}一爻虽弱但未死，若赛前信息转好，凶意可减。`,
  }));
}

function buildLongReading(context: {
  normalized: NormalizedRequest;
  lineScores: LineScore[];
  hexagram: HexagramReading;
  transformedHexagram: HexagramReading;
  changingLines: ChangingLineReading[];
  confidence: "low" | "medium" | "high";
  tendency: ChaosWorldCupOracleResponse["oracleReading"]["tendency"];
  upsetRisk: "low" | "medium" | "high";
  dataSignals: string[];
  missingSignals: string[];
  watch: string[];
}) {
  const { normalized, hexagram, transformedHexagram, tendency, upsetRisk } = context;
  const overview = [
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "            卦 象 总 览",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
    `比赛：${normalized.match}`,
    normalized.stage ? `阶段：${normalized.stage}` : "",
    normalized.kickoffTime ? `时间：${normalized.kickoffTime}` : "",
    normalized.venue ? `地点：${normalized.venue}` : "",
    `问卦方：${normalized.focusTeam}`,
    `本卦：${hexagram.name}`,
    `变卦：${transformedHexagram.name}`,
    `总判：${buildTendencyText(tendency)}，${buildUpsetText(upsetRisk)}。`,
  ]
    .filter(Boolean)
    .join("\n");
  const hexagramVerse = [
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "              卦 辞",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
    `  ${hexagram.name}，${hexagram.meaning}`,
    `  ${normalized.focusTeam} 与 ${normalized.opponentTeam} 此局相逢，卦中先看阵形，再看气口。`,
    `  变卦${transformedHexagram.name}，主“${transformedHexagram.meaning}”。变卦不是比分承诺，只指出赛势可能转向的门缝。`,
  ].join("\n");
  const sixLines = buildSixLinesText(context.lineScores);
  const dataCrosscheck = buildDataCrosscheckText(context);
  const observationGuide = buildObservationGuide(context.watch);
  const closing = buildClosing(context);
  const fullText = [overview, hexagramVerse, sixLines, dataCrosscheck, observationGuide, closing].join("\n\n");

  return {
    summary: `${normalized.match} 得${hexagram.name}变${transformedHexagram.name}，${buildTendencyText(tendency)}，${buildUpsetText(upsetRisk)}。`,
    sections: {
      overview,
      hexagramVerse,
      sixLines,
      dataCrosscheck,
      observationGuide,
      closing,
    },
    fullText,
  };
}

function buildSixLinesText(lines: LineScore[]) {
  const header = ["━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "            六 爻 详 解", "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"].join("\n");
  const bodies = lines.map((line) => {
    const mark = line.isChanging ? "△" : line.polarity === "yang" ? "✓" : "✗";
    const lineState = line.isChanging ? `${line.polarity === "yang" ? "阳" : "阴"}转${line.polarity === "yang" ? "阴" : "阳"}` : line.polarity === "yang" ? "阳爻" : "阴爻";
    const evidence =
      line.evidence.length > 0
        ? line.evidence.slice(0, 4).map((item) => `  ${item}。`).join("\n")
        : "  公开信息尚不足，本爻以外显信号与赛前可验证数据为准。";
    return [
      `【${lineName(line.line)} · ${line.name}】`,
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      `  判词：${line.verdict}`,
      "",
      evidence,
      line.missing.length > 0 ? `  尚待确认：${line.missing.slice(0, 4).join("、")}。` : "",
      "",
      `  此爻为${lineState}，${line.closing}。${mark}`,
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
  upsetRisk: "low" | "medium" | "high";
  normalized: NormalizedRequest;
}) {
  const signals = context.dataSignals.length
    ? context.dataSignals.slice(0, 8).map((item) => `  ✓ ${item}`).join("\n")
    : "  △ 当前输入数据偏少，卦象以结构化占谕为主，数据验卦权重较低。";
  const missing = context.missingSignals.length
    ? context.missingSignals.slice(0, 6).map((item) => `  △ ${item}尚待确认`).join("\n")
    : "  ✓ 核心验卦字段较完整。";
  return [
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "            赛 事 验 卦",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
    `  数据置信度：${confidenceText(context.confidence)}`,
    `  冷门风险：${upsetRiskText(context.upsetRisk)}`,
    `  热度交叉：${buildMarketHeatText(context.normalized.marketContext)}`,
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
    "  只看观察点，不给投注指令；若临场首发、伤停或红牌改变，需重新起卦。",
  ].join("\n");
}

function buildClosing(context: { normalized: NormalizedRequest; hexagram: HexagramReading; disclaimer?: string }) {
  return [
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "              封 卦",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
    `  ${context.hexagram.name.slice(0, 2)}照夜草成霜，`,
    "  一球风起万声忙。",
    "  卦中有象非天命，",
    "  且把胜负作文章。",
    "",
    `  ${DISCLAIMER}`,
  ].join("\n");
}

function classifyConfidence(lines: LineScore[], marketContext?: WorldCupMarketContext): "low" | "medium" | "high" {
  const evidenceCount = lines.reduce((total, line) => total + line.evidence.length, 0);
  const marketCount = marketContext ? Object.values(marketContext).filter((value) => value !== undefined && value !== "").length : 0;
  if (evidenceCount + marketCount >= 16) return "high";
  if (evidenceCount + marketCount >= 8) return "medium";
  return "low";
}

function classifyTendency(lines: LineScore[]): ChaosWorldCupOracleResponse["oracleReading"]["tendency"] {
  const total = lines.reduce((sum, line) => sum + line.score, 0);
  if (total >= 2.2) return "focus_clear";
  if (total >= 0.65) return "focus_slight";
  if (total <= -2.2) return "opponent_clear";
  if (total <= -0.65) return "opponent_slight";
  return "balanced";
}

function classifyUpsetRisk(lines: LineScore[], marketContext?: WorldCupMarketContext): "low" | "medium" | "high" {
  const villain = lines.find((line) => line.name === "小人")?.score ?? 0;
  const morale = lines.find((line) => line.name === "人心")?.score ?? 0;
  const total = lines.reduce((sum, line) => sum + line.score, 0);
  const heat = Math.max(marketContext?.publicHeatHomePct ?? 0, marketContext?.publicHeatAwayPct ?? 0);
  if (villain < -0.8 || (Math.abs(total) < 0.5 && heat > 70) || morale < -0.8) return "high";
  if (villain < -0.25 || Math.abs(total) < 1.2 || heat > 62) return "medium";
  return "low";
}

function collectDataSignals(lines: LineScore[], marketContext?: WorldCupMarketContext) {
  const signals = lines.flatMap((line) => line.evidence.slice(0, 2));
  if (marketContext?.source) signals.push(`市场/热度来源：${marketContext.source}`);
  if (marketContext?.oddsHome && marketContext?.oddsDraw && marketContext?.oddsAway) {
    signals.push(`赔率快照：主${marketContext.oddsHome}，平${marketContext.oddsDraw}，客${marketContext.oddsAway}`);
  }
  return Array.from(new Set(signals));
}

function collectMissingSignals(lines: LineScore[]) {
  return Array.from(new Set(lines.flatMap((line) => line.missing))).slice(0, 12);
}

function buildWatchList(lines: LineScore[], upsetRisk: "low" | "medium" | "high") {
  const watch = [
    "赛前首发若与预计不同，阵容爻必须重算。",
    "若强势方前 25 分钟久攻不下，需观察人心爻是否转躁。",
    "定位球、反击和门将失误是冷门窗口的三类触发点。",
  ];
  if ((lines.find((line) => line.name === "小人")?.score ?? 0) < 0) {
    watch.push("小人爻偏阴时，重点看伤病、红黄牌、体能和风格克制。");
  }
  if (upsetRisk !== "low") {
    watch.push("冷门风险不低时，强势方控球优势不能直接等同于胜势。");
  }
  return Array.from(new Set(watch)).slice(0, 6);
}

function buildPlainReading(
  input: NormalizedRequest,
  hexagram: HexagramReading,
  transformedHexagram: HexagramReading,
  tendency: ChaosWorldCupOracleResponse["oracleReading"]["tendency"],
  upsetRisk: "low" | "medium" | "high",
) {
  return `${input.match} 得${hexagram.name}，变${transformedHexagram.name}。${buildTendencyText(tendency)}，${buildUpsetText(upsetRisk)}。`;
}

function buildTendencyText(tendency: ChaosWorldCupOracleResponse["oracleReading"]["tendency"]) {
  const texts = {
    focus_clear: "问卦方优势较清楚",
    focus_slight: "问卦方小优",
    balanced: "两边拉扯，胜负门未开",
    opponent_slight: "对手小优",
    opponent_clear: "对手优势较清楚",
  };
  return texts[tendency];
}

function buildUpsetText(risk: "low" | "medium" | "high") {
  const texts = {
    low: "冷门风险偏低",
    medium: "冷门风险中等",
    high: "冷门风险偏高",
  };
  return texts[risk];
}

function buildMarketHeatText(context?: WorldCupMarketContext) {
  if (!context) return "未提供赔率或公开热度，本次不以市场情绪强断。";
  const parts = [
    context.publicHeatHomePct !== undefined ? `主队热度${context.publicHeatHomePct}%` : "",
    context.publicHeatAwayPct !== undefined ? `客队热度${context.publicHeatAwayPct}%` : "",
    context.oddsHome !== undefined && context.oddsDraw !== undefined && context.oddsAway !== undefined
      ? `赔率主/平/客 ${context.oddsHome}/${context.oddsDraw}/${context.oddsAway}`
      : "",
  ].filter(Boolean);
  return parts.length ? `${parts.join("，")}。仅作热度观察，不作投注建议。` : "市场情绪字段有限，不作强断。";
}

function lineName(line: number) {
  return ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"][line - 1] ?? `${line}爻`;
}

function buildSeed(input: NormalizedRequest): string {
  return hashText(
    [
      input.match,
      input.focusTeam,
      input.kickoffTime,
      input.stage,
      input.venue,
      JSON.stringify(input.homeContext),
      JSON.stringify(input.awayContext),
      JSON.stringify(input.marketContext),
    ].join("::"),
  ).slice(0, 24);
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
  return `${first}${(secondHash >>> 0).toString(16).padStart(8, "0")}${first}`;
}

function finite(value: unknown): number | undefined {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function positive(value: unknown): number | undefined {
  const numberValue = finite(value);
  return numberValue !== undefined && numberValue > 0 ? numberValue : undefined;
}

function percent(value: unknown): number | undefined {
  const numberValue = finite(value);
  return numberValue === undefined ? undefined : clamp(numberValue, 0, 100);
}

function clampScore(value: unknown): number | undefined {
  const numberValue = finite(value);
  return numberValue === undefined ? undefined : clamp(numberValue, 0, 100);
}

function clampRisk(value: unknown): number | undefined {
  const numberValue = finite(value);
  return numberValue === undefined ? undefined : clamp(numberValue, 0, 100);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function cleanText(value: unknown): string {
  return String(value ?? "").trim();
}

function cleanOptional(value: unknown): string | undefined {
  const text = cleanText(value);
  return text || undefined;
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : String(Math.round(value * 100) / 100);
}

function confidenceText(confidence: "low" | "medium" | "high") {
  const texts = { low: "低", medium: "中", high: "高" };
  return texts[confidence];
}

function upsetRiskText(risk: "low" | "medium" | "high") {
  const texts = { low: "偏低", medium: "中等", high: "偏高" };
  return texts[risk];
}

export function validateChaosWorldCupOracleRequest(body: unknown): string | null {
  if (!body || typeof body !== "object") return "请求体必须是 JSON 对象";
  const value = body as Partial<ChaosWorldCupOracleRequest>;
  const parsed = parseMatch(value.match);
  const homeTeam = cleanText(value.homeTeam || parsed.homeTeam);
  const awayTeam = cleanText(value.awayTeam || parsed.awayTeam);
  if (!homeTeam || !awayTeam) return "请提供 match，或同时提供 homeTeam 与 awayTeam";
  if (homeTeam.length > 80 || awayTeam.length > 80) return "球队名称过长";
  if (cleanText(value.focusTeam).length > 80) return "focusTeam 过长";
  if (cleanText(value.question).length > 500) return "question 过长";
  if (value.mode !== undefined && value.mode !== "quick_omen" && value.mode !== "full_ritual") {
    return "mode 只能是 quick_omen 或 full_ritual";
  }
  return null;
}

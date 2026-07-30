export type ChaosFortuneOracleMode = "quick_omen" | "full_ritual";

export interface ChaosFortuneOracleRequest {
  name: string;
  birthDate: string;
  targetDate?: string;
  mode?: ChaosFortuneOracleMode;
  question?: string;
}

export interface ChaosFortuneOracleResponse {
  ok: true;
  service: "chaos-fortune-oracle";
  version: "1.0.0";
  mode: ChaosFortuneOracleMode;
  fortuneSnapshot: {
    name: string;
    birthDate: string;
    targetDate: string;
    question: string;
  };
  ritual: {
    method: "birthdate_daily_liuyao";
    seed: string;
    hexagram: HexagramReading;
    changingLines: ChangingLineReading[];
    transformedHexagram: HexagramReading;
    lineScores: LineScore[];
    omen: string;
  };
  oracleReading: {
    title: string;
    fortuneLevel: "bright" | "steady" | "mixed" | "blocked" | "heavy";
    plain: string;
    longReading: {
      summary: string;
      sections: {
        overview: string;
        hexagramVerse: string;
        sixLines: string;
        selfCrosscheck: string;
        observationGuide: string;
        closing: string;
      };
      fullText: string;
    };
    watch: string[];
  };
  dataCrosscheck: {
    confidence: "medium";
    rhythmSignals: string[];
    noProfessionalAdvice: true;
  };
  disclaimer: string;
}

type LineName = "本命" | "今日" | "事业" | "财气" | "关系" | "身心";

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
  closing: string;
}

interface NormalizedFortuneRequest {
  name: string;
  birthDate: string;
  targetDate: string;
  mode: ChaosFortuneOracleMode;
  question: string;
}

const DISCLAIMER = "本结果仅供娱乐与自我观察参考，不构成医疗、心理咨询、法律、投资或任何确定性建议。";

const HEXAGRAMS: HexagramReading[] = [
  hex(1, "乾为天", "主动开局，宜正面推进，忌过刚。"),
  hex(2, "坤为地", "承载蓄势，宜先整理内在秩序。"),
  hex(11, "地天泰", "气脉渐通，适合修复关系与推进小事。"),
  hex(12, "天地否", "上下不通，宜少争辩，多留余地。"),
  hex(15, "地山谦", "谦和得势，低调反而顺。"),
  hex(16, "雷地豫", "预期先行，开心可用但忌飘。"),
  hex(24, "地雷复", "旧事复起，适合回头整理。"),
  hex(29, "坎为水", "情绪重险，先稳住身体与边界。"),
  hex(30, "离为火", "光明显露，适合表达与看清。"),
  hex(31, "泽山咸", "感应增强，人际互动变敏感。"),
  hex(35, "火地晋", "上升之象，循序可进。"),
  hex(37, "风火家人", "内外要齐，关系与家宅为重。"),
  hex(42, "风雷益", "增益之象，适合学习、协作与修补。"),
  hex(47, "泽水困", "受困之象，先减压再求突破。"),
  hex(52, "艮为山", "止步观察，慢下来反而清楚。"),
  hex(63, "水火既济", "阶段已成，后续要守住节奏。"),
  hex(64, "火水未济", "事未完成，不急着给结论。"),
];

export function buildChaosFortuneOracle(input: ChaosFortuneOracleRequest): ChaosFortuneOracleResponse {
  const normalized = normalizeInput(input);
  const seed = buildSeed(normalized);
  const lineScores = buildLineScores(seed, normalized);
  const hexagram = selectHexagram(seed, 0);
  const transformedHexagram = selectHexagram(seed, 8);
  const changingLines = buildChangingLineReadings(lineScores);
  const fortuneLevel = classifyFortuneLevel(lineScores);
  const watch = buildWatchList(lineScores, fortuneLevel);
  const rhythmSignals = buildRhythmSignals(normalized, lineScores);
  const longReading = buildLongReading({
    normalized,
    lineScores,
    hexagram,
    transformedHexagram,
    fortuneLevel,
    rhythmSignals,
    watch,
  });

  return {
    ok: true,
    service: "chaos-fortune-oracle",
    version: "1.0.0",
    mode: normalized.mode,
    fortuneSnapshot: {
      name: normalized.name,
      birthDate: normalized.birthDate,
      targetDate: normalized.targetDate,
      question: normalized.question,
    },
    ritual: {
      method: "birthdate_daily_liuyao",
      seed,
      hexagram,
      changingLines,
      transformedHexagram,
      lineScores,
      omen: `${hexagram.name}变${transformedHexagram.name}：${fortuneText(fortuneLevel)}。`,
    },
    oracleReading: {
      title: `${normalized.name} ${normalized.targetDate} 运势卦象`,
      fortuneLevel,
      plain: `${normalized.name} 今日得${hexagram.name}，变${transformedHexagram.name}。${fortuneText(fortuneLevel)}。`,
      longReading,
      watch: normalized.mode === "quick_omen" ? watch.slice(0, 3) : watch,
    },
    dataCrosscheck: {
      confidence: "medium",
      rhythmSignals,
      noProfessionalAdvice: true,
    },
    disclaimer: DISCLAIMER,
  };
}

function normalizeInput(input: ChaosFortuneOracleRequest): NormalizedFortuneRequest {
  return {
    name: cleanText(input.name),
    birthDate: cleanText(input.birthDate),
    targetDate: cleanText(input.targetDate || new Date().toISOString().slice(0, 10)),
    mode: input.mode === "quick_omen" ? "quick_omen" : "full_ritual",
    question: cleanText(input.question || ""),
  };
}

function buildLineScores(seed: string, input: NormalizedFortuneRequest): LineScore[] {
  const names: LineName[] = ["本命", "今日", "事业", "财气", "关系", "身心"];
  const lines = names.map((name, index) => {
    const roll = Number.parseInt(seed.slice(index * 2, index * 2 + 2), 16);
    const score = ((roll % 9) - 4) / 4;
    return makeLine(index + 1, name, score, buildEvidence(name, input, roll));
  });

  if (lines.some((line) => line.isChanging)) return lines;
  return lines.map((line) => (line.line === 2 ? { ...line, isChanging: true } : line));
}

function buildEvidence(name: LineName, input: NormalizedFortuneRequest, roll: number): string[] {
  const base = [
    `姓名字数：${Array.from(input.name).length}`,
    `生日节律：${input.birthDate}`,
    `观测日期：${input.targetDate}`,
  ];
  if (input.question && (name === "今日" || name === "事业" || name === "关系")) {
    base.push(`关注主题：${input.question.slice(0, 80)}`);
  }
  base.push(`节律数：${roll % 9}`);
  return base.slice(0, 4);
}

function makeLine(line: number, name: LineName, score: number, evidence: string[]): LineScore {
  const polarity = score >= 0 ? "yang" : "yin";
  const isChanging = Math.abs(score) <= 0.25;
  const verdict = lineVerdict(name, score);
  return {
    line,
    name,
    score,
    polarity,
    isChanging,
    verdict,
    evidence,
    closing: score >= 0 ? `${name}有顺势可借` : `${name}需慢行护住边界`,
  };
}

function lineVerdict(name: LineName, score: number): string {
  const positive: Record<LineName, string> = {
    本命: "根气尚稳，内在有承载。",
    今日: "今日气口微开，适合小步推进。",
    事业: "事功有线，先抓一个明确动作。",
    财气: "财气可守，忌贪快。",
    关系: "人缘有光，宜温和表达。",
    身心: "身心可调，节奏能稳。",
  };
  const negative: Record<LineName, string> = {
    本命: "根气偏沉，先稳住内在秩序。",
    今日: "今日噪声偏重，宜少做情绪决定。",
    事业: "事功受阻，先拆小任务。",
    财气: "财气有漏，支出与冲动需收束。",
    关系: "关系易敏感，少猜多问。",
    身心: "身心耗气，先休息再判断。",
  };
  return score >= 0 ? positive[name] : negative[name];
}

function buildChangingLineReadings(lines: LineScore[]): ChangingLineReading[] {
  const source = lines.filter((line) => line.isChanging);
  return (source.length ? source : [lines[1]]).map((line) => ({
    line: line.line,
    name: line.name,
    polarity: line.polarity,
    message: line.score >= 0 ? `${line.name}一爻可顺可逆，关键在今天是否守住节奏。` : `${line.name}一爻虽阴但可转，先减压，后推进。`,
  }));
}

function buildLongReading(context: {
  normalized: NormalizedFortuneRequest;
  lineScores: LineScore[];
  hexagram: HexagramReading;
  transformedHexagram: HexagramReading;
  fortuneLevel: ChaosFortuneOracleResponse["oracleReading"]["fortuneLevel"];
  rhythmSignals: string[];
  watch: string[];
}) {
  const { normalized, hexagram, transformedHexagram } = context;
  const overview = [
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "            卦 象 总 览",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
    `姓名：${normalized.name}`,
    `生日：${normalized.birthDate}`,
    `日期：${normalized.targetDate}`,
    normalized.question ? `所问：${normalized.question}` : "",
    `本卦：${hexagram.name}`,
    `变卦：${transformedHexagram.name}`,
    `总判：${fortuneText(context.fortuneLevel)}。`,
  ]
    .filter(Boolean)
    .join("\n");
  const hexagramVerse = [
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "              卦 辞",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
    `  ${hexagram.name}，${hexagram.meaning}`,
    `  ${normalized.name} 此日之卦，先看内在根气，再看今日节奏。`,
    `  变卦${transformedHexagram.name}，主“${transformedHexagram.meaning}”。变卦不是命定，只是提醒当日气流可能转向。`,
  ].join("\n");
  const sixLines = buildSixLinesText(context.lineScores);
  const selfCrosscheck = buildSelfCrosscheck(context.rhythmSignals);
  const observationGuide = buildObservationGuide(context.watch);
  const closing = buildClosing(hexagram);
  const fullText = [overview, hexagramVerse, sixLines, selfCrosscheck, observationGuide, closing].join("\n\n");

  return {
    summary: `${normalized.name} 得${hexagram.name}变${transformedHexagram.name}，${fortuneText(context.fortuneLevel)}。`,
    sections: { overview, hexagramVerse, sixLines, selfCrosscheck, observationGuide, closing },
    fullText,
  };
}

function buildSixLinesText(lines: LineScore[]) {
  const header = ["━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "            六 爻 详 解", "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"].join("\n");
  const bodies = lines.map((line) => {
    const mark = line.isChanging ? "△" : line.polarity === "yang" ? "✓" : "✗";
    const state = line.isChanging ? `${line.polarity === "yang" ? "阳" : "阴"}转${line.polarity === "yang" ? "阴" : "阳"}` : line.polarity === "yang" ? "阳爻" : "阴爻";
    return [
      `【${lineName(line.line)} · ${line.name}】`,
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      `  判词：${line.verdict}`,
      "",
      ...line.evidence.map((item) => `  ${item}。`),
      "",
      `  此爻为${state}，${line.closing}。${mark}`,
    ].join("\n");
  });
  return [header, ...bodies].join("\n\n");
}

function buildSelfCrosscheck(signals: string[]) {
  return [
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "            自 我 验 卦",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
    ...signals.map((item) => `  ✓ ${item}`),
    "",
    "  本卦不读取隐私资料，不做命理定论，只以姓名、生日、日期和问题生成节律象。",
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
    "  若现实压力、健康问题或重大决策已出现，请以专业帮助和现实信息为准。",
  ].join("\n");
}

function buildClosing(hexagram: HexagramReading) {
  return [
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "              封 卦",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
    `  ${hexagram.name.slice(0, 2)}入晨光，`,
    "  一念收束万事长。",
    "  卦中有象非定命，",
    "  今日先把心安放。",
    "",
    `  ${DISCLAIMER}`,
  ].join("\n");
}

function classifyFortuneLevel(lines: LineScore[]): ChaosFortuneOracleResponse["oracleReading"]["fortuneLevel"] {
  const total = lines.reduce((sum, line) => sum + line.score, 0);
  if (total >= 2.1) return "bright";
  if (total >= 0.65) return "steady";
  if (total <= -2.1) return "heavy";
  if (total <= -0.65) return "blocked";
  return "mixed";
}

function buildRhythmSignals(input: NormalizedFortuneRequest, lines: LineScore[]) {
  return [
    `以 ${input.birthDate} 与 ${input.targetDate} 组合成当日节律。`,
    `六爻中阳爻 ${lines.filter((line) => line.polarity === "yang").length} 个，阴爻 ${lines.filter((line) => line.polarity === "yin").length} 个。`,
    `动爻 ${lines.filter((line) => line.isChanging).map((line) => line.name).join("、") || "未显"}。`,
  ];
}

function buildWatchList(lines: LineScore[], level: ChaosFortuneOracleResponse["oracleReading"]["fortuneLevel"]) {
  const watch = [
    "今天先处理一件最小但明确的事，不要同时开太多线。",
    "情绪强烈时先延迟回复，等身体安静后再判断。",
    "关系问题少靠猜测，多用一句清楚的话确认。",
  ];
  if (level === "blocked" || level === "heavy") watch.push("运势偏沉时，先降低任务密度，避免硬冲。");
  if (lines.some((line) => line.name === "财气" && line.score < 0)) watch.push("财气爻偏阴时，减少冲动消费和高风险决定。");
  if (lines.some((line) => line.name === "身心" && line.score < 0)) watch.push("身心爻偏阴时，睡眠、饮水和散步比强行复盘更重要。");
  return Array.from(new Set(watch)).slice(0, 6);
}

function selectHexagram(seed: string, offset: number): HexagramReading {
  const value = Number.parseInt(seed.slice(offset, offset + 4), 16);
  return HEXAGRAMS[value % HEXAGRAMS.length];
}

function buildSeed(input: NormalizedFortuneRequest): string {
  return hashText([input.name, input.birthDate, input.targetDate, input.question].join("::"));
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

function fortuneText(level: ChaosFortuneOracleResponse["oracleReading"]["fortuneLevel"]) {
  const texts = {
    bright: "今日气象明亮，适合主动推进",
    steady: "今日节奏平稳，适合稳中求进",
    mixed: "今日吉凶相半，适合边走边验",
    blocked: "今日阻力偏多，适合先收后放",
    heavy: "今日气压较重，适合降噪养神",
  };
  return texts[level];
}

function lineName(line: number) {
  return ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"][line - 1] ?? `${line}爻`;
}

function cleanText(value: unknown): string {
  return String(value ?? "").trim();
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function validateChaosFortuneOracleRequest(body: unknown): string | null {
  if (!body || typeof body !== "object") return "请求体必须是 JSON 对象";
  const value = body as Partial<ChaosFortuneOracleRequest>;
  if (!cleanText(value.name)) return "name 不能为空";
  if (!cleanText(value.birthDate)) return "birthDate 不能为空";
  if (cleanText(value.name).length > 60) return "name 过长";
  if (!isValidDate(cleanText(value.birthDate))) return "birthDate 格式必须是 YYYY-MM-DD";
  if (value.targetDate !== undefined && !isValidDate(cleanText(value.targetDate))) {
    return "targetDate 格式必须是 YYYY-MM-DD";
  }
  if (cleanText(value.question).length > 500) return "question 过长";
  if (value.mode !== undefined && value.mode !== "quick_omen" && value.mode !== "full_ritual") {
    return "mode 只能是 quick_omen 或 full_ritual";
  }
  return null;
}

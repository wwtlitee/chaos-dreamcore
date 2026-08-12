import { Solar } from "lunar-javascript";

export interface MeihuaInput {
  question: string;
  category?: string;
  currentState?: string;
  targetDate?: string;
  targetTime?: string;
  seedNumber?: number;
}

type Element = "木" | "火" | "土" | "金" | "水";

interface Trigram {
  number: number;
  name: string;
  nature: string;
  element: Element;
  lines: [number, number, number];
}

const TRIGRAMS: Trigram[] = [
  { number: 1, name: "乾", nature: "天", element: "金", lines: [1, 1, 1] },
  { number: 2, name: "兑", nature: "泽", element: "金", lines: [1, 1, 0] },
  { number: 3, name: "离", nature: "火", element: "火", lines: [1, 0, 1] },
  { number: 4, name: "震", nature: "雷", element: "木", lines: [1, 0, 0] },
  { number: 5, name: "巽", nature: "风", element: "木", lines: [0, 1, 1] },
  { number: 6, name: "坎", nature: "水", element: "水", lines: [0, 1, 0] },
  { number: 7, name: "艮", nature: "山", element: "土", lines: [0, 0, 1] },
  { number: 8, name: "坤", nature: "地", element: "土", lines: [0, 0, 0] },
];

const HEXAGRAM_NAMES = [
  ["乾为天", "天泽履", "天火同人", "天雷无妄", "天风姤", "天水讼", "天山遁", "天地否"],
  ["泽天夬", "兑为泽", "泽火革", "泽雷随", "泽风大过", "泽水困", "泽山咸", "泽地萃"],
  ["火天大有", "火泽睽", "离为火", "火雷噬嗑", "火风鼎", "火水未济", "火山旅", "火地晋"],
  ["雷天大壮", "雷泽归妹", "雷火丰", "震为雷", "雷风恒", "雷水解", "雷山小过", "雷地豫"],
  ["风天小畜", "风泽中孚", "风火家人", "风雷益", "巽为风", "风水涣", "风山渐", "风地观"],
  ["水天需", "水泽节", "水火既济", "水雷屯", "水风井", "坎为水", "水山蹇", "水地比"],
  ["山天大畜", "山泽损", "山火贲", "山雷颐", "山风蛊", "山水蒙", "艮为山", "山地剥"],
  ["地天泰", "地泽临", "地火明夷", "地雷复", "地风升", "地水师", "地山谦", "坤为地"],
] as const;

const BRANCH_NUMBERS: Record<string, number> = {
  子: 1, 丑: 2, 寅: 3, 卯: 4, 辰: 5, 巳: 6,
  午: 7, 未: 8, 申: 9, 酉: 10, 戌: 11, 亥: 12,
};

export interface MeihuaResult {
  method: "梅花易数·年月日时起卦";
  anchors: {
    solarDate: string;
    time: string;
    lunarMonth: number;
    lunarDay: number;
    yearBranch: string;
    yearBranchNumber: number;
    hourBranchNumber: number;
    seedNumber?: number;
  };
  primary: HexagramResult;
  mutual: HexagramResult;
  changed: HexagramResult;
  movingLine: number;
  bodyUse: {
    body: Trigram;
    use: Trigram;
    relation: "体生用" | "用生体" | "体克用" | "用克体" | "比和";
  };
  tendency: "favorable" | "conditional" | "unfavorable";
  directAnswer: string;
}

interface HexagramResult {
  name: string;
  upper: Trigram;
  lower: Trigram;
  lines: number[];
}

export function deriveMeihuaHexagram(input: MeihuaInput): MeihuaResult {
  const date = parseDate(input.targetDate);
  const time = parseTime(input.targetTime);
  const lunar = Solar.fromYmdHms(date.year, date.month, date.day, time.hour, time.minute, 0).getLunar();
  const yearBranch = lunar.getYearZhi();
  const yearBranchNumber = BRANCH_NUMBERS[yearBranch] ?? 1;
  const lunarMonth = Math.abs(lunar.getMonth());
  const lunarDay = lunar.getDay();
  const hourBranchNumber = (Math.floor((time.hour + 1) / 2) % 12) + 1;
  const seed = Number.isFinite(input.seedNumber) ? Math.abs(Math.trunc(input.seedNumber as number)) : 0;
  const upperNumber = normalize(yearBranchNumber + lunarMonth + lunarDay, 8);
  const lowerNumber = normalize(yearBranchNumber + lunarMonth + lunarDay + hourBranchNumber + seed, 8);
  const movingLine = normalize(yearBranchNumber + lunarMonth + lunarDay + hourBranchNumber + seed, 6);
  const primary = makeHexagram(trigram(upperNumber), trigram(lowerNumber));
  const mutual = mutualHexagram(primary.lines);
  const changedLines = [...primary.lines];
  changedLines[movingLine - 1] = changedLines[movingLine - 1] ? 0 : 1;
  const changed = fromLines(changedLines);
  const body = movingLine <= 3 ? primary.upper : primary.lower;
  const use = movingLine <= 3 ? primary.lower : primary.upper;
  const relation = elementRelation(body.element, use.element);
  const tendency = relation === "用生体" || relation === "体克用"
    ? "favorable"
    : relation === "用克体"
      ? "unfavorable"
      : "conditional";

  return {
    method: "梅花易数·年月日时起卦",
    anchors: {
      solarDate: date.value,
      time: time.value,
      lunarMonth,
      lunarDay,
      yearBranch,
      yearBranchNumber,
      hourBranchNumber,
      ...(seed ? { seedNumber: seed } : {}),
    },
    primary,
    mutual,
    changed,
    movingLine,
    bodyUse: { body, use, relation },
    tendency,
    directAnswer: answerFor(input.question, tendency, relation),
  };
}

function answerFor(question: string, tendency: MeihuaResult["tendency"], relation: MeihuaResult["bodyUse"]["relation"]) {
  const subject = String(question || "这件事").trim();
  if (tendency === "favorable") {
    return `可以推进“${subject}”，但先做一次小范围确认。${relation}，说明当前条件总体能被你利用，不需要靠冒进换进度。`;
  }
  if (tendency === "unfavorable") {
    return `暂缓强推“${subject}”。${relation}，外部条件目前对你形成牵制，先补条件、改时间或缩小目标更合适。`;
  }
  return `“${subject}”可以试，但不适合一次押满。${relation}，结果取决于你能否先验证关键条件，再决定是否扩大投入。`;
}

function elementRelation(body: Element, use: Element): MeihuaResult["bodyUse"]["relation"] {
  if (body === use) return "比和";
  if (generates(use, body)) return "用生体";
  if (generates(body, use)) return "体生用";
  if (controls(body, use)) return "体克用";
  return "用克体";
}

function generates(from: Element, to: Element) {
  return ({ 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" } as Record<Element, Element>)[from] === to;
}

function controls(from: Element, to: Element) {
  return ({ 木: "土", 土: "水", 水: "火", 火: "金", 金: "木" } as Record<Element, Element>)[from] === to;
}

function mutualHexagram(lines: number[]) {
  return makeHexagram(trigramFromLines(lines.slice(2, 5)), trigramFromLines(lines.slice(1, 4)));
}

function fromLines(lines: number[]) {
  return makeHexagram(trigramFromLines(lines.slice(3, 6)), trigramFromLines(lines.slice(0, 3)));
}

function makeHexagram(upper: Trigram, lower: Trigram): HexagramResult {
  return {
    name: HEXAGRAM_NAMES[upper.number - 1][lower.number - 1],
    upper,
    lower,
    lines: [...lower.lines, ...upper.lines],
  };
}

function trigram(number: number) {
  return TRIGRAMS[number - 1];
}

function trigramFromLines(lines: number[]) {
  const found = TRIGRAMS.find((item) => item.lines.every((line, index) => line === lines[index]));
  if (!found) throw new Error("无法识别卦象");
  return found;
}

function normalize(value: number, mod: number) {
  const remainder = value % mod;
  return remainder === 0 ? mod : remainder;
}

function parseDate(value?: string) {
  const normalized = value || new Date().toISOString().slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalized);
  if (!match) throw new Error("起卦日期格式必须是 YYYY-MM-DD");
  return { value: normalized, year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

function parseTime(value?: string) {
  const normalized = value || "12:00";
  const match = /^(\d{2}):(\d{2})$/.exec(normalized);
  if (!match) throw new Error("起卦时间格式必须是 HH:mm");
  return { value: normalized, hour: Number(match[1]), minute: Number(match[2]) };
}

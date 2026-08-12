import { Solar } from "lunar-javascript";
import { buildEvidenceFirstSection } from "./evidence-first-answer.ts";
import type { OracleReport, OracleReportItem } from "./oracle-report.ts";

export interface BaziFortuneInput {
  name: string;
  birthDate: string;
  birthTime?: string;
  gender?: string;
  focus?: string;
  question?: string;
  targetDate?: string;
}

type Element = "木" | "火" | "土" | "金" | "水";

const ELEMENT_OF: Record<string, Element> = {
  甲: "木", 乙: "木", 寅: "木", 卯: "木",
  丙: "火", 丁: "火", 巳: "火", 午: "火",
  戊: "土", 己: "土", 辰: "土", 戌: "土", 丑: "土", 未: "土",
  庚: "金", 辛: "金", 申: "金", 酉: "金",
  壬: "水", 癸: "水", 子: "水", 亥: "水",
};

const GENERATES: Record<Element, Element> = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };
const CONTROLS: Record<Element, Element> = { 木: "土", 土: "水", 水: "火", 火: "金", 金: "木" };

export function buildBaziFortuneReport(input: BaziFortuneInput): OracleReport {
  const name = clean(input.name) || "访客";
  const birth = parseDate(input.birthDate, "生日");
  const target = parseDate(input.targetDate || new Date().toISOString().slice(0, 10), "测算日期");
  if (birth.value > target.value) throw new Error("生日不能晚于测算日期");
  const hasBirthTime = /^\d{2}:\d{2}$/.test(clean(input.birthTime));
  const birthTime = hasBirthTime ? parseTime(input.birthTime as string) : { hour: 12, minute: 0, value: "未提供" };
  const birthEightChar = Solar
    .fromYmdHms(birth.year, birth.month, birth.day, birthTime.hour, birthTime.minute, 0)
    .getLunar()
    .getEightChar();
  const targetEightChar = Solar
    .fromYmdHms(target.year, target.month, target.day, 12, 0, 0)
    .getLunar()
    .getEightChar();
  const pillars = {
    year: birthEightChar.getYear(),
    month: birthEightChar.getMonth(),
    day: birthEightChar.getDay(),
    time: hasBirthTime ? birthEightChar.getTime() : "未提供",
  };
  const dayMaster = birthEightChar.getDayGan();
  const dayMasterElement = ELEMENT_OF[dayMaster];
  const targetDay = targetEightChar.getDay();
  const targetElement = ELEMENT_OF[targetDay[0]];
  const counts = countElements([pillars.year, pillars.month, pillars.day, ...(hasBirthTime ? [pillars.time] : [])].join(""));
  const relation = dailyRelation(dayMasterElement, targetElement);
  const strength = strengthLabel(dayMasterElement, counts);
  const score = fortuneScore(relation, strength);
  const question = clean(input.question) || `${target.value}${clean(input.focus) || "综合"}运势如何？`;
  const focus = clean(input.focus) || "综合";
  const conclusion = directConclusion(question, score, relation);
  const focusGuide = guideFor(focus, score);
  const missing = hasBirthTime
    ? "未校正出生地真太阳时，时柱以填写的北京时间计算。"
    : "未填写出生时间，本次只使用年、月、日三柱，时柱相关判断不成立。";

  return {
    module: "fortune",
    title: `${name} · ${target.value} 运势`,
    subtitle: `年柱 ${pillars.year} · 月柱 ${pillars.month} · 日柱 ${pillars.day} · 时柱 ${pillars.time}`,
    verdict: conclusion,
    metrics: [
      { label: "日主", value: `${dayMaster}${dayMasterElement}`, tone: "accent" },
      { label: "当日干支", value: targetDay },
      { label: "五行状态", value: strength },
      { label: "命盘完整度", value: hasBirthTime ? "四柱完整" : "三柱·缺时柱", tone: hasBirthTime ? "positive" : "warning" },
    ],
    sections: [
      buildEvidenceFirstSection({
        question,
        answer: conclusion,
        reasons: [
          `你的日主为${dayMaster}${dayMasterElement}，命盘中${dayMasterElement}的强弱判断为“${strength}”`,
          `${target.value}日柱为${targetDay}，当日主气与日主形成“${relation}”`,
          `本次重点领域为${focus}`,
        ],
        action: focusGuide.action,
        avoid: focusGuide.avoid,
        uncertainty: missing,
      }),
      {
        id: "pillars",
        eyebrow: "02 / FOUR PILLARS",
        title: "四柱排盘",
        kind: "data",
        items: [
          pillarItem("年柱", pillars.year, "早期环境、家族与外部背景"),
          pillarItem("月柱", pillars.month, "当前社会角色、工作方式与主要节令"),
          pillarItem("日柱", pillars.day, `日干${dayMaster}为日主，是本次判断的中心`),
          pillarItem("时柱", pillars.time, hasBirthTime ? "行动落点、晚间节奏与后续倾向" : "未填写出生时间，不生成时柱解释"),
        ],
      },
      {
        id: "elements",
        eyebrow: "03 / FIVE ELEMENTS",
        title: "五行分布与日主强弱",
        kind: "data",
        summary: `木 ${counts.木} · 火 ${counts.火} · 土 ${counts.土} · 金 ${counts.金} · 水 ${counts.水}`,
        items: (Object.entries(counts) as Array<[Element, number]>).map(([element, count]) => ({
          title: `${element}元素`,
          verdict: `${count} 个显性字`,
          paragraphs: [elementMeaning(element, count)],
        })),
      },
      {
        id: "daily",
        eyebrow: "04 / DAILY RELATION",
        title: "命盘与当日关系",
        kind: "text",
        paragraphs: [
          `${target.value}的日柱是${targetDay}，主气属${targetElement}；你的日主${dayMaster}属${dayMasterElement}，两者形成${relation}。这里计算的是当天对你行动方式的影响，不是对整个人生下结论。`,
          relationExplanation(relation, focus),
        ],
      },
      {
        id: "focus",
        eyebrow: "05 / FOCUS",
        title: `${focus}领域怎么做`,
        kind: "data",
        items: [
          { title: "今天可做", verdict: focusGuide.action, paragraphs: [focusGuide.why] },
          { title: "今天少做", verdict: focusGuide.avoid, paragraphs: ["如果必须处理，先缩小范围、留下书面确认，并设置停止条件。"] },
          { title: "检查信号", verdict: focusGuide.signal, paragraphs: ["信号没有出现前，不要因为一时情绪把公式结果当成必然事件。"] },
        ],
      },
      {
        id: "uncertainty",
        eyebrow: "06 / BOUNDARY",
        title: "缺失项与判断边界",
        kind: "list",
        bullets: [
          missing,
          "未使用出生地点校正真太阳时，临近时辰交界的人可能出现时柱差异。",
          "日运只观察一天的干支关系；重大决定仍应以现实信息、合同、健康状况和专业意见为准。",
        ],
      },
    ],
    disclaimer: "本报告按传统四柱与五行关系生成，仅供文化娱乐与自我观察，不构成医疗、法律、投资或人生决策建议。",
    generatedAt: `${target.value}T12:00:00+08:00`,
  };
}

function pillarItem(title: string, value: string, meaning: string): OracleReportItem {
  return { title, verdict: value, paragraphs: [meaning] };
}

function countElements(chars: string) {
  const counts: Record<Element, number> = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  for (const char of chars) {
    const element = ELEMENT_OF[char];
    if (element) counts[element] += 1;
  }
  return counts;
}

function dailyRelation(self: Element, daily: Element) {
  if (self === daily) return "比和助身";
  if (GENERATES[daily] === self) return "当日生身";
  if (CONTROLS[self] === daily) return "日主克财";
  if (GENERATES[self] === daily) return "日主泄秀";
  return "当日克身";
}

function strengthLabel(self: Element, counts: Record<Element, number>) {
  const support = counts[self] + counts[generatorOf(self)];
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  if (support >= Math.ceil(total * 0.55)) return "偏强";
  if (support <= Math.floor(total * 0.25)) return "偏弱";
  return "相对平衡";
}

function generatorOf(element: Element) {
  return (Object.entries(GENERATES).find(([, target]) => target === element)?.[0] || element) as Element;
}

function fortuneScore(relation: string, strength: string) {
  const base = ({ 比和助身: 2, 当日生身: 2, 日主克财: 1, 日主泄秀: 0, 当日克身: -2 } as Record<string, number>)[relation] ?? 0;
  return base + (strength === "相对平衡" ? 1 : strength === "偏弱" && relation === "当日克身" ? -1 : 0);
}

function directConclusion(question: string, score: number, relation: string) {
  if (score >= 2) return `可以主动处理“${question}”。${relation}对行动有支持，但先把目标和边界说清楚，再推进关键一步。`;
  if (score <= -2) return `今天不宜强推“${question}”。${relation}会放大压力和误判，先准备材料、确认对方状态，再换时间处理。`;
  return `“${question}”可以谈、可以试，但不宜当场押定结果。${relation}带来的机会和消耗同时存在，先用一次沟通换取信息。`;
}

function guideFor(focus: string, score: number) {
  const positive = score >= 1;
  const guides: Record<string, { action: string; avoid: string; signal: string; why: string }> = {
    事业: {
      action: positive ? "带着明确方案主动沟通一次" : "先补齐方案、数字和职责边界",
      avoid: "空口承诺、越级施压或同时启动多个新任务",
      signal: "对方给出明确时间、资源或下一步负责人",
      why: "事业问题看执行条件，不以情绪上的积极代替真实授权。",
    },
    财运: {
      action: positive ? "核对现金流并处理确定性较高的小事项" : "先控制支出并核对风险敞口",
      avoid: "追涨、冲动消费或替别人承担不清楚的成本",
      signal: "金额、期限和退出条件都能被写清楚",
      why: "财运判断优先保护本金和现金流，不把短期波动解释为必然机会。",
    },
    感情: {
      action: positive ? "把真实需求说清楚，并给对方回应空间" : "先平复情绪，再讨论一件具体问题",
      avoid: "试探、翻旧账或要求对方立即表态",
      signal: "双方能复述彼此关心的问题，而不是只争对错",
      why: "感情领域的有效推进来自清楚表达和可观察回应。",
    },
  };
  return guides[focus] || {
    action: positive ? "完成一件可验证的小事" : "先处理最明确的阻力",
    avoid: "在信息不足时做不可撤回的决定",
    signal: "出现明确反馈，而不是只有主观感觉",
    why: "综合运势只用来安排行动顺序，不能替代现实判断。",
  };
}

function relationExplanation(relation: string, focus: string) {
  return ({
    比和助身: `同类之气增加主观能量，适合${focus}领域的小步主动，但也要防止只听支持意见。`,
    当日生身: `当日能量补充日主，较容易获得信息或协助；把帮助落实成时间、人员和下一步。`,
    日主克财: `你需要主动调配资源才能得到结果，机会存在，但过程会消耗精力。`,
    日主泄秀: `表达与输出增多，适合展示、沟通和交付；不适合把所有精力都消耗在解释上。`,
    当日克身: `外部要求对日主形成压力，先降低任务密度并保留修改空间。`,
  } as Record<string, string>)[relation];
}

function elementMeaning(element: Element, count: number) {
  const topic = ({ 木: "计划与生长", 火: "表达与行动", 土: "承载与稳定", 金: "规则与决断", 水: "信息与适应" } as Record<Element, string>)[element];
  if (count === 0) return `显性八字中未出现${element}，涉及${topic}时需要通过现实习惯补足，不能直接断为缺失能力。`;
  if (count >= 3) return `${element}较集中，${topic}是容易被放大的主题；优势明显时也要防止过量。`;
  return `${element}有${count}处，${topic}在命盘中有可用基础，但仍需结合当天关系。`;
}

function parseDate(value: string, label: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(clean(value));
  if (!match) throw new Error(`${label}格式必须是 YYYY-MM-DD`);
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) throw new Error(`${label}无效`);
  return { value, year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

function parseTime(value: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(clean(value));
  if (!match || Number(match[1]) > 23 || Number(match[2]) > 59) throw new Error("出生时间格式必须是 HH:mm");
  return { value, hour: Number(match[1]), minute: Number(match[2]) };
}

function clean(value: unknown) {
  return String(value ?? "").trim();
}

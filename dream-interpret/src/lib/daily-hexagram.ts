import type { OracleReport, OracleReportItem } from "./oracle-report.ts";

export interface DailyHexagramInput {
  question: string;
  category: string;
  currentState?: string;
  targetDate?: string;
  seedNumber?: number;
}

const HEXAGRAMS = [
  ["乾为天", "刚健开局，主动性强，但越是顺手越要避免用力过度。"],
  ["坤为地", "承载与整理先于推进，先把人、事、资源放回正确位置。"],
  ["水雷屯", "起步不顺不等于方向错误，今天的重点是拆小第一步。"],
  ["山水蒙", "信息尚未齐全，宜多问、多看，暂缓以猜测代替事实。"],
  ["水天需", "时机正在形成，等待不是停滞，而是补齐条件。"],
  ["天水讼", "立场容易对撞，先明确边界再讨论输赢。"],
  ["地水师", "协作和纪律决定结果，单点逞强难以持久。"],
  ["水地比", "关系正在靠拢，可信度要靠一致行动确认。"],
  ["风天小畜", "力量已聚但尚未贯通，适合小范围试行。"],
  ["天泽履", "处在敏感位置，按规则推进比追求速度更重要。"],
  ["地天泰", "上下气脉渐通，适合修复、协作和稳步落地。"],
  ["天地否", "沟通链路受阻，先停止无效消耗，再找新的接口。"],
  ["天火同人", "共同目标能化解分歧，适合主动寻找盟友。"],
  ["火天大有", "资源与注意力汇聚，盛势中更要留下余量。"],
  ["地山谦", "低姿态不等于退缩，克制反而能换来实际空间。"],
  ["雷地豫", "情绪与期待走在事实前面，兴奋可以用，承诺要慢。"],
] as const;

const LINE_NAMES = ["初爻 · 起意", "二爻 · 条件", "三爻 · 阻力", "四爻 · 外援", "五爻 · 主位", "上爻 · 收束"];

export function buildDailyHexagramReport(input: DailyHexagramInput): OracleReport {
  const question = clean(input.question);
  if (!question) throw new Error("请先写下今天最想问的一件事");
  const date = clean(input.targetDate) || new Date().toISOString().slice(0, 10);
  const category = clean(input.category) || "综合";
  const currentState = clean(input.currentState) || "尚未说明";
  const seed = hash(`${date}|${category}|${currentState}|${question}|${input.seedNumber ?? ""}`);
  const primary = HEXAGRAMS[seed % HEXAGRAMS.length];
  const changed = HEXAGRAMS[(seed >>> 5) % HEXAGRAMS.length];
  const lines = buildLines(seed, question, category, currentState);
  const positive = lines.filter((line) => line.verdict?.includes("可")).length;
  const tendency = positive >= 4 ? "顺势可行" : positive >= 2 ? "先整后动" : "暂缓强推";

  return {
    module: "hexagram",
    title: `${date} · 每日一卦`,
    subtitle: `${primary[0]} → ${changed[0]}`,
    verdict: `${tendency}。本卦强调“${primary[1]}”变卦提示“${changed[1]}”`,
    metrics: [
      { label: "本卦", value: primary[0], tone: "accent" },
      { label: "变卦", value: changed[0] },
      { label: "主题", value: category },
      { label: "总势", value: tendency, tone: positive >= 4 ? "positive" : "warning" },
    ],
    sections: [
      {
        id: "overview",
        eyebrow: "01 / OVERVIEW",
        title: "今日总览",
        kind: "text",
        paragraphs: [
          `你问的是“${question}”。结合${date}的日期节律、${category}主题和“${currentState}”这一现实位置，本卦落在${primary[0]}。它不是替你决定结果，而是在提醒：${primary[1]}`,
          `变卦为${changed[0]}，说明事情并非停在当前状态。接下来真正改变局面的，不是情绪上更用力，而是把模糊问题改写成一个能验证的动作。${changed[1]}`,
        ],
      },
      {
        id: "question",
        eyebrow: "02 / QUESTION",
        title: "问题拆解",
        kind: "data",
        items: [
          { title: "所问主题", verdict: category, paragraphs: [`当前关注：${question}`] },
          { title: "现实位置", verdict: currentState, paragraphs: ["先承认已有条件，再判断缺口，避免把愿望误当成进度。"] },
          { title: "起卦锚点", verdict: input.seedNumber ? `数字 ${input.seedNumber}` : "日期自动起卦", paragraphs: ["同一输入在同一天保持同一结果，便于复盘而非反复刷新求好卦。"] },
        ],
      },
      {
        id: "lines",
        eyebrow: "03 / SIX LINES",
        title: "六爻详解",
        kind: "lines",
        items: lines,
      },
      {
        id: "interpretation",
        eyebrow: "04 / INTERPRETATION",
        title: "本卦与变卦",
        kind: "text",
        paragraphs: [
          `${primary[0]}描述的是事情此刻的底层结构：${primary[1]}它回答的不是“会不会自动成功”，而是你当前最应该使用哪一种力量。把注意力放回可控条件，卦象才有现实意义。`,
          `${changed[0]}描述下一阶段可能出现的转向：${changed[1]}如果今天获得的新信息与原判断相反，应允许方案随事实变化，不要为了证明第一次判断正确而继续投入。`,
          `两卦合看，${tendency}并不意味着完全前进或完全后退。更合理的做法是设置一个小检查点：完成一次沟通、提交一个版本、确认一个关键数字，然后根据反馈决定下一步。`,
        ],
      },
      {
        id: "timing",
        eyebrow: "05 / TIMING",
        title: "今日节奏",
        kind: "list",
        bullets: [
          "上午：先收集关键事实，把必须确认的人、数据和截止时间列清楚。",
          "午后：适合完成一次小范围沟通或低成本试探，不急着做最终承诺。",
          "傍晚：检查真实反馈与原判断是否一致；若不一致，优先修改方案而不是解释自己。",
          "夜间：停止追加新变量，记录今天出现的信号，为下一次行动留下清晰起点。",
        ],
      },
      {
        id: "action",
        eyebrow: "06 / ACTION",
        title: "宜与忌",
        kind: "data",
        items: [
          { title: "今日宜", verdict: "确认、拆分、试行", paragraphs: ["把大问题压缩成二十四小时内能完成的一步，用实际反馈代替想象。"] },
          { title: "今日忌", verdict: "催促、赌气、过度承诺", paragraphs: ["当信息不足时，速度只会放大误差；给自己保留撤回和修正的余地。"] },
          { title: "关键动作", verdict: "完成一次可验证推进", paragraphs: [`围绕“${question}”选择一个完成后能明确判断有效或无效的动作。`] },
        ],
      },
      {
        id: "closing",
        eyebrow: "07 / CLOSING",
        title: "封卦",
        kind: "closing",
        paragraphs: [
          `${primary[0]}不是命令，${changed[0]}也不是保证。卦象只把你此刻最容易忽略的结构放大：先看条件，再借势行动。`,
          "一念落地才成路，六爻有象不代行。今日只求一步真，不求万事皆如意。",
        ],
      },
    ],
    disclaimer: "本结果仅供传统文化娱乐与行动反思，不构成医疗、法律、投资或其他专业建议。",
    generatedAt: `${date}T00:00:00.000Z`,
  };
}

function buildLines(seed: number, question: string, category: string, currentState: string): OracleReportItem[] {
  return LINE_NAMES.map((title, index) => {
    const score = ((seed >>> (index * 4)) & 15) - 7;
    const favorable = score >= 0;
    const focus = [
      "最初动机是否真实，决定你能否在遇到阻力时继续。",
      "资源、时间与相关人的意愿，是今天必须核实的三项条件。",
      "真正的阻力多半来自信息错位或一次没有说清的预期。",
      "外部帮助存在，但需要用明确请求而不是等待别人猜到。",
      "你拥有主要决定权，也必须承担选择之后的边界与成本。",
      "事情最后会回到节奏管理：何时继续、何时停止、何时复盘。",
    ][index];
    return {
      title,
      verdict: favorable ? "阳爻 · 可小步推进" : "阴爻 · 先查缺口",
      paragraphs: [
        `${focus}针对“${question}”，这一爻建议${favorable ? "保留主动，但先用小规模行动取得证据" : "暂时降低动作强度，把没有把握的部分逐项确认"}。`,
        `在${category}主题和“${currentState}”的位置上，${favorable ? "顺势不等于冒进，越接近机会越要守住承诺边界" : "停一下不是失败，而是避免把当前的不确定性扩大成后续成本"}。`,
      ],
      evidence: [`爻位数值：${score >= 0 ? "+" : ""}${score}`, `关注问题：${question.slice(0, 48)}`],
    };
  });
}

function hash(value: string) {
  let result = 2166136261;
  for (const char of value) {
    result ^= char.codePointAt(0) ?? 0;
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function clean(value: unknown) {
  return String(value ?? "").trim();
}

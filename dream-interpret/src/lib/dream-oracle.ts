import type { OracleReport } from "./oracle-report.ts";

export interface DreamOracleInput {
  dream: string;
  emotion?: string;
  recurrence?: string;
  wakeFeeling?: string;
}

const SYMBOLS = [
  { terms: ["水", "海", "河", "深水"], name: "水域", traditional: "水常被用来比喻流动、财富与未知变化。", psychological: "它更适合被理解为情绪深度、失控感或需要被容纳的感受。" },
  { terms: ["旧城", "房子", "家", "学校"], name: "旧空间", traditional: "旧地重现，多与过去的人事、未结之缘和熟悉秩序有关。", psychological: "熟悉场景常是记忆网络的舞台，提示近期事件触发了旧经验。" },
  { terms: ["故人", "亲人", "朋友", "陌生人"], name: "人物", traditional: "梦中人物常被视作关系回声或一段未说完的话。", psychological: "人物可能代表真实关系，也可能承载你自身某种被忽略的部分。" },
  { terms: ["坠落", "追赶", "逃跑", "迷路"], name: "失控行动", traditional: "受追、坠落或迷途，常被解释为气势不稳、心神未定。", psychological: "这类动作通常与压力、控制感下降或选择过载有关。" },
  { terms: ["飞", "天空", "高处"], name: "上升", traditional: "飞升之象常与突破、远志和脱离束缚相关。", psychological: "它可能表达自由需要，也可能是在回避眼前的具体限制。" },
  { terms: ["火", "爆炸", "太阳"], name: "火焰", traditional: "火主显化、声势与急变，旺则明，过则灼。", psychological: "火常对应强烈动力、愤怒、兴奋或必须立即处理的张力。" },
] as const;

export function buildDreamOracleReport(input: DreamOracleInput): OracleReport {
  const dream = clean(input.dream);
  if (!dream) throw new Error("请先写下梦中最清晰的画面");
  const emotion = clean(input.emotion) || "复杂";
  const recurrence = clean(input.recurrence) || "首次或不确定";
  const wakeFeeling = clean(input.wakeFeeling) || "未填写";
  const matched = SYMBOLS.filter((symbol) => symbol.terms.some((term) => dream.includes(term)));
  const symbols = matched.length ? matched : [{
    name: "核心场景",
    traditional: "梦中最突出的场景，可先看作近期生活变化留下的象征回声。",
    psychological: "没有固定词典能够替代你的个人经验，重要的是它与你近期事件的连接。",
  }];
  const intensity = recurrence.includes("反复") ? "高" : dream.length > 70 ? "中高" : "中";

  return {
    module: "dream",
    title: "梦境深层解析",
    subtitle: symbols.map((symbol) => symbol.name).join(" · "),
    verdict: `这场梦的主线不是简单的吉凶，而是“${emotion}”情绪借由${symbols.map((symbol) => symbol.name).join("、")}形成的一次内部整理。`,
    metrics: [
      { label: "主情绪", value: emotion, tone: "accent" },
      { label: "重复性", value: recurrence },
      { label: "梦境强度", value: intensity, tone: intensity === "高" ? "warning" : "neutral" },
      { label: "醒后感受", value: wakeFeeling },
    ],
    sections: [
      {
        id: "narrative",
        eyebrow: "01 / NARRATIVE",
        title: "梦境主线",
        kind: "text",
        paragraphs: [
          `你记录的梦境是：“${dream}”从叙事结构看，梦里最值得注意的不是某个孤立符号，而是场景如何推进、你在其中能否行动，以及最后有没有找到出口或得到回应。`,
          `主要情绪为“${emotion}”，醒来后是“${wakeFeeling}”。这两项比通用梦典更接近你的真实处境：梦境可能是在夜间重新编排白天没有处理完的压力、期待和关系信号。`,
        ],
      },
      {
        id: "symbols",
        eyebrow: "02 / SYMBOLS",
        title: "核心梦象",
        kind: "data",
        items: symbols.map((symbol) => ({
          title: symbol.name,
          verdict: "传统与心理双重视角",
          paragraphs: [symbol.traditional, symbol.psychological],
        })),
      },
      {
        id: "traditional",
        eyebrow: "03 / TRADITION",
        title: "传统象征解读",
        kind: "text",
        paragraphs: [
          `从传统象征角度，${symbols.map((symbol) => symbol.name).join("、")}同时出现，通常不宜只断一个“吉”或“凶”。它更像在说：旧有秩序正在松动，新变化已经出现，但你的心神还没有完全跟上。`,
          "若梦里有寻找、追赶、开门、渡水或返回等动作，应把重点放在“过程是否顺畅”。顺畅代表你正在形成新的应对方式；反复受阻则提醒现实中仍有信息、边界或关系没有处理清楚。",
        ],
      },
      {
        id: "psychology",
        eyebrow: "04 / PSYCHOLOGY",
        title: "心理与情绪脉络",
        kind: "text",
        paragraphs: [
          `这场梦可能把“${emotion}”放大成可见场景。梦不等于诊断，也不证明某件事必然发生；它更像一张情绪地图，显示哪些内容在清醒时被压后、拖延或反复考虑。`,
          `${recurrence.includes("反复") ? "同类梦反复出现，说明相同主题仍在被激活。可以比较每次梦里的出口、人物态度和你的行动能力是否变化，而不是反复追问同一个符号的固定含义。" : "如果这是偶发梦境，可以先观察未来三天是否有类似情绪或场景触发，不必立刻把它解释成预兆。"}`
        ],
      },
      {
        id: "reality",
        eyebrow: "05 / REALITY",
        title: "现实映射",
        kind: "list",
        bullets: [
          "最近是否有一件事让你觉得信息很多，却始终找不到明确出口？",
          "梦中最重要的人物，与你现实中的关系、责任或期待有什么相似处？",
          "你在梦里是主动行动、被动等待，还是不断回到同一个位置？这可能对应你现实中的应对方式。",
          "醒后最强烈的身体感受是什么？疲惫、紧绷或轻松，都比套用固定吉凶更值得记录。",
        ],
      },
      {
        id: "action",
        eyebrow: "06 / ACTION",
        title: "三步整理法",
        kind: "data",
        items: [
          { title: "记录", verdict: "保留原始细节", paragraphs: ["先写下地点、人物、动作、颜色和结尾，不急着解释，让梦的结构完整留下。"] },
          { title: "连接", verdict: "寻找近期触发", paragraphs: ["回看过去三天的事件，找出与主情绪相似的时刻，区分真实压力和想象延伸。"] },
          { title: "落地", verdict: "处理一个小问题", paragraphs: ["选择一件能在今天确认、沟通或完成的小事，给梦中未完成的情绪一个现实出口。"] },
        ],
      },
      {
        id: "closing",
        eyebrow: "07 / CLOSING",
        title: "结语",
        kind: "closing",
        paragraphs: [
          "梦境不是命令，也不是未来通知。它值得被认真聆听，但不值得被恐惧支配。",
          "若梦境长期频繁影响睡眠、情绪或日常功能，优先寻求可信赖的医疗或心理专业支持，而不是继续增加玄学解释。",
        ],
      },
    ],
    disclaimer: "本报告仅供文化娱乐、自我观察与梦境记录，不构成医疗或心理诊断。",
    generatedAt: new Date().toISOString(),
  };
}

function clean(value: unknown) {
  return String(value ?? "").trim();
}

import { buildEvidenceFirstSection } from "./evidence-first-answer.ts";
import { deriveMeihuaHexagram, type MeihuaInput } from "./meihua-oracle.ts";
import type { OracleReport, OracleReportItem } from "./oracle-report.ts";

export interface DailyHexagramInput extends MeihuaInput {
  category: string;
}

const LINE_NAMES = ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"];

export function buildDailyHexagramReport(input: DailyHexagramInput): OracleReport {
  const question = clean(input.question);
  if (!question) throw new Error("请先写下今天最想问的一件事");
  const category = clean(input.category) || "综合";
  const currentState = clean(input.currentState) || "尚未说明";
  const result = deriveMeihuaHexagram({ ...input, question, category, currentState });
  const favorable = result.tendency === "favorable";
  const unfavorable = result.tendency === "unfavorable";
  const action = favorable
    ? actionFor(category, "advance")
    : unfavorable
      ? actionFor(category, "pause")
      : actionFor(category, "test");
  const avoid = unfavorable ? "不要在条件不清时继续加码或逼迫对方表态。" : "不要跳过验证步骤，也不要把卦象当成结果保证。";
  const lines = result.primary.lines.map((yang, index): OracleReportItem => ({
    title: `${LINE_NAMES[index]} · ${index + 1 === result.movingLine ? "动爻" : yang ? "阳爻" : "阴爻"}`,
    verdict: lineVerdict(index, yang, result.movingLine),
    paragraphs: [lineAdvice(index, question, currentState, index + 1 === result.movingLine)],
    evidence: [`本卦第 ${index + 1} 爻：${yang ? "阳" : "阴"}`, ...(index + 1 === result.movingLine ? ["此爻发动并改变阴阳"] : [])],
  }));

  return {
    module: "hexagram",
    title: `${result.anchors.solarDate} · 每日一卦`,
    subtitle: `${result.primary.name} → ${result.changed.name}`,
    verdict: result.directAnswer,
    metrics: [
      { label: "本卦", value: result.primary.name, tone: "accent" },
      { label: "互卦", value: result.mutual.name },
      { label: "变卦", value: result.changed.name },
      { label: "体用关系", value: result.bodyUse.relation, tone: unfavorable ? "warning" : favorable ? "positive" : "neutral" },
    ],
    sections: [
      buildEvidenceFirstSection({
        question,
        answer: result.directAnswer,
        reasons: [
          `本卦${result.primary.name}，互卦${result.mutual.name}，${result.movingLine}爻动后变为${result.changed.name}`,
          `体卦为${result.bodyUse.body.name}${result.bodyUse.body.element}，用卦为${result.bodyUse.use.name}${result.bodyUse.use.element}，关系是${result.bodyUse.relation}`,
          `你填写的现实状态是“${currentState}”`,
        ],
        action,
        avoid,
        uncertainty: "梅花易数只按填写的日期、时辰和心念数计算；现实条件变化后，应以新事实为准。",
      }),
      {
        id: "calculation",
        eyebrow: "02 / CALCULATION",
        title: "这卦怎么算出来的",
        kind: "data",
        items: [
          {
            title: "起卦锚点",
            verdict: `${result.anchors.solarDate} ${result.anchors.time}`,
            paragraphs: [`农历月数 ${result.anchors.lunarMonth}、日数 ${result.anchors.lunarDay}、年支${result.anchors.yearBranch}取数 ${result.anchors.yearBranchNumber}、时支取数 ${result.anchors.hourBranchNumber}${result.anchors.seedNumber ? `、心念数 ${result.anchors.seedNumber}` : ""}。`],
          },
          { title: "上下卦", verdict: `上${result.primary.upper.name}下${result.primary.lower.name}`, paragraphs: [`上卦属${result.primary.upper.element}，下卦属${result.primary.lower.element}，组合为${result.primary.name}。`] },
          { title: "动爻", verdict: `第 ${result.movingLine} 爻`, paragraphs: [`第${result.movingLine}爻阴阳翻转，形成${result.changed.name}。`] },
          { title: "体用", verdict: `${result.bodyUse.body.name}为体，${result.bodyUse.use.name}为用`, paragraphs: [`体代表问卦者与自身条件，用代表所问之事与外部条件，二者为${result.bodyUse.relation}。`] },
        ],
      },
      {
        id: "structure",
        eyebrow: "03 / STRUCTURE",
        title: "本卦、互卦与变卦",
        kind: "data",
        items: [
          { title: "本卦", verdict: result.primary.name, paragraphs: [`回答事情现在的结构：上${result.primary.upper.name}${result.primary.upper.nature}、下${result.primary.lower.name}${result.primary.lower.nature}。`] },
          { title: "互卦", verdict: result.mutual.name, paragraphs: ["由本卦二三四爻和三四五爻组成，用来观察事情中段真正起作用的过程。"] },
          { title: "变卦", verdict: result.changed.name, paragraphs: [`第${result.movingLine}爻变化后的走向；它描述条件改变后的趋势，不是保证。`] },
        ],
      },
      {
        id: "interpretation",
        eyebrow: "04 / INTERPRETATION",
        title: "卦象为什么这样回答",
        kind: "text",
        paragraphs: [
          `你问“${question}”，当前状态是“${currentState}”。本卦${result.primary.name}只描述事情此刻的结构：上卦${result.primary.upper.name}属${result.primary.upper.element}，下卦${result.primary.lower.name}属${result.primary.lower.element}。这里不会只凭卦名判断吉凶，而是继续看动爻所在位置以及体用五行的生克关系。`,
          `第${result.movingLine}爻发动，说明问题最可能在六个阶段中的第${result.movingLine}阶段发生变化。动爻翻转后形成${result.changed.name}，表示当这个关键条件被改变时，事情会从${result.primary.name}的结构转向${result.changed.name}。因此，变卦回答的是“条件变化后怎样”，不是保证某个结果一定发生。`,
          `本次以${result.bodyUse.body.name}卦为体，代表问卦者和自身可控条件；以${result.bodyUse.use.name}卦为用，代表“${question}”涉及的外部对象和环境。体属${result.bodyUse.body.element}、用属${result.bodyUse.use.element}，两者形成${result.bodyUse.relation}，所以直接结论是：${result.directAnswer}`,
          `互卦${result.mutual.name}由本卦中间四爻重新组合，用来检查事情的发展过程。它不能单独推翻体用结论，但能提醒你不要只看开始和最终结果。对${category}问题而言，真正可验证的信号仍然是：相关人是否给出明确回应、资源是否落实、时间和责任是否能写清楚。`,
          `因此今天的行动不是“相信卦就去做”，而是把卦象转成一个现实检查：${action}如果执行后出现的新事实与卦象相反，应立即以事实修正判断，不继续为原结论寻找解释。`,
        ],
      },
      {
        id: "lines",
        eyebrow: "05 / SIX LINES",
        title: "六爻对应你的问题",
        kind: "lines",
        items: lines,
      },
      {
        id: "action",
        eyebrow: "06 / ACTION",
        title: "今天怎么做",
        kind: "data",
        items: [
          { title: "先做", verdict: action, paragraphs: [`只围绕“${question}”推进一个能得到明确反馈的动作。`] },
          { title: "不要做", verdict: avoid, paragraphs: ["卦象与现实信号冲突时，现实信号优先。"] },
          { title: "复盘点", verdict: "得到一次明确回应后再决定下一步", paragraphs: [`当前状态为“${currentState}”，先看回应是否改变这一状态。`] },
        ],
      },
      {
        id: "boundary",
        eyebrow: "07 / BOUNDARY",
        title: "判断边界",
        kind: "list",
        bullets: [
          "同一日期、时辰和心念数会得到同一卦，不通过反复刷新挑选结果。",
          "一次只问一件事；问题、对象或时间范围改变，应重新起卦。",
          "涉及医疗、法律、投资和安全的决定，必须以专业信息为准。",
        ],
      },
    ],
    disclaimer: "本结果按梅花易数年月日时起卦规则生成，仅供传统文化娱乐与行动反思。",
    generatedAt: `${result.anchors.solarDate}T${result.anchors.time}:00+08:00`,
  };
}

function actionFor(category: string, mode: "advance" | "pause" | "test") {
  const object = ({ 事业: "方案、负责人和截止时间", 感情: "真实需求和对方回应", 财运: "金额、期限和退出条件", 学业: "任务量和完成节点", 人际: "边界和具体请求", 身心: "作息、症状和可执行调整" } as Record<string, string>)[category] || "目标、条件和下一步";
  if (mode === "advance") return `明确${object}后，主动推进一次。`;
  if (mode === "pause") return `先补齐${object}，今天只准备，不强推。`;
  return `围绕${object}做一次低成本试探，再根据反馈决定。`;
}

function lineVerdict(index: number, yang: number, movingLine: number) {
  const phase = ["动机", "条件", "阻力", "外部回应", "决定权", "结果边界"][index];
  return `${phase}：${index + 1 === movingLine ? "这里是本卦变化的关键" : yang ? "主动条件较强" : "需要补充或等待"}`;
}

function lineAdvice(index: number, question: string, currentState: string, moving: boolean) {
  const advice = [
    "先确认你真正想得到的结果，不要把焦虑误当成目标。",
    "检查时间、资源和相关人的意愿，缺一项就先补一项。",
    "把最可能失败的环节提前说清楚，避免推进后才发现前提不同。",
    "观察对方是否给出具体回应；没有回应不等于默认同意。",
    "到了需要决定的位置，只承诺自己能控制和承担的部分。",
    "设置停止条件和复盘时间，结果不符就及时收束。",
  ][index];
  return `针对“${question}”，${advice}你现在处于“${currentState}”${moving ? "，而这一爻发动，说明这里最容易改变后续走向。" : "。"}`;
}

function clean(value: unknown) {
  return String(value ?? "").trim();
}

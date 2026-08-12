import { buildEvidenceFirstSection } from "./evidence-first-answer.ts";
import type { OracleReport, OracleReportItem } from "./oracle-report.ts";

export interface DreamOracleInput {
  dream: string;
  emotion?: string;
  recurrence?: string;
  wakeFeeling?: string;
  ending?: string;
  recentContext?: string;
}

interface DreamRule {
  name: string;
  terms: string[];
  type: "scene" | "action" | "person" | "outcome";
  meaning: string;
  question: string;
}

const RULES: DreamRule[] = [
  { name: "浑水", terms: ["浑水", "脏水", "泥水", "污水"], type: "scene", meaning: "信息混乱、边界不清，或身处一个难以看清后果的环境。", question: "现实中哪件事让你觉得规则、责任或对方态度不够清楚？" },
  { name: "清水", terms: ["清水", "清澈", "透明的水"], type: "scene", meaning: "情绪虽然流动，但你对问题的认识正在变清楚。", question: "最近是否有一件事终于可以被你说清楚？" },
  { name: "深水", terms: ["深水", "深海", "海底", "水下"], type: "scene", meaning: "事情超出熟悉范围，用户正在承受较深的情绪或不确定性。", question: "你现在面对的问题，哪一部分最让你觉得无法控制？" },
  { name: "旧空间", terms: ["旧城", "老房子", "旧家", "学校", "小时候"], type: "scene", meaning: "近期事件触发了过去形成的记忆、习惯或关系模式。", question: "眼前这件事和过去哪次经历最相似？" },
  { name: "追赶", terms: ["追赶", "追我", "被追", "追杀"], type: "action", meaning: "现实里有一个压力、期限或冲突正在逼近，而你暂时不想正面处理。", question: "你最近一直拖着没处理的压力是什么？" },
  { name: "寻找", terms: ["寻找", "找出口", "找不到", "迷路"], type: "action", meaning: "你正在寻找可执行方案，但目前掌握的线索或选择标准不足。", question: "你需要的究竟是更多信息，还是做决定的标准？" },
  { name: "坠落", terms: ["坠落", "掉下去", "往下掉"], type: "action", meaning: "控制感突然下降，常与失败预期、地位变化或无法刹车的进程有关。", question: "最近哪件事让你担心自己失去控制？" },
  { name: "飞行", terms: ["飞起来", "飞翔", "在天上飞"], type: "action", meaning: "自由和突破需求增强；飞行稳定时偏向掌控，失控时偏向逃离压力。", question: "你想摆脱的是限制，还是具体责任？" },
  { name: "陌生人", terms: ["陌生人", "看不清的人", "黑影"], type: "person", meaning: "压力来源尚未被明确命名，也可能代表你不熟悉的新角色或规则。", question: "现实中哪个人或要求让你无法判断其真实意图？" },
  { name: "故人", terms: ["故人", "去世", "已故", "死去的"], type: "person", meaning: "记忆和未完成的关系内容被重新激活，不等于对方在传递预言。", question: "你和这段关系之间，还有哪句话或情绪没有被安放？" },
  { name: "亲近的人", terms: ["妈妈", "父亲", "爸爸", "伴侣", "爱人", "朋友", "同事"], type: "person", meaning: "梦直接借用现实关系来表达期待、依赖、冲突或责任。", question: "梦中这个人的行为，与现实里的相处模式哪里一致？" },
  { name: "成功脱困", terms: ["逃了出来", "逃出去", "爬上岸", "找到出口", "获救", "脱困"], type: "outcome", meaning: "梦的结局已经出现解决动作，说明你并非只有压力，也在形成离开或处理问题的能力。", question: "现实中哪一个小动作最接近梦里的出口？" },
  { name: "仍被困住", terms: ["没逃掉", "被困", "出不去", "又回到", "一直循环"], type: "outcome", meaning: "同一问题仍缺少出口，或现有处理方式不断把你带回原点。", question: "目前哪种做法已经证明无效，却仍在重复？" },
];

export function buildDreamOracleReport(input: DreamOracleInput): OracleReport {
  const dream = clean(input.dream);
  if (!dream) throw new Error("请先写下梦中最清晰的画面");
  const emotion = clean(input.emotion) || "复杂";
  const recurrence = clean(input.recurrence) || "首次或不确定";
  const wakeFeeling = clean(input.wakeFeeling) || "未填写";
  const recentContext = clean(input.recentContext);
  const matches = RULES.filter((rule) => rule.terms.some((term) => dream.includes(term)));
  const selected = dedupeByType(matches);
  const ending = resolveEnding(input.ending, matches);
  const scene = selected.find((item) => item.type === "scene");
  const action = selected.find((item) => item.type === "action");
  const person = selected.find((item) => item.type === "person");
  const outcome = selected.find((item) => item.type === "outcome");
  const conclusion = buildConclusion({ emotion, recurrence, scene, action, person, outcome, ending, recentContext });
  const primaryTerms = selected.map((item) => item.name);
  const uncertainty = selected.length
    ? "解释只覆盖梦里明确出现的梦象；没有出现的细节不会补造。"
    : "梦境没有命中现有梦象词库，只能依据情绪、重复性和用户补充的现实背景判断。";

  return {
    module: "dream",
    title: "梦境组合解析",
    subtitle: primaryTerms.length ? primaryTerms.join(" · ") : "未命中固定梦象",
    verdict: conclusion,
    metrics: [
      { label: "主情绪", value: emotion, tone: "accent" },
      { label: "核心动作", value: action?.name || "未识别" },
      { label: "梦中结局", value: ending, tone: ending === "顺利脱困" ? "positive" : ending === "仍被困住" ? "warning" : "neutral" },
      { label: "重复性", value: recurrence },
    ],
    sections: [
      buildEvidenceFirstSection({
        question: "这个梦更可能在反映什么？",
        answer: conclusion,
        reasons: [
          scene ? `场景“${scene.name}”：${scene.meaning}` : "没有识别到明确场景词",
          action ? `动作“${action.name}”：${action.meaning}` : "没有识别到明确动作词",
          person ? `人物“${person.name}”：${person.meaning}` : "没有识别到明确人物关系",
          outcome ? `结局“${outcome.name}”：${outcome.meaning}` : `用户选择的结局是“${ending}”`,
          recentContext ? `你补充的现实背景是：“${recentContext}”` : "没有补充近期现实背景",
        ],
        action: outcome?.name === "成功脱困" || ending === "顺利脱困" ? "把梦里有效的脱困动作，转成现实中一个可以今天完成的小步骤。" : "先写清现实中最接近梦境压力的那件事，再找一个可验证的出口。",
        avoid: "不要把单个梦象直接断成吉凶，也不要把梦当成未来事件通知。",
        uncertainty,
      }),
      {
        id: "evidence",
        eyebrow: "02 / DREAM EVIDENCE",
        title: "梦里的哪些内容参与了判断",
        kind: "data",
        summary: `原始记录：“${dream}”`,
        items: selected.length ? selected.map(ruleItem) : [{
          title: "原始梦境",
          verdict: "未命中固定梦象",
          paragraphs: [`“${dream}”`],
          evidence: [`主情绪：${emotion}`, `醒后感受：${wakeFeeling}`],
        }],
      },
      {
        id: "combination",
        eyebrow: "03 / COMBINATION",
        title: "组合关系怎么解释",
        kind: "text",
        paragraphs: combinationParagraphs(scene, action, person, outcome, ending, emotion),
      },
      {
        id: "reality",
        eyebrow: "04 / REALITY CHECK",
        title: "和现实逐项对照",
        kind: "data",
        items: [
          { title: "近期背景", verdict: recentContext || "未填写", paragraphs: [recentContext ? "这段背景直接参与组合判断，不再只靠通用梦典。" : "补充梦前一到三天发生的事，通常比增加更多玄学词更有用。"] },
          { title: "需要回答的问题", verdict: action?.question || scene?.question || "最近什么事情带来了相同情绪？", paragraphs: ["只选择一个最贴近的问题回答，避免把梦套到所有生活领域。"] },
          { title: "结局对照", verdict: ending, paragraphs: [endingAdvice(ending)] },
        ],
      },
      {
        id: "action",
        eyebrow: "05 / ACTION",
        title: "今天可以怎么处理",
        kind: "list",
        bullets: [
          `把梦里最强的情绪“${emotion}”对应到最近一次真实出现的场景，写下当时的人、事和未说出口的话。`,
          outcome?.name === "成功脱困" || ending === "顺利脱困" ? "复用梦里的有效动作：离开混乱环境、求助、说清边界或完成一次确认。" : "不要直接解决全部问题，只找一个能减少不确定性的动作。",
          `观察未来三天是否再次出现“${primaryTerms.join("、") || "相同情绪"}”；如果重复，比较结局有没有变化。`,
          "若梦境持续影响睡眠、情绪或日常功能，优先寻求医疗或心理专业支持。",
        ],
      },
      {
        id: "boundary",
        eyebrow: "06 / BOUNDARY",
        title: "不能从这个梦得出什么",
        kind: "list",
        bullets: [
          "不能据此断定某件现实事件一定发生。",
          "不能仅凭梦中人物判断对方真实想法。",
          "不能用固定梦典替代个人经历、现实证据或专业诊断。",
        ],
      },
    ],
    disclaimer: "本报告使用梦象、动作、人物、情绪和结局组合规则，仅供文化娱乐与自我观察，不构成医疗或心理诊断。",
    generatedAt: new Date().toISOString(),
  };
}

function buildConclusion(input: {
  emotion: string;
  recurrence: string;
  scene?: DreamRule;
  action?: DreamRule;
  person?: DreamRule;
  outcome?: DreamRule;
  ending: string;
  recentContext: string;
}) {
  const parts = [input.scene?.name, input.action?.name, input.person?.name, input.outcome?.name].filter(Boolean).join("、");
  const context = input.recentContext ? `结合你提到的“${input.recentContext}”` : "在没有更多现实背景的情况下";
  if (input.outcome?.name === "成功脱困" || input.ending === "顺利脱困") {
    return `${context}，梦里的${parts || "情节"}更像在反映一段带来${input.emotion}的压力；你最终脱困，说明重点不是预示危险，而是你已经在形成离开、拒绝或解决它的办法。`;
  }
  if (input.outcome?.name === "仍被困住" || input.ending === "仍被困住") {
    return `${context}，${parts || "反复情节"}更像在反映一个尚未找到出口的现实压力。${input.recurrence.includes("反复") ? "同类梦反复出现，说明现有处理方式可能一直把你带回原点。" : "先找出梦中最受阻的动作，再对照现实里的同类阻力。"}`;
  }
  return `${context}，${parts || "梦中场景"}主要对应“${input.emotion}”带来的压力或需求。由于梦中结局不明确，目前只能判断问题主题，不能断定事情会怎样发展。`;
}

function combinationParagraphs(scene: DreamRule | undefined, action: DreamRule | undefined, person: DreamRule | undefined, outcome: DreamRule | undefined, ending: string, emotion: string) {
  return [
    scene && action
      ? `场景“${scene.name}”描述你所处的环境，动作“${action.name}”描述你如何应对。两者放在一起，判断重点是：${scene.meaning}${action.meaning}`
      : `当前只识别到${scene ? `场景“${scene.name}”` : action ? `动作“${action.name}”` : "情绪线索"}，因此不会补造另一半情节。`,
    person
      ? `人物线索是“${person.name}”。${person.meaning}人物判断必须和其在梦里的行为一起看，不能只凭身份下结论。`
      : "没有识别到明确人物关系，本次不对任何现实人物的态度和意图作推断。",
    outcome
      ? `梦中出现“${outcome.name}”。${outcome.meaning}这使结局比单个梦象更有解释力。`
      : `结局由用户选择为“${ending}”。醒后主情绪为“${emotion}”，因此报告保留不确定项，不强行判吉凶。`,
    `组合规则先看场景，再看你在场景中的动作。场景说明压力发生在哪里，动作说明你当时是靠近、逃离、寻找还是失去控制。同一个“水”字，在清水中主动游动和在浑水中被追赶，不会得到相同解释；本次报告只使用梦里实际出现的组合。`,
    `人物线索只回答关系在梦中承担了什么作用，不推测现实人物的真实想法。陌生人更接近未被命名的压力，熟人更适合对照现实互动，故人则先看记忆和未完成情绪。人物没有明确行为时，报告不会追加善意、敌意或预兆。`,
    `结局用于修正前面的判断。顺利脱困意味着梦中已经出现解决动作，仍被困住则说明原有办法没有带来出口；突然惊醒只能说明情绪强度打断了梦，不能据此判断现实结果。醒后的“${emotion}”用于确认哪条解释更接近用户体验。`,
  ];
}

function ruleItem(rule: DreamRule): OracleReportItem {
  const matchedTerm = rule.terms[0];
  return {
    title: rule.name,
    verdict: rule.meaning,
    paragraphs: [`对照问题：${rule.question}`],
    evidence: [`梦境原词命中：${matchedTerm}`],
  };
}

function dedupeByType(matches: DreamRule[]) {
  const selected: DreamRule[] = [];
  for (const rule of matches) {
    if (!selected.some((item) => item.type === rule.type)) selected.push(rule);
  }
  return selected;
}

function resolveEnding(value: unknown, matches: DreamRule[]) {
  const normalized = clean(value);
  if (normalized && normalized !== "不确定") return normalized;
  if (matches.some((item) => item.name === "成功脱困")) return "顺利脱困";
  if (matches.some((item) => item.name === "仍被困住")) return "仍被困住";
  return normalized || "不确定";
}

function endingAdvice(ending: string) {
  if (ending === "顺利脱困") return "现实处理重点是识别并复用有效动作，不需要继续把自己困在梦里的危险感中。";
  if (ending === "仍被困住") return "现实处理重点是停止重复无效做法，并引入新的信息、边界或帮助。";
  return "结局不明时只分析主题，不预测后续结果。";
}

function clean(value: unknown) {
  return String(value ?? "").trim();
}

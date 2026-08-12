import type { OracleReportSection } from "./oracle-report.ts";

export interface EvidenceFirstInput {
  question: string;
  answer: string;
  reasons: string[];
  action: string;
  avoid: string;
  uncertainty: string;
}

export function buildEvidenceFirstSection(input: EvidenceFirstInput): OracleReportSection {
  return {
    id: "directAnswer",
    eyebrow: "01 / DIRECT ANSWER",
    title: "先回答你的问题",
    kind: "data",
    summary: `你问：“${input.question}”`,
    items: [
      { title: "直接结论", verdict: input.answer, paragraphs: [input.reasons.join("；")] },
      { title: "建议做什么", verdict: input.action },
      { title: "不建议做什么", verdict: input.avoid },
      { title: "不确定项", verdict: input.uncertainty },
    ],
  };
}

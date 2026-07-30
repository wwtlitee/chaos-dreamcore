import type { OracleReport, OracleReportItem, OracleReportMetric, OracleReportSection } from "./oracle-report.ts";

export interface LongReadingAdapterInput {
  module: OracleReport["module"];
  title: string;
  subtitle: string;
  verdict: string;
  metrics: OracleReportMetric[];
  sectionTitles: Record<string, string>;
  sections: Record<string, string>;
  disclaimer: string;
  sources?: string[];
  generatedAt?: string;
}

export function adaptLongReading(input: LongReadingAdapterInput): OracleReport {
  const sections = Object.entries(input.sections).map(([id, text], index): OracleReportSection => {
    const isLines = /six|line|爻/i.test(id) || /【[^】]+爻|【[初二三四五上]爻/.test(text);
    const isClosing = /closing|封卦|结语/i.test(id);
    return {
      id,
      eyebrow: `${String(index + 1).padStart(2, "0")} / ${id.replace(/([A-Z])/g, " $1").trim().toUpperCase()}`,
      title: input.sectionTitles[id] || humanize(id),
      kind: isLines ? "lines" : isClosing ? "closing" : "text",
      ...(isLines ? { items: parseLineItems(text) } : { paragraphs: cleanParagraphs(text) }),
    };
  });

  return {
    module: input.module,
    title: input.title,
    subtitle: input.subtitle,
    verdict: input.verdict,
    metrics: input.metrics,
    sections,
    disclaimer: input.disclaimer,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    sources: input.sources,
  };
}

function parseLineItems(text: string): OracleReportItem[] {
  const matches = text.match(/【[^】]+】[\s\S]*?(?=\n\s*\n【|$)/g);
  if (!matches?.length) {
    return cleanParagraphs(text).map((paragraph, index) => ({
      title: `爻象 ${index + 1}`,
      paragraphs: [paragraph],
    }));
  }
  return matches.map((block) => {
    const lines = cleanParagraphs(block);
    const title = (lines.shift() ?? "爻象").replace(/[【】]/g, "");
    const verdictIndex = lines.findIndex((line) => /^(判词|判断|结论)[：:]/.test(line));
    const verdict = verdictIndex >= 0 ? lines.splice(verdictIndex, 1)[0].replace(/^(判词|判断|结论)[：:]\s*/, "") : undefined;
    const evidence = lines.filter((line) => /^(证据|数据|依据)[：:]/.test(line));
    const paragraphs = lines.filter((line) => !/^(证据|数据|依据)[：:]/.test(line));
    return { title, verdict, paragraphs, evidence };
  });
}

function cleanParagraphs(text: string) {
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line && !/^━+$/.test(line) && !/^[\s·—-]+$/.test(line))
    .filter((line) => !/^[\s卦象总览辞六爻详解赛事数据观察指南封]+$/.test(line));
}

function humanize(value: string) {
  return value
    .replace(/([A-Z])/g, " $1")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
}

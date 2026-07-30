export type OracleMetricTone = "neutral" | "positive" | "warning" | "accent";

export interface OracleReportMetric {
  label: string;
  value: string;
  note?: string;
  tone?: OracleMetricTone;
}

export interface OracleReportItem {
  title: string;
  verdict?: string;
  paragraphs?: string[];
  evidence?: string[];
}

export interface OracleReportSection {
  id: string;
  eyebrow?: string;
  title: string;
  kind: "text" | "lines" | "list" | "data" | "closing";
  summary?: string;
  paragraphs?: string[];
  bullets?: string[];
  items?: OracleReportItem[];
}

export interface OracleReport {
  module: "dream" | "hexagram" | "fortune" | "stock" | "token" | "worldcup";
  title: string;
  subtitle: string;
  verdict: string;
  metrics: OracleReportMetric[];
  sections: OracleReportSection[];
  disclaimer: string;
  generatedAt?: string;
  sources?: string[];
}

export function textToParagraphs(text: string): string[] {
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line && !/^━+$/.test(line) && !/^[\s·—-]+$/.test(line));
}

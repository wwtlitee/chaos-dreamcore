"use client";

import { type CSSProperties, type FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, RotateCcw, Send, Sparkles } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { StructuredOracleReport } from "@/components/oracle/structured-oracle-report";
import { getOracleFormSchema, type OracleFormField } from "@/lib/oracle-form-schema";
import { getOracleModule, type OracleKey } from "@/lib/oracle-modules";
import type { OracleReport } from "@/lib/oracle-report";
import {
  reduceOracleWorkspaceMode,
  type OracleWorkspaceMode,
} from "@/lib/oracle-workspace-state";

interface OracleWorkspaceProps {
  oracleKey: OracleKey;
}

const ENDPOINTS: Record<OracleKey, string> = {
  dream: "/api/dream",
  hexagram: "/api/free-hexagram",
  fortune: "/api/free-fortune",
  stock: "/api/free-stock",
  token: "/api/free-token",
  worldcup: "/api/free-worldcup-oracle",
};

const EXAMPLES: Record<OracleKey, Array<{ label: string; values: Record<string, string> }>> = {
  dream: [
    { label: "水下旧城", values: { dream: "我反复梦见自己在深水里的旧城寻找出口，最后听见故人的声音。", emotion: "不安", recurrence: "反复出现", wakeFeeling: "疲惫但清醒" } },
    { label: "反复坠落", values: { dream: "我从很高的地方不断坠落，每次落地前都会惊醒。", emotion: "恐惧", recurrence: "反复出现", wakeFeeling: "心跳很快" } },
  ],
  hexagram: [
    { label: "事业推进", values: { question: "今天是否适合推进新合作？", category: "事业", currentState: "正在权衡" } },
    { label: "关系节点", values: { question: "这段关系今天应该主动沟通吗？", category: "感情", currentState: "遇到阻力" } },
  ],
  fortune: [
    { label: "今日综合", values: { name: "小牛", birthDate: "1996-08-12", focus: "综合" } },
    { label: "事业节奏", values: { name: "小牛", birthDate: "1996-08-12", focus: "事业", question: "今天工作推进要注意什么？" } },
  ],
  stock: [
    { label: "AAPL", values: { stock: "AAPL", window: "1d", question: "短期趋势与风险" } },
    { label: "腾讯", values: { stock: "腾讯", window: "1w", question: "量价是否配合？" } },
  ],
  token: [
    { label: "BTC", values: { token: "BTC", chain: "自动识别", window: "24h", question: "当前热度是否透支？" } },
    { label: "ETH", values: { token: "ETH", chain: "ethereum", window: "7d", question: "中短期结构如何？" } },
  ],
  worldcup: [
    { label: "阿根廷 vs 法国", values: { homeTeam: "阿根廷", awayTeam: "法国", question: "常规时间走势如何？" } },
    { label: "巴西 vs 德国", values: { homeTeam: "巴西", awayTeam: "德国", question: "阵容与气势谁占优？" } },
  ],
};

export function OracleWorkspace({ oracleKey }: OracleWorkspaceProps) {
  const oracle = getOracleModule(oracleKey);
  const schema = getOracleFormSchema(oracleKey);
  const shellStyle = {
    "--oracle-accent": oracle.accent,
    "--oracle-accent-soft": oracle.accentSoft,
    "--oracle-accent-deep": oracle.accentDeep,
    "--oracle-hero-image": `url(${oracle.heroImage})`,
  } as CSSProperties;
  const [values, setValues] = useState<Record<string, string>>(() => initialValues(oracleKey));
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<OracleReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [workspaceMode, setWorkspaceMode] = useState<OracleWorkspaceMode>("form");
  const canSubmit = useMemo(
    () => schema.required.every((field) => values[field]?.trim()) && !isLoading,
    [isLoading, schema.required, values],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    setWorkspaceMode((current) => reduceOracleWorkspaceMode(current, "submit"));
    setIsLoading(true);
    setReport(null);
    setError(null);
    try {
      const payload = {
        ...values,
        ...(values.seedNumber ? { seedNumber: Number(values.seedNumber) } : {}),
        mode: "full_ritual",
      };
      const response = await fetch(ENDPOINTS[oracleKey], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { report?: OracleReport; error?: string };
      if (!response.ok || !data.report) throw new Error(data.error || "报告生成失败，请稍后再试。");
      setReport(data.report);
      setWorkspaceMode((current) => reduceOracleWorkspaceMode(current, "success"));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "报告生成失败，请稍后再试。");
      setWorkspaceMode((current) => reduceOracleWorkspaceMode(current, "failure"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setReport(null);
    setError(null);
    setWorkspaceMode((current) => reduceOracleWorkspaceMode(current, "retry"));
  };

  return (
    <MainLayout hideFooter>
      <div className="oracle-v3 oracle-v4" style={shellStyle} data-oracle={oracle.key}>
        <div className="oracle-v3-bg" aria-hidden="true" />
        <div className="oracle-v3-noise" aria-hidden="true" />
        <div className="oracle-v3-frame oracle-v3-frame-compact">
          <div className="oracle-v3-crumb">
            <Link href="/" className="oracle-v3-back"><ArrowLeft className="size-3.5" />首页</Link>
            <span>/</span><strong>{oracle.title}</strong>
          </div>

          <div className="oracle-v3-stage">
            <aside className="oracle-v3-portal" data-oracle={oracle.key}>
              <div className="oracle-v3-portal-art" aria-hidden="true" />
            </aside>

            <main className={`oracle-v3-console ${workspaceMode === "report" ? "is-report-mode" : ""}`}>
              {workspaceMode === "form" ? (
                <>
                  <div className="oracle-v3-console-head">
                    <div><p>{oracle.label}</p><h1>{oracle.action}</h1></div>
                    <span className="oracle-v3-chip"><Sparkles className="size-3.5" />{isLoading ? "解析中" : oracle.rune}</span>
                  </div>

                  <div className="oracle-v3-examples" aria-label="快速示例">
                    {EXAMPLES[oracleKey].map((example) => (
                      <button
                        key={example.label}
                        type="button"
                        className="oracle-v3-example"
                        onClick={() => setValues((current) => ({ ...current, ...example.values }))}
                        disabled={isLoading}
                      >
                        {example.label}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleSubmit} className="oracle-v3-form oracle-v4-form">
                    <div className="oracle-form-grid">
                      {schema.fields.map((field) => (
                        <OracleField
                          field={field}
                          value={values[field.name] || ""}
                          disabled={isLoading}
                          key={field.name}
                          onChange={(value) => setValues((current) => ({ ...current, [field.name]: value }))}
                        />
                      ))}
                    </div>
                    <div className="oracle-v3-actions">
                      <p>{schema.hint}</p>
                      <button type="submit" disabled={!canSubmit}>
                        {isLoading ? <><Loader2 className="size-4 animate-spin" />正在生成长报告</> : <><Send className="size-4" />{oracle.action}</>}
                      </button>
                    </div>
                  </form>
                </>
              ) : report ? (
                <div className="oracle-v4-report-toolbar">
                  <div>
                    <span>{oracle.label} / REPORT</span>
                    <strong>{report.title}</strong>
                  </div>
                  <button type="button" onClick={handleRetry}>
                    <RotateCcw className="size-3.5" />
                    重新测算
                  </button>
                </div>
              ) : null}

              <section className={`oracle-v3-result oracle-v4-result ${report ? "has-result" : ""}`} aria-live="polite">
                {report ? (
                  <StructuredOracleReport report={report} />
                ) : error ? (
                  <div className="oracle-v4-error"><strong>生成失败</strong><p>{error}</p></div>
                ) : (
                  <div className="oracle-v4-empty">
                    <span>{oracle.rune}</span>
                    <strong>完整报告将在这里展开</strong>
                    <p>填写上方信息后，将生成总览、细项分析、行动建议与边界说明。</p>
                  </div>
                )}
              </section>
            </main>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function OracleField({
  field,
  value,
  disabled,
  onChange,
}: {
  field: OracleFormField;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  const common = {
    id: `oracle-${field.name}`,
    name: field.name,
    value,
    disabled,
    required: field.required,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => onChange(event.target.value),
  };
  return (
    <label className={`oracle-form-field ${field.span === "full" ? "is-full" : ""}`} htmlFor={common.id}>
      <span>{field.label}{field.required ? <i>必填</i> : null}</span>
      {field.type === "textarea" ? (
        <textarea {...common} rows={3} maxLength={500} placeholder={field.placeholder} />
      ) : field.type === "select" ? (
        <select {...common}>
          {field.options?.map((option) => <option value={option} key={option}>{option}</option>)}
        </select>
      ) : (
        <input {...common} type={field.type} min={field.type === "number" ? 1 : undefined} max={field.type === "number" ? 999 : undefined} placeholder={field.placeholder} />
      )}
    </label>
  );
}

function initialValues(key: OracleKey) {
  const date = new Date().toISOString().slice(0, 10);
  const schema = getOracleFormSchema(key);
  return Object.fromEntries(schema.fields.map((field) => [
    field.name,
    field.type === "select" ? field.options?.[0] || "" : field.type === "date" ? date : "",
  ]));
}

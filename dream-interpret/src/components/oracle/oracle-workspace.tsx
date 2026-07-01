"use client";

import { type CSSProperties, type FormEvent, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Textarea } from "@/components/ui/textarea";
import { getOracleModule, type OracleKey } from "@/lib/oracle-modules";
import { Loader2, Send, Sparkles } from "lucide-react";

interface OracleWorkspaceProps {
  oracleKey: OracleKey;
}

const ritualSlots: Record<OracleKey, { label: string; value: string }[]> = {
  dream: [
    { label: "SYMBOL", value: "梦象" },
    { label: "MOOD", value: "情绪" },
    { label: "TRACE", value: "回声" },
  ],
  hexagram: [
    { label: "LINE", value: "卦线" },
    { label: "TIME", value: "时位" },
    { label: "MOVE", value: "动爻" },
  ],
  stock: [
    { label: "TICKER", value: "代码" },
    { label: "TREND", value: "趋势" },
    { label: "RISK", value: "风险" },
  ],
  fortune: [
    { label: "DAY", value: "今日" },
    { label: "THEME", value: "主题" },
    { label: "FLOW", value: "流向" },
  ],
  token: [
    { label: "CHAIN", value: "链域" },
    { label: "HEAT", value: "热度" },
    { label: "RISK", value: "风险" },
  ],
  worldcup: [
    { label: "MATCH", value: "对阵" },
    { label: "FORM", value: "状态" },
    { label: "UPSET", value: "冷门" },
  ],
};

function buildLocalReading(key: OracleKey, input: string) {
  const seed = input.trim().length;
  const tones = ["收束", "转折", "蓄势", "显化"];
  const focus = ["先稳住节奏", "先处理关系", "先减少噪音", "先做小决定"];
  const index = seed % tones.length;

  const titleMap: Record<OracleKey, string> = {
    dream: "梦核",
    hexagram: "卦象",
    stock: "股票卦",
    fortune: "运势",
    token: "币卦",
    worldcup: "赛事卦",
  };

  return `${titleMap[key]}：${tones[index]}\n\n主线：${focus[index]}。\n提示：把问题缩小到一个动作。`;
}

function buildPaidBoundaryMessage(key: OracleKey, input: string) {
  const normalizedInput = input.trim();

  if (key === "stock") {
    return [
      "混沌梦核-股票：服务准备中",
      "",
      "股票卦象将作为独立 OKX.AI A2MCP / x402 付费服务发布；当前等待 OKX.AI 审核通过后更新公开跳转入口。",
      `已记录输入：${normalizedInput}`,
      "计划能力：股票代码识别、行情趋势验卦、波动风险与娱乐观察提示。",
      "边界声明：输出仅供娱乐与研究，不构成投资建议。",
    ].join("\n");
  }

  if (key === "fortune") {
    return [
      "混沌梦核-运势：服务准备中",
      "",
      "个人运势卦象将作为独立 OKX.AI A2MCP / x402 付费服务发布；当前等待 OKX.AI 审核通过后更新公开跳转入口。",
      `已记录输入：${normalizedInput}`,
      "计划能力：每日运势、关系/事业主题、节奏提醒与娱乐观察提示。",
      "边界声明：输出仅供娱乐与自我观察，不构成医疗、心理咨询、法律或投资建议。",
    ].join("\n");
  }

  if (key === "token") {
    return [
      "混沌梦核-币：付费调用入口",
      "",
      "完整链上数据验卦报告需通过 OKX.AI A2MCP / x402 付费调用生成；当前等待 OKX.AI 审核通过后更新公开跳转入口。",
      `已记录输入：${normalizedInput}`,
      "API Endpoint：/api/chaos-token-oracle",
      "请求方式：POST JSON，必填 token，可选 chain、symbol、window、metrics。",
      "边界声明：输出仅供娱乐与研究，不构成投资建议。",
    ].join("\n");
  }

  if (key === "worldcup") {
    return [
      "混沌梦核-世界杯：服务准备中",
      "",
      "世界杯赛事卦象将作为独立 OKX.AI A2MCP / x402 付费服务发布；当前等待 OKX.AI 审核通过后更新公开跳转入口。",
      `已记录输入：${normalizedInput}`,
      "计划能力：赛事卦象、热度验卦、冷门风险与娱乐观察提示。",
      "边界声明：输出仅供娱乐与研究，不构成投注、投资或确定性预测建议。",
    ].join("\n");
  }

  return null;
}

export function OracleWorkspace({ oracleKey }: OracleWorkspaceProps) {
  const oracle = getOracleModule(oracleKey);
  const heroArtStyle = {
    "--oracle-hero-image": `url(${oracle.heroImage})`,
  } as CSSProperties;
  const shellStyle = {
    "--oracle-accent": oracle.accent,
    "--oracle-accent-soft": oracle.accentSoft,
    "--oracle-accent-deep": oracle.accentDeep,
  } as CSSProperties;
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const canSubmit = input.trim().length > 0 && !isLoading;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    setIsLoading(true);
    setResult(null);

    try {
      if (oracle.key === "dream") {
        const response = await fetch("/api/dream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ dream: input }),
        });

        if (!response.ok) {
          throw new Error("解析失败");
        }

        const data = await response.json();
        setResult(data.interpretation);
        return;
      }

      const paidBoundaryMessage = buildPaidBoundaryMessage(oracle.key, input);
      if (paidBoundaryMessage) {
        setResult(paidBoundaryMessage);
        return;
      }

      setResult(buildLocalReading(oracle.key, input));
    } catch (error) {
      console.error("解析错误:", error);
      setResult("解析失败，请稍后再试。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout hideFooter>
      <div className="chaos-shell dream-workbench-shell" style={shellStyle}>
        <div className="dream-starfield" aria-hidden="true" />
        <div className="star-grid" aria-hidden="true" />

        <section className="oracle-page-shell px-4 py-6 md:py-10">
          <div className="oracle-stage-grid mx-auto grid max-w-7xl gap-8 lg:grid-cols-[34rem_minmax(0,1fr)]">
            <aside
              className="oracle-page-hero oracle-page-hero-art-only"
              data-oracle={oracle.key}
            >
              <div className="oracle-hero-art-shell" style={heroArtStyle} aria-hidden="true" />
              <h1 className="sr-only">{oracle.title}</h1>
            </aside>

            <main className="oracle-input-panel oracle-single-panel">
              <div className="oracle-panel-head">
                <div>
                  <p className="eyebrow">{oracle.label}</p>
                  <h2>{oracle.action}</h2>
                  <p className="oracle-panel-subtitle">{oracle.statusText}</p>
                </div>
                <div className="status-chip">
                  <span />
                  ONLINE
                </div>
              </div>

              <form onSubmit={handleSubmit} className="dream-form">
                <label htmlFor={`${oracle.key}-input`} className="dream-label">
                  输入
                  <span>{input.length} 字符</span>
                </label>
                <div className="textarea-shell">
                  <Textarea
                    id={`${oracle.key}-input`}
                    placeholder={oracle.placeholder}
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    className="dream-textarea oracle-main-textarea"
                    disabled={isLoading}
                  />
                </div>

                <div className="oracle-ritual-slots" aria-hidden="true">
                  {ritualSlots[oracle.key].map((slot, index) => (
                    <div key={slot.label} className="oracle-ritual-slot">
                      <span>0{index + 1}</span>
                      <strong>{slot.value}</strong>
                      <i>{slot.label}</i>
                    </div>
                  ))}
                </div>

                <div className="dream-action-row">
                  <p>CORE READY / {oracle.rune}</p>
                  <button type="submit" className="magnet-button star-border" disabled={!canSubmit}>
                    {isLoading ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        解析中
                      </>
                    ) : (
                      <>
                        <Send className="size-4" />
                        {oracle.action}
                      </>
                    )}
                  </button>
                </div>
              </form>

              {result && (
                <section className="inline-result-panel">
                  <div className="flex items-center gap-2 text-white">
                    <Sparkles className="size-4 text-amber-200" />
                    <span>结果</span>
                  </div>
                  <div className="dream-result-body">{result}</div>
                </section>
              )}
            </main>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}

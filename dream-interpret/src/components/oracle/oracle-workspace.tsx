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
  tarot: [
    { label: "CARD", value: "牌面" },
    { label: "SPREAD", value: "牌阵" },
    { label: "SIGN", value: "启示" },
  ],
  astro: [
    { label: "HOUSE", value: "宫位" },
    { label: "ASPECT", value: "相位" },
    { label: "TRANSIT", value: "行运" },
  ],
  palm: [
    { label: "LINE", value: "掌纹" },
    { label: "SHAPE", value: "手型" },
    { label: "MARK", value: "纹记" },
  ],
  face: [
    { label: "BONE", value: "骨相" },
    { label: "QI", value: "气色" },
    { label: "SPIRIT", value: "神态" },
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
    tarot: "牌阵",
    astro: "星象",
    palm: "手相",
    face: "面相",
  };

  return `${titleMap[key]}：${tones[index]}\n\n主线：${focus[index]}。\n提示：把问题缩小到一个动作。`;
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

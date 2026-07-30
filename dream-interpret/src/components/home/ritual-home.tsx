"use client";

import { type CSSProperties, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CircleDot, Sparkles } from "lucide-react";
import { HOME_WORDMARK_ASSET } from "@/lib/home-branding";
import { oracleModules, type OracleModule } from "@/lib/oracle-modules";

const ritualMarks = ["乾", "坤", "坎", "离", "震", "巽", "艮", "兑"];

function oracleStyle(oracle: OracleModule) {
  return {
    "--oracle-accent": oracle.accent,
    "--oracle-accent-soft": oracle.accentSoft,
    "--oracle-accent-deep": oracle.accentDeep,
  } as CSSProperties;
}

export function RitualHome() {
  const [activeKey, setActiveKey] = useState(oracleModules[0].key);
  const activeOracle =
    oracleModules.find((oracle) => oracle.key === activeKey) ?? oracleModules[0];
  const ActiveIcon = activeOracle.icon;

  return (
    <div className="chaos-shell home-one-screen">
      <div className="aurora-field" aria-hidden="true" />
      <div className="star-grid" aria-hidden="true" />
      <div className="hexagram-rain" aria-hidden="true">
        {ritualMarks.map((mark) => (
          <span key={mark}>{mark}</span>
        ))}
      </div>

      <section className="ritual-hero-section home-ritual-stage relative overflow-hidden px-4">
        <div className="mx-auto grid h-full max-w-7xl items-center gap-8 lg:grid-cols-[1fr_1.02fr]">
          <div className="home-entry-copy">
            <div className="reveal-up inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-4 py-2 font-mono text-xs uppercase tracking-[0.24em] text-white/70">
              <CircleDot className="size-3 text-orange-300" />
              Chaos Dream Core
            </div>

            <h1 className="sr-only">混沌梦核</h1>
            <div className="home-wordmark-wrap reveal-up delay-100">
              <Image
                src={HOME_WORDMARK_ASSET}
                alt="混沌梦核"
                width={1015}
                height={953}
                priority
                className="home-wordmark"
              />
            </div>

            <div className="home-entry-caption reveal-up delay-200">
              <span>SELECT RITUAL</span>
              <i>六域入口已校准</i>
            </div>

            <div className="home-rune-grid reveal-up delay-200">
              {oracleModules.map((oracle) => {
                const Icon = oracle.icon;
                const isActive = oracle.key === activeOracle.key;

                return (
                  <Link
                    key={oracle.key}
                    href={oracle.href}
                    className="home-rune-card"
                    data-active={isActive}
                    data-oracle={oracle.key}
                    style={oracleStyle(oracle)}
                    onMouseEnter={() => setActiveKey(oracle.key)}
                    onFocus={() => setActiveKey(oracle.key)}
                  >
                    <span className="rune-card-icon">
                      <Icon className="size-5" />
                    </span>
                    <span className="rune-card-main">{oracle.shortTitle}</span>
                    <span className="rune-card-meta">
                      <strong>{oracle.label}</strong>
                      <i>{oracle.title}</i>
                    </span>
                    <ArrowUpRight className="rune-card-arrow size-4" />
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="reveal-up delay-200">
            <div
              className="home-status-card"
              data-active-oracle={activeOracle.key}
              style={oracleStyle(activeOracle)}
            >
              <div className="status-card-header">
                <span>{activeOracle.label}</span>
                <i>{activeOracle.statusText}</i>
              </div>

              <div className="status-dial" aria-hidden="true">
                <div className="status-ring status-ring-a" />
                <div className="status-ring status-ring-b" />
                <div className="status-ring status-ring-c" />
                <div className="status-ray ray-one" />
                <div className="status-ray ray-two" />
                <div className="status-ray ray-three" />
                {ritualMarks.map((mark, index) => (
                  <span key={mark} className={`status-mark status-mark-${index + 1}`}>
                    {mark}
                  </span>
                ))}
                <div className="status-core">
                  <ActiveIcon className="size-8" />
                  <strong>{activeOracle.rune}</strong>
                </div>
              </div>

              <div className="status-card-footer">
                <div>
                  <span>ACTIVE PORTAL</span>
                  <strong>{activeOracle.title}</strong>
                </div>
                <Sparkles className="size-5" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

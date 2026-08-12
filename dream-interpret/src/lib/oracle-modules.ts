import {
  CalendarDays,
  Coins,
  MoonStar,
  Sparkles,
  TrendingUp,
  Trophy,
  type LucideIcon,
} from "lucide-react";

export type OracleKey = "dream" | "hexagram" | "fortune" | "stock" | "token" | "worldcup";

export interface OracleModule {
  key: OracleKey;
  title: string;
  rune: string;
  shortTitle: string;
  label: string;
  href: string;
  action: string;
  placeholder: string;
  backgroundImage: string;
  heroImage: string;
  icon: LucideIcon;
  accent: string;
  accentSoft: string;
  accentDeep: string;
  statusText: string;
}

export const allOracleModules: OracleModule[] = [
  {
    key: "dream",
    title: "梦境",
    rune: "梦",
    shortTitle: "梦",
    label: "DREAM",
    href: "/dream",
    action: "解析梦境",
    placeholder: "一句话写下最清晰的梦中画面或情绪...",
    backgroundImage: "/images/chaos/oracle-hero/dream.png",
    // 使用带黑底的完整原图，避免 transparent/clean 抠图毁笔触
    heroImage: "/images/chaos/oracle-hero/dream-portrait-v2.png",
    icon: MoonStar,
    accent: "#8b5cf6",
    accentSoft: "#67e8f9",
    accentDeep: "#22164f",
    statusText: "紫蓝梦域",
  },
  {
    key: "hexagram",
    title: "每日一卦",
    rune: "卦",
    shortTitle: "卦",
    label: "HEXAGRAM",
    href: "/hexagram",
    action: "起卦",
    placeholder: "写下今天最想问的一件事...",
    backgroundImage: "/images/chaos/oracle-hero/hexagram.png",
    heroImage: "/images/chaos/oracle-hero/hexagram.png",
    icon: CalendarDays,
    accent: "#f4c96b",
    accentSoft: "#fff1a8",
    accentDeep: "#3a2508",
    statusText: "金线卦域",
  },
  {
    key: "fortune",
    title: "运势",
    rune: "运",
    shortTitle: "运",
    label: "FORTUNE",
    href: "/fortune",
    action: "测今日运势",
    placeholder: "例：今日事业 / 感情节奏",
    backgroundImage: "/images/chaos/oracle-hero/astro.png",
    heroImage: "/images/chaos/feature-logos/chaos-fortune-oracle-logo-v1.png",
    icon: Sparkles,
    accent: "#22d3ee",
    accentSoft: "#c084fc",
    accentDeep: "#0d3346",
    statusText: "运势仪域",
  },
  {
    key: "stock",
    title: "股票",
    rune: "股",
    shortTitle: "股",
    label: "STOCK",
    href: "/stock",
    action: "股票验卦",
    placeholder: "例：AAPL / 00700 / 宁德时代",
    backgroundImage: "/images/chaos/feature-banners/chaos-stock-oracle-banner-v1.png",
    heroImage: "/images/chaos/feature-logos/chaos-stock-oracle-logo-v1.png",
    icon: TrendingUp,
    accent: "#38bdf8",
    accentSoft: "#f4c96b",
    accentDeep: "#0b2438",
    statusText: "行情股域",
  },
  {
    key: "token",
    title: "币卦",
    rune: "币",
    shortTitle: "币",
    label: "TOKEN",
    href: "/token",
    action: "代币验卦",
    placeholder: "例：BTC / ETH / 合约地址",
    backgroundImage: "/images/chaos/feature-banners/chaos-token-oracle-banner-v1.png",
    heroImage: "/images/chaos/feature-logos/chaos-token-oracle-logo-v1.png",
    icon: Coins,
    accent: "#f59e0b",
    accentSoft: "#fde68a",
    accentDeep: "#3b2408",
    statusText: "链上币域",
  },
  {
    key: "worldcup",
    title: "世界杯",
    rune: "杯",
    shortTitle: "杯",
    label: "WORLD CUP",
    href: "/worldcup",
    action: "赛事验卦",
    placeholder: "例：阿根廷 vs 法国",
    backgroundImage: "/images/chaos/feature-banners/chaos-worldcup-oracle-banner-v1.png",
    heroImage: "/images/chaos/feature-logos/chaos-worldcup-oracle-logo-v1.png",
    icon: Trophy,
    accent: "#22c55e",
    accentSoft: "#facc15",
    accentDeep: "#0d2f1d",
    statusText: "赛事杯域",
  },
];

export const oracleModules = allOracleModules.filter((module) => module.key !== "worldcup");

export function getOracleModule(key: OracleKey) {
  return allOracleModules.find((module) => module.key === key) ?? allOracleModules[0];
}

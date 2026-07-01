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

export const oracleModules: OracleModule[] = [
  {
    key: "dream",
    title: "梦境",
    rune: "梦",
    shortTitle: "梦",
    label: "DREAM",
    href: "/dream",
    action: "解析梦境",
    placeholder: "写下梦里的画面、人物、情绪或反复出现的东西...",
    backgroundImage: "/images/chaos/oracle-hero/dream.png",
    heroImage: "/images/chaos/oracle-logos-clean/dream.png",
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
    heroImage: "/images/chaos/oracle-logos-clean/hexagram.png",
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
    action: "等待 OKX.AI 审核",
    placeholder: "输入出生信息、今日主题或关注方向，等待 OKX.AI 审核通过后更新完整服务...",
    backgroundImage: "/images/chaos/oracle-hero/astro.png",
    heroImage: "/images/chaos/feature-logos/chaos-fortune-oracle-logo-transparent-v1.png",
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
    action: "等待 OKX.AI 审核",
    placeholder: "输入股票代码或市场名称，等待 OKX.AI 审核通过后更新完整服务...",
    backgroundImage: "/images/chaos/feature-banners/chaos-stock-oracle-banner-v1.png",
    heroImage: "/images/chaos/feature-logos/chaos-stock-oracle-logo-transparent-v1.png",
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
    action: "等待 OKX.AI 审核",
    placeholder: "输入代币 CA，等待 OKX.AI 审核通过后更新完整服务...",
    backgroundImage: "/images/chaos/feature-banners/chaos-token-oracle-banner-v1.png",
    heroImage: "/images/chaos/feature-logos/chaos-token-oracle-logo-transparent-v1.png",
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
    action: "等待 OKX.AI 审核",
    placeholder: "输入比赛双方，等待 OKX.AI 审核通过后更新完整服务...",
    backgroundImage: "/images/chaos/feature-banners/chaos-worldcup-oracle-banner-v1.png",
    heroImage: "/images/chaos/feature-logos/chaos-worldcup-oracle-logo-transparent-v1.png",
    icon: Trophy,
    accent: "#22c55e",
    accentSoft: "#facc15",
    accentDeep: "#0d2f1d",
    statusText: "赛事杯域",
  },
];

export function getOracleModule(key: OracleKey) {
  return oracleModules.find((module) => module.key === key) ?? oracleModules[0];
}

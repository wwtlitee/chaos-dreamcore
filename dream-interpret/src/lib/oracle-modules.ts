import {
  CalendarDays,
  Hand,
  MoonStar,
  ScanFace,
  WalletCards,
  ZodiacGemini,
  type LucideIcon,
} from "lucide-react";

export type OracleKey = "dream" | "hexagram" | "tarot" | "astro" | "palm" | "face";

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
    key: "tarot",
    title: "塔罗",
    rune: "塔",
    shortTitle: "塔",
    label: "TAROT",
    href: "/tarot",
    action: "抽牌",
    placeholder: "写下一个问题，或直接输入当前状态...",
    backgroundImage: "/images/chaos/oracle-hero/tarot.png",
    heroImage: "/images/chaos/oracle-logos-clean/tarot.png",
    icon: WalletCards,
    accent: "#a855f7",
    accentSoft: "#f0c36a",
    accentDeep: "#28123f",
    statusText: "紫金牌域",
  },
  {
    key: "astro",
    title: "星象",
    rune: "星",
    shortTitle: "星",
    label: "ASTRO",
    href: "/astro",
    action: "解析星象",
    placeholder: "输入生日、时间、地点，或写下想看的关系/事业主题...",
    backgroundImage: "/images/chaos/oracle-hero/astro.png",
    heroImage: "/images/chaos/oracle-logos-clean/astro.png",
    icon: ZodiacGemini,
    accent: "#22d3ee",
    accentSoft: "#c084fc",
    accentDeep: "#0d3346",
    statusText: "青紫星域",
  },
  {
    key: "palm",
    title: "手相",
    rune: "手",
    shortTitle: "手",
    label: "PALM",
    href: "/palm",
    action: "看手相",
    placeholder: "描述手型、掌纹，或先记录你关注的方向...",
    backgroundImage: "/images/chaos/oracle-hero/palm.png",
    heroImage: "/images/chaos/oracle-logos-clean/palm.png",
    icon: Hand,
    accent: "#cbd5e1",
    accentSoft: "#67e8f9",
    accentDeep: "#172935",
    statusText: "银青掌域",
  },
  {
    key: "face",
    title: "面相",
    rune: "面",
    shortTitle: "面",
    label: "FACE",
    href: "/face",
    action: "看面相",
    placeholder: "描述面部特征、气色，或输入想观察的主题...",
    backgroundImage: "/images/chaos/oracle-hero/face.png",
    heroImage: "/images/chaos/oracle-logos-clean/face.png",
    icon: ScanFace,
    accent: "#e2e8f0",
    accentSoft: "#5eead4",
    accentDeep: "#142b2f",
    statusText: "银青相域",
  },
];

export function getOracleModule(key: OracleKey) {
  return oracleModules.find((module) => module.key === key) ?? oracleModules[0];
}

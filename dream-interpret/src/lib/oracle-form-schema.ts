export type FreeOracleKey = "dream" | "hexagram" | "fortune" | "stock" | "token" | "worldcup";
export type OracleFieldType = "text" | "textarea" | "date" | "time" | "select" | "number";

export interface OracleFormField {
  name: string;
  label: string;
  type: OracleFieldType;
  placeholder?: string;
  options?: string[];
  required?: boolean;
  span?: "full" | "half";
}

export interface OracleFormSchema {
  required: string[];
  hint: string;
  fields: OracleFormField[];
}

const SCHEMAS: Record<FreeOracleKey, OracleFormSchema> = {
  dream: {
    required: ["dream"],
    hint: "写清场景、人物、动作和醒来感受，解析会更具体。",
    fields: [
      { name: "dream", label: "梦境描述", type: "textarea", placeholder: "写下最清晰的梦中画面、人物和结尾…", required: true, span: "full" },
      { name: "emotion", label: "梦中主情绪", type: "select", options: ["不安", "恐惧", "悲伤", "愤怒", "轻松", "喜悦", "好奇", "复杂"], span: "half" },
      { name: "recurrence", label: "是否重复", type: "select", options: ["首次或不确定", "偶尔出现", "反复出现"], span: "half" },
      { name: "wakeFeeling", label: "醒来后的感受", type: "text", placeholder: "例：疲惫但清醒", span: "full" },
    ],
  },
  hexagram: {
    required: ["question"],
    hint: "一次只问一件事；日期相同且输入相同，卦象保持一致。",
    fields: [
      { name: "question", label: "今日所问", type: "textarea", placeholder: "例：今天是否适合推进新合作？", required: true, span: "full" },
      { name: "category", label: "问题领域", type: "select", options: ["综合", "事业", "感情", "财运", "学业", "人际", "身心"], span: "half" },
      { name: "currentState", label: "当前状态", type: "select", options: ["尚未开始", "正在权衡", "已经推进", "遇到阻力", "等待结果"], span: "half" },
      { name: "targetDate", label: "起卦日期", type: "date", span: "half" },
      { name: "seedNumber", label: "心念数字（可选）", type: "number", placeholder: "1–999", span: "half" },
    ],
  },
  fortune: {
    required: ["name", "birthDate"],
    hint: "昵称即可；年龄、星座和生肖由生日自动计算，避免重复填写冲突。",
    fields: [
      { name: "name", label: "昵称", type: "text", placeholder: "不必填写真实姓名", required: true, span: "half" },
      { name: "birthDate", label: "生日", type: "date", required: true, span: "half" },
      { name: "birthTime", label: "出生时间（可选）", type: "time", span: "half" },
      { name: "gender", label: "性别（可选）", type: "select", options: ["不透露", "女", "男", "其他"], span: "half" },
      { name: "focus", label: "重点运势", type: "select", options: ["综合", "事业", "财运", "感情", "人际", "身心"], span: "half" },
      { name: "targetDate", label: "测算日期", type: "date", span: "half" },
      { name: "question", label: "特别想问（可选）", type: "textarea", placeholder: "例：今天与同事沟通需要注意什么？", span: "full" },
    ],
  },
  stock: {
    required: ["stock"],
    hint: "自动匹配公开行情；找不到实时数据时会明确标注，不编造价格。",
    fields: [
      { name: "stock", label: "股票名称或代码", type: "text", placeholder: "例：AAPL / 腾讯 / 600519", required: true, span: "full" },
      { name: "window", label: "观察周期", type: "select", options: ["1d", "5d", "1w", "1m"], span: "half" },
      { name: "question", label: "关注问题（可选）", type: "text", placeholder: "例：短期趋势与风险", span: "half" },
    ],
  },
  token: {
    required: ["token"],
    hint: "支持代币名称、符号或合约地址；链可自动识别。",
    fields: [
      { name: "token", label: "代币 / 符号 / CA", type: "text", placeholder: "例：BTC / ETH / 合约地址", required: true, span: "full" },
      { name: "chain", label: "链（可选）", type: "select", options: ["自动识别", "ethereum", "solana", "base", "bsc", "x-layer"], span: "half" },
      { name: "window", label: "观察周期", type: "select", options: ["24h", "7d", "30d"], span: "half" },
      { name: "question", label: "关注问题（可选）", type: "text", placeholder: "例：热度是否透支？", span: "full" },
    ],
  },
  worldcup: {
    required: ["homeTeam", "awayTeam"],
    hint: "输入国家队全名、英文名或三字母缩写，系统会抓取公开赛事数据。",
    fields: [
      { name: "homeTeam", label: "主队 / 问卦方", type: "text", placeholder: "例：阿根廷", required: true, span: "half" },
      { name: "awayTeam", label: "客队", type: "text", placeholder: "例：法国", required: true, span: "half" },
      { name: "question", label: "赛事问题（可选）", type: "text", placeholder: "例：常规时间走势如何？", span: "full" },
    ],
  },
};

export function getOracleFormSchema(key: FreeOracleKey): OracleFormSchema {
  return SCHEMAS[key];
}

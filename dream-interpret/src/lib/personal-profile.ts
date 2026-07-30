export interface PersonalProfile {
  age: number;
  zodiac: string;
  chineseZodiac: string;
  lifeStage: string;
}

const ZODIAC = [
  [120, "摩羯座"], [219, "水瓶座"], [321, "双鱼座"], [420, "白羊座"],
  [521, "金牛座"], [622, "双子座"], [723, "巨蟹座"], [823, "狮子座"],
  [923, "处女座"], [1024, "天秤座"], [1123, "天蝎座"], [1222, "射手座"], [1232, "摩羯座"],
] as const;
const ANIMALS = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];

export function buildPersonalProfile(birthDate: string, targetDate: string): PersonalProfile {
  const birth = parseDate(birthDate, "生日");
  const target = parseDate(targetDate, "测算日期");
  if (birth > target) throw new Error("生日不能晚于测算日期");
  let age = target.getUTCFullYear() - birth.getUTCFullYear();
  const birthdayPassed =
    target.getUTCMonth() > birth.getUTCMonth() ||
    (target.getUTCMonth() === birth.getUTCMonth() && target.getUTCDate() >= birth.getUTCDate());
  if (!birthdayPassed) age -= 1;
  const monthDay = (birth.getUTCMonth() + 1) * 100 + birth.getUTCDate();
  const zodiac = ZODIAC.find(([limit]) => monthDay < limit)?.[1] ?? "摩羯座";
  const chineseZodiac = ANIMALS[((birth.getUTCFullYear() - 4) % 12 + 12) % 12];
  const lifeStage = age < 18 ? "成长探索期" : age < 30 ? "建立方向期" : age < 45 ? "扩展与承担期" : age < 60 ? "整合与沉淀期" : "从容传承期";
  return { age, zodiac, chineseZodiac, lifeStage };
}

function parseDate(value: string, label: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(`${label}格式必须为 YYYY-MM-DD`);
  const result = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(result.getTime()) || result.toISOString().slice(0, 10) !== value) throw new Error(`${label}不是有效日期`);
  return result;
}

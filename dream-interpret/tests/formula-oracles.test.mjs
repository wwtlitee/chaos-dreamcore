import assert from "node:assert/strict";
import test from "node:test";

async function load(relativePath) {
  return import(new URL(relativePath, import.meta.url)).catch(() => ({}));
}

test("梅花易数按日期时辰与心念数计算完整卦体", async () => {
  const oracle = await load("../src/lib/meihua-oracle.ts");
  assert.equal(typeof oracle.deriveMeihuaHexagram, "function");

  const result = oracle.deriveMeihuaHexagram({
    question: "今天是否适合推进新合作？",
    category: "事业",
    currentState: "正在权衡",
    targetDate: "2026-08-12",
    targetTime: "10:30",
    seedNumber: 168,
  });

  assert.equal(result.method, "梅花易数·年月日时起卦");
  assert.ok(result.primary.name);
  assert.ok(result.mutual.name);
  assert.ok(result.changed.name);
  assert.ok(result.movingLine >= 1 && result.movingLine <= 6);
  assert.ok(["体生用", "用生体", "体克用", "用克体", "比和"].includes(result.bodyUse.relation));
});

test("每日一卦第一段直接回答问题并展示公式依据", async () => {
  const oracle = await load("../src/lib/daily-hexagram.ts");
  const report = oracle.buildDailyHexagramReport({
    question: "今天是否适合推进新合作？",
    category: "事业",
    currentState: "正在权衡",
    targetDate: "2026-08-12",
    targetTime: "10:30",
    seedNumber: 168,
  });

  assert.equal(report.sections[0].id, "directAnswer");
  assert.match(report.verdict, /适合|可以|暂缓|不宜/);
  assert.match(JSON.stringify(report.sections[0]), /推进新合作/);
  assert.match(JSON.stringify(report), /体卦|用卦|动爻|互卦/);
});

test("四柱运势使用出生信息和测算日计算命盘，缺时辰时明确降级", async () => {
  const oracle = await load("../src/lib/bazi-fortune.ts");
  assert.equal(typeof oracle.buildBaziFortuneReport, "function");

  const complete = oracle.buildBaziFortuneReport({
    name: "小牛",
    birthDate: "1996-08-12",
    birthTime: "08:30",
    focus: "事业",
    question: "今天适合主动找领导谈项目吗？",
    targetDate: "2026-08-12",
  });
  const simplified = oracle.buildBaziFortuneReport({
    name: "小牛",
    birthDate: "1996-08-12",
    focus: "事业",
    targetDate: "2026-08-12",
  });

  assert.match(complete.subtitle, /年柱.+月柱.+日柱.+时柱/);
  assert.match(JSON.stringify(complete), /今天适合主动找领导谈项目吗/);
  assert.ok(complete.metrics.some((metric) => metric.label === "命盘完整度" && metric.value === "四柱完整"));
  assert.ok(simplified.metrics.some((metric) => metric.label === "命盘完整度" && /缺时柱/.test(metric.value)));
  assert.equal(complete.sections[0].id, "directAnswer");
});

test("梦境用梦象动作人物和结局组合回答而非通用模板", async () => {
  const oracle = await load("../src/lib/dream-oracle.ts");
  const report = oracle.buildDreamOracleReport({
    dream: "我在浑水里被陌生人追赶，最后爬上岸逃了出来。",
    emotion: "恐惧",
    recurrence: "反复出现",
    wakeFeeling: "松了一口气",
    ending: "顺利脱困",
    recentContext: "最近正准备离开一段让我压力很大的合作。",
  });

  assert.equal(report.sections[0].id, "directAnswer");
  assert.match(report.verdict, /脱困|压力|追赶|浑水/);
  assert.match(JSON.stringify(report), /陌生人|上岸|合作/);
  assert.doesNotMatch(report.verdict, /旧有秩序正在松动|内部整理/);
});

test("公开入口隐藏世界杯但保留内部模块定义", async () => {
  const modules = await load("../src/lib/oracle-modules.ts");
  assert.equal(typeof modules.getOracleModule, "function");
  assert.ok(modules.getOracleModule("worldcup"));
  assert.equal(modules.oracleModules.some((item) => item.key === "worldcup"), false);
  assert.equal(modules.allOracleModules.some((item) => item.key === "worldcup"), true);
});

test("数据型报告的第一段必须先回答用户问题并列出数据依据", async () => {
  const answer = await load("../src/lib/evidence-first-answer.ts");
  assert.equal(typeof answer.buildEvidenceFirstSection, "function");
  const section = answer.buildEvidenceFirstSection({
    question: "热度是否透支？",
    answer: "有透支迹象，暂不追高。",
    reasons: ["24H 上涨 18%", "成交量没有同步增加"],
    action: "等待量价重新同步。",
    avoid: "不要只因价格上涨继续追入。",
    uncertainty: "缺少持仓集中度数据。",
  });

  assert.equal(section.id, "directAnswer");
  assert.match(JSON.stringify(section), /热度是否透支|24H 上涨 18%|等待量价重新同步|缺少持仓集中度/);
});

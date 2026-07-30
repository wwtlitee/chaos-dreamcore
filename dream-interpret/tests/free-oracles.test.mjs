import assert from "node:assert/strict";
import test from "node:test";

async function load(relativePath) {
  return import(new URL(relativePath, import.meta.url)).catch(() => ({}));
}

test("每日一卦生成确定性的完整六爻长报告", async () => {
  const oracle = await load("../src/lib/daily-hexagram.ts");
  assert.equal(typeof oracle.buildDailyHexagramReport, "function");

  const input = {
    question: "今天是否适合推进新合作？",
    category: "事业",
    currentState: "正在权衡",
    targetDate: "2026-07-30",
    seedNumber: 168,
  };
  const first = oracle.buildDailyHexagramReport(input);
  const second = oracle.buildDailyHexagramReport(input);

  assert.deepEqual(first, second);
  assert.ok(first.sections.length >= 6);
  assert.equal(first.sections.find((section) => section.kind === "lines")?.items.length, 6);
  assert.ok(first.sections.flatMap((section) => section.paragraphs ?? []).join("").length >= 450);
});

test("梦境报告根据真实输入生成完整结构而不是固定两句话", async () => {
  const oracle = await load("../src/lib/dream-oracle.ts");
  assert.equal(typeof oracle.buildDreamOracleReport, "function");

  const report = oracle.buildDreamOracleReport({
    dream: "我反复梦见自己在深水里的旧城寻找出口，最后听见故人的声音。",
    emotion: "不安",
    recurrence: "反复出现",
    wakeFeeling: "疲惫但清醒",
  });

  assert.ok(report.sections.length >= 6);
  assert.ok(report.metrics.some((metric) => metric.label === "主情绪"));
  assert.match(JSON.stringify(report), /水|旧城|故人/);
  assert.ok(report.sections.flatMap((section) => section.paragraphs ?? []).join("").length >= 450);
});

test("生日画像从生日和测算日推导年龄星座与生肖", async () => {
  const profile = await load("../src/lib/personal-profile.ts");
  assert.equal(typeof profile.buildPersonalProfile, "function");

  const result = profile.buildPersonalProfile("1996-08-12", "2026-07-30");
  assert.equal(result.age, 29);
  assert.equal(result.zodiac, "狮子座");
  assert.equal(result.chineseZodiac, "鼠");
});

test("六个入口拥有各自必要的表单字段", async () => {
  const schema = await load("../src/lib/oracle-form-schema.ts");
  assert.equal(typeof schema.getOracleFormSchema, "function");

  assert.deepEqual(schema.getOracleFormSchema("dream").required, ["dream"]);
  assert.ok(schema.getOracleFormSchema("hexagram").required.includes("question"));
  assert.ok(schema.getOracleFormSchema("fortune").required.includes("birthDate"));
  assert.ok(schema.getOracleFormSchema("stock").required.includes("stock"));
  assert.ok(schema.getOracleFormSchema("token").required.includes("token"));
  assert.deepEqual(schema.getOracleFormSchema("worldcup").required, ["homeTeam", "awayTeam"]);
});

test("已有长报告可以无损转换为统一结构化报告", async () => {
  const adapters = await load("../src/lib/free-oracle-adapters.ts");
  assert.equal(typeof adapters.adaptLongReading, "function");

  const report = adapters.adaptLongReading({
    module: "stock",
    title: "AAPL 股票卦象",
    subtitle: "乾为天 → 风雷益",
    verdict: "趋势偏强但波动较高",
    metrics: [{ label: "趋势", value: "偏强" }],
    sectionTitles: { overview: "总览", sixLines: "六爻详解", closing: "封卦" },
    sections: {
      overview: "行情：AAPL\n观察周期：1d",
      sixLines: "【初爻 · 价格】\n判词：价格强\n证据：涨幅 2%\n\n【二爻 · 量能】\n判词：量能待确认",
      closing: "只看结构，不作买卖建议。",
    },
    disclaimer: "不构成投资建议",
  });

  assert.equal(report.module, "stock");
  assert.equal(report.sections.length, 3);
  assert.equal(report.sections[1].kind, "lines");
  assert.equal(report.sections[1].items.length, 2);
});

test("报告成功后进入折叠报告模式，重新测算和失败会恢复表单", async () => {
  const workspace = await load("../src/lib/oracle-workspace-state.ts");
  assert.equal(typeof workspace.reduceOracleWorkspaceMode, "function");

  assert.equal(workspace.reduceOracleWorkspaceMode("form", "submit"), "form");
  assert.equal(workspace.reduceOracleWorkspaceMode("form", "success"), "report");
  assert.equal(workspace.reduceOracleWorkspaceMode("report", "retry"), "form");
  assert.equal(workspace.reduceOracleWorkspaceMode("report", "failure"), "form");
});

test("首页使用真正透明的 Alpha Logo 素材", async () => {
  const branding = await load("../src/lib/home-branding.ts");
  assert.equal(typeof branding.HOME_WORDMARK_ASSET, "string");
  assert.match(branding.HOME_WORDMARK_ASSET, /-alpha\.png$/);
});

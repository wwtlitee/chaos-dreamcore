import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { dream } = await request.json();

    if (!dream || typeof dream !== "string") {
      return NextResponse.json(
        { error: "请提供梦境描述" },
        { status: 400 }
      );
    }

    // TODO: 调用AI模型进行解梦
    // 这里先返回一个模拟的解梦结果
    const interpretation = generateMockInterpretation(dream);

    return NextResponse.json({
      interpretation,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("解梦API错误:", error);
    return NextResponse.json(
      { error: "解梦过程中出现错误" },
      { status: 500 }
    );
  }
}

function generateMockInterpretation(dream: string): string {
  // 模拟解梦结果
  const keywords = extractKeywords(dream);
  
  return `
【梦境解析报告】

一、梦境关键词提取
${keywords.map((kw, i) => `${i + 1}. ${kw}`).join("\n")}

二、传统解梦解读
根据周公解梦的记载，您梦中的意象具有以下含义：
• 梦见${keywords[0] || "未知事物"}：象征着新的开始和机遇
• 梦见${keywords[1] || "自然元素"}：代表着内心的情感变化
• 梦见${keywords[2] || "人物形象"}：暗示着人际关系的转变

三、心理学分析
从现代心理学角度分析，您的梦境反映了：
1. 潜意识中的期望与担忧
2. 近期生活压力的释放
3. 内心深处的情感需求

四、吉凶预兆
整体运势：★★★★☆
近期运势较好，适合把握机会，积极行动。

五、生活建议
1. 保持积极心态，迎接新的挑战
2. 关注人际关系，加强沟通交流
3. 注意身体健康，保持规律作息
4. 把握机遇，勇敢追求目标

六、注意事项
梦境解析仅供参考，不应作为决策的唯一依据。建议结合实际情况，理性看待梦境含义。

——玄梦解梦 AI智能解析
`.trim();
}

function extractKeywords(dream: string): string[] {
  // 简单的关键词提取逻辑
  const commonKeywords = [
    "飞翔", "坠落", "水", "火", "蛇", "狗", "猫", "鱼",
    "死亡", "考试", "迟到", "追赶", "迷路", "牙齿", "怀孕",
    "结婚", "分手", "旅行", "家", "学校", "工作", "钱"
  ];
  
  const found = commonKeywords.filter(kw => dream.includes(kw));
  
  // 如果没有找到常见关键词，返回一些通用的
  if (found.length === 0) {
    return ["神秘意象", "潜意识", "情感表达"];
  }
  
  return found.slice(0, 5);
}
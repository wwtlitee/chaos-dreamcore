import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Search, Star, ArrowRight } from "lucide-react";
import Link from "next/link";

const dreamCategories = [
  {
    id: "animals",
    title: "动物类",
    description: "梦见各种动物的含义",
    items: [
      { name: "梦见龙", meaning: "象征权力、尊贵和好运" },
      { name: "梦见蛇", meaning: "代表智慧、变化或潜在危险" },
      { name: "梦见鱼", meaning: "预示财富、机遇和丰收" },
      { name: "梦见鸟", meaning: "象征自由、希望和远大志向" },
    ],
  },
  {
    id: "nature",
    title: "自然类",
    description: "梦见自然现象的含义",
    items: [
      { name: "梦见水", meaning: "代表情感、财运或变化" },
      { name: "梦见火", meaning: "象征激情、能量或危险" },
      { name: "梦见山", meaning: "预示困难、挑战或依靠" },
      { name: "梦见雨", meaning: "代表情感释放、净化或悲伤" },
    ],
  },
  {
    id: "people",
    title: "人物类",
    description: "梦见各种人物的含义",
    items: [
      { name: "梦见亲人", meaning: "代表思念、牵挂或家庭关系" },
      { name: "梦见陌生人", meaning: "象征未知、新机遇或潜意识" },
      { name: "梦见已故之人", meaning: "代表思念、未了心愿或警示" },
      { name: "梦见小孩", meaning: "象征纯真、希望或新开始" },
    ],
  },
  {
    id: "actions",
    title: "行为类",
    description: "梦见各种行为的含义",
    items: [
      { name: "梦见飞翔", meaning: "代表自由、成功或逃避" },
      { name: "梦见坠落", meaning: "象征失控、焦虑或失败" },
      { name: "梦见追赶", meaning: "代表压力、恐惧或追求" },
      { name: "梦见迷路", meaning: "象征迷茫、困惑或寻找方向" },
    ],
  },
];

const featuredArticles = [
  {
    title: "周公解梦的起源与历史",
    description: "了解周公解梦这一传统文化的起源和发展历程",
    category: "传统文化",
    readTime: "5分钟",
  },
  {
    title: "梦境心理学：弗洛伊德的解析",
    description: "从现代心理学角度理解梦境的含义和作用",
    category: "心理学",
    readTime: "8分钟",
  },
  {
    title: "常见梦境解析：掉牙齿的含义",
    description: "深入分析梦见掉牙齿的各种可能含义",
    category: "梦境解析",
    readTime: "4分钟",
  },
];

export default function KnowledgePage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="classical-badge mb-4">
            解梦知识库
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            探索解梦文化
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            深入了解周公解梦、易经八卦等传统文化，探索梦境背后的奥秘
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索梦境关键词..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Categories */}
        <Tabs defaultValue="animals" className="mb-12">
          <TabsList className="grid w-full grid-cols-4">
            {dreamCategories.map((category) => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.title}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {dreamCategories.map((category) => (
            <TabsContent key={category.id} value={category.id}>
              <Card className="classical-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-primary" />
                    {category.title}
                  </CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {category.items.map((item, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg bg-card/50 border border-border/50"
                      >
                        <h4 className="font-semibold text-foreground mb-2">
                          {item.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {item.meaning}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Featured Articles */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              精选文章
            </h2>
            <Link
              href="/articles"
              className="inline-flex h-7 items-center gap-1 rounded-lg px-2.5 text-[0.8rem] transition-colors hover:bg-muted hover:text-foreground"
            >
              查看全部
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredArticles.map((article, index) => (
              <Card key={index} className="classical-card hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{article.category}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {article.readTime}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{article.title}</CardTitle>
                  <CardDescription>{article.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" size="sm" className="w-full">
                    阅读全文
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Card className="classical-card max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-center">
                <Star className="w-5 h-5 mr-2 text-primary" />
                想要更详细的解析？
              </CardTitle>
              <CardDescription>
                使用AI解梦服务，获得专业、个性化的梦境解析报告
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href="/dream"
                className="classical-button inline-flex h-9 items-center justify-center rounded-full px-4 text-sm font-medium"
              >
                开始AI解梦
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

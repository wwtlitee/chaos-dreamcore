import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "混沌梦核 - 免费公式占测与数据验卦",
  description:
    "混沌梦核提供梦境组合解析、梅花易数、四柱运势、股票与代币数据验卦，生成与用户问题直接相关的免费长报告。",
  keywords: ["混沌梦核", "免费占卜", "解梦", "梅花易数", "每日一卦", "四柱运势", "股票卦象", "代币卦象"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}

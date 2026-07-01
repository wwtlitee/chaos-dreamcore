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
  title: "混沌梦核 - AI玄学融合解析系统",
  description:
    "混沌梦核融合梦境解析、每日一卦、运势、股票、代币卦象与世界杯赛事卦象，生成多维度梦核综合报告。",
  keywords: ["混沌梦核", "AI玄学", "解梦", "每日一卦", "运势", "股票卦象", "代币卦象", "世界杯"],
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

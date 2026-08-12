import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Brain, MoonStar } from "lucide-react";

const footerLinks = [
  { href: "/dream", label: "梦境解析" },
  { href: "/hexagram", label: "每日一卦" },
  { href: "/fortune", label: "运势卦象" },
  { href: "/stock", label: "股票卦象" },
  { href: "/token", label: "代币卦象" },
  { href: "/knowledge", label: "玄学知识库" },
  { href: "/payment", label: "付费方案" },
];

const modules = ["梦境组合解析", "梅花易数", "四柱运势", "股票数据验卦", "代币数据验卦"];

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-full border border-white/15 bg-white/[0.04]">
                <MoonStar className="size-4 text-white" />
              </div>
              <span className="text-lg font-normal tracking-[-0.03em] text-white">
                混沌梦核
              </span>
            </div>
            <p className="max-w-xs text-sm leading-6 text-white/52">
              以可复核的传统公式与公开数据为底座，把梦境、卦象、运势、股票和代币信号整理成可读报告。
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-white/42">
              Entrances
            </h4>
            <nav className="flex flex-col gap-2">
              {footerLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-white/56 transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-white/42">
              Modules
            </h4>
            <div className="flex flex-col gap-2">
              {modules.map((item) => (
                <span key={item} className="text-sm text-white/56">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="glass-panel p-4">
            <Brain className="size-5 text-orange-200" />
            <h4 className="mt-4 text-lg font-normal text-white">边界说明</h4>
            <p className="mt-2 text-sm leading-6 text-white/54">
              玄学解析用于娱乐、灵感整理与自我观察，不替代医疗、心理咨询、法律、投资或投注建议。
            </p>
          </div>
        </div>

        <Separator className="my-8 bg-white/10" />

        <div className="flex flex-col gap-3 text-sm text-white/42 md:flex-row md:items-center md:justify-between">
          <p>© 2026 混沌梦核. All signals reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="transition-colors hover:text-white">
              隐私政策
            </Link>
            <Link href="/terms" className="transition-colors hover:text-white">
              服务条款
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

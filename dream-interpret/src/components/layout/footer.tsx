import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Brain, MoonStar } from "lucide-react";

const footerLinks = [
  { href: "/dream", label: "梦境解析" },
  { href: "/knowledge", label: "玄学知识库" },
  { href: "/payment", label: "付费方案" },
];

const modules = ["每日一卦", "塔罗牌阵", "星座星盘", "手相识别", "面相观察"];

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
              以梦境为主轴，把卦象、塔罗、星座、手相、面相汇入同一份梦核综合报告。
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
              玄学解析用于娱乐、灵感整理与自我观察，不替代医疗、心理咨询、法律或投资建议。
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

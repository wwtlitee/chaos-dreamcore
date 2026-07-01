"use client";

import { type CSSProperties } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, X, MoonStar, Sparkles } from "lucide-react";
import { useState } from "react";
import { oracleModules, type OracleModule } from "@/lib/oracle-modules";

function oracleNavStyle(oracle: OracleModule) {
  return {
    "--oracle-accent": oracle.accent,
    "--oracle-accent-soft": oracle.accentSoft,
  } as CSSProperties;
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="ritual-header sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-full border border-white/15 bg-white/[0.04] transition-transform group-hover:scale-105">
              <MoonStar className="size-4 text-white" />
            </div>
            <span className="text-lg font-normal tracking-[-0.03em] text-foreground">
              混沌梦核
            </span>
            <Badge variant="outline" className="hidden border-white/15 bg-white/[0.03] text-[10px] font-normal tracking-[0.18em] text-white/62 sm:inline-flex">
              AI OCCULT
            </Badge>
          </Link>

          <nav className="hidden items-center gap-4 md:flex">
            {oracleModules.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="ritual-nav-link"
                  data-active={isActive}
                  data-oracle={item.key}
                  style={oracleNavStyle(item)}
                >
                  {item.shortTitle}
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link href="/dream" className="magnet-button min-h-9 px-4 py-2 text-sm">
              <Sparkles className="size-4" />
              开始解析
            </Link>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label={isMenuOpen ? "关闭菜单" : "打开菜单"}
          >
            {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>

        {isMenuOpen && (
          <div className="mt-4 border-t border-white/10 pb-3 pt-4 md:hidden">
            <nav className="flex flex-col gap-2">
            {oracleModules.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="ritual-mobile-nav-link"
                  data-active={pathname === item.href}
                  style={oracleNavStyle(item)}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>{item.shortTitle}</span>
                  {item.title}
                </Link>
              ))}
              <Link
                href="/dream"
                className="magnet-button mt-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Sparkles className="size-4" />
                开始解析
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

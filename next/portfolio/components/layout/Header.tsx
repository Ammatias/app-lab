"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { FileText, Home } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const navigation = [
  { href: "/", label: "Главная", icon: Home },
  { href: "/resume", label: "Резюме", icon: FileText },
];

export function Header() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  return (
    <motion.header
      initial={reduceMotion ? false : { y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: reduceMotion ? 0 : 0.45, ease: "easeOut" }}
      className="fixed inset-x-0 top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full font-mono text-sm font-semibold tracking-[-0.03em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:min-w-0 sm:justify-start sm:px-2 sm:text-base"
          aria-label="Портфолио разработчика — главная"
        >
          <span className="sm:hidden" aria-hidden="true">DEV</span>
          <span className="hidden sm:inline">Portfolio Developer</span>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <nav className="flex items-center rounded-full border border-border bg-card/70 p-1" aria-label="Основная навигация">
            {navigation.map(({ href, label, icon: Icon }) => {
              const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full px-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:px-4 ${
                    active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only sm:not-sr-only">{label}</span>
                </Link>
              );
            })}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </motion.header>
  );
}

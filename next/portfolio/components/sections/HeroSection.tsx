"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownRight, FileText } from "lucide-react";
import Link from "next/link";
import type { Project } from "@/data/projects";
import type { HeroData } from "@/data/hero";
import type { WorkContextData } from "@/data/work-context";

interface HeroSectionProps {
  hero: HeroData;
  workContext: WorkContextData;
  featuredProject?: Project;
}

export function HeroSection({ hero, workContext, featuredProject }: HeroSectionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative flex min-h-[min(920px,100svh)] items-center overflow-hidden px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-50 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_82%)]" />

      <div className="mx-auto grid w-full max-w-7xl items-center gap-16 lg:grid-cols-[minmax(0,1.12fr)_minmax(360px,0.88fr)] lg:gap-20">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.65, ease: "easeOut" }}
        >
          <p className="mb-7 flex items-center gap-3 font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary sm:text-sm">
            <span className="h-px w-10 bg-primary" aria-hidden="true" />
            Инженер-программист · Full-stack / infrastructure
          </p>

          <h1 className="max-w-4xl text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-[5.35rem]">
            {hero.title}
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
            {hero.subtitle}
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href={hero.ctaPrimary.href}
              className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background"
            >
              {hero.ctaPrimary.text}
              <ArrowDownRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" aria-hidden="true" />
            </Link>
            <Link
              href={hero.ctaSecondary.href}
              className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-border bg-background/60 px-6 py-3 text-sm font-semibold backdrop-blur-sm transition-colors hover:border-primary/60 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background"
            >
              <FileText className="h-4 w-4 text-primary" aria-hidden="true" />
              {hero.ctaSecondary.text}
            </Link>
          </div>
        </motion.div>

        <motion.aside
          initial={reduceMotion ? false : { opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.7, delay: reduceMotion ? 0 : 0.12, ease: "easeOut" }}
          className="relative"
          aria-label={workContext.title}
        >
          <div className="absolute -inset-8 -z-10 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
          <div className="overflow-hidden rounded-[2rem] border border-border/80 bg-card/80 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
              <span>{workContext.title}</span>
              <span className="flex items-center gap-2 text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_10px_currentColor]" aria-hidden="true" />
                {workContext.status}
              </span>
            </div>

            <div className="p-6 sm:p-8">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-primary">{workContext.focusLabel}</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.035em]">
                {featuredProject?.title ?? "Системы для реальной работы"}
              </h2>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
                {featuredProject?.description ?? "Проектирование, запуск и поддержка веб-приложений и инфраструктуры."}
              </p>

              <div className="mt-8 border-t border-border">
                {workContext.layers.map((layer, index) => (
                  <div key={layer.id} className="grid grid-cols-[2.5rem_1fr] gap-3 border-b border-border py-4">
                    <span className="font-mono text-xs text-primary">{String(index + 1).padStart(2, "0")}</span>
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                      <span className="text-sm font-semibold">{layer.label}</span>
                      <span className="font-mono text-xs text-muted-foreground">{layer.value}</span>
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-6 max-w-sm text-sm leading-6 text-muted-foreground">
                {workContext.note}
              </p>
            </div>
          </div>
        </motion.aside>
      </div>
    </section>
  );
}

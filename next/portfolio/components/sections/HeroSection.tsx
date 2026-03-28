"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ParallaxText } from "@/components/ui/ParallaxText";

interface HeroData {
  title: string;
  subtitle: string;
  ctaPrimary: { text: string; href: string };
  ctaSecondary: { text: string; href: string };
}

interface HeroSectionProps {
  hero: HeroData;
}

export function HeroSection({ hero }: HeroSectionProps) {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 pt-16">
      <div className="container mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <ParallaxText speed={0.3}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              {hero.title}
            </h1>
          </ParallaxText>
          <ParallaxText speed={0.2}>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {hero.subtitle}
            </p>
          </ParallaxText>
          <div className="flex gap-4 justify-center">
            <Link
              href={hero.ctaPrimary.href}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              {hero.ctaPrimary.text}
            </Link>
            <Link
              href={hero.ctaSecondary.href}
              className="px-6 py-3 border border-border rounded-lg hover:bg-accent transition-colors"
            >
              {hero.ctaSecondary.text}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

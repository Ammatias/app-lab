"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 pt-16">
      <div className="container mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            Привет, я Разработчик
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Full-stack разработчик, создающий современные веб-приложения с 
            фокусом на производительность и пользовательский опыт
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="#projects"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              Посмотреть проекты
            </Link>
            <Link
              href="/resume"
              className="px-6 py-3 border border-border rounded-lg hover:bg-accent transition-colors"
            >
              Резюме
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const context = useTheme();
  const reduceMotion = useReducedMotion();

  // Если контекст не доступен (например, на странице 404), не рендерим кнопку
  if (!context) {
    return (
      <button
        type="button"
        disabled
        className="relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-accent/50"
        aria-label="Переключить тему"
      >
        <Sun className="w-5 h-5 text-foreground" />
      </button>
    );
  }

  const { theme, toggleTheme } = context;

  return (
    <motion.button
      type="button"
      onClick={toggleTheme}
      whileHover={reduceMotion ? undefined : { scale: 1.06 }}
      whileTap={reduceMotion ? undefined : { scale: 0.94 }}
      className="relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-accent/70 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему"}
    >
      <motion.div
        initial={false}
        animate={{
          rotate: theme === "dark" ? 0 : 180,
          scale: theme === "dark" ? 1 : 0,
        }}
        transition={{ duration: reduceMotion ? 0 : 0.3 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Moon className="w-5 h-5 text-foreground" />
      </motion.div>
      <motion.div
        initial={false}
        animate={{
          rotate: theme === "light" ? 0 : 180,
          scale: theme === "light" ? 1 : 0,
        }}
        transition={{ duration: reduceMotion ? 0 : 0.3 }}
        className="flex items-center justify-center"
      >
        <Sun className="w-5 h-5 text-foreground" />
      </motion.div>
    </motion.button>
  );
}

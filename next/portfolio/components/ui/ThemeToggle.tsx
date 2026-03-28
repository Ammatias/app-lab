"use client";

import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const context = useTheme();

  // Если контекст не доступен (например, на странице 404), не рендерим кнопку
  if (!context) {
    return (
      <button
        className="relative p-2 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
        aria-label="Переключить тему"
      >
        <Sun className="w-5 h-5 text-foreground" />
      </button>
    );
  }

  const { theme, toggleTheme } = context;

  return (
    <motion.button
      onClick={toggleTheme}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="relative p-2 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
      aria-label="Переключить тему"
    >
      <motion.div
        initial={false}
        animate={{
          rotate: theme === "dark" ? 0 : 180,
          scale: theme === "dark" ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
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
        transition={{ duration: 0.3 }}
        className="flex items-center justify-center"
      >
        <Sun className="w-5 h-5 text-foreground" />
      </motion.div>
    </motion.button>
  );
}

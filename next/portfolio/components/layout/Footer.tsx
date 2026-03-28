"use client";

import { motion } from "framer-motion";
import { footer } from "@/data/footer";

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="border-t border-border py-6 mt-auto"
    >
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} {footer.copyright}
      </div>
    </motion.footer>
  );
}

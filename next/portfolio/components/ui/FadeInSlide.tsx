"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface FadeInSlideProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
  duration?: number;
}

export function FadeInSlide({
  children,
  className = "",
  delay = 0,
  direction = "up",
  distance = 30,
  duration = 0.5,
}: FadeInSlideProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const getInitialValues = () => {
    switch (direction) {
      case "up":
        return { opacity: 0, y: distance };
      case "down":
        return { opacity: 0, y: -distance };
      case "left":
        return { opacity: 0, x: distance };
      case "right":
        return { opacity: 0, x: -distance };
      default:
        return { opacity: 0, y: distance };
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={getInitialValues()}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : getInitialValues()}
      transition={{
        duration,
        delay,
        ease: "easeOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

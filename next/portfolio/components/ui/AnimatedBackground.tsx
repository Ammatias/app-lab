"use client";

import { motion } from "framer-motion";

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="line-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="line-gradient-2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0" />
            <stop offset="50%" stopColor="#a855f7" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="line-gradient-3" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0" />
            <stop offset="50%" stopColor="#7c3aed" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Линия 1 */}
        <motion.line
          x1="0%"
          y1="20%"
          x2="100%"
          y2="80%"
          stroke="url(#line-gradient-1)"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: 1,
            opacity: [0, 0.5, 0],
            x1: ["0%", "10%", "0%"],
            x2: ["100%", "90%", "100%"],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Линия 2 */}
        <motion.line
          x1="100%"
          y1="10%"
          x2="0%"
          y2="90%"
          stroke="url(#line-gradient-2)"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: 1,
            opacity: [0, 0.4, 0],
            y1: ["10%", "20%", "10%"],
            y2: ["90%", "80%", "90%"],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
            delay: 2,
          }}
        />

        {/* Линия 3 */}
        <motion.line
          x1="0%"
          y1="50%"
          x2="100%"
          y2="50%"
          stroke="url(#line-gradient-3)"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: 1,
            opacity: [0, 0.3, 0],
            y1: ["50%", "40%", "50%"],
            y2: ["50%", "60%", "50%"],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear",
            delay: 4,
          }}
        />

        {/* Линия 4 */}
        <motion.line
          x1="20%"
          y1="0%"
          x2="80%"
          y2="100%"
          stroke="url(#line-gradient-1)"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: 1,
            opacity: [0, 0.35, 0],
            x1: ["20%", "30%", "20%"],
            x2: ["80%", "70%", "80%"],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "linear",
            delay: 1,
          }}
        />

        {/* Линия 5 */}
        <motion.line
          x1="80%"
          y1="0%"
          x2="20%"
          y2="100%"
          stroke="url(#line-gradient-2)"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: 1,
            opacity: [0, 0.3, 0],
            x1: ["80%", "70%", "80%"],
            x2: ["20%", "30%", "20%"],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "linear",
            delay: 3,
          }}
        />
      </svg>

      {/* Градиентные пятна */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
    </div>
  );
}

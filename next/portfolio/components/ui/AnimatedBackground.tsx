"use client";

import { useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function AnimatedLine3D({
  start,
  end,
  color,
  duration,
  delay,
  amplitude = 0.5,
}: {
  start: [number, number, number];
  end: [number, number, number];
  color: string;
  duration: number;
  delay: number;
  amplitude?: number;
}) {
  const lineRef = useRef<THREE.Line>(null);
  const timeRef = useRef(0);

  const points = useMemo(() => {
    const arr = [];
    for (let i = 0; i <= 50; i++) {
      const t = i / 50;
      arr.push(
        new THREE.Vector3(
          start[0] + (end[0] - start[0]) * t,
          start[1] + (end[1] - start[1]) * t,
          start[2] + (end[2] - start[2]) * t
        )
      );
    }
    return arr;
  }, [start, end]);

  const { geometry, material } = useMemo(() => {
    const geom = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.5,
    });
    return { geometry: geom, material: mat };
  }, [points, color]);

  useFrame((state) => {
    if (!lineRef.current) return;

    timeRef.current = state.clock.elapsedTime;
    const t = (timeRef.current - delay) / duration;

    // Анимация прозрачности (пульсация)
    const opacity = Math.max(0, Math.sin(t * Math.PI) * 0.5);
    (lineRef.current.material as THREE.Material).opacity = opacity;

    // Анимация волн - обновляем позиции вершин
    const positions = lineRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < 51; i++) {
      const wave = Math.sin(t * Math.PI * 2 + i * 0.2) * amplitude;
      positions[i * 3] = points[i].x + wave * 0.1;
      positions[i * 3 + 1] = points[i].y + wave * 0.1;
      positions[i * 3 + 2] = points[i].z + wave;
    }
    lineRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <primitive object={new THREE.Line(geometry, material)} ref={lineRef} />
  );
}

function Scene() {
  return (
    <>
      {/* Линия 1 - диагональная */}
      <AnimatedLine3D
        start={[-8, -3, -5]}
        end={[8, 3, -5]}
        color="#8b5cf6"
        duration={8}
        delay={0}
        amplitude={0.3}
      />

      {/* Линия 2 - обратная диагональ */}
      <AnimatedLine3D
        start={[8, -4, -6]}
        end={[-8, 4, -6]}
        color="#a855f7"
        duration={10}
        delay={2}
        amplitude={0.4}
      />

      {/* Линия 3 - горизонтальная волна */}
      <AnimatedLine3D
        start={[-10, 0, -4]}
        end={[10, 0, -4]}
        color="#7c3aed"
        duration={12}
        delay={4}
        amplitude={0.5}
      />

      {/* Линия 4 - вертикальная */}
      <AnimatedLine3D
        start={[-5, -6, -7]}
        end={[5, 6, -7]}
        color="#c084fc"
        duration={9}
        delay={1}
        amplitude={0.3}
      />

      {/* Линия 5 - обратная вертикальная */}
      <AnimatedLine3D
        start={[5, -6, -8]}
        end={[-5, 6, -8]}
        color="#a78bfa"
        duration={11}
        delay={3}
        amplitude={0.4}
      />

      {/* Линия 6 - крест-накрест 1 */}
      <AnimatedLine3D
        start={[-9, -5, -10]}
        end={[9, 5, -10]}
        color="#8b5cf6"
        duration={14}
        delay={0.5}
        amplitude={0.2}
      />

      {/* Линия 7 - крест-накрест 2 */}
      <AnimatedLine3D
        start={[9, -5, -11]}
        end={[-9, 5, -11]}
        color="#a855f7"
        duration={13}
        delay={1.5}
        amplitude={0.2}
      />

      {/* Линия 8 - верхняя волна */}
      <AnimatedLine3D
        start={[-7, 2, -5]}
        end={[7, 3, -5]}
        color="#7c3aed"
        duration={10}
        delay={2.5}
        amplitude={0.3}
      />

      {/* Линия 9 - нижняя волна */}
      <AnimatedLine3D
        start={[-7, -2, -6]}
        end={[7, -3, -6]}
        color="#c084fc"
        duration={11}
        delay={3.5}
        amplitude={0.3}
      />

      {/* Линия 10 - центральная */}
      <AnimatedLine3D
        start={[-4, -1, -4]}
        end={[4, 1, -4]}
        color="#a78bfa"
        duration={9}
        delay={0.8}
        amplitude={0.4}
      />
    </>
  );
}

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene />
      </Canvas>

      {/* Градиентные пятна - увеличенные и более яркие */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-fuchsia-500/15 rounded-full blur-3xl"
      />
    </div>
  );
}

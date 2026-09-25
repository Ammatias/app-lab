"use client";

import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const animationQuery = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";
const accent = "#a78bfa";
const accentSoft = "#c4b5fd";

type Position = [number, number, number];
type ServiceKind = "server" | "website" | "database" | "workstation" | "api" | "containers";

const services: Array<{ id: string; position: Position; kind: ServiceKind }> = [
  { id: "server", position: [-4.5, 2.25, -1.3], kind: "server" },
  { id: "website", position: [4.35, 2.4, -1.5], kind: "website" },
  { id: "database", position: [-4.65, -2.15, -1.1], kind: "database" },
  { id: "workstation", position: [4.5, -2.15, -1.25], kind: "workstation" },
  { id: "api", position: [0, 3.25, -1.65], kind: "api" },
  { id: "containers", position: [0, -3.15, -1.35], kind: "containers" },
];

function subscribeToAnimationPreference(callback: () => void) {
  const query = window.matchMedia(animationQuery);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function getAnimationPreference() {
  return window.matchMedia(animationQuery).matches;
}

function useAnimatedBackgroundEnabled() {
  return useSyncExternalStore(subscribeToAnimationPreference, getAnimationPreference, () => false);
}

function WireMaterial({ opacity = 0.48 }: { opacity?: number }) {
  return <meshBasicMaterial color={accentSoft} transparent opacity={opacity} wireframe />;
}

function InternetGlobe() {
  const gatewayNodes: Position[] = [
    [-0.72, 0, 0], [0.72, 0, 0], [0, 0.72, 0], [0, -0.72, 0], [0, 0, 0.72],
  ];
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.72, 18, 12]} />
        <meshBasicMaterial color={accentSoft} transparent opacity={0.28} wireframe />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.23, 16, 16]} />
        <meshBasicMaterial color={accent} transparent opacity={0.3} />
      </mesh>
      <mesh><torusGeometry args={[0.72, 0.012, 8, 64]} /><meshBasicMaterial color={accent} transparent opacity={0.48} /></mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.72, 0.012, 8, 64]} /><meshBasicMaterial color={accent} transparent opacity={0.42} /></mesh>
      <mesh rotation={[0, Math.PI / 2, 0]}><torusGeometry args={[0.72, 0.012, 8, 64]} /><meshBasicMaterial color={accent} transparent opacity={0.42} /></mesh>
      <mesh rotation={[Math.PI / 3, Math.PI / 5, 0]}><torusGeometry args={[1.05, 0.014, 8, 72]} /><meshBasicMaterial color={accentSoft} transparent opacity={0.2} /></mesh>
      {gatewayNodes.map((position, index) => (
        <mesh key={index} position={position}>
          <sphereGeometry args={[0.045, 10, 10]} />
          <meshBasicMaterial color="#ede9fe" transparent opacity={0.78} />
        </mesh>
      ))}
    </group>
  );
}

function ServerIcon() {
  return <group>{[-0.42, 0, 0.42].map((y) => <group key={y} position={[0, y, 0]}><mesh><boxGeometry args={[1.05, 0.3, 0.5]} /><WireMaterial /></mesh><mesh position={[-0.36, 0, 0.27]}><sphereGeometry args={[0.035, 8, 8]} /><meshBasicMaterial color={accent} /></mesh></group>)}</group>;
}

function WebsiteIcon() {
  return <group><mesh><boxGeometry args={[1.3, 0.9, 0.12]} /><WireMaterial /></mesh><mesh position={[0, 0.25, 0.08]}><boxGeometry args={[0.95, 0.02, 0.02]} /><meshBasicMaterial color={accent} transparent opacity={0.55} /></mesh>{[-0.46, -0.32, -0.18].map((x) => <mesh key={x} position={[x, 0.36, 0.09]}><sphereGeometry args={[0.028, 8, 8]} /><meshBasicMaterial color={accent} /></mesh>)}</group>;
}

function DatabaseIcon() {
  return <group><mesh><cylinderGeometry args={[0.55, 0.55, 0.95, 20, 3, true]} /><WireMaterial /></mesh><mesh position={[0, 0.47, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.55, 0.018, 8, 32]} /><meshBasicMaterial color={accent} transparent opacity={0.55} /></mesh></group>;
}

function WorkstationIcon() {
  return <group><mesh position={[0, 0.16, 0]}><boxGeometry args={[1.15, 0.72, 0.12]} /><WireMaterial /></mesh><mesh position={[0, -0.38, 0]}><boxGeometry args={[0.08, 0.35, 0.08]} /><meshBasicMaterial color={accentSoft} transparent opacity={0.42} /></mesh><mesh position={[0, -0.56, 0]}><boxGeometry args={[0.55, 0.06, 0.18]} /><meshBasicMaterial color={accentSoft} transparent opacity={0.42} /></mesh></group>;
}

function ApiIcon() {
  const satellites: Position[] = [[-0.62, 0, 0], [0.62, 0, 0], [0, 0.62, 0]];
  return <group><mesh><octahedronGeometry args={[0.42]} /><WireMaterial opacity={0.58} /></mesh>{satellites.map((position, index) => <mesh key={index} position={position}><sphereGeometry args={[0.11, 10, 10]} /><meshBasicMaterial color={accent} transparent opacity={0.52} /></mesh>)}</group>;
}

function ContainerIcon() {
  const positions: Position[] = [[-0.32, 0.22, 0], [0.32, 0.22, 0], [0, -0.32, 0]];
  return <group>{positions.map((position, index) => <mesh key={index} position={position}><boxGeometry args={[0.58, 0.42, 0.46]} /><WireMaterial opacity={0.5} /></mesh>)}</group>;
}

function ServiceIcon({ kind, position }: { kind: ServiceKind; position: Position }) {
  return <group position={position}>{kind === "server" && <ServerIcon />}{kind === "website" && <WebsiteIcon />}{kind === "database" && <DatabaseIcon />}{kind === "workstation" && <WorkstationIcon />}{kind === "api" && <ApiIcon />}{kind === "containers" && <ContainerIcon />}</group>;
}

function DataPacket({ target, phase }: { target: Position; phase: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const progress = (clock.elapsedTime * 0.12 + phase) % 1;
    const pulse = Math.sin(progress * Math.PI);
    ref.current.position.set(target[0] * progress, target[1] * progress, target[2] * progress);
    ref.current.scale.setScalar(0.65 + pulse * 0.65);
  });
  return <mesh ref={ref}><sphereGeometry args={[0.055, 10, 10]} /><meshBasicMaterial color="#ddd6fe" transparent opacity={0.8} /></mesh>;
}

function NetworkMap() {
  const groupRef = useRef<THREE.Group>(null);
  const edgeMaterialRef = useRef<THREE.LineBasicMaterial>(null);
  const edgeGeometry = useMemo(() => {
    const points = services.flatMap(({ position }) => [new THREE.Vector3(0, 0, 0), new THREE.Vector3(...position)]);
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  useEffect(() => () => edgeGeometry.dispose(), [edgeGeometry]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const time = clock.elapsedTime;
    groupRef.current.rotation.y = Math.sin(time * 0.07) * 0.1;
    groupRef.current.rotation.x = Math.cos(time * 0.055) * 0.035;
    groupRef.current.position.y = Math.sin(time * 0.18) * 0.1;
    if (edgeMaterialRef.current) edgeMaterialRef.current.opacity = 0.18 + Math.sin(time * 0.45) * 0.035;
  });

  return (
    <group ref={groupRef} rotation={[0.04, 0, -0.025]}>
      <lineSegments geometry={edgeGeometry}><lineBasicMaterial ref={edgeMaterialRef} color={accent} transparent opacity={0.2} /></lineSegments>
      <InternetGlobe />
      {services.map((service) => <ServiceIcon key={service.id} kind={service.kind} position={service.position} />)}
      {services.map((service, index) => <DataPacket key={`packet-${service.id}`} target={service.position} phase={index / services.length} />)}
    </group>
  );
}

export function AnimatedBackground() {
  const animationEnabled = useAnimatedBackgroundEnabled();
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {animationEnabled && (
        <Canvas camera={{ position: [0, 0, 7.4], fov: 62 }} dpr={[1, 1.25]} gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}>
          <NetworkMap />
        </Canvas>
      )}
      <motion.div animate={animationEnabled ? { scale: [1, 1.12, 1], opacity: [0.1, 0.18, 0.1] } : undefined} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className="absolute left-[12%] top-[16%] h-72 w-72 rounded-full bg-purple-500/15 blur-3xl sm:h-96 sm:w-96" />
      <motion.div animate={animationEnabled ? { scale: [1.1, 1, 1.1], opacity: [0.1, 0.2, 0.1] } : undefined} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute bottom-[10%] right-[8%] h-72 w-72 rounded-full bg-violet-500/15 blur-3xl sm:h-96 sm:w-96" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0,transparent_42%,var(--background)_100%)]" />
    </div>
  );
}

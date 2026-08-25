"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function WaveGrid() {
  const meshRef = useRef<THREE.Points>(null);
  const count = 30;
  const separation = 1.2;

  const [positions, scales] = useMemo(() => {
    const pos = [];
    const sc = [];
    for (let ix = 0; ix < count; ix++) {
      for (let iy = 0; iy < count; iy++) {
        pos.push(
          (ix - count / 2) * separation,
          -2,
          (iy - count / 2) * separation
        );
        sc.push(1);
      }
    }
    return [new Float32Array(pos), new Float32Array(sc)];
  }, [count, separation]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const time = clock.getElapsedTime() * 0.8;
    const posAttr = meshRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const array = posAttr.array as Float32Array;

    let i = 0;
    for (let ix = 0; ix < count; ix++) {
      for (let iy = 0; iy < count; iy++) {
        array[i + 1] =
          Math.sin((ix + time) * 0.3) * 0.6 +
          Math.sin((iy + time) * 0.5) * 0.6 - 2;
        i += 3;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#74c69d"
        transparent
        opacity={0.4}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function FloatingNodes() {
  const nodes = useMemo(() => {
    const list = [];
    for (let i = 0; i < 40; i++) {
      list.push({
        x: (Math.random() - 0.5) * 20,
        y: (Math.random() - 0.5) * 8,
        z: (Math.random() - 0.5) * 12,
        speed: 0.2 + Math.random() * 0.4,
        offset: Math.random() * Math.PI * 2,
      });
    }
    return list;
  }, []);

  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((child, i) => {
      const node = nodes[i];
      child.position.y = node.y + Math.sin(t * node.speed + node.offset) * 0.3;
    });
  });

  return (
    <group ref={groupRef}>
      {nodes.map((node, i) => (
        <mesh key={i} position={[node.x, node.y, node.z]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color="#52b788" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

export default function SpotNowHero3D({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <Canvas
        camera={{ position: [0, 2, 9], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.6} />
        <WaveGrid />
        <FloatingNodes />
      </Canvas>
    </div>
  );
}

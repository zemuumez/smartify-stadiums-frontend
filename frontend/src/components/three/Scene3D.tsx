"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, MeshWobbleMaterial } from "@react-three/drei";
import * as THREE from "three";

function StadiumModel() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
  });

  return (
    <group ref={groupRef}>
      {/* Stadium base */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[3, 3.5, 0.3, 32, 1, true]} />
        <meshStandardMaterial color="#16a34a" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* Field */}
      <mesh position={[0, -0.35, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4, 2.5]} />
        <meshStandardMaterial color="#22c55e" />
      </mesh>

      {/* Field lines */}
      <mesh position={[0, -0.34, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2, 1.5]} />
        <meshStandardMaterial color="#16a34a" wireframe />
      </mesh>

      {/* Stands */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i * Math.PI) / 2;
        return (
          <mesh
            key={i}
            position={[Math.sin(angle) * 3.2, 0.3, Math.cos(angle) * 3.2]}
            rotation={[0, angle, 0]}
          >
            <boxGeometry args={[2.5, 1.2, 0.4]} />
            <meshStandardMaterial color="#374151" transparent opacity={0.8} />
          </mesh>
        );
      })}
    </group>
  );
}

function FloatingOrbs() {
  return (
    <>
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
        <mesh position={[-4, 2, -3]}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <MeshDistortMaterial
            color="#16a34a"
            attach="material"
            distort={0.4}
            speed={2}
            roughness={0}
          />
        </mesh>
      </Float>

      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
        <mesh position={[4, -1, -2]}>
          <sphereGeometry args={[0.3, 32, 32]} />
          <MeshWobbleMaterial
            color="#eab308"
            attach="material"
            factor={0.3}
            speed={2}
          />
        </mesh>
      </Float>

      <Float speed={1.8} rotationIntensity={0.2} floatIntensity={0.6}>
        <mesh position={[3, 2.5, -4]}>
          <torusGeometry args={[0.4, 0.15, 16, 32]} />
          <meshStandardMaterial color="#16a34a" emissive="#16a34a" emissiveIntensity={0.3} />
        </mesh>
      </Float>
    </>
  );
}

export default function Scene3D({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 ${className}`}>
      <Canvas
        camera={{ position: [0, 2, 8], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-5, 3, -5]} intensity={0.5} color="#16a34a" />
        <pointLight position={[5, -3, -5]} intensity={0.3} color="#eab308" />

        <StadiumModel />
        <FloatingOrbs />
      </Canvas>
    </div>
  );
}

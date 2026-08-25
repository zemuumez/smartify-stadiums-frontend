"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

function PitchModel() {
  const groupRef = useRef<THREE.Group>(null);
  const ballRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.2) * 0.15 + 0.1;
      groupRef.current.rotation.x = 0.55 + Math.sin(t * 0.15) * 0.05;
    }
    if (ballRef.current) {
      ballRef.current.position.x = Math.sin(t * 1.2) * 2.2;
      ballRef.current.position.z = Math.cos(t * 0.9) * 1.4;
      ballRef.current.position.y = 0.12 + Math.abs(Math.sin(t * 3)) * 0.25;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
      <group ref={groupRef} position={[0, -0.2, 0]}>
        {/* Pitch Turf Base */}
        <mesh position={[0, -0.05, 0]}>
          <boxGeometry args={[6.4, 0.1, 4.2]} />
          <meshStandardMaterial color="#1a4731" roughness={0.7} metalness={0.1} />
        </mesh>

        {/* Outer Boundary Line */}
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[6.0, 3.8]} />
          <meshBasicMaterial color="#2d6a4f" wireframe />
        </mesh>

        {/* Center Circle */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.7, 0.73, 32]} />
          <meshBasicMaterial color="#74c69d" transparent opacity={0.8} />
        </mesh>

        {/* Center Line */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.03, 3.8]} />
          <meshBasicMaterial color="#74c69d" transparent opacity={0.8} />
        </mesh>

        {/* Left Penalty Box */}
        <mesh position={[-2.3, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.4, 2.2]} />
          <meshBasicMaterial color="#52b788" wireframe />
        </mesh>

        {/* Right Penalty Box */}
        <mesh position={[2.3, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.4, 2.2]} />
          <meshBasicMaterial color="#52b788" wireframe />
        </mesh>

        {/* Animated Moving Ball */}
        <mesh ref={ballRef} position={[0, 0.15, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#ffffff" emissive="#74c69d" emissiveIntensity={0.4} />
        </mesh>

        {/* Camera Tracking Beams */}
        <mesh position={[-2.8, 1.2, -1.8]}>
          <coneGeometry args={[0.15, 0.4, 8]} />
          <meshStandardMaterial color="#52b788" />
        </mesh>
        <mesh position={[2.8, 1.2, 1.8]}>
          <coneGeometry args={[0.15, 0.4, 8]} />
          <meshStandardMaterial color="#52b788" />
        </mesh>
      </group>
    </Float>
  );
}

export default function SmartPitch3D({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full h-full relative ${className}`}>
      <Canvas
        camera={{ position: [0, 3.5, 5.5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} />
        <pointLight position={[-4, 4, -4]} color="#74c69d" intensity={0.8} />
        <PitchModel />
      </Canvas>
    </div>
  );
}

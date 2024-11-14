// components/FlowParticles.tsx
import React from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const FlowParticles: React.FC = () => {
  const particles = [];
  for (let i = 0; i < 100; i++) {
    particles.push({
      position: new THREE.Vector3(
        Math.random() * 10 - 5,
        Math.random() * 5 - 2.5,
        Math.random() * 5 - 2.5
      ),
      velocity: new THREE.Vector3(Math.random() * 0.02, 0, 0),
    });
  }

  useFrame(() => {
    particles.forEach((particle) => {
      particle.position.add(particle.velocity);
      if (particle.position.x > 5) particle.position.x = -5;
    });
  });

  return (
    <>
      {particles.map((particle, index) => (
        <mesh position={particle.position} key={index}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="aqua" />
        </mesh>
      ))}
    </>
  );
};

export default FlowParticles;

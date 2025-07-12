"use client";

import { Canvas } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

type ARDistanceIndicatorProps = {
  distance: number;
};

export default function ARDistanceIndicator({
  distance,
}: ARDistanceIndicatorProps) {
  return (
    <div className="absolute top-20 left-0 right-0 flex justify-center pointer-events-none z-10">
      <Canvas className="w-32 h-16">
        <ambientLight intensity={0.5} />
        <group position={[0, 0, 0]}>
          <mesh position={[0, 0, -1]}>
            <planeGeometry args={[3, 1]} />
            <meshBasicMaterial
              color="black"
              transparent
              opacity={0.7}
              side={THREE.DoubleSide}
            />
          </mesh>
          <Text
            position={[0, 0, 0]}
            fontSize={0.4}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {distance > 0 ? `${distance}m` : "Arrived!"}
          </Text>
        </group>
      </Canvas>
    </div>
  );
}

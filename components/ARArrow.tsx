"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";

type ARArrowProps = {
  direction: "left" | "right" | "straight";
};

export default function ARArrow({ direction }: ARArrowProps) {
  const rotationY =
    direction === "left"
      ? Math.PI / 4
      : direction === "right"
      ? -Math.PI / 4
      : 0;

  return (
    <div className="absolute top-16 right-4 w-32 h-32 z-10">
      <Canvas>
        <ambientLight intensity={1} />
        <directionalLight position={[10, 10, 10]} />
        <mesh rotation={[Math.PI / 2, rotationY, 0]}>
          <coneGeometry args={[0.5, 2, 8]} />
          <meshStandardMaterial color="red" />
        </mesh>
        <OrbitControls enabled={false} />
        <Environment preset="sunset" />
      </Canvas>
    </div>
  );
}

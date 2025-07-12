"use client";

import { Canvas } from "@react-three/fiber";
import { useFrame } from "@react-three/fiber";
import { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";

type ARArrowProps = {
  direction: "left" | "right" | "straight";
};

export default function ARArrow({ direction }: ARArrowProps) {
  const arrowRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [orientation, setOrientation] = useState({
    gamma: 0,
    beta: 0,
    hasPermission: false,
  });

  // Request device orientation permission
  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      setOrientation((prev) => ({
        ...prev,
        gamma: event.gamma || 0,
        beta: event.beta || 0,
      }));
    };

    const requestPermission = async () => {
      if (
        typeof DeviceOrientationEvent !== "undefined" &&
        // @ts-ignore
        typeof DeviceOrientationEvent.requestPermission === "function"
      ) {
        try {
          // @ts-ignore
          const permission = await DeviceOrientationEvent.requestPermission();
          if (permission === "granted") {
            window.addEventListener("deviceorientation", handleOrientation);
            setOrientation((prev) => ({ ...prev, hasPermission: true }));
          }
        } catch (error) {
          console.error("Device orientation permission denied:", error);
        }
      } else {
        // Non-iOS devices
        window.addEventListener("deviceorientation", handleOrientation);
        setOrientation((prev) => ({ ...prev, hasPermission: true }));
      }
    };

    requestPermission();

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, []);

  // Make the arrow pulse and rotate based on device orientation
  useFrame(({ clock }) => {
    if (arrowRef.current) {
      // Pulsing effect
      const scale = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.2;
      arrowRef.current.scale.set(scale, scale, scale);

      // Color pulse effect
      const intensity = 0.5 + Math.sin(clock.getElapsedTime() * 3) * 0.3;
      if (arrowRef.current.material instanceof THREE.MeshStandardMaterial) {
        arrowRef.current.material.emissiveIntensity = intensity;
      }
    }

    // Apply device orientation
    if (groupRef.current && orientation.hasPermission) {
      // Adjust rotation based on device tilt
      const rotationY =
        direction === "left"
          ? Math.PI / 4 + ((orientation.gamma * Math.PI) / 180) * 0.3
          : direction === "right"
          ? -Math.PI / 4 + ((orientation.gamma * Math.PI) / 180) * 0.3
          : ((orientation.gamma * Math.PI) / 180) * 0.3;

      groupRef.current.rotation.set(
        -Math.PI / 2 + ((orientation.beta * Math.PI) / 180) * 0.1,
        rotationY,
        0
      );
    }
  });

  return (
    <div className="absolute bottom-[20%] w-full h-1/3 flex items-center justify-center pointer-events-none z-10">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        className="w-full h-full"
      >
        <ambientLight intensity={1} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <group ref={groupRef} position={[0, 0, 0]}>
          <mesh ref={arrowRef}>
            <coneGeometry args={[0.7, 2.5, 32]} />
            <meshStandardMaterial
              color="#FF3B30"
              emissive="#FF3B30"
              emissiveIntensity={0.5}
              transparent={true}
              opacity={0.95}
            />
          </mesh>

          {/* Direction text */}
          {direction !== "straight" && (
            <Text
              position={[0, -1.5, 0]}
              fontSize={0.8}
              color="white"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.1}
              outlineColor="#000"
            >
              {direction === "left" ? "TURN LEFT" : "TURN RIGHT"}
            </Text>
          )}

          {/* Distance indicator ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.2, 1.3, 32]} />
            <meshBasicMaterial
              color="white"
              transparent
              opacity={0.7}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      </Canvas>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Box } from "@react-three/drei";
import * as THREE from "three";

// 👇👇 This is your video background logic
function VideoBackground() {
  const [videoTexture, setVideoTexture] = useState<THREE.VideoTexture | null>(
    null
  );
  const { scene } = useThree();

  useEffect(() => {
    const video = document.createElement("video");
    video.autoplay = true;
    video.muted = true;
    video.loop = true;

    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      video.srcObject = stream;
      video.play();

      const texture = new THREE.VideoTexture(video);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.format = THREE.RGBFormat;
      setVideoTexture(texture);

      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(16, 9),
        new THREE.MeshBasicMaterial({ map: texture })
      );
      plane.scale.set(1.5, 1.5, 1);
      plane.position.z = -5;
      scene.add(plane);
    });

    return () => {
      // cleanup
      if (video && video.srcObject) {
        const tracks = (video.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [scene]);

  return null;
}

// 👇 This is your main AR scene container
export default function ARCanvas() {
  return (
    <div className="w-full h-screen">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <VideoBackground />

        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} />

        <Box position={[0, 0, 0]}>
          <meshStandardMaterial color="red" />
        </Box>

        <OrbitControls />
      </Canvas>
    </div>
  );
}

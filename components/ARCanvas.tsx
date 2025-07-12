"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function ARCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isARSessionActive, setIsARSessionActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isARSupported, setIsARSupported] = useState<boolean | null>(null);

  // Check AR support on component mount
  useEffect(() => {
    const checkARSupport = async () => {
      try {
        if (!navigator.xr) {
          setIsARSupported(false);
          return;
        }
        const supported = await navigator.xr.isSessionSupported("immersive-ar");
        setIsARSupported(supported);
      } catch (err) {
        setIsARSupported(false);
      }
    };
    checkARSupport();
  }, []);

  const startCameraPreview = async () => {
    if (!containerRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      // Create Three.js scene for camera preview
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );

      // Create renderer
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
      renderer.setPixelRatio(window.devicePixelRatio);
      containerRef.current.appendChild(renderer.domElement);

      // Add lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(0, 10, 5);
      scene.add(directionalLight);

      // Add a test cube
      const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
      const material = new THREE.MeshStandardMaterial({
        color: 0x04b7cf,
        metalness: 0.3,
        roughness: 0.4,
      });
      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(0, 0, -2);
      scene.add(cube);

      // Add floating text (using a simple cube as placeholder for text)
      const textGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
      const textMaterial = new THREE.MeshStandardMaterial({
        color: 0x04cf84,
        metalness: 0.2,
        roughness: 0.6,
      });
      const textCube = new THREE.Mesh(textGeometry, textMaterial);
      textCube.position.set(0, 1, -2);
      scene.add(textCube);

      // Animation loop
      const animate = () => {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        textCube.rotation.y -= 0.01;
        renderer.render(scene, camera);
      };

      renderer.setAnimationLoop(animate);

      setIsARSessionActive(true);
      setIsLoading(false);

      // Store renderer reference for cleanup
      (containerRef.current as any).renderer = renderer;
    } catch (err) {
      console.error("Camera Preview Error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to start camera preview"
      );
      setIsLoading(false);
    }
  };

  const startARSession = async () => {
    if (!containerRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      // Check if WebXR AR is supported
      if (!navigator.xr) {
        throw new Error("WebXR not supported in this browser");
      }

      const isARSupported = await navigator.xr.isSessionSupported(
        "immersive-ar"
      );
      if (!isARSupported) {
        // Fallback to camera preview
        console.log("AR not supported, falling back to camera preview");
        await startCameraPreview();
        return;
      }

      // Create Three.js scene
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );

      // Create renderer
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.xr.enabled = true;
      containerRef.current.appendChild(renderer.domElement);

      // Add lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(0, 10, 5);
      scene.add(directionalLight);

      // Add a test cube
      const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
      const material = new THREE.MeshStandardMaterial({
        color: 0x04b7cf,
        metalness: 0.3,
        roughness: 0.4,
      });
      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(0, 0, -2);
      scene.add(cube);

      // Add floating text (using a simple cube as placeholder for text)
      const textGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
      const textMaterial = new THREE.MeshStandardMaterial({
        color: 0x04cf84,
        metalness: 0.2,
        roughness: 0.6,
      });
      const textCube = new THREE.Mesh(textGeometry, textMaterial);
      textCube.position.set(0, 1, -2);
      scene.add(textCube);

      // Animation loop
      const animate = () => {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        textCube.rotation.y -= 0.01;
        renderer.render(scene, camera);
      };

      renderer.setAnimationLoop(animate);

      // Start AR session
      const session = await navigator.xr.requestSession("immersive-ar", {
        requiredFeatures: ["hit-test", "dom-overlay"],
        domOverlay: { root: containerRef.current },
      });

      session.addEventListener("end", () => {
        setIsARSessionActive(false);
        renderer.setAnimationLoop(null);
        if (containerRef.current && renderer.domElement) {
          containerRef.current.removeChild(renderer.domElement);
        }
        renderer.dispose();
      });

      // Set up AR session
      await renderer.xr.setReferenceSpaceType("local");
      await renderer.xr.setSession(session);

      setIsARSessionActive(true);
      setIsLoading(false);
    } catch (err) {
      console.error("AR Session Error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to start AR session"
      );
      setIsLoading(false);
    }
  };

  const stopARSession = () => {
    setIsARSessionActive(false);

    // Clean up renderer
    if (containerRef.current && (containerRef.current as any).renderer) {
      const renderer = (containerRef.current as any).renderer;
      renderer.setAnimationLoop(null);
      if (renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      (containerRef.current as any).renderer = null;
    }
  };

  return (
    <div className="w-full h-screen bg-gray-900 flex flex-col items-center justify-center">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">AR Demo</h1>
        <p className="text-gray-300 mb-6">
          Experience augmented reality on your device
        </p>

        {isARSupported === false && (
          <div className="mb-4 p-3 bg-yellow-500 text-black rounded-lg">
            <p className="font-semibold">⚠️ AR Not Supported</p>
            <p className="text-sm">
              Your device doesn't support WebXR AR. You'll see a 3D preview
              instead.
            </p>
          </div>
        )}

        {!isARSessionActive ? (
          <button
            onClick={startARSession}
            disabled={isLoading}
            className="bg-gradient-to-r from-[#04b7cf] to-[#04cf84] text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Starting..." : "Start AR Experience"}
          </button>
        ) : (
          <button
            onClick={stopARSession}
            className="bg-red-500 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Stop Session
          </button>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-500 text-white rounded-lg">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}
      </div>

      <div
        ref={containerRef}
        className="w-1/2 h-1/2 border-2 border-dashed border-gray-600 rounded-lg overflow-hidden"
        style={{ minHeight: "300px" }}
      >
        {!isARSessionActive && (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-6xl mb-4">📱</div>
              <p>3D view will appear here</p>
              {isARSupported === false && (
                <p className="text-xs mt-2">Camera preview mode</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 text-center text-gray-400 text-sm">
        <p>Make sure to allow camera permissions when prompted</p>
        {isARSupported === true && (
          <p>Point your device at a flat surface to place AR objects</p>
        )}
        {isARSupported === false && (
          <p>You'll see a 3D preview with animated objects</p>
        )}
      </div>
    </div>
  );
}

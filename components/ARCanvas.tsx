"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { NAVIGATION_PATH, NavigationStep } from "@/data/navigationData";

export default function ARCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isARSessionActive, setIsARSessionActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isARSupported, setIsARSupported] = useState<boolean | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);

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

  const createDirectionalArrow = (
    direction: string,
    color: number = 0x04b7cf,
    size: number = 1
  ) => {
    const arrowGroup = new THREE.Group();

    // Create arrow shaft
    const shaftGeometry = new THREE.CylinderGeometry(
      0.03 * size,
      0.03 * size,
      0.8 * size,
      8
    );
    const shaftMaterial = new THREE.MeshStandardMaterial({ color });
    const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
    shaft.position.y = 0.4 * size;
    arrowGroup.add(shaft);

    // Create arrow head
    const headGeometry = new THREE.ConeGeometry(0.1 * size, 0.25 * size, 8);
    const headMaterial = new THREE.MeshStandardMaterial({ color });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 0.9 * size;
    arrowGroup.add(head);

    // Rotate based on direction
    switch (direction) {
      case "right":
        arrowGroup.rotation.y = -Math.PI / 2;
        break;
      case "left":
        arrowGroup.rotation.y = Math.PI / 2;
        break;
      case "backward":
        arrowGroup.rotation.y = Math.PI;
        break;
      default: // forward
        arrowGroup.rotation.y = 0;
    }

    return arrowGroup;
  };

  const createMultipleArrows = (direction: string, count: number = 1) => {
    const arrowsGroup = new THREE.Group();

    for (let i = 0; i < count; i++) {
      const arrow = createDirectionalArrow(direction, 0x04b7cf, 1);
      arrow.position.set(i * 0.3, 0, -i * 0.2); // Stagger arrows
      arrowsGroup.add(arrow);
    }

    return arrowsGroup;
  };

  const createPathIndicator = (direction: string) => {
    const pathGroup = new THREE.Group();

    // Create path line
    const lineGeometry = new THREE.CylinderGeometry(0.02, 0.02, 2, 8);
    const lineMaterial = new THREE.MeshStandardMaterial({ color: 0x04cf84 });
    const line = new THREE.Mesh(lineGeometry, lineMaterial);
    line.rotation.x = Math.PI / 2;
    line.position.z = -1;
    pathGroup.add(line);

    // Add dots along the path
    for (let i = 0; i < 5; i++) {
      const dotGeometry = new THREE.SphereGeometry(0.05, 8, 8);
      const dotMaterial = new THREE.MeshStandardMaterial({ color: 0x04cf84 });
      const dot = new THREE.Mesh(dotGeometry, dotMaterial);
      dot.position.set(0, 0.1, -0.5 - i * 0.3);
      pathGroup.add(dot);
    }

    return pathGroup;
  };

  const createDistanceIndicator = (distance: number) => {
    const group = new THREE.Group();

    // Create distance text (simplified as a cube for now)
    const textGeometry = new THREE.BoxGeometry(0.2, 0.08, 0.08);
    const textMaterial = new THREE.MeshStandardMaterial({ color: 0x04cf84 });
    const textCube = new THREE.Mesh(textGeometry, textMaterial);
    textCube.position.set(0, 1.2, 0);
    group.add(textCube);

    // Add distance rings (smaller for 1 meter)
    for (let i = 1; i <= Math.min(distance, 3); i++) {
      const ringGeometry = new THREE.RingGeometry(
        i * 0.15,
        i * 0.15 + 0.03,
        16
      );
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0x04b7cf,
        transparent: true,
        opacity: 0.4,
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.05;
      group.add(ring);
    }

    return group;
  };

  const createStepIndicator = (step: number, totalSteps: number) => {
    const group = new THREE.Group();

    // Create step counter
    const counterGeometry = new THREE.BoxGeometry(0.3, 0.1, 0.05);
    const counterMaterial = new THREE.MeshStandardMaterial({ color: 0x04b7cf });
    const counter = new THREE.Mesh(counterGeometry, counterMaterial);
    counter.position.set(0, 1.8, 0);
    group.add(counter);

    return group;
  };

  const startCameraPreview = async () => {
    if (!containerRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
      renderer.setPixelRatio(window.devicePixelRatio);
      containerRef.current.appendChild(renderer.domElement);

      // Add lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
      directionalLight.position.set(0, 10, 5);
      scene.add(directionalLight);

      // Add navigation elements
      const currentPathStep = NAVIGATION_PATH[currentStep];

      // Add multiple arrows
      if (currentPathStep.arrowCount && currentPathStep.arrowCount > 0) {
        const arrows = createMultipleArrows(
          currentPathStep.direction,
          currentPathStep.arrowCount
        );
        arrows.position.set(0, 0, -3);
        scene.add(arrows);
      }

      // Add path indicator for forward movements
      if (
        currentPathStep.direction === "forward" &&
        currentPathStep.distance > 0
      ) {
        const pathIndicator = createPathIndicator(currentPathStep.direction);
        pathIndicator.position.set(0, 0, -2);
        scene.add(pathIndicator);
      }

      // Add distance indicator
      if (currentPathStep.distance > 0) {
        const distanceIndicator = createDistanceIndicator(
          currentPathStep.distance
        );
        distanceIndicator.position.set(0, 0, -1.5);
        scene.add(distanceIndicator);
      }

      // Add step indicator
      const stepIndicator = createStepIndicator(
        currentStep + 1,
        NAVIGATION_PATH.length
      );
      stepIndicator.position.set(0, 0, -4);
      scene.add(stepIndicator);

      // Animation loop
      const animate = () => {
        // Animate arrows
        scene.children.forEach((child) => {
          if (child.type === "Group") {
            child.rotation.y += 0.005;
          }
        });
        renderer.render(scene, camera);
      };

      renderer.setAnimationLoop(animate);
      setIsARSessionActive(true);
      setIsLoading(false);
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
      if (!navigator.xr) {
        throw new Error("WebXR not supported in this browser");
      }

      const isARSupported = await navigator.xr.isSessionSupported(
        "immersive-ar"
      );
      if (!isARSupported) {
        console.log("AR not supported, falling back to camera preview");
        await startCameraPreview();
        return;
      }

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.xr.enabled = true;
      containerRef.current.appendChild(renderer.domElement);

      // Add lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
      directionalLight.position.set(0, 10, 5);
      scene.add(directionalLight);

      // Add navigation elements
      const currentPathStep = NAVIGATION_PATH[currentStep];

      // Add multiple arrows
      if (currentPathStep.arrowCount && currentPathStep.arrowCount > 0) {
        const arrows = createMultipleArrows(
          currentPathStep.direction,
          currentPathStep.arrowCount
        );
        arrows.position.set(0, 0, -3);
        scene.add(arrows);
      }

      // Add path indicator for forward movements
      if (
        currentPathStep.direction === "forward" &&
        currentPathStep.distance > 0
      ) {
        const pathIndicator = createPathIndicator(currentPathStep.direction);
        pathIndicator.position.set(0, 0, -2);
        scene.add(pathIndicator);
      }

      // Add distance indicator
      if (currentPathStep.distance > 0) {
        const distanceIndicator = createDistanceIndicator(
          currentPathStep.distance
        );
        distanceIndicator.position.set(0, 0, -1.5);
        scene.add(distanceIndicator);
      }

      // Add step indicator
      const stepIndicator = createStepIndicator(
        currentStep + 1,
        NAVIGATION_PATH.length
      );
      stepIndicator.position.set(0, 0, -4);
      scene.add(stepIndicator);

      // Animation loop
      const animate = () => {
        // Animate arrows
        scene.children.forEach((child) => {
          if (child.type === "Group") {
            child.rotation.y += 0.005;
          }
        });
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

  const nextStep = () => {
    if (currentStep < NAVIGATION_PATH.length - 1) {
      setCurrentStep(currentStep + 1);
      if (isARSessionActive) {
        // Restart session to update the navigation elements
        stopARSession();
        setTimeout(() => startARSession(), 100);
      }
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      if (isARSessionActive) {
        stopARSession();
        setTimeout(() => startARSession(), 100);
      }
    }
  };

  const currentPathStep = NAVIGATION_PATH[currentStep];

  return (
    <div className="w-full h-screen bg-gray-900 flex flex-col items-center justify-center">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">
          🧭 AR Navigation Demo
        </h1>
        <p className="text-gray-300 mb-6">
          Follow the arrows to complete the demo!
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
            {isLoading ? "Starting..." : "🚀 Start AR Demo"}
          </button>
        ) : (
          <button
            onClick={stopARSession}
            className="bg-red-500 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            ⏹️ Stop Demo
          </button>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-500 text-white rounded-lg">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      {isARSessionActive && (
        <div className="mb-4 p-4 bg-gray-800 rounded-lg max-w-md mx-auto">
          <div className="text-center text-white mb-2">
            <span className="text-sm text-gray-400">
              Step {currentStep + 1} of {NAVIGATION_PATH.length}
            </span>
          </div>
          <div className="text-center text-white mb-4">
            <h3 className="text-xl font-bold text-[#04b7cf]">
              {currentPathStep.instruction}
            </h3>
            <p className="text-sm text-gray-300 mt-2">
              {currentPathStep.direction === "arrived"
                ? "🎉 Demo completed successfully!"
                : `${currentPathStep.direction === "forward" ? "👟" : "🔄"} ${
                    currentPathStep.direction === "forward" ? "Walk" : "Turn"
                  } ${currentPathStep.direction}${
                    currentPathStep.distance > 0
                      ? ` (${currentPathStep.distance} step)`
                      : ""
                  }`}
            </p>
            {currentPathStep.description && (
              <p className="text-xs text-gray-400 mt-2">
                {currentPathStep.description}
              </p>
            )}
          </div>
          <div className="flex justify-center gap-4">
            <button
              onClick={previousStep}
              disabled={currentStep === 0}
              className="bg-gray-600 text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-gray-700 transition-colors"
            >
              ⬅️ Previous
            </button>
            <button
              onClick={nextStep}
              disabled={currentStep === NAVIGATION_PATH.length - 1}
              className="bg-[#04b7cf] text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-[#0399b0] transition-colors"
            >
              Next ➡️
            </button>
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        className="w-1/2 h-1/2 border-2 border-dashed border-gray-600 rounded-lg overflow-hidden"
        style={{ minHeight: "300px" }}
      >
        {!isARSessionActive && (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-6xl mb-4">🧭</div>
              <p className="text-lg font-semibold">AR Navigation Demo</p>
              <p className="text-sm mt-2">
                Follow the arrows to complete the demo
              </p>
              {isARSupported === false && (
                <p className="text-xs mt-2 text-yellow-400">3D preview mode</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 text-center text-gray-400 text-sm">
        <p>🎯 Follow the directional arrows in AR</p>
        <p>📱 Use the navigation controls to change steps</p>
        <p>✨ Perfect for hackathon demos!</p>
      </div>
    </div>
  );
}

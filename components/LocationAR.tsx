"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

// Navigation steps
const NAVIGATION_STEPS = [
  {
    id: 1,
    instruction: "Walk Straight",
    direction: "forward",
    arrowRotation: 0,
  },
  {
    id: 2,
    instruction: "Turn Right",
    direction: "right",
    arrowRotation: Math.PI / 2,
  },
  {
    id: 3,
    instruction: "Walk Forward",
    direction: "forward",
    arrowRotation: 0,
  },
  {
    id: 4,
    instruction: "Turn Left",
    direction: "left",
    arrowRotation: -Math.PI / 2,
  },
  {
    id: 5,
    instruction: "Destination Reached!",
    direction: "arrived",
    arrowRotation: 0,
  },
];

export default function LocationAR() {
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationRef = useRef<number | null>(null);
  const arrowRef = useRef<THREE.Group | null>(null);
  const boardsRef = useRef<THREE.Group | null>(null);

  // Initialize Three.js scene
  const initThreeJS = () => {
    if (!canvasRef.current) return;

    // Create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Create camera - positioned to view fixed world objects
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    // Position camera to look at fixed world objects
    camera.position.set(0, 1.5, 8);
    camera.lookAt(0, 1.5, 0);
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // Transparent background
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Add directional light with shadows
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Create 3D boards group - FIXED WORLD POSITIONS
    const boardsGroup = new THREE.Group();
    boardsGroup.position.set(0, 0, 0); // Fixed world origin
    boardsRef.current = boardsGroup;
    scene.add(boardsGroup);

    // Create Dairy Section Board - FIXED POSITION
    const dairyBoardGeometry = new THREE.BoxGeometry(4, 3, 0.2);
    const dairyBoardMaterial = new THREE.MeshPhongMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.9,
      emissive: 0xffd700,
      emissiveIntensity: 0.2,
    });
    const dairyBoard = new THREE.Mesh(dairyBoardGeometry, dairyBoardMaterial);
    dairyBoard.position.set(-8, 2, -5); // Fixed world position
    dairyBoard.castShadow = true;
    dairyBoard.receiveShadow = true;
    boardsGroup.add(dairyBoard);

    // Add text to dairy board
    const dairyTextGeometry = new THREE.PlaneGeometry(3.5, 2);
    const dairyTextMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.9,
    });
    const dairyText = new THREE.Mesh(dairyTextGeometry, dairyTextMaterial);
    dairyText.position.set(0, 0, 0.12);
    dairyBoard.add(dairyText);

    // Create Personal Care Section Board - FIXED POSITION
    const personalCareBoardGeometry = new THREE.BoxGeometry(4, 3, 0.2);
    const personalCareBoardMaterial = new THREE.MeshPhongMaterial({
      color: 0xff69b4,
      transparent: true,
      opacity: 0.9,
      emissive: 0xff69b4,
      emissiveIntensity: 0.2,
    });
    const personalCareBoard = new THREE.Mesh(
      personalCareBoardGeometry,
      personalCareBoardMaterial
    );
    personalCareBoard.position.set(8, 2, -5); // Fixed world position
    personalCareBoard.castShadow = true;
    personalCareBoard.receiveShadow = true;
    boardsGroup.add(personalCareBoard);

    // Add text to personal care board
    const personalCareTextGeometry = new THREE.PlaneGeometry(3.5, 2);
    const personalCareTextMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
    });
    const personalCareText = new THREE.Mesh(
      personalCareTextGeometry,
      personalCareTextMaterial
    );
    personalCareText.position.set(0, 0, 0.12);
    personalCareBoard.add(personalCareText);

    // Create 3D arrow group - FIXED WORLD POSITION
    const arrowGroup = new THREE.Group();
    arrowGroup.position.set(0, 1.5, -3); // Fixed world position
    arrowRef.current = arrowGroup;
    scene.add(arrowGroup);

    // Create arrow cone
    const arrowGeometry = new THREE.ConeGeometry(0.5, 2, 8);
    const arrowMaterial = new THREE.MeshPhongMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.9,
      emissive: 0x00ffff,
      emissiveIntensity: 0.5,
    });
    const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
    arrow.position.set(0, 0, 0);
    arrow.rotation.x = -Math.PI / 2; // Point forward
    arrow.castShadow = true;
    arrowGroup.add(arrow);

    // Create arrow glow sphere
    const glowGeometry = new THREE.SphereGeometry(0.8, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.3,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    arrowGroup.add(glow);

    // Create directional rings
    const ringGeometry1 = new THREE.RingGeometry(1.2, 1.8, 32);
    const ringMaterial1 = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
    });
    const ring1 = new THREE.Mesh(ringGeometry1, ringMaterial1);
    ring1.position.set(0, 0, 0);
    ring1.rotation.x = -Math.PI / 2;
    arrowGroup.add(ring1);

    const ringGeometry2 = new THREE.RingGeometry(1.0, 1.4, 32);
    const ringMaterial2 = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    });
    const ring2 = new THREE.Mesh(ringGeometry2, ringMaterial2);
    ring2.position.set(0, 0, 0);
    ring2.rotation.x = -Math.PI / 2;
    arrowGroup.add(ring2);

    // Ground plane for reference - FIXED WORLD POSITION
    const groundGeometry = new THREE.PlaneGeometry(30, 30);
    const groundMaterial = new THREE.MeshBasicMaterial({
      color: 0xcccccc,
      transparent: true,
      opacity: 0.1,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1;
    ground.receiveShadow = true;
    scene.add(ground);

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      const time = Date.now() * 0.001;

      // Animate boards floating - but keep them in fixed world positions
      if (boardsGroup) {
        boardsGroup.children.forEach((board, index) => {
          // Only animate Y position (floating), keep X and Z fixed
          const baseY = board === dairyBoard ? 2 : 2;
          board.position.y = baseY + Math.sin(time + index * Math.PI) * 0.5;
          board.rotation.y = Math.sin(time * 0.5) * 0.1;
        });
      }

      // Animate arrow - but keep it in fixed world position
      if (arrowGroup) {
        arrowGroup.rotation.y = NAVIGATION_STEPS[currentStep].arrowRotation;
        // Only animate Y position (floating), keep X and Z fixed
        arrowGroup.position.y = 1.5 + Math.sin(time * 2) * 0.3;

        // Scale arrow based on step (simulate proximity)
        const scale = 1 + currentStep * 0.2;
        arrowGroup.scale.set(scale, scale, scale);
      }

      // Animate rings
      if (arrowGroup) {
        arrowGroup.children.forEach((child, index) => {
          if (
            child instanceof THREE.Mesh &&
            child.geometry instanceof THREE.RingGeometry
          ) {
            child.scale.setScalar(1 + Math.sin(time * 2 + index) * 0.3);
          }
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener("resize", handleResize);
  };

  // Cleanup Three.js
  const cleanupThreeJS = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (rendererRef.current) {
      rendererRef.current.dispose();
    }
  };

  // Effect to handle video stream when cameraStream changes
  useEffect(() => {
    if (cameraStream && videoRef.current) {
      console.log("Setting video srcObject");
      videoRef.current.srcObject = cameraStream;

      videoRef.current.onloadedmetadata = () => {
        console.log("Video metadata loaded");
        if (videoRef.current) {
          videoRef.current
            .play()
            .then(() => {
              console.log("Video playing successfully");
            })
            .catch((err) => {
              console.error("Error playing video:", err);
              setError("Failed to play video stream");
            });
        }
      };

      videoRef.current.oncanplay = () => {
        console.log("Video can play");
      };

      videoRef.current.onerror = (e) => {
        console.error("Video error:", e);
        setError("Video stream error occurred");
      };
    }
  }, [cameraStream]);

  // Initialize Three.js when camera starts
  useEffect(() => {
    if (showCamera && canvasRef.current) {
      initThreeJS();
    }
    return () => {
      cleanupThreeJS();
    };
  }, [showCamera, currentStep]);

  const startCamera = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera access not supported");
      }

      // Try to get camera stream with environment-facing camera first
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment", // Use back camera
            width: { ideal: 1920, min: 1280 },
            height: { ideal: 1080, min: 720 },
          },
          audio: false,
        });
      } catch (err) {
        console.log("Environment camera failed, trying user-facing camera");
        // Fallback to user-facing camera if environment camera fails
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user", // Use front camera as fallback
            width: { ideal: 1920, min: 1280 },
            height: { ideal: 1080, min: 720 },
          },
          audio: false,
        });
      }

      console.log("Camera stream obtained:", stream);
      setCameraStream(stream);
      setShowCamera(true);
      setIsLoading(false);
    } catch (err: any) {
      console.error("Error accessing camera:", err);

      // Provide specific error messages based on error type
      if (err.name === "NotAllowedError") {
        setError(
          "Camera access denied. Please allow camera permissions and try again."
        );
      } else if (err.name === "NotFoundError") {
        setError("No camera found on this device.");
      } else if (err.name === "NotSupportedError") {
        setError("Camera not supported on this device.");
      } else {
        setError(`Camera error: ${err.message || "Unknown error"}`);
      }
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => {
        track.stop();
        console.log("Camera track stopped:", track.kind);
      });
      setCameraStream(null);
      setShowCamera(false);
      console.log("Camera stopped");
    }
    cleanupThreeJS();
  };

  const nextStep = () => {
    if (currentStep < NAVIGATION_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentNavigationStep = NAVIGATION_STEPS[currentStep];

  return (
    <div className="w-full h-screen bg-black">
      {showCamera && cameraStream ? (
        <div className="relative w-full h-full">
          {/* Camera Video Background */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 1,
              backgroundColor: "black",
            }}
          />

          {/* Three.js Canvas for 3D AR Objects */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{
              zIndex: 10,
              pointerEvents: "none",
            }}
          />

          {/* Navigation Instructions Overlay */}
          <div className="absolute top-6 left-6 right-6 z-20">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-4 rounded-2xl shadow-2xl border-2 border-cyan-300">
              <h2 className="text-xl font-black mb-2">🧭 3D AR Navigation</h2>
              <p className="text-lg font-bold">
                Step {currentStep + 1} of {NAVIGATION_STEPS.length}:{" "}
                {currentNavigationStep.instruction}
              </p>
              <p className="text-sm opacity-80">
                Direction: {currentNavigationStep.direction}
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="absolute bottom-6 left-6 z-20">
            <div className="flex gap-2">
              <button
                onClick={previousStep}
                disabled={currentStep === 0}
                className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-2 rounded-full font-bold shadow-lg border-2 border-gray-400 disabled:opacity-50 hover:from-gray-700 hover:to-gray-800 transition-all duration-300"
              >
                ⬅️ Previous
              </button>
              <button
                onClick={nextStep}
                disabled={currentStep === NAVIGATION_STEPS.length - 1}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full font-bold shadow-lg border-2 border-green-400 disabled:opacity-50 hover:from-green-600 hover:to-emerald-600 transition-all duration-300"
              >
                Next ➡️
              </button>
            </div>
          </div>

          {/* AR Status Indicator */}
          <div className="absolute top-6 right-6 z-20">
            <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-4 py-2 rounded-full font-black text-sm shadow-lg border-2 border-green-300">
              📱 3D AR ACTIVE
            </div>
          </div>

          {/* Camera Controls */}
          <div className="absolute bottom-6 right-6 z-20">
            <button
              onClick={stopCamera}
              className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full font-bold shadow-lg border-2 border-red-300 hover:from-red-600 hover:to-pink-600 transition-all duration-300"
            >
              ⏹️ STOP AR
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-8xl mb-6">📱</div>
            <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              3D AR Navigation
            </h1>
            <p className="text-xl mb-8 text-gray-300">
              Floating 3D boards and animated navigation arrows
            </p>
            <button
              onClick={startCamera}
              disabled={isLoading}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-4 rounded-full text-xl font-black hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 shadow-2xl border-2 border-cyan-300"
              style={{
                boxShadow: "0 10px 25px rgba(34, 211, 238, 0.4)",
              }}
            >
              {isLoading ? "Starting Camera..." : "📷 START 3D AR"}
            </button>

            {error && (
              <div className="mt-6 bg-gradient-to-r from-red-500 to-pink-500 text-white p-4 rounded-xl max-w-md mx-auto shadow-xl border-2 border-red-300">
                <p className="font-black">Error:</p>
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

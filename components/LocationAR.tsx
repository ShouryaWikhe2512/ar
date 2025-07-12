"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function LocationAR() {
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationRef = useRef<number | null>(null);

  // Initialize Three.js scene
  const initThreeJS = () => {
    if (!canvasRef.current) return;

    // Create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // Transparent background
    rendererRef.current = renderer;

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    // Create floating arrow
    const arrowGeometry = new THREE.ConeGeometry(0.5, 2, 8);
    const arrowMaterial = new THREE.MeshPhongMaterial({
      color: 0x04b7cf,
      transparent: true,
      opacity: 0.9,
    });
    const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
    arrow.position.set(0, 0, -3);
    arrow.rotation.x = -Math.PI / 2; // Point upward
    scene.add(arrow);

    // Create floating board for Dairy Section
    const boardGeometry = new THREE.BoxGeometry(3, 2, 0.1);
    const boardMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
    });
    const dairyBoard = new THREE.Mesh(boardGeometry, boardMaterial);
    dairyBoard.position.set(-4, 0, -2);
    scene.add(dairyBoard);

    // Create floating board for Personal Care Section
    const personalCareBoard = new THREE.Mesh(boardGeometry, boardMaterial);
    personalCareBoard.position.set(4, 0, -2);
    scene.add(personalCareBoard);

    // Create text labels using HTML overlays for better text rendering
    const createTextLabel = (text: string, position: THREE.Vector3) => {
      const div = document.createElement("div");
      div.className = "ar-text-label";
      div.textContent = text;
      div.style.cssText = `
        position: absolute;
        color: black;
        background: white;
        padding: 8px 16px;
        border-radius: 8px;
        font-size: 18px;
        font-weight: bold;
        white-space: nowrap;
        z-index: 1000;
        pointer-events: none;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        border: 2px solid #04b7cf;
      `;
      document.body.appendChild(div);
      return div;
    };

    // Create text labels
    const dairyLabel = createTextLabel(
      "🥛 DAIRY SECTION",
      new THREE.Vector3(-4, 1.5, -2)
    );
    const personalCareLabel = createTextLabel(
      "🧴 PERSONAL CARE",
      new THREE.Vector3(4, 1.5, -2)
    );

    // Function to update text label positions
    const updateTextLabels = () => {
      if (dairyLabel && personalCareLabel) {
        // Position dairy label
        const dairyPos = new THREE.Vector3(-4, 1.5, -2);
        dairyPos.project(camera);
        dairyLabel.style.left =
          ((dairyPos.x + 1) * window.innerWidth) / 2 + "px";
        dairyLabel.style.top =
          ((-dairyPos.y + 1) * window.innerHeight) / 2 + "px";

        // Position personal care label
        const personalCarePos = new THREE.Vector3(4, 1.5, -2);
        personalCarePos.project(camera);
        personalCareLabel.style.left =
          ((personalCarePos.x + 1) * window.innerWidth) / 2 + "px";
        personalCareLabel.style.top =
          ((-personalCarePos.y + 1) * window.innerHeight) / 2 + "px";
      }
    };

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      // Rotate arrow
      arrow.rotation.y += 0.01;

      // Float boards up and down
      const time = Date.now() * 0.001;
      dairyBoard.position.y = Math.sin(time) * 0.5;
      personalCareBoard.position.y = Math.sin(time + Math.PI) * 0.5;

      // Update text label positions
      updateTextLabels();

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
    // Clean up text labels
    const labels = document.querySelectorAll(".ar-text-label");
    labels.forEach((label) => label.remove());
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
  }, [showCamera]);

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
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 },
          },
          audio: false,
        });
      } catch (err) {
        console.log("Environment camera failed, trying user-facing camera");
        // Fallback to user-facing camera if environment camera fails
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user", // Use front camera as fallback
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 },
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

          {/* Minimal Camera Controls */}
          <div className="absolute bottom-4 right-4 z-20">
            <button
              onClick={stopCamera}
              className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors shadow-lg"
            >
              ⏹️ Stop
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-8xl mb-6">📱</div>
            <h1 className="text-3xl font-bold mb-4">3D AR Experience</h1>
            <p className="text-lg mb-8 text-gray-300">
              Floating 3D objects in AR space
            </p>
            <button
              onClick={startCamera}
              disabled={isLoading}
              className="bg-[#04b7cf] text-white px-8 py-4 rounded-lg text-xl font-semibold hover:bg-[#0399b0] transition-colors disabled:opacity-50 shadow-lg"
            >
              {isLoading ? "Starting Camera..." : "📷 Start 3D AR"}
            </button>

            {error && (
              <div className="mt-4 bg-red-500 text-white p-3 rounded-lg max-w-md mx-auto">
                <p className="font-semibold">Error:</p>
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

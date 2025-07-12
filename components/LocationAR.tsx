"use client";

import { useEffect, useRef, useState } from "react";

export default function LocationAR() {
  const [isARReady, setIsARReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if AR.js is supported
    if (typeof window !== "undefined" && window.AFRAME) {
      setIsARReady(true);
    } else {
      setError("AR.js not loaded. Please refresh the page.");
    }

    // Get user location for GPS-based AR
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Continue without location for demo
        }
      );
    }
  }, []);

  useEffect(() => {
    if (isARReady && sceneRef.current) {
      // Initialize A-Frame scene
      const scene = sceneRef.current;

      // Add AR.js scene with GPS-based positioning
      scene.innerHTML = `
        <a-scene
          vr-mode-ui="enabled: false"
          embedded
          arjs="sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3;"
          renderer="logarithmicDepthBuffer: true;"
          vr-mode-ui="enabled: false"
        >
          <!-- Camera with GPS support -->
          <a-camera gps-camera rotation-reader></a-camera>

          <!-- Lighting -->
          <a-light type="ambient" color="#ffffff" intensity="0.6"></a-light>
          <a-light type="directional" color="#ffffff" intensity="0.8" position="0 10 5"></a-light>

          <!-- GPS-based AR Objects -->
          <a-entity gps-entity-place="latitude: ${
            userLocation?.lat || 0
          }; longitude: ${userLocation?.lng || 0}">
            
            <!-- Floating Dairy Section Board -->
            <a-box
              position="0 2 -5"
              width="4"
              height="2.5"
              depth="0.2"
              color="#ffffff"
              material="opacity: 0.95; transparent: true; roughness: 0.3; metalness: 0.1"
              animation="property: position; to: 0 2.5 -5; dur: 3000; easing: easeInOutSine; loop: true; dir: alternate"
              shadow
            >
              <a-text
                value="🥛 DAIRY SECTION"
                position="0 0 0.12"
                align="center"
                width="3.5"
                color="#000000"
                font="kelsonsans"
                font-size="0.4"
                font-weight="bold"
                baseline="center"
              ></a-text>
            </a-box>

            <!-- Floating Personal Care Section Board -->
            <a-box
              position="6 2 -3"
              width="4"
              height="2.5"
              depth="0.2"
              color="#ffffff"
              material="opacity: 0.95; transparent: true; roughness: 0.3; metalness: 0.1"
              animation="property: position; to: 6 2.5 -3; dur: 3000; easing: easeInOutSine; loop: true; dir: alternate"
              shadow
            >
              <a-text
                value="🧴 PERSONAL CARE"
                position="0 0 0.12"
                align="center"
                width="3.5"
                color="#000000"
                font="kelsonsans"
                font-size="0.4"
                font-weight="bold"
                baseline="center"
              ></a-text>
            </a-box>

            <!-- Floating Arrow Between Sections -->
            <a-cone
              position="3 1.5 -4"
              radius-bottom="0.4"
              radius-top="0"
              height="2"
              color="#04b7cf"
              material="opacity: 0.9; transparent: true; emissive: #04b7cf; emissiveIntensity: 0.3"
              rotation="0 0 -45"
              animation="property: rotation; to: 0 0 -45; dur: 2000; easing: easeInOutSine; loop: true; dir: alternate"
              shadow
            ></a-cone>

            <!-- Arrow Glow Effect -->
            <a-sphere
              position="3 1.5 -4"
              radius="0.6"
              color="#04b7cf"
              material="opacity: 0.2; transparent: true; emissive: #04b7cf; emissiveIntensity: 0.5"
              animation="property: scale; to: 1.8 1.8 1.8; dur: 1500; easing: easeInOutSine; loop: true; dir: alternate"
            ></a-sphere>

            <!-- Directional Rings -->
            <a-ring
              position="3 1.5 -4"
              radius-inner="1.0"
              radius-outer="1.5"
              color="#04cf84"
              material="opacity: 0.4; transparent: true; emissive: #04cf84; emissiveIntensity: 0.2"
              animation="property: scale; to: 1.8 1.8 1.8; dur: 2000; easing: easeInOutSine; loop: true"
            ></a-ring>

            <a-ring
              position="3 1.5 -4"
              radius-inner="1.2"
              radius-outer="1.8"
              color="#04b7cf"
              material="opacity: 0.3; transparent: true; emissive: #04b7cf; emissiveIntensity: 0.2"
              animation="property: scale; to: 1.5 1.5 1.5; dur: 2000; easing: easeInOutSine; loop: true; delay: 500"
            ></a-ring>

            <!-- Floating Navigation Text -->
            <a-text
              value="Navigate to Sections"
              position="3 3 -4"
              align="center"
              width="3"
              color="#04b7cf"
              font="kelsonsans"
              font-size="0.3"
              font-weight="bold"
              animation="property: opacity; to: 0.5; dur: 2000; easing: easeInOutSine; loop: true; dir: alternate"
            ></a-text>

          </a-entity>

          <!-- Ground Plane for Reference -->
          <a-plane
            position="0 0 -10"
            rotation="-90 0 0"
            width="20"
            height="20"
            color="#cccccc"
            material="opacity: 0.1; transparent: true"
          ></a-plane>

        </a-scene>
      `;
    }
  }, [isARReady, userLocation]);

  return (
    <div className="w-full h-screen bg-black">
      {isARReady ? (
        <div className="relative w-full h-full">
          {/* AR Scene Container */}
          <div
            ref={sceneRef}
            className="w-full h-full"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 1,
            }}
          />

          {/* AR Instructions Overlay */}
          <div className="absolute top-4 left-4 right-4 z-10">
            <div className="bg-black bg-opacity-70 text-white p-3 rounded-lg">
              <h2 className="text-lg font-bold mb-2">🧭 AR Store Navigation</h2>
              <p className="text-sm text-gray-300">
                Point your camera at the sky or open space to see floating AR
                objects
              </p>
              {userLocation && (
                <p className="text-xs text-gray-400 mt-1">
                  GPS: {userLocation.lat.toFixed(4)},{" "}
                  {userLocation.lng.toFixed(4)}
                </p>
              )}
            </div>
          </div>

          {/* AR Status Indicator */}
          <div className="absolute top-4 right-4 z-10">
            <div className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm font-bold">
              📱 AR ACTIVE
            </div>
          </div>

          {/* Instructions */}
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <div className="bg-black bg-opacity-70 text-white p-3 rounded-lg text-center">
              <p className="text-sm font-semibold">
                Move your phone to explore the AR space
              </p>
              <p className="text-xs text-gray-300 mt-1">
                Look for floating boards and animated arrow pointing to sections
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-8xl mb-6">📱</div>
            <h1 className="text-3xl font-bold mb-4">Mobile AR Experience</h1>
            <p className="text-lg mb-8 text-gray-300">
              Real 3D objects floating in the air
            </p>

            {error ? (
              <div className="bg-red-500 text-white p-4 rounded-lg max-w-md mx-auto">
                <p className="font-semibold">Error:</p>
                <p className="text-sm">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-3 bg-white text-red-500 px-4 py-2 rounded text-sm font-semibold"
                >
                  Refresh Page
                </button>
              </div>
            ) : (
              <div className="text-gray-400">
                <p>Loading AR experience...</p>
                <div className="mt-4 animate-spin w-8 h-8 border-4 border-[#04b7cf] border-t-transparent rounded-full mx-auto"></div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

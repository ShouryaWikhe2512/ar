"use client";

import { useEffect, useRef, useState } from "react";

// Hardcoded GPS coordinates for demo locations in Pune, India - 5 meter intervals
const LOCATION_MARKERS = [
  {
    id: 1,
    name: "Start Point",
    instruction: "Start here",
    gps: { lat: 18.5291, lng: 73.8564 }, // Base location
    direction: "north",
    distance: 5,
  },
  {
    id: 2,
    name: "First Turn",
    instruction: "Turn right and walk 5 meters",
    gps: { lat: 18.5291, lng: 73.8565 }, // 5m east
    direction: "east",
    distance: 5,
  },
  {
    id: 3,
    name: "Second Turn",
    instruction: "Turn left and walk 5 meters",
    gps: { lat: 18.5292, lng: 73.8565 }, // 5m north
    direction: "north",
    distance: 5,
  },
  {
    id: 4,
    name: "Third Turn",
    instruction: "Turn right and walk 5 meters",
    gps: { lat: 18.5292, lng: 73.8566 }, // 5m east
    direction: "east",
    distance: 5,
  },
  {
    id: 5,
    name: "Destination",
    instruction: "You've reached your destination!",
    gps: { lat: 18.5293, lng: 73.8566 }, // 5m north
    direction: "arrived",
    distance: 0,
  },
];

export default function LocationAR() {
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [userHeading, setUserHeading] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Get user's current location
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
          setError(
            "Unable to get your location. Please enable location services."
          );
        }
      );

      // Watch for heading changes
      if ("ondeviceorientation" in window) {
        window.addEventListener("deviceorientation", (event) => {
          if (event.alpha !== null) {
            setUserHeading(event.alpha);
          }
        });
      }
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  }, []);

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
  };

  const calculateDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000; // Convert to meters
  };

  const getDirectionArrow = (direction: string) => {
    switch (direction) {
      case "north":
        return "⬆️";
      case "south":
        return "⬇️";
      case "east":
        return "➡️";
      case "west":
        return "⬅️";
      case "arrived":
        return "🎯";
      default:
        return "➡️";
    }
  };

  const getCurrentMarker = () => {
    if (!userLocation) return null;

    const currentMarker = LOCATION_MARKERS[currentStep];
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      currentMarker.gps.lat,
      currentMarker.gps.lng
    );

    return { ...currentMarker, distance };
  };

  const nextStep = () => {
    if (currentStep < LOCATION_MARKERS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentMarker = getCurrentMarker();

  return (
    <div className="w-full h-screen bg-gray-900 flex flex-col">
      {/* Camera Feed Container */}
      <div className="relative w-full h-2/3 bg-black overflow-hidden">
        {showCamera && cameraStream ? (
          <>
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

            {/* AR Overlay on top of camera */}
            <div className="absolute inset-0 z-10 pointer-events-none">
              {/* Camera Status Indicator */}
              <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                📷 LIVE
              </div>

              {/* Directional Arrow Overlay */}
              <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="text-6xl text-[#04b7cf] animate-pulse drop-shadow-lg">
                  {getDirectionArrow(currentMarker?.direction || "north")}
                </div>
              </div>

              {/* Distance Rings */}
              <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-24 h-24 border-4 border-[#04cf84] rounded-full opacity-50 animate-ping drop-shadow-lg"></div>
                <div
                  className="w-16 h-16 border-4 border-[#04b7cf] rounded-full opacity-70 animate-ping drop-shadow-lg"
                  style={{ animationDelay: "0.5s" }}
                ></div>
              </div>

              {/* Navigation Text Overlay */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black bg-opacity-70 text-white p-3 rounded-lg">
                  <p className="text-sm font-bold text-center">
                    {currentMarker?.instruction || "Follow the arrow"}
                  </p>
                  <p className="text-xs text-center text-gray-300 mt-1">
                    Distance: {currentMarker?.distance.toFixed(0) || 0}m
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="text-6xl mb-4">📱</div>
              <p className="text-lg font-semibold">
                Location-Based AR Navigation
              </p>
              <p className="text-sm mt-2">Camera feed will appear here</p>
              <p className="text-xs mt-1 text-gray-500">
                Click "Start Camera" to begin
              </p>
            </div>
          </div>
        )}

        {/* GPS Info Overlay */}
        <div className="absolute top-2 left-2 right-2 z-20">
          <div className="bg-black bg-opacity-70 text-white p-2 rounded-lg text-xs">
            <h2 className="text-sm font-bold mb-1">🧭 AR Navigation</h2>
            <p className="text-xs text-gray-300">
              {userLocation
                ? `GPS: ${userLocation.lat.toFixed(
                    4
                  )}, ${userLocation.lng.toFixed(4)}`
                : "Getting location..."}
            </p>
            <p className="text-xs text-gray-300">
              Heading: {userHeading.toFixed(1)}°
            </p>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="flex-1 bg-gray-800 p-3 overflow-y-auto">
        <div className="max-w-sm mx-auto">
          {/* Camera Controls */}
          <div className="flex justify-center gap-2 mb-3">
            {!showCamera ? (
              <button
                onClick={startCamera}
                disabled={isLoading}
                className="bg-[#04b7cf] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#0399b0] transition-colors disabled:opacity-50"
              >
                {isLoading ? "Starting Camera..." : "📷 Start Camera"}
              </button>
            ) : (
              <button
                onClick={stopCamera}
                className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
              >
                ⏹️ Stop Camera
              </button>
            )}
          </div>

          {/* Current Step Info */}
          {currentMarker && (
            <div className="text-center text-white mb-3">
              <div className="text-xs text-gray-400 mb-1">
                Step {currentStep + 1} of {LOCATION_MARKERS.length}
              </div>
              <h3 className="text-lg font-bold text-[#04b7cf] mb-1">
                {currentMarker.name}
              </h3>
              <p className="text-sm mb-1">
                {getDirectionArrow(currentMarker.direction)}{" "}
                {currentMarker.instruction}
              </p>
              <p className="text-xs text-gray-300">
                Distance: {currentMarker.distance.toFixed(0)}m
              </p>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex justify-center gap-2 mb-3">
            <button
              onClick={previousStep}
              disabled={currentStep === 0}
              className="bg-gray-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50 hover:bg-gray-700 transition-colors"
            >
              ⬅️ Previous
            </button>
            <button
              onClick={nextStep}
              disabled={currentStep === LOCATION_MARKERS.length - 1}
              className="bg-[#04b7cf] text-white px-3 py-1 rounded text-xs disabled:opacity-50 hover:bg-[#0399b0] transition-colors"
            >
              Next ➡️
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-500 text-white p-2 rounded-lg mb-3 text-xs">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
            </div>
          )}

          {/* Instructions */}
          <div className="text-center text-gray-400 text-xs">
            <p>📍 Move device to see AR markers</p>
            <p>📱 Point camera at sky for best results</p>
            <p>🎯 Follow arrows to navigate</p>
            <p>🌍 5-meter intervals for demo</p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

// Hardcoded GPS coordinates for demo locations in Pune, India
const LOCATION_MARKERS = [
  {
    id: 1,
    name: "Pune Station",
    instruction: "Start from Pune Railway Station",
    gps: { lat: 18.5291, lng: 73.8564 }, // Pune Railway Station
    direction: "north",
    distance: 50,
  },
  {
    id: 2,
    name: "FC Road",
    instruction: "Turn right onto FC Road",
    gps: { lat: 18.53, lng: 73.857 }, // FC Road intersection
    direction: "east",
    distance: 30,
  },
  {
    id: 3,
    name: "Koregaon Park",
    instruction: "Continue straight to Koregaon Park",
    gps: { lat: 18.531, lng: 73.858 }, // Koregaon Park area
    direction: "north",
    distance: 25,
  },
  {
    id: 4,
    name: "JM Road",
    instruction: "Turn left onto JM Road",
    gps: { lat: 18.532, lng: 73.859 }, // JM Road intersection
    direction: "west",
    distance: 20,
  },
  {
    id: 5,
    name: "Destination",
    instruction: "You've reached your destination in Pune!",
    gps: { lat: 18.533, lng: 73.86 }, // Final destination
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

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Use back camera
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Unable to access camera. Please allow camera permissions.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      setShowCamera(false);
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
      {/* Camera Feed */}
      <div className="relative w-full h-3/4">
        {showCamera ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="text-6xl mb-4">📱</div>
              <p className="text-lg font-semibold">
                Location-Based AR Navigation
              </p>
              <p className="text-sm mt-2">Camera feed will appear here</p>
            </div>
          </div>
        )}

        {/* AR Overlay */}
        {showCamera && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Directional Arrow Overlay */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="text-8xl text-[#04b7cf] animate-pulse">
                {getDirectionArrow(currentMarker?.direction || "north")}
              </div>
            </div>

            {/* Distance Rings */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-32 h-32 border-4 border-[#04cf84] rounded-full opacity-50 animate-ping"></div>
              <div
                className="w-24 h-24 border-4 border-[#04b7cf] rounded-full opacity-70 animate-ping"
                style={{ animationDelay: "0.5s" }}
              ></div>
            </div>
          </div>
        )}

        {/* GPS Info Overlay */}
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="bg-black bg-opacity-50 text-white p-4 rounded-lg">
            <h2 className="text-xl font-bold mb-2">
              🧭 Location-Based AR Navigation
            </h2>
            <p className="text-sm text-gray-300">
              {userLocation
                ? `GPS: ${userLocation.lat.toFixed(
                    4
                  )}, ${userLocation.lng.toFixed(4)}`
                : "Getting your location..."}
            </p>
            <p className="text-sm text-gray-300">
              Heading: {userHeading.toFixed(1)}°
            </p>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="flex-1 bg-gray-800 p-4">
        <div className="max-w-md mx-auto">
          {/* Camera Controls */}
          <div className="flex justify-center gap-4 mb-4">
            {!showCamera ? (
              <button
                onClick={startCamera}
                className="bg-[#04b7cf] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0399b0] transition-colors"
              >
                📷 Start Camera
              </button>
            ) : (
              <button
                onClick={stopCamera}
                className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
              >
                ⏹️ Stop Camera
              </button>
            )}
          </div>

          {/* Current Step Info */}
          {currentMarker && (
            <div className="text-center text-white mb-4">
              <div className="text-sm text-gray-400 mb-2">
                Step {currentStep + 1} of {LOCATION_MARKERS.length}
              </div>
              <h3 className="text-xl font-bold text-[#04b7cf] mb-2">
                {currentMarker.name}
              </h3>
              <p className="text-lg mb-2">
                {getDirectionArrow(currentMarker.direction)}{" "}
                {currentMarker.instruction}
              </p>
              <p className="text-sm text-gray-300">
                Distance: {currentMarker.distance.toFixed(0)}m
              </p>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex justify-center gap-4 mb-4">
            <button
              onClick={previousStep}
              disabled={currentStep === 0}
              className="bg-gray-600 text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-gray-700 transition-colors"
            >
              ⬅️ Previous
            </button>
            <button
              onClick={nextStep}
              disabled={currentStep === LOCATION_MARKERS.length - 1}
              className="bg-[#04b7cf] text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-[#0399b0] transition-colors"
            >
              Next ➡️
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-500 text-white p-3 rounded-lg mb-4">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
            </div>
          )}

          {/* Instructions */}
          <div className="text-center text-gray-400 text-sm">
            <p>📍 Move your device to see AR markers</p>
            <p>📱 Point camera at the sky for best results</p>
            <p>🎯 Follow the arrows to navigate</p>
            <p>🌍 Uses real GPS coordinates</p>
          </div>
        </div>
      </div>
    </div>
  );
}

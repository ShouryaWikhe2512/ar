"use client";

import { useEffect, useRef, useState } from "react";

export default function LocationAR() {
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

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

          {/* AR Overlay - Clean and Simple */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            {/* Forward Arrow - Center */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="text-8xl text-[#04b7cf] animate-pulse drop-shadow-2xl">
                ⬆️
              </div>
            </div>

            {/* Dairy Section Board - Left Side */}
            <div className="absolute top-1/3 left-8 transform -translate-y-1/2">
              <div className="bg-white bg-opacity-90 text-black p-4 rounded-lg shadow-2xl border-2 border-[#04b7cf]">
                <div className="text-2xl font-bold text-center">🥛</div>
                <div className="text-lg font-bold text-center mt-2">
                  Dairy Section
                </div>
              </div>
            </div>

            {/* Personal Care Section Board - Right Side */}
            <div className="absolute top-1/3 right-8 transform -translate-y-1/2">
              <div className="bg-white bg-opacity-90 text-black p-4 rounded-lg shadow-2xl border-2 border-[#04b7cf]">
                <div className="text-2xl font-bold text-center">🧴</div>
                <div className="text-lg font-bold text-center mt-2">
                  Personal Care
                </div>
              </div>
            </div>

            {/* Distance Rings around arrow */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-32 h-32 border-4 border-[#04cf84] rounded-full opacity-50 animate-ping drop-shadow-lg"></div>
              <div
                className="w-24 h-24 border-4 border-[#04b7cf] rounded-full opacity-70 animate-ping drop-shadow-lg"
                style={{ animationDelay: "0.5s" }}
              ></div>
            </div>
          </div>

          {/* Minimal Camera Controls - Only when needed */}
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
            <h1 className="text-3xl font-bold mb-4">AR Navigation Demo</h1>
            <p className="text-lg mb-8 text-gray-300">
              Simple AR experience with camera feed
            </p>
            <button
              onClick={startCamera}
              disabled={isLoading}
              className="bg-[#04b7cf] text-white px-8 py-4 rounded-lg text-xl font-semibold hover:bg-[#0399b0] transition-colors disabled:opacity-50 shadow-lg"
            >
              {isLoading ? "Starting Camera..." : "📷 Start AR Experience"}
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

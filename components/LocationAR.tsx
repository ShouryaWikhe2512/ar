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

          {/* AR Overlay with Vibrant Colors */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            {/* Floating Dairy Section Board - Left */}
            <div className="absolute top-1/4 left-8 transform -translate-y-1/2">
              <div
                className="bg-gradient-to-br from-yellow-400 to-orange-500 text-black p-6 rounded-2xl shadow-2xl border-4 border-yellow-300"
                style={{
                  animation: "float 3s ease-in-out infinite alternate",
                  boxShadow:
                    "0 20px 40px rgba(251, 191, 36, 0.4), 0 0 0 4px rgba(251, 191, 36, 0.2)",
                }}
              >
                <div className="text-4xl text-center mb-2">🥛</div>
                <div className="text-2xl font-black text-center tracking-wide">
                  DAIRY SECTION
                </div>
                <div className="text-sm text-center mt-2 font-bold opacity-80">
                  Fresh & Natural
                </div>
              </div>
            </div>

            {/* Floating Personal Care Section Board - Right */}
            <div className="absolute top-1/4 right-8 transform -translate-y-1/2">
              <div
                className="bg-gradient-to-br from-pink-400 to-purple-500 text-white p-6 rounded-2xl shadow-2xl border-4 border-pink-300"
                style={{
                  animation: "float 3s ease-in-out infinite alternate-reverse",
                  boxShadow:
                    "0 20px 40px rgba(236, 72, 153, 0.4), 0 0 0 4px rgba(236, 72, 153, 0.2)",
                }}
              >
                <div className="text-4xl text-center mb-2">🧴</div>
                <div className="text-2xl font-black text-center tracking-wide">
                  PERSONAL CARE
                </div>
                <div className="text-sm text-center mt-2 font-bold opacity-80">
                  Beauty & Wellness
                </div>
              </div>
            </div>

            {/* Animated Arrow - Center */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div
                className="text-8xl text-cyan-400 drop-shadow-2xl"
                style={{
                  animation:
                    "pulse 1.5s ease-in-out infinite, bounce 2s ease-in-out infinite",
                  filter: "drop-shadow(0 0 20px rgba(34, 211, 238, 0.8))",
                }}
              >
                ⬆️
              </div>

              {/* Glowing Rings around Arrow */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div
                  className="w-32 h-32 border-4 border-cyan-400 rounded-full opacity-60"
                  style={{
                    animation: "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
                    boxShadow: "0 0 20px rgba(34, 211, 238, 0.6)",
                  }}
                ></div>
                <div
                  className="w-24 h-24 border-4 border-emerald-400 rounded-full opacity-80 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    animation:
                      "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite 0.5s",
                    boxShadow: "0 0 15px rgba(52, 211, 153, 0.6)",
                  }}
                ></div>
              </div>
            </div>

            {/* Navigation Text */}
            <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-full shadow-xl border-2 border-cyan-300"
                style={{
                  animation: "pulse 2s ease-in-out infinite",
                  boxShadow: "0 10px 25px rgba(34, 211, 238, 0.3)",
                }}
              >
                <div className="text-lg font-black text-center tracking-wide">
                  NAVIGATE TO SECTIONS
                </div>
              </div>
            </div>

            {/* AR Status Indicator */}
            <div className="absolute top-6 right-6">
              <div
                className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-4 py-2 rounded-full font-black text-sm shadow-lg border-2 border-green-300"
                style={{
                  animation: "pulse 2s ease-in-out infinite",
                  boxShadow: "0 5px 15px rgba(34, 197, 94, 0.4)",
                }}
              >
                📱 AR ACTIVE
              </div>
            </div>
          </div>

          {/* Camera Controls */}
          <div className="absolute bottom-6 right-6 z-20">
            <button
              onClick={stopCamera}
              className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full font-bold shadow-lg border-2 border-red-300 hover:from-red-600 hover:to-pink-600 transition-all duration-300"
              style={{
                boxShadow: "0 5px 15px rgba(239, 68, 68, 0.4)",
              }}
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
              VIBRANT AR EXPERIENCE
            </h1>
            <p className="text-xl mb-8 text-gray-300">
              Bold colors, floating boards, and animated arrow
            </p>
            <button
              onClick={startCamera}
              disabled={isLoading}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-4 rounded-full text-xl font-black hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 shadow-2xl border-2 border-cyan-300"
              style={{
                boxShadow: "0 10px 25px rgba(34, 211, 238, 0.4)",
              }}
            >
              {isLoading ? "Starting Camera..." : "📷 START AR EXPERIENCE"}
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

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(-50%) translateX(0px);
          }
          100% {
            transform: translateY(-50%) translateX(10px);
          }
        }

        @keyframes bounce {
          0%,
          100% {
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
          }
        }

        @keyframes ping {
          75%,
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

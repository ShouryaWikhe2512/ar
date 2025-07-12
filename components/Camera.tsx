"use client";

import { useEffect, useRef, useState } from "react";

type CameraProps = {
  debug: boolean;
};

export function Camera({ debug }: CameraProps) {
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Add AR grid overlay
  useEffect(() => {
    if (debug) return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.strokeStyle = "rgba(0, 255, 0, 0.5)";
    ctx.lineWidth = 1;
    // Draw grid
    const gridSize = 50;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    // Draw center marker
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 10, 0, Math.PI * 2);
    ctx.stroke();
    if (gridRef.current) {
      gridRef.current.style.backgroundImage = `url(${canvas.toDataURL()})`;
    }
  }, [debug]);

  useEffect(() => {
    if (!debug && !cameraStream) {
      startCamera();
    }
  }, [debug]);

  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(console.error);
    }
  }, [cameraStream]);

  const startCamera = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      setCameraStream(stream);
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || "Failed to access camera");
      setIsLoading(false);
    }
  };

  if (debug) {
    return <CameraFallback />;
  }
  if (error) {
    return (
      <div className="w-full h-full bg-red-900 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-lg font-bold mb-2">Camera Error</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={startCamera}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Retry Camera
          </button>
        </div>
      </div>
    );
  }
  if (isLoading) {
    return <CameraFallback />;
  }
  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
        style={{ backgroundColor: "black" }}
      />
      {/* AR Grid Overlay */}
      <div
        ref={gridRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundSize: "50px 50px",
          opacity: 0.7,
          zIndex: 5,
        }}
      />
    </div>
  );
}

function CameraFallback() {
  return (
    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
      <div className="text-white text-center">
        <p>Camera Feed Loading...</p>
        <div className="mt-4 w-64 h-64 bg-blue-500/20 border-2 border-dashed rounded-xl" />
      </div>
    </div>
  );
}

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
      console.error("Camera error:", err);
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
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className="w-full h-full object-cover"
      style={{
        backgroundColor: "black",
      }}
    />
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

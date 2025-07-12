"use client";

import { useState, useEffect, useRef } from "react";
import { Camera } from "./Camera";
import NavigationOverlay from "./NavigationOverlay";
import { DirectionStep, NavigationState } from "../app/types";

type ARNavigatorProps = {
  directions: DirectionStep[];
};

export default function ARNavigator({ directions }: ARNavigatorProps) {
  const [state, setState] = useState<NavigationState>({
    currentStep: 0,
    distance: directions[0].distance,
    debugMode: false,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Simulate walking
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setState((prev) => {
        if (prev.distance <= 0) {
          return prev;
        }
        return { ...prev, distance: prev.distance - 5 };
      });
    }, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Handle step completion
  useEffect(() => {
    if (state.distance <= 0 && state.currentStep < directions.length - 1) {
      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          currentStep: prev.currentStep + 1,
          distance: directions[prev.currentStep + 1].distance,
        }));
      }, 2000);
    }
  }, [state.distance, state.currentStep, directions]);

  const toggleDebugMode = () => {
    setState((prev) => ({ ...prev, debugMode: !prev.debugMode }));
  };

  return (
    <div className="relative h-screen w-full">
      <Camera debug={state.debugMode} />
      <NavigationOverlay
        step={directions[state.currentStep]}
        distance={state.distance}
      />
      <button
        className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full z-10"
        onClick={toggleDebugMode}
      >
        {state.debugMode ? "Live" : "Debug"}
      </button>
    </div>
  );
}

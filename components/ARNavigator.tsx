"use client";

import { useState, useEffect, useRef } from "react";
import { Camera } from "./Camera";
import NavigationOverlay from "./NavigationOverlay";
import ARArrow from "./ARArrow";
import { DirectionStep, NavigationState } from "../app/types";

// Add to imports
import ARDistanceIndicator from "./ARDistanceIndicator";

// Add inside return after ARArrow
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

  const currentDirection = directions[state.currentStep].type as
    | "left"
    | "right"
    | "straight";

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Camera with lower z-index */}
      <div className="absolute inset-0 z-0">
        <Camera debug={state.debugMode} />
      </div>

      {/* AR Objects with higher z-index */}
      <div className="absolute inset-0 z-10">
        {state.currentStep < directions.length &&
          directions[state.currentStep].type !== "arrival" && (
            <ARArrow direction={currentDirection} />
          )}
      </div>

      <ARDistanceIndicator distance={state.distance} />

      {/* Overlay UI */}
      <div className="absolute inset-0 z-20">
        <NavigationOverlay
          step={directions[state.currentStep]}
          distance={state.distance}
        />
      </div>

      {/* Debug button */}
      <button
        className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full z-30"
        onClick={toggleDebugMode}
      >
        {state.debugMode ? "Live" : "Debug"}
      </button>
    </div>
  );
}

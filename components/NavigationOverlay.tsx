import { DirectionStep } from "../app/types";
import {
  ArrowPathIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  MapPinIcon,
} from "@heroicons/react/24/solid";

type NavigationOverlayProps = {
  step: DirectionStep;
  distance: number;
};

export default function NavigationOverlay({
  step,
  distance,
}: NavigationOverlayProps) {
  const renderIcon = () => {
    switch (step.type) {
      case "left":
        return <ArrowLeftIcon className="h-8 w-8 text-white" />;
      case "right":
        return <ArrowRightIcon className="h-8 w-8 text-white" />;
      case "arrival":
        return <CheckCircleIcon className="h-8 w-8 text-white" />;
      default:
        return <ArrowPathIcon className="h-8 w-8 text-white" />;
    }
  };

  // Calculate progress percentage
  const progress =
    distance > 0 ? Math.min(100, 100 - (distance / step.distance) * 100) : 100;

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
      {/* Distance indicator */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span>0m</span>
          <span>{step.distance}m</span>
        </div>
        <div className="w-full bg-gray-600 rounded-full h-2.5">
          <div
            className="bg-blue-500 h-2.5 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Navigation info */}
      <div className="flex items-center space-x-4">
        <div
          className={`rounded-full p-3 ${
            step.type === "arrival" ? "bg-green-500" : "bg-blue-500"
          }`}
        >
          {renderIcon()}
        </div>
        <div className="flex-1">
          <p className="text-xl font-semibold">{step.text}</p>
          <div className="flex items-center mt-1">
            <MapPinIcon className="h-4 w-4 text-gray-300 mr-1" />
            <p className="text-gray-300 text-sm">
              {distance > 0 ? `${distance}m to next step` : "You have arrived!"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

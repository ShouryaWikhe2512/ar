import { DirectionStep } from "../app/types";
import {
  ArrowPathIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
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

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
      <div className="flex justify-between items-center mb-4">
        <div className="text-2xl font-bold">
          {distance > 0 ? `${distance}m` : "Arrived!"}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div
          className={`rounded-full p-3 ${
            step.type === "arrival" ? "bg-green-500" : "bg-blue-500"
          }`}
        >
          {renderIcon()}
        </div>
        <div>
          <p className="text-xl font-semibold">{step.text}</p>
          <p className="text-gray-300">
            {distance > 0
              ? "Continue straight ahead"
              : "You have reached your destination"}
          </p>
        </div>
      </div>
    </div>
  );
}

import ARNavigator from "@/components/ARNavigator";
import { DirectionStep } from "../app/types";

const directions: DirectionStep[] = [
  { id: 1, text: "Walk straight for 50m", distance: 50, type: "straight" },
  { id: 2, text: "Turn right at the cafe", distance: 30, type: "right" },
  { id: 3, text: "Destination on your left", distance: 0, type: "arrival" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100">
      <ARNavigator directions={directions} />
    </main>
  );
}

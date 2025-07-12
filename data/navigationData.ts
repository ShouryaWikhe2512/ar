export interface NavigationStep {
  step: number;
  instruction: string;
  direction: "forward" | "left" | "right" | "backward" | "arrived";
  distance: number;
  description?: string;
  arrowCount?: number; // Number of arrows to show for this step
}

export const NAVIGATION_PATH: NavigationStep[] = [
  {
    step: 1,
    instruction: "Start here",
    direction: "forward",
    distance: 0,
    description: "Begin your journey from this point",
    arrowCount: 1
  },
  {
    step: 2,
    instruction: "Walk forward",
    direction: "forward",
    distance: 1,
    description: "Take 1 step forward",
    arrowCount: 3
  },
  {
    step: 3,
    instruction: "Turn right",
    direction: "right",
    distance: 0,
    description: "Turn 90 degrees to your right",
    arrowCount: 2
  },
  {
    step: 4,
    instruction: "Walk forward",
    direction: "forward",
    distance: 1,
    description: "Take 1 step forward",
    arrowCount: 3
  },
  {
    step: 5,
    instruction: "Turn left",
    direction: "left",
    distance: 0,
    description: "Turn 90 degrees to your left",
    arrowCount: 2
  },
  {
    step: 6,
    instruction: "Walk forward",
    direction: "forward",
    distance: 1,
    description: "Take 1 step forward",
    arrowCount: 3
  },
  {
    step: 7,
    instruction: "Turn right",
    direction: "right",
    distance: 0,
    description: "Turn 90 degrees to your right",
    arrowCount: 2
  },
  {
    step: 8,
    instruction: "Walk forward",
    direction: "forward",
    distance: 1,
    description: "Take 1 step forward",
    arrowCount: 3
  },
  {
    step: 9,
    instruction: "Destination reached!",
    direction: "arrived",
    distance: 0,
    description: "Congratulations! You've reached your destination!",
    arrowCount: 0
  }
];

// Demo route for hackathon - simple square path
export const HACKATHON_DEMO_ROUTE: NavigationStep[] = [
  {
    step: 1,
    instruction: "Start Demo",
    direction: "forward",
    distance: 0,
    description: "Welcome to AR Navigation Demo!",
    arrowCount: 1
  },
  {
    step: 2,
    instruction: "Step forward",
    direction: "forward",
    distance: 1,
    description: "Take one step forward",
    arrowCount: 3
  },
  {
    step: 3,
    instruction: "Turn right",
    direction: "right",
    distance: 0,
    description: "Turn to your right",
    arrowCount: 2
  },
  {
    step: 4,
    instruction: "Step forward",
    direction: "forward",
    distance: 1,
    description: "Take one step forward",
    arrowCount: 3
  },
  {
    step: 5,
    instruction: "Turn right",
    direction: "right",
    distance: 0,
    description: "Turn to your right",
    arrowCount: 2
  },
  {
    step: 6,
    instruction: "Step forward",
    direction: "forward",
    distance: 1,
    description: "Take one step forward",
    arrowCount: 3
  },
  {
    step: 7,
    instruction: "Turn right",
    direction: "right",
    distance: 0,
    description: "Turn to your right",
    arrowCount: 2
  },
  {
    step: 8,
    instruction: "Step forward",
    direction: "forward",
    distance: 1,
    description: "Take one step forward",
    arrowCount: 3
  },
  {
    step: 9,
    instruction: "Demo Complete!",
    direction: "arrived",
    distance: 0,
    description: "You've completed the AR navigation demo!",
    arrowCount: 0
  }
];

// Export default route
export default NAVIGATION_PATH; 
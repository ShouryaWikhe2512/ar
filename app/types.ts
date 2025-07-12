export type DirectionStep = {
  id: number;
  text: string;
  distance: number;
  type: 'straight' | 'left' | 'right' | 'arrival';
};

export type NavigationState = {
  currentStep: number;
  distance: number;
  debugMode: boolean;
};
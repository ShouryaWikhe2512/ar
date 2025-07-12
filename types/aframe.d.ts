declare global {
  interface Window {
    AFRAME: any;
  }
  
  namespace JSX {
    interface IntrinsicElements {
      'a-scene': any;
      'a-camera': any;
      'a-entity': any;
      'a-box': any;
      'a-cone': any;
      'a-text': any;
      'a-ring': any;
      'a-light': any;
      'a-sphere': any;
      'a-plane': any;
    }
  }
}

export {}; 
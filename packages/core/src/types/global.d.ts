interface Window {
  process?: {
    type: string;
  };
  cordova?: any;
}

declare module 'electron' {
  interface Process {
    type: string;
  }
}

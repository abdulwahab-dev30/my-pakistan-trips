declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export function trackGAEvent(eventName: string, parameters: Record<string, string | number | boolean> = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", eventName, parameters);
}

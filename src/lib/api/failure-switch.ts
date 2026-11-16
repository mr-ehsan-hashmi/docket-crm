const FAILURE_KEY = "docket:simulate-failure";
const listeners = new Set<() => void>();

export function isFailureSimulated(): boolean {
  try {
    return localStorage.getItem(FAILURE_KEY) === "on";
  } catch {
    return false;
  }
}

export function setFailureSimulated(enabled: boolean): void {
  try {
    if (enabled) localStorage.setItem(FAILURE_KEY, "on");
    else localStorage.removeItem(FAILURE_KEY);
  } catch {
  }
  listeners.forEach((listener) => listener());
}

export function subscribeToFailureSwitch(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

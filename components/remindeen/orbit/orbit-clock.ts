type Listener = (now: number) => void;

const listeners = new Set<Listener>();
let rafId: number | null = null;
let reducedMotion = false;

function tick() {
  const now = Date.now();
  listeners.forEach((listener) => listener(now));
  rafId = requestAnimationFrame(tick);
}

function start() {
  if (rafId !== null) return;
  rafId = requestAnimationFrame(tick);
}

function stop() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

function refresh() {
  if (document.hidden || reducedMotion) {
    stop();
  } else if (listeners.size > 0) {
    start();
  }
}

if (typeof window !== "undefined") {
  reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.addEventListener("visibilitychange", refresh);
}

export function subscribeOrbitClock(listener: Listener) {
  listeners.add(listener);
  refresh();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) stop();
  };
}

export function isReducedMotion() {
  return reducedMotion;
}

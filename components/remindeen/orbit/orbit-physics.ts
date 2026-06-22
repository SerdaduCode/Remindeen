export const MIN_RADIUS = 70;
export const MAX_RADIUS_FALLBACK = 320;
export const BASE_OMEGA = 10; // px * rad / s — tuned for a slow, ambient drift

export const EDGE_PADDING = 8;
export const MIN_DRAG_RADIUS = 70;
// Where the priority ring sits, as a fraction of the live usable radius.
export const RING_RADIUS_RATIO = 0.60;

export interface CanvasMetrics {
  maxRadius: number;
  ringRadius: number;
}

/** Derives the live usable orbit radius and the priority-ring radius from the container size. */
export function computeCanvasMetrics(width: number, height: number): CanvasMetrics {
  const maxRadius = Math.max(Math.min(width, height) / 2 - EDGE_PADDING, MIN_DRAG_RADIUS);
  return { maxRadius, ringRadius: maxRadius * RING_RADIUS_RATIO };
}

// Priority nodes are confined inside the ring; every other orbiting node
// (focus nodes never orbit) is confined outside it.
export function priorityRadiusBounds(
  isPriority: boolean,
  ringRadius: number,
  maxRadius: number,
  minRadius = MIN_RADIUS
): { minRadius: number; maxRadius: number } {
  return isPriority ? { minRadius, maxRadius: ringRadius } : { minRadius: ringRadius, maxRadius };
}

export function angularVelocity(radius: number) {
  return BASE_OMEGA / Math.max(radius, MIN_RADIUS);
}

export function liveAngle(angle: number, radius: number, angleSetAt: number, now: number) {
  const elapsedSeconds = (now - angleSetAt) / 1000;
  return angle + angularVelocity(radius) * elapsedSeconds;
}

export function polarToCartesian(radius: number, angle: number) {
  return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
}

export function cartesianToPolar(x: number, y: number) {
  return { radius: Math.sqrt(x * x + y * y), angle: Math.atan2(y, x) };
}

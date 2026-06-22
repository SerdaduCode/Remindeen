import { MAX_RADIUS_FALLBACK, MIN_RADIUS, liveAngle } from "./orbit-physics";

// Nodes orbit on discrete radius "lanes". Two nodes sharing a lane move at the
// exact same angular velocity (it only depends on radius), so once they're
// spaced apart on that lane they stay spaced apart forever. Nodes on different
// lanes never collide either, as long as lanes are far enough apart that their
// circular paths can't touch. That's what makes the spacing permanent instead
// of a one-off check at placement time.
export const NODE_DIAMETER = 60;
const NODE_SAFE_GAP = 30;
export const MIN_NODE_DISTANCE = NODE_DIAMETER + NODE_SAFE_GAP;
export const LANE_STEP = MIN_NODE_DISTANCE;

const TWO_PI = Math.PI * 2;
const LANE_TOLERANCE = LANE_STEP / 2;

function normalizeAngle(angle: number) {
  const a = angle % TWO_PI;
  return a < 0 ? a + TWO_PI : a;
}

function angularGapForRadius(radius: number) {
  const r = Math.max(radius, MIN_RADIUS);
  const ratio = Math.min(1, MIN_NODE_DISTANCE / (2 * r));
  return 2 * Math.asin(ratio);
}

function findOpenAngleInLane(desired: number, occupied: number[], minGap: number): number | null {
  const desiredNorm = normalizeAngle(desired);
  if (occupied.length === 0) return desiredNorm;

  const sorted = occupied.map(normalizeAngle).sort((a, b) => a - b);
  let best: { angle: number; dist: number } | null = null;

  for (let i = 0; i < sorted.length; i++) {
    const start = sorted[i];
    const end = i + 1 < sorted.length ? sorted[i + 1] : sorted[0] + TWO_PI;
    const gapSize = end - start;
    if (gapSize < minGap) continue;

    let target = desiredNorm;
    if (target < start) target += TWO_PI;
    const clamped = Math.min(Math.max(target, start + minGap / 2), end - minGap / 2);
    const rawDist = Math.abs(clamped - desiredNorm);
    const dist = Math.min(rawDist, TWO_PI - rawDist);
    if (!best || dist < best.dist) best = { angle: normalizeAngle(clamped), dist };
  }

  return best ? best.angle : null;
}

function shortestAngleDelta(from: number, to: number) {
  let diff = (to - from) % TWO_PI;
  if (diff > Math.PI) diff -= TWO_PI;
  if (diff < -Math.PI) diff += TWO_PI;
  return diff;
}

/**
 * Picks an angle for a node sitting near an "intruder" angle, pushed away on
 * the shorter side — like two same-pole magnets repelling each other.
 */
export function repelAngle(nodeAngle: number, intruderAngle: number, radius: number): number {
  const minGap = angularGapForRadius(radius);
  const diff = shortestAngleDelta(intruderAngle, nodeAngle);
  const direction = diff >= 0 ? 1 : -1;
  return normalizeAngle(nodeAngle + direction * minGap * 1.5);
}

function roomiestAngleInLane(occupied: number[]): number {
  if (occupied.length === 0) return 0;
  const sorted = occupied.map(normalizeAngle).sort((a, b) => a - b);
  let bestGap = -1;
  let bestAngle = sorted[0];
  for (let i = 0; i < sorted.length; i++) {
    const start = sorted[i];
    const end = i + 1 < sorted.length ? sorted[i + 1] : sorted[0] + TWO_PI;
    const gap = end - start;
    if (gap > bestGap) {
      bestGap = gap;
      bestAngle = normalizeAngle(start + gap / 2);
    }
  }
  return bestAngle;
}

export interface LiveOrbitNode {
  id: string;
  radius: number;
  angle: number;
}

export function quantizeRadius(radius: number, minRadius = MIN_RADIUS) {
  const steps = Math.max(0, Math.round((radius - minRadius) / LANE_STEP));
  return minRadius + steps * LANE_STEP;
}

/** Resolves the nearest collision-free (radius, angle) slot to the desired one. */
export function findOrbitSlot(
  desiredRadius: number,
  desiredAngle: number,
  liveSiblings: LiveOrbitNode[],
  options: { minRadius?: number; maxRadius?: number } = {}
): { radius: number; angle: number } {
  const minRadius = options.minRadius ?? MIN_RADIUS;
  const maxRadius = options.maxRadius ?? MAX_RADIUS_FALLBACK;
  const startRadius = Math.min(Math.max(quantizeRadius(desiredRadius, minRadius), minRadius), maxRadius);

  const lanes: number[] = [startRadius];
  for (let r = startRadius + LANE_STEP; r <= maxRadius; r += LANE_STEP) lanes.push(r);
  for (let r = startRadius - LANE_STEP; r >= minRadius; r -= LANE_STEP) lanes.push(r);

  for (const radius of lanes) {
    const minGap = angularGapForRadius(radius);
    const occupied = liveSiblings
      .filter((n) => Math.abs(n.radius - radius) < LANE_TOLERANCE)
      .map((n) => n.angle);
    const angle = findOpenAngleInLane(desiredAngle, occupied, minGap);
    if (angle !== null) return { radius, angle };
  }

  // Every lane in range is saturated — fall back to the roomiest spot on the
  // requested lane rather than stacking exactly on top of another node.
  const occupied = liveSiblings
    .filter((n) => Math.abs(n.radius - startRadius) < LANE_TOLERANCE)
    .map((n) => n.angle);
  return { radius: startRadius, angle: roomiestAngleInLane(occupied) };
}

/** Projects each task's stored angle forward to "now" for live collision checks. */
export function liveSlotInputs(
  tasks: { id: string; radius: number; angle: number; angleSetAt: number }[],
  now = Date.now()
): LiveOrbitNode[] {
  return tasks.map((t) => ({
    id: t.id,
    radius: t.radius,
    angle: liveAngle(t.angle, t.radius, t.angleSetAt, now),
  }));
}

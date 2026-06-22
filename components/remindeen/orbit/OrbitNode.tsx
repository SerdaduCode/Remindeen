import { useEffect, useMemo, useRef, useState } from "react";
import type { OrbitTask } from "@/hooks/use-orbit-tasks";
import { isReducedMotion, subscribeOrbitClock } from "./orbit-clock";
import {
  MIN_DRAG_RADIUS,
  cartesianToPolar,
  computeCanvasMetrics,
  liveAngle,
  polarToCartesian,
  priorityRadiusBounds,
} from "./orbit-physics";
import { MIN_NODE_DISTANCE, findOrbitSlot, liveSlotInputs, repelAngle } from "./orbit-layout";

const CLICK_THRESHOLD_PX = 4;
const BOUNCE_DURATION_MS = 380;
const BOUNCE_EASING = "cubic-bezier(0.34, 1.56, 0.64, 1)";

function seedFromId(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) % 9973;
  }
  return hash / 9973;
}

interface OrbitNodeProps {
  task: OrbitTask;
  siblings: OrbitTask[];
  containerRef: React.RefObject<HTMLDivElement | null>;
  isCompleting: boolean;
  isDimmed?: boolean;
  focusLabel?: string;
  onEdit: () => void;
  onAnimationDone: () => void;
  onReposition: (radius: number, angle: number) => void;
  onKnockSibling?: (id: string, radius: number, angle: number) => void;
}

function OrbitNode({
  task,
  siblings,
  containerRef,
  isCompleting,
  isDimmed = false,
  focusLabel,
  onEdit,
  onAnimationDone,
  onReposition,
  onKnockSibling,
}: OrbitNodeProps) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const isFocus = task.isFocus;
  const [orbit, setOrbit] = useState({
    radius: task.radius,
    angle: task.angle,
    angleSetAt: task.angleSetAt,
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef<{ startX: number; startY: number; moved: boolean } | null>(null);
  const knockedRef = useRef<Set<string>>(new Set());
  const isFirstOrbitSync = useRef(true);

  // A node's own radius/angle only ever change via an explicit reposition
  // (drag-drop or a sibling knocking it away). Animate that jump with a
  // springy transition so a knockback reads as a magnet-like bounce, not a
  // teleport. The initial mount is skipped since there's no prior position.
  useEffect(() => {
    setOrbit({ radius: task.radius, angle: task.angle, angleSetAt: task.angleSetAt });

    if (isFirstOrbitSync.current) {
      isFirstOrbitSync.current = false;
      return;
    }
    if (nodeRef.current) {
      nodeRef.current.style.transition = `transform ${BOUNCE_DURATION_MS}ms ${BOUNCE_EASING}`;
    }
    const timeout = window.setTimeout(() => {
      if (nodeRef.current) nodeRef.current.style.transition = "";
    }, BOUNCE_DURATION_MS);
    return () => window.clearTimeout(timeout);
  }, [task.radius, task.angle, task.angleSetAt]);

  const applyTransform = (x: number, y: number) => {
    if (nodeRef.current) {
      nodeRef.current.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
    }
  };

  useEffect(() => {
    if (isFocus) {
      applyTransform(0, 0);
      return;
    }
    if (isDragging) return;

    if (isReducedMotion()) {
      const { x, y } = polarToCartesian(orbit.radius, orbit.angle);
      applyTransform(x, y);
      return;
    }

    const unsubscribe = subscribeOrbitClock((now) => {
      const angle = liveAngle(orbit.angle, orbit.radius, orbit.angleSetAt, now);
      const { x, y } = polarToCartesian(orbit.radius, angle);
      applyTransform(x, y);
    });
    return unsubscribe;
  }, [isFocus, isDragging, orbit.radius, orbit.angle, orbit.angleSetAt]);

  // Raw cursor position, clamped to the container — used while dragging so the
  // node tracks the pointer with no lag or restriction. Priority nodes are
  // held inside the priority ring; every other node is held outside it.
  const resolveRaw = (clientX: number, clientY: number) => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return null;
    const centerX = containerRect.left + containerRect.width / 2;
    const centerY = containerRect.top + containerRect.height / 2;
    const { maxRadius, ringRadius } = computeCanvasMetrics(containerRect.width, containerRect.height);
    const bounds = priorityRadiusBounds(task.isPriority, ringRadius, maxRadius, MIN_DRAG_RADIUS);
    const { radius, angle } = cartesianToPolar(clientX - centerX, clientY - centerY);
    const clampedRadius = Math.min(Math.max(radius, bounds.minRadius), bounds.maxRadius);
    return { radius: clampedRadius, angle, maxRadius, ringRadius };
  };

  // Final resting slot on release — snaps to the nearest collision-free spot
  // so dropped nodes can never end up overlapping or too close to a sibling.
  const resolveDrop = (clientX: number, clientY: number) => {
    const raw = resolveRaw(clientX, clientY);
    if (!raw) return null;
    const bounds = priorityRadiusBounds(task.isPriority, raw.ringRadius, raw.maxRadius, MIN_DRAG_RADIUS);
    const liveSiblings = liveSlotInputs(siblings);
    return findOrbitSlot(raw.radius, raw.angle, liveSiblings, bounds);
  };

  // While dragging, knock any sibling the cursor passes too close to onto a
  // new collision-free slot — like two same-pole magnets repelling. Each
  // sibling is only knocked once per drag gesture so it doesn't keep getting
  // re-bumped as the cursor lingers nearby. Each sibling stays within its own
  // priority/ring boundary, independent of the dragged node's.
  const checkKnockback = (
    rawX: number,
    rawY: number,
    rawAngle: number,
    maxRadius: number,
    ringRadius: number
  ) => {
    if (!onKnockSibling) return;
    const now = Date.now();
    for (const sibling of siblings) {
      if (knockedRef.current.has(sibling.id)) continue;

      const siblingAngle = liveAngle(sibling.angle, sibling.radius, sibling.angleSetAt, now);
      const { x: sx, y: sy } = polarToCartesian(sibling.radius, siblingAngle);
      if (Math.hypot(sx - rawX, sy - rawY) >= MIN_NODE_DISTANCE) continue;

      knockedRef.current.add(sibling.id);
      const otherSiblings = siblings.filter((s) => s.id !== sibling.id);
      const liveOthers = liveSlotInputs(otherSiblings, now);
      liveOthers.push({ id: "__drag__", radius: Math.hypot(rawX, rawY), angle: rawAngle });

      const desiredAngle = repelAngle(siblingAngle, rawAngle, sibling.radius);
      const bounds = priorityRadiusBounds(sibling.isPriority, ringRadius, maxRadius, MIN_DRAG_RADIUS);
      const slot = findOrbitSlot(sibling.radius, desiredAngle, liveOthers, bounds);
      onKnockSibling(sibling.id, slot.radius, slot.angle);
    }
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    dragState.current = { startX: event.clientX, startY: event.clientY, moved: false };
    knockedRef.current.clear();
    if (nodeRef.current) nodeRef.current.style.transition = "";
    setIsDragging(true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (isFocus || !dragState.current) return;
    const dx = event.clientX - dragState.current.startX;
    const dy = event.clientY - dragState.current.startY;
    if (!dragState.current.moved && Math.hypot(dx, dy) > CLICK_THRESHOLD_PX) {
      dragState.current.moved = true;
    }
    if (!dragState.current.moved) return;

    const raw = resolveRaw(event.clientX, event.clientY);
    if (raw) {
      const { x, y } = polarToCartesian(raw.radius, raw.angle);
      applyTransform(x, y);
      checkKnockback(x, y, raw.angle, raw.maxRadius, raw.ringRadius);
    }
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const wasDrag = dragState.current?.moved ?? false;
    dragState.current = null;
    setIsDragging(false);

    if (!wasDrag) {
      onEdit();
      return;
    }

    const drop = resolveDrop(event.clientX, event.clientY);
    if (drop) {
      setOrbit({ radius: drop.radius, angle: drop.angle, angleSetAt: Date.now() });
      onReposition(drop.radius, drop.angle);
    }
  };

  const handlePointerCancel = () => {
    dragState.current = null;
    setIsDragging(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onEdit();
    }
  };

  const size = isFocus ? 96 : 60;
  const seed = useMemo(() => seedFromId(task.id), [task.id]);
  const haloSize = size * (1.55 + seed * 0.35);
  const haloDelay = `${-(seed * 7).toFixed(2)}s`;
  const blobDelay = `${-(seed * 13).toFixed(2)}s, ${-(seed * 6).toFixed(2)}s`;
  const ringSpinDuration = `${(16 + seed * 10).toFixed(1)}s`;

  return (
    <div
      ref={nodeRef}
      role="button"
      tabIndex={isDimmed ? -1 : 0}
      aria-label={task.title}
      aria-hidden={isDimmed}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onKeyDown={handleKeyDown}
      className={`group absolute left-1/2 top-1/2 flex select-none flex-col items-center gap-2 rounded-2xl outline-none transition-[filter] duration-150 focus-visible:ring-2 focus-visible:ring-white/50 ${
        isFocus ? "cursor-pointer" : "cursor-grab active:cursor-grabbing"
      } ${isDragging ? "brightness-110" : ""} ${isDimmed ? "pointer-events-none" : ""}`}
      style={{ touchAction: "none" }}
    >
      <div
        className={isCompleting ? "orbit-node-release" : ""}
        onAnimationEnd={isCompleting ? onAnimationDone : undefined}
      >
        <div
          className={`flex flex-col items-center gap-2 transition-[transform,opacity] duration-300 ease-out ${
            isDimmed ? "scale-[0.42] opacity-50" : "scale-100 opacity-100"
          }`}
        >
          <div className="relative" style={{ width: size, height: size }}>
            {/* Ambient halo: soft, ever-breathing glow around the orb */}
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ width: haloSize, height: haloSize }}
            >
              <div
                className="orbit-halo h-full w-full"
                style={{
                  background: `radial-gradient(circle, ${task.color}55 0%, ${task.color}22 45%, transparent 75%)`,
                  filter: "blur(8px)",
                  animationDelay: haloDelay,
                }}
              />
            </div>

            {/* Hover ring: a thin halo that snaps in on hover */}
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-75 opacity-0 transition-all duration-500 ease-out group-hover:scale-100 group-hover:opacity-100"
              style={{ width: size + 20, height: size + 20 }}
            >
              <div
                className="h-full w-full rounded-full"
                style={{
                  border: `1.5px solid ${task.color}99`,
                  boxShadow: `0 0 16px 2px ${task.color}55`,
                }}
              />
            </div>

            {/* Hover ring: a slowly rotating gradient arc for extra life */}
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-500 group-hover:opacity-90"
              style={{ width: size + 36, height: size + 36 }}
            >
              <div
                className="orbit-ring-spin h-full w-full"
                style={{
                  background: `conic-gradient(from 0deg, transparent 0%, ${task.color} 35%, transparent 60%)`,
                  WebkitMaskImage: "radial-gradient(circle, transparent 62%, black 64%, black 100%)",
                  maskImage: "radial-gradient(circle, transparent 62%, black 64%, black 100%)",
                  animationDuration: ringSpinDuration,
                }}
              />
            </div>

            {/* Core orb: organic, morphing shape instead of a flat circle */}
            <div
              className="orbit-blob h-full w-full"
              style={{
                backgroundColor: task.color,
                boxShadow: isFocus
                  ? `0 0 0 2px rgba(255,255,255,0.5), 0 0 32px 6px ${task.color}66, 0 0 14px 2px ${task.color}aa, inset 0 1px 1px rgba(255,255,255,0.35)`
                  : `0 0 0 1px rgba(255,255,255,0.1), 0 0 14px 2px ${task.color}44, inset 0 1px 1px rgba(255,255,255,0.2)`,
                animationDelay: blobDelay,
              }}
            />
          </div>
          <div
            className={`pointer-events-none max-w-[150px] text-center transition-opacity duration-200 ${
              isDimmed ? "opacity-0" : "opacity-100"
            }`}
          >
            {isFocus && focusLabel && (
              <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/50">
                {focusLabel}
              </div>
            )}
            <div className="truncate text-xs font-semibold uppercase tracking-wide text-white">
              {task.title}
            </div>
            {task.note && (
              <div className="truncate text-[11px] text-white/50">→ {task.note}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrbitNode;

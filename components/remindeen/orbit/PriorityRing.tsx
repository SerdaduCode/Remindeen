interface PriorityRingProps {
  radius: number;
}

// Purely decorative — no persisted state, no drag, no JS-driven angle math.
// Rotation is a single CSS animation so it costs nothing on the orbit clock.
function PriorityRing({ radius }: PriorityRingProps) {
  const size = radius * 2;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{ width: size, height: size }}
    >
      <div
        className="orbit-priority-ring h-full w-full"
        style={{
          background:
            "repeating-conic-gradient(rgba(255,255,255,0.4) 0deg 1deg, transparent 1deg 5deg)",
          WebkitMaskImage:
            "radial-gradient(circle, transparent calc(50% - 4px), black calc(50% - 2px), black calc(50% + 2px), transparent calc(50% + 4px))",
          maskImage:
            "radial-gradient(circle, transparent calc(50% - 4px), black calc(50% - 2px), black calc(50% + 2px), transparent calc(50% + 4px))",
        }}
      />
    </div>
  );
}

export default PriorityRing;

const RADIUS = 34;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface RingChartProps {
  percentage: number;
  color: string;
}

function RingChart({ percentage, color }: RingChartProps) {
  const clamped = Math.max(0, Math.min(100, percentage));
  const offset = CIRCUMFERENCE - (clamped / 100) * CIRCUMFERENCE;

  return (
    <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90">
      <circle cx="40" cy="40" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="7" />
      <circle
        cx="40"
        cy="40"
        r={RADIUS}
        fill="none"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={offset}
        className="transition-[stroke-dashoffset] duration-700 ease-out"
      />
    </svg>
  );
}

export default RingChart;

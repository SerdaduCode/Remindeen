export const Prayer = ({
  name,
  time,
  isActive,
  isNext,
  children,
}: {
  name: string;
  time: string;
  isActive?: boolean;
  isNext?: boolean;
  children?: React.ReactNode;
}) => {
  if (isNext) {
    return (
      <div className="flex justify-between items-center">
        <h3
          className="font-medium text-sm md:text-base tracking-wide"
          style={{ color: "#EDE8D2", fontFamily: "'Raleway', sans-serif" }}
        >
          {name}
        </h3>
        <div className="flex items-center gap-2">
          <h3
            className="text-sm md:text-base tabular-nums font-light"
            style={{ color: "#B0A97A", fontFamily: "'Raleway', sans-serif" }}
          >
            {time}
          </h3>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex justify-between items-center px-3 py-1.75 rounded-lg transition-all duration-200 hover:bg-[#2e2a1a]"
      style={
        isActive
          ? {
              background: "#2e2a1a",
              borderLeft: "3px solid #B0A97A",
              paddingLeft: 10,
            }
          : { paddingLeft: 12 }
      }
    >
      <div className="flex items-center gap-2">
        {isActive && (
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{
              background: "#B0A97A",
              animation: "pulse-dot 2s ease-in-out infinite",
            }}
          />
        )}
        <h3
          className={`text-sm flex-1 ${isActive ? "font-bold text-[#EDE8D2]" : "font-semibold text-[rgba(237,232,210,0.65)]"}`}
          style={{
            fontFamily: "'Raleway', sans-serif",
          }}
        >
          {name}
        </h3>
      </div>
      <h3
        className="text-sm tabular-nums"
        style={{
          color: isActive ? "#B0A97A" : "rgba(237,232,210,0.45)",
          fontFamily: "'Raleway', sans-serif",
        }}
      >
        {time}
      </h3>
    </div>
  );
};

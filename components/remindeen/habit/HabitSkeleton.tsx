function HabitSkeleton() {
  return (
    <div className="flex flex-col gap-2" role="status" aria-label="Loading habits">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center justify-between gap-3 rounded-lg ring-1 ring-white/10 p-3"
        >
          <div className="flex flex-1 flex-col gap-2">
            <div className="glass-skeleton h-3 w-2/3 rounded-full" />
            <div className="glass-skeleton h-2.5 w-16 rounded-full" />
          </div>
          <div className="glass-skeleton h-8 w-20 shrink-0 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export default HabitSkeleton;

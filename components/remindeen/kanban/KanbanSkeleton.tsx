const COLUMN_CARD_COUNTS = [3, 2, 2];

function KanbanSkeleton() {
  return (
    <div className="flex flex-1 gap-3" role="status" aria-label="Loading tasks">
      {COLUMN_CARD_COUNTS.map((cardCount, columnIndex) => (
        <div
          key={columnIndex}
          className={`flex min-w-[200px] flex-1 flex-col gap-3 ${
            columnIndex > 0 ? "border-l border-white/10 pl-3" : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="glass-skeleton h-3 w-16 rounded-full" />
            <div className="glass-skeleton h-4 w-5 rounded-full" />
          </div>
          <div className="flex flex-col gap-2">
            {Array.from({ length: cardCount }).map((_, cardIndex) => (
              <div
                key={cardIndex}
                className="glass-skeleton h-[68px] rounded-lg ring-1 ring-white/10"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default KanbanSkeleton;

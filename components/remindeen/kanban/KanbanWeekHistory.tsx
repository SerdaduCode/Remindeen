import { CalendarCheck } from "lucide-react";
import type { Task } from "@/hooks/use-tasks";
import { useTranslation } from "@/hooks/use-translation";
import TaskCardView from "./TaskCardView";

interface KanbanWeekHistoryProps {
  weekLabel: string;
  tasks: Task[];
  onSelectTask: (task: Task) => void;
}

function KanbanWeekHistory({ weekLabel, tasks, onSelectTask }: KanbanWeekHistoryProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
      <h3 className="text-xs font-semibold tracking-wide text-white/60">{weekLabel}</h3>

      {tasks.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <CalendarCheck className="h-8 w-8 text-white/25" strokeWidth={1.5} />
          <p className="max-w-[220px] text-sm text-white/40">{t("kanban.empty_state_week")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {tasks.map((task) => (
            <button
              key={task.id}
              type="button"
              onClick={() => onSelectTask(task)}
              className="cursor-pointer rounded-lg ring-1 ring-white/10 bg-white/[0.06] p-3 text-left text-sm text-white/90 shadow-[0_2px_8px_rgba(0,0,0,0.15)] outline-none transition-[transform,box-shadow,background-color] duration-200 hover:bg-white/[0.12] hover:ring-white/20 active:scale-[0.98]"
            >
              <TaskCardView task={task} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default KanbanWeekHistory;

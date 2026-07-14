import { SquareKanban } from "lucide-react";
import type { Task, TaskPriority } from "@/hooks/use-tasks";
import { useTranslation } from "@/hooks/use-translation";
import { addWeeks, getCurrentWeekStart } from "@/lib/iso-week";

interface KanbanSummaryProps {
  tasks: Task[];
}

const PRIORITY_ORDER: { key: TaskPriority; labelKey: string }[] = [
  { key: "High", labelKey: "kanban.form.priority_high" },
  { key: "Medium", labelKey: "kanban.form.priority_medium" },
  { key: "Low", labelKey: "kanban.form.priority_low" },
];

function KanbanSummary({ tasks }: KanbanSummaryProps) {
  const { t } = useTranslation();

  const total = tasks.length;
  const todoCount = tasks.filter((task) => task.status === "TODO").length;
  const doingCount = tasks.filter((task) => task.status === "DOING").length;
  const doneCount = tasks.filter((task) => task.status === "DONE").length;

  const weekStart = getCurrentWeekStart();
  const weekEnd = addWeeks(weekStart, 1);
  const dueThisWeek = tasks.filter((task) => {
    if (!task.dueDate) return false;
    const due = new Date(task.dueDate).getTime();
    return due >= weekStart.getTime() && due < weekEnd.getTime();
  }).length;

  const pct = (n: number) => (total ? (n / total) * 100 : 0);

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center gap-2">
        <SquareKanban className="h-4 w-4 text-indigo-400" />
        <h3 className="text-sm font-semibold text-white/90">{t("kanbanSummary.title")}</h3>
      </div>

      <div className="grid grid-cols-3 gap-1.5 text-center">
        <div>
          <div className="text-lg font-bold text-white/90">{total}</div>
          <div className="text-[9px] leading-tight text-white/40">{t("kanbanSummary.total_label")}</div>
        </div>
        <div>
          <div className="text-lg font-bold text-emerald-300">{doneCount}</div>
          <div className="text-[9px] leading-tight text-white/40">{t("kanbanSummary.done_label")}</div>
        </div>
        <div>
          <div className="text-lg font-bold text-amber-300">{dueThisWeek}</div>
          <div className="text-[9px] leading-tight text-white/40">{t("kanbanSummary.due_label")}</div>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div className="h-full bg-white/25 transition-all duration-500" style={{ width: `${pct(todoCount)}%` }} />
          <div className="h-full bg-amber-400/80 transition-all duration-500" style={{ width: `${pct(doingCount)}%` }} />
          <div className="h-full bg-emerald-400/80 transition-all duration-500" style={{ width: `${pct(doneCount)}%` }} />
        </div>
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[9px] text-white/40">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
            {t("kanban.column_todo")}
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            {t("kanban.column_doing")}
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {t("kanban.column_done")}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {PRIORITY_ORDER.map(({ key, labelKey }) => {
          const count = tasks.filter((task) => task.priority === key).length;
          return (
            <span
              key={key}
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium ${
                key === "High" ? "bg-red-500/20 text-red-300" : key === "Medium" ? "bg-white/15 text-white/80" : "bg-white/10 text-white/60"
              }`}
            >
              {t(labelKey)}: {count}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default KanbanSummary;

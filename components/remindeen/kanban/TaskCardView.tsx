import { Badge } from "@/components/ui/badge";
import type { Task } from "@/hooks/use-tasks";
import { useTranslation } from "@/hooks/use-translation";

const PRIORITY_KEY: Record<NonNullable<Task["priority"]>, string> = {
  Low: "kanban.form.priority_low",
  Medium: "kanban.form.priority_medium",
  High: "kanban.form.priority_high",
};

const PRIORITY_VARIANT: Record<NonNullable<Task["priority"]>, "secondary" | "default" | "destructive"> = {
  Low: "secondary",
  Medium: "default",
  High: "destructive",
};

interface TaskCardViewProps {
  task: Task;
}

function TaskCardView({ task }: TaskCardViewProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <p className="font-medium">{task.title}</p>
      {task.description && <p className="line-clamp-2 text-xs text-white/50">{task.description}</p>}
      <div className="flex items-center gap-2">
        {task.priority && (
          <Badge variant={PRIORITY_VARIANT[task.priority]} className="text-[10px]">
            {t(PRIORITY_KEY[task.priority])}
          </Badge>
        )}
        {task.dueDate && (
          <span className="text-[11px] text-white/40">
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}

export default TaskCardView;

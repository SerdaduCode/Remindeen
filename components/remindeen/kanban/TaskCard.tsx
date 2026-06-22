import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
}

function TaskCard({ task, onEdit }: TaskCardProps) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: String(task.id),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onEdit}
      className="cursor-pointer space-y-2 rounded-lg border border-white/10 bg-white/5 p-3 text-left text-sm text-white/90 outline-none transition hover:bg-white/10 active:scale-[0.98]"
    >
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

export default TaskCard;

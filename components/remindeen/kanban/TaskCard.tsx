import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "@/hooks/use-tasks";
import TaskCardView from "./TaskCardView";

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  dragging?: boolean;
}

function TaskCard({ task, onEdit, dragging = false }: TaskCardProps) {
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
      ref={dragging ? undefined : setNodeRef}
      style={dragging ? undefined : style}
      {...(dragging ? {} : attributes)}
      {...(dragging ? {} : listeners)}
      onClick={dragging ? undefined : onEdit}
      className={`rounded-lg ring-1 bg-white/[0.06] p-3 text-left text-sm text-white/90 outline-none ease-[cubic-bezier(0.16,1,0.3,1)] ${
        dragging
          ? "scale-105 rotate-1 cursor-grabbing ring-white/30 shadow-[0_16px_32px_-8px_rgba(0,0,0,0.5)] transition-none"
          : "cursor-pointer ring-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.15)] transition-[transform,box-shadow,background-color] duration-200 hover:bg-white/[0.12] hover:ring-white/20 active:scale-[0.98]"
      }`}
    >
      <TaskCardView task={task} />
    </div>
  );
}

export default TaskCard;

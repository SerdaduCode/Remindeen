import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Task, TaskStatus } from "@/hooks/use-tasks";
import TaskCard from "./TaskCard";

interface KanbanColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  isFirst?: boolean;
}

function KanbanColumn({ status, title, tasks, onEditTask, isFirst = false }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      className={`flex min-w-[200px] flex-1 flex-col gap-3 ${
        isFirst ? "" : "border-l border-white/10 pl-3"
      }`}
    >
      <h3 className="flex items-center justify-between text-xs font-semibold tracking-wide text-white/60">
        {title}
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/50">
          {tasks.length}
        </span>
      </h3>
      <div
        ref={setNodeRef}
        className={`flex min-h-[80px] flex-1 flex-col gap-2 overflow-y-auto rounded-lg glass-scrollbar transition-colors ${
          isOver ? "bg-white/[0.06] ring-1 ring-inset ring-white/20" : ""
        }`}
      >
        <SortableContext items={tasks.map((task) => String(task.id))} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={() => onEditTask(task)} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

export default KanbanColumn;

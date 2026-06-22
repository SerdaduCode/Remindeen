import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Task, TaskStatus } from "@/hooks/use-tasks";
import TaskCard from "./TaskCard";

interface KanbanColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  onEditTask: (task: Task) => void;
}

function KanbanColumn({ status, title, tasks, onEditTask }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <div className="flex min-w-[240px] flex-1 flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <h3 className="flex items-center justify-between text-xs font-semibold tracking-wide text-white/60">
        {title}
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/50">
          {tasks.length}
        </span>
      </h3>
      <div ref={setNodeRef} className="flex min-h-[80px] flex-1 flex-col gap-2 overflow-y-auto">
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

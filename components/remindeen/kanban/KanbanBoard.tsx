import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { LayoutGrid, Plus } from "lucide-react";
import { useTasks, type Task, type TaskStatus } from "@/hooks/use-tasks";
import { useTranslation } from "@/hooks/use-translation";
import KanbanColumn from "./KanbanColumn";
import KanbanSkeleton from "./KanbanSkeleton";
import TaskCard from "./TaskCard";
import TaskFormModal, { type TaskFormValues } from "./TaskFormModal";

const COLUMNS: TaskStatus[] = ["TODO", "DOING", "DONE"];
const COLUMN_LABEL_KEY: Record<TaskStatus, string> = {
  TODO: "kanban.column_todo",
  DOING: "kanban.column_doing",
  DONE: "kanban.column_done",
};

type FormState = { mode: "create" } | { mode: "edit"; task: Task } | null;

function KanbanBoard() {
  const { tasks, loading, error, createTask, updateTask, updateTaskPosition, deleteTask } =
    useTasks(true);
  const { t } = useTranslation();
  const [formState, setFormState] = useState<FormState>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const tasksByStatus = (status: TaskStatus) =>
    tasks.filter((task) => task.status === status).sort((a, b) => a.position - b.position);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === Number(event.active.id));
    setActiveTask(task ?? null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = Number(active.id);
    const activeTask = tasks.find((task) => task.id === activeId);
    if (!activeTask) return;

    const overIsColumn = (COLUMNS as readonly string[]).includes(String(over.id));
    const targetStatus = overIsColumn
      ? (over.id as TaskStatus)
      : tasks.find((task) => task.id === Number(over.id))?.status ?? activeTask.status;

    const columnTasks = tasksByStatus(targetStatus).filter((task) => task.id !== activeId);

    let beforeId: number | undefined;
    let afterId: number | undefined;

    if (overIsColumn) {
      // Dropped on empty column space (not on a specific card) — append to end.
      beforeId = columnTasks.at(-1)?.id;
    } else {
      const overIndex = columnTasks.findIndex((task) => task.id === Number(over.id));
      afterId = columnTasks[overIndex]?.id;
      beforeId = overIndex > 0 ? columnTasks[overIndex - 1]?.id : undefined;
    }

    if (activeTask.status !== targetStatus) {
      await updateTask(activeId, { status: targetStatus });
    }
    if (beforeId !== undefined || afterId !== undefined) {
      await updateTaskPosition(activeId, { beforeId, afterId });
    }
  };

  const handleSubmit = async (values: TaskFormValues) => {
    if (formState?.mode === "edit") {
      await updateTask(formState.task.id, values);
    } else {
      await createTask(values);
    }
    setFormState(null);
  };

  return (
    <div className="relative flex h-full flex-col gap-3 p-4">
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => setFormState({ mode: "create" })}
          aria-label={t("kanban.add_task")}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-white outline-none transition hover:bg-white/15 active:scale-90 focus-visible:ring-2 focus-visible:ring-white/40"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {loading && <KanbanSkeleton />}
      {error && <p className="text-sm text-red-400">{t("kanban.error_loading")}</p>}

      {!loading && !error && tasks.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <LayoutGrid className="h-8 w-8 text-white/25" strokeWidth={1.5} />
          <p className="max-w-[220px] text-sm text-white/40">{t("kanban.empty_state")}</p>
        </div>
      )}

      {!loading && !error && tasks.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-1 gap-3 overflow-x-auto">
            {COLUMNS.map((status, index) => (
              <KanbanColumn
                key={status}
                status={status}
                title={t(COLUMN_LABEL_KEY[status])}
                tasks={tasksByStatus(status)}
                onEditTask={(task) => setFormState({ mode: "edit", task })}
                isFirst={index === 0}
              />
            ))}
          </div>
          <DragOverlay>
            {activeTask && <TaskCard task={activeTask} onEdit={() => {}} dragging />}
          </DragOverlay>
        </DndContext>
      )}

      {formState && (
        <TaskFormModal
          initial={formState.mode === "edit" ? formState.task : null}
          onClose={() => setFormState(null)}
          onSubmit={handleSubmit}
          onDelete={
            formState.mode === "edit"
              ? async () => {
                  await deleteTask(formState.task.id);
                  setFormState(null);
                }
              : undefined
          }
        />
      )}
    </div>
  );
}

export default KanbanBoard;

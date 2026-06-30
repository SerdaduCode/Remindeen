import { useState } from "react";
import { createPortal } from "react-dom";
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
import { ChevronLeft, ChevronRight, LayoutGrid, Plus } from "lucide-react";
import { useTasks, type Task, type TaskStatus } from "@/hooks/use-tasks";
import { useTranslation } from "@/hooks/use-translation";
import { addWeeks, formatWeekRange, getCurrentWeekStart, getIsoWeekNumber, getIsoWeekYear, isCurrentWeek } from "@/lib/iso-week";
import KanbanColumn from "./KanbanColumn";
import KanbanSkeleton from "./KanbanSkeleton";
import KanbanWeekHistory from "./KanbanWeekHistory";
import TaskCard from "./TaskCard";
import TaskFormModal, { type TaskFormValues } from "./TaskFormModal";

const COLUMNS: TaskStatus[] = ["TODO", "DOING", "DONE"];
const COLUMN_LABEL_KEY: Record<TaskStatus, string> = {
  TODO: "kanban.column_todo",
  DOING: "kanban.column_doing",
  DONE: "kanban.column_done",
};

const ARROW_BUTTON_CLASS =
  "flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-white/60 outline-none transition hover:bg-white/10 hover:text-white active:scale-90 focus-visible:ring-2 focus-visible:ring-white/40 disabled:pointer-events-none disabled:opacity-30";

type FormState = { mode: "create" } | { mode: "edit"; task: Task } | null;

function isTaskCompletedInWeek(task: Task, weekStart: Date, weekEnd: Date): boolean {
  if (!task.completedAt) return false;
  const completedTime = new Date(task.completedAt).getTime();
  return completedTime >= weekStart.getTime() && completedTime < weekEnd.getTime();
}

function KanbanBoard() {
  const { tasks, loading, error, createTask, updateTask, updateTaskPosition, deleteTask } =
    useTasks(true);
  const { t, lang } = useTranslation();
  const [formState, setFormState] = useState<FormState>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [weekCursor, setWeekCursor] = useState<Date>(() => getCurrentWeekStart());
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const viewingCurrentWeek = isCurrentWeek(weekCursor);
  const weekEnd = addWeeks(weekCursor, 1);
  const weekLabel = `${t("kanban.week_label_prefix")} ${getIsoWeekNumber(weekCursor)}, ${getIsoWeekYear(weekCursor)} · ${formatWeekRange(weekCursor, lang)}`;

  const tasksByStatus = (status: TaskStatus) =>
    tasks.filter((task) => task.status === status).sort((a, b) => a.position - b.position);

  // Current-week DONE column keeps position-based ordering (drag-to-reorder
  // still applies there); the past-week read-only view sorts by completion
  // time instead since there's no drag/position concept in a historical list.
  const currentWeekDoneTasks = tasksByStatus("DONE").filter((task) =>
    isTaskCompletedInWeek(task, weekCursor, weekEnd),
  );
  const weekHistoryTasks = tasks
    .filter((task) => isTaskCompletedInWeek(task, weekCursor, weekEnd))
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());

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
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setWeekCursor((cursor) => addWeeks(cursor, -1))}
            aria-label={t("kanban.previous_week")}
            className={ARROW_BUTTON_CLASS}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-1 text-xs font-medium whitespace-nowrap text-white/70">{weekLabel}</span>
          <button
            type="button"
            onClick={() => setWeekCursor((cursor) => addWeeks(cursor, 1))}
            disabled={viewingCurrentWeek}
            aria-label={t("kanban.next_week")}
            className={ARROW_BUTTON_CLASS}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {viewingCurrentWeek && (
          <button
            type="button"
            onClick={() => setFormState({ mode: "create" })}
            aria-label={t("kanban.add_task")}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-white outline-none transition hover:bg-white/15 active:scale-90 focus-visible:ring-2 focus-visible:ring-white/40"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>

      {loading && <KanbanSkeleton />}
      {error && <p className="text-sm text-red-400">{t("kanban.error_loading")}</p>}

      {!loading && !error && tasks.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <LayoutGrid className="h-8 w-8 text-white/25" strokeWidth={1.5} />
          <p className="max-w-[220px] text-sm text-white/40">{t("kanban.empty_state")}</p>
        </div>
      )}

      {!loading && !error && tasks.length > 0 && viewingCurrentWeek && (
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
                tasks={status === "DONE" ? currentWeekDoneTasks : tasksByStatus(status)}
                onEditTask={(task) => setFormState({ mode: "edit", task })}
                isFirst={index === 0}
              />
            ))}
          </div>
          {createPortal(
            <DragOverlay>
              {activeTask && <TaskCard task={activeTask} onEdit={() => {}} dragging />}
            </DragOverlay>,
            document.body,
          )}
        </DndContext>
      )}

      {!loading && !error && tasks.length > 0 && !viewingCurrentWeek && (
        <KanbanWeekHistory
          weekLabel={weekLabel}
          tasks={weekHistoryTasks}
          onSelectTask={(task) => setFormState({ mode: "edit", task })}
        />
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

import { useEffect, useRef, useState } from "react";
import { Orbit, Plus, Settings } from "lucide-react";
import { useOrbitTasks, type OrbitTask } from "@/hooks/use-orbit-tasks";
import { DEFAULT_CATEGORY_ID, useOrbitCategories } from "@/hooks/use-orbit-categories";
import { useTranslation } from "@/hooks/use-translation";
import { computeCanvasMetrics, MAX_RADIUS_FALLBACK } from "./orbit-physics";
import OrbitNode from "./OrbitNode";
import PriorityRing from "./PriorityRing";
import TaskFormModal, { type TaskFormValues } from "./TaskFormModal";
import ManageCategoriesModal from "./ManageCategoriesModal";

type FormState = { mode: "create" } | { mode: "edit"; task: OrbitTask } | null;

const INITIAL_METRICS = computeCanvasMetrics(MAX_RADIUS_FALLBACK * 2, MAX_RADIUS_FALLBACK * 2);

function OrbitView() {
  const {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    setFocus,
    setPriority,
    repositionTask,
    reassignCategory,
  } = useOrbitTasks();
  const { t } = useTranslation();
  const {
    categories,
    activeFilters,
    toggleFilter,
    clearFilters,
    createCategory,
    renameCategory,
    recolorCategory,
    deleteCategory,
  } = useOrbitCategories(t("orbit.category.default_name"));
  const containerRef = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState(INITIAL_METRICS);
  const [formState, setFormState] = useState<FormState>(null);
  const [showManageCategories, setShowManageCategories] = useState(false);
  const [completingIds, setCompletingIds] = useState<Set<string>>(new Set());

  const finalizedIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateMetrics = () => setMetrics(computeCanvasMetrics(el.clientWidth, el.clientHeight));
    updateMetrics();
    const observer = new ResizeObserver(updateMetrics);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const focusTask = tasks.find((task) => task.isFocus) ?? null;
  const orbitingTasks = tasks.filter((task) => !task.isFocus);

  const isDimmed = (task: OrbitTask) =>
    !task.isFocus && activeFilters.length > 0 && !activeFilters.includes(task.categoryId);

  const markCompleting = (id: string) => {
    setCompletingIds((prev) => new Set(prev).add(id));
    setFormState(null);
    // Fallback in case the page is navigated away before onAnimationEnd fires.
    setTimeout(() => handleAnimationDone(id), 500);
  };

  const handleAnimationDone = async (id: string) => {
    if (finalizedIds.current.has(id)) return;
    finalizedIds.current.add(id);
    await completeTask(id);
    setCompletingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleSubmit = async (values: TaskFormValues) => {
    if (formState?.mode === "edit") {
      await updateTask(formState.task.id, values);
    } else {
      await createTask(values, metrics);
    }
    setFormState(null);
  };

  const handleDeleteCategory = async (id: string) => {
    await reassignCategory(id, DEFAULT_CATEGORY_ID);
    await deleteCategory(id);
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0a0818]">
      <div className="orbit-nebula orbit-nebula-a" />
      <div className="orbit-nebula orbit-nebula-b" />
      <div className="orbit-nebula orbit-nebula-c" />
      <div className="orbit-nebula orbit-nebula-d" />
      <div className="orbit-nebula orbit-nebula-e" />
      <div className="orbit-starfield absolute inset-0 opacity-70" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.35)_100%)]" />

      <div className="absolute inset-x-14 top-4 z-10 flex flex-col items-center gap-2">
        <div className="whitespace-nowrap text-center text-[11px] tracking-wide text-white/45">
          <span>
            {tasks.length} {t("orbit.stats_tasks_suffix")}
          </span>
          <span className="mx-2 text-white/20">·</span>
          <span>
            {focusTask ? `${t("orbit.stats_focus")}: ${focusTask.title}` : t("orbit.stats_no_focus")}
          </span>
        </div>

        <div className="flex max-w-full flex-wrap items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={() => clearFilters()}
            className={`cursor-pointer rounded-full border px-2.5 py-1 text-[11px] font-medium outline-none transition active:scale-95 ${
              activeFilters.length === 0
                ? "border-white/30 bg-white/15 text-white"
                : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10"
            }`}
          >
            {t("orbit.filter.all")}
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => toggleFilter(category.id)}
              className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium outline-none transition active:scale-95 ${
                activeFilters.includes(category.id)
                  ? "border-white/30 bg-white/15 text-white"
                  : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10"
              }`}
            >
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              {category.name}
            </button>
          ))}
          <button
            type="button"
            aria-label={t("orbit.filter.manage")}
            onClick={() => setShowManageCategories(true)}
            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 outline-none transition hover:bg-white/10 hover:text-white active:scale-95"
          >
            <Settings className="h-3 w-3" />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setFormState({ mode: "create" })}
        aria-label={t("orbit.add_task")}
        className="absolute right-4 top-4 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] outline-none transition hover:bg-white/15 active:scale-90 focus-visible:ring-2 focus-visible:ring-white/40"
      >
        <Plus className="h-4 w-4" />
      </button>

      <div ref={containerRef} className="absolute inset-0">
        <PriorityRing radius={metrics.ringRadius} />

        {focusTask && (
          <OrbitNode
            key={focusTask.id}
            task={focusTask}
            siblings={orbitingTasks}
            containerRef={containerRef}
            isCompleting={completingIds.has(focusTask.id)}
            isDimmed={false}
            focusLabel={t("orbit.stats_focus")}
            onEdit={() => setFormState({ mode: "edit", task: focusTask })}
            onAnimationDone={() => handleAnimationDone(focusTask.id)}
            onReposition={(radius, angle) => repositionTask(focusTask.id, radius, angle)}
          />
        )}
        {orbitingTasks.map((task) => (
          <OrbitNode
            key={task.id}
            task={task}
            siblings={orbitingTasks.filter((sibling) => sibling.id !== task.id)}
            containerRef={containerRef}
            isCompleting={completingIds.has(task.id)}
            isDimmed={isDimmed(task)}
            onEdit={() => setFormState({ mode: "edit", task })}
            onAnimationDone={() => handleAnimationDone(task.id)}
            onReposition={(radius, angle) => repositionTask(task.id, radius, angle)}
            onKnockSibling={(id, radius, angle) => repositionTask(id, radius, angle)}
          />
        ))}
      </div>

      {!loading && tasks.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center">
          <Orbit className="h-8 w-8 text-white/25" strokeWidth={1.5} />
          <p className="max-w-[220px] text-sm text-white/40">{t("orbit.empty_state")}</p>
          <button
            type="button"
            onClick={() => setFormState({ mode: "create" })}
            className="cursor-pointer rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-white/80 outline-none transition hover:bg-white/10 active:scale-95 focus-visible:ring-2 focus-visible:ring-white/40"
          >
            {t("orbit.add_task")}
          </button>
        </div>
      )}

      {formState && (
        <TaskFormModal
          initial={formState.mode === "edit" ? formState.task : null}
          categories={categories}
          onClose={() => setFormState(null)}
          onSubmit={handleSubmit}
          onCreateCategory={createCategory}
          onDelete={
            formState.mode === "edit"
              ? async () => {
                  await deleteTask(formState.task.id);
                  setFormState(null);
                }
              : undefined
          }
          onComplete={
            formState.mode === "edit" ? () => markCompleting(formState.task.id) : undefined
          }
          onToggleFocus={
            formState.mode === "edit"
              ? async () => {
                  await setFocus(formState.task.isFocus ? null : formState.task.id, metrics);
                  setFormState(null);
                }
              : undefined
          }
          onTogglePriority={
            formState.mode === "edit"
              ? async () => {
                  await setPriority(formState.task.id, !formState.task.isPriority, metrics);
                  setFormState(null);
                }
              : undefined
          }
        />
      )}

      {showManageCategories && (
        <ManageCategoriesModal
          categories={categories}
          onClose={() => setShowManageCategories(false)}
          onCreate={createCategory}
          onRename={renameCategory}
          onRecolor={recolorCategory}
          onDelete={handleDeleteCategory}
        />
      )}
    </div>
  );
}

export default OrbitView;

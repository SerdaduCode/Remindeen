import { useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Task, TaskInput, TaskPriority } from "@/hooks/use-tasks";
import { useTranslation } from "@/hooks/use-translation";

export interface TaskFormValues extends TaskInput {}

interface TaskFormModalProps {
  initial: Task | null;
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => Promise<void>;
  onDelete?: () => Promise<void>;
}

const toDateInputValue = (value: string | null) => (value ? value.slice(0, 10) : "");

function TaskFormModal({ initial, onClose, onSubmit, onDelete }: TaskFormModalProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [startDate, setStartDate] = useState(toDateInputValue(initial?.startDate ?? null));
  const [dueDate, setDueDate] = useState(toDateInputValue(initial?.dueDate ?? null));
  const [priority, setPriority] = useState<TaskPriority | "none">(initial?.priority ?? "none");
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isEdit = initial !== null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) {
      setError(true);
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        startDate: startDate || undefined,
        dueDate: dueDate || undefined,
        priority: priority === "none" ? null : priority,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (window.confirm(t("kanban.form.delete_confirm"))) {
      await onDelete();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[380px] rounded-2xl bg-zinc-900/70 p-5 text-white ring-1 ring-white/15 backdrop-blur-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="mb-4 text-sm font-semibold tracking-wide text-white/90">
          {isEdit ? t("kanban.form.edit_title") : t("kanban.form.create_title")}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="task-title" className="text-white/70">
              {t("kanban.form.title_label")}
            </Label>
            <Input
              id="task-title"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                if (error) setError(false);
              }}
              placeholder={t("kanban.form.title_placeholder")}
              aria-invalid={error}
              className="border-white/15 bg-white/5 text-white placeholder:text-white/30"
              autoFocus
            />
            {error && <p className="text-xs text-red-400">{t("kanban.form.title_required")}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-description" className="text-white/70">
              {t("kanban.form.description_label")}
            </Label>
            <Input
              id="task-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={t("kanban.form.description_placeholder")}
              className="border-white/15 bg-white/5 text-white placeholder:text-white/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="task-start-date" className="text-white/70">
                {t("kanban.form.start_date_label")}
              </Label>
              <Input
                id="task-start-date"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="border-white/15 bg-white/5 text-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-due-date" className="text-white/70">
                {t("kanban.form.due_date_label")}
              </Label>
              <Input
                id="task-due-date"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                className="border-white/15 bg-white/5 text-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-white/70">{t("kanban.form.priority_label")}</Label>
            <Select value={priority} onValueChange={(value) => setPriority(value as TaskPriority | "none")}>
              <SelectTrigger className="w-full border-white/15 bg-white/5 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-zinc-900 text-white">
                <SelectItem value="none">{t("kanban.form.priority_none")}</SelectItem>
                <SelectItem value="Low">{t("kanban.form.priority_low")}</SelectItem>
                <SelectItem value="Medium">{t("kanban.form.priority_medium")}</SelectItem>
                <SelectItem value="High">{t("kanban.form.priority_high")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 pt-1">
            {isEdit && onDelete && (
              <Button
                type="button"
                variant="destructive"
                className="cursor-pointer active:scale-[0.98]"
                onClick={handleDelete}
              >
                {t("kanban.form.delete")}
              </Button>
            )}
            <div className="ml-auto flex gap-2">
              <Button
                type="button"
                variant="ghost"
                className="cursor-pointer text-white/70 active:scale-[0.98] hover:bg-white/10 hover:text-white"
                onClick={onClose}
              >
                {t("kanban.form.cancel")}
              </Button>
              <Button type="submit" disabled={submitting} className="cursor-pointer active:scale-[0.98]">
                {t("kanban.form.save")}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

export default TaskFormModal;

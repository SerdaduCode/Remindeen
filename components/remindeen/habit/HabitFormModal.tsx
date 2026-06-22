import { useState } from "react";
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
import type { Habit, HabitFrequency, HabitInput } from "@/hooks/use-habits";
import type { TaskPriority } from "@/hooks/use-tasks";
import { useTranslation } from "@/hooks/use-translation";

export interface HabitFormValues extends HabitInput {}

interface HabitFormModalProps {
  initial: Habit | null;
  onClose: () => void;
  onSubmit: (values: HabitFormValues) => Promise<void>;
  onDelete?: () => Promise<void>;
}

function HabitFormModal({ initial, onClose, onSubmit, onDelete }: HabitFormModalProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [frequency, setFrequency] = useState<HabitFrequency>(initial?.frequency ?? "daily");
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
        frequency,
        priority: priority === "none" ? null : priority,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (window.confirm(t("habit.form.delete_confirm"))) {
      await onDelete();
    }
  };

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[380px] rounded-2xl border border-white/10 bg-zinc-900 p-5 text-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)]"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="mb-4 text-sm font-semibold tracking-wide text-white/90">
          {isEdit ? t("habit.form.edit_title") : t("habit.form.create_title")}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="habit-title" className="text-white/70">
              {t("habit.form.title_label")}
            </Label>
            <Input
              id="habit-title"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                if (error) setError(false);
              }}
              placeholder={t("habit.form.title_placeholder")}
              aria-invalid={error}
              className="border-white/15 bg-white/5 text-white placeholder:text-white/30"
              autoFocus
            />
            {error && <p className="text-xs text-red-400">{t("habit.form.title_required")}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="habit-description" className="text-white/70">
              {t("habit.form.description_label")}
            </Label>
            <Input
              id="habit-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={t("habit.form.description_placeholder")}
              className="border-white/15 bg-white/5 text-white placeholder:text-white/30"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-white/70">{t("habit.form.frequency_label")}</Label>
            <Select value={frequency} onValueChange={(value) => setFrequency(value as HabitFrequency)}>
              <SelectTrigger className="w-full border-white/15 bg-white/5 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-zinc-900 text-white">
                <SelectItem value="daily">{t("habit.frequency_daily")}</SelectItem>
                <SelectItem value="weekly">{t("habit.frequency_weekly")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-white/70">{t("habit.form.priority_label")}</Label>
            <Select value={priority} onValueChange={(value) => setPriority(value as TaskPriority | "none")}>
              <SelectTrigger className="w-full border-white/15 bg-white/5 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-zinc-900 text-white">
                <SelectItem value="none">{t("habit.form.priority_none")}</SelectItem>
                <SelectItem value="Low">{t("habit.form.priority_low")}</SelectItem>
                <SelectItem value="Medium">{t("habit.form.priority_medium")}</SelectItem>
                <SelectItem value="High">{t("habit.form.priority_high")}</SelectItem>
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
                {t("habit.form.delete")}
              </Button>
            )}
            <div className="ml-auto flex gap-2">
              <Button
                type="button"
                variant="ghost"
                className="cursor-pointer text-white/70 active:scale-[0.98] hover:bg-white/10 hover:text-white"
                onClick={onClose}
              >
                {t("habit.form.cancel")}
              </Button>
              <Button type="submit" disabled={submitting} className="cursor-pointer active:scale-[0.98]">
                {t("habit.form.save")}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default HabitFormModal;

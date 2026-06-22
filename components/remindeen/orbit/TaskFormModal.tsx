import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OrbitTask } from "@/hooks/use-orbit-tasks";
import type { OrbitCategory } from "@/hooks/use-orbit-categories";
import { useTranslation } from "@/hooks/use-translation";

const COLOR_PRESETS = ["#33d199", "#5cc8ff", "#ffb84d", "#ff5c8a", "#7c5cff"];

export interface TaskFormValues {
  title: string;
  note?: string;
  color: string;
  categoryId: string;
}

interface TaskFormModalProps {
  initial: OrbitTask | null;
  categories: OrbitCategory[];
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => Promise<void>;
  onCreateCategory: (input: { name: string; color: string }) => Promise<OrbitCategory>;
  onDelete?: () => Promise<void>;
  onComplete?: () => void;
  onToggleFocus?: () => Promise<void>;
  onTogglePriority?: () => Promise<void>;
}

function TaskFormModal({
  initial,
  categories,
  onClose,
  onSubmit,
  onCreateCategory,
  onDelete,
  onComplete,
  onToggleFocus,
  onTogglePriority,
}: TaskFormModalProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [note, setNote] = useState(initial?.note ?? "");
  const [color, setColor] = useState(initial?.color ?? COLOR_PRESETS[0]);
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? "");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState(COLOR_PRESETS[0]);
  const [error, setError] = useState(false);

  const isEdit = initial !== null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) {
      setError(true);
      return;
    }
    await onSubmit({ title: title.trim(), note: note.trim() || undefined, color, categoryId });
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    const created = await onCreateCategory({ name: newCategoryName.trim(), color: newCategoryColor });
    setCategoryId(created.id);
    setNewCategoryName("");
    setNewCategoryColor(COLOR_PRESETS[0]);
    setIsCreatingCategory(false);
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (window.confirm(t("orbit.form.delete_confirm"))) {
      await onDelete();
    }
  };

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[360px] rounded-2xl border border-white/10 bg-zinc-900 p-5 text-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)] align-self-center"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="mb-4 text-sm font-semibold tracking-wide text-white/90">
          {isEdit ? t("orbit.form.edit_title") : t("orbit.form.create_title")}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="orbit-task-title" className="text-white/70">
              {t("orbit.form.title_label")}
            </Label>
            <Input
              id="orbit-task-title"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                if (error) setError(false);
              }}
              placeholder={t("orbit.form.title_placeholder")}
              aria-invalid={error}
              className="border-white/15 bg-white/5 text-white placeholder:text-white/30"
              autoFocus
            />
            {error && (
              <p className="text-xs text-red-400">{t("orbit.form.title_required")}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="orbit-task-note" className="text-white/70">
              {t("orbit.form.note_label")}
            </Label>
            <Input
              id="orbit-task-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={t("orbit.form.note_placeholder")}
              className="border-white/15 bg-white/5 text-white placeholder:text-white/30"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-white/70">{t("orbit.form.color_label")}</Label>
            <div className="flex items-center gap-2">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  aria-label={preset}
                  onClick={() => setColor(preset)}
                  className={`h-7 w-7 cursor-pointer rounded-full outline-none transition active:scale-90 ${
                    color === preset ? "ring-2 ring-white" : "ring-1 ring-white/20"
                  }`}
                  style={{ backgroundColor: preset }}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(event) => setColor(event.target.value)}
                aria-label={t("orbit.form.color_label")}
                className="h-7 w-7 cursor-pointer rounded-full border border-white/20 bg-transparent p-0"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-white/70">{t("orbit.form.category_label")}</Label>
            <div className="flex items-center gap-2">
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="flex-1 border-white/15 bg-white/5 text-white">
                  <SelectValue placeholder={t("orbit.form.category_label")} />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-zinc-900 text-white">
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <span
                        aria-hidden="true"
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                type="button"
                aria-label={t("orbit.form.category_add")}
                onClick={() => setIsCreatingCategory((prev) => !prev)}
                className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md border border-white/15 bg-white/5 text-white/70 outline-none transition hover:bg-white/10 active:scale-95"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {isCreatingCategory && (
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-2">
                <Input
                  value={newCategoryName}
                  onChange={(event) => setNewCategoryName(event.target.value)}
                  placeholder={t("orbit.form.category_new_placeholder")}
                  className="border-white/15 bg-white/5 text-white placeholder:text-white/30"
                  autoFocus
                />
                <input
                  type="color"
                  value={newCategoryColor}
                  onChange={(event) => setNewCategoryColor(event.target.value)}
                  aria-label={t("orbit.form.color_label")}
                  className="h-7 w-7 shrink-0 cursor-pointer rounded-full border border-white/20 bg-transparent p-0"
                />
                <Button
                  type="button"
                  size="sm"
                  className="shrink-0 cursor-pointer active:scale-[0.98]"
                  onClick={handleCreateCategory}
                >
                  {t("orbit.form.category_add")}
                </Button>
              </div>
            )}
          </div>

          {isEdit && onToggleFocus && (
            <Label
              htmlFor="orbit-task-focus"
              className="cursor-pointer justify-between rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-white/70 transition hover:bg-white/10 active:scale-[0.98]"
            >
              {t("orbit.form.focus_label")}
              <Checkbox
                id="orbit-task-focus"
                checked={initial?.isFocus ?? false}
                onCheckedChange={() => onToggleFocus()}
                className="data-[state=checked]:border-transparent data-[state=checked]:bg-[#33d199] data-[state=checked]:text-zinc-950 data-[state=checked]:shadow-[0_0_12px_rgba(51,209,153,0.45)]"
              />
            </Label>
          )}

          {isEdit && onTogglePriority && (
            <Label
              htmlFor="orbit-task-priority"
              className="cursor-pointer justify-between rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-white/70 transition hover:bg-white/10 active:scale-[0.98]"
            >
              {t("orbit.form.priority_label")}
              <Checkbox
                id="orbit-task-priority"
                checked={initial?.isPriority ?? false}
                onCheckedChange={() => onTogglePriority()}
                className="data-[state=checked]:border-transparent data-[state=checked]:bg-[#ffb84d] data-[state=checked]:text-zinc-950 data-[state=checked]:shadow-[0_0_12px_rgba(255,184,77,0.45)]"
              />
            </Label>
          )}

          {isEdit && onComplete && (
            <Button
              type="button"
              variant="outline"
              className="w-full cursor-pointer border-white/15 bg-white/5 text-white active:scale-[0.98] hover:bg-white/10"
              onClick={onComplete}
            >
              <Check className="h-4 w-4" />
              {t("orbit.form.complete")}
            </Button>
          )}

          <div className="flex items-center gap-2 pt-1">
            {isEdit && onDelete && (
              <Button
                type="button"
                variant="destructive"
                className="cursor-pointer active:scale-[0.98]"
                onClick={handleDelete}
              >
                {t("orbit.form.delete")}
              </Button>
            )}
            <div className="ml-auto flex gap-2">
              <Button
                type="button"
                variant="ghost"
                className="cursor-pointer text-white/70 active:scale-[0.98] hover:bg-white/10 hover:text-white"
                onClick={onClose}
              >
                {t("orbit.form.cancel")}
              </Button>
              <Button type="submit" className="cursor-pointer active:scale-[0.98]">
                {t("orbit.form.save")}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskFormModal;

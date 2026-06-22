import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { OrbitCategory } from "@/hooks/use-orbit-categories";
import { DEFAULT_CATEGORY_ID } from "@/hooks/use-orbit-categories";
import { useTranslation } from "@/hooks/use-translation";

const COLOR_PRESETS = ["#33d199", "#5cc8ff", "#ffb84d", "#ff5c8a", "#7c5cff"];

interface CategoryRowProps {
  category: OrbitCategory;
  onRename: (name: string) => Promise<void>;
  onRecolor: (color: string) => Promise<void>;
  onDelete: () => Promise<void>;
}

function CategoryRow({ category, onRename, onRecolor, onDelete }: CategoryRowProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(category.name);
  const isDefault = category.id === DEFAULT_CATEGORY_ID;

  const commitName = () => {
    const trimmed = name.trim();
    if (trimmed && trimmed !== category.name) {
      onRename(trimmed);
    } else {
      setName(category.name);
    }
  };

  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-2">
      <input
        type="color"
        value={category.color}
        onChange={(event) => onRecolor(event.target.value)}
        aria-label={t("orbit.form.color_label")}
        className="h-7 w-7 shrink-0 cursor-pointer rounded-full border border-white/20 bg-transparent p-0"
      />
      <Input
        value={name}
        onChange={(event) => setName(event.target.value)}
        onBlur={commitName}
        className="border-white/15 bg-white/5 text-white placeholder:text-white/30"
      />
      <button
        type="button"
        aria-label={t("orbit.manage.delete")}
        disabled={isDefault}
        onClick={() => {
          if (window.confirm(t("orbit.manage.delete_confirm"))) onDelete();
        }}
        className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md border border-white/15 bg-white/5 text-white/70 outline-none transition hover:bg-white/10 hover:text-red-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

interface ManageCategoriesModalProps {
  categories: OrbitCategory[];
  onClose: () => void;
  onCreate: (input: { name: string; color: string }) => Promise<OrbitCategory>;
  onRename: (id: string, name: string) => Promise<void>;
  onRecolor: (id: string, color: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function ManageCategoriesModal({
  categories,
  onClose,
  onCreate,
  onRename,
  onRecolor,
  onDelete,
}: ManageCategoriesModalProps) {
  const { t } = useTranslation();
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(COLOR_PRESETS[0]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await onCreate({ name: newName.trim(), color: newColor });
    setNewName("");
    setNewColor(COLOR_PRESETS[0]);
  };

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[360px] rounded-2xl border border-white/10 bg-zinc-900 p-5 text-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)]"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="mb-4 text-sm font-semibold tracking-wide text-white/90">
          {t("orbit.manage.title")}
        </h2>

        <div className="max-h-[280px] space-y-2 overflow-y-auto pr-1">
          {categories.map((category) => (
            <CategoryRow
              key={category.id}
              category={category}
              onRename={(name) => onRename(category.id, name)}
              onRecolor={(color) => onRecolor(category.id, color)}
              onDelete={() => onDelete(category.id)}
            />
          ))}
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-2">
          <input
            type="color"
            value={newColor}
            onChange={(event) => setNewColor(event.target.value)}
            aria-label={t("orbit.form.color_label")}
            className="h-7 w-7 shrink-0 cursor-pointer rounded-full border border-white/20 bg-transparent p-0"
          />
          <Input
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            placeholder={t("orbit.form.category_new_placeholder")}
            className="border-white/15 bg-white/5 text-white placeholder:text-white/30"
          />
          <Button
            type="button"
            size="sm"
            className="shrink-0 cursor-pointer active:scale-[0.98]"
            onClick={handleCreate}
          >
            <Plus className="h-4 w-4" />
            {t("orbit.form.category_add")}
          </Button>
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            type="button"
            variant="ghost"
            className="cursor-pointer text-white/70 active:scale-[0.98] hover:bg-white/10 hover:text-white"
            onClick={onClose}
          >
            {t("orbit.manage.close")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ManageCategoriesModal;

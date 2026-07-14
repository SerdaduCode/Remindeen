import { useState } from "react";
import { ListChecks, Plus, Check, X } from "lucide-react";
import { useTodolist } from "@/hooks/use-todolist";
import { useTranslation } from "@/hooks/use-translation";

function Todolist() {
  const { items, error, createItem, toggleItem, deleteItem } = useTodolist(true);
  const { t } = useTranslation();
  const [input, setInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    await createItem(text);
  };

  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <div className="flex items-center gap-2">
        <ListChecks className="h-4 w-4 text-fuchsia-400" />
        <h3 className="text-sm font-semibold text-white/90">{t("todolist.title")}</h3>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("todolist.input_placeholder")}
          className="inp"
        />
        <button
          type="submit"
          aria-label={t("todolist.add_item")}
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-white outline-none transition hover:bg-white/15 active:scale-90"
        >
          <Plus className="h-4 w-4" />
        </button>
      </form>

      {error && <p className="text-sm text-red-400">{t("todolist.error_loading")}</p>}

      {!error && items.length === 0 && (
        <p className="py-4 text-center text-xs text-white/40">{t("todolist.empty_state")}</p>
      )}

      {!error && items.length > 0 && (
        <div className="flex flex-col gap-1.5 overflow-y-auto glass-scrollbar">
          {items.map((item) => (
            <div
              key={item.id}
              className="group flex items-center gap-2.5 rounded-lg bg-white/[0.06] px-3 py-2 ring-1 ring-white/10"
            >
              <button
                type="button"
                onClick={() => toggleItem(item.id)}
                className={`flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full border transition ${
                  item.done
                    ? "border-emerald-400/60 bg-emerald-400/20 text-emerald-200"
                    : "border-white/20 text-transparent hover:border-white/40"
                }`}
              >
                <Check className="h-3 w-3" />
              </button>
              <span className={`flex-1 truncate text-xs ${item.done ? "text-white/35 line-through" : "text-white/85"}`}>
                {item.text}
              </span>
              <button
                type="button"
                onClick={() => deleteItem(item.id)}
                aria-label={t("todolist.delete_item")}
                className="shrink-0 cursor-pointer rounded-md p-1 text-white/30 opacity-0 transition group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Todolist;

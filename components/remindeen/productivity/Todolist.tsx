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

      <form onSubmit={handleSubmit} className="flex gap-1.5">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("todolist.input_placeholder")}
          className="h-9 min-w-0 flex-1 rounded-lg border border-white/10 bg-white/[0.06] px-3 text-xs text-white/90 outline-none transition placeholder:text-white/35 focus-visible:border-white/25 focus-visible:ring-2 focus-visible:ring-white/15"
        />
        <button
          type="submit"
          aria-label={t("todolist.add_item")}
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white outline-none transition duration-200 hover:bg-white/15 active:scale-90 focus-visible:ring-2 focus-visible:ring-white/40"
        >
          <Plus className="h-4 w-4" />
        </button>
      </form>

      {error && <p className="text-sm text-red-400">{t("todolist.error_loading")}</p>}

      {!error && items.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-1.5 py-6 text-center">
          <ListChecks className="h-5 w-5 text-white/20" />
          <p className="text-xs text-white/40">{t("todolist.empty_state")}</p>
        </div>
      )}

      {!error && items.length > 0 && (
        <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto glass-scrollbar">
          {items.map((item) => (
            <div
              key={item.id}
              className="group flex items-center gap-2.5 rounded-lg bg-white/[0.06] px-3 py-2.5 ring-1 ring-white/10 transition-colors duration-200 hover:bg-white/[0.09]"
            >
              <button
                type="button"
                onClick={() => toggleItem(item.id)}
                className={`flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-colors duration-200 ${
                  item.done
                    ? "border-emerald-400/70 bg-emerald-400/25 text-emerald-200"
                    : "border-white/25 text-transparent hover:border-white/50"
                }`}
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <span className={`flex-1 truncate text-xs ${item.done ? "text-white/35 line-through" : "text-white/85"}`}>
                {item.text}
              </span>
              <button
                type="button"
                onClick={() => deleteItem(item.id)}
                aria-label={t("todolist.delete_item")}
                className="shrink-0 cursor-pointer rounded-md p-1 text-white/30 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40"
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

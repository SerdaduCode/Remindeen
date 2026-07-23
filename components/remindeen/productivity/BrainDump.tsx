import { useState } from "react";
import { Brain, Plus, X } from "lucide-react";
import { useBrainDump, type BrainDumpTheme } from "@/hooks/use-brain-dump";
import { useTranslation } from "@/hooks/use-translation";

const THEMES: { key: BrainDumpTheme; labelKey: string; dot: string; chip: string }[] = [
  { key: "ide", labelKey: "brainDump.theme_ide", dot: "bg-violet-400", chip: "bg-violet-400/15 text-violet-300 ring-violet-400/30" },
  { key: "kerja", labelKey: "brainDump.theme_kerja", dot: "bg-sky-400", chip: "bg-sky-400/15 text-sky-300 ring-sky-400/30" },
  { key: "pribadi", labelKey: "brainDump.theme_pribadi", dot: "bg-rose-400", chip: "bg-rose-400/15 text-rose-300 ring-rose-400/30" },
  { key: "dakwah", labelKey: "brainDump.theme_dakwah", dot: "bg-emerald-400", chip: "bg-emerald-400/15 text-emerald-300 ring-emerald-400/30" },
];

function BrainDump() {
  const { notes, loading, error, createNote, deleteNote } = useBrainDump(true);
  const { t } = useTranslation();
  const [selectedTheme, setSelectedTheme] = useState<BrainDumpTheme>("ide");
  const [input, setInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = input.trim();
    if (!body) return;
    setInput("");
    await createNote({ theme: selectedTheme, body });
  };

  return (
    <div className="flex h-full flex-col gap-2.5 p-4">
      <div className="flex items-center gap-2">
        <Brain className="h-4 w-4 text-purple-400" />
        <h3 className="text-sm font-semibold text-white/90">{t("brainDump.title")}</h3>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {THEMES.map((theme) => (
          <button
            key={theme.key}
            type="button"
            onClick={() => setSelectedTheme(theme.key)}
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 transition-colors duration-200 ${
              theme.key === selectedTheme
                ? theme.chip
                : "bg-white/[0.06] text-white/40 ring-white/10 hover:bg-white/10 hover:text-white/70"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${theme.dot}`} />
            {t(theme.labelKey)}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-1.5">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("brainDump.input_placeholder")}
          className="h-9 min-w-0 flex-1 rounded-lg border border-white/10 bg-white/[0.06] px-3 text-xs text-white/90 outline-none transition placeholder:text-white/35 focus-visible:border-white/25 focus-visible:ring-2 focus-visible:ring-white/15"
        />
        <button
          type="submit"
          aria-label={t("brainDump.add_note")}
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white outline-none transition duration-200 hover:bg-white/15 active:scale-90 focus-visible:ring-2 focus-visible:ring-white/40"
        >
          <Plus className="h-4 w-4" />
        </button>
      </form>

      {error && <p className="text-sm text-red-400">{t("brainDump.error_loading")}</p>}

      {!loading && !error && notes.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-1.5 py-6 text-center">
          <Brain className="h-5 w-5 text-white/20" />
          <p className="text-xs text-white/40">{t("brainDump.empty_state")}</p>
        </div>
      )}

      {!loading && !error && notes.length > 0 && (
        <div className="flex max-h-[130px] flex-col gap-1.5 overflow-y-auto glass-scrollbar">
          {notes.map((note) => {
            const theme = THEMES.find((th) => th.key === note.theme) ?? THEMES[0];
            return (
              <div
                key={note.id}
                className="group flex items-start gap-2.5 rounded-lg bg-white/[0.06] px-3 py-2 ring-1 ring-white/10 transition-colors duration-200 hover:bg-white/[0.09]"
              >
                <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${theme.dot}`} />
                <span className="flex-1 border-l border-white/10 pl-2.5 text-xs text-white/85">{note.body}</span>
                <button
                  type="button"
                  onClick={() => deleteNote(note.id)}
                  aria-label={t("brainDump.delete_note")}
                  className="shrink-0 cursor-pointer rounded-md p-1 text-white/30 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default BrainDump;

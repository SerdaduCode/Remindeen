import { BookOpen, Plus } from "lucide-react";
import { useQuranProgress } from "@/hooks/use-quran-progress";
import { useTranslation } from "@/hooks/use-translation";

const PAGES_PER_JUZ = 20;
const TOTAL_JUZ = 30;

function QuranProgress() {
  const { progress, loading, incrementPage } = useQuranProgress(true);
  const { t } = useTranslation();

  const juzCompleted = progress?.juzCompleted ?? 0;
  const pagesInCurrentJuz = progress?.pagesInCurrentJuz ?? 0;
  const currentJuz = Math.min(juzCompleted + 1, TOTAL_JUZ);
  const pct = Math.min(100, Math.round(((juzCompleted + pagesInCurrentJuz / PAGES_PER_JUZ) / TOTAL_JUZ) * 100));

  return (
    <div className="flex flex-col gap-2.5 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-teal-400" />
          <h3 className="text-sm font-semibold text-white/90">{t("quranProgress.title")}</h3>
        </div>
        <button
          type="button"
          onClick={() => incrementPage()}
          disabled={loading}
          aria-label={t("quranProgress.add_page_aria")}
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-white outline-none transition hover:bg-white/15 active:scale-90 disabled:pointer-events-none disabled:opacity-30"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex items-center justify-between text-xs text-white/60">
        <span>
          {t("quranProgress.juz_prefix")} {currentJuz} · {pagesInCurrentJuz}/{PAGES_PER_JUZ} {t("quranProgress.pages_suffix")}
        </span>
        <span className="font-semibold text-white/80">{pct}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-teal-400/80 transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default QuranProgress;

import { useState } from "react";
import { BookOpen } from "lucide-react";
import { useQuranProgress } from "@/hooks/use-quran-progress";
import { useTranslation } from "@/hooks/use-translation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function QuranProgress() {
  const { progress, surahs, loading, updateReading } = useQuranProgress(true);
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);

  const currentSurah = surahs.find((surah) => surah.id === progress?.currentSurahId) ?? null;
  const currentAyahNumber = progress?.currentAyahNumber ?? null;
  const pct = currentSurah && currentAyahNumber
    ? Math.min(100, Math.round((currentAyahNumber / currentSurah.numberOfAyahs) * 100))
    : 0;

  const ayahOptions = currentSurah
    ? Array.from({ length: currentSurah.numberOfAyahs }, (_, index) => index + 1)
    : [];

  const handleSurahChange = async (value: string) => {
    setSaving(true);
    try {
      await updateReading(Number(value), 1);
    } finally {
      setSaving(false);
    }
  };

  const handleAyahChange = async (value: string) => {
    if (!currentSurah) return;
    setSaving(true);
    try {
      await updateReading(currentSurah.id, Number(value));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-2.5 p-4">
      <div className="flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-teal-400" />
        <h3 className="text-sm font-semibold text-white/90">{t("quranProgress.title")}</h3>
      </div>

      <div className="flex gap-2">
        <Select
          value={currentSurah ? String(currentSurah.id) : undefined}
          onValueChange={handleSurahChange}
          disabled={loading || saving || surahs.length === 0}
        >
          <SelectTrigger size="sm" className="flex-1 border-white/10 bg-white/5 text-white/90">
            <SelectValue placeholder={t("quranProgress.select_surah_placeholder")} />
          </SelectTrigger>
          <SelectContent>
            {surahs.map((surah) => (
              <SelectItem key={surah.id} value={String(surah.id)}>
                {surah.number}. {surah.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={currentAyahNumber ? String(currentAyahNumber) : undefined}
          onValueChange={handleAyahChange}
          disabled={!currentSurah || loading || saving}
        >
          <SelectTrigger size="sm" className="w-20 border-white/10 bg-white/5 text-white/90">
            <SelectValue placeholder={t("quranProgress.select_ayah_placeholder")} />
          </SelectTrigger>
          <SelectContent>
            {ayahOptions.map((number) => (
              <SelectItem key={number} value={String(number)}>
                {number}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between text-xs text-white/60">
        <span>
          {currentSurah && currentAyahNumber
            ? `${t("quranProgress.surah_prefix")} ${currentSurah.name} · ${t("quranProgress.ayah_prefix")} ${currentAyahNumber}`
            : t("quranProgress.no_progress")}
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

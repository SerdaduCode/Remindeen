import { Clock, Check } from "lucide-react";
import { usePrayerCheckins, type Prayer } from "@/hooks/use-prayer-checkins";
import { useTranslation } from "@/hooks/use-translation";
import { prayerGapInfo } from "@/lib/prayer-gap";

const PRAYER_ORDER: Prayer[] = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

function PrayerTracker() {
  const { checkIns, loading, error, toggle } = usePrayerCheckins(true);
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2.5 p-4">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-amber-400" />
        <h3 className="text-sm font-semibold text-white/90">{t("prayerCheckin.title")}</h3>
      </div>

      {error && <p className="text-sm text-red-400">{t("prayerCheckin.error_loading")}</p>}

      {!error && (
        <div className="flex flex-col gap-1.5">
          {loading && checkIns.length === 0
            ? PRAYER_ORDER.map((prayer) => (
                <div key={prayer} className="h-[38px] animate-pulse rounded-lg bg-white/[0.04]" />
              ))
            : PRAYER_ORDER.map((prayer) => {
                const checkIn = checkIns.find((c) => c.prayer === prayer);
                if (!checkIn) return null;
                const done = checkIn.actualTime !== null;
                const info = prayerGapInfo(checkIn.scheduledTime, checkIn.actualTime, t);

                return (
                  <div
                    key={prayer}
                    className="flex items-center justify-between gap-2 rounded-lg bg-white/[0.06] px-3 py-2 ring-1 ring-white/10"
                  >
                    <button
                      type="button"
                      onClick={() => toggle(prayer)}
                      className="flex flex-1 cursor-pointer items-center gap-2.5 text-left"
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
                          done ? "border-emerald-400/60 bg-emerald-400/20 text-emerald-200" : "border-white/20 text-transparent"
                        }`}
                      >
                        <Check className="h-3 w-3" />
                      </span>
                      <span className="text-xs font-medium text-white/85">{t(`prayers.${prayer.toLowerCase()}`)}</span>
                      <span className="text-[11px] text-white/40">{checkIn.scheduledTime}</span>
                    </button>
                    <span className={`shrink-0 text-[11px] font-medium ${info.className}`}>{info.text}</span>
                  </div>
                );
              })}
        </div>
      )}
    </div>
  );
}

export default PrayerTracker;

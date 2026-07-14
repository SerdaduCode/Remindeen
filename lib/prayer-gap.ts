export interface PrayerGapInfo {
  text: string;
  className: string;
}

const timeStringToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const dateToMinutes = (iso: string): number => {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
};

// Port of the prototype's prayerGapInfo(): ≤5min late (or early) reads as
// on-time, ≤30min is a mild amber warning, beyond that is a red late flag.
export function prayerGapInfo(
  scheduledTime: string,
  actualTime: string | null,
  t: (key: string) => string
): PrayerGapInfo {
  if (!actualTime) {
    return { text: t("prayerCheckin.not_marked"), className: "text-white/40" };
  }

  const gap = dateToMinutes(actualTime) - timeStringToMinutes(scheduledTime);

  if (gap <= 5) {
    const text = gap <= 0 ? t("prayerCheckin.on_time") : `${t("prayerCheckin.on_time")} (+${gap}m)`;
    return { text, className: "text-emerald-300" };
  }
  if (gap <= 30) {
    return { text: `${t("prayerCheckin.late_prefix")} ${gap}m`, className: "text-amber-300" };
  }
  return { text: `${t("prayerCheckin.late_prefix")} ${gap}m`, className: "text-red-400" };
}

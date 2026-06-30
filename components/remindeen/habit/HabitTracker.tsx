import { useState } from "react";
import { CalendarCheck, ChevronLeft, ChevronRight, Flame, Check, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useHabits, type Habit, type HabitCheckIn } from "@/hooks/use-habits";
import { useTranslation } from "@/hooks/use-translation";
import { addWeeks, formatWeekRange, getCurrentWeekStart, getIsoWeekNumber, getIsoWeekYear, isCurrentWeek } from "@/lib/iso-week";
import HabitFormModal, { type HabitFormValues } from "./HabitFormModal";
import HabitSkeleton from "./HabitSkeleton";

type FormState = { mode: "create" } | { mode: "edit"; habit: Habit } | null;

const FREQUENCY_KEY: Record<Habit["frequency"], string> = {
  daily: "habit.frequency_daily",
  weekly: "habit.frequency_weekly",
};

const WEEK_DAY_ABBR = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const ARROW_BUTTON_CLASS =
  "flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-white/60 outline-none transition hover:bg-white/10 hover:text-white active:scale-90 focus-visible:ring-2 focus-visible:ring-white/40 disabled:pointer-events-none disabled:opacity-30";

function scheduleMetadata(habit: Habit): string | null {
  if (habit.weekDays.length > 0) {
    return habit.weekDays.map((day) => WEEK_DAY_ABBR[day]).join(" · ");
  }
  if (habit.frequency === "daily" && habit.reminderTime) {
    return habit.reminderTime;
  }
  return null;
}

function dateStringForWeekDay(weekStart: Date, mondayOffset: number): string {
  const d = new Date(weekStart);
  d.setUTCDate(d.getUTCDate() + mondayOffset);
  return d.toISOString().slice(0, 10);
}

// Mon–Sun checked state for a daily habit in the viewed week, derived from
// the already-fetched check-in history (no new fetch).
function weekDayCheckedState(weekStart: Date, checkIns: HabitCheckIn[]): boolean[] {
  const checkedDates = new Set(checkIns.map((c) => c.periodStart.slice(0, 10)));
  return Array.from({ length: 7 }, (_, i) => checkedDates.has(dateStringForWeekDay(weekStart, i)));
}

// Weekly habits record one check-in per ISO week, not per day, so the
// viewed week's state is a single boolean rather than a 7-cell strip.
function weekCheckedState(weekStart: Date, checkIns: HabitCheckIn[]): boolean {
  const weekKey = weekStart.toISOString().slice(0, 10);
  return checkIns.some((c) => c.periodStart.slice(0, 10) === weekKey);
}

function HabitTracker() {
  const {
    habits,
    loading,
    error,
    createHabit,
    updateHabit,
    deleteHabit,
    checkIn,
    streakFor,
    isCheckedInToday,
    checkInsByHabit,
  } = useHabits(true);
  const { t, lang } = useTranslation();
  const [formState, setFormState] = useState<FormState>(null);
  const [weekCursor, setWeekCursor] = useState<Date>(() => getCurrentWeekStart());

  const viewingCurrentWeek = isCurrentWeek(weekCursor);
  const weekLabel = `${t("habit.week_label_prefix")} ${getIsoWeekNumber(weekCursor)}, ${getIsoWeekYear(weekCursor)} · ${formatWeekRange(weekCursor, lang)}`;

  const handleSubmit = async (values: HabitFormValues) => {
    if (formState?.mode === "edit") {
      await updateHabit(formState.habit.id, values);
    } else {
      await createHabit(values);
    }
    setFormState(null);
  };

  return (
    <div className="relative flex h-full flex-col gap-3 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setWeekCursor((cursor) => addWeeks(cursor, -1))}
            aria-label={t("habit.previous_week")}
            className={ARROW_BUTTON_CLASS}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-1 text-xs font-medium whitespace-nowrap text-white/70">{weekLabel}</span>
          <button
            type="button"
            onClick={() => setWeekCursor((cursor) => addWeeks(cursor, 1))}
            disabled={viewingCurrentWeek}
            aria-label={t("habit.next_week")}
            className={ARROW_BUTTON_CLASS}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setFormState({ mode: "create" })}
          aria-label={t("habit.add_habit")}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-white outline-none transition hover:bg-white/15 active:scale-90 focus-visible:ring-2 focus-visible:ring-white/40"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {loading && <HabitSkeleton />}
      {error && <p className="text-sm text-red-400">{t("habit.error_loading")}</p>}

      {!loading && !error && habits.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <CalendarCheck className="h-8 w-8 text-white/25" strokeWidth={1.5} />
          <p className="max-w-[220px] text-sm text-white/40">{t("habit.empty_state")}</p>
        </div>
      )}

      {!loading && !error && habits.length > 0 && (
        <div className="flex flex-col gap-2 overflow-y-auto">
          {habits.map((habit) => {
            const checkedToday = isCheckedInToday(habit);
            const streak = streakFor(habit);
            const metadata = scheduleMetadata(habit);
            const checkIns = checkInsByHabit[habit.id] ?? [];
            const dayChecks = habit.frequency === "daily" ? weekDayCheckedState(weekCursor, checkIns) : null;
            const weekChecked = habit.frequency === "weekly" ? weekCheckedState(weekCursor, checkIns) : false;
            const iconActive = viewingCurrentWeek ? checkedToday : weekChecked;

            return (
              <div
                key={habit.id}
                className="flex flex-col gap-2 rounded-lg ring-1 ring-white/10 bg-white/[0.06] p-3 shadow-[0_2px_8px_rgba(0,0,0,0.15)] transition hover:bg-white/[0.1]"
              >
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setFormState({ mode: "edit", habit })}
                    className="flex-1 cursor-pointer text-left"
                  >
                    <p className="text-sm font-medium text-white/90">{habit.title}</p>
                    {metadata && <p className="text-xs text-white/40">{metadata}</p>}
                  </button>
                  <button
                    type="button"
                    onClick={viewingCurrentWeek ? () => checkIn(habit) : undefined}
                    disabled={!viewingCurrentWeek || checkedToday}
                    aria-label={t(iconActive ? "habit.checked_in" : "habit.check_in")}
                    className={`flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full outline-none transition active:scale-90 focus-visible:ring-2 focus-visible:ring-white/40 disabled:cursor-not-allowed disabled:active:scale-100 ${
                      iconActive
                        ? "bg-emerald-400/20 text-emerald-200"
                        : "bg-white/5 text-white/50 hover:bg-white/15 hover:text-white disabled:hover:bg-white/5"
                    }`}
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">
                      {t(FREQUENCY_KEY[habit.frequency])}
                    </Badge>
                    {streak > 0 && (
                      <span className="flex items-center gap-1 text-[11px] text-orange-300/80">
                        <Flame className="h-3 w-3" />
                        {streak} {t("habit.streak_suffix")}
                      </span>
                    )}
                  </div>

                  {dayChecks ? (
                    <div className="flex items-center gap-1">
                      {dayChecks.map((checked, i) => (
                        <span
                          key={i}
                          title={WEEK_DAY_ABBR[(i + 1) % 7]}
                          className={`flex h-4 w-4 items-center justify-center rounded-sm text-[8px] leading-none ${
                            checked ? "bg-emerald-400/40 text-emerald-100" : "bg-white/5 text-white/20"
                          }`}
                        >
                          {checked ? "✓" : ""}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className={`text-[11px] ${weekChecked ? "text-emerald-300" : "text-white/40"}`}>
                      {t(weekChecked ? "habit.week_checked" : "habit.week_not_checked")}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {formState && (
        <HabitFormModal
          initial={formState.mode === "edit" ? formState.habit : null}
          onClose={() => setFormState(null)}
          onSubmit={handleSubmit}
          onDelete={
            formState.mode === "edit"
              ? async () => {
                  await deleteHabit(formState.habit.id);
                  setFormState(null);
                }
              : undefined
          }
        />
      )}
    </div>
  );
}

export default HabitTracker;

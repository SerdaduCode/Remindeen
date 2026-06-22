import { useState } from "react";
import { CalendarCheck, Check, Flame, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useHabits, type Habit } from "@/hooks/use-habits";
import { useTranslation } from "@/hooks/use-translation";
import HabitFormModal, { type HabitFormValues } from "./HabitFormModal";
import HabitSkeleton from "./HabitSkeleton";

type FormState = { mode: "create" } | { mode: "edit"; habit: Habit } | null;

const FREQUENCY_KEY: Record<Habit["frequency"], string> = {
  daily: "habit.frequency_daily",
  weekly: "habit.frequency_weekly",
};

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
  } = useHabits(true);
  const { t } = useTranslation();
  const [formState, setFormState] = useState<FormState>(null);

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
      <div className="flex items-center justify-end">
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
            const checkedIn = isCheckedInToday(habit);
            const streak = streakFor(habit);
            return (
              <div
                key={habit.id}
                className="flex items-center justify-between gap-3 rounded-lg ring-1 ring-white/10 bg-white/[0.06] p-3 shadow-[0_2px_8px_rgba(0,0,0,0.15)] transition hover:bg-white/[0.1]"
              >
                <button
                  type="button"
                  onClick={() => setFormState({ mode: "edit", habit })}
                  className="flex-1 cursor-pointer text-left"
                >
                  <p className="text-sm font-medium text-white/90">{habit.title}</p>
                  <div className="mt-1 flex items-center gap-2">
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
                </button>
                <Button
                  type="button"
                  size="sm"
                  variant={checkedIn ? "secondary" : "default"}
                  disabled={checkedIn}
                  onClick={() => checkIn(habit)}
                  className="shrink-0 cursor-pointer gap-1.5 active:scale-95"
                >
                  <Check className="h-3.5 w-3.5" />
                  {checkedIn ? t("habit.checked_in") : t("habit.check_in")}
                </Button>
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

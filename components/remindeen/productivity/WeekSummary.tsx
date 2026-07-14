import { Gauge } from "lucide-react";
import type { Task } from "@/hooks/use-tasks";
import type { Habit, HabitCheckIn } from "@/hooks/use-habits";
import { computeWeeklyRate } from "@/lib/habit-streak";
import { useTranslation } from "@/hooks/use-translation";
import RingChart from "@/components/ui/ring-chart";

interface WeekSummaryProps {
  tasks: Task[];
  habits: Habit[];
  checkInsByHabit: Record<number, HabitCheckIn[]>;
}

function WeekSummary({ tasks, habits, checkInsByHabit }: WeekSummaryProps) {
  const { t } = useTranslation();

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((task) => task.status === "DONE").length;
  const taskPct = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const habitPct = habits.length
    ? Math.round(
        habits.reduce((sum, habit) => {
          const periodStarts = (checkInsByHabit[habit.id] ?? []).map((c) => c.periodStart);
          return sum + computeWeeklyRate(habit.frequency, periodStarts);
        }, 0) / habits.length
      )
    : 0;

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center gap-2">
        <Gauge className="h-4 w-4 text-violet-400" />
        <h3 className="text-sm font-semibold text-white/90">{t("weekSummary.title")}</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col items-center gap-1.5">
          <div className="relative h-20 w-20">
            <RingChart percentage={taskPct} color="#34d399" />
            <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white/90">
              {taskPct}%
            </div>
          </div>
          <span className="text-[11px] text-white/50">{t("weekSummary.tasks_label")}</span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <div className="relative h-20 w-20">
            <RingChart percentage={habitPct} color="#a78bfa" />
            <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white/90">
              {habitPct}%
            </div>
          </div>
          <span className="text-[11px] text-white/50">{t("weekSummary.habits_label")}</span>
        </div>
      </div>
    </div>
  );
}

export default WeekSummary;

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useTasks } from "@/hooks/use-tasks";
import { useHabits } from "@/hooks/use-habits";
import KanbanBoard from "../kanban/KanbanBoard";
import KanbanSummary from "../kanban/KanbanSummary";
import BrainDump from "./BrainDump";
import PrayerTracker from "./PrayerTracker";
import QuranProgress from "./QuranProgress";
import Todolist from "./Todolist";
import WeekSummary from "./WeekSummary";
import HabitTracker from "../habit/HabitTracker";
import CalendarView from "../calendar/CalendarView";
import Today from "../browser-tracking/Today";
import RecentActivity from "../browser-tracking/RecentActivity";
import SignInPrompt from "./SignInPrompt";
import ProductivityMenu from "./ProductivityMenu";
import ApiKeysModal from "./ApiKeysModal";

interface ProductivityPageProps {
  backgroundUrl: string;
}

const GLASS_PANEL =
  "rounded-3xl bg-white/10 backdrop-blur-xl ring-1 ring-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.1)] overflow-hidden";

function ProductivityPage({ backgroundUrl }: ProductivityPageProps) {
  const { isSignedIn, loading, signingIn, error, signIn, signOut } = useAuth();
  const [showApiKeys, setShowApiKeys] = useState(false);
  const {
    tasks,
    loading: tasksLoading,
    error: tasksError,
    createTask,
    updateTask,
    updateTaskPosition,
    deleteTask,
  } = useTasks(isSignedIn);
  const {
    habits,
    loading: habitsLoading,
    error: habitsError,
    createHabit,
    updateHabit,
    deleteHabit,
    checkIn,
    streakFor,
    isCheckedInToday,
    checkInsByHabit,
  } = useHabits(isSignedIn);

  return (
    <div
      className="relative h-full w-full overflow-hidden text-white"
      style={
        backgroundUrl
          ? {
              backgroundImage: `url(${backgroundUrl})`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundSize: "cover",
            }
          : { backgroundColor: "rgb(9 9 11)" }
      }
    >
      {/* Dark gradient overlay keeps panel content legible over any photo */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60" />

      {!loading && isSignedIn && (
        <ProductivityMenu onSignOut={signOut} onOpenApiKeys={() => setShowApiKeys(true)} />
      )}

      {loading ? null : !isSignedIn ? (
        <div className="relative z-10 h-full">
          <SignInPrompt signingIn={signingIn} error={error} onSignIn={signIn} />
        </div>
      ) : (
        <div className="relative z-10 grid h-full gap-4 overflow-y-auto p-4 md:grid-cols-[320px_minmax(0,1fr)_320px_320px] md:overflow-hidden md:p-6">
          <div className="flex flex-col gap-4 min-h-0">
            <section className={`${GLASS_PANEL} flex min-h-0 flex-col`}>
              <HabitTracker
                habits={habits}
                loading={habitsLoading}
                error={habitsError}
                createHabit={createHabit}
                updateHabit={updateHabit}
                deleteHabit={deleteHabit}
                checkIn={checkIn}
                streakFor={streakFor}
                isCheckedInToday={isCheckedInToday}
                checkInsByHabit={checkInsByHabit}
              />
            </section>
            <section className={`${GLASS_PANEL} flex min-h-0 flex-col`}>
              <CalendarView />
            </section>
          </div>
          <div className="flex min-h-0 flex-col gap-4">
            <section className={`${GLASS_PANEL} flex min-h-0 flex-1 flex-col`}>
              <KanbanBoard
                tasks={tasks}
                loading={tasksLoading}
                error={tasksError}
                createTask={createTask}
                updateTask={updateTask}
                updateTaskPosition={updateTaskPosition}
                deleteTask={deleteTask}
              />
            </section>
            {/* Row below Kanban: Ringkasan Kanban shares this row with Brain Dump */}
            <div className="grid shrink-0 grid-cols-2 gap-4">
              <section className={`${GLASS_PANEL} flex flex-col`}>
                <KanbanSummary tasks={tasks} />
              </section>
              <section className={`${GLASS_PANEL} flex flex-col`}>
                <BrainDump />
              </section>
            </div>
          </div>
          <div className="flex flex-col gap-4 min-h-0">
            <section className={`${GLASS_PANEL} flex min-h-0 flex-col`}>
              <Today />
            </section>
            <section className={`${GLASS_PANEL} flex min-h-0 flex-col`}>
              <RecentActivity />
            </section>
          </div>
          {/* Fourth column */}
          <div className="flex flex-col gap-4 min-h-0">
            <section className={`${GLASS_PANEL} flex shrink-0 flex-col`}>
              <WeekSummary tasks={tasks} habits={habits} checkInsByHabit={checkInsByHabit} />
            </section>
            <section className={`${GLASS_PANEL} flex shrink-0 flex-col`}>
              <PrayerTracker />
            </section>
            <section className={`${GLASS_PANEL} flex shrink-0 flex-col`}>
              <QuranProgress />
            </section>
            <section className={`${GLASS_PANEL} flex min-h-0 flex-1 flex-col`}>
              <Todolist />
            </section>
          </div>
        </div>
      )}

      {showApiKeys && <ApiKeysModal onClose={() => setShowApiKeys(false)} />}
    </div>
  );
}

export default ProductivityPage;

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, Repeat } from "lucide-react";
import { useEvents, type Event } from "@/hooks/use-events";
import { useTranslation } from "@/hooks/use-translation";
import { parseEventDate, parseEventTime } from "@/lib/event-datetime";
import EventFormModal, { type EventFormValues } from "./EventFormModal";

type FormState = { mode: "create" } | { mode: "edit"; event: Event } | null;

const WEEKDAY_HEADERS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function buildMonthGrid(currentMonth: Date): (string | null)[] {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = (firstDay.getDay() + 6) % 7;

  const cells: (string | null)[] = Array.from({ length: leadingBlanks }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(toDateKey(year, month, day));
  }
  return cells;
}

function CalendarView() {
  const { events, createEvent, updateEvent, deleteEvent } = useEvents(true);
  const { t } = useTranslation();
  const today = new Date().toLocaleDateString("en-CA");
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(today);
  const [formState, setFormState] = useState<FormState>(null);

  const monthCells = useMemo(() => buildMonthGrid(currentMonth), [currentMonth]);
  const monthLabel = currentMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  const datesWithEvents = useMemo(() => new Set(events.map((event) => parseEventDate(event.startAt))), [events]);

  const selectedDayEvents = useMemo(() => {
    if (!selectedDate) return [];
    return events
      .filter((event) => parseEventDate(event.startAt) === selectedDate)
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  }, [events, selectedDate]);

  const goToPrevMonth = () => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const goToNextMonth = () => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  const handleSubmit = async (values: EventFormValues) => {
    if (formState?.mode === "edit") {
      await updateEvent(formState.event.id, values);
    } else {
      await createEvent(values);
    }
    setFormState(null);
  };

  return (
    <div className="relative flex h-full flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={goToPrevMonth}
          aria-label={t("calendar.prev_month_aria")}
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-white/70 outline-none transition hover:bg-white/10 hover:text-white active:scale-90"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-sm font-medium text-white/90">{monthLabel}</p>
        <button
          type="button"
          onClick={goToNextMonth}
          aria-label={t("calendar.next_month_aria")}
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-white/70 outline-none transition hover:bg-white/10 hover:text-white active:scale-90"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-white/40">
        {WEEKDAY_HEADERS.map((label) => (
          <div key={label}>{label}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {monthCells.map((dateKey, index) => {
          if (!dateKey) return <div key={`blank-${index}`} />;
          const day = Number(dateKey.slice(8, 10));
          const isToday = dateKey === today;
          const isSelected = dateKey === selectedDate;
          const hasEvents = datesWithEvents.has(dateKey);

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => setSelectedDate(dateKey)}
              className={`relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg text-xs transition ${
                isSelected
                  ? "bg-white text-zinc-900"
                  : isToday
                    ? "bg-white/15 text-white"
                    : "text-white/70 hover:bg-white/10"
              }`}
            >
              {day}
              {hasEvents && (
                <span
                  className={`absolute bottom-1 h-1 w-1 rounded-full ${isSelected ? "bg-zinc-900" : "bg-white/70"}`}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-1">
        <p className="text-xs text-white/40">{selectedDate}</p>
        <button
          type="button"
          onClick={() => setFormState({ mode: "create" })}
          className="cursor-pointer text-xs font-medium text-white/80 outline-none transition hover:text-white"
        >
          {t("event.add_event")}
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
        {selectedDayEvents.length === 0 && (
          <p className="py-2 text-center text-xs text-white/40">{t("event.empty_state")}</p>
        )}
        {selectedDayEvents.map((event) => (
          <button
            key={event.id}
            type="button"
            onClick={() => setFormState({ mode: "edit", event })}
            className="flex cursor-pointer items-start justify-between gap-2 rounded-lg bg-white/[0.06] p-3 text-left ring-1 ring-white/10 transition hover:bg-white/[0.1]"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white/90">{event.title}</p>
              {event.location && (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-white/40">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{event.location}</span>
                </p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1.5 text-xs text-white/50">
              {event.isRecurring && <Repeat className="h-3 w-3" aria-label={t("event.recurring_aria")} />}
              <span>
                {parseEventTime(event.startAt)}
                {event.endAt ? ` - ${parseEventTime(event.endAt)}` : ""}
              </span>
            </div>
          </button>
        ))}
      </div>

      {formState && (
        <EventFormModal
          initial={formState.mode === "edit" ? formState.event : null}
          initialDate={selectedDate ?? undefined}
          onClose={() => setFormState(null)}
          onSubmit={handleSubmit}
          onDelete={
            formState.mode === "edit"
              ? async () => {
                  await deleteEvent(formState.event.id);
                  setFormState(null);
                }
              : undefined
          }
        />
      )}
    </div>
  );
}

export default CalendarView;

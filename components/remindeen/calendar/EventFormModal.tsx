import { useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import ConfirmDeletePanel from "@/components/ui/confirm-delete-panel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Event, EventInput } from "@/hooks/use-events";
import { buildIsoWithOffset, parseEventDate, parseEventTime } from "@/lib/event-datetime";
import { buildEventRrule, type EventRecurrence } from "@/lib/event-rrule";
import { useTranslation } from "@/hooks/use-translation";
import { useCalendarConnection } from "@/hooks/use-calendar-connection";

const WEEK_DAYS: { value: number; label: string }[] = [
  { value: 0, label: "Su" },
  { value: 1, label: "Mo" },
  { value: 2, label: "Tu" },
  { value: 3, label: "We" },
  { value: 4, label: "Th" },
  { value: 5, label: "Fr" },
  { value: 6, label: "Sa" },
];

const RRULE_WEEKDAY_INDEX: Record<string, number> = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };

function recurrenceFromEvent(event: Event | null): EventRecurrence {
  if (!event?.isRecurring || !event.rrule) return "none";
  if (event.rrule.includes("FREQ=DAILY")) return "daily";
  if (event.rrule.includes("FREQ=WEEKLY")) return "weekly";
  if (event.rrule.includes("FREQ=MONTHLY")) return "monthly";
  return "none";
}

function weekDaysFromEvent(event: Event | null): number[] {
  if (!event?.rrule) return [];
  const match = /BYDAY=([A-Z,]+)/.exec(event.rrule);
  if (!match) return [];
  return match[1]
    .split(",")
    .map((day) => RRULE_WEEKDAY_INDEX[day])
    .filter((day): day is number => day !== undefined);
}

export interface EventFormValues extends EventInput {}

interface EventFormModalProps {
  initial: Event | null;
  initialDate?: string;
  onClose: () => void;
  onSubmit: (values: EventFormValues) => Promise<void>;
  onDelete?: () => Promise<void>;
}

function EventFormModal({ initial, initialDate, onClose, onSubmit, onDelete }: EventFormModalProps) {
  const { t } = useTranslation();
  const { status: calendarStatus } = useCalendarConnection();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [date, setDate] = useState(initial ? parseEventDate(initial.startAt) : initialDate ?? "");
  const [startTime, setStartTime] = useState(initial ? parseEventTime(initial.startAt) : "");
  const [endTime, setEndTime] = useState(initial?.endAt ? parseEventTime(initial.endAt) : "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [recurrence, setRecurrence] = useState<EventRecurrence>(recurrenceFromEvent(initial));
  const [weekDays, setWeekDays] = useState<number[]>(weekDaysFromEvent(initial));
  const [syncToCalendar, setSyncToCalendar] = useState(initial?.syncToCalendar ?? true);
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isEdit = initial !== null;

  const toggleWeekDay = (day: number) => {
    setWeekDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !date || !startTime) {
      setError(true);
      return;
    }
    setSubmitting(true);
    try {
      const { isRecurring, rrule } = buildEventRrule(recurrence, weekDays);
      await onSubmit({
        title: title.trim(),
        location: location.trim() || undefined,
        startAt: buildIsoWithOffset(date, startTime),
        endAt: endTime ? buildIsoWithOffset(date, endTime) : undefined,
        isRecurring,
        rrule,
        syncToCalendar,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!onDelete) return;
    setShowDeleteConfirm(true);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[380px] rounded-2xl bg-zinc-900/70 p-5 text-white ring-1 ring-white/15 backdrop-blur-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="mb-4 text-sm font-semibold tracking-wide text-white/90">
          {isEdit ? t("event.form.edit_title") : t("event.form.create_title")}
        </h2>

        {showDeleteConfirm ? (
          <ConfirmDeletePanel
            message={t("event.form.delete_confirm")}
            onConfirm={async () => {
              if (onDelete) await onDelete();
            }}
            onCancel={() => setShowDeleteConfirm(false)}
          />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="event-title" className="text-white/70">
                {t("event.form.title_label")}
              </Label>
              <Input
                id="event-title"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  if (error) setError(false);
                }}
                placeholder={t("event.form.title_placeholder")}
                aria-invalid={error}
                className="border-white/15 bg-white/5 text-white placeholder:text-white/30"
                autoFocus
              />
              {error && <p className="text-xs text-red-400">{t("event.form.title_required")}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="event-date" className="text-white/70">
                {t("event.form.date_label")}
              </Label>
              <Input
                id="event-date"
                type="date"
                value={date}
                onChange={(event) => {
                  setDate(event.target.value);
                  if (error) setError(false);
                }}
                className="border-white/15 bg-white/5 text-white"
              />
            </div>

            <div className="flex gap-3">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="event-start-time" className="text-white/70">
                  {t("event.form.start_time_label")}
                </Label>
                <Input
                  id="event-start-time"
                  type="time"
                  value={startTime}
                  onChange={(event) => {
                    setStartTime(event.target.value);
                    if (error) setError(false);
                  }}
                  className="border-white/15 bg-white/5 text-white"
                />
              </div>
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="event-end-time" className="text-white/70">
                  {t("event.form.end_time_label")}
                </Label>
                <Input
                  id="event-end-time"
                  type="time"
                  value={endTime}
                  onChange={(event) => setEndTime(event.target.value)}
                  className="border-white/15 bg-white/5 text-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="event-location" className="text-white/70">
                {t("event.form.location_label")}
              </Label>
              <Input
                id="event-location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder={t("event.form.location_placeholder")}
                className="border-white/15 bg-white/5 text-white placeholder:text-white/30"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-white/70">{t("event.form.recurrence_label")}</Label>
              <Select value={recurrence} onValueChange={(value) => setRecurrence(value as EventRecurrence)}>
                <SelectTrigger className="w-full border-white/15 bg-white/5 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-zinc-900 text-white">
                  <SelectItem value="none">{t("event.form.recurrence_none")}</SelectItem>
                  <SelectItem value="daily">{t("event.form.recurrence_daily")}</SelectItem>
                  <SelectItem value="weekly">{t("event.form.recurrence_weekly")}</SelectItem>
                  <SelectItem value="monthly">{t("event.form.recurrence_monthly")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {recurrence === "weekly" && (
              <div className="flex flex-wrap gap-2">
                {WEEK_DAYS.map((day) => (
                  <label
                    key={day.value}
                    className="flex cursor-pointer items-center gap-1.5 text-xs text-white/70"
                  >
                    <Checkbox
                      checked={weekDays.includes(day.value)}
                      onCheckedChange={() => toggleWeekDay(day.value)}
                    />
                    {day.label}
                  </label>
                ))}
              </div>
            )}

            <div
              onClick={() => {
                if (calendarStatus.connected) setSyncToCalendar((value) => !value);
              }}
              className={`flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 p-3 ${
                calendarStatus.connected ? "cursor-pointer hover:bg-white/[0.08]" : ""
              }`}
            >
              <div className="space-y-0.5">
                <Label className="text-white/80">{t("event.form.sync_to_calendar_label")}</Label>
                {!calendarStatus.connected && (
                  <p className="text-[11px] text-white/40">{t("event.form.sync_calendar_hint")}</p>
                )}
              </div>
              <div onClick={(event) => event.stopPropagation()}>
                <Switch
                  id="event-sync-calendar"
                  checked={syncToCalendar}
                  disabled={!calendarStatus.connected}
                  onCheckedChange={setSyncToCalendar}
                  className="border-white/20 data-[state=checked]:bg-white data-[state=unchecked]:bg-white/20 dark:data-[state=unchecked]:bg-white/20"
                  thumbClassName="bg-white dark:bg-white data-[state=checked]:bg-zinc-900 dark:data-[state=checked]:bg-zinc-900 dark:data-[state=unchecked]:bg-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              {isEdit && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  className="cursor-pointer active:scale-[0.98]"
                  onClick={handleDelete}
                >
                  {t("event.form.delete")}
                </Button>
              )}
              <div className="ml-auto flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="cursor-pointer text-white/70 active:scale-[0.98] hover:bg-white/10 hover:text-white"
                  onClick={onClose}
                >
                  {t("event.form.cancel")}
                </Button>
                <Button type="submit" disabled={submitting} className="cursor-pointer active:scale-[0.98]">
                  {t("event.form.save")}
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}

export default EventFormModal;

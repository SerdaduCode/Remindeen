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
import type { Habit, HabitFrequency, HabitInput } from "@/hooks/use-habits";
import type { TaskPriority } from "@/hooks/use-tasks";
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

export interface HabitFormValues extends HabitInput {}

interface HabitFormModalProps {
  initial: Habit | null;
  onClose: () => void;
  onSubmit: (values: HabitFormValues) => Promise<void>;
  onDelete?: () => Promise<void>;
}

function HabitFormModal({ initial, onClose, onSubmit, onDelete }: HabitFormModalProps) {
  const { t } = useTranslation();
  const { status: calendarStatus } = useCalendarConnection();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [frequency, setFrequency] = useState<HabitFrequency>(initial?.frequency ?? "daily");
  const [priority, setPriority] = useState<TaskPriority | "none">(initial?.priority ?? "none");
  const [weekDays, setWeekDays] = useState<number[]>(initial?.weekDays ?? []);
  const [reminderTime, setReminderTime] = useState(initial?.reminderTime ?? "");
  const [syncToCalendar, setSyncToCalendar] = useState(initial?.syncToCalendar ?? false);
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isEdit = initial !== null;

  const handleFrequencyChange = (value: HabitFrequency) => {
    setFrequency(value);
    if (value === "daily") setWeekDays([]);
    if (value === "weekly") setReminderTime("");
  };

  const toggleWeekDay = (day: number) => {
    setWeekDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) {
      setError(true);
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        frequency,
        priority: priority === "none" ? null : priority,
        weekDays: frequency === "weekly" ? weekDays : [],
        reminderTime: frequency === "daily" && reminderTime ? reminderTime : null,
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
          {isEdit ? t("habit.form.edit_title") : t("habit.form.create_title")}
        </h2>

        {showDeleteConfirm ? (
          <ConfirmDeletePanel
            message={t("habit.form.delete_confirm")}
            onConfirm={async () => {
              if (onDelete) await onDelete();
            }}
            onCancel={() => setShowDeleteConfirm(false)}
          />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="habit-title" className="text-white/70">
              {t("habit.form.title_label")}
            </Label>
            <Input
              id="habit-title"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                if (error) setError(false);
              }}
              placeholder={t("habit.form.title_placeholder")}
              aria-invalid={error}
              className="border-white/15 bg-white/5 text-white placeholder:text-white/30"
              autoFocus
            />
            {error && <p className="text-xs text-red-400">{t("habit.form.title_required")}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="habit-description" className="text-white/70">
              {t("habit.form.description_label")}
            </Label>
            <Input
              id="habit-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={t("habit.form.description_placeholder")}
              className="border-white/15 bg-white/5 text-white placeholder:text-white/30"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-white/70">{t("habit.form.frequency_label")}</Label>
            <Select value={frequency} onValueChange={(value) => handleFrequencyChange(value as HabitFrequency)}>
              <SelectTrigger className="w-full border-white/15 bg-white/5 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-zinc-900 text-white">
                <SelectItem value="daily">{t("habit.frequency_daily")}</SelectItem>
                <SelectItem value="weekly">{t("habit.frequency_weekly")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {frequency === "weekly" && (
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

          {frequency === "daily" && (
            <div className="space-y-1.5">
              <Label htmlFor="habit-reminder-time" className="text-white/70">
                {t("habit.form.reminder_time_label")}
              </Label>
              <Input
                id="habit-reminder-time"
                type="time"
                value={reminderTime}
                onChange={(event) => setReminderTime(event.target.value)}
                className="border-white/15 bg-white/5 text-white"
              />
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
              <Label className="text-white/80">{t("habit.form.sync_to_calendar_label")}</Label>
              {!calendarStatus.connected && (
                <p className="text-[11px] text-white/40">{t("habit.form.sync_calendar_hint")}</p>
              )}
            </div>
            <div onClick={(event) => event.stopPropagation()}>
              <Switch
                id="habit-sync-calendar"
                checked={syncToCalendar}
                disabled={!calendarStatus.connected}
                onCheckedChange={setSyncToCalendar}
                className="border-white/20 data-[state=checked]:bg-white data-[state=unchecked]:bg-white/20 dark:data-[state=unchecked]:bg-white/20"
                thumbClassName="bg-white dark:bg-white data-[state=checked]:bg-zinc-900 dark:data-[state=checked]:bg-zinc-900 dark:data-[state=unchecked]:bg-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-white/70">{t("habit.form.priority_label")}</Label>
            <Select value={priority} onValueChange={(value) => setPriority(value as TaskPriority | "none")}>
              <SelectTrigger className="w-full border-white/15 bg-white/5 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-zinc-900 text-white">
                <SelectItem value="none">{t("habit.form.priority_none")}</SelectItem>
                <SelectItem value="Low">{t("habit.form.priority_low")}</SelectItem>
                <SelectItem value="Medium">{t("habit.form.priority_medium")}</SelectItem>
                <SelectItem value="High">{t("habit.form.priority_high")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 pt-1">
            {isEdit && onDelete && (
              <Button
                type="button"
                variant="destructive"
                className="cursor-pointer active:scale-[0.98]"
                onClick={handleDelete}
              >
                {t("habit.form.delete")}
              </Button>
            )}
            <div className="ml-auto flex gap-2">
              <Button
                type="button"
                variant="ghost"
                className="cursor-pointer text-white/70 active:scale-[0.98] hover:bg-white/10 hover:text-white"
                onClick={onClose}
              >
                {t("habit.form.cancel")}
              </Button>
              <Button type="submit" disabled={submitting} className="cursor-pointer active:scale-[0.98]">
                {t("habit.form.save")}
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

export default HabitFormModal;

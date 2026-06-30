## Why

The backend (`al-quotes` change `enhance-habits`) added three new fields to Habit — `weekDays Int[]`, `reminderTime String?`, and `syncToCalendar Boolean` — but the `HabitFormModal` in remindeen still only exposes title, description, frequency, and priority. Users cannot configure day selection for weekly habits, reminder times for daily habits, or control whether a habit syncs to Google Calendar. This change wires the UI to those new fields.

## What Changes

- `HabitFormModal` gains three new form controls, shown conditionally:
  - When frequency is `weekly`: a **day picker** (checkboxes for each day of the week, Sun–Sat) maps to the `weekDays` field.
  - When frequency is `daily`: a **time input** (`HH:MM`) maps to the `reminderTime` field.
  - Always (in edit mode): a **"Sync to Calendar" toggle** (`Switch`) maps to `syncToCalendar`. Disabled with a hint when Google Calendar is not connected.
- `HabitInput` type in `use-habits.ts` gains `weekDays?: number[]`, `reminderTime?: string | null`, and `syncToCalendar?: boolean`.
- `createHabit` and `updateHabit` in `use-habits.ts` pass the new fields through to the API.
- The `Habit` type in `use-habits.ts` gains the three new fields to match the API response.
- The habit list display shows a subtle indicator when a habit has `weekDays` set (e.g. "Mon / Wed / Fri") or a `reminderTime` set.

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `habit-tracking`: creating and editing a habit now exposes `weekDays` (weekly), `reminderTime` (daily), and `syncToCalendar` controls in the form modal.

## Impact

- `hooks/use-habits.ts` — extend `Habit` type, `HabitInput` type; update `createHabit`, `updateHabit` to include new fields
- `components/remindeen/habit/HabitFormModal.tsx` — add day picker (weekly), time input (daily), sync toggle; conditional rendering per frequency
- `components/remindeen/habit/HabitTracker.tsx` — optionally surface `weekDays` / `reminderTime` metadata in the habit row display
- `hooks/use-calendar-connection.ts` — read to determine whether the sync toggle should be enabled or disabled
- No backend changes (paired backend change already done)

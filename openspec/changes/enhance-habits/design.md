## Context

`HabitFormModal` is a `createPortal`-based dark glass modal. It currently has four fields: title, description, frequency (Select), and priority (Select). The backend now returns three additional fields on every `Habit` object: `weekDays: number[]`, `reminderTime: string | null`, `syncToCalendar: boolean`.

The form needs conditional UI: day picker when `frequency === "weekly"`, time input when `frequency === "daily"`, and a sync toggle always visible in edit mode (in create mode it can be shown or defaulted silently to `false`).

`useCalendarConnection` already exists and exposes `status.connected` — used to disable the sync toggle with a hint when Google Calendar is not linked.

## Goals / Non-Goals

**Goals:**
- Extend `HabitFormModal` with day picker, time input, and sync toggle — conditional on frequency
- Update `HabitInput`, `Habit` type, `createHabit`, `updateHabit` to include the new fields
- Show a brief metadata line in `HabitTracker` rows (day names or reminder time) when set

**Non-Goals:**
- Any backend changes (already done)
- Changing the habit check-in flow
- Validating `weekDays` format on the client (backend validates; client sends what's selected)

## Decisions

### Day picker: checkbox grid (Sun–Sat)

Seven checkboxes in a compact grid, one per day of the week. Day order follows locale convention (Sun first). Each checkbox maps to an integer (0 = Sun … 6 = Sat). The component uses the existing `Checkbox` from `components/ui/checkbox.tsx`. No new component file needed — renders inline in `HabitFormModal`.

Selected days are stored in local form state as `Set<number>` or `number[]`, serialised to `number[]` for the API call.

### Time input: native `<input type="time">`

HTML `<input type="time">` provides a browser-native time picker (24-hour or 12-hour depending on locale) and returns a `"HH:MM"` string on change — exactly the format the backend expects. Styled with the same `border-white/15 bg-white/5 text-white` classes as other inputs. No custom time picker library needed.

### Sync toggle: existing `Switch` component

`components/ui/switch.tsx` already exists. When `status.connected === false` (from `useCalendarConnection`), the `Switch` is `disabled` and a small hint text explains how to connect. The hint text uses an existing translation key or a new one. `useCalendarConnection` is called inside `HabitFormModal` to keep the hook usage co-located.

### Show/hide by frequency

Both the day picker and the time input are rendered only when the corresponding frequency is selected. Switching frequency clears the hidden field's state (weekDays → `[]` when switching to daily; reminderTime → `""` when switching to weekly). This prevents sending stale values to the API.

### HabitTracker row metadata

When a weekly habit has non-empty `weekDays`, show abbreviated day names inline (e.g. "Sen · Rab · Jum" or locale-appropriate abbreviations). When a daily habit has `reminderTime`, show the time (e.g. "05:30"). These are small `text-white/40` secondary lines under the habit title — no new component, just added to the existing row render in `HabitTracker`.

## Risks / Trade-offs

- **`useCalendarConnection` inside HabitFormModal** — adds a small extra API call (`GET /auth/google-calendar`) each time the modal opens. Acceptable since the modal is opened infrequently and the request is lightweight.
- **Day picker accessibility** — seven checkboxes need `aria-label` per day to be accessible. Each checkbox label already serves as the accessible name; no extra ARIA attributes needed.

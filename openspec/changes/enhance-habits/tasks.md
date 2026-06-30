## 1. Type Updates: use-habits.ts

- [ ] 1.1 Add `weekDays: number[]`, `reminderTime: string | null`, `syncToCalendar: boolean` to the `Habit` interface
- [ ] 1.2 Add `weekDays?: number[]`, `reminderTime?: string | null`, `syncToCalendar?: boolean` to `HabitInput`
- [ ] 1.3 Update `createHabit` to pass `weekDays`, `reminderTime`, `syncToCalendar` from the input to the POST body
- [ ] 1.4 Update `updateHabit` to pass the same three fields when present in the updates object

## 2. HabitFormModal: State & Initialisation

- [ ] 2.1 Add `weekDays: number[]` state (default `[]`; pre-fill from `initial?.weekDays ?? []` when editing)
- [ ] 2.2 Add `reminderTime: string` state (default `""`; pre-fill from `initial?.reminderTime ?? ""` when editing)
- [ ] 2.3 Add `syncToCalendar: boolean` state (default `false`; pre-fill from `initial?.syncToCalendar ?? false` when editing)
- [ ] 2.4 When `frequency` changes, clear the hidden field: switching to `daily` clears `weekDays` to `[]`; switching to `weekly` clears `reminderTime` to `""`

## 3. HabitFormModal: Day Picker (weekly)

- [ ] 3.1 Render a compact row of 7 `Checkbox` items (Sun–Sat, integers 0–6) below the frequency Select, visible only when `frequency === "weekly"`
- [ ] 3.2 Each checkbox is labelled with a 2-letter day abbreviation (Su, Mo, Tu, We, Th, Fr, Sa)
- [ ] 3.3 Checking/unchecking a day toggles the corresponding integer in the `weekDays` state array
- [ ] 3.4 Style the checkbox row with `flex gap-2 flex-wrap` and match the existing `text-white/70` label styling

## 4. HabitFormModal: Time Input (daily)

- [ ] 4.1 Render a `<input type="time">` below the frequency Select, visible only when `frequency === "daily"`
- [ ] 4.2 Bind to `reminderTime` state; style with the same `border-white/15 bg-white/5 text-white` classes as other inputs
- [ ] 4.3 Label it using the translation key `habit.form.reminder_time_label` (add to translation files)

## 5. HabitFormModal: Sync Toggle

- [ ] 5.1 Import `useCalendarConnection` and call it inside `HabitFormModal`
- [ ] 5.2 Render a `Switch` labelled `habit.form.sync_to_calendar_label` (add translation key) below the time/day fields
- [ ] 5.3 Bind `Switch` checked state to `syncToCalendar`; `onCheckedChange` updates state
- [ ] 5.4 When `status.connected === false`, set `disabled` on the `Switch` and show a small hint text (e.g. `habit.form.sync_calendar_hint`)
- [ ] 5.5 Add the three translation keys (`habit.form.reminder_time_label`, `habit.form.sync_to_calendar_label`, `habit.form.sync_calendar_hint`) to all locale files

## 6. HabitFormModal: Submit

- [ ] 6.1 Include `weekDays` (only when `frequency === "weekly"`, else omit or send `[]`), `reminderTime` (only when `frequency === "daily"` and non-empty, else `null`), and `syncToCalendar` in the `HabitFormValues` passed to `onSubmit`

## 7. HabitTracker: Row Metadata

- [ ] 7.1 In the habit row render, add a secondary metadata line below the title when `habit.weekDays.length > 0`: map each integer to an abbreviated day name (Mo, Tu, We, Th, Fr, Sa, Su) and join with ` · `
- [ ] 7.2 When `habit.frequency === "daily"` and `habit.reminderTime` is set, show the time string as the secondary line
- [ ] 7.3 Style the secondary line with `text-xs text-white/40`

## 8. Verification

- [ ] 8.1 Create a weekly habit, select Mon + Wed + Fri → confirm `weekDays: [1, 3, 5]` returned by API; habit row shows "Mon · Wed · Fri"
- [ ] 8.2 Create a daily habit with reminder time `05:30` → confirm `reminderTime: "05:30"` returned; habit row shows "05:30"
- [ ] 8.3 Switch frequency from weekly to daily in the form → day picker disappears, time input appears, previously selected days are cleared
- [ ] 8.4 Open edit modal for a habit with `weekDays` and `reminderTime` → confirm both pre-populate correctly
- [ ] 8.5 Sync toggle is disabled without a connected calendar; enabled with one connected

## Context

The Productivity page currently renders two glass panels side by side: `HabitTracker` (left, 320px) and `KanbanBoard` (right, flex-1). The left column is a single `<section>`. Adding `CalendarView` below `HabitTracker` means wrapping both in a `<div className="flex flex-col gap-4 min-h-0">` so they share the left column with independent scroll.

Events have `startAt`/`endAt` as ISO 8601 strings with timezone offset (e.g. `"2026-07-04T09:00:00+07:00"`). The frontend parses the date part for calendar display and the time part for event display. No timezone conversion is needed — the string is shown as-is.

## Goals / Non-Goals

**Goals:**
- Mini monthly calendar with date selection and event dots
- Selected-day event list with create/edit/delete
- `EventFormModal` with title, date, time, location, recurrence, and sync toggle
- Real-time updates via Pusher (`event.created`, `event.updated`, `event.deleted`)
- Consistent glass visual treatment matching existing panels

**Non-Goals:**
- Multi-day or drag-to-resize event spans in the calendar grid
- Per-occurrence editing for recurring events (backend doesn't support it; edit = whole series)
- Notifications / reminders
- Shared / public events

## Decisions

### Mini calendar: custom component, no library

The calendar view is a compact monthly grid (7 columns, ~6 rows). Building it from `Date` arithmetic avoids a heavy calendar library (e.g. FullCalendar, react-big-calendar). The grid renders day numbers; days with events get a small dot indicator. Navigation: prev/next month chevron buttons. The component is self-contained in `CalendarView.tsx`.

Alternative considered: `react-big-calendar` or similar. Rejected — large bundle, opinionated styling hard to match the glass theme.

### `useEvents` hook mirrors `useHabits`

Same pattern: `apiFetch` for initial load, Pusher channel bindings for `event.created/updated/deleted`, local state managed via upsert/remove helpers, `reconnect` re-fetch on Pusher reconnect. The hook exposes: `events`, `loading`, `error`, `createEvent`, `updateEvent`, `deleteEvent`.

### `startAt` construction in EventFormModal

The form collects date (`YYYY-MM-DD` from a date input) and time (`HH:MM` from a time input) separately, then constructs the ISO string with the user's local offset:

```ts
const offset = -new Date().getTimezoneOffset() // minutes
const sign = offset >= 0 ? '+' : '-'
const hh = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0')
const mm = String(Math.abs(offset) % 60).padStart(2, '0')
const startAt = `${date}T${time}:00${sign}${hh}:${mm}`
```

This produces `"2026-07-04T09:00:00+07:00"` for a WIB user — matching the backend's expected format.

### Recurrence builder: simple select + day checkboxes

Four options in a Select: None / Daily / Weekly / Monthly. When Weekly is chosen, the same day-of-week checkbox grid used in `HabitFormModal` (from `enhance-habits`) appears. The component maps the selection to an RRULE string:
- None → `isRecurring: false`, `rrule: null`
- Daily → `isRecurring: true`, `rrule: "RRULE:FREQ=DAILY"`
- Weekly + days → `isRecurring: true`, `rrule: "RRULE:FREQ=WEEKLY;BYDAY=<days>"`
- Monthly → `isRecurring: true`, `rrule: "RRULE:FREQ=MONTHLY"`

### Layout change: left column becomes flex column

```tsx
// ProductivityPage.tsx — left column
<div className="flex flex-col gap-4 min-h-0">
  <section className={`${GLASS_PANEL} flex min-h-0 flex-col`}>
    <HabitTracker />
  </section>
  <section className={`${GLASS_PANEL} flex min-h-0 flex-col`}>
    <CalendarView />
  </section>
</div>
```

`HabitTracker` keeps `flex-1` or a fixed min-height so both panels share vertical space without either collapsing. On narrow viewports (the existing `md:` grid breakpoint), both stack under the Kanban panel.

### Event display on selected day

The selected-day panel shows events sorted by `startAt`. Each row: time range, title, location (if set). Recurring events show a loop icon. Clicking an event opens `EventFormModal` in edit mode. A `+` button above the list opens it in create mode with the date pre-filled.

## Risks / Trade-offs

- **No RRULE expansion in the UI** — recurring events only show on their `startAt` date in the mini calendar, not on every occurrence. The calendar dot for a recurring event appears only on the series start date. Acceptable for a first version; full expansion would need an rrule.js library and is deferred.
- **`getTimezoneOffset` gives user's current offset** — this is correct for display but may differ from the user's offset at the event's date (DST transitions). For WIB (no DST), this is not an issue.

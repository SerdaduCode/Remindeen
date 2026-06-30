## Context

The Productivity page currently renders two glass panels side by side: `HabitTracker` (left, 320px) and `KanbanBoard` (right, flex-1). The left column is a single `<section>`. Adding `CalendarView` below `HabitTracker` means wrapping both in a `<div className="flex flex-col gap-4 min-h-0">` so they share the left column with independent scroll.

Events have `startAt`/`endAt` as ISO 8601 strings with timezone offset (e.g. `"2026-07-04T09:00:00+07:00"`). The frontend parses the date part for calendar display and the time part for event display.

**Correction (see Decisions below):** the original assumption here — "no timezone conversion is needed, the string is shown as-is" — only holds when remindeen's own `EventFormModal` is the sole writer of `startAt`, since `buildIsoWithOffset` always encodes the literal local wall-clock digits the user typed. Once the al-quotes `event-feature` change added MCP tools (`create_event`/`update_event`), a second writer exists with no shared contract: an LLM-driven MCP client may legitimately normalize a user's stated local time to a different (but equally valid) offset, e.g. UTC. Display logic that reads the string's digits verbatim, without real `Date` parsing, silently breaks the instant that second writer is introduced.

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

### Event display must parse `startAt`/`endAt` as real `Date` instants, not string-slice them

`lib/event-datetime.ts`'s `parseEventDate`/`parseEventTime` were implemented as raw substring extraction — `startAt.slice(0, 10)` / `startAt.slice(11, 16)` — reading the literal characters at fixed positions with no awareness of the offset suffix. This "worked" only because the sole writer (`buildIsoWithOffset`) always encoded the user's literal local-time input into those same character positions. It was never timezone-aware; it relied entirely on writer discipline that a second writer (MCP) was never told to follow and had no way to discover.

Confirmed in practice: a user asked an MCP client to create an event at "19:00 local"; the client (reasonably) normalized this to `"...T12:00:00Z"` (UTC) when calling `create_event`. Google Calendar — a real timezone-aware consumer of the same string via the n8n sync pipeline — displayed the correct 19:00 local. remindeen's string-sliced display showed "12:00", reading the UTC digits as if they were already local.

**Decision:** rewrite `parseEventDate`/`parseEventTime` to construct an actual `Date` from the ISO string and format using local-timezone-aware methods (e.g. `getFullYear`/`getMonth`/`getDate`/`getHours`/`getMinutes`, or `toLocaleDateString`/`toLocaleTimeString`), matching the same idiom `buildIsoWithOffset` already uses on the write side. This makes display correctness independent of which valid offset any given writer chooses — the fix only touches the read path:

- `lib/event-datetime.ts`: `parseEventDate`/`parseEventTime` rewritten; both are also used by `EventFormModal`'s edit-mode pre-fill, so that's covered by the same fix.
- `CalendarView.tsx`'s `datesWithEvents` (`event.startAt.slice(0, 10)`) and `selectedDayEvents` filter (`startsWith(selectedDate)`) have the identical bug for day-grouping — both need the same real-`Date`-derived local date key instead of a string-slice/prefix comparison.
- `CalendarView.tsx`'s sort comparator (`a.startAt.localeCompare(b.startAt)`) is a related but distinct bug: lexicographic string order only matches chronological order when every compared event shares the same offset. Once two events have different offsets (exactly the MCP-vs-UI scenario), string comparison can sort them wrong independent of how either one's time text renders. Fix: compare `new Date(a.startAt).getTime()` against `new Date(b.startAt).getTime()`.

No data migration needed — existing correctly-encoded events parse to the same wall-clock moment either way; this is purely a read-path fix. No new dependency needed — remindeen has no date library (`dayjs`/`date-fns`/`luxon` aren't in `package.json`) and native `Date` formatting is sufficient, consistent with `buildIsoWithOffset`'s existing native-`Date` idiom.

**Known follow-on risk, not addressed by this fix:** until this lands, opening an MCP-created event in `EventFormModal`'s edit mode pre-fills the time field from the buggy `parseEventTime`, showing the wrong time. If a user edits such an event (even just the title) and saves without correcting the time, `buildIsoWithOffset` re-encodes using the *browser's* current local offset against the *wrong* displayed time — silently writing a new, genuinely incorrect instant over the original. This fix removes the display bug that causes it; no separate remediation is needed for events created before the fix ships, since they're never corrupted unless someone resaves them through the buggy form in the meantime.

## Risks / Trade-offs

- **No RRULE expansion in the UI** — recurring events only show on their `startAt` date in the mini calendar, not on every occurrence. The calendar dot for a recurring event appears only on the series start date. Acceptable for a first version; full expansion would need an rrule.js library and is deferred.
- **`getTimezoneOffset` gives user's current offset** — this is correct for display but may differ from the user's offset at the event's date (DST transitions). For WIB (no DST), this is not an issue.
- **Display always renders in the viewer's current browser timezone** — after the fix, an event's displayed time reflects "what time is this right now, in my browser's timezone," same as Google Calendar's own behavior. If a user changes their OS/browser timezone (e.g. travel) after creating an event, the displayed time will shift accordingly. This is expected and consistent with how timezone-aware calendar apps behave generally; not treated as a bug.

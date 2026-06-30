## Why

Recurring events in the CalendarView mini calendar only appear on their literal `startAt` date, not on every occurrence the `rrule` describes. A weekly "every Friday" event shows once, on its creation date, never again — even though Google Calendar (synced via the same `rrule`) correctly shows it every Friday. This was a known, documented trade-off when the events feature shipped (`openspec/changes/archive/2026-06-30-event-feature/design.md`, Risks/Trade-offs: "No RRULE expansion in the UI ... deferred"), and it's now surfacing as a real user-facing bug report.

## What Changes

- `CalendarView.tsx` expands each recurring event's `rrule` for the currently-displayed month, instead of matching only the literal `startAt` date, when building the dot-indicator set and the selected-day event list.
- Expansion is bounded to the visible month (consistent with existing prev/next navigation) to handle unbounded recurrences (`DAILY`/`WEEKLY` with no `UNTIL`/`COUNT`).
- Occurrences are a render-time concept only: every occurrence of a series still maps back to the same `event.id`. No synthetic per-occurrence ids, no API/contract changes, no changes to the real-time Pusher patching in `hooks/use-events.ts`.
- Clicking any occurrence still opens `EventFormModal` in edit mode for the whole series (unchanged behavior — per-occurrence edit/delete remains a Non-Goal, now more visible since occurrences multiply on screen).
- New dependency: `rrule` (already used server-side in the sibling `al-quotes` repo at `lib/recurrence.ts`, same `rrulestr(...).between(...)` pattern).

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `events`: "View events on a mini calendar" and "Select a day to view its events" requirements change from literal-`startAt`-date matching to rrule-expanded occurrence matching within the visible month.

## Impact

- `remindeen/components/remindeen/calendar/CalendarView.tsx` — `datesWithEvents` and `selectedDayEvents` logic.
- `remindeen/package.json` — add `rrule` dependency.
- No backend/API changes (`al-quotes` untouched).
- No changes to `hooks/use-events.ts` real-time sync logic.

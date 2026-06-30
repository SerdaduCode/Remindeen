## 1. Dependency

- [x] 1.1 Add `rrule` to `remindeen/package.json` (match the version family used in `al-quotes/package.json`)

## 2. Occurrence expansion helper

- [x] 2.1 Add a helper (e.g. `lib/event-occurrences.ts`) that takes an `Event` and a month range, and returns the occurrence instants within that range — non-recurring events return their single literal `startAt` instant if it falls in range; recurring events use `rrulestr` with a `dtstart` built from `Date.UTC(...)`-encoded local wall-clock fields (not a literal `new Date(event.startAt)` — see design.md's dtstart decision for why), reading results back via `getUTC*` getters

## 3. CalendarView integration

- [x] 3.1 Replace `datesWithEvents`'s literal-date-only `Set` construction with one built from each event's expanded occurrences for `currentMonth`
- [x] 3.2 Replace `selectedDayEvents`'s `parseEventDate(event.startAt) === selectedDate` filter with occurrence-based matching for the selected day, preserving the existing chronological sort (by occurrence instant, not the event's literal `startAt`) — scoped to `selectedDate`'s own day range (not `currentMonth`'s), so a selection made before navigating months still resolves correctly
- [x] 3.3 Ensure the day event list still displays each occurrence's own time (not always the literal `startAt` time) when an occurrence falls on a later date than the series' original `startAt`
- [x] 3.4 Confirm clicking any occurrence still opens `EventFormModal` with the original `Event` object (whole-series edit), with no synthetic occurrence id introduced anywhere in the render path

## 4. Verification

- [x] 4.1 Verified at the logic level (direct `getEventOccurrences` execution, TZ=Asia/Jakarta, reproducing the original "Lari" WIB-morning-Friday scenario): occurrences land on every Friday across July and August 2026, not just the literal `startAt` date. **Not verified through the actual extension UI** — would require loading the unpacked build into a browser with a live signed-in session and backend; not done in this session.
- [x] 4.2 Code-inspection verified: `CalendarView.tsx`'s edit path is unchanged — `formState.event` is always the literal `Event` object (never an occurrence), so `updateEvent(formState.event.id, ...)` still targets the series via its real id regardless of which occurrence was clicked. **Not click-tested in the actual UI.**
- [x] 4.3 Code-inspection verified: `hooks/use-events.ts` (Pusher `event.created`/`updated`/`deleted` handling) was not modified by this change. Non-recurring event scoping verified at the logic level (see 4.1's test output: in-month match, out-of-month no-match).

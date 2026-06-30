## Context

`CalendarView.tsx` renders a monthly mini calendar (dot indicators per day) and a selected-day event list, sourced from `useEvents(true)` (`hooks/use-events.ts`). `useEvents` fetches `GET /events` once (no date range params) and patches state in place via Pusher (`event.created` / `event.updated` / `event.deleted`), matching by `event.id`.

Each `Event` row from the backend represents one series: a literal `startAt`, and — when recurring — an `rrule` string (e.g. `RRULE:FREQ=WEEKLY;BYDAY=FR`) with no `DTSTART` embedded (dtstart is `startAt`, supplied separately, matching the convention already used server-side in `al-quotes/lib/recurrence.ts`). Today, `CalendarView.tsx` ignores `rrule` entirely for display: `datesWithEvents` and `selectedDayEvents` both compare `parseEventDate(event.startAt)` against a single date, so a recurring event only ever appears on its original creation date.

This was a known, deliberate scope cut documented in `openspec/changes/archive/2026-06-30-event-feature/design.md` ("No RRULE expansion in the UI ... deferred"). We considered fixing it server-side (expanding occurrences in `GET /events`) and rejected that path — see Decisions below.

## Goals / Non-Goals

**Goals:**
- A recurring event's dot indicator and day-list entry appear on every occurrence date that falls within the currently-displayed month, not just the literal `startAt` date.
- No backend or API contract changes.
- No changes to the existing real-time Pusher patching behavior or its correctness.

**Non-Goals:**
- Per-occurrence editing or deletion (unchanged from the original event-feature design: editing or deleting any occurrence still acts on the whole series via `event.id`).
- Expanding recurrence beyond the visible month (e.g. a mini "next occurrence" preview, agenda view, or search).
- Changing how recurrence rules are authored (`EventFormModal` / `lib/event-rrule.ts` are unchanged).

## Decisions

### Client-side expansion, not server-side

Considered expanding occurrences server-side (`GET /events?from=&to=`, reusing `al-quotes/lib/recurrence.ts`'s `getEventOccurrencesInRange`). Rejected:

- **Unbounded recurrences require a range param either way.** `buildEventRrule` (`lib/event-rrule.ts`) never sets `UNTIL`/`COUNT`, so `DAILY`/`WEEKLY` rules are infinite. Server-side expansion would force `GET /events` to take `from`/`to` params, changing the fetch lifecycle from "load once, patch via Pusher" to "refetch per visible range" — a real API contract change. Client-side expansion needs no such change: the existing unranged fetch stays as-is, and the visible month is already known locally (`currentMonth` state).
- **Synthetic occurrence ids would break existing real-time patching.** If the server materialized one item per occurrence, those items would have to share `event.id` (no separate DB row exists per occurrence). `useEvents`'s `upsertEvent` (`prev.map(e => e.id === event.id ? event : e)`) and `removeEvent` (`prev.filter(e => e.id !== id)`) both match by `id`. A single `event.updated` Pusher payload (always the canonical row, with the literal `startAt`) would collapse every visible occurrence of that series down to one entry, silently dropping the others until the next full refetch. Avoiding this would require teaching the client to re-expand `rrule` on every Pusher patch anyway — which means client-side `rrule` logic is needed regardless of where the *initial* expansion happens. Doing it all client-side avoids maintaining the same logic in two places.
- **Existing server-side precedent doesn't actually materialize occurrences.** `al-quotes/lib/mcp-tools.ts`'s `get_today_overview` uses `getEventOccurrencesInRange(...).length > 0` purely as a boolean membership test; the returned event payload is still the canonical row. A real fix for the calendar grid needs occurrence *dates*, not just a yes/no, so reusing the existing pattern as-is wouldn't even solve the UI problem.

### Expansion bounded to the visible month

`rrule`'s `.between(start, end, true)` is called with the first and last instant of `currentMonth` (mirroring `buildMonthGrid`'s own year/month derivation), recomputed via `useMemo` whenever `events` or `currentMonth` changes. This avoids ever materializing an unbounded occurrence list, and naturally re-derives when the user navigates months — no caching or pagination needed beyond what `useMemo` already gives.

### Occurrences keep the series' `id`; no synthetic identity

`datesWithEvents` becomes a `Set<string>` of date keys (unchanged shape), populated by iterating each event's expanded occurrences (or its literal date, for non-recurring events) instead of just its literal date. `selectedDayEvents` becomes an array of `{ event: Event; occurrenceStartAt: Date }`-shaped entries (or equivalent) for the selected day — display reads `occurrenceStartAt` for the time shown, but clicking still opens `EventFormModal` with the original `event` object for whole-series edit. This keeps `event.id` as the only identity that ever reaches `updateEvent`/`deleteEvent`, so `hooks/use-events.ts` needs no changes.

### `rrule` library, with a UTC-field-encoded dtstart (not `al-quotes`'s literal pattern)

Add `rrule` (same package/version family already used in `al-quotes/lib/recurrence.ts`) to `remindeen`. Stored `RRULE:` strings never embed `DTSTART`, consistent with the existing convention — `startAt` supplies it.

**Discovered during implementation:** `al-quotes/lib/recurrence.ts`'s literal pattern, `rrulestr(event.rrule, { dtstart: new Date(event.startAt) })`, is timezone-buggy. `rrule.js` derives `BYDAY` from the `Date` object's **UTC** day-of-week, not local. For an event whose local wall-clock time, converted to UTC, lands on a different calendar day (e.g. 05:00 `+07:00` → 22:00 UTC the *previous* day — a plausible time for an early-morning recurring event like "Lari"), every computed occurrence shifts by one day in local time (Friday → Saturday), reproducing the same class of bug this change exists to fix, just relocated instead of removed.

Verified fix: construct `dtstart` (and the expansion range boundaries) by encoding the event's *local* wall-clock date/time into the `Date` object's UTC fields — `new Date(Date.UTC(local.getFullYear(), local.getMonth(), local.getDate(), local.getHours(), local.getMinutes()))` — and read occurrence results back via `getUTCFullYear`/`getUTCMonth`/`getUTCDate`/`getUTCHours`/`getUTCMinutes`, not their local-timezone counterparts. This keeps `rrule.js`'s UTC-only day-of-week arithmetic operating on the *intended* local wall-clock values throughout, sidestepping the bug entirely.

This means `remindeen`'s helper does **not** reuse `al-quotes`'s `getEventOccurrencesInRange` pattern verbatim — it fixes the dtstart construction independently. `al-quotes`'s own copy of this bug is out of scope for this change (separate repo; Google Calendar itself is unaffected, since Google expands the `RRULE` string server-side via the Calendar API, not through this `rrule.js` code path) but is worth a follow-up fix there.

## Risks / Trade-offs

- **Visible occurrence multiplication changes the edit/delete affordance's apparent scope, without changing its actual scope.** A user will now see "Lari" on every Friday in the month; editing or deleting from any one of them still affects the whole series (unchanged, pre-existing backend limitation). This was a smaller gap before (only one visible instance), and is now more likely to surprise someone clicking a *different* Friday than the one they originally created. Mitigation: out of scope for this change to add per-occurrence semantics (would require backend work — see proposal's Non-Goals), but worth a follow-up UX nudge (e.g. a hint in `EventFormModal` when editing a recurring event) if it proves confusing in practice.
- **Performance**: expanding `rrule` for every recurring event on every render-affecting state change (month navigation, Pusher patch) is bounded by event count and `useMemo`, consistent with the existing all-events-in-memory model — not expected to be a problem at personal-calendar scale, but not load-tested.

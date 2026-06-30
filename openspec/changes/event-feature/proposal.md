## Why

The backend (`al-quotes` change `event-feature`) added a full Event model with CRUD routes and Google Calendar sync. The remindeen UI has no calendar view or event management at all. Users should be able to select a date, create/edit/delete events with time and location, and see their upcoming events — all from the Productivity page, without leaving the new tab.

## What Changes

- Add a **CalendarView panel** in the left column of the Productivity page, below the HabitTracker. The panel shows a mini monthly calendar and a list of events for the selected day.
- Add a `useEvents` hook (mirrors `useHabits`) for CRUD and real-time Pusher event subscription.
- Add an `EventFormModal` (mirrors `HabitFormModal`) for creating and editing events, opened when the user clicks "Add Event" on a selected day or clicks an existing event.
- Clicking a date on the mini calendar selects that day and shows its events. Clicking "+" on the selected day opens `EventFormModal` pre-filled with that date.
- `EventFormModal` fields: title (required), date (required, pre-filled from selection), start time (required), end time (optional), location (optional), recurring toggle + RRULE builder (simple recurrence: none / daily / weekly / monthly), sync to calendar toggle (default on, disabled when not connected).
- Layout change: `ProductivityPage` left column becomes a flex column with `HabitTracker` on top and `CalendarView` below, each in its own glass panel.

## Capabilities

### New Capabilities
- `events`: UI for creating, viewing, editing, and deleting user events from the CalendarView panel

### Modified Capabilities
- `productivity-page-layout`: left column now contains two stacked panels (HabitTracker + CalendarView) instead of one

## Impact

- `hooks/use-events.ts` — new hook for event CRUD + Pusher realtime
- `components/remindeen/calendar/CalendarView.tsx` — new component: mini calendar + selected-day event list
- `components/remindeen/calendar/EventFormModal.tsx` — new component: create/edit event modal
- `components/remindeen/productivity/ProductivityPage.tsx` — left column wraps HabitTracker and CalendarView in a flex column
- No backend changes (paired backend change already done)

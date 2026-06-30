## 1. useEvents Hook

- [ ] 1.1 Create `hooks/use-events.ts` with `Event` and `EventInput` interfaces matching the backend model (`id`, `userId`, `title`, `description?`, `location?`, `startAt`, `endAt?`, `isRecurring`, `rrule?`, `syncToCalendar`, `createdAt`, `updatedAt`)
- [ ] 1.2 Implement initial fetch: `GET /events` on mount, set `events` state
- [ ] 1.3 Implement `createEvent(input: EventInput)`: POST, update local state
- [ ] 1.4 Implement `updateEvent(id: number, updates: Partial<EventInput>)`: PATCH, update local state
- [ ] 1.5 Implement `deleteEvent(id: number)`: DELETE, remove from local state
- [ ] 1.6 Bind Pusher channel events (`event.created`, `event.updated`, `event.deleted`) using the same acquire/release pattern as `use-habits.ts`; refresh on Pusher reconnect

## 2. ISO String Builder Helper

- [ ] 2.1 Create `lib/event-datetime.ts` with `buildIsoWithOffset(date: string, time: string): string` that produces `"YYYY-MM-DDTHH:MM:00±HH:MM"` using `new Date().getTimezoneOffset()` for the local offset
- [ ] 2.2 Create `parseEventDate(startAt: string): string` that returns the `YYYY-MM-DD` portion of an ISO string (first 10 chars)
- [ ] 2.3 Create `parseEventTime(startAt: string): string` that returns the `HH:MM` portion (chars 11–15)

## 3. RRULE Builder Helper

- [ ] 3.1 Create `lib/event-rrule.ts` with `buildEventRrule(recurrence: 'none'|'daily'|'weekly'|'monthly', weekDays?: number[]): { isRecurring: boolean; rrule: string | null }`:
  - `none` → `{ isRecurring: false, rrule: null }`
  - `daily` → `{ isRecurring: true, rrule: "RRULE:FREQ=DAILY" }`
  - `weekly` with days → `{ isRecurring: true, rrule: "RRULE:FREQ=WEEKLY;BYDAY=<days>" }`
  - `monthly` → `{ isRecurring: true, rrule: "RRULE:FREQ=MONTHLY" }`

## 4. EventFormModal

- [ ] 4.1 Create `components/remindeen/calendar/EventFormModal.tsx` using `createPortal`, same glass modal shell as `HabitFormModal`
- [ ] 4.2 Props: `initial: Event | null`, `initialDate?: string`, `onClose: () => void`, `onSubmit: (values: EventInput) => Promise<void>`, `onDelete?: () => Promise<void>`
- [ ] 4.3 Form state: `title`, `date` (YYYY-MM-DD), `startTime` (HH:MM), `endTime` (HH:MM, optional), `location` (optional), `recurrence` (select: none/daily/weekly/monthly), `weekDays` (number[], shown when weekly), `syncToCalendar` (boolean, default true)
- [ ] 4.4 Pre-fill from `initial` when editing; pre-fill `date` from `initialDate` when creating
- [ ] 4.5 On submit: construct `startAt` via `buildIsoWithOffset(date, startTime)`, `endAt` via `buildIsoWithOffset(date, endTime)` if endTime set, `rrule` via `buildEventRrule`, then call `onSubmit`
- [ ] 4.6 "Sync to Calendar" toggle: import `useCalendarConnection`; disable with hint when not connected
- [ ] 4.7 Delete button (edit mode only): use `ConfirmDeletePanel` pattern from `delete-confirmation-modal` change
- [ ] 4.8 Add translation keys for all labels to locale files

## 5. CalendarView Component

- [ ] 5.1 Create `components/remindeen/calendar/CalendarView.tsx`
- [ ] 5.2 State: `currentMonth: Date` (today's month), `selectedDate: string | null` (YYYY-MM-DD)
- [ ] 5.3 Render month header with prev/next chevron buttons; clicking prev/next updates `currentMonth`
- [ ] 5.4 Render 7-column day grid (Mon–Sun header row + day cells for the month); pad with empty cells for days before the 1st and after the last
- [ ] 5.5 Each day cell: show day number; if any event's `startAt` starts with that date string, show a small dot; clicking the cell sets `selectedDate`; highlight today and `selectedDate` with distinct backgrounds
- [ ] 5.6 Below the grid: render the event list for `selectedDate` — sorted by `startAt`; each row shows time, title, optional location, and a recurring icon if `isRecurring`
- [ ] 5.7 Above the event list: an "+ Add Event" button that opens `EventFormModal` in create mode with `initialDate = selectedDate`
- [ ] 5.8 Clicking an event row opens `EventFormModal` in edit mode
- [ ] 5.9 On `EventFormModal` submit/delete: call `createEvent`/`updateEvent`/`deleteEvent` from `useEvents`, then close modal
- [ ] 5.10 Pass `events` from `useEvents` down as prop or call the hook inside `CalendarView`

## 6. ProductivityPage Layout Update

- [ ] 6.1 In `ProductivityPage.tsx`, wrap the existing `<section>` for `HabitTracker` and a new `<section>` for `CalendarView` in a `<div className="flex flex-col gap-4 min-h-0">`
- [ ] 6.2 Import `CalendarView` and `useEvents` (or let `CalendarView` own the hook internally)
- [ ] 6.3 Ensure the left column `<div>` is passed into the existing `md:grid-cols-[320px_minmax(0,1fr)]` grid as the first grid item

## 7. Verification

- [ ] 7.1 Open Productivity page → confirm HabitTracker and CalendarView both visible in left column, KanbanBoard in right
- [ ] 7.2 Navigate months in CalendarView → confirm grid updates correctly
- [ ] 7.3 Click a date → confirm event list for that day appears
- [ ] 7.4 Create an event with title + date + time → confirm appears in event list and dot on calendar
- [ ] 7.5 Create a weekly recurring event (e.g. every Friday) → confirm `rrule` is correct in the API response
- [ ] 7.6 Edit an event → confirm PATCH fires and event list updates
- [ ] 7.7 Delete an event → confirm inline confirmation appears, then event is removed
- [ ] 7.8 Create an event via MCP API → confirm it appears in the UI without refresh (Pusher)
- [ ] 7.9 Verify layout on narrow viewport: all panels stack vertically

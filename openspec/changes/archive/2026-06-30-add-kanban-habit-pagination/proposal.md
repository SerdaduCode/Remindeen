## Why

The Habit and Kanban widgets only ever show "right now": Habit shows today's check-in state with no way to see prior days, and Kanban's `DONE` column is a single flat, ever-growing list with no sense of when things were finished. As both lists grow, neither widget helps the user understand recent history — habit consistency over the past weeks, or what got shipped each week. Both headers currently only have a "+" add button with no navigation. This change adds arrow-button pagination to both headers — paging Habit by week to reveal a 7-day check-in history strip per habit, and paging Kanban by week to show which tasks were completed that week — and replaces the verbose "Check in" text button with a compact checklist icon.

## What Changes

- **Shared week-cursor utility** (`lib/iso-week.ts`): ISO week (Monday–Sunday, UTC-aligned to match the existing `habit-streak.ts` convention) start/number computation, week navigation (±1 week), and "is this the current week" check. Reused by both widgets — no upper bound on how far back a user can page.
- **HabitTracker header**: gains `‹ Week N, YYYY ›` arrow controls (visual pattern matches the existing `Pager` arrows — disabled `›` when already at the current week). Paging changes which week's check-in history is shown.
- **Habit row — daily-frequency habits**: row gains a 7-cell Mon–Sun strip showing ✓/empty for each day of the viewed week, built from check-in data the app already fetches (`checkInsByHabit`) — no new API calls.
- **Habit row — weekly-frequency habits**: row shows a single "checked in this week" indicator for the viewed week (weekly check-ins are already recorded once per ISO week, not per day, so a 7-cell daily strip doesn't apply).
- **Habit check-in control**: the "Check in" / "Checked in" text `Button` is replaced with an icon-only checklist button (`ListChecks` from `lucide-react`). It stays clickable only when viewing the current week; on past weeks it renders as a disabled, read-only indicator of that week's check-in state.
- **KanbanBoard header**: gains the same `‹ Week N, YYYY ›` arrow controls. The "+" add-task button is only shown when viewing the current week (creating a task while browsing history is not meaningful).
- **Kanban current-week view** (default, unchanged structure): the existing 3-column `TODO`/`DOING`/`DONE` board with drag-and-drop, except the `DONE` column is now filtered to tasks whose `completedAt` falls within the viewed (current) week. `TODO`/`DOING` are unfiltered, as today — unfinished tasks always surface on the current week regardless of age.
- **Kanban past-week view**: replaces the 3-column board with a single read-only list of tasks completed that week (`completedAt` within the viewed week range), titled with the week label. No drag-and-drop or reordering. Cards remain clickable, opening the existing `TaskFormModal` to view details and the comment thread (same modal used today).
- Depends on the paired backend change `add-task-completed-at` (in the `al-quotes` repo), which adds the `completedAt` field this filtering relies on. Must ship after that change is deployed.

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `habit-tracking`: habit list gains week-paginated check-in history (7-day strip for daily habits, weekly indicator for weekly habits) and replaces the check-in button with an icon-only control.
- `kanban-tasks`: Kanban board gains week pagination; the `DONE` column scopes to the viewed week, and past weeks render as a read-only completed-tasks list instead of the full 3-column board.

## Impact

- `lib/iso-week.ts` — new shared week-math utility
- `components/remindeen/habit/HabitTracker.tsx` — header pagination, week-scoped row rendering, icon check-in control
- `components/remindeen/kanban/KanbanBoard.tsx` — header pagination, current-week vs past-week branching, conditional "+" button
- `components/remindeen/kanban/KanbanColumn.tsx` — unchanged (still used for the current-week 3-column view)
- `components/remindeen/kanban/TaskCard.tsx` — split into a presentational `TaskCardView` (markup) reused by both the draggable `TaskCard` and a new non-draggable rendering used in the past-week read-only list
- New: a past-week read-only task list component for Kanban (no `dnd-kit` wiring)
- `hooks/use-tasks.ts` — `Task` type gains `completedAt: string | null` to match the paired backend change
- `app.config.ts` — new translation keys for week navigation labels and updated/added aria-labels for the icon check-in button
- No changes to `hooks/use-habits.ts` data fetching — existing `checkInsByHabit` already contains full history

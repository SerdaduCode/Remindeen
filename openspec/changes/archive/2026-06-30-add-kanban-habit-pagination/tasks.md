## 1. Shared Week Utility

- [x] 1.1 Create `lib/iso-week.ts` with `getCurrentWeekStart()`, `addWeeks(weekStart: Date, delta: number)`, `getIsoWeekNumber(weekStart: Date)`, `getIsoWeekYear(weekStart: Date)`, and `isCurrentWeek(weekStart: Date)`, all using UTC-aligned ISO week boundaries (Monday start)
- [x] 1.2 Reuse the existing UTC start-of-week math from `lib/habit-streak.ts` (`startOfIsoWeekUTC`) rather than re-deriving it — export it from `habit-streak.ts` if it isn't already exported, and import it into `iso-week.ts`
- [x] 1.3 Add a `formatWeekRange(weekStart: Date)` helper that returns the Mon–Sun date range as a locale-formatted string (via `toLocaleDateString`), for use as header subtext

## 2. Task Type & Data

- [x] 2.1 Add `completedAt: string | null` to the `Task` interface in `hooks/use-tasks.ts`, matching the paired `al-quotes` change `add-task-completed-at`
- [x] 2.2 Confirm no other change is needed in `use-tasks.ts` — `completedAt` rides along on existing `GET /tasks` responses with no new fetch logic

## 3. TaskCard Split (no behavior change yet)

- [x] 3.1 Extract the visual markup of `components/remindeen/kanban/TaskCard.tsx` (title, description, priority badge, due date) into a new presentational component `TaskCardView`, accepting `task: Task` as its only required prop
- [x] 3.2 Update `TaskCard` to call `useSortable` and wrap `TaskCardView`, passing through `ref`/`style`/`attributes`/`listeners` exactly as it does today
- [x] 3.3 Verify the current-week board renders and drags identically to before this split (no visual or behavioral regression) — verified by typecheck + build only (see 9.2 note: interactive drag verification not performed)

## 4. Kanban Past-Week Read-Only View

- [x] 4.1 Create a new component (e.g. `components/remindeen/kanban/KanbanWeekHistory.tsx`) that takes a list of tasks and renders each via `TaskCardView` inside a plain clickable `<button>`/`<div onClick>` — no `dnd-kit` wiring
- [x] 4.2 Clicking an item opens the existing `TaskFormModal` in edit mode, the same modal already used for the live board
- [x] 4.3 Render an empty state (reusing the existing empty-state visual pattern) when the list is empty for that week
- [x] 4.4 Title the view with the viewed week's label (from `lib/iso-week.ts` + `formatWeekRange`)

## 5. KanbanBoard Header & Wiring

- [x] 5.1 Add `weekCursor` state to `KanbanBoard`, initialized via `getCurrentWeekStart()`
- [x] 5.2 Replace the header's `justify-end` row with a 3-part header: `‹` arrow, week label (number + date range), `›` arrow, matching the visual style of `Pager`'s arrow buttons (rounded, `hover:bg-white/10`, disabled state at `opacity-0`/`pointer-events-none`)
- [x] 5.3 `‹` calls `setWeekCursor(addWeeks(weekCursor, -1))` unconditionally (no lower bound)
- [x] 5.4 `›` calls `setWeekCursor(addWeeks(weekCursor, 1))`, disabled when `isCurrentWeek(weekCursor)` is true
- [x] 5.5 Render the "+" add-task button only when `isCurrentWeek(weekCursor)` is true
- [x] 5.6 When `isCurrentWeek(weekCursor)` is true: render the existing `DndContext`/3-column board, but filter the `DONE` column's tasks to those whose `completedAt` falls within `[weekCursor, weekCursor + 7 days)` before passing them to `KanbanColumn` — implemented as `currentWeekDoneTasks`, kept position-sorted (not completedAt-sorted) so drag-to-reorder within DONE still works
- [x] 5.7 When `isCurrentWeek(weekCursor)` is false: render `KanbanWeekHistory` instead, passing tasks filtered to `completedAt` within the viewed week's range, sorted by completion time
- [x] 5.8 Confirm `TODO`/`DOING` columns on the current-week view remain unfiltered (all tasks in those statuses, regardless of `completedAt`/age), per the existing behavior

## 6. Habit Week Strip & Indicator

- [x] 6.1 Add a `weekDayCheckedState(weekStart, checkIns)` helper, for a `daily` habit, returns a 7-entry boolean array (Mon–Sun) derived from `checkInsByHabit[habit.id]` matching each day's date string
- [x] 6.2 Add a `weekCheckedState(weekStart, checkIns)` helper for `weekly` habits that returns a single boolean: whether a check-in exists with `periodStart` equal to `weekStart` — also exposed `checkInsByHabit` from `useHabits` (was internal-only before; `HabitTracker` needs direct access to compute these)
- [x] 6.3 Render the 7-cell strip (small fixed-width glyphs, Mon–Sun, hover/title-only day abbreviation to stay compact) for `daily` habits, and the single text indicator for `weekly` habits, both reflecting the viewed week, not necessarily "today"

## 7. HabitTracker Header & Icon Check-In Control

- [x] 7.1 Add `weekCursor` state to `HabitTracker`, initialized via `getCurrentWeekStart()`, with the same header layout/arrow behavior as Kanban
- [x] 7.2 Replace the "Check in" / "Checked in" `Button` with an icon-only button using `ListChecks` from `lucide-react`; checked state communicated via style (filled emerald vs outline/dim), not text
- [x] 7.3 The icon button remains clickable (calling the existing `checkIn(habit)`, unchanged) only when `isCurrentWeek(weekCursor)` is true
- [x] 7.4 When `isCurrentWeek(weekCursor)` is false, the icon button is `disabled`; its filled/unfilled visual reflects that week's recorded state for weekly habits, and is neutral (unfilled) for daily habits since the day-strip is the authoritative per-day read-out for those
- [x] 7.5 Kept `aria-label` on the icon button using the existing `habit.check_in`/`habit.checked_in` translation keys

## 8. Translations

- [x] 8.1 Added `kanban.week_label_prefix` and `habit.week_label_prefix` to `app.config.ts` for `en`/`id`
- [x] 8.2 Added `kanban.empty_state_week` for the past-week empty state
- [x] 8.3 Added `kanban.previous_week`/`kanban.next_week` and `habit.previous_week`/`habit.next_week` aria-labels
- [x] 8.4 Confirmed `habit.check_in`/`habit.checked_in` text still reads sensibly as aria-label-only strings; also added `habit.week_checked`/`habit.week_not_checked` for the weekly-habit text indicator

## 9. Verification

- [x] 9.1 Confirmed: the paired `al-quotes` change `add-task-completed-at` was implemented and applied to the live database earlier in this session — `completedAt` is present on `GET /tasks` responses
- [x] 9.2 Verified manually by the user: paging Kanban back shows only that week's completed tasks, paging forward is capped at the current week (disabled `›`), and the current week's board still drags/drops normally
- [x] 9.3 Verified manually by the user: paging Habit back shows the correct 7-day strip for a daily habit and the correct single indicator for a weekly habit, and the icon check-in control is disabled on past weeks
- [x] 9.4 Verified manually by the user: clicking a card in the past-week Kanban list opens the task modal with details and comments
- [x] 9.5 Verified manually by the user: 7-cell strip layout in the 320px sidebar column doesn't overflow or wrap awkwardly
- [x] 9.6 `pnpm run compile` (tsc --noEmit) passes with no errors; `pnpm run build:chrome` (wxt build) succeeds with no bundling errors

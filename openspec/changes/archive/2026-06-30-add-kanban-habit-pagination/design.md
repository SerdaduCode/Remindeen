## Context

Both `HabitTracker` and `KanbanBoard` headers today only contain a "+" button (see [HabitTracker.tsx](../../../components/remindeen/habit/HabitTracker.tsx), [KanbanBoard.tsx](../../../components/remindeen/kanban/KanbanBoard.tsx)). `useHabits` already loads every check-in for every habit (`checkInsByHabit: Record<number, HabitCheckIn[]>`), so habit history pagination is purely a rendering concern — no new fetches needed. Kanban history pagination depends on the `completedAt` field added by the paired backend change `add-task-completed-at` in `al-quotes`; without it, there is no reliable way to know which week a `DONE` task belongs to.

The codebase already has one ISO-week computation, in `lib/habit-streak.ts` (`startOfIsoWeekUTC`), used for weekly-habit streak/period logic. It is UTC-aligned by design (per that file's own comment, the local-timezone weekly boundary is a known, separately-tracked issue). This change should reuse that same week-start convention rather than introduce a second, subtly different one.

There's also an existing arrow-pagination pattern in the codebase: `components/remindeen/pager/Pager.tsx`, which disables the `›` arrow at the last page. The new header arrows follow the same disabled-at-the-edge convention (disable `›` when already viewing the current week), but are a different mechanism — `Pager` swaps between two fixed pages; these arrows move a week cursor with no fixed page count.

## Goals / Non-Goals

**Goals:**
- Let users see a week's worth of habit check-in history per habit, navigable backward with no limit.
- Let users see which Kanban tasks were completed in a given week, navigable backward with no limit.
- Reuse existing data (`checkInsByHabit`) and the new `completedAt` field without adding new API calls beyond what `add-task-completed-at` already returns on `GET /tasks`.
- Keep the current-week experience for both widgets behaviorally close to today (same check-in action, same drag-and-drop board) — pagination is additive, not a redesign of the live view.

**Non-Goals:**
- Editing or backfilling check-ins/tasks for past weeks beyond what already works today (e.g. no "log a missed check-in retroactively" feature — explicitly decided read-only for history).
- Calendar-month-based week labeling (e.g. "June Week 1") — superseded by the decision to use plain ISO week-of-year numbering.
- Any change to how `checkIn`/task drag-and-drop persist data — only the read/display layer changes.
- Persisting the viewed week across sessions — the cursor always resets to the current week on mount.

## Decisions

**1. Shared `lib/iso-week.ts` util, built on top of `habit-streak.ts`'s existing week-start logic.**
`habit-streak.ts` keeps its current export surface (it answers "what period is this check-in in," not "what week should the UI show"). `lib/iso-week.ts` is new and provides the UI-facing operations: `getCurrentWeekStart()`, `addWeeks(weekStart, delta)`, `getIsoWeekNumber(weekStart)`, `isCurrentWeek(weekStart)`. Internally it reuses the same UTC start-of-week math as `habit-streak.ts` (factored out if needed) so the two never disagree about where a week begins.

**2. Week label format: `Week {n}, {year}` plus a date sub-range, no calendar-month naming.**
Per the ISO-week-of-year decision, a week is identified by its ISO week number, not a month-relative label. The header shows e.g. `Week 26, 2026` with the Mon–Sun date range underneath or alongside (formatted via `Intl`/`toLocaleDateString`, not a translation key, mirroring how `TaskCard` already formats `dueDate`). This avoids needing a templated/interpolated translation string — the codebase's `t()` function is a flat key lookup with no parameter substitution (confirmed in `use-translation.ts`); existing dynamic text is built by concatenating a translated static fragment with a raw value (e.g. `` `${streak} ${t("habit.streak_suffix")}` `` in `HabitTracker.tsx`). The week label follows that same concatenation pattern instead of introducing templating.

**3. "At the current week" is communicated by disabling `›`, not by a text badge.**
Matches the existing `Pager` convention (`disabled:opacity-0` style) so the two pagination affordances in the app feel consistent. No new translation key needed for a "(this week)" label.

**4. Habit row rendering forks on `habit.frequency`.**
- `daily`: 7-cell Mon–Sun strip. Each cell's state comes from checking whether `checkInsByHabit[habit.id]` has an entry whose `periodStart` (a date string) equals that day.
- `weekly`: a single indicator for "checked in this viewed week," since weekly check-ins are recorded once per ISO week (`periodStart` = week start, per `computePeriodStart` in `habit-streak.ts`), not per day. Rendering a 7-cell strip for weekly habits would imply per-day granularity the data doesn't have. The single indicator still respects `habit.weekDays` for context (e.g. showing which days were scheduled), but completion is binary for the whole week.

**5. The checklist icon button is only interactive on the current week.**
On past weeks, the same visual slot renders a disabled/static version (no `onClick`, reduced opacity) showing that period's recorded state. This was an explicit decision: history is read-only, preventing accidental check-ins being recorded against the wrong period.

**6. Kanban current-week `DONE` column filters by `completedAt` falling within the viewed (current) week; `TODO`/`DOING` stay unfiltered.**
This matches the explicit decision that unfinished tasks from any prior week always surface on the current week, never siloed into a past week's view. Filtering only applies to `DONE`, and only because `DONE` is the column whose membership pagination is meant to scope.

**7. Past-week Kanban view is a distinct render path, not `KanbanColumn` reused with a filter.**
`KanbanColumn` is wired to `useDroppable` and renders `TaskCard`s inside a `SortableContext` — both are meaningless without an active `DndContext` drag session and a destination to drop into. Reusing it for a read-only single list would mean either suppressing drag behavior with extra conditional props, or accepting dead drag affordances. Instead:
- `TaskCard`'s visual markup (title, description, priority badge, due date) is extracted into a new presentational component, `TaskCardView`, with no `dnd-kit` hooks.
- `TaskCard` (draggable) becomes a thin wrapper: calls `useSortable`, applies the transform/listeners, and renders `TaskCardView` inside.
- The past-week list renders `TaskCardView` directly inside a plain `<button onClick={...}>` (opens `TaskFormModal`), with no sortable wiring at all — avoiding the rules-of-hooks problem of conditionally calling `useSortable` and avoiding a dead `DndContext`.

**8. The "+" add-task button is hidden (not just disabled) when viewing a past week.**
Creating a task always means "create a new `TODO` task now" (per existing `createTask` behavior — new tasks default to `TODO`, no status selection at creation). That action doesn't make sense framed inside a past week's read-only view, so the affordance is removed entirely rather than shown disabled with an explanation.

**9. No upper bound on how far back either header can page.**
Per explicit decision. The `‹` arrow is always enabled (no "oldest week" boundary is computed or enforced) — if a week has no data, the relevant widget shows its existing empty state, scoped to that week (e.g. "No tasks completed this week" / habit rows showing all-empty strips), rather than disabling further navigation.

## Risks / Trade-offs

- **[Risk] 7-cell day strip is visually tight in the 320px sidebar column** (`HabitTracker` lives in a `320px` fixed column per `ProductivityPage.tsx`) → Mitigation: cells are small fixed-width glyphs/dots (similar density to the existing day-abbreviation metadata line already rendered today), no new layout primitive needed; verify in-browser per this project's UI verification practice before considering this done.
- **[Risk] Splitting `TaskCard` into `TaskCardView` + wrapper touches a component the in-progress `fix-kanban-dnd-pager-transform` change also touches (DragOverlay rendering)** → Mitigation: that change's remaining work is verification-only (tasks 4.1/4.3 still unchecked, no further code edits planned there); confirm it's merged/stable before starting this change's `TaskCard` split to avoid conflicting edits.
- **[Trade-off] Past-week Kanban view reuses the full `TaskFormModal` (edit, status change, delete, comments) rather than a stripped-down read-only viewer** → Accepted per explicit decision ("masih bisa klik untuk lihat detail dan komentar"); no separate read-only modal is built. A side effect: a user could change a past-week task's status back out of `DONE` from within the modal, which would clear its `completedAt` (per the paired backend change) and remove it from that week's history — this is existing edit capability, not new behavior introduced here, so it's left as-is rather than special-cased.
- **[Risk] Weekly-frequency habits showing a single indicator instead of a 7-cell strip may look inconsistent row-to-row in a mixed list of daily and weekly habits** → Accepted: the inconsistency reflects a genuine data-granularity difference (per Decision 4), not an arbitrary visual choice; rows already differ today (metadata line differs by frequency).

## Migration Plan

1. Land and deploy the paired `al-quotes` change `add-task-completed-at` first — `completedAt` must exist on the API response before this change's Kanban filtering can work.
2. Add `lib/iso-week.ts`.
3. Update `hooks/use-tasks.ts`'s `Task` type to include `completedAt: string | null`.
4. Split `TaskCard` into `TaskCardView` + `TaskCard` wrapper (no behavior change yet — current-week board should render identically after this step).
5. Build the past-week read-only Kanban list and wire header pagination into `KanbanBoard`.
6. Build the habit week strip/indicator and wire header pagination into `HabitTracker`; replace the check-in button with the icon control.
7. Add new translation keys to `app.config.ts` for both `en` and `id`.
8. Manual verification in-browser (per this project's practice of testing UI changes live, not just via type-check) — see tasks.md Verification section.

No rollback complexity: this is a frontend-only, additive change once the backend field exists; reverting is a normal revert of the `remindeen` commit(s).

## 1. Habit weekly rate helper

- [x] 1.1 Add a `computeWeeklyRate(habit, checkIns)` helper to `lib/habit-streak.ts`: for daily habits, completed days this week / 7 (or days elapsed so far this week — decide based on whether a partial week should show a lower rate); for weekly habits, completed check-ins this week / `weekDays.length` (or 1 if `weekDays` is empty)
- [x] 1.2 Unit-test the helper against a few known habit/check-in combinations

## 2. Ring chart component

- [x] 2.1 Port the prototype's SVG ring-chart arc markup (`ringChartMarkup()`) into a small reusable React component (e.g. `components/ui/ring-chart.tsx`), taking a percentage and a stroke color
- [x] 2.2 Add `components/remindeen/productivity/WeekSummary.tsx`: renders the task-completion ring and habit-consistency ring using the component above

## 3. Layout

- [x] 3.1 Add the fourth column to `ProductivityPage.tsx`'s grid, rendering `WeekSummary` first (other changes append `PrayerTracker`, `QuranProgress`, `Todolist` into the same column)

## 4. Verification

- [ ] 4.1 Manually verify: task completion ring matches `doneTasks / totalTasks` for a known set of tasks
- [ ] 4.2 Manually verify: habit consistency ring updates when a habit is checked in
- [ ] 4.3 Manually verify: both rings show 0% without error when the user has no tasks/habits yet
- [ ] 4.4 Manually verify: narrow viewport stacks the fourth column instead of causing horizontal scroll

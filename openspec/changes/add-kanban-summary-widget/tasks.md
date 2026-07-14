## 1. Implementation

- [x] 1.1 Check how `use-tasks.ts` is currently consumed by `KanbanBoard.tsx` and decide: lift task state up to `ProductivityPage.tsx` and pass down as props, or confirm the hook is safe to call from a second component without duplicating fetches/subscriptions
- [x] 1.2 Add `components/remindeen/kanban/KanbanSummary.tsx` (or under `components/remindeen/productivity/`): total/done/due-this-week counts, 3-segment status bar, priority breakdown — port the formulas from `renderKanbanStats()` in the design prototype
- [x] 1.3 Use the existing `lib/iso-week.ts` helper for the "due this week" boundary calculation
- [x] 1.4 Render `KanbanSummary` in `ProductivityPage.tsx`, in a new row beneath the Kanban panel, alongside `BrainDump` (from the separate `add-brain-dump` change — render independently if that change hasn't landed yet)

## 2. Verification

- [ ] 2.1 Manually verify: with a mix of TODO/DOING/DONE tasks, the counts and bar segments match the actual task list
- [ ] 2.2 Manually verify: with zero tasks, the widget renders without error
- [ ] 2.3 Manually verify: creating, completing, or deleting a task in the Kanban board updates the summary live without a page reload
- [ ] 2.4 Manually verify: "due this week" only counts tasks with a `dueDate` inside the current ISO week

## Why

The Kanban task modal has outgrown its current 380px single-column shape: description and comments are squeezed into single-line `<Input>` fields, status can only be changed by dragging a card between columns, and there's no way to control per-task calendar sync now that the backend supports it. Drag-and-drop also lacks the visual polish (drag overlay, easing, lift) expected of a "mature" Kanban board.

## What Changes

- Redesign the task modal as a wider, two-pane layout (~640-720px): task fields on the left, the comment thread on its own scrollable pane on the right. Falls back to a single stacked column below a width breakpoint.
- Replace the single-line description `<Input>` with a multi-line `<Textarea>` (new shadcn-style component, not yet present in `components/ui/`).
- Replace the single-line comment body `<Input>` (both the new-comment composer and the inline comment editor) with the same `<Textarea>` component.
- Add a `Status` select (`To Do` / `Doing` / `Done`) to the **edit** modal only — task creation still always defaults to `To Do`, consistent with the existing create-task requirement; status remains changeable afterward via this field or by dragging the card.
- Add a "Sync to Calendar" toggle to the modal, wired to the `syncToCalendar` field added in the paired `al-quotes` change (`add-per-task-calendar-sync-toggle`). Defaults to off for new tasks. Disabled with an explanatory hint when the user hasn't connected Google Calendar yet.
- Smooth out drag-and-drop: adopt `@dnd-kit/core`'s `DragOverlay` so the dragged card renders in a floating layer (scale + shadow + slight rotate) instead of fading in place, and switch the sort transition easing to a spring-like curve instead of the dnd-kit default.

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `kanban-tasks`: editing a task now also includes its status (in addition to title, description, start date, due date, priority) and its calendar-sync flag; the create-task requirement gains an explicit note that status is not selectable at creation time.

## Impact

- `components/ui/textarea.tsx` — new component.
- `components/remindeen/kanban/TaskFormModal.tsx` — layout restructure (two-pane), Textarea swap for description, status `Select`, calendar-sync `Switch`.
- `components/remindeen/kanban/TaskFormModal.tsx` (`TaskComments`) — Textarea swap for comment composer/editor.
- `components/remindeen/kanban/KanbanBoard.tsx`, `KanbanColumn.tsx`, `TaskCard.tsx` — `DragOverlay` wiring and transition easing.
- `hooks/use-tasks.ts` — `Task`/`TaskInput` types gain `syncToCalendar`; `updateTask` already accepts `status` via `Partial<TaskInput> & { status? }`, no signature change needed there.
- `hooks/use-calendar-connection.ts` — read from the edit modal to know whether to disable the toggle.
- `app.config.ts` — new translation keys for status field labels and the calendar-sync toggle.
- Depends on the `al-quotes` repo's `add-per-task-calendar-sync-toggle` change shipping the `syncToCalendar` field on `POST /tasks` and `PATCH /tasks/:id` first.

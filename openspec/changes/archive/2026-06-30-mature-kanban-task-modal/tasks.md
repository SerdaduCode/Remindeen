## 1. Textarea component

- [x] 1.1 Add `components/ui/textarea.tsx`, mirroring `Input`'s Tailwind classes (border, focus ring, background, placeholder) with multi-line sizing (`min-h-`, `resize-y` or `resize-none`)

## 2. Types and data plumbing

- [x] 2.1 Add `syncToCalendar?: boolean` to `TaskInput` and `syncToCalendar: boolean` to `Task` in `hooks/use-tasks.ts`
- [x] 2.2 Add `status?: TaskStatus` to `TaskFormValues` in `TaskFormModal.tsx`

## 3. Modal layout

- [x] 3.1 Restructure `TaskFormModal.tsx`'s outer container to a two-pane grid (`grid-cols-1 md:grid-cols-[1fr_280px]` or similar), widening the panel to ~640-720px on `md:` and up
- [x] 3.2 Move the existing field stack (title, description, dates, priority) into the left pane
- [x] 3.3 Move `TaskComments` into the right pane with its own independent scroll
- [x] 3.4 Verify single-column stacking (fields, then comments) below the `md:` breakpoint

## 4. Description and comments as multi-line text

- [x] 4.1 Swap the description `<Input>` for the new `<Textarea>`
- [x] 4.2 Swap the comment composer `<Input>` (in `TaskComments`) for `<Textarea>`, adjusting the Enter-to-send keydown handler to keep working with a multi-line field (Shift+Enter for newline, Enter to send)
- [x] 4.3 Swap the inline comment-edit `<Input>` for `<Textarea>`

## 5. Status field

- [x] 5.1 Add a `Status` `<Select>` to the left pane, rendered only when `isEdit` is true, mirroring the existing priority `Select`'s structure
- [x] 5.2 Initialize from `initial.status`, include `status` in the submitted `TaskFormValues` when editing
- [x] 5.3 Add the `kanban.form.status_*` translation keys (label + To Do/Doing/Done options) to `app.config.ts`

## 6. Calendar sync toggle

- [x] 6.1 Add a `Switch` + label row ("Sync to Calendar") to the left pane, backed by `useCalendarConnection()`'s `status.connected`
- [x] 6.2 Disable the `Switch` and show a hint string when `status.connected` is `false`
- [x] 6.3 Initialize from `initial?.syncToCalendar ?? false`, include `syncToCalendar` in submitted `TaskFormValues` for both create and edit
- [x] 6.4 Add the `kanban.form.sync_calendar_*` translation keys (label + disabled hint) to `app.config.ts`
- [x] 6.5 Fix low-contrast `Switch` on the glass backdrop: confirmed via devtools that the rendered `<button role="switch">` is present, enabled, and `aria-checked` toggles correctly — the bug is purely visual, not functional. `Switch`'s default classes use semantic tokens (`bg-primary`/`bg-input`, `dark:bg-input/80`) tuned for a solid background; against this modal's `bg-zinc-900/70` + `bg-white/5` glass layers the unchecked track resolves to roughly white-12%-on-white-5%, which reads as invisible. Override the track/thumb colors on this instance to the same hardcoded white/zinc palette used by every other control in the modal (e.g. `data-[state=checked]:bg-white data-[state=unchecked]:bg-white/20`, opaque thumb) instead of relying on the shadcn semantic tokens.
- [x] 6.6 Make the whole toggle row clickable, not just the 32×18px switch: users expect a "settings row" pattern (click anywhere in the row to toggle), and `<label for>` only forwards clicks from the label *text*, not the surrounding padding. Add an `onClick` on the outer row div that calls `setSyncToCalendar` when not disabled, taking care not to double-toggle when the click originates on the `Switch` itself.

## 7. Drag-and-drop polish

- [x] 7.1 Add `activeTask` state to `KanbanBoard.tsx`, set via a new `onDragStart` handler (lookup by `active.id`), cleared in `onDragEnd`
- [x] 7.2 Render `<DragOverlay>` inside the existing `<DndContext>`, showing `<TaskCard dragging />` for `activeTask`
- [x] 7.3 Add a `dragging` prop to `TaskCard.tsx` for overlay-only styling (scale-105, stronger shadow, slight rotate)
- [x] 7.4 Override the sortable item's transition easing to `cubic-bezier(0.16, 1, 0.3, 1)` on `TaskCard`
- [ ] 7.5 Manually verify dragging across columns and within a column feels smooth, with no visual jump when the overlay hands off back to the sorted item on drop

## 8. Verification

- [ ] 8.1 Manually test: create a task, confirm no status field and the sync toggle defaults off
- [ ] 8.2 Manually test: edit a task's status via the modal, confirm the card moves columns
- [ ] 8.3 Manually test: toggle calendar sync on/off on a task while connected, confirm via `al-quotes` that the corresponding sync/delete job fires (depends on `add-per-task-calendar-sync-toggle` being deployed)
- [ ] 8.4 Manually test: open the modal while not connected to calendar, confirm the toggle is disabled with a hint
- [ ] 8.5 Manually test: multi-line description and comments round-trip correctly (line breaks preserved on reload)
- [ ] 8.6 Manually test on a narrow window to confirm the modal stacks to one column below the breakpoint

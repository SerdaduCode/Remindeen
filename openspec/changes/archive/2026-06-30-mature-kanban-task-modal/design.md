## Context

`TaskFormModal.tsx` is currently a single `max-w-[380px]` glass panel with `<Input>` fields for title/description, a `<Select>` for priority, date inputs, and (when editing) a `TaskComments` sub-component that also uses `<Input>` for its composer/editor. Status changes only happen via `KanbanBoard.tsx`'s `handleDragEnd`, which calls `updateTask(id, { status })`. Drag visuals come entirely from `@dnd-kit/sortable`'s `useSortable` (opacity fade in place, default `CSS.Transform` transition) — no `DragOverlay` is used. The paired `al-quotes` change `add-per-task-calendar-sync-toggle` adds a `syncToCalendar` boolean to the Task API; this change consumes it.

## Goals / Non-Goals

**Goals:**
- A modal that scales to handle a task with a long description and a long comment thread without feeling cramped.
- Status and calendar-sync become first-class, editable fields in the modal rather than implicit/absent.
- Drag-and-drop reads as deliberately designed, not default-library output.

**Non-Goals:**
- No change to the comment thread's realtime behavior, API calls, or ordering — only its input control swaps from `<Input>` to `<Textarea>`.
- No status selection at task-creation time (create always defaults to `To Do`, per existing requirement).
- No new animation library — stays within `@dnd-kit` + Tailwind transitions, no Framer Motion introduced for this change.

## Decisions

**Two-pane modal, breakpoint-collapsed, not a tab/accordion.**
Considered tabs ("Details" / "Comments") to keep the modal narrow, but that hides the comment thread by default, which works against the spec's existing behavior of comments loading and being visible whenever the edit modal opens. A side-by-side layout (`grid grid-cols-1 md:grid-cols-[1fr_280px]` or similar) keeps both visible while giving each room to breathe; below `md:` it stacks to one column (comments below fields), preserving today's flow on narrow viewports. The Kanban board only renders inside the newtab page (full browser tab), never the sidepanel, so the wider modal has no narrow-container constraint to worry about.

**`syncToCalendar` toggle disabled (not hidden) when calendar isn't connected.**
`useCalendarConnection()` already exposes `status.connected`. When `false`, render the `Switch` with `disabled` and a one-line hint pointing at the existing calendar settings entry point, rather than omitting the control — so users discover the feature exists even before connecting.

**Status field only on edit, reusing the existing `TaskStatus` union.**
`updateTask`'s signature (`Partial<TaskInput> & { status?: TaskStatus }`) already accepts `status`; the modal just needs to surface a `Select` (mirroring the existing priority `Select`) and include `status` in the submitted values when editing. `TaskFormValues` (currently `= TaskInput`) needs `status?: TaskStatus` added so `handleSubmit` in `KanbanBoard.tsx` can pass it through to `updateTask` unchanged — no new code path, since `updateTask` already merges it.

**`DragOverlay` rendered from `KanbanBoard.tsx`, sourcing the dragged task from `onDragStart`.**
`KanbanBoard` already owns `DndContext`; it gains `activeTask` state set in a new `onDragStart` handler and cleared in `onDragEnd`, and renders `<DragOverlay>{activeTask && <TaskCard task={activeTask} onEdit={() => {}} dragging />}</DragOverlay>`. `TaskCard` gains a `dragging` prop purely for styling (scale-105, stronger shadow, slight rotate) so the overlay copy looks "picked up" while the in-column original (still rendered by `useSortable`) fades via the existing opacity-on-`isDragging` behavior — `DragOverlay` and the sortable item are not the same DOM node, so both need their own visual treatment.

**Transition easing: replace `transition` from `useSortable` as-is, override only the CSS easing function.**
`useSortable` already returns a `transition` string; instead of hand-rolling a new animation system, wrap it with a `cubic-bezier(0.16, 1, 0.3, 1)` timing function via Tailwind's arbitrary `transition-[transform]` + `ease-[cubic-bezier(...)]` utilities on `TaskCard`, keeping `@dnd-kit` as the sole source of transform/position truth.

## Risks / Trade-offs

- **[Risk]** Wider modal (640-720px) could feel oversized on a task with a short title and no comments yet → **Mitigation**: comments pane shows its existing empty state ("no comments yet") rather than collapsing, so the layout stays consistent regardless of content; this matches the skill's guidance to design real empty/loading states rather than only the populated case.
- **[Risk]** Adding `<Textarea>` as a new shadcn-style primitive could drift from the existing `<Input>` visual language (border, focus ring, background) → **Mitigation**: copy `Input`'s Tailwind classes as the base and adjust only for multi-line sizing (`min-h-`, `resize-none` or `resize-y`), keeping the same glass/zinc palette already used throughout the modal.
- **[Risk]** `DragOverlay` requires the dragged item's full render data to be available synchronously at `dragStart` → **Mitigation**: `KanbanBoard` already holds the full `tasks` array in state, so `onDragStart` just looks up `tasks.find(t => t.id === Number(active.id))`, same lookup `handleDragEnd` already does for `activeTask`.

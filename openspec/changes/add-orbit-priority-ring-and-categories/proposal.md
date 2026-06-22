## Why

The orbit canvas currently has only one way to signal importance — a single "focus" task pinned to the center — so users can't distinguish tasks that matter more (but aren't the one active focus) from ordinary tasks. As the number of orbiting tasks grows, there's also no way to group or narrow down what's shown, making a busy canvas harder to scan.

## What Changes

- Add a `isPriority` flag to orbit tasks, toggleable from the edit form (same pattern as the existing focus toggle).
- Introduce a responsive priority-ring boundary (scales with the canvas/container size) that splits the orbit into an inner priority band and an outer normal band.
- Render the boundary as a thin, dim, slowly rotating dust-particle ring (pure CSS animation, no physics ticking).
- New tasks always start in the outer (normal) band; priority status only changes via explicit toggle.
- Unfocusing a task now releases it back into whichever band matches its own `isPriority` flag (inner band if priority, outer band if not), instead of a single fixed release radius.
- Add a `categoryId` field to orbit tasks. Every task always has a category — uncategorized tasks fall back to a built-in, non-deletable default category.
- Add a new `OrbitCategory` entity (id, name, color) with its own persisted storage, seeded with the default category on first run.
- Add category management: inline quick-create from the task edit form, plus a dedicated "Manage Categories" surface for renaming, recoloring, and deleting categories (deleting a category reassigns its tasks to the default category).
- Add a category filter bar (chips: "All" + one per category) above the orbit canvas. The active filter persists across sessions.
- Tasks that don't match the active filter are visually dimmed — shrunk, label hidden, non-interactive (no click/drag) — but keep orbiting and animate the size/label transition. The focus task is exempt from dimming regardless of filter.

## Capabilities

### New Capabilities
- `orbit-task-categories`: category CRUD, task-to-category assignment, the category filter bar, persisted active filter, and the dimmed (filtered-out) visual/interaction state for task nodes.

### Modified Capabilities
- `orbit-todo`: adds the priority flag and priority ring boundary; changes the focus-release requirement to branch by priority instead of always using a single fixed release radius; adds the priority ring's visual rendering to the orbit view.

## Impact

- `hooks/use-orbit-tasks.ts`: extend `OrbitTask` with `isPriority` and `categoryId`; branch focus-release logic; add a new hook (or extend this one) for category CRUD and active-filter persistence.
- `components/remindeen/orbit/orbit-layout.ts` / `orbit-physics.ts`: add a responsive ring-radius calculation and inner/outer band bounds for `findOrbitSlot` calls.
- `components/remindeen/orbit/OrbitView.tsx`: render the priority ring, the category filter bar, and wire the manage-categories entry point.
- `components/remindeen/orbit/OrbitNode.tsx`: add the dimmed visual/interaction state and its transition animation.
- `components/remindeen/orbit/TaskFormModal.tsx`: add the priority toggle and category picker (with inline quick-create).
- New component(s) for the "Manage Categories" surface and the filter chip bar.
- New persisted storage keys: orbit categories list and active category filter (alongside the existing `local:orbitTasks`).
- Existing persisted tasks lack `isPriority`/`categoryId` — both need a safe default when read (priority `false`, category = default category id).

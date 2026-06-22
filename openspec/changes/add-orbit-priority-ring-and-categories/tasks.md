## 1. Data model foundations

- [x] 1.1 Extend `OrbitTask` (`hooks/use-orbit-tasks.ts`) with `isPriority: boolean` and `categoryId: string`; normalize legacy persisted entries (missing fields) when read from storage
- [x] 1.2 Add `OrbitCategory` type and a `local:orbitCategories` storage item, seeded with one default category (`id: 'default'`) when empty
- [x] 1.3 Add a `local:orbitActiveCategoryFilter` storage item (`string`, fallback `'all'`)

## 2. Canvas metrics & ring radius plumbing

- [x] 2.1 Add a shared canvas-metrics helper that computes `{ maxRadius, ringRadius }` from a container rect, reusing the clamp logic already in `OrbitNode.resolveRaw` (`components/remindeen/orbit/OrbitNode.tsx:105-117`)
- [x] 2.2 Wire the metrics helper into `OrbitView` via a `ResizeObserver` on `containerRef`, recomputing on mount and resize
- [x] 2.3 Thread the computed metrics as an explicit parameter into hook actions that need a radius decision (`createTask`, `setFocus`, new `setPriority`)

## 3. Priority toggle & banded placement

- [x] 3.1 Add `setPriority(id, isPriority, metrics)` to `use-orbit-tasks.ts`, using `findOrbitSlot` with `maxRadius: ringRadius` (turning priority on) or `minRadius: ringRadius` (turning priority off)
- [x] 3.2 Update `createTask` to always pass `minRadius: ringRadius` so new tasks start in the outer band
- [x] 3.3 Update `setFocus`'s release branch to bound the released task's slot by `ringRadius`, using the released task's own `isPriority` to pick `maxRadius` vs `minRadius` instead of the current single fixed release radius
- [x] 3.4 Add a priority toggle checkbox to `TaskFormModal` mirroring the existing focus checkbox pattern (`TaskFormModal.tsx:132-145`)
- [x] 3.5 Wire `OrbitView`'s current canvas metrics through to the priority toggle handler

## 4. Priority ring visual

- [x] 4.1 Build a dust-ring decorative component: single absolutely-positioned div sized to `2 * ringRadius`, using a `repeating-conic-gradient` of small dim/neutral stops masked into a thin annulus (same masking technique as `OrbitNode.tsx:271-285`)
- [x] 4.2 Add a CSS `@keyframes` rotation for the ring, skipped/paused when `isReducedMotion()` is true
- [x] 4.3 Mount the ring in `OrbitView`, centered on the canvas, resizing with the computed `ringRadius`

## 5. Category CRUD

- [x] 5.1 Add category list/create/rename/recolor/delete actions (new hook or extension of `use-orbit-tasks.ts`), persisted to `local:orbitCategories`
- [x] 5.2 Implement delete behavior: reassign affected tasks' `categoryId` to `'default'`; guard against deleting the default category itself
- [x] 5.3 Add an inline quick-create control in `TaskFormModal` (name input + color swatches, reusing the `COLOR_PRESETS` pattern) that creates a category and immediately assigns it to the task being edited
- [x] 5.4 Add a category select control in `TaskFormModal` for choosing among existing categories

## 6. Manage Categories surface

- [x] 6.1 Build a `ManageCategoriesModal` component: list all categories, inline rename, color change, delete with confirmation (reusing the `window.confirm` pattern from task delete), default category's delete control disabled
- [x] 6.2 Add an entry point (icon button) near the filter bar in `OrbitView` to open the management modal

## 7. Filter bar & dimming

- [x] 7.1 Add active-filter state to `OrbitView`, backed by `local:orbitActiveCategoryFilter`
- [x] 7.2 Render a filter chip row ("All" + one chip per category) above the canvas, wrapping/scrolling horizontally on overflow
- [x] 7.3 Compute `isDimmed` per task in `OrbitView` (`!task.isFocus && activeFilter !== 'all' && task.categoryId !== activeFilter`) and pass it to `OrbitNode`
- [x] 7.4 Implement the dimmed visual/interaction state in `OrbitNode`: reduced size, label hidden, `pointer-events: none`, animated size/opacity transition — node keeps its orbit-clock subscription and keeps rotating
- [x] 7.5 Reset the active filter to `'all'` when the category it points to is deleted

## 8. Verification

- [ ] 8.1 Manually verify the ring boundary rescales correctly on window resize and is static under reduced-motion
- [ ] 8.2 Manually verify priority toggle placement and focus-release banding for both priority and non-priority tasks
- [ ] 8.3 Manually verify category create/rename/recolor/delete (including default protection and task reassignment) and that the active filter persists across a reload
- [x] 8.4 Run lint/typecheck on all touched files

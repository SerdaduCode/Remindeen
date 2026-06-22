## 1. Orbit task storage layer

- [x] 1.1 Define `OrbitTask` type and `storage.defineItem<OrbitTask[]>('local:orbitTasks', { fallback: [] })` (new file, e.g. `stores/orbit-tasks.ts`), following the existing pattern in `stores/settings.ts`
- [x] 1.2 Implement a `useOrbitTasks` hook exposing `tasks`, `createTask`, `updateTask`, `deleteTask`, `completeTask`, `setFocus`, `repositionTask`, mirroring the load/watch/update pattern in `hooks/use-settings.ts`
- [x] 1.3 Implement `setFocus` as a single atomic array write that unsets the previous focus task (assigning it a default radius) and sets the new one to `radius: 0, isFocus: true`

## 2. Page navigation shell

- [x] 2.1 Build a generic `Pager` component (e.g. `components/remindeen/pager/Pager.tsx`) taking two children, an `activeIndex` state, and rendering them side by side with `translateX` slide transition
- [x] 2.2 Add dot indicators and prev/next arrow controls to `Pager`, wired to update `activeIndex`
- [x] 2.3 Add `ArrowLeft`/`ArrowRight` keydown handling on the pager container, ignoring keypresses when an input/textarea/contenteditable has focus
- [x] 2.4 Extract current `entrypoints/newtab/App.tsx` body (header + main content) into a `HomePage` component, unchanged in behavior, to become Page 1
- [x] 2.5 Wire `entrypoints/newtab/App.tsx` to render `<Pager>` with `HomePage` as Page 1 and the new orbit view (task 3.x) as Page 2

## 3. Orbit rendering engine

- [x] 3.1 Build `OrbitView` container component establishing the orbit center point and rendering the focus node + orbiting task nodes
- [x] 3.2 Implement the `requestAnimationFrame` loop computing live angle per task as `angle + angularVelocity(radius) * (now - angleSetAt)`, converting to `{x, y}` via polar-to-cartesian
- [x] 3.3 Implement `angularVelocity(radius) = BASE_OMEGA / Math.max(radius, MIN_RADIUS)` with tuned constants
- [x] 3.4 Pause the rAF loop on `document.visibilitychange` (hidden) and resume on visible
- [x] 3.5 Check `window.matchMedia('(prefers-reduced-motion: reduce)')` on mount; if true, compute each task's position once and skip per-frame updates
- [x] 3.6 Render the focus task as a fixed center node (larger size, glow styling) excluded from the rotation loop
- [x] 3.7 Add the starfield background using CSS gradients/box-shadow dots (no canvas/particles dependency)

## 4. Task CRUD UI

- [x] 4.1 Build a create/edit task form/modal with title (required), note (optional), and a free color picker, used for both create and edit flows
- [x] 4.2 Add a "+" affordance on Page 2 to open the create form, persisting via `createTask`
- [x] 4.3 Add an edit affordance on each task node (e.g. on click, distinguished from drag per 5.2) opening the form pre-filled, persisting via `updateTask`
- [x] 4.4 Add a delete action (with confirmation) calling `deleteTask`
- [x] 4.5 Add a "set as focus" / "unset focus" action calling `setFocus`
- [x] 4.6 Add a stats line showing active task count and current focus task title (or "no task in focus")

## 5. Drag-to-reposition and click/drag disambiguation

- [x] 5.1 Implement pointer-based dragging on orbiting nodes (`onPointerDown` + pointer capture so subsequent `pointermove`/`pointerup` resolve on the same element) computing radius/angle relative to orbit center on drop, writing via `repositionTask`
- [x] 5.2 Apply a small movement threshold (~4px) to distinguish a click (open edit / toggle focus) from a drag (reposition only), including handling `pointercancel`

## 6. Task completion animation

- [x] 6.1 Add a local "completing" UI state per task triggered by the complete action, playing a ~420ms release-from-orbit CSS keyframe (scale + fade + outward translate)
- [x] 6.2 On `onAnimationEnd` (with a fallback `setTimeout` matching the animation duration in case of unmount), call `completeTask` to remove the task from storage

## 7. Visual/interaction polish

- [x] 7.1 Apply the `design-taste-frontend` skill to review and refine Page 2's visual design (orbit canvas, nodes, stats line, CRUD form, pager chrome)
- [x] 7.2 Verify Page 1 renders pixel-identical to current behavior inside the new `Pager`/`HomePage` wrapper

## 8. Verification

- [x] 8.1 Manually verify each scenario in `specs/newtab-page-navigation/spec.md` and `specs/orbit-todo/spec.md` (dot/arrow/keyboard nav, create/edit/delete, focus swap, drag reposition, rotation speed-by-radius, reduced-motion, visibility pause, stats line, persistence/cross-context sync)
- [x] 8.2 Run `pnpm compile` (TypeScript check) and load the built extension in a real Chrome instance to manually exercise the feature

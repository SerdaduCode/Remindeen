## Context

The orbit canvas (`components/remindeen/orbit/*`, `hooks/use-orbit-tasks.ts`) currently has two orbit states for a task: focus (radius 0, pinned, single) and orbiting (any other radius/angle, collision-avoided via discrete radius "lanes" in `orbit-layout.ts`). Radius constants today (`MIN_RADIUS=70`, `DEFAULT_FOCUS_RELEASE_RADIUS=140`, `DEFAULT_TASK_RADIUS=180`, `MAX_RADIUS_FALLBACK=320`) are fixed pixel values; the *effective* usable radius at runtime is already container-dependent for drag (computed live in `OrbitNode.resolveRaw`), but not for non-drag operations like `createTask`/`setFocus`, which run inside `use-orbit-tasks.ts` — a hook with no DOM access.

This change adds two largely independent layers on top of that:
1. A priority ring boundary that splits the orbiting band into an inner (priority) and outer (normal) region.
2. A category system (CRUD + filter) that dims out-of-filter nodes without removing them from the orbit.

## Goals / Non-Goals

**Goals:**
- Priority ring radius scales with the actual canvas size, consistently across drag, create, focus-release, and priority-toggle operations.
- `isPriority` is an explicit, persisted flag (mirrors the existing `isFocus` pattern), independent of `isFocus`, surviving focus/unfocus cycles.
- Every task always resolves to a valid category (no null/undefined category state to special-case).
- Filtering is a pure presentation concern — it never touches stored radius/angle/lane data.

**Non-Goals:**
- Multi-category-per-task (one category per task only).
- Cross-extension-context realtime sync for categories/filter beyond what `storage.defineItem` already gives for tasks (same mechanism, so it comes for free, but isn't a new design goal).
- Precise/contractual visual tuning values (ring ratio, dimmed node size) — those are implementation-time visual decisions, not spec-level behavior.

## Decisions

### 1. Container-derived radius metrics are computed once per render pass and threaded into the hook, not computed inside it

`use-orbit-tasks.ts` stays DOM-agnostic. `OrbitView` (which owns `containerRef`) computes a small `CanvasMetrics` object — `{ maxRadius, ringRadius }` — from the container's current bounding rect (same `EDGE_PADDING`/min-radius clamping already used in `OrbitNode.resolveRaw`), recomputed on mount and on resize (`ResizeObserver`). This metrics object is passed as an explicit argument into the hook actions that need a radius decision: `createTask(values, metrics)`, `setFocus(id, metrics)`, `setPriority(id, isPriority, metrics)`. Drag-driven repositioning (`OrbitNode`) already computes its own live `maxRadius`; it gains the same `ringRadius` calculation so drag-drop and knockback can clamp to the correct band too.

**Alternative considered:** compute `ringRadius` as a fixed pixel constant (like the other radius constants). Rejected because the user explicitly wants the ring to track canvas size, and a fixed ring would drift out of sync with the already-responsive drag clamp on different screen sizes.

**Alternative considered:** give the hook a `containerRef` directly. Rejected — would couple a pure data/storage hook to the DOM and break its testability/clarity; passing a plain metrics value at the call site is cheaper and keeps the existing hook shape mostly intact.

### 2. `ringRadius` is a ratio of the live `maxRadius`, not an absolute value

`ringRadius = maxRadius * RING_RADIUS_RATIO` (ratio is a tunable constant, expected around the midpoint of the orbit band — exact value is a visual-tuning decision made during implementation, not fixed by this design). This guarantees `ringRadius` always sits strictly between `MIN_DRAG_RADIUS` and the current `maxRadius`, so there's always room for both bands regardless of viewport size.

### 3. `isPriority` is an explicit boolean field, decoupled from position

Same rationale as the existing `isFocus` flag: position can be momentarily out of sync with intent (see Risks), so the flag — not the current radius — is the source of truth for "is this a priority task." All band-assigning operations (`createTask`, `setPriority`, focus-release) pass `minRadius`/`maxRadius` options into the existing `findOrbitSlot` to constrain the result to the correct side of `ringRadius`:
- `createTask`: always `minRadius: ringRadius` (new tasks start in the outer band).
- `setPriority(id, true, metrics)`: `maxRadius: ringRadius` (moves into inner band).
- `setPriority(id, false, metrics)`: `minRadius: ringRadius` (moves into outer band).
- Focus release (in `setFocus`): branches on the *released* task's own `isPriority` — `maxRadius: ringRadius` if priority, `minRadius: ringRadius` otherwise — replacing today's single fixed `DEFAULT_FOCUS_RELEASE_RADIUS`.

Toggling priority while a task is currently focused only flips the flag; no slot computation happens until that task is later unfocused (render only branches on `isFocus` for position while focused).

### 4. The ring itself is a stateless decorative element, animated in pure CSS

The ring has no persisted position and isn't draggable, so unlike task nodes it doesn't need `subscribeOrbitClock`/live-angle math. It's rendered as a single absolutely-positioned div sized to `2 * ringRadius`, using the same `radial-gradient` annulus-mask technique already used for `OrbitNode`'s hover ring (`OrbitNode.tsx:271-285`), but with a `repeating-conic-gradient` of small dim/neutral stops to read as scattered dust rather than a smooth arc, rotated via a CSS `@keyframes` transform — independent of the orbit physics clock. It respects the existing `isReducedMotion()` check (`orbit-clock.ts`) the same way other orbit motion does: the rotation keyframe is skipped/paused when reduced motion is preferred.

### 5. Categories are a separate persisted entity with a protected default

`OrbitCategory = { id, name, color }`, stored at `local:orbitCategories` (new `storage.defineItem`, same pattern as `local:orbitTasks`), seeded on first read with one default category (e.g. `{ id: 'default', name: 'Umum', color: '#9ca3af' }`) if the stored list is empty. `categoryId` on `OrbitTask` is always populated — new tasks default to `'default'` unless the user picks another category at creation. The default category's delete control is disabled in the management UI; deleting any other category reassigns its tasks' `categoryId` back to `'default'`.

### 6. Active filter is its own persisted primitive, and supports multi-select

`local:orbitActiveCategoryFilters: string[]`, fallback `[]`. An empty array means "no filter" (every category shown); a non-empty array is the set of categoryIds currently selected, and a task matches the filter if its `categoryId` is included in that set — so multiple categories can be active as a filter simultaneously. The "All" chip clears the selection back to `[]` rather than selecting a sentinel value. If a category currently included in the active filter is deleted, only that id is removed from the selection (the rest of the selection, if any, is preserved).

### 7. Dimming is computed at render time, never persisted, never touches orbit physics

`OrbitView` derives `isDimmed = !task.isFocus && activeFilter !== 'all' && task.categoryId !== activeFilter` per task and passes it to `OrbitNode` as a prop. `OrbitNode` does not change its radius/angle/orbit-clock subscription when dimmed — it keeps rotating exactly as before. Only its rendered size shrinks, its label is hidden, and `pointer-events: none` is applied (which naturally suppresses click/drag without touching the pointer handlers), with a CSS transition on the size/opacity change. The focus task is always excluded from dimming regardless of filter.

### 8. Legacy data is normalized at read time, not migrated destructively

Tasks persisted before this change lack `isPriority`/`categoryId`. The `getValue().then(...)` handler in `useOrbitTasks` maps loaded tasks through a default-filling step (`isPriority: task.isPriority ?? false`, `categoryId: task.categoryId ?? 'default'`) before they enter state. No destructive rewrite of storage is required; the next `persist()` call (any edit) naturally writes the normalized shape back.

## Risks / Trade-offs

- **[Risk]** Ring radius is recomputed from live container size, but a task's stored radius is an absolute value set whenever it was last positioned. After a window resize, a priority task could render visually outside the (now-relocated) ring line, or vice versa. → **Mitigation:** `isPriority` (not position) remains the source of truth, so this is a cosmetic mismatch, not a logical one; it self-corrects the next time that task is dragged, toggled, or cycled through focus. Acceptable for an ambient personal widget; not solved further in this change.
- **[Risk]** Many categories could overflow the filter chip row on narrow viewports. → **Mitigation:** chip row wraps/scrolls horizontally via CSS only; no pagination needed for this iteration.
- **[Risk]** The dust-ring relies on `mask-image`/`-webkit-mask-image`, same as the existing hover-ring effect — not a new browser-support risk since the codebase already depends on it.
- **[Trade-off]** Dimmed nodes stay mounted and keep subscribing to the orbit clock even when not interactive, so filtering doesn't reduce render/animation work. Acceptable since the existing node count per canvas is small (personal todo list scale), and it keeps the implementation simple (no mount/unmount churn or position loss on re-filter).

## Migration Plan

This is a local-only browser extension feature with no server or multi-user rollout — "migration" means safe coexistence with already-persisted data:
1. Extend `OrbitTask` type; normalize legacy entries (missing `isPriority`/`categoryId`) when read from storage, as described in Decision 8.
2. Seed `local:orbitCategories` with the default category on first read if empty.
3. Ship additively — no existing requirement is removed, only extended (see specs delta), so rollback is a plain revert of the change/build with no data cleanup needed (old fields are simply ignored by the previous code version).

## Open Questions

- Exact `RING_RADIUS_RATIO` and dimmed-node size/opacity constants are left to implementation-time visual tuning against the real canvas — not blocking for this design.

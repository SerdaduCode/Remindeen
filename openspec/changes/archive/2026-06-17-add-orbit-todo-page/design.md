## Context

The newtab entrypoint (`entrypoints/newtab/App.tsx`) currently renders one flat layout: a header (Prayers + Time) and a main section (Verse + SearchBar), no concept of "pages" exists. State persistence in this codebase follows one consistent pattern: WXT's `storage.defineItem('local:<key>', { fallback })`, read once on mount, written on every update, and kept in sync across contexts (newtab/sidepanel) via `.watch()` — see `stores/settings.ts` and `hooks/use-settings.ts`. There are no animation/canvas dependencies in `package.json` (no framer-motion/motion, no particles.js, no canvas libs) and no existing drag-and-drop code to reuse.

This design covers two new capabilities from the proposal: `newtab-page-navigation` (generic two-page pager) and `orbit-todo` (data model + orbit visualization + CRUD).

## Goals / Non-Goals

**Goals:**
- Wrap the existing Page 1 content in a paged container without changing its behavior or markup semantics.
- Render orbit tasks as real DOM nodes (clickable, editable, accessible) — not a canvas/particle effect.
- Keep the orbit motion (continuous rotation, Kepler-style speed-by-radius) cheap enough to run indefinitely on an idle newtab without noticeable CPU/battery impact.
- Ship with zero new runtime dependencies if at all possible.

**Non-Goals:**
- No touch/trackpad swipe gesture or mouse click-drag for *page* navigation (dot/arrow/keyboard only, per product decision).
- No automatic collision avoidance between orbit nodes (user manages spacing manually via drag).
- No ambient audio/sound design.
- No due-date or priority-driven auto-placement — radius/angle are purely a result of manual drag.
- No archive/history view for completed tasks (they are deleted after the completion animation).

## Decisions

### 1. Page container: controlled-index slider, no gesture library
A `Pager` component holds an `activeIndex: 0 | 1` in local state, renders both pages side-by-side inside a flex row sized `200%` wide, and translates by `translateX(-activeIndex * 50%)` with a CSS transition. Navigation is exclusively via dot buttons, prev/next arrow buttons, and `ArrowLeft`/`ArrowRight` keydown — no pointer/touch drag handling, which avoids the complexity (and conflict risk with in-page clicks/drag) of building a real swipe gesture for just two pages. The page always opens on Page 1 (index 0); the active page is not persisted, mirroring "page 1 is the current default experience."

**Alternative considered**: persist last-viewed page in storage (consistent with `uiSettings`). Rejected for v1 — adds a storage round-trip and a flash-of-wrong-page on load for a marginal benefit; can be added later as a non-breaking enhancement.

### 2. Orbit positioning: polar coordinates computed live, not stored per-frame
Each task stores `radius`, `angle` (radians, the position at the moment it was last placed), and `angleSetAt` (timestamp). At render time, a `requestAnimationFrame` loop computes the *live* angle as `angle + angularVelocity(radius) * (now - angleSetAt)` for every non-focus task, converts to `{x, y}` via `Math.cos/sin`, and applies `transform: translate(x, y)` on each node. Nothing is written to storage on every frame — storage is only touched on create/edit/delete/drag-drop/focus-change. This keeps the WXT storage layer (which round-trips through `browser.storage`) out of the animation hot path entirely.

### 3. Angular velocity model (Kepler-style)
`angularVelocity(radius) = BASE_OMEGA / Math.max(radius, MIN_RADIUS)`, with `BASE_OMEGA` and `MIN_RADIUS` tuned constants. This guarantees closer-to-focus tasks visibly orbit faster, and the `MIN_RADIUS` floor prevents runaway speed as radius approaches the center. The focus task itself is excluded (radius pinned to 0, no rotation, rendered as the static center node).

### 4. Drag-to-reposition via Pointer Events
Each orbit node attaches `onPointerDown` → tracks movement with `onPointerMove`/`onPointerUp` (via a single document-level listener pair while dragging, standard pattern, no library). On drop, the pointer's position relative to the orbit center is converted to `(radius, angle)` and written to storage for that task; `angleSetAt` resets to `now` so the live-angle formula continues smoothly from the drop point. A small movement threshold (e.g. 4px) distinguishes a "click" (open edit / toggle focus) from a "drag" (reposition), so clicking a node still works.

### 5. Focus switching
Only one task may have `isFocus: true`. Setting a new focus is a single storage write that: (a) sets the previously-focused task's `radius` to a default inner-ring value and `angleSetAt = now` (so it visibly drifts back out into orbit), and (b) sets the newly-focused task's `isFocus = true`, `radius = 0`. This is implemented as one atomic update to the stored array, not two separate writes, to avoid a flicker frame with zero or two focused tasks.

### 6. Completion animation then delete
Marking a task complete triggers a local "completing" UI state (not persisted) that plays a ~400ms CSS keyframe (scale up + fade + slight outward translate along its current angle), then on `onAnimationEnd` the task is removed from the storage array. If the component unmounts mid-animation (e.g. user flips pages), the removal still happens via a fallback `setTimeout` matching the animation duration.

### 7. Reduced motion & visibility
The rAF loop checks `window.matchMedia('(prefers-reduced-motion: reduce)')` once on mount; if true, angles are computed once and never updated (fully static layout, drag still works). Independently, the loop pauses via the `visibilitychange` event when the newtab document is hidden, resuming on return — avoids burning CPU on a backgrounded tab.

### 8. Storage shape
New WXT storage item `local:orbitTasks: OrbitTask[]`, default `[]`, following the exact `storage.defineItem` + `.watch()` pattern already used for settings — no new persistence abstraction introduced.

```ts
interface OrbitTask {
  id: string
  title: string
  note?: string
  color: string        // free-pick hex, e.g. "#7c5cff"
  radius: number        // px, 0 = focus/center
  angle: number          // radians, position at angleSetAt
  angleSetAt: number      // epoch ms
  isFocus: boolean
  createdAt: number
}
```

### 9. No new dependencies
All of the above (paging, polar transform, drag, animation) is achievable with React state + CSS transitions/keyframes + Pointer Events + one `requestAnimationFrame` loop. No `motion`/`framer-motion`, no canvas, no particles.js. This keeps bundle size and review surface minimal; revisit only if manual drag physics feel unacceptably stiff after building it.

## Risks / Trade-offs

- **[Risk]** Two or more tasks can end up overlapping (same radius/angle) since there's no collision avoidance → **Mitigation**: acceptable for v1 (explicit non-goal); nodes remain individually clickable via z-index/hit-testing on whichever renders on top, and the user can simply drag one away.
- **[Risk]** A continuous rAF loop is a long-lived timer on a page users may keep open for hours → **Mitigation**: pause on `visibilitychange` and under `prefers-reduced-motion`; the math per frame is O(n) trig, trivial for realistic todo-list sizes (tens of items).
- **[Risk]** Distinguishing click vs. drag with a pixel threshold can mis-fire on trackpads with jittery input → **Mitigation**: use a deliberately small but non-zero threshold (4px) and rely on `pointercancel`/`pointerup` outside the node to still resolve as a drag, not a stray click.
- **[Risk]** Building a bespoke pager/drag/animation stack instead of a battle-tested library risks edge-case bugs (e.g. pointer capture loss) → **Mitigation**: scope is small (one pager, one canvas) and uses standard Pointer Events; acceptable given the goal of zero new dependencies.

## Migration Plan

No data migration: this introduces a brand-new storage key (`local:orbitTasks`) and restructures the newtab component tree without touching existing storage keys (`appearanceSettings`, `systemSettings`, `uiSettings`) or their schemas. Rollback is a plain revert of the changed files; no stored data needs to be cleaned up since old keys are untouched and the new key only matters if the feature shipped.

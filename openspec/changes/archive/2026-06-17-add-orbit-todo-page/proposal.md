## Why

The newtab page currently shows only prayer times, verse, and search. There is no place to capture personal tasks, so users leave the extension to track todos elsewhere. We want to give the newtab a second page — a visually distinct, low-friction todo view themed around orbiting planets — without disrupting the existing prayer/verse experience on the first page.

## What Changes

- Restructure the newtab into two horizontally paged screens: Page 1 keeps the existing Prayers/Time header, Verse, and SearchBar exactly as they render today. Page 2 is new: an "orbit" todo view.
- Add page navigation: dot indicators + prev/next arrows + left/right keyboard arrows to move between the two pages, with a sliding transition. No drag/swipe gesture in this iteration.
- Add the orbit todo view:
  - One task may be marked "in focus" and renders as a glowing node at the center (radius 0).
  - All other tasks render as nodes orbiting the center; each task's orbit radius and starting angle are set by the user dragging it to a position.
  - Orbiting nodes continuously rotate; angular speed is inverse to radius (closer = faster), computed live from a stored timestamp rather than re-persisted every frame.
  - A simple stats line shows total active task count and the name of the in-focus task.
  - Completing a task plays a short "release from orbit" animation, then removes it from storage.
- Add full CRUD for orbit tasks: create, edit (title, optional note, free-pick color), delete, mark complete, set/unset as focus, and reposition via drag (which updates radius/angle).
- Apply the `design-taste-frontend` skill's visual/interaction standards when building Page 2 and the page-navigation chrome.

## Capabilities

### New Capabilities
- `newtab-page-navigation`: Two-page paged container for the newtab entrypoint with dot/arrow/keyboard navigation and slide transition; hosts the existing home content and the new orbit todo view as its two pages.
- `orbit-todo`: Data model, CRUD operations, and the orbit visualization (focus node, orbiting nodes, drag-to-reposition, continuous rotation, completion animation) for personal tasks on the newtab page.

### Modified Capabilities
(none — existing prayer/verse/search behavior on Page 1 is unchanged, only relocated into the new paged container)

## Impact

- `entrypoints/newtab/App.tsx`: restructured to render a paged container instead of a single flat layout; existing content moves into a "Page 1" component unchanged.
- New components under `components/remindeen/orbit/` (or similar) for the orbit canvas, task nodes, CRUD form/modal, and page navigation chrome.
- New storage item (e.g. `local:orbitTasks`) following the existing WXT `storage.defineItem` pattern used in `stores/settings.ts` / `hooks/use-settings.ts`.
- No new runtime dependencies expected (CSS transforms/SVG for orbit positioning); to be confirmed in design.md.

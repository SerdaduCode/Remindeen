## Why

The Productivity page (Page 2) currently renders on a flat `bg-zinc-950` with no background image, switches between Kanban and Habit via a tab control, and shows plain loading text ("kanban.loading" / "habit.loading") with no skeleton. This doesn't match the rest of the extension's established glass aesthetic (`SearchBar.tsx`'s `backdrop-blur` + translucent-pill language) or the floating-widget reference the user wants (separate glass panels over a shared wallpaper, no tab-switching, content visible immediately as shimmer while it loads).

## What Changes

- Remove the `Tabs`/`TabsList`/`TabsTrigger` switch in `ProductivityPage.tsx`. Kanban and Habit render simultaneously, side by side, as two independent glass panels (Habit narrow/compact, Kanban wide with its 3 status columns) instead of one-at-a-time tab content.
- Lift the home wallpaper (`fetchPicture()` result) out of `HomePage.tsx`'s local state into a shared source (e.g. a small hook or state lifted to `entrypoints/newtab/App.tsx`) so the exact same photo renders behind both Page 1 (Home) and Page 2 (Productivity) — one fetch, one image, two pages.
- Apply the existing glass visual language (translucent `bg-white/10`–`/20`, `backdrop-blur-xl`, `ring-1 ring-white/15`, tinted soft shadow — the recipe already used by `SearchBar.tsx`) to the Productivity page's outer panels, the sign-in prompt, and the Task/Habit form modals. Inner elements (Kanban's 3 status columns, individual task/habit rows) are flattened relative to today — columns separated by thin dividers instead of their own nested card chrome, so elevation isn't stacked glass-on-glass.
- Add skeleton loading states for both the Kanban board and the Habit list, replacing the current plain-text loading messages. Skeletons mirror the real layout shape (3 column outlines with card-shaped shimmer blocks for Kanban; stacked pill-shaped shimmer rows for Habit) using a moving shimmer sweep, not a generic spinner or flat pulse.
- **BREAKING**: Page 2's "Productivity view" no longer has a tab control — any future addition to Page 2 must fit the simultaneous side-by-side layout rather than adding a third tab.

## Capabilities

### New Capabilities
- `productivity-page-layout`: The page-level container behavior for Page 2 — Kanban and Habit displayed simultaneously as side-by-side glass panels (no tab switching), the shared background image inherited from Page 1, and skeleton loading states shown while Kanban/Habit data is being fetched.

### Modified Capabilities
- `newtab-page-navigation`: The "Two-page paged container" requirement and its "Page 2 shows the Productivity view" scenario currently describe Page 2 as "containing Kanban and Habit tabs". This changes to describe Page 2 as containing the Kanban and Habit panels shown side by side, with no tab control.

## Impact

- **Modified components**: `ProductivityPage.tsx` (remove Tabs, add side-by-side panel layout, glass container, skeleton orchestration), `KanbanBoard.tsx`/`KanbanColumn.tsx`/`TaskCard.tsx` (flatten column chrome, add skeleton), `HabitTracker.tsx` (add skeleton, adjust to narrow-panel width), `SignInPrompt.tsx`, `TaskFormModal.tsx`, `HabitFormModal.tsx` (glass styling pass), `HomePage.tsx` (background image source lifted out), `entrypoints/newtab/App.tsx` (owns/passes shared background image).
- **New file(s)**: a shared background-image hook (replacing `HomePage.tsx`'s local `fetchPicture` `useState`/`useEffect`), new skeleton components for Kanban and Habit (replacing reliance on the unrelated, light-themed `components/remindeen/home/Skeleton.tsx` for this page).
- **Removed usage**: `Tabs`/`TabsList`/`TabsTrigger` imports from `ProductivityPage.tsx` (the `components/ui/tabs.tsx` primitive itself stays — still used by `entrypoints/sidepanel/App.tsx`).
- **No backend/API changes**: purely a newtab-side layout and visual change; `use-tasks.ts`/`use-habits.ts`/`use-auth.ts` data-fetching contracts are unaffected.
- **No data migration**: visual/layout change only.

## 1. Shared background image

- [x] 1.1 Extract the `fetchPicture()` + `useState`/`useEffect` logic out of `entrypoints/newtab/HomePage.tsx` into a new hook (e.g. `hooks/use-background-image.ts`) that returns the resolved `backgroundUrl`.
- [x] 1.2 Call the new hook once in `entrypoints/newtab/App.tsx`, passing `backgroundUrl` down as a prop to both `HomePage` and `ProductivityPage`.
- [x] 1.3 Update `HomePage.tsx` to accept `backgroundUrl` as a prop instead of fetching it locally; keep its existing radial-gradient-over-image rendering unchanged.
- [x] 1.4 Confirm `fetchPicture()`'s null/failure case still degrades gracefully (no background image) on both pages.

## 2. Productivity page layout (remove tabs, side-by-side panels)

- [x] 2.1 Remove the `Tabs`/`TabsList`/`TabsTrigger` usage from `components/remindeen/productivity/ProductivityPage.tsx`.
- [x] 2.2 Render `HabitTracker` and `KanbanBoard` simultaneously in a side-by-side layout (Habit narrow column, Kanban wide column), using CSS Grid (not flex percentage math) for the two-column split.
- [x] 2.3 Add a `md`-breakpoint fallback that stacks the two panels vertically on narrow viewports.
- [x] 2.4 Render `backgroundUrl` (received as a prop) as the page's background image, with a dark gradient overlay layer so panel content stays legible over any photo.
- [x] 2.5 Wrap the Habit and Kanban sections each in the shared glass panel container (translucent fill, `backdrop-blur-xl`, `ring-1 ring-white/15`, rounded corners, tinted shadow, inner top-highlight).

## 3. Flatten Kanban's inner chrome

- [x] 3.1 Update `components/remindeen/kanban/KanbanColumn.tsx` to remove its own rounded card background/border; replace with a flat section separated by a `border-l border-white/10` divider (no border on the first column).
- [x] 3.2 Verify the column header label + count badge remains the primary visual boundary between To Do/Doing/Done now that the bordered box is gone.
- [x] 3.3 Adjust `components/remindeen/kanban/TaskCard.tsx`'s resting/hover background so it still reads as a liftable, draggable unit against the now-flat column background (e.g. `bg-white/[0.06]` resting, `bg-white/[0.12]` hover).
- [x] 3.4 Re-verify drag-over affordance on `@dnd-kit` drop targets is still visible against the flattened column (add a highlight state on the column/divider during drag-over if the boundary becomes unclear).

## 4. Skeleton loading states

- [x] 4.1 Create a Kanban skeleton component (3 flat column outlines, each with 2–3 card-shaped shimmer blocks) using a moving shimmer-sweep animation.
- [x] 4.2 Create a Habit skeleton component (4–5 pill-shaped shimmer rows) using the same shimmer-sweep animation/visual language.
- [x] 4.3 Wire the Kanban skeleton into `KanbanBoard.tsx`'s `loading` branch (from `useTasks`), replacing the current plain-text loading message.
- [x] 4.4 Wire the Habit skeleton into `HabitTracker.tsx`'s `loading` branch (from `useHabits`), replacing the current plain-text loading message.

## 5. Glass pass on sign-in prompt and modals

- [x] 5.1 Restyle `components/remindeen/productivity/SignInPrompt.tsx` to use the same glass panel treatment as the Kanban/Habit panels.
- [x] 5.2 Restyle the modal content card (not just the overlay scrim) in `components/remindeen/kanban/TaskFormModal.tsx` to match the glass recipe.
- [x] 5.3 Restyle the modal content card in `components/remindeen/habit/HabitFormModal.tsx` to match the glass recipe.

## 6. Spec sync and verification

- [ ] 6.1 Manually verify in the browser: Page 2 shows Kanban + Habit simultaneously with no tab control, on both wide and narrow viewport widths.
- [ ] 6.2 Manually verify the same background photo renders behind Page 1 and Page 2 within one newtab session.
- [ ] 6.3 Manually verify skeleton placeholders appear on first load (e.g. via throttled network) and are replaced by real content/empty states once data resolves.
- [ ] 6.4 Run through create/edit/delete/drag flows for both Kanban tasks and Habit check-ins to confirm no regressions from the styling/layout changes.

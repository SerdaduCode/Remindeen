## Context

`ProductivityPage.tsx` is Page 2 of the newtab `Pager` (`components/remindeen/pager/Pager.tsx`). It currently renders on a flat `bg-zinc-950`, switches between `KanbanBoard` and `HabitTracker` via `@radix-ui/react-tabs` (`Tabs`/`TabsList`/`TabsTrigger`), and shows plain text (`kanban.loading` / `habit.loading`) while `useTasks`/`useHabits` resolve their initial fetch.

`KanbanColumn.tsx` and `TaskCard.tsx`/the Habit row markup already use a faint "glass-lite" recipe (`bg-white/5`, `border-white/10`) tuned for a solid dark background — it has no `backdrop-blur`, so it would disappear against a busy photo. The one component in this codebase that already has the target "fresh, transparent, modern" look is `SearchBar.tsx` (`bg-white/20 backdrop-blur-xl/md`, `ring-1 ring-white/15–30`, a shadow tinted toward black rather than a neon glow) — that recipe is the reference DNA for this change rather than inventing a new visual language.

The background photo itself (`fetchPicture()` in `components/remindeen/home/Background.tsx`) is fetched and held in local `useState` inside `HomePage.tsx` only; `ProductivityPage.tsx` has no access to it today.

## Goals / Non-Goals

**Goals:**
- Page 2 shows Kanban and Habit at the same time, side by side, with no tab control.
- Page 2 renders behind the same background photo as Page 1, fetched once and shared.
- Kanban/Habit loading states use shape-matched skeletons instead of plain text.
- Outer panels (Kanban, Habit, sign-in prompt, form modals) adopt the `SearchBar`-style glass recipe; inner elements (the 3 Kanban status columns) are flattened to plain dividers rather than nested card chrome, avoiding glass-on-glass stacking.

**Non-Goals:**
- No changes to `use-tasks.ts`, `use-habits.ts`, or `use-auth.ts` data contracts — this is a presentation-layer change only.
- No changes to drag-and-drop behavior (`@dnd-kit` wiring in `KanbanBoard.tsx`) beyond restyling the columns it renders into.
- No removal of the `Tabs` UI primitive (`components/ui/tabs.tsx`) itself — it stays in use by `entrypoints/sidepanel/App.tsx`. Only `ProductivityPage.tsx`'s usage of it is removed.
- No offline caching or background-image prefetch strategy changes — `fetchPicture()`'s existing 12-hour localStorage cache is reused as-is, just relocated to a shared call site.

## Decisions

### 1. Lift the background photo to a shared hook, owned above both pages
Extract `HomePage.tsx`'s `fetchPicture()` + `useState`/`useEffect` into a small hook (e.g. `hooks/use-background-image.ts`) called once from `entrypoints/newtab/App.tsx`, with the resulting URL passed down as a prop to both `HomePage` and `ProductivityPage`.
- **Alternative considered**: have `ProductivityPage` call `fetchPicture()` independently, relying on its 12-hour localStorage cache to usually return "the same photo." Rejected — `fetchPicture()` picks a *random* entry from the cached array on every call (`pictures[Math.floor(Math.random() * pictures.length)]`), so two independent calls within the same cache window can still return two different photos, breaking the "one wallpaper behind the whole desktop" effect the redesign is going for.

### 2. Side-by-side panels: Habit narrow, Kanban wide, both flat glass containers
`ProductivityPage.tsx` renders a two-column flex/grid layout: `HabitTracker` in a narrow panel, `KanbanBoard` in a wide panel, both wrapped in the same glass container treatment (`bg-white/10 backdrop-blur-xl ring-1 ring-white/15 rounded-3xl shadow-[...]`, with an inner top-highlight via `shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]` for edge refraction). Below a width breakpoint (`md`), the two panels stack vertically instead of compressing side by side.
- **Alternative considered**: stacked full-width sections (Kanban on top, Habit below, page scrolls). Rejected per explicit user preference for the side-by-side "floating widget" composition shown in the reference screenshot.
- **Alternative considered**: asymmetric bento layout with Habit as a bottom horizontal strip. Rejected — would require reshaping `HabitTracker`'s list-row markup into a horizontal ticker, a bigger structural change than the user asked for; deferred as a possible future iteration.

### 3. Flatten nested card chrome inside the Kanban panel
Today `KanbanColumn.tsx` gives each of the 3 status columns its own `rounded-xl border border-white/10 bg-white/[0.03]` card. Once the outer Kanban panel itself carries the glass treatment (blur + ring + shadow), nested column cards would stack glass-on-glass and read as muddy/over-boxed. Columns become flat sections separated by a thin `border-l border-white/10` divider (no independent background or rounding); `TaskCard.tsx` keeps its own lighter elevation (`bg-white/[0.06]` resting, `bg-white/[0.12]` hover) since it's the actually-interactive/draggable unit and benefits from being visually liftable off the flat column background.
- **Alternative considered**: keep per-column card chrome as-is and only add blur to the outer wrapper. Rejected — directly produces the "card-in-card" look the redesign is meant to eliminate.

### 4. Shape-matched shimmer skeletons, not the existing `home/Skeleton.tsx`
New skeleton components are added — one for the Kanban panel (3 flat column outlines, each with 2–3 card-sized shimmer blocks) and one for the Habit panel (4–5 pill-sized shimmer rows) — using a moving shimmer-sweep gradient. `components/remindeen/home/Skeleton.tsx` (light-themed `bg-gray-100` pulse blocks, used elsewhere for text-line placeholders) is left untouched and not reused here — it has no relationship to this page's dark glass surface or to the box-shaped content being loaded.
- **Alternative considered**: reuse `home/Skeleton.tsx` as-is. Rejected — wrong color theme (light gray on a dark glass surface) and wrong shape (text-line bars vs. column/card and row/pill shapes).
- **Alternative considered**: a generic centered spinner. Rejected — loses the "content is already taking shape" feel of a layout-matched skeleton, and newtab is opened frequently enough that this loading state is seen often.

### 5. Sign-in prompt and form modals get the same glass recipe
`SignInPrompt.tsx` and the overlay/dialog markup in `TaskFormModal.tsx`/`HabitFormModal.tsx` are restyled to match the same `bg-white/10–20 backdrop-blur ring-1 ring-white/15` language as the panels, so the whole page reads as one consistent surface system rather than the panels being glass while the modals stay on the old `bg-zinc-950/80` solid-ish overlay.
- **Alternative considered**: leave modals as-is since they already use `backdrop-blur-sm` for their full-screen overlay. Rejected — the overlay scrim and the modal's own content card are two different surfaces; only the overlay currently has blur, the inner content card itself is still flat-dark and inconsistent with the new panel styling.

## Risks / Trade-offs

- **[Risk]** Removing per-column card chrome (Decision 3) changes how clearly the 3 Kanban statuses read as separate drop zones for `@dnd-kit`, since the visual boundary becomes a thin divider instead of a bordered box. → **Mitigation**: keep the column header label + count badge (`KanbanColumn.tsx`'s existing `<h3>`) as the primary boundary cue, and verify drag-and-drop drop-target affordance (e.g. a highlight on the divider/column on drag-over) still reads clearly once flattened.
- **[Risk]** Side-by-side panels (Decision 2) compress the Kanban board's already-3-column internal layout into less horizontal space than it had as a full-width tab. → **Mitigation**: Kanban's existing `overflow-x-auto` on the column row already handles narrow widths by scrolling; confirm this still feels acceptable once Kanban is the "wide" (not full-width) panel, and rely on the `md` breakpoint stack-to-vertical fallback (Decision 2) for genuinely narrow viewports.
- **[Risk]** Lifting the background photo (Decision 1) changes `HomePage.tsx`'s render contract — it must now receive `backgroundUrl` as a prop instead of owning its own fetch. → **Mitigation**: this is a small, mechanical change (move `useState`/`useEffect` up one level into `App.tsx`, pass down as a prop); no behavior change to the fetch/cache logic itself.
- **[Trade-off]** A single shared background fetch means if `fetchPicture()` fails, both pages lose their background simultaneously (today, a failure only affected whichever page tried to fetch). → **Accepted**: `fetchPicture()` already returns `null` on failure and both pages already tolerate an empty `backgroundUrl` (falls back to the radial-gradient-only background), so this is a no-op in practice.

## Migration Plan

- Purely a frontend visual/layout change within `remindeen`; no backend, API, or data-model changes.
- No data migration — existing Kanban tasks and Habit records are unaffected; only their presentation changes.
- Rollback: revert the component changes; no persisted state depends on the new layout.

## Open Questions

- None outstanding — layout arrangement (side-by-side, Habit narrow / Kanban wide) and background-sharing behavior (literally the same photo, not just the same cache pool) were both confirmed during exploration.

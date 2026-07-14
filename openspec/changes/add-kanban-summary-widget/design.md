## Context

`KanbanBoard.tsx` already holds the full task list client-side via `use-tasks.ts` (needed for rendering the To Do/Doing/Done columns). This widget needs no data the app doesn't already have loaded.

## Goals / Non-Goals

**Goals:**
- Derive all displayed numbers from the existing in-memory task list — no new fetch, no new backend endpoint.
- Match the prototype's exact formulas (see `renderKanbanStats()` in `index.html`) so the numbers are predictable and testable: `total = tasks.length`, `done = count(status === DONE)`, `dueThisWeek = count(dueDate within the current ISO week)`, percentage bar segments as `count / total` per status, priority breakdown as raw counts for High/Medium/Low.

**Non-Goals:**
- Any server-side aggregation endpoint — deliberately kept client-only since the data is already local and small (a single user's task list).
- Historical/trend stats (e.g. "tasks completed last week") — only current-state snapshots, matching the prototype.

## Decisions

**No new hook.** `KanbanSummary` reads the same task list `KanbanBoard` already has — either by accepting it as a prop from `ProductivityPage.tsx` (which would need to lift `use-tasks.ts`'s state up one level) or by both components calling `use-tasks.ts` independently (if that hook is safe to call from multiple components without duplicating fetches/subscriptions — check its current implementation before deciding). Either approach avoids a second network round-trip; the exact wiring is an implementation-time call based on how `use-tasks.ts` is currently structured.

**"Due this week" uses the ISO week helper already in the codebase.** `lib/iso-week.ts` already exists (used by Habit weekly-period logic) — reuse it here instead of writing a second week-boundary calculation.

## Risks / Trade-offs

- **[Risk] If `use-tasks.ts` is called independently in two components, it could trigger a duplicate fetch/subscription.** → **Mitigation**: this should be checked and resolved at implementation time — either lift state up or confirm the hook is already fetch-deduplicated; not a design ambiguity worth blocking the proposal on.

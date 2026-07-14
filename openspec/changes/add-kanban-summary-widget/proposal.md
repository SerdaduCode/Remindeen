## Why

The `index.html` design prototype includes a "Ringkasan Kanban" widget below the Kanban board: total/done/due-this-week task counts, a status-distribution bar (Belum/Dikerjakan/Selesai), and a priority breakdown. It's a pure read-only summary of data the Kanban board already has loaded — no new persistence, no API changes, purely a client-side derived view. `ProductivityPage.tsx` has no such widget today.

## What Changes

- New capability `kanban-summary-widget`: a client-side-computed summary panel derived entirely from the Kanban tasks already fetched by `use-tasks.ts` — no new data source, no server round-trip.
- Add a `KanbanSummary` component computing, from the existing tasks list: total count, done count, count due within the current calendar week, a 3-segment percentage bar (todo/doing/done), and a priority breakdown (High/Medium/Low counts) — porting the prototype's `renderKanbanStats()` logic directly (see the `renderKanbanStats` function in the design prototype for the exact formulas).
- Render it in a new row below the Kanban board, side by side with the Brain Dump widget (see the separate `add-brain-dump` change, a root-level cross-repo change since Brain Dump needs its own backend model — this change has no such dependency and can ship independently).
- Modifies `productivity-page-layout`: adds a requirement describing this new sub-row beneath the Kanban panel.

## Capabilities

### New Capabilities
- `kanban-summary-widget`: read-only, client-computed summary statistics derived from the existing Kanban task list.

### Modified Capabilities
- `productivity-page-layout`: the Kanban column gains a compact summary row beneath the board (this widget), in addition to whatever else lands in that same row (Brain Dump, from the separate `add-brain-dump` change).

## Impact

- `components/remindeen/kanban/` (or `components/remindeen/productivity/`) — new `KanbanSummary.tsx`, reading from the same task state `KanbanBoard.tsx` already has (via `use-tasks.ts` or a shared context — no new hook, no new fetch).
- `ProductivityPage.tsx` — render `KanbanSummary` in the row below the Kanban panel.
- No backend, no database, no realtime changes — this is purely a derived view over data that already exists client-side.

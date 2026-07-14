## Why

The `index.html` prototype includes a "Ringkasan Minggu" widget: two ring charts (% Kanban tasks completed, % habit consistency) plus two progress bars splitting habit consistency into "Bangun Kebiasaan" (build habits) vs "Hentikan Kebiasaan" (quit habits). The ring-chart portion is derivable entirely from data `remindeen` already loads (tasks, habits, check-ins). The build/quit split is not currently derivable — investigation for this proposal found that no `Habit` anywhere in `al-quotes` or `remindeen` has a "build vs quit" type field at all (checked `prisma/schema.prisma`'s `Habit` model and the `habit-tracking` spec); the prototype's `habits[].type === "quit"` field has no backend counterpart today.

## What Changes

- New capability `week-summary-widget`: a client-side-computed pair of ring charts (task completion %, overall habit consistency %) rendered in the new fourth Productivity column.
- Task completion ring: `doneTasks / totalTasks * 100`, ported directly from the prototype's `renderRingkasanMinggu()`.
- Habit consistency ring: for each habit, a new "weekly rate" helper (not yet in `lib/habit-streak.ts`) computing the fraction of that habit's scheduled check-in periods completed in the current week; the ring shows the average across all habits.
- **Deferred, not built in this change**: the separate "Bangun Kebiasaan" vs "Hentikan Kebiasaan" progress bars. These require a `habitType` (or similarly named) field distinguishing build- from quit-habits, which doesn't exist in `Habit` today. Adding that field is a cross-repo change (Prisma model + API validation in `al-quotes`, plus a UI control in the Habit create/edit modal in `remindeen`) — out of scope here. This change ships the two ring charts only; the build/quit split bars are a follow-up once that field exists (see Open Questions in design.md).
- Modifies `productivity-page-layout`: adds a requirement describing the new fourth column and this widget's place in it.

## Capabilities

### New Capabilities
- `week-summary-widget`: client-computed weekly ring-chart summary (task completion %, habit consistency %) — scoped to the two rings only, not the build/quit split bars.

### Modified Capabilities
- `productivity-page-layout`: introduces a fourth Productivity column (alongside the existing Habit+Calendar / Kanban / Today+RecentActivity columns), starting with this widget; `add-prayer-checkin-tracker`, `add-quran-progress-tracker`, and `add-standalone-todolist` each add further widgets into the same column.

## Impact

- `remindeen/lib/habit-streak.ts` (or a new file) — add the weekly-completion-rate helper.
- New `components/remindeen/productivity/WeekSummary.tsx` (ring chart markup, ported from the prototype's SVG-based `ringChartMarkup()`).
- `ProductivityPage.tsx` — introduce the fourth column and render `WeekSummary` first in it.
- No backend, no database, no realtime changes for the two rings shipped in this change.
- **Not included**: the habit build/quit type field and its progress bars — flagged as a follow-up decision for the product owner (see design.md Open Questions).

## Context

`lib/habit-streak.ts` currently exposes streak/current-period helpers (`computeCurrentStreak`, `isCheckedInForCurrentPeriod`, `computePeriodStart`) but nothing that computes a percentage rate across a week for a habit. Tasks are already available via `use-tasks.ts` for the (separate) Kanban Summary widget's total/done counts, which this widget reuses.

## Goals / Non-Goals

**Goals:**
- Ship the two ring charts (task completion %, habit consistency %) now, since both are fully derivable from existing data.
- Introduce the fourth Productivity column as a container other changes (`add-prayer-checkin-tracker`, `add-quran-progress-tracker`, `add-standalone-todolist`) also render into.

**Non-Goals:**
- The "Bangun Kebiasaan" / "Hentikan Kebiasaan" split bars — blocked on a `habitType` field that doesn't exist. Not attempting a workaround (e.g. guessing type from title text) since that would be unreliable and not what the prototype does.
- Historical week-over-week trend — only the current week's snapshot, matching the prototype.

## Decisions

**"Habit consistency %" averages a new per-habit weekly rate, not a global check-in count.** A habit's weekly rate is `completed periods this week / scheduled periods this week` (1 for daily habits check per day scheduled Mon-Sun; for weekly habits, scheduled periods derive from `weekDays` if set, else 1 per week) — mirroring the prototype's `habitWeeklyRate(h)` concept referenced by `renderRingkasanMinggu()`. The overall ring is the unweighted average of this rate across all the user's habits.

**Ring chart rendering is a small inline SVG component, not a charting library.** Consistent with the project-wide constraint (documented in `openspec/project.md`'s predecessor context) against pulling in external charting dependencies for a Manifest V3 extension — port the prototype's SVG arc approach (`ringChartMarkup()`) as a React component instead.

## Risks / Trade-offs

- **[Risk] Shipping only 2 of the 4 elements in the prototype's "Ringkasan Minggu" widget could look incomplete against the design reference.** → **Mitigation**: explicitly scoped and called out in the proposal; the build/quit bars are better served by a dedicated follow-up change once the type field exists, rather than blocking this shippable piece.

## Open Questions

- Does the product owner want a follow-up change (e.g. `add-habit-build-quit-type`) that adds a `habitType` (`build` | `quit`) field to `Habit` in `al-quotes`, a selector in the Habit create/edit modal in `remindeen`, and then extends this widget with the two split progress bars? That would be a root-level cross-repo change, not a remindeen-only one, since it touches the Prisma schema and API validation.

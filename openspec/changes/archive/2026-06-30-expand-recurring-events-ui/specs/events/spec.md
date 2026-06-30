## MODIFIED Requirements

### Requirement: View events on a mini calendar
The Productivity page left column SHALL include a CalendarView panel that renders a monthly mini calendar grid. Days that have at least one event occurrence SHALL be marked with a visual indicator (dot), where an occurrence is either a non-recurring event's `startAt` date or any date a recurring event's `rrule` produces within the displayed month. The user SHALL be able to navigate between months using previous/next controls.

#### Scenario: Days with events show a dot indicator
- **WHEN** the authenticated user has an event on July 4
- **THEN** the day cell for July 4 in the mini calendar shows a dot indicator

#### Scenario: A weekly recurring event shows a dot on every occurrence in the month
- **WHEN** the authenticated user has a weekly recurring event ("Lari") with `rrule: "RRULE:FREQ=WEEKLY;BYDAY=FR"` and a `startAt` of July 3, 2026 (a Friday)
- **THEN** every Friday in the displayed month — not only July 3 — shows a dot indicator, recomputed for whichever month is currently navigated to

#### Scenario: Navigate to previous and next months
- **WHEN** the user clicks the previous or next month control
- **THEN** the calendar grid updates to show the selected month, and recurring events' dot indicators are recomputed for the newly displayed month

### Requirement: Select a day to view its events
Clicking a day in the mini calendar SHALL select that day and display a list of the user's event occurrences for that day — including occurrences produced by a recurring event's `rrule` falling on that day — sorted by start time, below or alongside the calendar grid.

#### Scenario: Selecting a day shows its events
- **WHEN** the user clicks on July 4 in the mini calendar and has two events on that day
- **THEN** the event list below the calendar shows those two events sorted by actual start time (the underlying instant each `startAt` represents), not by lexicographic comparison of the raw `startAt` strings

#### Scenario: Selecting a day with no events shows an empty state
- **WHEN** the user clicks on a day with no events
- **THEN** the event list shows an empty state with an option to add an event

#### Scenario: Selecting a later occurrence of a recurring event shows it in that day's list
- **WHEN** the user has a weekly recurring event whose original `startAt` is July 3, 2026, and the user selects July 10, 2026 (a later Friday occurrence)
- **THEN** the event list for July 10 includes that event, displaying the occurrence's time on July 10

#### Scenario: Editing any occurrence of a recurring event edits the whole series
- **WHEN** the user clicks a recurring event's occurrence on a day other than its original `startAt` date and saves changes in EventFormModal
- **THEN** the change is persisted via `PATCH /events/:id` against the event's original series id, and the updated event reflects the change across all its occurrences — there is no per-occurrence edit

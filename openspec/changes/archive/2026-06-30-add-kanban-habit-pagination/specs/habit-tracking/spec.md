## ADDED Requirements

### Requirement: Week-paginated check-in history
The habit tracker header SHALL include `‹`/`›` arrow controls that move a week cursor backward and forward, labeled with the viewed week's ISO week number and year (e.g. "Week 26, 2026"). The `›` control SHALL be disabled when the cursor is already at the current week. There SHALL be no limit on how far back the cursor can move. The cursor SHALL reset to the current week each time the habit tracker mounts.

#### Scenario: Paging to the previous week
- **WHEN** the user clicks the `‹` control
- **THEN** the header label updates to the previous ISO week and every habit row's check-in display updates to reflect that week

#### Scenario: Forward navigation is disabled at the current week
- **WHEN** the cursor is at the current week
- **THEN** the `›` control is disabled and clicking it has no effect

#### Scenario: Paging past weeks with no check-in data
- **WHEN** the user pages to a week in which a habit has no recorded check-ins
- **THEN** that habit's row renders its check-in display as fully unchecked for that week, without an error

### Requirement: Daily-habit week strip
For a habit with `frequency: daily`, the habit row SHALL render a 7-cell Monday–Sunday strip for the viewed week, where each cell reflects whether a check-in exists (via `checkInsByHabit`) whose `periodStart` matches that day.

#### Scenario: Strip reflects a mix of checked and missed days
- **WHEN** a daily habit has check-ins for Monday, Tuesday, and Thursday of the viewed week, but not Wednesday, Friday, Saturday, or Sunday
- **THEN** the strip shows Monday, Tuesday, and Thursday as checked and the remaining four days as unchecked

### Requirement: Weekly-habit single week indicator
For a habit with `frequency: weekly`, the habit row SHALL render a single indicator reflecting whether a check-in exists for the viewed ISO week (one check-in covers the entire week, per the existing weekly check-in period), rather than a 7-cell daily strip.

#### Scenario: Weekly habit checked in for the viewed week
- **WHEN** a weekly habit has a check-in whose `periodStart` equals the viewed week's start
- **THEN** the row's indicator shows that week as completed

#### Scenario: Weekly habit not checked in for the viewed week
- **WHEN** a weekly habit has no check-in whose `periodStart` equals the viewed week's start
- **THEN** the row's indicator shows that week as not completed

### Requirement: Icon-only check-in control
The text "Check in" / "Checked in" button SHALL be replaced by an icon-only control. The control SHALL remain clickable (triggering a check-in for today, unchanged from existing behavior) only while the week cursor is at the current week. While viewing a past week, the control SHALL render as a disabled, read-only indicator of that period's recorded state and SHALL NOT trigger a check-in.

#### Scenario: Icon control checks in a habit on the current week
- **WHEN** the user is viewing the current week and clicks the icon control for a habit not yet checked in
- **THEN** a check-in is recorded for today, same as the existing check-in behavior

#### Scenario: Icon control is read-only on a past week
- **WHEN** the user has paged to a past week
- **THEN** the icon control for each habit is disabled and clicking it has no effect

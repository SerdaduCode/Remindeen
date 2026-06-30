# habit-tracking

## Purpose

TBD - added by replace-orbit-with-kanban-habit-tracker

## Requirements

### Requirement: Create habit
Users SHALL be able to create a habit with a title (required), optional description, optional priority, a required frequency (`daily` or `weekly`), optional `weekDays` (shown only when frequency is `weekly`), optional `reminderTime` (shown only when frequency is `daily`), and optional `syncToCalendar` toggle. New habits SHALL be persisted via `POST /habits` with all provided fields.

#### Scenario: Creating a habit adds it to the tracker
- **WHEN** the authenticated user submits the create-habit form with a title and a frequency
- **THEN** the habit is persisted via `POST /habits` and appears in the habit list without requiring a page reload

#### Scenario: Frequency is required
- **WHEN** the user attempts to submit the create-habit form without selecting a frequency
- **THEN** the habit is not submitted and a validation message is shown

#### Scenario: Creating a weekly habit with day selection
- **WHEN** the user selects `weekly` frequency and checks Monday and Friday in the day picker, then submits
- **THEN** the habit is persisted with `weekDays: [1, 5]`

#### Scenario: Day picker is hidden for daily habits
- **WHEN** the user selects `daily` frequency
- **THEN** the day picker is not rendered and `weekDays` is sent as `[]` (or omitted)

#### Scenario: Creating a daily habit with a reminder time
- **WHEN** the user selects `daily` frequency, sets reminder time to `"05:30"`, and submits
- **THEN** the habit is persisted with `reminderTime: "05:30"`

#### Scenario: Time input is hidden for weekly habits
- **WHEN** the user selects `weekly` frequency
- **THEN** the time input is not rendered and `reminderTime` is sent as `null` (or omitted)

#### Scenario: Switching frequency clears the hidden field
- **WHEN** the user selects `weekly`, checks some days, then switches to `daily`
- **THEN** the day picker disappears and the previously selected days are cleared; the time input appears instead

### Requirement: Edit habit
Users SHALL be able to edit an existing habit's title, description, priority, frequency, `weekDays` (for weekly), `reminderTime` (for daily), and `syncToCalendar`, persisted via `PATCH /habits/:id`.

#### Scenario: Editing a habit updates its entry
- **WHEN** the user changes a habit's frequency from daily to weekly and saves
- **THEN** the habit is updated via `PATCH /habits/:id` and the habit list reflects the new frequency

#### Scenario: Edit modal pre-populates existing weekDays
- **WHEN** the user opens the edit modal for a weekly habit that has `weekDays: [1, 3, 5]`
- **THEN** the day picker shows Monday, Wednesday, and Friday pre-checked

#### Scenario: Edit modal pre-populates reminderTime
- **WHEN** the user opens the edit modal for a daily habit that has `reminderTime: "05:30"`
- **THEN** the time input shows `"05:30"` pre-filled

#### Scenario: Sync toggle is disabled when calendar is not connected
- **WHEN** the user opens the habit edit modal while Google Calendar is not connected
- **THEN** the "Sync to Calendar" toggle is rendered disabled with a hint explaining how to connect

#### Scenario: Sync toggle reflects and updates syncToCalendar
- **WHEN** the user toggles "Sync to Calendar" on and saves
- **THEN** the habit is updated with `syncToCalendar: true`

### Requirement: Delete habit
Users SHALL be able to permanently delete a habit. Deletion SHALL remove the habit and its check-in history via `DELETE /habits/:id`. Before deletion is executed, the habit form modal SHALL display an inline confirmation panel in place of the form content, requiring the user to confirm or cancel. The native browser `confirm()` dialog SHALL NOT be used.

#### Scenario: Deleting a habit shows an inline confirmation
- **WHEN** the user clicks the Delete button on an existing habit's edit modal
- **THEN** the modal replaces the form content with a confirmation panel asking the user to confirm the deletion

#### Scenario: Confirming deletion removes the habit
- **WHEN** the user confirms deletion in the inline confirmation panel
- **THEN** the habit is removed via `DELETE /habits/:id` and no longer appears in the habit list

#### Scenario: Cancelling deletion returns to the form
- **WHEN** the user cancels in the inline confirmation panel
- **THEN** the modal returns to showing the habit form with no change made to the habit

### Requirement: Check in for the current period
Users SHALL be able to mark a habit as completed for its current period (today for daily habits, the current ISO week for weekly habits) via `POST /habits/:id/checkins`. Checking in more than once for the same period SHALL NOT create a duplicate entry.

#### Scenario: Checking in a daily habit
- **WHEN** the user checks in a daily habit that has not been checked in today
- **THEN** a check-in is recorded for today's period via the API and the habit's UI reflects it as completed for today

#### Scenario: Checking in twice in the same period is idempotent
- **WHEN** the user checks in a habit that was already checked in for the current period
- **THEN** no duplicate check-in is created, relying on the API's unique constraint on `(habitId, periodStart)`

### Requirement: View check-in history and computed streak
Users SHALL be able to view a habit's check-in history, fetched via `GET /habits/:id/checkins`, and SHALL see a computed current streak derived client-side by walking expected periods backward from the present and checking for a matching check-in row.

#### Scenario: Streak reflects consecutive completed periods
- **WHEN** a daily habit has check-ins for each of the last 5 consecutive days and no check-in further back
- **THEN** the displayed current streak is 5

#### Scenario: A missed period breaks the streak
- **WHEN** a daily habit has a check-in for today but no check-in for yesterday
- **THEN** the displayed current streak is 1, not counting periods before the gap

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

### Requirement: Sign-in required to access the habit tracker
Users SHALL NOT be able to view or modify habits without an active Supabase session. Attempting to open the Habit tab while signed out SHALL present a sign-in prompt instead of habit data.

#### Scenario: Signed-out user sees a sign-in prompt
- **WHEN** a signed-out user opens the Habit tab
- **THEN** a sign-in prompt is shown instead of any habit data, and no request to `/habits` is made

### Requirement: Habit tracker reflects realtime habit changes
The habit tracker SHALL reflect Habit changes received over the realtime channel — created, updated, deleted, and check-ins — without requiring a manual refresh, applying each change idempotently by habit (or check-in) id so a change the tracker's own action just made is not duplicated.

#### Scenario: A check-in recorded elsewhere updates the tracker
- **WHEN** a habit check-in is recorded via the MCP API (or another device) while the habit tracker is open
- **THEN** that habit is shown as completed for the current period without the user refreshing

#### Scenario: A habit created elsewhere appears in the tracker
- **WHEN** a habit is created via the API (or another device) while the habit tracker is open
- **THEN** the habit appears in the list without the user refreshing

#### Scenario: A habit deleted elsewhere disappears from the tracker
- **WHEN** a habit is deleted via the API (or another device) while the habit tracker is open
- **THEN** the habit and its entry are removed from the tracker without the user refreshing

#### Scenario: The tracker's own check-in does not produce a duplicate entry
- **WHEN** the user checks in a habit through the tracker's own UI
- **THEN** the corresponding realtime event for that same check-in does not result in a duplicate check-in entry

### Requirement: Habit row shows scheduling metadata
The habit tracker row SHALL display abbreviated scheduling metadata below the habit title when it is set: day abbreviations for weekly habits with `weekDays`, and the reminder time for daily habits with `reminderTime`. Habits without these fields show no secondary line.

#### Scenario: Weekly habit with weekDays shows day abbreviations
- **WHEN** a weekly habit has `weekDays: [1, 3, 5]`
- **THEN** the habit row shows a secondary line with abbreviated day names (e.g. "Mon · Wed · Fri")

#### Scenario: Daily habit with reminderTime shows the time
- **WHEN** a daily habit has `reminderTime: "05:30"`
- **THEN** the habit row shows a secondary line with the time (e.g. "05:30")

#### Scenario: Habit without scheduling metadata shows no secondary line
- **WHEN** a habit has `weekDays: []` and `reminderTime: null`
- **THEN** no secondary metadata line is rendered in the habit row

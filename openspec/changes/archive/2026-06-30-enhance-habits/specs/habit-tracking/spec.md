## MODIFIED Requirements

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

## ADDED Requirements

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

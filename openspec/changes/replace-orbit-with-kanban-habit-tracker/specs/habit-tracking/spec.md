## ADDED Requirements

### Requirement: Create habit
Users SHALL be able to create a habit with a title (required), optional description, optional priority, and a required frequency (`daily` or `weekly`). New habits SHALL be persisted via `POST /habits`.

#### Scenario: Creating a habit adds it to the tracker
- **WHEN** the authenticated user submits the create-habit form with a title and a frequency
- **THEN** the habit is persisted via `POST /habits` and appears in the habit list without requiring a page reload

#### Scenario: Frequency is required
- **WHEN** the user attempts to submit the create-habit form without selecting a frequency
- **THEN** the habit is not submitted and a validation message is shown

### Requirement: Edit habit
Users SHALL be able to edit an existing habit's title, description, priority, and frequency, persisted via `PATCH /habits/:id`.

#### Scenario: Editing a habit updates its entry
- **WHEN** the user changes a habit's frequency from daily to weekly and saves
- **THEN** the habit is updated via `PATCH /habits/:id` and the habit list reflects the new frequency

### Requirement: Delete habit
Users SHALL be able to permanently delete a habit. Deletion SHALL remove the habit and its check-in history via `DELETE /habits/:id`.

#### Scenario: Deleting a habit removes it from the tracker
- **WHEN** the user deletes a habit and confirms
- **THEN** the habit is removed via `DELETE /habits/:id` and no longer appears in the habit list

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

### Requirement: Sign-in required to access the habit tracker
Users SHALL NOT be able to view or modify habits without an active Supabase session. Attempting to open the Habit tab while signed out SHALL present a sign-in prompt instead of habit data.

#### Scenario: Signed-out user sees a sign-in prompt
- **WHEN** a signed-out user opens the Habit tab
- **THEN** a sign-in prompt is shown instead of any habit data, and no request to `/habits` is made

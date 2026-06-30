## ADDED Requirements

### Requirement: Status field in the edit modal
The task edit modal SHALL include a status field (`To Do` / `Doing` / `Done`) that lets the user change a task's status directly, in addition to the existing drag-and-drop method. This field SHALL NOT appear on the create-task form.

#### Scenario: Changing status from the edit modal
- **WHEN** the user opens the edit modal for an existing task and changes its status field, then saves
- **THEN** the task is updated via `PATCH /tasks/:id` with the new status and the card moves to the corresponding column

#### Scenario: Status field absent on create
- **WHEN** the user opens the create-task form
- **THEN** no status field is rendered, and the created task defaults to `To Do` as before

### Requirement: Per-task calendar sync toggle in the task modal
The task modal SHALL include a "Sync to Calendar" toggle reflecting and controlling the task's `syncToCalendar` field. The toggle SHALL be disabled, with an explanatory hint, when the signed-in user has not connected Google Calendar.

#### Scenario: Toggling sync on for a task
- **WHEN** a user with a connected Google Calendar enables the toggle on a task and saves
- **THEN** the task is updated via the create/update request with `syncToCalendar: true`

#### Scenario: Toggling sync off for a previously synced task
- **WHEN** a user disables the toggle on a task that was previously syncing and saves
- **THEN** the task is updated with `syncToCalendar: false`

#### Scenario: Toggle is disabled without a calendar connection
- **WHEN** a user who has not connected Google Calendar opens the task modal
- **THEN** the "Sync to Calendar" toggle is rendered disabled with a hint explaining how to connect a calendar

#### Scenario: New tasks default to sync disabled
- **WHEN** a user opens the create-task form
- **THEN** the "Sync to Calendar" toggle defaults to off

## MODIFIED Requirements

### Requirement: Edit Kanban task
Users SHALL be able to edit an existing task's title, description, start date, due date, priority, status, and calendar-sync flag. Description SHALL be editable as multi-line text. Edits SHALL be persisted via `PATCH /tasks/:id` and reflected immediately on the task's card.

#### Scenario: Editing a task updates its card
- **WHEN** the user changes a task's title and saves
- **THEN** the task is updated via `PATCH /tasks/:id` and the card displays the new title

#### Scenario: Editing a multi-line description
- **WHEN** the user enters a description spanning multiple lines and saves
- **THEN** the task is updated via `PATCH /tasks/:id` with the description preserving line breaks

### Requirement: Create Kanban task
Users SHALL be able to create a new task with a title (required), optional multi-line description, optional start date, optional due date, optional priority (`Low`, `Medium`, `High`), and optional calendar-sync toggle (defaulting to off). New tasks SHALL be persisted via Al-Quotes' `/tasks` API and SHALL default to `To Do` status; status is not selectable at creation time.

#### Scenario: Creating a task adds it to the board
- **WHEN** the authenticated user submits the create-task form with a title and any optional fields
- **THEN** the task is persisted via `POST /tasks` and a corresponding card appears in the `To Do` column without requiring a page reload

#### Scenario: Title is required
- **WHEN** the user attempts to submit the create-task form with an empty title
- **THEN** the task is not submitted and a validation message is shown

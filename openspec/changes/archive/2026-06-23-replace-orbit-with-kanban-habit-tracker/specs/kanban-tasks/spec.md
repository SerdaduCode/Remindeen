## ADDED Requirements

### Requirement: Create Kanban task
Users SHALL be able to create a new task with a title (required), optional description, optional start date, optional due date, and optional priority (`Low`, `Medium`, `High`). New tasks SHALL be persisted via Al-Quotes' `/tasks` API and SHALL default to `To Do` status.

#### Scenario: Creating a task adds it to the board
- **WHEN** the authenticated user submits the create-task form with a title and any optional fields
- **THEN** the task is persisted via `POST /tasks` and a corresponding card appears in the `To Do` column without requiring a page reload

#### Scenario: Title is required
- **WHEN** the user attempts to submit the create-task form with an empty title
- **THEN** the task is not submitted and a validation message is shown

### Requirement: Edit Kanban task
Users SHALL be able to edit an existing task's title, description, start date, due date, and priority. Edits SHALL be persisted via `PATCH /tasks/:id` and reflected immediately on the task's card.

#### Scenario: Editing a task updates its card
- **WHEN** the user changes a task's title and saves
- **THEN** the task is updated via `PATCH /tasks/:id` and the card displays the new title

### Requirement: Delete Kanban task
Users SHALL be able to permanently delete a task. Deletion SHALL remove the task from Al-Quotes via `DELETE /tasks/:id` and from the board view.

#### Scenario: Deleting a task removes its card
- **WHEN** the user deletes a task and confirms
- **THEN** the task is removed via `DELETE /tasks/:id` and its card no longer renders on the board

### Requirement: Three-column status workflow
The Kanban board SHALL render three columns — `To Do`, `Doing`, `Done` — corresponding to the API's `TODO`/`DOING`/`DONE` status values. Moving a task to a different column SHALL update its status via `PATCH /tasks/:id`.

#### Scenario: Moving a task between columns updates its status
- **WHEN** the user drags a task card from `To Do` into `Doing`
- **THEN** the task's status is updated to `DOING` via the API and the card renders in the `Doing` column

### Requirement: Manual ordering within a column via drag-and-drop
Users SHALL be able to drag a task card to a new position within its current column. On drop, the task's position SHALL be persisted via `PATCH /tasks/:id/position`, and subsequent loads of the board SHALL reflect the new order.

#### Scenario: Reordering within a column persists
- **WHEN** the user drags a task card to a position between two other cards in the same column and releases it
- **THEN** the task's position is updated via the API such that reloading the board shows the card in its new position

### Requirement: Board reflects authenticated user's tasks only
The Kanban board SHALL only display tasks belonging to the currently signed-in user, as returned by `GET /tasks` with the user's session token.

#### Scenario: Board loads the signed-in user's tasks
- **WHEN** the Kanban tab is opened by a signed-in user
- **THEN** the board fetches `GET /tasks` with that user's bearer token and renders only the tasks returned

### Requirement: Sign-in required to access the Kanban board
Users SHALL NOT be able to view or modify tasks without an active Supabase session. Attempting to open the Kanban tab while signed out SHALL present a sign-in prompt instead of board content.

#### Scenario: Signed-out user sees a sign-in prompt
- **WHEN** a signed-out user opens the Kanban tab
- **THEN** a sign-in prompt is shown instead of any task data, and no request to `/tasks` is made

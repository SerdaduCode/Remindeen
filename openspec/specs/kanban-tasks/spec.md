# kanban-tasks

## Purpose

TBD - added by replace-orbit-with-kanban-habit-tracker

## Requirements

### Requirement: Create Kanban task
Users SHALL be able to create a new task with a title (required), optional multi-line description, optional start date, optional due date, optional priority (`Low`, `Medium`, `High`), and optional calendar-sync toggle (defaulting to off). New tasks SHALL be persisted via Al-Quotes' `/tasks` API and SHALL default to `To Do` status; status is not selectable at creation time.

#### Scenario: Creating a task adds it to the board
- **WHEN** the authenticated user submits the create-task form with a title and any optional fields
- **THEN** the task is persisted via `POST /tasks` and a corresponding card appears in the `To Do` column without requiring a page reload

#### Scenario: Title is required
- **WHEN** the user attempts to submit the create-task form with an empty title
- **THEN** the task is not submitted and a validation message is shown

### Requirement: Edit Kanban task
Users SHALL be able to edit an existing task's title, description, start date, due date, priority, status, and calendar-sync flag. Description SHALL be editable as multi-line text. Edits SHALL be persisted via `PATCH /tasks/:id` and reflected immediately on the task's card.

#### Scenario: Editing a task updates its card
- **WHEN** the user changes a task's title and saves
- **THEN** the task is updated via `PATCH /tasks/:id` and the card displays the new title

#### Scenario: Editing a multi-line description
- **WHEN** the user enters a description spanning multiple lines and saves
- **THEN** the task is updated via `PATCH /tasks/:id` with the description preserving line breaks

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

### Requirement: Delete Kanban task
Users SHALL be able to permanently delete a task. Deletion SHALL remove the task from Al-Quotes via `DELETE /tasks/:id` and from the board view. Before deletion is executed, the task modal SHALL display an inline confirmation panel in place of the form content, requiring the user to confirm or cancel.

#### Scenario: Deleting a task shows an inline confirmation
- **WHEN** the user clicks the Delete button on an existing task's edit modal
- **THEN** the modal replaces the form content with a confirmation panel asking the user to confirm the deletion

#### Scenario: Confirming deletion removes the task
- **WHEN** the user confirms deletion in the inline confirmation panel
- **THEN** the task is removed via `DELETE /tasks/:id` and its card no longer renders on the board

#### Scenario: Cancelling deletion returns to the form
- **WHEN** the user cancels in the inline confirmation panel
- **THEN** the modal returns to showing the task form with no change made to the task

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

### Requirement: Board reflects realtime task changes
The Kanban board SHALL reflect Task changes received over the realtime channel — created, updated (including status and position changes), and deleted — without requiring a manual refresh, applying each change idempotently by task id so a change the board's own action just made is not duplicated.

#### Scenario: A task created elsewhere appears on the board
- **WHEN** a task is created via the MCP API (or another device) while the board is open
- **THEN** a corresponding card appears on the board without the user refreshing

#### Scenario: A task moved elsewhere updates the board's columns
- **WHEN** a task's status changes via the MCP API (or another device) while the board is open
- **THEN** the task's card moves to the corresponding column without the user refreshing

#### Scenario: A task deleted elsewhere disappears from the board
- **WHEN** a task is deleted via the MCP API (or another device) while the board is open
- **THEN** the task's card is removed from the board without the user refreshing

#### Scenario: The board's own action does not produce a duplicate card
- **WHEN** the user creates a task through the board's own create-task form
- **THEN** the corresponding realtime event for that same task does not result in a duplicate card

### Requirement: Comment thread on an existing task
Users SHALL be able to view, add, edit, and delete comments on a task from its edit modal. The comment section SHALL only be shown when editing an existing task (not while creating a new one), since a task must have an id before its comment thread is addressable. Adding a comment SHALL be independent of the modal's main Save action — submitting a comment SHALL call `POST /tasks/:id/comments` immediately, rather than being deferred until the task's other fields are saved. Before a comment is deleted, the modal SHALL display an inline confirmation on the comment row.

#### Scenario: Opening an existing task's edit modal loads its comments
- **WHEN** the user opens the edit modal for an existing task
- **THEN** the modal fetches that task's comments via `GET /tasks/:id/comments` and renders them in the comment section

#### Scenario: The comment section is absent while creating a task
- **WHEN** the user opens the create-task form (no existing task selected)
- **THEN** no comment section is rendered, and no request to `/tasks/:id/comments` is made

#### Scenario: Adding a comment posts immediately
- **WHEN** the user types a comment body and submits the comment mini-form
- **THEN** the comment is created via `POST /tasks/:id/comments` and appears in the thread, independent of whether the main form's Save button is pressed

#### Scenario: Editing a comment
- **WHEN** the user edits the body of an existing comment on the open task and saves
- **THEN** the comment is updated via `PATCH /tasks/:id/comments/:commentId` and the thread reflects the new body

#### Scenario: Deleting a comment shows inline confirmation
- **WHEN** the user clicks the delete action on a comment
- **THEN** the comment row shows an inline confirmation before calling `DELETE /tasks/:id/comments/:commentId`

#### Scenario: Confirming comment deletion removes it from the thread
- **WHEN** the user confirms deletion of a comment
- **THEN** the comment is removed via `DELETE /tasks/:id/comments/:commentId` and no longer appears in the thread

### Requirement: Comment thread reflects realtime updates for the open task
While a task's edit modal is open, its comment thread SHALL reflect `comment.created`, `comment.updated`, and `comment.deleted` events received over the realtime channel for that task, applying each idempotently by comment id, and SHALL ignore comment events whose `taskId` does not match the currently open task.

#### Scenario: A comment added elsewhere appears in the open thread
- **WHEN** a comment is added to the currently open task via another tab or device
- **THEN** the comment appears in the open modal's thread without the user refreshing

#### Scenario: A comment event for a different task is ignored
- **WHEN** a `comment.created`, `comment.updated`, or `comment.deleted` event arrives for a task other than the one currently open in the modal
- **THEN** the open modal's comment thread is unaffected

#### Scenario: The modal's own comment action does not produce a duplicate
- **WHEN** the user adds a comment through the open modal's own comment form
- **THEN** the corresponding realtime event for that same comment does not result in a duplicate entry in the thread

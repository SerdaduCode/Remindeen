# kanban-tasks

## Purpose

TBD - added by replace-orbit-with-kanban-habit-tracker

## Requirements

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
Users SHALL be able to view, add, edit, and delete comments on a task from its edit modal. The comment section SHALL only be shown when editing an existing task (not while creating a new one), since a task must have an id before its comment thread is addressable. Adding a comment SHALL be independent of the modal's main Save action — submitting a comment SHALL call `POST /tasks/:id/comments` immediately, rather than being deferred until the task's other fields are saved.

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

#### Scenario: Deleting a comment
- **WHEN** the user deletes a comment on the open task
- **THEN** the comment is removed via `DELETE /tasks/:id/comments/:commentId` and no longer renders in the thread

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

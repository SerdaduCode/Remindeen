## ADDED Requirements

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

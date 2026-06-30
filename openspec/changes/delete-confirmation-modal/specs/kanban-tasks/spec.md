## MODIFIED Requirements

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

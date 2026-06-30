## MODIFIED Requirements

### Requirement: Three-column status workflow
While viewing the current week, the Kanban board SHALL render three columns — `To Do`, `Doing`, `Done` — corresponding to the API's `TODO`/`DOING`/`DONE` status values. Moving a task to a different column SHALL update its status via `PATCH /tasks/:id`. The `Done` column SHALL only include tasks whose `completedAt` falls within the current ISO week; `To Do` and `Doing` SHALL remain unfiltered by week, always showing all of the user's tasks in those statuses regardless of age. While viewing a past week, the board SHALL NOT render the three-column layout — see the read-only completed-tasks view requirement instead.

#### Scenario: Moving a task between columns updates its status
- **WHEN** the user drags a task card from `To Do` into `Doing`
- **THEN** the task's status is updated to `DOING` via the API and the card renders in the `Doing` column

#### Scenario: Done column scoped to the current week
- **WHEN** the board is showing the current week and a task's `completedAt` falls in a prior week
- **THEN** that task does not appear in the current week's `Done` column

#### Scenario: Unfinished tasks always appear regardless of age
- **WHEN** a `To Do` or `Doing` task was created several weeks ago and is still unfinished
- **THEN** it appears in its column on the current week's board, not tied to the week it was created

## ADDED Requirements

### Requirement: Week-paginated Kanban board
The Kanban header SHALL include `‹`/`›` arrow controls that move a week cursor backward and forward, labeled with the viewed week's ISO week number and year. The `›` control SHALL be disabled when the cursor is already at the current week. There SHALL be no limit on how far back the cursor can move. The cursor SHALL reset to the current week each time the board mounts.

#### Scenario: Paging to the previous week
- **WHEN** the user clicks the `‹` control
- **THEN** the header label updates to the previous ISO week and the board's content switches to that week's read-only completed-tasks view

#### Scenario: Forward navigation is disabled at the current week
- **WHEN** the cursor is at the current week
- **THEN** the `›` control is disabled and clicking it has no effect

### Requirement: Read-only completed-tasks view for past weeks
While viewing a past week, the board SHALL render a single list of tasks whose `completedAt` falls within that week, instead of the three-column layout. The list SHALL NOT support drag-and-drop or reordering. Each task in the list SHALL remain clickable, opening the existing task edit modal to view its details and comment thread.

#### Scenario: Past week with completed tasks
- **WHEN** the user pages to a week in which two tasks were completed
- **THEN** the board shows a read-only list containing exactly those two tasks, titled with that week's label

#### Scenario: Past week with no completed tasks
- **WHEN** the user pages to a week with no completed tasks
- **THEN** the board shows an empty state for that week instead of an error or a blank screen

#### Scenario: Opening a task from the past-week list
- **WHEN** the user clicks a task card in the read-only past-week list
- **THEN** the existing task edit modal opens, showing the task's details and comment thread, with the same editing capability available today

### Requirement: Add-task control hidden outside the current week
The "+" add-task button SHALL only be rendered while viewing the current week, since new tasks always default to `To Do` status on the current board and creating one while browsing a past week's history is not meaningful.

#### Scenario: Add button present on the current week
- **WHEN** the user is viewing the current week
- **THEN** the "+" add-task button is visible in the header

#### Scenario: Add button absent on a past week
- **WHEN** the user has paged to a past week
- **THEN** the "+" add-task button is not rendered in the header

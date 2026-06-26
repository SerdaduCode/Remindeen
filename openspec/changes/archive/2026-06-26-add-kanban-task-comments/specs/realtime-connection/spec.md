## MODIFIED Requirements

### Requirement: One shared Pusher connection per open page
The extension SHALL maintain at most one Pusher connection per open `newtab` page, shared via reference counting among all data hooks that need it — the Kanban board's and habit tracker's hooks, which stay mounted for the page's lifetime, and the task-comment thread hook, which mounts only while a task's edit modal is open and unmounts when it closes. The connection SHALL stay open as long as at least one hook holds it, regardless of how many hooks are currently mounted.

#### Scenario: Page-lifetime panels share one connection
- **WHEN** a signed-in user has the `newtab` page open with both the habit tracker and the Kanban board rendered
- **THEN** only one Pusher connection exists for that page, used by both panels' data hooks

#### Scenario: Opening a task's comment thread joins the existing connection
- **WHEN** the user opens a task's edit modal while the Kanban board and habit tracker are already using the shared connection
- **THEN** the task-comment thread hook subscribes via the same existing connection rather than opening a second one, and closing the modal releases its hold without disconnecting the others

## ADDED Requirements

### Requirement: Comment thread hook follows modal mount state
The task-comment thread hook's Pusher subscription SHALL be acquired when a task's edit modal opens and released when that modal closes, independent of the Kanban board's and habit tracker's own acquire/release lifecycle.

#### Scenario: Closing the modal releases the comment hook's hold without affecting other panels
- **WHEN** the user closes a task's edit modal while the Kanban board and habit tracker remain open
- **THEN** the comment thread hook releases its hold on the shared connection, and the connection remains open because the other hooks still hold it

# realtime-connection

## Purpose

TBD - capability added by change add-realtime-kanban-habit-sync

## Requirements

### Requirement: One shared Pusher connection per open page
The extension SHALL maintain at most one Pusher connection per open `newtab` page, shared via reference counting among all data hooks that need it — the Kanban board's and habit tracker's hooks, which stay mounted for the page's lifetime, and the task-comment thread hook, which mounts only while a task's edit modal is open and unmounts when it closes. The connection SHALL stay open as long as at least one hook holds it, regardless of how many hooks are currently mounted.

#### Scenario: Page-lifetime panels share one connection
- **WHEN** a signed-in user has the `newtab` page open with both the habit tracker and the Kanban board rendered
- **THEN** only one Pusher connection exists for that page, used by both panels' data hooks

#### Scenario: Opening a task's comment thread joins the existing connection
- **WHEN** the user opens a task's edit modal while the Kanban board and habit tracker are already using the shared connection
- **THEN** the task-comment thread hook subscribes via the same existing connection rather than opening a second one, and closing the modal releases its hold without disconnecting the others

### Requirement: Comment thread hook follows modal mount state
The task-comment thread hook's Pusher subscription SHALL be acquired when a task's edit modal opens and released when that modal closes, independent of the Kanban board's and habit tracker's own acquire/release lifecycle.

#### Scenario: Closing the modal releases the comment hook's hold without affecting other panels
- **WHEN** the user closes a task's edit modal while the Kanban board and habit tracker remain open
- **THEN** the comment thread hook releases its hold on the shared connection, and the connection remains open because the other hooks still hold it

### Requirement: Connection lifecycle follows hook mount state
A hook's Pusher subscription SHALL be acquired when it mounts in an enabled (signed-in) state and released when it unmounts or becomes disabled, with the underlying connection disconnecting once no hook still holds it.

#### Scenario: Connection opens when the productivity page mounts signed in
- **WHEN** the `newtab` page renders the Kanban board and habit tracker for a signed-in user
- **THEN** a Pusher connection is established and subscribed to that user's private channel

#### Scenario: Connection closes when the last hook releases it
- **WHEN** all hooks holding the shared Pusher connection unmount or become disabled (e.g. the user signs out)
- **THEN** the underlying Pusher connection disconnects

### Requirement: Channel authorization with refresh-on-failure
Subscribing to the private channel SHALL authorize via the configured `/pusher/auth` endpoint using the current Supabase access token, and SHALL refresh the session and retry once if authorization fails with `401` or `403`.

#### Scenario: Authorization succeeds with a valid token
- **WHEN** a hook subscribes to `private-user-{userId}` with a valid, unexpired access token
- **THEN** the subscription succeeds

#### Scenario: Expired token is refreshed and retried
- **WHEN** channel authorization fails with `401` or `403` because the access token has expired
- **THEN** the session is refreshed and the authorization request is retried once with the new token

### Requirement: Reconnection triggers a backfill refetch
When a hook's Pusher connection (re)establishes after having previously been connected, the owning hook SHALL perform a full refetch, so changes missed while disconnected are not permanently lost.

#### Scenario: Reconnecting after a gap triggers a refetch
- **WHEN** the shared Pusher connection transitions to `connected` after a prior disconnect
- **THEN** each hook bound to that connection performs a full refetch of its data

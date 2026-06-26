## ADDED Requirements

### Requirement: One shared Pusher connection per open page
The extension SHALL maintain at most one Pusher connection per open `newtab` page, shared between the Kanban board's and habit tracker's data hooks via reference counting, even though both are mounted simultaneously on that page.

#### Scenario: Both panels share one connection
- **WHEN** a signed-in user has the `newtab` page open with both the habit tracker and the Kanban board rendered
- **THEN** only one Pusher connection exists for that page, used by both panels' data hooks

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

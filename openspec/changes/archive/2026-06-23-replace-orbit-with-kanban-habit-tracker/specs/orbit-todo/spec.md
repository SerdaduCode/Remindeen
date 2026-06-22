## REMOVED Requirements

### Requirement: Create orbit task
**Reason**: The orbit task-node feature is retired in favor of a Kanban board backed by Al-Quotes' `/tasks` API.
**Migration**: Use task creation in the new `kanban-tasks` capability. No data migration — existing local orbit tasks are not carried over.

### Requirement: Edit orbit task
**Reason**: Superseded by Kanban task editing.
**Migration**: Use task editing in `kanban-tasks`.

### Requirement: Delete orbit task
**Reason**: Superseded by Kanban task deletion.
**Migration**: Use task deletion in `kanban-tasks`.

### Requirement: Mark task complete with release animation
**Reason**: The orbit "release" animation has no equivalent concept in a Kanban board; completion is expressed as moving a task to the `Done` column, which is not a destructive/permanent action like orbit completion was.
**Migration**: Move the task to `Done` via `kanban-tasks`'s status workflow. Unlike orbit, the task is not deleted on completion.

### Requirement: Single focus task
**Reason**: "Focus" was an orbit-specific spatial concept (pinning a node to the center). It has no equivalent in a Kanban board or habit tracker.
**Migration**: None — there is no replacement concept in this change.

### Requirement: Reposition task via drag
**Reason**: Superseded by drag-and-drop reordering within a Kanban column.
**Migration**: Use manual ordering in `kanban-tasks`, which reorders within a status column rather than repositioning on a 2D orbit canvas.

### Requirement: Continuous radius-based orbital rotation
**Reason**: The orbit rendering and physics model is removed entirely; the Kanban board is a static column layout.
**Migration**: None — there is no replacement concept in this change.

### Requirement: Reduced motion and visibility handling
**Reason**: This requirement existed solely to control the orbit rotation animation, which no longer exists.
**Migration**: None — the Kanban board has no continuous animation to gate on reduced-motion or tab-visibility preferences.

### Requirement: Orbit stats line
**Reason**: Superseded by whatever summary view the Kanban board and habit tracker present natively (e.g. column counts), which is not a 1:1 replacement and is not separately specified by this change.
**Migration**: None specified in this change.

### Requirement: Persisted across sessions
**Reason**: Local persistence via `storage.defineItem` is replaced by server-side persistence via Al-Quotes' API.
**Migration**: Tasks and habits persist via `kanban-tasks` and `habit-tracking`, which store data server-side rather than in local extension storage, and additionally require an authenticated session (see `extension-auth`).

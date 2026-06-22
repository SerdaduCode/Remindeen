## ADDED Requirements

### Requirement: Create orbit task
Users SHALL be able to create a new orbit task with a title (required), an optional one-line note, and a free-pick color. New tasks SHALL be persisted and SHALL appear in the orbit view without requiring a page reload.

#### Scenario: Creating a task adds it to the orbit
- **WHEN** the user submits the create-task form with a title, optional note, and a chosen color
- **THEN** a new task is persisted and a corresponding node appears in the orbit view

#### Scenario: Title is required
- **WHEN** the user attempts to submit the create-task form with an empty title
- **THEN** the task is not created and a validation message is shown

### Requirement: Edit orbit task
Users SHALL be able to edit an existing task's title, note, and color. Edits SHALL be persisted and reflected immediately in the corresponding orbit node.

#### Scenario: Editing a task updates its node
- **WHEN** the user changes a task's title and saves
- **THEN** the task's stored title is updated and the orbit node displays the new title

### Requirement: Delete orbit task
Users SHALL be able to permanently delete a task. Deletion SHALL remove the task from storage and from the orbit view.

#### Scenario: Deleting a task removes its node
- **WHEN** the user deletes a task
- **THEN** the task is removed from storage and its node no longer renders in the orbit view

### Requirement: Mark task complete with release animation
Users SHALL be able to mark any task (focus or orbiting) as complete. On completion, the task's node SHALL play a release-from-orbit animation and then be permanently removed from storage. Completed tasks are not retained or recoverable.

#### Scenario: Completing an orbiting task
- **WHEN** the user marks a non-focus task as complete
- **THEN** its node plays the release animation and, after the animation, the task is removed from storage

#### Scenario: Completing the focus task
- **WHEN** the user marks the current focus task as complete
- **THEN** its node plays the release animation, the task is removed from storage, and no task remains marked as focus afterward

### Requirement: Single focus task
At most one task SHALL be marked as focus at any time. Setting a task as focus SHALL atomically unset the previous focus task (if any) and assign it a default orbit radius, while the newly focused task is pinned to the center (radius zero) and excluded from rotation.

#### Scenario: Setting a new focus swaps the previous one
- **WHEN** the user sets Task B as focus while Task A is currently the focus task
- **THEN** Task A is no longer marked as focus and is assigned a default orbit radius, and Task B becomes the focus task rendered at the center

#### Scenario: Unsetting focus
- **WHEN** the user unsets the current focus task without selecting a replacement
- **THEN** no task is marked as focus and the orbit view shows no center node

### Requirement: Reposition task via drag
Users SHALL be able to drag any non-focus orbiting task node to a new position. On drop, the task's stored radius and angle SHALL be updated to reflect the drop position relative to the orbit center, and its rotation SHALL continue smoothly from that position.

#### Scenario: Dragging a node updates its orbit
- **WHEN** the user drags an orbiting task node to a position closer to the center and releases it
- **THEN** the task's stored radius is updated to the smaller distance and the node's subsequent rotation originates from the drop angle

#### Scenario: Drag does not trigger click actions
- **WHEN** the user drags a task node by more than the click/drag movement threshold
- **THEN** releasing the pointer repositions the task and does not open the edit form or toggle focus

### Requirement: Continuous radius-based orbital rotation
Non-focus task nodes SHALL continuously rotate around the center. The angular speed of a task SHALL be inversely related to its radius, so tasks closer to the center visibly rotate faster than tasks farther away.

#### Scenario: Closer task rotates faster
- **WHEN** Task A has a smaller radius than Task B
- **THEN** Task A's angular position changes more per unit time than Task B's

#### Scenario: Focus task does not rotate
- **WHEN** a task is marked as focus
- **THEN** its rendered position remains fixed at the center and does not rotate

### Requirement: Reduced motion and visibility handling
The orbit view SHALL render all task positions statically (no rotation) when the user's OS/browser reports a reduced-motion preference. The orbit rotation loop SHALL pause while the newtab document is not visible and resume when it becomes visible again.

#### Scenario: Reduced motion preference disables rotation
- **WHEN** the user's system has `prefers-reduced-motion: reduce` enabled
- **THEN** task nodes are rendered at fixed positions and do not animate rotation

#### Scenario: Rotation pauses when tab is hidden
- **WHEN** the newtab document becomes hidden (e.g. user switches to another tab)
- **THEN** the orbit rotation loop stops updating positions until the document becomes visible again

### Requirement: Orbit stats line
The orbit view SHALL display a stats line showing the total number of active (non-completed) tasks and the title of the current focus task, if any.

#### Scenario: Stats line reflects task count and focus
- **WHEN** there are 5 active tasks and Task A is the focus task
- **THEN** the stats line shows a count of 5 active tasks and Task A's title as the focus

#### Scenario: No focus task
- **WHEN** no task is currently marked as focus
- **THEN** the stats line indicates that no task is in focus

### Requirement: Persisted across sessions
Orbit tasks (including title, note, color, radius, angle, and focus state) SHALL persist across browser/extension restarts and SHALL stay in sync if modified from another extension context.

#### Scenario: Tasks survive a browser restart
- **WHEN** the user creates a task, closes the browser, and reopens it
- **THEN** the task still appears in the orbit view with the same title, note, color, and position

#### Scenario: Cross-context sync
- **WHEN** an orbit task is modified from one extension context (e.g. another open newtab)
- **THEN** the currently open newtab's orbit view reflects the change without requiring a manual refresh

## ADDED Requirements

### Requirement: Toggle task priority

Users SHALL be able to mark or unmark any existing task as priority from the edit form. Toggling priority SHALL move the task to a collision-free orbit slot on the corresponding side of the priority ring boundary (inside the ring when marked priority, outside the ring when unmarked), without affecting any other task's priority state.

#### Scenario: Marking a task as priority

- **WHEN** the user toggles priority on for an orbiting, non-focus task
- **THEN** the task's priority flag becomes true and it is assigned a collision-free orbit slot inside the priority ring boundary

#### Scenario: Unmarking a task as priority

- **WHEN** the user toggles priority off for a task currently marked priority
- **THEN** the task's priority flag becomes false and it is assigned a collision-free orbit slot outside the priority ring boundary

#### Scenario: New tasks are not priority by default

- **WHEN** the user creates a new task
- **THEN** the created task's priority flag is false and it is placed outside the priority ring boundary

### Requirement: Priority ring visual boundary

The orbit view SHALL render a visual ring boundary, scaled to the current canvas size, marking the separation between the inner priority band and the outer normal band. The boundary's rotation animation SHALL run independently of per-task orbital physics and SHALL respect the user's reduced-motion preference.

#### Scenario: Ring scales with canvas size

- **WHEN** the orbit canvas container is resized
- **THEN** the ring boundary's radius is recalculated proportionally to the new canvas size

#### Scenario: Ring respects reduced motion

- **WHEN** the user's system has `prefers-reduced-motion: reduce` enabled
- **THEN** the ring boundary renders without its rotation animation

## MODIFIED Requirements

### Requirement: Single focus task

At most one task SHALL be marked as focus at any time. Setting a task as focus SHALL atomically unset the previous focus task (if any) and assign it a default orbit radius on the side of the priority ring boundary matching that task's own priority flag, while the newly focused task is pinned to the center (radius zero) and excluded from rotation.

#### Scenario: Setting a new focus swaps the previous one

- **WHEN** the user sets Task B as focus while Task A is currently the focus task
- **THEN** Task A is no longer marked as focus and is assigned a default orbit radius on the side of the priority ring matching Task A's own priority flag, and Task B becomes the focus task rendered at the center

#### Scenario: Unsetting focus

- **WHEN** the user unsets the current focus task without selecting a replacement
- **THEN** no task is marked as focus and the orbit view shows no center node

#### Scenario: Releasing a priority focus task returns it inside the ring

- **WHEN** the user unsets focus on a task whose priority flag is true
- **THEN** the released task is assigned a collision-free orbit slot inside the priority ring boundary

#### Scenario: Releasing a non-priority focus task returns it outside the ring

- **WHEN** the user unsets focus on a task whose priority flag is false
- **THEN** the released task is assigned a collision-free orbit slot outside the priority ring boundary

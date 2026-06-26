## ADDED Requirements

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

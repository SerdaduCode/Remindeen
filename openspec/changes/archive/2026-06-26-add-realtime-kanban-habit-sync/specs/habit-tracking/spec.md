## ADDED Requirements

### Requirement: Habit tracker reflects realtime habit changes
The habit tracker SHALL reflect Habit changes received over the realtime channel — created, updated, deleted, and check-ins — without requiring a manual refresh, applying each change idempotently by habit (or check-in) id so a change the tracker's own action just made is not duplicated.

#### Scenario: A check-in recorded elsewhere updates the tracker
- **WHEN** a habit check-in is recorded via the MCP API (or another device) while the habit tracker is open
- **THEN** that habit is shown as completed for the current period without the user refreshing

#### Scenario: A habit created elsewhere appears in the tracker
- **WHEN** a habit is created via the API (or another device) while the habit tracker is open
- **THEN** the habit appears in the list without the user refreshing

#### Scenario: A habit deleted elsewhere disappears from the tracker
- **WHEN** a habit is deleted via the API (or another device) while the habit tracker is open
- **THEN** the habit and its entry are removed from the tracker without the user refreshing

#### Scenario: The tracker's own check-in does not produce a duplicate entry
- **WHEN** the user checks in a habit through the tracker's own UI
- **THEN** the corresponding realtime event for that same check-in does not result in a duplicate check-in entry

## ADDED Requirements

### Requirement: Fourth Productivity column
Page 2 (the Productivity view) SHALL render a fourth column, to the right of the Today/Recent Activity column, containing widgets not related to Kanban or browsing stats — starting with the Week Summary widget.

#### Scenario: Viewing Page 2 on a wide viewport
- **WHEN** a signed-in user views Page 2 on a viewport wide enough to fit four columns
- **THEN** a fourth column renders to the right of the Today/Recent Activity column, containing the Week Summary widget

#### Scenario: Viewing Page 2 on a narrow viewport
- **WHEN** a signed-in user views Page 2 on a viewport too narrow to fit four columns side by side
- **THEN** the fourth column stacks vertically along with the other columns instead of causing horizontal scrolling

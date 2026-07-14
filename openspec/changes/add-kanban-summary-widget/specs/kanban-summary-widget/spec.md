## ADDED Requirements

### Requirement: Summary counts are derived from the current task list
The system SHALL display, for the signed-in user's current Kanban tasks, the total task count, the count of tasks with `status: DONE`, and the count of tasks whose `dueDate` falls within the current calendar week — computed entirely from the client's already-loaded task list, without any additional network request.

#### Scenario: Displaying totals
- **WHEN** the signed-in user's Kanban tasks are loaded and rendered
- **THEN** the summary panel shows the total count, the done count, and the count of tasks due within the current week, matching the loaded task list without a separate fetch

### Requirement: Status distribution bar
The system SHALL render a three-segment bar reflecting the proportion of tasks in `TODO`, `DOING`, and `DONE` status, each segment's width proportional to that status's share of the total task count.

#### Scenario: Rendering the distribution bar
- **WHEN** the summary panel is displayed with tasks split across the three statuses
- **THEN** each segment's width is that status's count divided by the total task count

#### Scenario: No tasks
- **WHEN** the signed-in user has zero Kanban tasks
- **THEN** the summary panel renders without error, showing zero counts and empty/zero-width bar segments

### Requirement: Priority breakdown
The system SHALL display a count of tasks per priority level (High, Medium, Low) among the currently loaded tasks.

#### Scenario: Displaying priority counts
- **WHEN** the summary panel is displayed
- **THEN** it shows the count of tasks at each of the High, Medium, and Low priority levels

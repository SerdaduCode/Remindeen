## ADDED Requirements

### Requirement: Task completion ring
The system SHALL display a ring chart showing the percentage of the signed-in user's Kanban tasks with `status: DONE` out of their total task count, computed from the already-loaded task list without an additional network request.

#### Scenario: Displaying task completion
- **WHEN** the signed-in user's Kanban tasks are loaded
- **THEN** the ring chart shows `doneTasks / totalTasks * 100`, rounded to the nearest whole percent

#### Scenario: No tasks
- **WHEN** the signed-in user has zero Kanban tasks
- **THEN** the ring chart shows 0% without error

### Requirement: Habit consistency ring
The system SHALL display a ring chart showing the average weekly completion rate across the signed-in user's habits, where each habit's rate is its completed check-ins this week divided by its scheduled check-in periods this week.

#### Scenario: Displaying habit consistency
- **WHEN** the signed-in user's habits and this week's check-ins are loaded
- **THEN** the ring chart shows the unweighted average of each habit's weekly completion rate, rounded to the nearest whole percent

#### Scenario: No habits
- **WHEN** the signed-in user has zero habits
- **THEN** the ring chart shows 0% without error

### Requirement: Build/quit habit split is not yet available
The system SHALL NOT display a build-vs-quit habit consistency breakdown until a habit type field exists to distinguish them; only the combined habit consistency ring (see above) is shown.

#### Scenario: No type field available
- **WHEN** the Week Summary widget is displayed
- **THEN** it shows only the two ring charts (task completion, combined habit consistency) and no build/quit split bars

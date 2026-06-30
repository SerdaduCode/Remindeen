## MODIFIED Requirements

### Requirement: Side-by-side panel arrangement
The Kanban board and left column SHALL render side by side: the left column as a narrow, compact column containing two stacked glass panels (HabitTracker on top, CalendarView below); the Kanban panel as a wide column containing its three status sub-sections (To Do, Doing, Done).

#### Scenario: Viewing Page 2 on a wide viewport
- **WHEN** a signed-in user views Page 2 on a viewport wide enough to fit both columns
- **THEN** the left column (HabitTracker + CalendarView stacked) and the Kanban panel render side by side, with the Kanban panel occupying more horizontal space

#### Scenario: Viewing Page 2 on a narrow viewport
- **WHEN** a signed-in user views Page 2 on a viewport too narrow to fit both columns side by side
- **THEN** the left column panels and the Kanban panel stack vertically instead of overlapping or causing horizontal scrolling

#### Scenario: Both left-column panels are visible simultaneously
- **WHEN** a signed-in user navigates to Page 2
- **THEN** both the HabitTracker panel and the CalendarView panel are visible in the left column without requiring any tab or toggle

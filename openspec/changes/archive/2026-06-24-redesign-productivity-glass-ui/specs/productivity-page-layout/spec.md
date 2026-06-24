## ADDED Requirements

### Requirement: Simultaneous Kanban and Habit display
Page 2 (the Productivity view) SHALL display the Kanban board and the Habit list simultaneously, with no tab control to switch between them. Both SHALL be visible and interactive at the same time for a signed-in user.

#### Scenario: Page 2 loads while signed in
- **WHEN** a signed-in user navigates to Page 2
- **THEN** both the Kanban board and the Habit list are visible at the same time, with no tab or toggle control required to see either one

### Requirement: Side-by-side panel arrangement
The Kanban board and Habit list SHALL render as two distinct panels positioned side by side: the Habit panel as a narrow, compact column; the Kanban panel as a wide column containing its three status sub-sections (To Do, Doing, Done).

#### Scenario: Viewing Page 2 on a wide viewport
- **WHEN** a signed-in user views Page 2 on a viewport wide enough to fit both panels
- **THEN** the Habit panel and Kanban panel render side by side, with the Kanban panel occupying more horizontal space than the Habit panel

#### Scenario: Viewing Page 2 on a narrow viewport
- **WHEN** a signed-in user views Page 2 on a viewport too narrow to fit both panels side by side
- **THEN** the Habit panel and Kanban panel stack vertically instead of overlapping or causing horizontal scrolling

### Requirement: Shared background image with Home page
Page 2 SHALL render the same background photo as Page 1 (Home), sourced from a single shared fetch rather than each page independently selecting its own image.

#### Scenario: Opening a new tab
- **WHEN** the newtab page loads and a background photo is fetched
- **THEN** the same photo renders behind both Page 1 and Page 2 for that newtab session

### Requirement: Skeleton loading state
While Kanban tasks or Habit data is being fetched, Page 2 SHALL show skeleton placeholders shaped like the eventual content (column outlines with card-shaped placeholders for Kanban; stacked row-shaped placeholders for Habit) instead of plain loading text or a generic spinner.

#### Scenario: Initial data fetch in progress
- **WHEN** a signed-in user navigates to Page 2 and the Kanban tasks or Habit data has not yet finished loading
- **THEN** the corresponding panel shows shimmering, layout-shaped skeleton placeholders instead of plain loading text

#### Scenario: Data fetch completes
- **WHEN** the Kanban tasks or Habit data finishes loading
- **THEN** the skeleton placeholders for that panel are replaced by the real content (or its empty state, if there is no data)

### Requirement: Glass visual treatment
The Kanban panel, Habit panel, the sign-in prompt, and the task/habit form modals SHALL use a translucent glass visual treatment (background blur, translucent fill, subtle border ring) consistent with the existing search bar's glass styling, so they read clearly over the shared background photo.

#### Scenario: Panels rendered over the background photo
- **WHEN** Page 2 is displayed with the shared background photo behind it
- **THEN** the Kanban panel and Habit panel are visually distinguishable from the photo via a translucent, blurred surface rather than a fully opaque or fully invisible background

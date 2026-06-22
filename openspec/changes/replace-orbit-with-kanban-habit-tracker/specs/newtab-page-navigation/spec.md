## MODIFIED Requirements

### Requirement: Two-page paged container
The newtab entrypoint SHALL render exactly two pages in a horizontally paged container: Page 1 (existing Prayers/Time, Verse, SearchBar content, unchanged) and Page 2 (the Productivity view, containing Kanban and Habit tabs). Only one page SHALL be the active/visible page at a time.

#### Scenario: Newtab opens on Page 1
- **WHEN** the user opens a new tab
- **THEN** Page 1 (Prayers/Time, Verse, SearchBar) is shown as the active page and Page 2 is not visible

#### Scenario: Page 2 shows the Productivity view
- **WHEN** the user navigates to Page 2
- **THEN** the Productivity view is shown, containing Kanban and Habit tabs, instead of the previous orbit view

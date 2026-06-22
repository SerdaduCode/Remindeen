## ADDED Requirements

### Requirement: Task category assignment

Every orbit task SHALL always have an assigned category. Tasks created or edited without an explicit category choice SHALL be assigned the built-in default category.

#### Scenario: New task without explicit category gets the default

- **WHEN** the user creates a task without selecting a category
- **THEN** the task's category is set to the built-in default category

#### Scenario: User assigns a specific category

- **WHEN** the user selects an existing category while creating or editing a task
- **THEN** the task's persisted category is updated to the selected category

### Requirement: Create category inline from the task form

Users SHALL be able to create a new category (name and color) directly from the task create/edit form, without leaving it. The newly created category SHALL be immediately selected for the task being edited.

#### Scenario: Quick-creating a category while editing a task

- **WHEN** the user enters a name and color in the inline create-category control while editing a task and confirms
- **THEN** a new category is persisted and the task being edited is assigned that category

### Requirement: Manage categories

Users SHALL be able to view all categories, rename them, change their color, and delete them from a dedicated category management surface. The built-in default category SHALL NOT be deletable.

#### Scenario: Renaming a category

- **WHEN** the user changes a category's name in the management surface and saves
- **THEN** the category's persisted name is updated and reflected wherever the category is shown

#### Scenario: Changing a category's color

- **WHEN** the user changes a category's color in the management surface and saves
- **THEN** the category's persisted color is updated

#### Scenario: Deleting a category reassigns its tasks

- **WHEN** the user deletes a category that has tasks assigned to it
- **THEN** the category is removed from storage and every task that referenced it is reassigned to the default category

#### Scenario: Default category cannot be deleted

- **WHEN** the user attempts to delete the built-in default category
- **THEN** the deletion is prevented and the default category remains

### Requirement: Category filter selection

The orbit view SHALL display a filter control listing "All" plus one entry for every existing category. Category entries SHALL be independently toggleable, so more than one category can be active as a filter at the same time. The set of selected filters SHALL persist across browser/extension restarts.

#### Scenario: Selecting a category filter persists across sessions

- **WHEN** the user selects one or more categories as the active filter, then closes and reopens the newtab page
- **THEN** the same categories remain selected as the active filter

#### Scenario: Selecting multiple categories filters by all of them

- **WHEN** the user has two categories selected as active filters
- **THEN** tasks belonging to either selected category are treated as matching the filter, and all other tasks are dimmed

#### Scenario: Deleting a category removes it from the active filter

- **WHEN** a category currently included in the active filter is deleted via the management surface
- **THEN** that category is removed from the active filter selection, leaving any other selected categories active (or reverting to "All" if none remain selected)

### Requirement: Filtered-out tasks are dimmed, not hidden

When the active filter has at least one category selected, tasks whose category is not among the selected categories SHALL remain visible and continue orbiting at their current position, but SHALL render at a reduced size, without their title/note label, and SHALL NOT respond to click or drag interaction. The current focus task SHALL always render at full size, with its label, and remain interactive regardless of the active filter.

#### Scenario: Non-matching task is dimmed but keeps orbiting

- **WHEN** one or more categories are selected as the active filter and a non-focus task's category is not among them
- **THEN** that task renders smaller, without its label, does not respond to pointer interaction, and continues rotating in its orbit

#### Scenario: Focus task is exempt from dimming

- **WHEN** one or more categories are selected as the active filter and the current focus task's category is not among them
- **THEN** the focus task still renders at full size, with its label, and remains interactive

#### Scenario: Switching the filter back to All restores full visibility

- **WHEN** the user changes the active filter to "All"
- **THEN** previously dimmed tasks animate back to full size, with their label restored and interaction re-enabled

# newtab-page-navigation

## Purpose

TBD - added by add-orbit-todo-page

## Requirements

### Requirement: Two-page paged container
The newtab entrypoint SHALL render exactly two pages in a horizontally paged container: Page 1 (existing Prayers/Time, Verse, SearchBar content, unchanged) and Page 2 (the orbit todo view). Only one page SHALL be the active/visible page at a time.

#### Scenario: Newtab opens on Page 1
- **WHEN** the user opens a new tab
- **THEN** Page 1 (Prayers/Time, Verse, SearchBar) is shown as the active page and Page 2 is not visible

### Requirement: Page navigation controls
The paged container SHALL provide dot indicators (one per page, with the active page visually distinguished) and previous/next arrow controls that switch the active page when activated.

#### Scenario: Switching pages via dot indicator
- **WHEN** the user clicks the dot indicator for Page 2 while Page 1 is active
- **THEN** Page 2 becomes the active page and its dot indicator is shown as active

#### Scenario: Switching pages via arrow control
- **WHEN** the user clicks the "next" arrow control while Page 1 is active
- **THEN** Page 2 becomes the active page

#### Scenario: No-op at boundary
- **WHEN** the user clicks the "previous" arrow control while Page 1 (the first page) is active
- **THEN** the active page remains Page 1

### Requirement: Keyboard page navigation
The paged container SHALL switch the active page in response to `ArrowLeft` and `ArrowRight` keydown events when no text input or editable field is focused.

#### Scenario: Navigate with ArrowRight
- **WHEN** the user presses `ArrowRight` while Page 1 is active and no input field has focus
- **THEN** Page 2 becomes the active page

#### Scenario: Keyboard navigation ignored while typing
- **WHEN** the user presses `ArrowRight` while focus is inside the search bar text input
- **THEN** the active page does not change

### Requirement: Animated page transition
Switching the active page SHALL animate with a horizontal slide transition rather than an instant cut.

#### Scenario: Slide transition on page change
- **WHEN** the active page changes from Page 1 to Page 2
- **THEN** the container visually slides horizontally to reveal Page 2 instead of switching instantly

# events Specification

## Purpose
UI for creating, viewing, editing, and deleting calendar events from the CalendarView panel on the Productivity page.

## Requirements

### Requirement: View events on a mini calendar
The Productivity page left column SHALL include a CalendarView panel that renders a monthly mini calendar grid. Days that have at least one event SHALL be marked with a visual indicator (dot). The user SHALL be able to navigate between months using previous/next controls.

#### Scenario: Days with events show a dot indicator
- **WHEN** the authenticated user has an event on July 4
- **THEN** the day cell for July 4 in the mini calendar shows a dot indicator

#### Scenario: Navigate to previous and next months
- **WHEN** the user clicks the previous or next month control
- **THEN** the calendar grid updates to show the selected month

### Requirement: Select a day to view its events
Clicking a day in the mini calendar SHALL select that day and display a list of the user's events for that day, sorted by start time, below or alongside the calendar grid.

#### Scenario: Selecting a day shows its events
- **WHEN** the user clicks on July 4 in the mini calendar and has two events on that day
- **THEN** the event list below the calendar shows those two events sorted by start time

#### Scenario: Selecting a day with no events shows an empty state
- **WHEN** the user clicks on a day with no events
- **THEN** the event list shows an empty state with an option to add an event

### Requirement: Create an event from the calendar
The user SHALL be able to create a new event by clicking an "Add Event" control on the selected day, which opens EventFormModal pre-filled with that day's date.

#### Scenario: Opening the create form pre-fills the date
- **WHEN** the user clicks "Add Event" with July 4 selected
- **THEN** EventFormModal opens in create mode with the date field pre-filled to July 4

#### Scenario: Creating an event adds it to the calendar
- **WHEN** the user submits EventFormModal with a title, date, and start time
- **THEN** the event is persisted via `POST /events` and the selected day's event list reflects it without a page reload

### Requirement: Edit an event
Clicking an event in the day event list SHALL open EventFormModal pre-filled with that event's data for editing.

#### Scenario: Editing an event updates the calendar
- **WHEN** the user edits an event's title in EventFormModal and saves
- **THEN** the event is updated via `PATCH /events/:id` and the event list reflects the new title

### Requirement: Delete an event
EventFormModal SHALL provide a delete action (with inline confirmation per the delete-confirmation-modal change) for existing events.

#### Scenario: Deleting an event removes it from the calendar
- **WHEN** the user confirms deletion of an event in EventFormModal
- **THEN** the event is removed via `DELETE /events/:id` and no longer appears in the day event list

### Requirement: EventFormModal fields
EventFormModal SHALL include: title (required), date (required, `YYYY-MM-DD` date input), start time (required, `HH:MM` time input), end time (optional), location (optional), recurrence select (None / Daily / Weekly / Monthly; Weekly shows a day-of-week picker), and a "Sync to Calendar" toggle (default on, disabled with hint when Google Calendar is not connected).

#### Scenario: Submit with required fields only
- **WHEN** the user provides a title, date, and start time and submits
- **THEN** the event is persisted with those fields; `endAt`, `location`, and `rrule` are omitted

#### Scenario: Recurring weekly event with day selection
- **WHEN** the user selects Weekly recurrence and checks Monday and Friday
- **THEN** the event is persisted with `isRecurring: true` and `rrule: "RRULE:FREQ=WEEKLY;BYDAY=MO,FR"`

#### Scenario: Title is required
- **WHEN** the user submits EventFormModal without a title
- **THEN** the event is not submitted and a validation message is shown

### Requirement: Real-time event list updates
The CalendarView event list SHALL reflect `event.created`, `event.updated`, and `event.deleted` Pusher events for the authenticated user without requiring a manual refresh, applying each idempotently by event id.

#### Scenario: An event created elsewhere appears in the list
- **WHEN** an event is created for the selected day via another device or the MCP API
- **THEN** the event appears in the day's event list without the user refreshing

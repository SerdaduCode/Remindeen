## ADDED Requirements

### Requirement: Connecting Google Calendar is a separate, opt-in action
The system SHALL offer connecting Google Calendar as an action distinct from base sign-in, requiring an explicit user action, and SHALL NOT request Calendar scope as part of the base sign-in flow.

#### Scenario: Calendar scope is never requested during base sign-in
- **WHEN** a user signs in via the existing "Sign in with Google" action
- **THEN** the OAuth consent screen does not request `https://www.googleapis.com/auth/calendar.events`

#### Scenario: User initiates calendar connection
- **WHEN** a signed-in user clicks "Connect Google Calendar"
- **THEN** the system initiates a separate OAuth flow requesting `https://www.googleapis.com/auth/calendar.events` with offline access and forced consent

### Requirement: Google refresh token is relayed, not stored locally
The system SHALL relay the Google refresh token obtained during the calendar connection flow to al-quotes immediately, and SHALL NOT persist it in extension storage at any point.

#### Scenario: Successful connection relays the token
- **WHEN** the calendar connection OAuth flow completes and Google returns a refresh token
- **THEN** the system sends that refresh token to al-quotes in the same flow, and does not write it to `storage.local` or any other persisted store

#### Scenario: No refresh token returned
- **WHEN** the calendar connection OAuth flow completes but Google does not return a refresh token
- **THEN** the system reports a failure to the user rather than treating the connection as successful

### Requirement: Connection status reflects the server, not a local flag
The system SHALL determine whether a user's calendar is connected by querying al-quotes, not by remembering a local flag from a past successful connection.

#### Scenario: Status reflects a connection made elsewhere
- **WHEN** a user has connected their calendar from another device or session
- **THEN** opening the extension's calendar settings shows it as connected, without the user reconnecting from this device

### Requirement: Disconnecting a connected calendar
The system SHALL allow a user with a connected calendar to disconnect it.

#### Scenario: User disconnects
- **WHEN** a user with a connected calendar clicks "Disconnect"
- **THEN** the system requests al-quotes to remove the link, and the UI reflects a disconnected state on success

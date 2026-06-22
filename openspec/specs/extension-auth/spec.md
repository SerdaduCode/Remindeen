# extension-auth

## Purpose

TBD - added by replace-orbit-with-kanban-habit-tracker

## Requirements

### Requirement: Sign in with Google via Supabase
Users SHALL be able to sign in using their Google account. The flow SHALL be initiated via `chrome.identity.launchWebAuthFlow` from the extension's background service worker and SHALL complete a Supabase OAuth session exchange.

#### Scenario: Successful sign-in
- **WHEN** the user clicks "Sign in with Google" from a sign-in prompt
- **THEN** the background service worker completes the OAuth flow and a valid Supabase session is stored

#### Scenario: User cancels the OAuth flow
- **WHEN** the user closes the Google account picker without completing sign-in
- **THEN** no session is stored and the sign-in prompt remains shown

### Requirement: Session is shared across all extension contexts
The authenticated session SHALL be persisted in extension storage by the background script and SHALL be readable and watchable by every other extension context (newtab, popup, sidepanel) without each context independently performing its own sign-in.

#### Scenario: Session appears in a newly opened newtab
- **WHEN** the user signs in from the sidepanel and then opens a new tab
- **THEN** the newtab page reads the same stored session and shows the user as signed in

#### Scenario: Sign-out propagates to all open contexts
- **WHEN** the user signs out from any one context
- **THEN** all other currently open extension contexts observe the session removal via storage watch and reflect signed-out state without a manual refresh

### Requirement: Expired access token is refreshed on demand
When an authenticated request to `/tasks` or `/habits` receives a `401` response, the client SHALL attempt to refresh the session using the stored refresh token and retry the original request once before treating the user as signed out.

#### Scenario: Transparent refresh on an expired token
- **WHEN** a request to `/tasks` returns `401` because the access token has expired
- **THEN** the client refreshes the session via the stored refresh token, retries the request once, and the original action completes successfully if the refresh succeeds

#### Scenario: Refresh failure forces sign-out
- **WHEN** a `401` response is received and the subsequent refresh attempt also fails
- **THEN** the stored session is cleared and the user is shown the sign-in prompt

### Requirement: Sign out clears the stored session
Users SHALL be able to sign out. Signing out SHALL remove the stored Supabase session from extension storage.

#### Scenario: Signing out removes access
- **WHEN** the user clicks "Sign out"
- **THEN** the stored session is cleared and subsequent attempts to view the Kanban or Habit tab show the sign-in prompt

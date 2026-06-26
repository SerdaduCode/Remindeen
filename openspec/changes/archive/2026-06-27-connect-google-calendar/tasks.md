## 1. Background OAuth flow

- [x] 1.1 Add `auth:connectCalendar` message handling in `entrypoints/background.ts`, mirroring `handleSignIn`'s `launchWebAuthFlow`/`exchangeCodeForSession` shape
- [x] 1.2 Request `https://www.googleapis.com/auth/calendar.events` scope with `access_type: 'offline'` and `prompt: 'consent'` in the `signInWithOAuth` call
- [x] 1.3 Extract `provider_refresh_token` from the exchanged session; if absent, return a failure result instead of proceeding
- [x] 1.4 POST the refresh token to al-quotes' `POST /auth/google-calendar` using the current Supabase access token for auth; do not write the refresh token to any storage

## 2. Connect/disconnect UI

- [x] 2.1 Add `hooks/use-calendar-connection.ts`: fetches connection status from al-quotes' `GET /auth/google-calendar` on mount, exposes `connect()` (sends `auth:connectCalendar` to background) and `disconnect()` (calls `DELETE /auth/google-calendar`)
- [x] 2.2 Add a "Connect Google Calendar" / "Disconnect" control in Settings, wired to the hook
- [x] 2.3 Show a clear error state if connection fails (e.g. no refresh token returned, network failure)

## 3. Verification

- [x] 3.1 Manually verify: connecting requests the `calendar.events` scope and completes the relay to al-quotes
- [x] 3.2 Manually verify: base "Sign in with Google" still requests only `email`/`profile` scope, unaffected by this change
- [x] 3.3 Manually verify: disconnecting updates the UI to a disconnected state
- [x] 3.4 Manually verify: reopening the extension after connecting from a fresh profile/device shows the correct connected state (status comes from the server, not a local flag)

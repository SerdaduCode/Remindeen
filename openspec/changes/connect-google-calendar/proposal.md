## Why

The extension's existing Google sign-in only requests `userinfo.email`/`userinfo.profile` scope — it has no Google Calendar access, and never will, by design: forcing every signing-in user through a Calendar consent screen would be invasive for a scope most won't use. al-quotes has a paired change (`add-google-calendar-sync`) that lets a user link their Google Calendar and syncs Task/Habit changes to it via n8n, but it needs a Google refresh token to do so. This change is the piece that obtains that token from the user, opt-in, and hands it to al-quotes.

## What Changes

- Add an explicit, separate "Connect Google Calendar" action (e.g. a button in Settings) — distinct from the base sign-in flow — that requests the additional `https://www.googleapis.com/auth/calendar.events` scope with offline access.
- Add a new background message type, `auth:connectCalendar`, handled in `entrypoints/background.ts` following the same `launchWebAuthFlow` + `exchangeCodeForSession` pattern as the existing `auth:signIn`/`handleSignIn`, but requesting the Calendar scope and forcing re-consent (`prompt: 'consent'`) so Google returns a refresh token.
- Unlike the base sign-in flow, this flow extracts the Google `provider_refresh_token` from the exchanged session and POSTs it once to al-quotes' `POST /auth/google-calendar` — the token is relayed through, never persisted in extension storage.
- Add connect/disconnect UI state: whether the user's calendar is currently linked (queried from al-quotes), and a "Disconnect" action calling `DELETE /auth/google-calendar`.
- **BREAKING for nothing existing** — the base `auth:signIn` flow, its scopes, and `stores/auth.ts`'s `toAuthSession` are untouched.

**Out of scope for this change**: anything al-quotes does with the refresh token once received (covered by the paired al-quotes change); building the n8n workflow (separate, manual); any UI inside Remindeen for viewing synced Calendar events.

## Capabilities

### New Capabilities
- `calendar-connection`: the opt-in Google Calendar consent flow, refresh-token relay, and connect/disconnect UI state.

### Modified Capabilities
(none — `extension-auth`'s base sign-in requirements are unchanged; this is an additive, separate flow.)

## Impact

- `entrypoints/background.ts`: new `auth:connectCalendar` message handler alongside the existing `auth:signIn` handler.
- New hook, e.g. `hooks/use-calendar-connection.ts`: exposes connect/disconnect actions and current linked status to UI.
- New UI entry point in Settings for "Connect Google Calendar" / "Disconnect".
- `lib/api.ts` (or a new small client): calls to al-quotes' `GET /auth/google-calendar` (status), `POST /auth/google-calendar` (link), `DELETE /auth/google-calendar` (unlink).
- Depends on al-quotes' `add-google-calendar-sync` change for `POST`/`GET`/`DELETE /auth/google-calendar` to exist — like `add-realtime-kanban-habit-sync` depended on al-quotes' `add-realtime-task-habit-events`, this change has no effect until the al-quotes side is implemented and deployed.

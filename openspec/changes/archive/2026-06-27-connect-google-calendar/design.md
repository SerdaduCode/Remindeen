## Context

`entrypoints/background.ts`'s `handleSignIn` is the existing template: it must run in the background service worker (not a UI context, since `newtab`/`popup`/`sidepanel` documents can be torn down mid-flow and would abandon `launchWebAuthFlow` partway through). It calls `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo, skipBrowserRedirect: true } })` to get an authorization URL, opens it via `browser.identity.launchWebAuthFlow`, extracts the `code` query param from the redirect, and exchanges it via `supabase.auth.exchangeCodeForSession(code)`.

That existing flow requests no extra scopes beyond Supabase's provider-level default (`email`, `profile`), and `stores/auth.ts`'s `toAuthSession` only persists Supabase's own `access_token`/`refresh_token`/`user` — it never looks at the Google-specific `provider_token`/`provider_refresh_token` fields that `exchangeCodeForSession`'s response also carries when extra scopes are requested.

Google only returns a refresh token on the *first* consent for a given scope set, or when `prompt: 'consent'` forces re-consent. Supabase does not refresh Google's provider token on its own — that's why al-quotes (not this extension) owns refreshing and storing it long-term. This extension's job ends at handing the refresh token over once.

## Goals / Non-Goals

**Goals:**
- Add a calendar-scoped consent flow, separate from base sign-in, that's opt-in per user.
- Relay the Google refresh token to al-quotes exactly once per connect action, without ever writing it to extension storage.
- Surface connect/disconnect state in the UI.

**Non-Goals:**
- Changing base sign-in scopes or session handling.
- Any retry/offline handling for the relay POST beyond what a normal API call already gets (this is a user-initiated, synchronous action — if it fails, the user sees an error and can retry the button).
- Building any UI to view synced Calendar events.

## Decisions

### A new message type, not a parameter on the existing one

`auth:connectCalendar` is added as its own message type rather than a `scopes` parameter on `auth:signIn`, because the two flows have materially different semantics: sign-in establishes/refreshes the base session and can happen any number of times silently; connecting the calendar is a deliberate, consent-heavy action that should only run when the user explicitly asks, and forces `prompt: 'consent'` (which would be an unwanted extra click if bundled into ordinary sign-in).

```
// entrypoints/background.ts
async function handleConnectCalendar(): Promise<ConnectResult> {
  const redirectTo = browser.identity.getRedirectURL();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
      scopes: 'https://www.googleapis.com/auth/calendar.events',
      queryParams: { access_type: 'offline', prompt: 'consent' },
    },
  });
  // ...same launchWebAuthFlow + exchangeCodeForSession shape as handleSignIn...

  const refreshToken = exchanged.session.provider_refresh_token;
  if (!refreshToken) {
    return { ok: false, error: 'No refresh token returned by Google' };
  }

  // Relay only — never persisted locally.
  await postGoogleCalendarLink(refreshToken, exchanged.session.access_token);
  return { ok: true };
}
```

The existing Supabase *session* from this exchange (its `access_token`/`refresh_token`) is discarded — the user is presumably already signed in via the base flow; this exchange only matters for its `provider_refresh_token`. If the user is not already signed in, the relay call would fail for lack of a valid JWT, which is an acceptable edge case to surface as "sign in first."

### Relay happens immediately, synchronously, from the background script

The POST to al-quotes happens inside `handleConnectCalendar` itself, before returning a result to the calling UI — there's no intermediate "store it locally, sync later" step, because the entire point is to never let the refresh token rest in extension storage even transiently. If the POST fails, the whole connect action reports failure and the user can retry.

### Connect/disconnect status: fetched, not cached

A new hook (e.g. `hooks/use-calendar-connection.ts`) fetches current status from al-quotes' `GET /auth/google-calendar` (`{ connected: boolean, calendarId?: string }`) on mount, rather than persisting a local "connected" flag, so the UI reflects the server's actual state (e.g. if disconnected from another device, or never successfully linked despite a past attempt).

## Risks / Trade-offs

- **Depends on al-quotes' `add-google-calendar-sync` shipping first** → This change is inert (and its status hook has nothing to call) until that change is implemented and deployed.
- **`provider_refresh_token` briefly exists in memory in the background script** → Mitigation: it's never written to `storage.local` or any persisted store, only held in a local variable for the duration of the POST; same trust boundary as the access token already passed around during the existing sign-in exchange.
- **User could click "Connect" without being signed in first** → Mitigation: the relay POST requires a valid Supabase JWT; if missing, the action fails with a clear error rather than silently doing nothing.

## Open Questions

- Should "Disconnect" also be offered as a consequence of sign-out (i.e. does signing out of the base session implicitly disconnect the calendar too)? Leaning no — they're independent — but not decided here.

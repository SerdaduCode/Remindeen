## Why

The Kanban board and habit tracker (rendered on the `newtab` page) only fetch Task/Habit data once on mount. When al-quotes' paired change (`add-realtime-task-habit-events`) starts publishing Pusher events on Task/Habit mutations — whether from this extension, another device, or an MCP agent acting on the user's behalf — an already-open newtab has no way to receive them until the user manually refreshes or reopens the tab.

## What Changes

- Add a `pusher-js` client subscription directly in `hooks/use-tasks.ts` and `hooks/use-habits.ts` (the `newtab` page context), not in `background.ts`. **Revised during implementation**: `pusher-js`'s web build calls `window.Pusher = ...` at module-load time with no environment guard, which throws immediately in an MV3 service worker (no `window`/`document` there) — so a `background.ts`-owned connection isn't viable without extra infrastructure (e.g. an Offscreen Document) that's out of scope for this change.
- Both hooks share one underlying Pusher connection per page via a small ref-counted module (`lib/pusher-client.ts`), so the two hooks mounting together on `ProductivityPage` (Habit tracker and Kanban board are both always-mounted side-by-side panels, not separate tabs — see `ProductivityPage.tsx`) still only open one WebSocket connection per open `newtab` page, not two. Multiple simultaneously-open `newtab` pages still each get their own connection — that redundancy is accepted as a trade-off for shipping without new infrastructure.
- The shared client subscribes to the user's private channel (`private-user-{userId}`), authorizing via al-quotes' `POST /pusher/auth` using a custom authorizer that attaches the current access token and retries once after a refresh on a `401`/`403` — mirroring the refresh-on-401 pattern `lib/api.ts` already uses for REST calls.
- Each hook binds directly to its relevant Pusher events on the shared channel and merges them into its existing local state, idempotently (by id) so an event echoing back a change the same tab just made via its own REST call doesn't create a duplicate.
- Each hook also binds to the shared client's connection `state_change` event; on a transition into `connected` that isn't the first one (i.e. a reconnect), it calls its own `refresh()` to backfill anything missed while disconnected — push is additive on top of fetch, not a replacement for it.
- The shared client disconnects when the last hook releases it (component unmount, which — for these two call sites — only happens when `ProductivityPage` unmounts, i.e. on sign-out or tab close).

## Capabilities

### New Capabilities
- `realtime-connection`: the shared per-page Pusher connection lifecycle — channel authorization, event binding, and reconnect/backfill behavior.

### Modified Capabilities
- `kanban-tasks`: the board now also reflects Task changes that arrive via the realtime channel, not only changes made through its own create/edit/delete/drag actions.
- `habit-tracking`: the habit tracker now also reflects Habit changes that arrive via the realtime channel, not only changes made through its own UI actions.

## Impact

- New file `lib/pusher-client.ts`: a ref-counted module owning one Pusher client + private channel per signed-in user, shared by whichever hooks are currently mounted.
- `hooks/use-tasks.ts`, `hooks/use-habits.ts`: acquire the shared channel on mount (when `enabled`), bind to their relevant events, merge into local state idempotently, bind to connection `state_change` for reconnect-triggered `refresh()`, release on unmount.
- `entrypoints/background.ts`: **no longer touched by this change** (superseded the original plan to own the connection there).
- `remindeen/.env.local`: already has Pusher `key`/`cluster` (added during this exploration); needs `VITE_`-prefixed names so Vite exposes them to the extension bundle (e.g. `VITE_PUSHER_KEY`, `VITE_PUSHER_CLUSTER`), plus a `VITE_PUSHER_AUTH_ENDPOINT` pointing at al-quotes' `/pusher/auth`.
- New dependency: `pusher-js`.
- Depends on al-quotes' `add-realtime-task-habit-events` for the event contract and the `/pusher/auth` endpoint — this change has no effect until that one is deployed.

## Context

`remindeen` is a WXT-based MV3 browser extension. The Kanban board and habit tracker are rendered only on the `newtab` override (`components/remindeen/productivity/ProductivityPage.tsx`), as two always-mounted side-by-side panels (not separate tabs — both `HabitTracker` and `KanbanBoard` render together whenever the user is signed in). Every new tab the user opens is a fresh instance of this page. Data is owned per-mount: `hooks/use-tasks.ts` and `hooks/use-habits.ts` are plain hooks that `useState` + fetch via `apiFetch` on mount, with no shared store and no `browser.storage` involvement today.

The paired change in `al-quotes` (`add-realtime-task-habit-events`) publishes Pusher events on a private channel `private-user-{userId}` for every Task/Habit mutation, and exposes `POST /pusher/auth` to authorize subscribing to it. This change is the client side: get those events from Pusher into the open newtab UI.

**Revised after an implementation spike**: the original design centralized the Pusher connection in `entrypoints/background.ts` (the MV3 service worker), relaying events into `browser.storage` the same way `prayerTimesStorage` does. That doesn't work: `pusher-js`'s web build (`node_modules/pusher-js/dist/web/pusher.js`) runs `runtime.setup(Pusher)` at module-load time, which does `window.Pusher = PusherClass` unconditionally — no `typeof window` guard. A service worker has no `window` or `document`, so importing `pusher-js` into `background.ts` throws immediately. Moving the connection to an MV3 Offscreen Document (which has a real DOM) would fix this but is new infrastructure out of scope for this change. This design now subscribes directly from the `newtab` page context instead, where `window`/`document` are real.

## Goals / Non-Goals

**Goals:**
- Kanban board and habit tracker reflect Task/Habit changes from any source (this extension, another device, an MCP agent) without a manual refresh.
- Within one open `newtab` page, share a single Pusher connection between `useTasks` and `useHabits` rather than opening two for the same channel, since both hooks are always mounted together on `ProductivityPage`.
- A reconnect (network blip, laptop sleep/wake) always triggers a backfill refetch, so missed events don't stay missed.
- Reuse the extension's existing refresh-on-401 token philosophy for channel authorization, rather than inventing a new auth flow.

**Non-Goals:**
- One connection per user across all open tabs. Each open `newtab` page still opens its own connection (one per page, not one per hook) — de-duplicating across multiple simultaneously-open tabs for the same user would need a `background.ts`-owned connection, which `pusher-js` doesn't support without an Offscreen Document. Accepted as a trade-off for this iteration.
- Changing how mutations are made — `createTask`/`updateTask`/etc. still call `apiFetch` directly from the hook; this change only adds a second, push-driven input into the same local state.
- Cross-device presence indicators or any UI showing "who else is viewing this."
- Guaranteeing zero missed events under all conditions — best-effort delivery (already the server-side contract) plus a reconnect-triggered refetch is the accepted reconciliation strategy, not exactly-once delivery.

## Decisions

**1. The Pusher connection is owned by a small ref-counted module (`lib/pusher-client.ts`), acquired/released by each hook — not by `background.ts`.**
`pusher-js`'s web build cannot run in the MV3 service worker (see Context). Subscribing directly from each hook would otherwise open two connections per page (`useTasks` and `useHabits` both always mount on `ProductivityPage`); the shared module makes that one connection per page via reference counting: the first `acquire()` creates the client and subscribes, subsequent `acquire()` calls reuse it, and the client only disconnects once every caller has `release()`d.
- Alternative considered (original design): own the connection in `background.ts`, relay via `browser.storage`. Rejected after the implementation spike above — not viable without new infrastructure.
- Alternative considered: each hook independently creates its own `Pusher` instance. Rejected — needlessly doubles the connection (and channel-auth request) for every open tab, for no benefit, when the two hooks always mount together.
- Alternative considered: an MV3 Offscreen Document running `pusher-js` natively, bridged to `background.ts` via messaging. Rejected for this change — real DOM access would fix the root cause, but is a meaningfully larger change (new document lifecycle, new messaging surface) for a problem the ref-counted module already solves well enough at this scale.

**2. Each hook binds directly to Pusher events on the shared channel and merges them into its own local state — no `browser.storage` relay.**
Without a background owner, there's no cross-context relay to do: the hook holding the data is the same hook receiving the event. `useTasks` binds `task.*` events on the shared channel; `useHabits` binds `habit.*` events. Neither hook becomes a cache for the other's domain.

**3. Merging a relayed event into hook state is idempotent by id, to handle echoes of a tab's own writes.**
When a newtab tab itself calls `createTask`, it already appends the result optimistically; moments later, the same change arrives back as a `task.created` Pusher event (published by al-quotes after every write, regardless of origin). The merge logic for `created`/`updated` upserts by id (replace if present, append if not) rather than blindly appending, so the tab that caused the change doesn't see a duplicate card. `deleted` events remove by id, which is naturally idempotent.

**4. Channel authorization uses a custom `pusher-js` authorizer, not the static `headers` option, so it can refresh-and-retry on failure.**
`pusher-js`'s `channelAuthorization.customHandler` is used instead of static `headers`, calling `getStoredSession()` for the current access token, and on a `401`/`403` from `/pusher/auth`, calling `refreshStoredSession()` once and retrying — the same refresh-on-401 shape `lib/api.ts` already uses for REST calls, rather than a second, divergent auth strategy. This lives once in `lib/pusher-client.ts`, not duplicated per hook.

**5. Connect/disconnect is driven by each hook's own `enabled`/mount lifecycle, via acquire/release on the shared module.**
Both `KanbanBoard` and `HabitTracker` only render while `ProductivityPage` considers the user signed in (it swaps to `SignInPrompt` otherwise), so hook mount/unmount already tracks sign-in/sign-out for these call sites. Each hook calls `acquirePrivateChannel(userId)` when `enabled` and unmounting/`enabled` flips false calls `releasePrivateChannel()`; the shared module only actually disconnects once the reference count drops to zero.

**6. Reconnect detection is per-hook, via binding the shared client's `connection` `state_change` event.**
Each hook tracks whether it has already observed one `connected` state; on a later transition into `connected`, it calls its own `refresh()`. This piggybacks on the same shared client both hooks already have access to, with no separate signaling channel needed.

**7. Env vars need a `VITE_` prefix to reach the client bundle.**
The `key`/`cluster` values already added to `remindeen/.env.local` (bare names, left over from when `secret` was also briefly present there) aren't visible to client code under Vite's default `import.meta.env` exposure rules. They get renamed to `VITE_PUSHER_KEY` / `VITE_PUSHER_CLUSTER`, plus a new `VITE_PUSHER_AUTH_ENDPOINT` for the al-quotes `/pusher/auth` URL.

## Risks / Trade-offs

- [Risk] Multiple simultaneously-open `newtab` pages for the same user each open their own connection (one per page) → Mitigation: accepted for this iteration; revisit with a `background.ts`/Offscreen-Document-owned connection if connection count becomes a real cost at scale.
- [Risk] A burst of several events arriving close together could, in principle, have a UI re-render coalesce intermediate states → Mitigation: not a correctness concern here since each event is bound and handled individually by `pusher-js` (no relay/overwrite step like the rejected storage approach had); the reconnect-triggered `refresh()` remains the safety net for anything genuinely missed while disconnected.
- [Risk] `pusher-js` running inside a page that can be closed at any time (tab close) means the connection lifecycle is tied to page lifetime, not to "is the user still signed in elsewhere" → Mitigation: acceptable; this mirrors how the existing fetch-on-mount behavior already works today (no change in blast radius).
- [Risk] Moving `key`/`cluster` to `VITE_`-prefixed names changes what's already sitting in `.env.local` → Mitigation: trivial rename, no behavior depends on the old bare names today (nothing reads them yet).

## Migration Plan

- Additive: ships independently of any other extension behavior; until al-quotes' `add-realtime-task-habit-events` is deployed, the subscription simply receives no events (no error state to handle specially).
- No data migration. No schema changes (extension has none).
- Rollback: removing the Pusher acquire/release calls and event bindings from the two hooks, and deleting `lib/pusher-client.ts`, fully reverts to today's fetch-on-mount-only behavior.

## Open Questions

- None outstanding — `Comment` realtime sync is explicitly out of scope, matching the al-quotes side. `background.ts` centralization is deferred, not abandoned outright; revisit if multi-tab connection count proves costly.

## 1. Configuration

- [x] 1.1 Rename the bare `key`/`cluster` entries in `remindeen/.env.local` to `VITE_PUSHER_KEY` / `VITE_PUSHER_CLUSTER`; add `VITE_PUSHER_AUTH_ENDPOINT` pointing at al-quotes' `POST /pusher/auth`.
- [x] 1.2 Add `pusher-js` as a dependency.

## 2. Shared Pusher client (lib/pusher-client.ts)

- [x] 2.1 Create `lib/pusher-client.ts` with a ref-counted `acquirePrivateChannel(userId)` / `releasePrivateChannel()` pair: the first acquire creates a `Pusher` client (using `VITE_PUSHER_KEY`/`VITE_PUSHER_CLUSTER`) and subscribes to `private-user-{userId}`; subsequent acquires reuse it and bump a counter; release decrements the counter and disconnects once it reaches zero. Also export a way for callers to access the underlying `Pusher` client's `connection` (for binding `state_change`).
- [x] 2.2 Configure `channelAuthorization` with a `customHandler`: call `getStoredSession()` for the current access token, `POST` JSON to `VITE_PUSHER_AUTH_ENDPOINT` with it; on `401`/`403`, call `refreshStoredSession()` once and retry.

## 3. Hook integration (hooks/use-tasks.ts, hooks/use-habits.ts)

- [x] 3.1 In `use-tasks.ts`, acquire the shared channel when `enabled` (in a `useEffect`), bind `task.created`/`task.updated` (upsert by id into `tasks`) and `task.deleted` (remove by id); release and unbind on cleanup.
- [x] 3.2 In `use-habits.ts`, do the same for `habit.created`/`habit.updated` (upsert by id into `habits`), `habit.deleted` (remove by id, and its `checkInsByHabit` entry), and `habit.checkedIn` (merge into `checkInsByHabit` the same way the existing `checkIn` function does, deduped by `periodStart`).
- [x] 3.3 In both hooks, bind the shared client's `connection` `state_change` event; on a `connected` transition that isn't the first one observed by that hook instance, call `refresh()`.

## 4. Verification

- [x] 4.1 Manually verify: with the board open, create/update (status + drag-reorder)/delete a task via the al-quotes MCP tools or REST directly (not through the board's own UI) — confirm the board updates without a manual refresh.
- [x] 4.2 Manually verify: with the habit tracker open, create/update/delete a habit and check it in via MCP/REST directly — confirm the tracker updates without a manual refresh.
- [x] 4.3 Manually verify: creating/updating a task or habit through the extension's own form does not produce a duplicate card/entry once the echoed realtime event arrives.
- [x] 4.4 Manually verify: with one `newtab` page open (both panels mounted), confirm only one Pusher connection exists (Pusher debug console or a temporary log) — not two.
- [x] 4.5 Manually verify: sign out and confirm the Pusher connection disconnects.
- [x] 4.6 Manually verify: simulate a disconnect (e.g. toggle network) and reconnect — confirm the open page refetches once on reconnect.
- [x] 4.7 Run `npm run compile`.

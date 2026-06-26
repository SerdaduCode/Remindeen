## Context

`TaskFormModal` is a single compact form (max-w-380px): one `onSubmit` commits title/description/dates/priority via `PATCH /tasks/:id`. It renders the same for create and edit, distinguished by `initial !== null` (`isEdit`). `use-tasks.ts` shows the established pattern for a data hook: REST calls via `apiFetch`, local state updated from the response (no optimistic updates), plus a realtime subscription via the shared, refcounted Pusher connection (`acquirePrivateChannel`/`releasePrivateChannel` in `lib/pusher-client.ts`) that currently has exactly two consumers — the Kanban board hook and the habit tracker hook — both mounted for the lifetime of the productivity page.

Comments need a third, differently-shaped consumer of that same connection: one that mounts and unmounts every time a task's edit modal opens and closes, rather than living for the page's lifetime.

## Goals / Non-Goals

**Goals:**
- Add a comment thread to the task edit modal that loads on open, updates immediately on add/edit/delete, and reflects realtime events from other tabs/devices for the same task.
- Reuse existing patterns (`apiFetch`, refcounted Pusher connection, wait-then-update local state) rather than inventing new ones.

**Non-Goals:**
- No comment-count badge on `TaskCard` (decided out of scope).
- No optimistic UI for comment mutations — matches the existing task/habit pattern of waiting for the REST response before updating local state.
- No per-comment ownership UI (no "edit/delete only your own" distinction) — every comment on a task belongs to that task's single owner by construction.

## Decisions

**Comment section only renders when `isEdit` is true.**
A task must have an `id` before `/tasks/:id/comments` is addressable. For the create flow, the section is simply absent; it appears once the user re-opens the modal for an already-created task.

**Comments post immediately, independent of the modal's Save button.**
The mini-form (textarea + send) calls `addComment` directly on submit, which calls `POST /tasks/:id/comments` and appends the response to local state — it does not wait for or get bundled into the main form's `handleSubmit`. This matches how a comment thread behaves in comparable tools (Trello, Asana) and avoids the surprising case where typing a comment and then hitting "Cancel" on the main form would discard it.

**`useTaskComments(taskId)` mirrors `use-tasks.ts`'s shape**, scoped to one task instead of the user's whole task list:
- `refresh()`: `GET /tasks/:id/comments`, called on mount and on Pusher reconnect (matching the existing "reconnection triggers a backfill refetch" rule).
- `addComment(body)`, `editComment(id, body)`, `deleteComment(id)`: REST call, then update local list from the response (or remove by id for delete) — no optimistic insert.
- Realtime: binds `comment.created`/`comment.updated`/`comment.deleted` on the shared private channel; on each event, **first checks `payload.taskId === taskId`** (the channel carries comment events for all of the user's tasks) and ignores anything that doesn't match before applying an upsert/remove, the same idempotent-by-id merge `use-tasks.ts` uses for `task.*` events — so the hook's own action and the resulting echoed event don't double-apply.

**The hook acquires/releases the shared connection on mount/unmount of the modal**, not on a fixed page lifetime. `acquirePrivateChannel`/`releasePrivateChannel`'s refcounting already supports this — opening a third modal-scoped consumer on top of the two page-scoped ones is just a third caller incrementing/decrementing the same counter. No change needed to `pusher-client.ts` itself, only to the `realtime-connection` spec's wording (it currently names exactly two hooks).

## Risks / Trade-offs

- **[Risk]** A user with the modal open for task A receives comment events for task B (their other tasks) on every mutation elsewhere → **Mitigation**: cheap to filter and discard client-side; consistent with how `task.*`/`habit.*` events already work on this per-user channel; comment volume is low (single-user system).
- **[Risk]** If the al-quotes change (`publish-comment-realtime-events`) hasn't shipped yet, comments will work via REST but never update live from other tabs → **Mitigation**: not a regression (no realtime today either); the hook still does a fetch-on-open and a reconnect-refetch, so staleness is bounded by modal re-opens.
- **[Trade-off]** No optimistic UI means a slow network makes the comment box feel laggy on send → accepted, matches existing task/habit UX precedent in this codebase.

## Open Questions

- Exact translation keys/copy for the comment section (placeholder text, empty-state message, delete confirmation) — left for implementation, following the existing `kanban.form.*` naming convention in `app.config.ts`.

## Why

Al-Quotes already exposes full CRUD for task comments (`/tasks/:id/comments`), but the Kanban board has no UI for them. Users editing a task have no way to leave or review progress notes. A companion al-quotes change (`publish-comment-realtime-events`) adds `comment.created`/`comment.updated`/`comment.deleted` events on the existing private channel; this change adds the remindeen-side UI and hook to use both the REST endpoints and those events.

## What Changes

- Add a comment thread section to `TaskFormModal`, visible only in edit mode (a task must exist to have an id) — appended below the existing fields, above the Save/Cancel/Delete row.
- Comments post immediately via their own mini-form (textarea + send button), independent of the main form's Save button, which continues to commit only title/description/dates/priority.
- Add a `useTaskComments(taskId)` hook: fetches the thread via `GET /tasks/:id/comments` when the modal opens, exposes `addComment`/`editComment`/`deleteComment` (calling the REST endpoints directly, then updating local state from the response — same wait-then-update pattern as `use-tasks.ts`, no optimistic placeholders).
- The hook joins the existing shared, refcounted Pusher connection (`acquirePrivateChannel`/`releasePrivateChannel`) as a third consumer alongside the Kanban board and habit tracker hooks, binding `comment.created`/`comment.updated`/`comment.deleted` and filtering events to the currently-open task by `taskId`.
- No comment-count badge on `TaskCard` (explicitly out of scope) — comments are only visible once the edit modal is open.

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `kanban-tasks`: add a requirement for viewing/adding/editing/deleting comments on a task from the edit modal, including realtime updates.
- `realtime-connection`: the shared-connection requirement currently names two hooks (Kanban board, habit tracker); update it to describe a third, conditionally-mounted consumer (task comments) sharing the same refcounted connection.

## Impact

- `components/remindeen/kanban/TaskFormModal.tsx`: new comment thread section + mini-form, edit-mode only.
- `hooks/use-task-comments.ts`: new hook (fetch, mutate, realtime subscribe/filter, reconnect-refetch).
- `lib/api.ts`: no change needed — reuses existing `apiFetch`.
- `lib/pusher-client.ts`: no change needed — `acquirePrivateChannel`/`releasePrivateChannel` already support an arbitrary number of consumers via refcounting.
- `app.config.ts`: new translation strings for the comment section (label, placeholder, empty state, send button, edit/delete affordances).
- Depends on the al-quotes change `publish-comment-realtime-events` for the `comment.*` event names and payload shapes (notably `comment.deleted` carrying `taskId`). Should land after, or be tested against a deployed al-quotes that already publishes these events.

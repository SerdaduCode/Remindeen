## 1. Comments hook

- [x] 1.1 Create `hooks/use-task-comments.ts`: `refresh()` via `GET /tasks/:id/comments`, called on mount (when `taskId` is set) and on Pusher reconnect
- [x] 1.2 Add `addComment(body)`, `editComment(id, body)`, `deleteComment(id)` calling the REST endpoints via `apiFetch`, updating local state from the response (no optimistic insert)
- [x] 1.3 Acquire the shared Pusher connection (`acquirePrivateChannel`) when `taskId` is set, release (`releasePrivateChannel`) on unmount or when `taskId` becomes unset
- [x] 1.4 Bind `comment.created`/`comment.updated`/`comment.deleted`; ignore events where `payload.taskId !== taskId`; upsert/remove idempotently by comment id for matching events

## 2. Modal UI

- [x] 2.1 Add a comment thread section to `TaskFormModal.tsx`, rendered only when `isEdit` is true
- [x] 2.2 Render the comment list (body + timestamp) with inline edit/delete affordances per comment
- [x] 2.3 Add the comment mini-form (textarea + send button) with its own submit handler, independent of the main form's `handleSubmit` (implemented as a plain input + button, not a nested `<form>`, since the section lives inside the main task `<form>` and HTML forms cannot nest)
- [x] 2.4 Wire the section to `useTaskComments(initial?.id ?? null)` (via the `TaskComments` subcomponent, mounted only when `isEdit`)

## 3. Copy

- [x] 3.1 Add `kanban.form.comments_*` translation keys to `app.config.ts` (section label, empty state, placeholder, send, edit, delete, delete confirm) for `en`/`id`

## 4. Verification

- [x] 4.1 Manually verify add/edit/delete comment from the modal updates the thread immediately (verified by user)
- [x] 4.2 Manually verify a comment added in a second tab/session appears in the first tab's open modal for the same task without refresh (verified by user)
- [x] 4.3 Manually verify a comment event for a different task does not affect the currently open modal (verified by user)
- [x] 4.4 Manually verify closing the modal releases the shared connection's refcount without disconnecting the Kanban board/habit tracker (verified by user)

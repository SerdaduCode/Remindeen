## 1. Remove orbit feature

- [x] 1.1 Delete `components/remindeen/orbit/` (`OrbitView.tsx`, `OrbitNode.tsx`, `PriorityRing.tsx`, `orbit-physics.ts`, `orbit-layout.ts`, `orbit-clock.ts`, `TaskFormModal.tsx`, `ManageCategoriesModal.tsx`)
- [x] 1.2 Delete `hooks/use-orbit-tasks.ts` and `hooks/use-orbit-categories.ts`
- [x] 1.3 Remove `orbit.*` translation keys from `app.config.ts`
- [x] 1.4 Delete `openspec/specs/orbit-todo/` (superseded by this change's spec deltas once archived)
- [x] 1.5 Abandon the in-flight `openspec/changes/add-orbit-priority-ring-and-categories/` change directory (do not archive it; note in its `.openspec.yaml` or remove it, since it is superseded by this change)

## 2. Dependencies, env, and manifest

- [x] 2.1 Add `@supabase/supabase-js` and `@dnd-kit/core` + `@dnd-kit/sortable` to `package.json`
- [x] 2.2 Add `VITE_API_TASKS`, `VITE_API_HABITS`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` to `.env.local` (prod values)
- [x] 2.3 Create `.env.development` overriding `VITE_API_TASKS`/`VITE_API_HABITS` to `http://localhost:3000/tasks` and `/habits`
- [x] 2.4 Add `identity` permission and `host_permissions` (`https://quotes.serdadu.dev/*`, `http://localhost:3000/*`) to `wxt.config.ts`

## 3. Auth layer

- [x] 3.1 Create a Supabase client module (e.g. `lib/supabase.ts`) initialized from `VITE_SUPABASE_URL`/`VITE_SUPABASE_PUBLISHABLE_KEY`
- [x] 3.2 Add `local:authSession` to `storage.defineItem` (new module, e.g. `stores/auth.ts`, mirroring `stores/settings.ts`'s pattern)
- [x] 3.3 In `entrypoints/background.ts`, implement the Google sign-in flow: `chrome.identity.launchWebAuthFlow` → `supabase.auth.exchangeCodeForSession` → write session to `local:authSession`
- [x] 3.4 Implement sign-out: clear `local:authSession` from the background script (or any context, via a message to background if needed)
- [x] 3.5 Add a `use-auth.ts` hook that reads/watches `local:authSession`, exposing `session`, `isSignedIn`, `signIn`, `signOut` to components
- [x] 3.6 Implement on-demand token refresh: an authenticated fetch helper that catches `401`, requests a refresh via the stored `refresh_token`, retries once, and clears the session on a second failure (`refreshStoredSession` in `stores/auth.ts`, wired into the fetch helper in 4.1)

## 4. Authenticated API client

- [x] 4.1 Create a shared fetch helper (e.g. `lib/api.ts`) that attaches `Authorization: Bearer <token>` from `local:authSession` and applies the 401-refresh-retry logic from 3.6
- [x] 4.2 Implement `hooks/use-tasks.ts`: `listTasks`, `createTask`, `updateTask`, `updateTaskPosition`, `deleteTask` against `VITE_API_TASKS`
- [x] 4.3 Implement `hooks/use-habits.ts`: `listHabits`, `createHabit`, `updateHabit`, `deleteHabit`, `checkIn`, `listCheckIns` against `VITE_API_HABITS`
- [x] 4.4 Implement client-side streak computation (reusing Al-Quotes' UTC-day-start / ISO-week-start period boundaries) as a pure function consumed by the Habit tab (`lib/habit-streak.ts`)

## 5. Productivity page and navigation

- [x] 5.1 Create `components/remindeen/productivity/ProductivityPage.tsx` using `components/ui/tabs.tsx` with "Kanban" and "Habit" tabs
- [x] 5.2 Replace `<OrbitView />` with `<ProductivityPage />` as Page 2 in `entrypoints/newtab/App.tsx`, updating the `Pager` label from `pager.page_orbit` to a new `pager.page_productivity` translation key
- [x] 5.3 Implement a shared sign-in prompt component shown by both tabs when `isSignedIn` is false (gated at the `ProductivityPage` level, before either tab mounts)

## 6. Kanban tab

- [x] 6.1 Build the three-column board layout (`To Do` / `Doing` / `Done`) rendering tasks from `use-tasks`
- [x] 6.2 Build a task card component (title, priority badge, due date)
- [x] 6.3 Build a create/edit task form modal (title, description, startDate, dueDate, priority)
- [x] 6.4 Wire `@dnd-kit` for cross-column drag (updates status via `updateTask`) and within-column reorder (updates position via `updateTaskPosition` using neighbor `beforeId`/`afterId`)
- [x] 6.5 Wire delete with a confirmation step (matching the existing `window.confirm` pattern used elsewhere in this codebase)

## 7. Habit tab

- [x] 7.1 Build the habit list view rendering habits from `use-habits`, showing frequency and computed streak
- [x] 7.2 Build a create/edit habit form modal (title, description, priority, frequency)
- [x] 7.3 Wire the check-in action for the current period, reflecting completed-for-this-period state immediately
- [x] 7.4 Wire delete with a confirmation step

## 8. Translations

- [x] 8.1 Add `kanban.*` and `habit.*` translation keys (en/id) to `app.config.ts` for all new UI strings, replacing the removed `orbit.*` keys

## 9. Verification

- [x] 9.1 Run `al-quotes` locally (`npm run dev`, port 3000) and verify `wxt dev` can sign in, list, create, update, reorder, and delete tasks against it
- [x] 9.2 Verify the same flows against prod (`quotes.serdadu.dev`) by building with `.env.local` only
- [x] 9.3 Verify session persists across newtab/popup/sidepanel and sign-out propagates to all open contexts
- [x] 9.4 Verify on-demand token refresh by forcing/waiting for token expiry and confirming a retried request succeeds without forcing re-sign-in
- [x] 9.5 Verify the sign-in prompt is shown (and no `/tasks` or `/habits` request is made) when signed out
- [x] 9.6 Run lint/typecheck (`tsc --noEmit`) on all touched and newly added files — clean; `wxt build` (prod) and `wxt build --mode development` both verified to bake in the correct API host (`quotes.serdadu.dev` vs `localhost:3000` respectively)

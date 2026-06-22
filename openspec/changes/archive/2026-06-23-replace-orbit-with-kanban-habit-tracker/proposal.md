## Why

The orbit task-node feature is local-only, offline, and has no concept of due dates, comments, or recurring habits — it can't grow past a novelty to-do list. Al-Quotes (`quotes.serdadu.dev`) just shipped a production-ready `/tasks` (Kanban) and `/habits` API with Supabase Google OAuth, built specifically to back this extension. Rebuilding Remindeen's productivity page on top of that API turns it into a real, persistent, multi-device Kanban board and habit tracker instead of a local-storage curiosity.

## What Changes

- **BREAKING**: Remove the orbit task-node feature entirely — `components/remindeen/orbit/*`, `hooks/use-orbit-tasks.ts`, `hooks/use-orbit-categories.ts`, and all locally-stored orbit task/category data. Existing local orbit tasks are not migrated; they are lost when this ships.
- Replace newtab Page 2 with a new "Productivity" page containing two tabs (using the existing unused `Tabs` UI primitive): **Kanban** and **Habit**.
- New Kanban tab: create/edit/delete tasks (`title`, `description`, `startDate`, `dueDate`, `priority`), drag tasks between `To Do` / `Doing` / `Done` columns, drag-reorder within a column (backed by the API's fractional `position` field). Comments and status-history UI are explicitly out of scope for this change (fast-follow).
- New Habit tab: create/edit/delete habits (`title`, `description`, `priority`, `frequency: daily|weekly`), check in for the current period, see check-in history.
- New Supabase Google OAuth sign-in flow, implemented via `chrome.identity.launchWebAuthFlow` from the background service worker, with the resulting session relayed to all extension contexts (newtab, popup, sidepanel) through `storage.defineItem` + `.watch()` (the same pattern `stores/settings.ts` already uses). Signing in is required to use the Productivity page; the rest of the extension (Home page, prayer times, etc.) stays fully anonymous.
- New `host_permissions` for `https://quotes.serdadu.dev/*` and `http://localhost:3000/*`, and a new `identity` permission, added to `wxt.config.ts`.
- New env wiring: `VITE_API_TASKS` / `VITE_API_HABITS` (mirroring the existing `VITE_API_QUOTES` convention) and `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` in `.env.local` (prod defaults), with a new `.env.development` overriding the two API URLs to `http://localhost:3000` for local integration testing against a locally-run `al-quotes` server.
- The in-flight `add-orbit-priority-ring-and-categories` change (priority ring + category filtering on the orbit view) is superseded by this change and will not be completed or archived — its capability never made it into `openspec/specs/`, so no delta is needed to remove it, only to abandon the change directory itself.

## Capabilities

### New Capabilities
- `kanban-tasks`: Task CRUD, drag-and-drop between To Do/Doing/Done, manual ordering within a column, against Al-Quotes' `/tasks` API.
- `habit-tracking`: Habit CRUD (daily/weekly), check-in actions and history, against Al-Quotes' `/habits` API.
- `extension-auth`: Google sign-in via Supabase inside the WXT extension (background-owned session, cross-context relay, sign-out, gating the Productivity page on an authenticated session).

### Modified Capabilities
- `orbit-todo`: All requirements (create/edit/delete/focus/reposition/rotation/persistence of orbit task nodes) are removed — the capability is retired in this change.
- `newtab-page-navigation`: Page 2's content changes from "the orbit todo view" to "the Productivity view (Kanban/Habit tabs)"; the two-page structure, dot indicators, arrow controls, keyboard navigation, and slide transition all stay exactly as they are.

## Impact

- **Removed**: `components/remindeen/orbit/` (8 files), `hooks/use-orbit-tasks.ts`, `hooks/use-orbit-categories.ts`, `openspec/specs/orbit-todo/`.
- **New components/hooks**: a Kanban board view, a Habit tracker view, a shared "Productivity" page wrapping both in `Tabs`, an auth hook/store for the Supabase session, an authenticated fetch helper for `/tasks` and `/habits`.
- **New dependency**: `@supabase/supabase-js` (not currently in `package.json`). A drag-and-drop library is also needed for Kanban column reordering (none currently present).
- **Manifest** (`wxt.config.ts`): new `identity` permission, new `host_permissions` for the Al-Quotes domain and localhost.
- **Env files**: `.env.local` gets `VITE_API_TASKS`, `VITE_API_HABITS`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`; new `.env.development` overrides the two API URLs to localhost.
- **External dependency**: relies on Al-Quotes' already-implemented `add-kanban-habit-tracker` change (server-side complete; user-isolation verification still pending on the API side per its own `tasks.md`).
- **No backend changes**: this change is entirely within `remindeen`; Al-Quotes' API and schema are consumed as-is.

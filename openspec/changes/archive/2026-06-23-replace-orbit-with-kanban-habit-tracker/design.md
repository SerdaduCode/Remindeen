## Context

Remindeen is a WXT-based Manifest V3 browser extension (newtab/popup/sidepanel surfaces). Today it has zero network-authenticated features — every existing `VITE_API_*` call (`Verse.tsx`, `Background.tsx`, `Prayers.tsx`, `Time.tsx`) is an anonymous `fetch()` to a public endpoint, and all extension-context state (`stores/settings.ts`, the orbit hooks being removed) lives in `storage.defineItem` (WXT's `chrome.storage` wrapper), synced across contexts via `.watch()`.

Al-Quotes (same author, separate repo, deployed at `quotes.serdadu.dev`) just added `/tasks` and `/habits`: Express + Prisma routes scoped by `userId` extracted from a Supabase-issued Google OAuth JWT (`Authorization: Bearer`), verified against Supabase's JWKS endpoint. This is the first time Remindeen needs to (a) hold a real user session and (b) call an authenticated, write-capable API. Both are new architectural surface for this codebase.

The orbit feature being replaced is local-only and has no server counterpart — there is no data migration path, by design (confirmed: orbit data is discarded, not ported).

## Goals / Non-Goals

**Goals:**
- Replace the orbit page with a Kanban board and habit tracker backed by Al-Quotes' `/tasks` and `/habits`.
- Add a Supabase Google OAuth flow that works within MV3's constraints (non-persistent background service worker, newtab as a fresh document every load).
- Keep the existing two-page `Pager` structure unchanged; absorb Kanban+Habit as tabs inside Page 2.
- Support local API testing (`http://localhost:3000`) alongside the prod API, switchable without manifest changes.

**Non-Goals:**
- Comments and status-history UI (API supports them; deferred to a fast-follow change).
- Migrating existing local orbit task data — it is discarded.
- Offline-first caching for Kanban/Habit data (v1 is fetch-on-mount with a loading state; revisit if newtab latency proves annoying).
- A separate test database for local API testing — local and prod both hit the same Supabase Postgres; accepted as fine at current single-user scale.
- Building any change to the Al-Quotes API itself — it is consumed as-is.

## Decisions

### 1. Productivity page replaces orbit as Page 2; Kanban/Habit live as Tabs inside it
`Pager` (`components/remindeen/pager/Pager.tsx`) is hard-typed to exactly two pages (`[ReactNode, ReactNode]`, `activeIndex: 0 | 1`). Rather than generalizing it to N pages, the new "Productivity" component becomes the single Page 2, internally using the already-installed-but-unused `@radix-ui/react-tabs` (`components/ui/tabs.tsx`) to switch between Kanban and Habit.
- **Alternative considered**: extend `Pager` to support N pages (3: Home, Kanban, Habit). Rejected — touches swipe/keyboard/dot-indicator logic that works today for no real benefit, since Tabs already does exactly this job at one level down.

### 2. Auth session is owned by the background service worker, relayed via `storage`
`chrome.identity.launchWebAuthFlow()` must be initiated from a persistent extension context — `entrypoints/background.ts`. Newtab is a fresh document every open and cannot be the source of truth for a session. The background script performs the OAuth handshake, calls `supabase.auth.exchangeCodeForSession()`, and writes the resulting session to a new `storage.defineItem('local:authSession', ...)`. Every other context (newtab, popup, sidepanel) reads that item and `.watch()`es it — identical to how `stores/settings.ts` already syncs `theme`/`language` across contexts.
- **Alternative considered**: let each context (e.g. newtab) run its own `supabase-js` client and own OAuth flow independently. Rejected — `launchWebAuthFlow` from a newtab document is unreliable (the document can be torn down mid-flow by the user closing the tab), and it would mean N independent sessions instead of one shared one.

### 3. Token refresh is on-demand (refresh-on-401), not timer-based
`supabase-js`'s default `autoRefreshToken` behavior relies on a setInterval-style timer running continuously — which doesn't survive Manifest V3's non-persistent service worker being suspended by Chrome between events. Instead, the authenticated fetch helper catches a `401` response, attempts a refresh using the stored `refresh_token` via a one-off message to the background script, retries the original request once, and only forces re-sign-in if that refresh itself fails.
- **Alternative considered**: `chrome.alarms` to periodically wake the service worker and proactively refresh. Rejected for v1 — more moving parts (alarm permission already exists, but adds a recurring wake-up cost) for a problem that refresh-on-401 solves adequately at this usage pattern (a personal productivity tool opened a few times a day, not a high-frequency API consumer).

### 4. Kanban drag-and-drop uses `@dnd-kit` (new dependency)
No drag-and-drop library exists in `package.json` today. `@dnd-kit/core` + `@dnd-kit/sortable` is chosen over `react-beautiful-dnd` (unmaintained, React 19 incompatible) and `react-dnd` (heavier abstraction, no built-in sortable-list primitive). Drop events resolve to the API's `PATCH /tasks/:id/position` using `beforeId`/`afterId` of the two neighboring cards at the drop point — directly matching how the endpoint is already shaped (`tasks.js:106-138` in Al-Quotes).
- **Alternative considered**: compute a raw float `position` client-side instead of sending neighbor IDs. Rejected — the API already accepts `beforeId`/`afterId` and computes the midpoint server-side, so duplicating that math client-side adds a source of drift for no benefit.

### 5. Habit streaks are computed client-side from the sparse check-in log, not requested as a derived field
Al-Quotes' `GET /habits/:id/checkins` returns raw rows (`periodStart`, `completed`); it does not compute "current streak" server-side (an explicit open question in its own design doc). The Habit tab computes streak/missed-period display by walking expected periods backward from today and checking for a matching row, entirely client-side.
- **Alternative considered**: wait for Al-Quotes to add a streak-computing endpoint. Rejected — would block this change on backend work not yet scoped; client-side computation over a small per-habit row set is cheap and can be replaced later without a UI contract change.

### 6. Dual API base URL via `.env.development`, not a runtime toggle
`VITE_API_TASKS` / `VITE_API_HABITS` live in `.env.local` pointed at prod (`https://quotes.serdadu.dev`); a new `.env.development` overrides both to `http://localhost:3000` and is auto-loaded by Vite only when `wxt dev` runs. `wxt.config.ts` declares `host_permissions` for both origins unconditionally, so no manifest edit is needed when switching.
- **Alternative considered**: a manual in-`.env.local` toggle (comment/uncomment prod vs local URLs). Rejected per explicit preference — `.env.development` avoids the risk of accidentally shipping a localhost URL in a prod build.

## Risks / Trade-offs

- **[Risk]** The dev extension's ID (`chrome-extension://llgfddoneppijikabfnbeaojiecjampl`, currently hardcoded into Al-Quotes' `EXTENSION_ORIGIN` env var) is derived from the unpacked install path and has no `key` pinned in the manifest — it will change on a different machine or install location, silently breaking both CORS and the OAuth redirect URI registration. → **Mitigation**: tracked as a known follow-up (pin a `key` in `wxt.config.ts`'s manifest before any production extension-store submission); not blocking for local development by the same author on the same machine.
- **[Risk]** Local and prod API testing share one real Supabase Postgres — test data created locally is indistinguishable from "real" data. → **Mitigation**: accepted at current single-user scale; revisit if this becomes a multi-user or demo-data concern.
- **[Risk]** `chrome.identity.launchWebAuthFlow` + Supabase PKCE exchange is unproven for this exact extension (flagged as a spike in Al-Quotes' own design doc). → **Mitigation**: budget explicit verification time for the OAuth flow itself before building UI on top of it; if it fails, the fallback is Supabase's implicit-grant flow with manual token parsing from the redirect URL fragment.
- **[Risk]** Removing the orbit feature is destructive for any existing local orbit task data (no migration). → **Mitigation**: explicitly accepted in the proposal; not a code risk, a one-time user-facing data loss the owner has signed off on.
- **[Risk]** Client-computed habit streaks duplicate logic that may later move server-side, risking drift if Al-Quotes adds its own streak endpoint with different period-boundary rules. → **Mitigation**: reuse Al-Quotes' own `computePeriodStart` logic (UTC day start / ISO week start) for the client-side walk, so both sides agree on period boundaries even before any server-side streak endpoint exists.

## Migration Plan

- No backend/database migration — this change is frontend-only (`remindeen`).
- Deploy order: confirm Al-Quotes' `/tasks`/`/habits` are reachable (prod already is; local via `npm run dev` on port 3000) before merging the extension-side change, since the Productivity page has nothing to render against without it.
- Rollback: reverting this change restores the orbit feature's code from version control, but any data created via Kanban/Habit during the time this was live remains in Al-Quotes' database (server-side data, unaffected by an extension-side rollback).

## Open Questions

- Should the Productivity page show a loading skeleton or block entirely while the initial `/tasks`+`/habits` fetch resolves, given newtab is opened very frequently and latency is more noticeable here than in a normal web app?
- Should sign-out also clear cached Kanban/Habit data from `storage`, or leave it visible (stale) until the next successful fetch?
